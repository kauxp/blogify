"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { client } from "@/lib/trpc";
import { useStore } from "../store/useStore";
import { createCategorySchema } from "@/types";
import type { CreateCategory } from "@/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { LoadingSpinner } from "./LoadingSpinner";
import { X } from "lucide-react";

interface CategoryFormProps {
  categoryId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function CategoryForm({ categoryId, onClose, onSuccess }: CategoryFormProps) {
  const { addToast } = useStore();
  const utils = client.useContext();

  const { data: category, isLoading: categoryLoading } = client.categories.getById.useQuery(
    { id: categoryId! },
    { enabled: !!categoryId }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreateCategory>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: category || {
      name: "",
      slug: "",
    },
  });

  const createMutation = client.categories.create.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      addToast("Category created successfully", "success");
      onSuccess();
    },
    onError: (error) => {
      addToast(error.message || "Failed to create category", "error");
    },
  });

  const updateMutation = client.categories.update.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      utils.categories.getById.invalidate({ id: categoryId! });
      addToast("Category updated successfully", "success");
      onSuccess();
    },
    onError: (error) => {
      addToast(error.message || "Failed to update category", "error");
    },
  });

  const onSubmit = (data: CreateCategory) => {
    if (categoryId) {
      updateMutation.mutate({ id: categoryId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

  const generateSlug = () => {
    const name = watch("name");
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  };

  if (categoryLoading) {
    return <LoadingSpinner size="lg" />;
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{categoryId ? "Edit Category" : "Create New Category"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter category name"
              onBlur={generateSlug}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="category-url-slug"
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {categoryId ? "Updating..." : "Creating..."}
                </>
              ) : (
                categoryId ? "Update Category" : "Create Category"
              )}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}