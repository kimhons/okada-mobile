import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, CheckCircle, XCircle, Flag, Eye } from "lucide-react";
import { toast } from "sonner";

export default function ContentModeration() {
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [contentTypeFilter, setContentTypeFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [moderateDialogOpen, setModerateDialogOpen] = useState(false);
  const [moderatorNotes, setModeratorNotes] = useState("");

  const utils = trpc.useUtils();
  const { data: queue, isLoading } = trpc.contentModeration.getQueue.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    contentType: contentTypeFilter === "all" ? undefined : contentTypeFilter,
    priority: priorityFilter === "all" ? undefined : priorityFilter,
  });

  const moderateMutation = trpc.contentModeration.moderate.useMutation({
    onSuccess: () => {
      toast.success("Content moderated successfully");
      utils.contentModeration.getQueue.invalidate();
      setModerateDialogOpen(false);
      setModeratorNotes("");
    },
    onError: (error) => {
      toast.error(`Failed to moderate content: ${error.message}`);
    },
  });

  const handleModerate = (item: any) => {
    setSelectedItem(item);
    setModerateDialogOpen(true);
  };

  const handleApprove = () => {
    if (selectedItem) {
      moderateMutation.mutate({
        itemId: selectedItem.id,
        status: "approved",
        moderatorNotes,
      });
    }
  };

  const handleReject = () => {
    if (selectedItem) {
      moderateMutation.mutate({
        itemId: selectedItem.id,
        status: "rejected",
        moderatorNotes,
      });
    }
  };

  const handleFlag = () => {
    if (selectedItem) {
      moderateMutation.mutate({
        itemId: selectedItem.id,
        status: "flagged",
        moderatorNotes,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      flagged: "bg-orange-100 text-orange-800",
    };
    return <Badge className={colors[status] || ""}>{status.toUpperCase()}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "bg-gray-100 text-gray-800",
      medium: "bg-blue-100 text-blue-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    };
    return <Badge className={colors[priority] || ""}>{priority.toUpperCase()}</Badge>;
  };

  const getContentTypeBadge = (type: string) => {
    return <Badge variant="outline">{type.replace("_", " ").toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Content Moderation
          </h1>
          <p className="text-muted-foreground">
            Review and moderate user-generated content
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="flagged">Flagged</SelectItem>
          </SelectContent>
        </Select>

        <Select value={contentTypeFilter} onValueChange={setContentTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Content Types</SelectItem>
            <SelectItem value="user_profile">User Profile</SelectItem>
            <SelectItem value="product_listing">Product Listing</SelectItem>
            <SelectItem value="review">Review</SelectItem>
            <SelectItem value="seller_profile">Seller Profile</SelectItem>
            <SelectItem value="rider_profile">Rider Profile</SelectItem>
            <SelectItem value="support_message">Support Message</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading moderation queue...
            </CardContent>
          </Card>
        ) : !queue || queue.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No content items found
            </CardContent>
          </Card>
        ) : (
          queue.map((item: any) => (
            <Card key={item.id} className={item.priority === "urgent" ? "border-red-500" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getContentTypeBadge(item.contentType)}
                      {getStatusBadge(item.status)}
                      {getPriorityBadge(item.priority)}
                    </div>
                    <CardTitle className="text-lg">
                      Content ID: {item.contentId} • User: {item.userName || "Unknown"}
                    </CardTitle>
                    <CardDescription>
                      {item.userEmail} • Submitted {new Date(item.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  {item.status === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleModerate(item)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Review
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.contentUrl && (
                  <div>
                    <Label className="text-sm font-medium">Content URL</Label>
                    <div className="text-sm text-blue-600 break-all">{item.contentUrl}</div>
                  </div>
                )}
                {item.contentText && (
                  <div>
                    <Label className="text-sm font-medium">Content Text</Label>
                    <div className="text-sm bg-muted p-3 rounded mt-1">
                      {item.contentText}
                    </div>
                  </div>
                )}
                {item.flagReason && (
                  <div>
                    <Label className="text-sm font-medium text-red-600">Flag Reason</Label>
                    <div className="text-sm text-red-600">{item.flagReason}</div>
                  </div>
                )}
                {item.moderatorNotes && (
                  <div>
                    <Label className="text-sm font-medium">Moderator Notes</Label>
                    <div className="text-sm text-muted-foreground">{item.moderatorNotes}</div>
                  </div>
                )}
                {item.moderatedAt && (
                  <div className="text-xs text-muted-foreground">
                    Moderated: {new Date(item.moderatedAt).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Moderation Dialog */}
      <Dialog open={moderateDialogOpen} onOpenChange={setModerateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Moderate Content</DialogTitle>
            <DialogDescription>
              Review and take action on this content item
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedItem && (
              <>
                <div>
                  <Label>Content Type</Label>
                  <div className="text-sm">{selectedItem.contentType.replace("_", " ")}</div>
                </div>
                {selectedItem.contentText && (
                  <div>
                    <Label>Content</Label>
                    <div className="text-sm bg-muted p-3 rounded mt-1">
                      {selectedItem.contentText}
                    </div>
                  </div>
                )}
                {selectedItem.flagReason && (
                  <div>
                    <Label className="text-red-600">Flag Reason</Label>
                    <div className="text-sm text-red-600">{selectedItem.flagReason}</div>
                  </div>
                )}
                <div>
                  <Label>Moderator Notes</Label>
                  <Textarea
                    value={moderatorNotes}
                    onChange={(e) => setModeratorNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    rows={4}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setModerateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={moderateMutation.isPending}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              variant="outline"
              onClick={handleFlag}
              disabled={moderateMutation.isPending}
              className="border-orange-500 text-orange-600"
            >
              <Flag className="h-4 w-4 mr-2" />
              Flag
            </Button>
            <Button
              onClick={handleApprove}
              disabled={moderateMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
