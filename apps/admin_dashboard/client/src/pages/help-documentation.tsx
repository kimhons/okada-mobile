import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookOpen, Plus, Edit, Trash2, Eye, EyeOff, ThumbsUp, ThumbsDown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function HelpDocumentation() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [publishedFilter, setPublishedFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const { data: docs, isLoading, refetch } = trpc.faqsAndHelpDocs.getAllHelpDocs.useQuery({
    category: categoryFilter || undefined,
    isPublished: publishedFilter ? publishedFilter === "published" : undefined,
    search: searchQuery || undefined,
  });

  const createDocMutation = trpc.faqsAndHelpDocs.createHelpDoc.useMutation();
  const updateDocMutation = trpc.faqsAndHelpDocs.updateHelpDoc.useMutation();
  const deleteDocMutation = trpc.faqsAndHelpDocs.deleteHelpDoc.useMutation();

  const handleCreate = () => {
    setTitle("");
    setSlug("");
    setContent("");
    setCategory("");
    setTags("");
    setIsPublished(true);
    setCreateDialogOpen(true);
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const confirmCreate = async () => {
    if (!title || !content) {
      toast.error("Title and content are required");
      return;
    }

    const finalSlug = slug || generateSlug(title);

    try {
      await createDocMutation.mutateAsync({
        title,
        slug: finalSlug,
        content,
        category: category || undefined,
        tags: tags || undefined,
        isPublished,
      });

      toast.success("Help article created successfully");
      setCreateDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to create help article");
    }
  };

  const handleEdit = (doc: any) => {
    setSelectedDoc(doc);
    setTitle(doc.title);
    setSlug(doc.slug);
    setContent(doc.content);
    setCategory(doc.category || "");
    setTags(doc.tags || "");
    setIsPublished(doc.isPublished);
    setEditDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!selectedDoc || !title || !content) {
      toast.error("Title and content are required");
      return;
    }

    try {
      await updateDocMutation.mutateAsync({
        id: selectedDoc.id,
        title,
        slug: slug || undefined,
        content,
        category: category || undefined,
        tags: tags || undefined,
        isPublished,
      });

      toast.success("Help article updated successfully");
      setEditDialogOpen(false);
      setSelectedDoc(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update help article");
    }
  };

  const handleDelete = (doc: any) => {
    setSelectedDoc(doc);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedDoc) return;

    try {
      await deleteDocMutation.mutateAsync({ id: selectedDoc.id });
      toast.success("Help article deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedDoc(null);
      refetch();
    } catch (error) {
      toast.error("Failed to delete help article");
    }
  };

  const handleTogglePublished = async (doc: any) => {
    try {
      await updateDocMutation.mutateAsync({
        id: doc.id,
        isPublished: !doc.isPublished,
      });
      toast.success(`Article ${doc.isPublished ? "unpublished" : "published"}`);
      refetch();
    } catch (error) {
      toast.error("Failed to update article");
    }
  };

  const clearFilters = () => {
    setCategoryFilter("");
    setPublishedFilter("");
    setSearchQuery("");
  };

  // Stats
  const totalDocs = docs?.length || 0;
  const publishedDocs = docs?.filter((d: { isPublished: boolean }) => d.isPublished).length || 0;
  const totalViews = docs?.reduce((sum: number, d: { views?: number }) => sum + (d.views || 0), 0) || 0;
  const avgHelpfulness = docs && docs.length > 0
    ? Math.round((docs.reduce((sum: number, d: { helpful?: number; notHelpful?: number }) => {
        const total = (d.helpful || 0) + (d.notHelpful || 0);
        return sum + (total > 0 ? (d.helpful || 0) / total : 0);
      }, 0) / docs.length) * 100)
    : 0;

  // Get unique categories
  const categories = Array.from(new Set(docs?.map((d: { category?: string }) => d.category).filter(Boolean))) as string[];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-blue-600" />
              Help Documentation
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage knowledge base articles and help content
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Article
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalDocs}</div>
              <p className="text-xs text-muted-foreground">All articles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedDocs}</div>
              <p className="text-xs text-muted-foreground">Visible to users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Helpfulness</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgHelpfulness}%</div>
              <p className="text-xs text-muted-foreground">Average rating</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat || ""}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={publishedFilter} onValueChange={setPublishedFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Articles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Help Articles</CardTitle>
            <CardDescription>
              {totalDocs} {totalDocs === 1 ? "article" : "articles"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading articles...
              </div>
            ) : docs && docs.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Helpful</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {docs.map((doc: { id: number; title: string; category?: string; tags?: string; isPublished: boolean; views?: number; helpful?: number; notHelpful?: number; updatedAt: Date }) => (
                      <TableRow key={doc.id}>
                        <TableCell className="font-medium max-w-md">
                          <div className="truncate">{doc.title}</div>
                        </TableCell>
                        <TableCell>
                          {doc.category ? (
                            <Badge variant="outline">{doc.category}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {doc.tags ? (
                            <div className="flex flex-wrap gap-1">
                              {doc.tags.split(",").slice(0, 2).map((tag: string, i: number) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                              {doc.tags.split(",").length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{doc.tags.split(",").length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {doc.isPublished ? (
                            <Badge variant="default">
                              <Eye className="h-3 w-3 mr-1" />
                              Published
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <EyeOff className="h-3 w-3 mr-1" />
                              Draft
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>{doc.views || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center text-green-600">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {doc.helpful || 0}
                            </span>
                            <span className="flex items-center text-red-600">
                              <ThumbsDown className="h-3 w-3 mr-1" />
                              {doc.notHelpful || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(doc.updatedAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePublished(doc)}
                            >
                              {doc.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(doc)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(doc)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No articles found. Create your first help article to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Article Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create Help Article</DialogTitle>
            <DialogDescription>
              Add a new article to the knowledge base
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Article title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!slug) {
                    setSlug(generateSlug(e.target.value));
                  }
                }}
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                placeholder="article-url-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Auto-generated from title. Used in article URL.
              </p>
            </div>
            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                placeholder="Write your article content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Getting Started"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="tag1, tag2, tag3"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isPublished">Publish immediately</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCreate}
              disabled={createDocMutation.isPending}
            >
              {createDocMutation.isPending ? "Creating..." : "Create Article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Article Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Edit Help Article</DialogTitle>
            <DialogDescription>
              Update the article content
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                placeholder="Article title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-slug">Slug *</Label>
              <Input
                id="edit-slug"
                placeholder="article-url-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-content">Content *</Label>
              <Textarea
                id="edit-content"
                placeholder="Write your article content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  placeholder="e.g., Getting Started"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-tags">Tags</Label>
                <Input
                  id="edit-tags"
                  placeholder="tag1, tag2, tag3"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="edit-isPublished">Published</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmEdit}
              disabled={updateDocMutation.isPending}
            >
              {updateDocMutation.isPending ? "Updating..." : "Update Article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Article Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this article? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteDocMutation.isPending}
            >
              {deleteDocMutation.isPending ? "Deleting..." : "Delete Article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

