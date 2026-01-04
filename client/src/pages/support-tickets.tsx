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
import { Ticket, MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function SupportTickets() {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [replyMessage, setReplyMessage] = useState("");

  const { data: tickets, isLoading, refetch } = trpc.support.getAllTickets.useQuery();
  const updateTicketMutation = trpc.support.updateStatus.useMutation();
  const addMessageMutation = trpc.support.addMessage.useMutation();

  const handleView = async (ticket: any) => {
    setSelectedTicket(ticket);
    setViewDialogOpen(true);
  };

  const handleUpdate = (ticket: any) => {
    setSelectedTicket(ticket);
    setStatus(ticket.status);
    setPriority(ticket.priority);
    setReplyMessage("");
    setUpdateDialogOpen(true);
  };

  const confirmUpdate = async () => {
    if (!selectedTicket) return;

    try {
      await updateTicketMutation.mutateAsync({
        id: selectedTicket.id,
        status: status as "open" | "in_progress" | "resolved" | "closed",
      });

      // Add reply message if provided
      if (replyMessage.trim()) {
        await addMessageMutation.mutateAsync({
          ticketId: selectedTicket.id,
          userId: 0,
          message: replyMessage,
          isStaff: true,
        });
      }

      toast.success("Ticket updated successfully");
      setUpdateDialogOpen(false);
      setSelectedTicket(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update ticket");
    }
  };

  const clearFilters = () => {
    setStatusFilter("");
    setPriorityFilter("");
    setCategoryFilter("");
    setSearchQuery("");
  };

  // Filter tickets
  const filteredTickets = tickets?.filter(ticket => {
    if (statusFilter && ticket.status !== statusFilter) return false;
    if (priorityFilter && ticket.priority !== priorityFilter) return false;
    if (categoryFilter && ticket.category !== categoryFilter) return false;
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      return (
        ticket.ticketNumber.toLowerCase().includes(search) ||
        ticket.subject.toLowerCase().includes(search) ||
        ticket.description.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Stats
  const totalTickets = tickets?.length || 0;
  const openTickets = tickets?.filter(t => t.status === "open").length || 0;
  const inProgressTickets = tickets?.filter(t => t.status === "in_progress").length || 0;
  const resolvedTickets = tickets?.filter(t => t.status === "resolved" || t.status === "closed").length || 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="default"><AlertCircle className="h-3 w-3 mr-1" />Open</Badge>;
      case "in_progress":
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case "resolved":
        return <Badge variant="outline" className="bg-green-50"><CheckCircle2 className="h-3 w-3 mr-1" />Resolved</Badge>;
      case "closed":
        return <Badge variant="outline"><XCircle className="h-3 w-3 mr-1" />Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge variant="destructive" className="bg-orange-600">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Ticket className="h-8 w-8 text-blue-600" />
              Support Tickets
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage customer support requests and inquiries
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTickets}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openTickets}</div>
              <p className="text-xs text-muted-foreground">Awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTickets}</div>
              <p className="text-xs text-muted-foreground">Being handled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolvedTickets}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    <SelectItem value="order">Order</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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

        {/* Tickets Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets</CardTitle>
            <CardDescription>
              {filteredTickets?.length || 0} {filteredTickets?.length === 1 ? "ticket" : "tickets"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading tickets...
              </div>
            ) : filteredTickets && filteredTickets.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket #</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono">
                          {ticket.ticketNumber}
                        </TableCell>
                        <TableCell className="font-medium max-w-md">
                          <div className="truncate">{ticket.subject}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ticket.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {getPriorityBadge(ticket.priority)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(ticket.status)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(ticket.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(ticket)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleUpdate(ticket)}
                            >
                              Update
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
                No tickets found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Ticket Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>
              Ticket #{selectedTicket?.ticketNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTicket.status)}</div>
                </div>
                <div>
                  <Label>Priority</Label>
                  <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
                <div>
                  <Label>Category</Label>
                  <div className="mt-1">
                    <Badge variant="outline">{selectedTicket.category}</Badge>
                  </div>
                </div>
                <div>
                  <Label>Created</Label>
                  <div className="mt-1 text-sm">
                    {format(new Date(selectedTicket.createdAt), "MMM dd, yyyy HH:mm")}
                  </div>
                </div>
              </div>
              <div>
                <Label>Subject</Label>
                <div className="mt-1 font-medium">{selectedTicket.subject}</div>
              </div>
              <div>
                <Label>Description</Label>
                <div className="mt-1 text-sm whitespace-pre-wrap border rounded-md p-3 bg-muted/30">
                  {selectedTicket.description}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Ticket Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Update Ticket</DialogTitle>
            <DialogDescription>
              Update ticket status, priority, and add a reply
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="reply">Reply Message (Optional)</Label>
              <Textarea
                id="reply"
                placeholder="Add a reply to the customer..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmUpdate}
              disabled={updateTicketMutation.isPending}
            >
              {updateTicketMutation.isPending ? "Updating..." : "Update Ticket"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

