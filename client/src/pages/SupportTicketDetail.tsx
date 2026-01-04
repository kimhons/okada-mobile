import { useState } from "react";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Send, User, Clock } from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function SupportTicketDetail() {
  const [, params] = useRoute("/support/:id");
  const [, setLocation] = useLocation();
  const ticketId = params?.id ? parseInt(params.id) : 0;

  const [message, setMessage] = useState("");
  const [newStatus, setNewStatus] = useState<string>("");

  const { data: ticket, isLoading, refetch } = trpc.support.getTicketById.useQuery({ id: ticketId });

  const updateStatus = trpc.support.updateTicketStatus.useMutation({
    onSuccess: () => {
      toast.success("Ticket status updated successfully");
      refetch();
      setNewStatus("");
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const addMessage = trpc.support.addMessage.useMutation({
    onSuccess: () => {
      toast.success("Message sent successfully");
      setMessage("");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });

  const handleUpdateStatus = () => {
    if (!newStatus) {
      toast.error("Please select a status");
      return;
    }
    updateStatus.mutate({ id: ticketId, status: newStatus });
  };

  const handleSendMessage = () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }
    addMessage.mutate({ ticketId, message: message.trim() });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">Open</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case "resolved":
        return <Badge variant="default" className="bg-green-600">Resolved</Badge>;
      case "closed":
        return <Badge variant="outline">Closed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge>{priority}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading ticket details...</p>
        </div>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-lg font-semibold mb-2">Ticket Not Found</p>
          <p className="text-muted-foreground mb-4">The ticket you're looking for doesn't exist.</p>
          <Button onClick={() => setLocation("/support")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Support
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => setLocation("/support")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Support
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Ticket #{ticket.id}</h1>
            <p className="text-muted-foreground mt-2">{ticket.subject}</p>
          </div>
          <div className="flex gap-2">
            {getStatusBadge(ticket.status)}
            {getPriorityBadge(ticket.priority)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ticket Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{ticket.description || "No description provided"}</p>
            </CardContent>
          </Card>

          {/* Messages/Conversation */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation</CardTitle>
              <CardDescription>Messages and responses for this ticket</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mock messages - replace with real data */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">User #{ticket.userId}</span>
                      <span className="text-xs text-muted-foreground">{formatDate(ticket.createdAt)}</span>
                    </div>
                    <div className="bg-muted p-3 rounded-lg">
                      <p className="text-sm">{ticket.description}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Reply Form */}
              <div className="border-t pt-4">
                <label className="text-sm font-medium mb-2 block">Send Reply</label>
                <Textarea
                  placeholder="Type your response here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="mb-2"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={addMessage.isPending || !message.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {addMessage.isPending ? "Sending..." : "Send Reply"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Info */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">User ID</label>
                <p className="font-medium">#{ticket.userId}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Created</label>
                <p className="font-medium text-sm">{formatDate(ticket.createdAt)}</p>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Last Updated</label>
                <p className="font-medium text-sm">{formatDate(ticket.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>

          {/* Update Status */}
          <Card>
            <CardHeader>
              <CardTitle>Update Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Status</label>
                <div>{getStatusBadge(ticket.status)}</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Change To</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleUpdateStatus}
                disabled={updateStatus.isPending || !newStatus}
                className="w-full"
              >
                {updateStatus.isPending ? "Updating..." : "Update Status"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

