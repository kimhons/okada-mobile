import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, MessageSquare, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DisputeResolution() {
  const [statusFilter, setStatusFilter] = useState<string>("open");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showResolveDialog, setShowResolveDialog] = useState(false);
  const [showEscalateDialog, setShowEscalateDialog] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [resolutionType, setResolutionType] = useState<string>("refund");
  const [resolutionAmount, setResolutionAmount] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");

  const { data: disputes, isLoading, refetch } = trpc.disputes.getList.useQuery({
    status: statusFilter === "all" ? undefined : (statusFilter as any),
    priority: priorityFilter === "all" ? undefined : (priorityFilter as any),
  });

  const { data: disputeDetails, refetch: refetchDetails } = trpc.disputes.getDetails.useQuery(
    { disputeId: selectedDispute?.id || 0 },
    { enabled: !!selectedDispute }
  );

  const addMessageMutation = trpc.disputes.addMessage.useMutation({
    onSuccess: () => {
      toast.success("Message sent");
      setNewMessage("");
      refetchDetails();
    },
    onError: (error) => {
      toast.error(`Failed to send message: ${error.message}`);
    },
  });

  const resolveMutation = trpc.disputes.resolve.useMutation({
    onSuccess: () => {
      toast.success("Dispute resolved successfully");
      refetch();
      setShowResolveDialog(false);
      setShowDetailDialog(false);
      setResolutionNotes("");
      setResolutionAmount("");
    },
    onError: (error) => {
      toast.error(`Failed to resolve dispute: ${error.message}`);
    },
  });

  const escalateMutation = trpc.disputes.escalate.useMutation({
    onSuccess: () => {
      toast.success("Dispute escalated");
      refetch();
      refetchDetails();
      setShowEscalateDialog(false);
    },
    onError: (error) => {
      toast.error(`Failed to escalate: ${error.message}`);
    },
  });

  const updateStatusMutation = trpc.disputes.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated");
      refetch();
      refetchDetails();
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const handleSendMessage = () => {
    if (!selectedDispute || !newMessage.trim()) return;
    addMessageMutation.mutate({
      disputeId: selectedDispute.id,
      message: newMessage,
    });
  };

  const handleResolve = () => {
    if (!selectedDispute || !resolutionNotes.trim()) {
      toast.error("Please provide resolution notes");
      return;
    }
    resolveMutation.mutate({
      disputeId: selectedDispute.id,
      resolutionType: resolutionType as any,
      resolutionAmount: resolutionAmount ? parseInt(resolutionAmount) * 100 : undefined,
      resolutionNotes,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "destructive";
      case "high":
        return "default";
      case "medium":
        return "secondary";
      case "low":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "default";
      case "investigating":
        return "secondary";
      case "resolved":
        return "outline";
      case "escalated":
        return "destructive";
      case "closed":
        return "outline";
      default:
        return "outline";
    }
  };

  const openDisputes = disputes?.filter((d) => d.status === "open").length || 0;
  const investigatingDisputes = disputes?.filter((d) => d.status === "investigating").length || 0;
  const resolvedDisputes = disputes?.filter((d) => d.status === "resolved").length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Dispute Resolution</h1>
          <p className="text-muted-foreground">Manage and resolve customer disputes</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{openDisputes}</div>
              <p className="text-xs text-muted-foreground">Awaiting action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investigating</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{investigatingDisputes}</div>
              <p className="text-xs text-muted-foreground">Under review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resolvedDisputes}</div>
              <p className="text-xs text-muted-foreground">Successfully resolved</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label>Priority</Label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disputes List */}
        <Card>
          <CardHeader>
            <CardTitle>Disputes</CardTitle>
            <CardDescription>
              {disputes?.length || 0} dispute(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading disputes...</div>
            ) : disputes && disputes.length > 0 ? (
              <div className="space-y-4">
                {disputes.map((dispute) => (
                  <div
                    key={dispute.id}
                    className="flex items-start justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => {
                      setSelectedDispute(dispute);
                      setShowDetailDialog(true);
                    }}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{dispute.subject}</h3>
                        <Badge variant={getStatusColor(dispute.status)}>
                          {dispute.status}
                        </Badge>
                        <Badge variant={getPriorityColor(dispute.priority)}>
                          {dispute.priority}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Dispute #{dispute.disputeNumber}</p>
                        <p>Customer: {dispute.customerName}</p>
                        <p>Order: {dispute.orderNumber}</p>
                        <p>Type: {dispute.disputeType.replace(/_/g, " ")}</p>
                        <p>Created: {new Date(dispute.createdAt).toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDispute(dispute);
                          setShowDetailDialog(true);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No disputes found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dispute Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dispute Details</DialogTitle>
            <DialogDescription>
              {disputeDetails?.disputeNumber} - {disputeDetails?.subject}
            </DialogDescription>
          </DialogHeader>

          {disputeDetails && (
            <div className="space-y-6">
              {/* Dispute Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Customer</Label>
                  <p className="text-sm">{disputeDetails.customerName}</p>
                  <p className="text-xs text-muted-foreground">{disputeDetails.customerEmail}</p>
                </div>
                <div>
                  <Label>Order</Label>
                  <p className="text-sm">{disputeDetails.orderNumber}</p>
                </div>
                <div>
                  <Label>Type</Label>
                  <p className="text-sm">{disputeDetails.disputeType.replace(/_/g, " ")}</p>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Badge variant={getPriorityColor(disputeDetails.priority)}>
                    {disputeDetails.priority}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label>Description</Label>
                <p className="text-sm mt-1 p-3 bg-muted rounded">{disputeDetails.description}</p>
              </div>

              {/* Messages */}
              <div>
                <Label>Conversation History</Label>
                <div className="mt-2 space-y-3 max-h-60 overflow-y-auto">
                  {disputeDetails.messages && disputeDetails.messages.length > 0 ? (
                    disputeDetails.messages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded ${
                          msg.senderType === "admin" ? "bg-blue-50 ml-8" : "bg-muted mr-8"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold">{msg.senderType}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(msg.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No messages yet</p>
                  )}
                </div>
              </div>

              {/* Add Message */}
              {disputeDetails.status !== "resolved" && disputeDetails.status !== "closed" && (
                <div>
                  <Label htmlFor="newMessage">Add Message</Label>
                  <div className="flex gap-2 mt-2">
                    <Textarea
                      id="newMessage"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={addMessageMutation.isPending || !newMessage.trim()}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions */}
              {disputeDetails.status !== "resolved" && disputeDetails.status !== "closed" && (
                <div className="flex gap-2 pt-4 border-t">
                  {disputeDetails.status === "open" && (
                    <Button
                      onClick={() => {
                        updateStatusMutation.mutate({
                          disputeId: disputeDetails.id,
                          status: "investigating",
                        });
                      }}
                    >
                      Start Investigation
                    </Button>
                  )}
                  <Button
                    variant="default"
                    onClick={() => setShowResolveDialog(true)}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Resolve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => setShowEscalateDialog(true)}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Escalate
                  </Button>
                </div>
              )}

              {/* Resolution Info */}
              {disputeDetails.status === "resolved" && (
                <div className="p-4 bg-green-50 rounded border border-green-200">
                  <h4 className="font-semibold mb-2">Resolution</h4>
                  <p className="text-sm">Type: {disputeDetails.resolutionType}</p>
                  {disputeDetails.resolutionAmount && (
                    <p className="text-sm">
                      Amount: {(disputeDetails.resolutionAmount / 100).toFixed(2)} FCFA
                    </p>
                  )}
                  <p className="text-sm mt-2">{disputeDetails.resolutionNotes}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Resolved: {new Date(disputeDetails.resolvedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog open={showResolveDialog} onOpenChange={setShowResolveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
            <DialogDescription>
              Provide resolution details for this dispute
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="resolutionType">Resolution Type</Label>
              <Select value={resolutionType} onValueChange={setResolutionType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="replacement">Replacement</SelectItem>
                  <SelectItem value="compensation">Compensation</SelectItem>
                  <SelectItem value="dismissed">Dismissed</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(resolutionType === "refund" || resolutionType === "compensation") && (
              <div>
                <Label htmlFor="resolutionAmount">Amount (FCFA)</Label>
                <Input
                  id="resolutionAmount"
                  type="number"
                  value={resolutionAmount}
                  onChange={(e) => setResolutionAmount(e.target.value)}
                  placeholder="Enter amount"
                />
              </div>
            )}

            <div>
              <Label htmlFor="resolutionNotes">Resolution Notes *</Label>
              <Textarea
                id="resolutionNotes"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Explain the resolution..."
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResolveDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResolve}
              disabled={resolveMutation.isPending || !resolutionNotes.trim()}
            >
              {resolveMutation.isPending ? "Resolving..." : "Resolve Dispute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Escalate Dialog */}
      <Dialog open={showEscalateDialog} onOpenChange={setShowEscalateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Escalate Dispute</DialogTitle>
            <DialogDescription>
              Escalate this dispute to a senior administrator
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            This dispute will be marked as escalated and assigned to a senior team member for review.
          </p>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEscalateDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (selectedDispute) {
                  escalateMutation.mutate({
                    disputeId: selectedDispute.id,
                    assignedTo: 1, // TODO: Select admin to assign to
                  });
                }
              }}
              disabled={escalateMutation.isPending}
            >
              {escalateMutation.isPending ? "Escalating..." : "Escalate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
