import { useState } from "react";
import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Package, 
  DollarSign,
  Tag,
  StickyNote,
  Plus,
  X,
  Clock
} from "lucide-react";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-gray-100 text-gray-800",
  confirmed: "bg-blue-100 text-blue-800",
  rider_assigned: "bg-purple-100 text-purple-800",
  in_transit: "bg-indigo-100 text-indigo-800",
  quality_verification: "bg-yellow-100 text-yellow-800",
  waiting_approval: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  rejected: "bg-red-100 text-red-800",
};

const tagColors = [
  { name: "Gray", value: "#6B7280" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Yellow", value: "#EAB308" },
  { name: "Green", value: "#22C55E" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Pink", value: "#EC4899" },
];

export default function CustomerDetail() {
  const params = useParams<{ id: string }>();
  const customerId = parseInt(params.id || "0");
  
  const [newNote, setNewNote] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("#6B7280");
  const [isAddTagOpen, setIsAddTagOpen] = useState(false);
  const [isCreateTagOpen, setIsCreateTagOpen] = useState(false);

  const { data: customerData, isLoading, refetch: refetchCustomer } = trpc.customers.getById.useQuery(
    { id: customerId },
    { enabled: customerId > 0 }
  );

  const { data: orders, isLoading: ordersLoading } = trpc.customers.getOrders.useQuery(
    { customerId },
    { enabled: customerId > 0 }
  );

  const { data: notes, refetch: refetchNotes } = trpc.customers.getNotes.useQuery(
    { customerId },
    { enabled: customerId > 0 }
  );

  const { data: allTags } = trpc.customers.getTags.useQuery();

  const addNote = trpc.customers.addNote.useMutation({
    onSuccess: () => {
      toast.success("Note added successfully");
      setNewNote("");
      refetchNotes();
    },
    onError: (error) => {
      toast.error(`Failed to add note: ${error.message}`);
    },
  });

  const createTag = trpc.customers.createTag.useMutation({
    onSuccess: () => {
      toast.success("Tag created successfully");
      setNewTagName("");
      setNewTagColor("#6B7280");
      setIsCreateTagOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to create tag: ${error.message}`);
    },
  });

  const assignTag = trpc.customers.assignTag.useMutation({
    onSuccess: () => {
      toast.success("Tag assigned successfully");
      setIsAddTagOpen(false);
      refetchCustomer();
    },
    onError: (error) => {
      toast.error(`Failed to assign tag: ${error.message}`);
    },
  });

  const removeTag = trpc.customers.removeTag.useMutation({
    onSuccess: () => {
      toast.success("Tag removed successfully");
      refetchCustomer();
    },
    onError: (error) => {
      toast.error(`Failed to remove tag: ${error.message}`);
    },
  });

  const formatCurrency = (amount: number) => {
    return `${(amount / 100).toLocaleString()} FCFA`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (date: Date | string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading customer details...</div>
      </div>
    );
  }

  if (!customerData?.customer) {
    return (
      <div className="space-y-6">
        <Link href="/users">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Customer not found
          </CardContent>
        </Card>
      </div>
    );
  }

  const { customer, stats, tags } = customerData;

  // Get available tags (not already assigned)
  const availableTags = allTags?.filter(
    (tag) => !tags?.some((t) => t.tagId === tag.id)
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/users">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Customer Details</h1>
            <p className="text-muted-foreground mt-1">
              View and manage customer information
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Info Card */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-10 w-10 text-primary" />
              </div>
            </div>
            
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold">{customer.name || "Unknown"}</h2>
              <p className="text-sm text-muted-foreground">Customer #{customer.id}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email || "No email"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone || "No phone"}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Joined {formatDate(customer.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Last active {formatDate(customer.lastSignedIn)}</span>
              </div>
            </div>

            {/* Tags Section */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </span>
                <Dialog open={isAddTagOpen} onOpenChange={setIsAddTagOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Tag</DialogTitle>
                      <DialogDescription>
                        Select a tag to add to this customer
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      {availableTags.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {availableTags.map((tag) => (
                            <Badge
                              key={tag.id}
                              className="cursor-pointer hover:opacity-80"
                              style={{ backgroundColor: tag.color, color: "white" }}
                              onClick={() => assignTag.mutate({ customerId, tagId: tag.id })}
                            >
                              {tag.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No available tags</p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsAddTagOpen(false);
                          setIsCreateTagOpen(true);
                        }}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Tag
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex flex-wrap gap-2">
                {tags && tags.length > 0 ? (
                  tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      className="flex items-center gap-1"
                      style={{ backgroundColor: tag.tagColor, color: "white" }}
                    >
                      {tag.tagName}
                      <X
                        className="h-3 w-3 cursor-pointer hover:opacity-70"
                        onClick={() => removeTag.mutate({ customerId, tagId: tag.tagId })}
                      />
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-muted-foreground">No tags assigned</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats and Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalOrders || 0}</p>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(stats?.totalSpent || 0)}</p>
                    <p className="text-sm text-muted-foreground">Total Spent</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <DollarSign className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{formatCurrency(stats?.avgOrderValue || 0)}</p>
                    <p className="text-sm text-muted-foreground">Avg Order Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for Orders and Notes */}
          <Tabs defaultValue="orders">
            <TabsList>
              <TabsTrigger value="orders">Order History</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Order History</CardTitle>
                  <CardDescription>
                    {orders?.length || 0} orders found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Loading orders...
                    </div>
                  ) : orders && orders.length > 0 ? (
                    <div className="space-y-3">
                      {orders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{order.orderNumber}</p>
                                <Badge className={statusColors[order.status] || "bg-gray-100"}>
                                  {order.status.replace(/_/g, " ")}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {formatDateTime(order.createdAt)}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">{formatCurrency(order.total)}</p>
                            <p className="text-xs text-muted-foreground">
                              {order.paymentMethod.replace(/_/g, " ")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No orders found
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <StickyNote className="h-5 w-5" />
                    Customer Notes
                  </CardTitle>
                  <CardDescription>
                    Add notes about this customer for your team
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Add Note Form */}
                  <div className="space-y-2">
                    <Textarea
                      placeholder="Add a note about this customer..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={() => addNote.mutate({ customerId, note: newNote })}
                      disabled={!newNote.trim() || addNote.isPending}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>

                  {/* Notes List */}
                  <div className="space-y-3 pt-4 border-t">
                    {notes && notes.length > 0 ? (
                      notes.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 rounded-lg bg-accent/30 border border-border"
                        >
                          <p className="text-sm">{note.note}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Added {formatDateTime(note.createdAt)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No notes yet
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Create Tag Dialog */}
      <Dialog open={isCreateTagOpen} onOpenChange={setIsCreateTagOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>
              Create a new tag to categorize customers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Tag Name</label>
              <Input
                placeholder="e.g., VIP, Frequent Buyer"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <Select value={newTagColor} onValueChange={setNewTagColor}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {tagColors.map((color) => (
                    <SelectItem key={color.value} value={color.value}>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Preview:</span>
              <Badge style={{ backgroundColor: newTagColor, color: "white" }}>
                {newTagName || "Tag Name"}
              </Badge>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateTagOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => createTag.mutate({ name: newTagName, color: newTagColor })}
              disabled={!newTagName.trim() || createTag.isPending}
            >
              Create Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
