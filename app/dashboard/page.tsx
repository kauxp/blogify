"use client";

import { useState } from "react";
import { client } from "../../lib/trpc";
import { useStore } from "../../store/useStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Eye, FileText, FolderOpen } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { PostForm } from "@/components/PostForm";
import { CategoryForm } from "@/components/CategoryForm";

export default function DashboardPage() {
  const [showPostForm, setShowPostForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [deletePostId, setDeletePostId] = useState<number | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<number | null>(null);

  const { addToast } = useStore();
  const utils = client.useUtils();

  const { data: posts, isLoading: postsLoading } = client.posts.list.useQuery();
  const { data: categories, isLoading: categoriesLoading } = client.categories.list.useQuery();

  const deletePostMutation = client.posts.delete.useMutation({
    onSuccess: () => {
      utils.posts.list.invalidate();
      addToast({ message: "Post deleted successfully", type: "success" });
      setDeletePostId(null);
    },
    onError: (error) => {
      addToast({ message: error.message || "Failed to delete post", type: "error" });
    },
  });

  const deleteCategoryMutation = client.categories.delete.useMutation({
    onSuccess: () => {
      utils.categories.list.invalidate();
      addToast({ message: "Category deleted successfully", type: "success" });
      setDeleteCategoryId(null);
    },
    onError: (error) => {
      addToast({ message: error.message || "Failed to delete category", type: "error" });
    },
  });

  const handleEditPost = (id: number) => {
    setEditingPostId(id);
    setShowPostForm(true);
  };

  const handleEditCategory = (id: number) => {
    setEditingCategoryId(id);
    setShowCategoryForm(true);
  };

  const handleClosePostForm = () => {
    setShowPostForm(false);
    setEditingPostId(null);
  };

  const handleCloseCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategoryId(null);
  };

  if (postsLoading || categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (showPostForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <PostForm
          postId={editingPostId ? String(editingPostId) : undefined}
          onClose={handleClosePostForm}
          onSuccess={handleClosePostForm}
        />
      </div>
    );
  }

  if (showCategoryForm) {
    return (
      <div className="container mx-auto px-4 py-8">
        <CategoryForm
          categoryId={editingCategoryId ? String(editingCategoryId) : undefined}
          onClose={handleCloseCategoryForm}
          onSuccess={handleCloseCategoryForm}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Manage your blog posts and categories</p>
      </div>

      {/* Posts Section */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Blog Posts
            </CardTitle>
            <Button onClick={() => setShowPostForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {posts && posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{post.title}</h3>
                      <Badge variant={post.is_published ? "default" : "secondary"}>
                        {post.is_published ? "PUBLISHED" : "DRAFT"}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                      <span>{formatDate(post.updated_at || post.created_at || new Date())}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {post.is_published && (
                      <Link href={`/blog/${post.slug}`}>
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditPost(post.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletePostId(post.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No posts yet. Create your first post to get started!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Categories Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5" />
              Categories
            </CardTitle>
            <Button onClick={() => setShowCategoryForm(true)} variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              New Category
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {categories && categories.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <h4 className="font-medium">{category.name}</h4>
                    <p className="text-sm text-muted-foreground">{category.slug}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCategory(category.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteCategoryId(category.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No categories yet. Create categories to organize your posts!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Delete Post Dialog */}
      <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePostId && deletePostMutation.mutate({ id: deletePostId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Dialog */}
      <AlertDialog open={!!deleteCategoryId} onOpenChange={() => setDeleteCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteCategoryId && deleteCategoryMutation.mutate({ id: deleteCategoryId })}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}