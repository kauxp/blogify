"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { client } from "../lib/trpc";
import { useStore } from "../store/useStore";
import { createPostSchema, PostStatus } from "@/types";
import type { CreatePost } from "@/types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { LoadingSpinner } from "./LoadingSpinner";
import { X } from "lucide-react";

interface PostFormProps {
  postId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function PostForm({ postId, onClose, onSuccess }: PostFormProps) {
  const { addToast } = useStore();
  const utils = client.useUtils();

  // Fetch post if editing
  const { data: post, isLoading: postLoading } = client.posts.getById.useQuery(
    { id: Number(postId) },
    { enabled: !!postId }
  );

  // Fetch categories
  const { data: categories } = client.categories.list.useQuery();

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreatePost>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: post?.title || "",
      slug: post?.slug || "",
      content: post?.content || "",
      excerpt: "",
      status: (post?.is_published
        ? PostStatus.PUBLISHED
        : PostStatus.DRAFT) as "DRAFT" | "PUBLISHED",
      authorName: "",
      categoryIds: [], // will store as string[]
    },
  });

  // Mutations
  const createMutation = client.posts.create.useMutation({
    onSuccess: () => {
      console.log("Submitting data:", createMutation.variables);

      utils.posts.list.invalidate();
      addToast({ message: "Post created successfully", type: "success" });
      onSuccess();
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      addToast({
        message: error?.message || "Failed to create post",
        type: "error",
      });
    },
  });

  const updateMutation = client.posts.update.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      utils.posts.getById.invalidate({ id: Number(postId!) });
      addToast({ message: "Post updated successfully", type: "success" });
      onSuccess();
    },
    onError: (error: any) => {
      addToast({
        message: error?.message || "Failed to update post",
        type: "error",
      });
    },
  });

  // Submit handler
  const onSubmit = (data: CreatePost) => {
    const submitData = {
      ...data,
      // convert categoryIds to numbers for backend
      categoryIds: data.categoryIds.map((id) => Number(id)),
    };

    if (postId) {
      updateMutation.mutate({ id: Number(postId), ...submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  // Auto-generate slug
  const generateSlug = () => {
    const title = watch("title");
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  };

  if (postLoading) return <LoadingSpinner size="lg" />;

  // Category handling
  const selectedCategories = watch("categoryIds") || [];

  const toggleCategory = (categoryId: number) => {
    const idStr = String(categoryId); // keep as string inside form
    const current = selectedCategories;

    if (current.includes(idStr)) {
      setValue(
        "categoryIds",
        current.filter((id) => id !== idStr)
      );
    } else {
      setValue("categoryIds", [...current, idStr]);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{postId ? "Edit Post" : "Create New Post"}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Enter post title"
              onBlur={generateSlug}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" {...register("slug")} placeholder="post-url-slug" />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          {/* Excerpt */}
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              {...register("excerpt")}
              placeholder="Brief description of the post"
              rows={3}
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="Write your post content..."
              rows={15}
              className="font-mono"
            />
            {errors.content && (
              <p className="text-sm text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Author Name */}
          <div className="space-y-2">
            <Label htmlFor="authorName">Author Name</Label>
            <Input
              id="authorName"
              {...register("authorName")}
              placeholder="Enter author name"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={watch("status")}
              onValueChange={(value) =>
                setValue("status", value as "DRAFT" | "PUBLISHED")
              }
            >
              <SelectTrigger id="status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={PostStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={PostStatus.PUBLISHED}>Published</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categories */}
          {categories && categories.length > 0 && (
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 p-4 border rounded-lg">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(
                    String(category.id)
                  );
                  return (
                    <Button
                      key={category.id}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Submit + Cancel */}
          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  {postId ? "Updating..." : "Creating..."}
                </>
              ) : postId ? (
                "Update Post"
              ) : (
                "Create Post"
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
