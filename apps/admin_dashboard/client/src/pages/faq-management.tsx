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
import { HelpCircle, Plus, Edit, Trash2, Eye, EyeOff, ThumbsUp, ThumbsDown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function FAQManagement() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedFaq, setSelectedFaq] = useState<any>(null);
  
  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [publishedFilter, setPublishedFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  const [order, setOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(true);

  const { data: faqs, isLoading, refetch } = trpc.faqsAndHelpDocs.getAllFaqs.useQuery({
    category: categoryFilter || undefined,
    isPublished: publishedFilter ? publishedFilter === "published" : undefined,
    search: searchQuery || undefined,
  });

  const createFaqMutation = trpc.faqsAndHelpDocs.createFaq.useMutation();
  const updateFaqMutation = trpc.faqsAndHelpDocs.updateFaq.useMutation();
  const deleteFaqMutation = trpc.faqsAndHelpDocs.deleteFaq.useMutation();

  const handleCreate = () => {
    setQuestion("");
    setAnswer("");
    setCategory("");
    setOrder(0);
    setIsPublished(true);
    setCreateDialogOpen(true);
  };

  const confirmCreate = async () => {
    if (!question || !answer) {
      toast.error("Question and answer are required");
      return;
    }

    try {
      await createFaqMutation.mutateAsync({
        question,
        answer,
        category: category || undefined,
        order,
        isPublished,
      });

      toast.success("FAQ created successfully");
      setCreateDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to create FAQ");
    }
  };

  const handleEdit = (faq: any) => {
    setSelectedFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category || "");
    setOrder(faq.order || 0);
    setIsPublished(faq.isPublished);
    setEditDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!selectedFaq || !question || !answer) {
      toast.error("Question and answer are required");
      return;
    }

    try {
      await updateFaqMutation.mutateAsync({
        id: selectedFaq.id,
        question,
        answer,
        category: category || undefined,
        order,
        isPublished,
      });

      toast.success("FAQ updated successfully");
      setEditDialogOpen(false);
      setSelectedFaq(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update FAQ");
    }
  };

  const handleDelete = (faq: any) => {
    setSelectedFaq(faq);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFaq) return;

    try {
      await deleteFaqMutation.mutateAsync({ id: selectedFaq.id });
      toast.success("FAQ deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedFaq(null);
      refetch();
    } catch (error) {
      toast.error("Failed to delete FAQ");
    }
  };

  const handleTogglePublished = async (faq: any) => {
    try {
      await updateFaqMutation.mutateAsync({
        id: faq.id,
        isPublished: !faq.isPublished,
      });
      toast.success(`FAQ ${faq.isPublished ? "unpublished" : "published"}`);
      refetch();
    } catch (error) {
      toast.error("Failed to update FAQ");
    }
  };

  const clearFilters = () => {
    setCategoryFilter("");
    setPublishedFilter("");
    setSearchQuery("");
  };

  // Stats
  const totalFaqs = faqs?.length || 0;
  const publishedFaqs = faqs?.filter((f: { isPublished: boolean }) => f.isPublished).length || 0;
  const totalViews = faqs?.reduce((sum: number, f: { views?: number }) => sum + (f.views || 0), 0) || 0;
  const avgHelpfulness = faqs && faqs.length > 0
    ? Math.round((faqs.reduce((sum: number, f: { helpful?: number; notHelpful?: number }) => {
        const total = (f.helpful || 0) + (f.notHelpful || 0);
        return sum + (total > 0 ? (f.helpful || 0) / total : 0);
      }, 0) / faqs.length) * 100)
    : 0;

  // Get unique categories
  const categories = Array.from(new Set(faqs?.map((f: { category?: string }) => f.category).filter(Boolean))) as string[];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <HelpCircle className="h-8 w-8 text-blue-600" />
              FAQ Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage frequently asked questions
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create FAQ
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total FAQs</CardTitle>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFaqs}</div>
              <p className="text-xs text-muted-foreground">All questions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Published</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedFaqs}</div>
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
                  placeholder="Search questions..."
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

        {/* FAQs Table */}
        <Card>
          <CardHeader>
            <CardTitle>FAQs</CardTitle>
            <CardDescription>
              {totalFaqs} {totalFaqs === 1 ? "question" : "questions"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading FAQs...
              </div>
            ) : faqs && faqs.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Question</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Helpful</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {faqs.map((faq: { id: number; question: string; category?: string; isPublished: boolean; views?: number; helpful?: number; notHelpful?: number; updatedAt: Date }) => (
                      <TableRow key={faq.id}>
                        <TableCell className="font-medium max-w-md">
                          <div className="truncate">{faq.question}</div>
                        </TableCell>
                        <TableCell>
                          {faq.category ? (
                            <Badge variant="outline">{faq.category}</Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {faq.isPublished ? (
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
                        <TableCell>{faq.views || 0}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center text-green-600">
                              <ThumbsUp className="h-3 w-3 mr-1" />
                              {faq.helpful || 0}
                            </span>
                            <span className="flex items-center text-red-600">
                              <ThumbsDown className="h-3 w-3 mr-1" />
                              {faq.notHelpful || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(faq.updatedAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePublished(faq)}
                            >
                              {faq.isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(faq)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(faq)}
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
                No FAQs found. Create your first FAQ to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create FAQ Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create FAQ</DialogTitle>
            <DialogDescription>
              Add a new frequently asked question
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                placeholder="What is your question?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="answer">Answer *</Label>
              <Textarea
                id="answer"
                placeholder="Provide a detailed answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={5}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="e.g., Orders, Payments"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
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
              disabled={createFaqMutation.isPending}
            >
              {createFaqMutation.isPending ? "Creating..." : "Create FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit FAQ Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit FAQ</DialogTitle>
            <DialogDescription>
              Update the frequently asked question
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-question">Question *</Label>
              <Input
                id="edit-question"
                placeholder="What is your question?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-answer">Answer *</Label>
              <Textarea
                id="edit-answer"
                placeholder="Provide a detailed answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={5}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="edit-category">Category</Label>
                <Input
                  id="edit-category"
                  placeholder="e.g., Orders, Payments"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="edit-order">Display Order</Label>
                <Input
                  id="edit-order"
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(parseInt(e.target.value) || 0)}
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
              disabled={updateFaqMutation.isPending}
            >
              {updateFaqMutation.isPending ? "Updating..." : "Update FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete FAQ Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete FAQ</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
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
              disabled={deleteFaqMutation.isPending}
            >
              {deleteFaqMutation.isPending ? "Deleting..." : "Delete FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

