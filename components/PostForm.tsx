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
  const utils = client.useContext();

  const { data: post, isLoading: postLoading } = client.posts.getById.useQuery(
    { id: postId! },
    { enabled: !!postId }
  );

  const { data: categories } = client.category.list.useQuery();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<CreatePost>({
    resolver: zodResolver(createPostSchema),
    defaultValues: post || {
      title: "",
      slug: "",
      content: "",
      excerpt: "",
      status: PostStatus.DRAFT,
      authorName: "",
      categoryIds: [],
    },
  });

  const createMutation = client.posts.create.mutate({
    title: input.title,
    content: input.content,
    slug: input.slug,
    is_published: input.is_published,
    categoryIds: input.categoryIds,
  })
  
  
  const updateMutation = client.posts.update.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      utils.posts.getById.invalidate({ id: postId! });
      addToast("Post updated successfully", "success");
      onSuccess();
    },
    onError: (error: any) => {
      addToast(error?.message || "Failed to update post", "error");
    },
  });
      addToast("Post updated successfully", "success");
      onSuccess();
    },
    onError: (error) => {
      addToast(error.message || "Failed to update post", "error");
    },
  });

  const onSubmit = (data: CreatePost) => {
    if (postId) {
      updateMutation.mutate({ id: postId, ...data });
    } else {
      createMutation.mutate(data);
    }
  };

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

  if (postLoading) {
    return <LoadingSpinner size="lg" />;
  }

  const selectedCategories = watch("categoryIds") || [];

  const toggleCategory = (categoryId: string) => {
    const current = selectedCategories;
    if (current.includes(categoryId)) {
      setValue(
        "categoryIds",
        current.filter((id) => id !== categoryId)
      );
    } else {
      setValue("categoryIds", [...current, categoryId]);
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

          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              {...register("slug")}
              placeholder="post-url-slug"
            />
            {errors.slug && (
              <p className="text-sm text-destructive">{errors.slug.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt</Label>
            <Textarea
              id="excerpt"
              {...register("excerpt")}
              placeholder="Brief description of the post"
              rows={3}
            />
            {errors.excerpt && (
              <p className="text-sm text-destructive">
                {errors.excerpt.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Content * (Markdown supported)</Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="Write your post content in markdown..."
              rows={15}
              className="font-mono"
            />
            {errors.content && (
              <p className="text-sm text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorName">Author Name</Label>
            <Input
              id="authorName"
              {...register("authorName")}
              placeholder="Enter author name"
            />
            {errors.authorName && (
              <p className="text-sm text-destructive">
                {errors.authorName.message}
              </p>
            )}
          </div>

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

          {categories && categories.length > 0 && (
            <div className="space-y-2">
              <Label>Categories</Label>
              <div className="flex flex-wrap gap-2 p-4 border rounded-lg">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    type="button"
                    variant={
                      selectedCategories.includes(category.id)
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => toggleCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          )}

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
