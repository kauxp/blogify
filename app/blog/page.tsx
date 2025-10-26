"use client";

import { trpc } from "../../lib/trpc";
import { useStore } from "../../store/useStore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import Link from "next/link";
import { formatDate, truncateText } from "@/lib/utils";
import { Calendar, User } from "lucide-react";

export default function BlogPage() {
  const { selectedCategoryId, setSelectedCategoryId } = useStore();

  const { data: categories, isLoading: categoriesLoading } = trpc.category.list.useQuery();
  
  const { data: posts, isLoading: postsLoading, error } = trpc.posts.list.useQuery({
    status: "PUBLISHED",
    categoryId: selectedCategoryId || undefined,
  });

  if (postsLoading || categoriesLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <ErrorMessage message={error.message || "Failed to load blog posts"} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">Blog Posts</h1>
        <p className="text-muted-foreground text-lg">
          Discover our latest articles and insights
        </p>
      </div>

      {/* Category Filter */}
      {categories && categories.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-medium mb-3 text-muted-foreground">Filter by Category</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategoryId === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategoryId(null)}
            >
              All Posts
            </Button>
            {categories.map((category: { id: number; name: string }) => (
              <Button
                key={category.id}
                variant={selectedCategoryId === category.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategoryId(category.id)}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Posts Grid */}
      {posts && posts.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {post.categories?.map((category) => (
                      <Badge key={category.id} variant="secondary">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.excerpt || truncateText(post.content, 150)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {post.authorName && (
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{post.authorName}</span>
                      </div>
                    )}
                    {post.publishedAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(post.publishedAt)}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {selectedCategoryId ? "No posts found in this category" : "No posts published yet"}
          </p>
        </div>
      )}
    </div>
  );
}