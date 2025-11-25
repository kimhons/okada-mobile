import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertCircle, FileText, User, Building, Bike } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export default function UserVerification() {
  const [userTypeFilter, setUserTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showMoreInfoDialog, setShowMoreInfoDialog] = useState(false);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [moreInfoNotes, setMoreInfoNotes] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");

  const { data: requests, isLoading, refetch } = trpc.userVerification.getRequests.useQuery({
    userType: userTypeFilter === "all" ? undefined : (userTypeFilter as any),
    status: statusFilter === "all" ? undefined : (statusFilter as any),
  });

  const approveMutation = trpc.userVerification.approve.useMutation({
    onSuccess: () => {
      toast.success("Verification approved successfully");
      refetch();
      setShowApproveDialog(false);
      setApprovalNotes("");
    },
    onError: (error) => {
      toast.error(`Failed to approve: ${error.message}`);
    },
  });

  const rejectMutation = trpc.userVerification.reject.useMutation({
    onSuccess: () => {
      toast.success("Verification rejected");
      refetch();
      setShowRejectDialog(false);
      setRejectionReason("");
    },
    onError: (error) => {
      toast.error(`Failed to reject: ${error.message}`);
    },
  });

  const requestMoreInfoMutation = trpc.userVerification.requestMoreInfo.useMutation({
    onSuccess: () => {
      toast.success("More information requested");
      refetch();
      setShowMoreInfoDialog(false);
      setMoreInfoNotes("");
    },
    onError: (error) => {
      toast.error(`Failed to request info: ${error.message}`);
    },
  });

  const handleApprove = () => {
    if (!selectedRequest) return;
    approveMutation.mutate({
      requestId: selectedRequest.id,
      notes: approvalNotes || undefined,
    });
  };

  const handleReject = () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    rejectMutation.mutate({
      requestId: selectedRequest.id,
      rejectionReason,
      notes: undefined,
    });
  };

  const handleRequestMoreInfo = () => {
    if (!selectedRequest || !moreInfoNotes.trim()) {
      toast.error("Please provide details about required information");
      return;
    }
    requestMoreInfoMutation.mutate({
      requestId: selectedRequest.id,
      notes: moreInfoNotes,
    });
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case "customer":
        return <User className="h-4 w-4" />;
      case "seller":
        return <Building className="h-4 w-4" />;
      case "rider":
        return <Bike className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "approved":
        return "secondary";
      case "rejected":
        return "destructive";
      case "more_info_needed":
        return "outline";
      default:
        return "default";
    }
  };

  const getDocumentTypeLabel = (type: string) => {
    return type.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
  };

  const pendingCount = requests?.filter((r) => r.status === "pending").length || 0;
  const approvedCount = requests?.filter((r) => r.status === "approved").length || 0;
  const totalRequests = requests?.length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">User Verification</h1>
          <p className="text-muted-foreground">Review and verify user documents</p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting verification</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedCount}</div>
              <p className="text-xs text-muted-foreground">Verified users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRequests}</div>
              <p className="text-xs text-muted-foreground">All verification requests</p>
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
                <Label>User Type</Label>
                <Select value={userTypeFilter} onValueChange={setUserTypeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="customer">Customers</SelectItem>
                    <SelectItem value="seller">Sellers</SelectItem>
                    <SelectItem value="rider">Riders</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="more_info_needed">More Info Needed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Verification Requests</CardTitle>
            <CardDescription>
              {requests?.length || 0} request(s) found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading requests...</div>
            ) : requests && requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-start justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getUserTypeIcon(request.userType)}
                        <h3 className="font-semibold">{request.userName || "Unknown User"}</h3>
                        <Badge variant={getStatusColor(request.status)}>
                          {request.status.replace("_", " ")}
                        </Badge>
                        <Badge variant="outline">
                          {request.userType}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Email: {request.userEmail || "N/A"}</p>
                        <p>Document Type: {getDocumentTypeLabel(request.documentType)}</p>
                        <p>Submitted: {new Date(request.submittedAt).toLocaleString()}</p>
                        {request.reviewedAt && (
                          <p>Reviewed: {new Date(request.reviewedAt).toLocaleString()}</p>
                        )}
                        {request.rejectionReason && (
                          <p className="text-destructive">Reason: {request.rejectionReason}</p>
                        )}
                        {request.notes && (
                          <p>Notes: {request.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowDocumentDialog(true);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        View Docs
                      </Button>
                      
                      {request.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowApproveDialog(true);
                            }}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowRejectDialog(true);
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowMoreInfoDialog(true);
                            }}
                          >
                            <AlertCircle className="h-4 w-4 mr-1" />
                            More Info
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No verification requests found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* View Document Dialog */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Verification Documents</DialogTitle>
            <DialogDescription>
              Review submitted documents for {selectedRequest?.userName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Primary Document</Label>
              <div className="mt-2 border rounded-lg p-4">
                <p className="text-sm mb-2">
                  Type: {selectedRequest && getDocumentTypeLabel(selectedRequest.documentType)}
                </p>
                {selectedRequest?.documentUrl && (
                  <img
                    src={selectedRequest.documentUrl}
                    alt="Document"
                    className="w-full max-h-96 object-contain rounded"
                  />
                )}
              </div>
            </div>

            {selectedRequest?.additionalDocuments && (
              <div>
                <Label>Additional Documents</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedRequest.additionalDocuments}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowDocumentDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Verification</DialogTitle>
            <DialogDescription>
              Approve verification request for {selectedRequest?.userName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="approvalNotes">Approval Notes (Optional)</Label>
              <Textarea
                id="approvalNotes"
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={approveMutation.isPending}>
              {approveMutation.isPending ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification</DialogTitle>
            <DialogDescription>
              Reject verification request for {selectedRequest?.userName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="rejectionReason">Rejection Reason *</Label>
              <Textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this verification is being rejected..."
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending || !rejectionReason.trim()}
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request More Info Dialog */}
      <Dialog open={showMoreInfoDialog} onOpenChange={setShowMoreInfoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request More Information</DialogTitle>
            <DialogDescription>
              Request additional information from {selectedRequest?.userName}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="moreInfoNotes">Required Information *</Label>
              <Textarea
                id="moreInfoNotes"
                value={moreInfoNotes}
                onChange={(e) => setMoreInfoNotes(e.target.value)}
                placeholder="Specify what additional information is needed..."
                rows={4}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMoreInfoDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestMoreInfo}
              disabled={requestMoreInfoMutation.isPending || !moreInfoNotes.trim()}
            >
              {requestMoreInfoMutation.isPending ? "Sending..." : "Request Info"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
