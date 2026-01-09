import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Eye,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type ApplicationStatus = "pending" | "under_review" | "approved" | "rejected" | "requires_info";

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="h-3 w-3" /> },
  under_review: { label: "Under Review", color: "bg-blue-100 text-blue-700", icon: <Eye className="h-3 w-3" /> },
  approved: { label: "Approved", color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-3 w-3" /> },
  rejected: { label: "Rejected", color: "bg-red-100 text-red-700", icon: <XCircle className="h-3 w-3" /> },
  requires_info: { label: "Needs Info", color: "bg-orange-100 text-orange-700", icon: <AlertTriangle className="h-3 w-3" /> },
};

export default function SellerOnboarding() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<"approve" | "reject" | "request_info">("approve");
  const [actionNotes, setActionNotes] = useState("");

  const { data: applications = [], isLoading, refetch } = trpc.sellerApplications.list.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    search: searchQuery || undefined,
  });

  const approveMutation = trpc.sellerApplications.approve.useMutation({
    onSuccess: () => {
      toast.success("Application approved successfully");
      setActionDialogOpen(false);
      setSelectedApplication(null);
      setActionNotes("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to approve application");
    },
  });

  const rejectMutation = trpc.sellerApplications.reject.useMutation({
    onSuccess: () => {
      toast.success("Application rejected");
      setActionDialogOpen(false);
      setSelectedApplication(null);
      setActionNotes("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reject application");
    },
  });

  const requestInfoMutation = trpc.sellerApplications.requestInfo.useMutation({
    onSuccess: () => {
      toast.success("Information request sent");
      setActionDialogOpen(false);
      setSelectedApplication(null);
      setActionNotes("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to request information");
    },
  });

  const handleAction = () => {
    if (!selectedApplication) return;

    switch (actionType) {
      case "approve":
        approveMutation.mutate({ id: selectedApplication.id, reviewNotes: actionNotes });
        break;
      case "reject":
        if (!actionNotes.trim()) {
          toast.error("Please provide a rejection reason");
          return;
        }
        rejectMutation.mutate({ id: selectedApplication.id, rejectionReason: actionNotes });
        break;
      case "request_info":
        if (!actionNotes.trim()) {
          toast.error("Please specify what information is needed");
          return;
        }
        requestInfoMutation.mutate({ id: selectedApplication.id, reviewNotes: actionNotes });
        break;
    }
  };

  const openActionDialog = (application: any, type: "approve" | "reject" | "request_info") => {
    setSelectedApplication(application);
    setActionType(type);
    setActionNotes("");
    setActionDialogOpen(true);
  };

  const getStatusCounts = () => {
    const counts = {
      all: applications.length,
      pending: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      requires_info: 0,
    };
    applications.forEach((app) => {
      counts[app.status as keyof typeof counts]++;
    });
    return counts;
  };

  const counts = getStatusCounts();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Onboarding</h1>
          <p className="text-gray-600 mt-1">Review and manage seller applications</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className={statusFilter === "pending" ? "ring-2 ring-[#2D8659]" : ""}>
          <CardContent className="pt-6 cursor-pointer" onClick={() => setStatusFilter("pending")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{counts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card className={statusFilter === "under_review" ? "ring-2 ring-[#2D8659]" : ""}>
          <CardContent className="pt-6 cursor-pointer" onClick={() => setStatusFilter("under_review")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">{counts.under_review}</p>
              </div>
              <Eye className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className={statusFilter === "requires_info" ? "ring-2 ring-[#2D8659]" : ""}>
          <CardContent className="pt-6 cursor-pointer" onClick={() => setStatusFilter("requires_info")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Needs Info</p>
                <p className="text-2xl font-bold text-orange-600">{counts.requires_info}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card className={statusFilter === "approved" ? "ring-2 ring-[#2D8659]" : ""}>
          <CardContent className="pt-6 cursor-pointer" onClick={() => setStatusFilter("approved")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-bold text-green-600">{counts.approved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className={statusFilter === "rejected" ? "ring-2 ring-[#2D8659]" : ""}>
          <CardContent className="pt-6 cursor-pointer" onClick={() => setStatusFilter("rejected")}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{counts.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search by business name, applicant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status ({counts.all})</SelectItem>
                <SelectItem value="pending">Pending ({counts.pending})</SelectItem>
                <SelectItem value="under_review">Under Review ({counts.under_review})</SelectItem>
                <SelectItem value="requires_info">Needs Info ({counts.requires_info})</SelectItem>
                <SelectItem value="approved">Approved ({counts.approved})</SelectItem>
                <SelectItem value="rejected">Rejected ({counts.rejected})</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardHeader>
          <CardTitle>Applications ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D8659] mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <Store className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No applications found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Documents</TableHead>
                    <TableHead>Applied</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.map((app) => {
                    const statusConfig = STATUS_CONFIG[app.status as ApplicationStatus];
                    const docCount = [app.idDocument, app.businessLicense, app.taxCertificate, app.proofOfAddress].filter(Boolean).length;
                    
                    return (
                      <TableRow key={app.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{app.businessName}</p>
                            <p className="text-sm text-gray-500">{app.businessType}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{app.applicantName}</p>
                            <p className="text-sm text-gray-500">{app.applicantEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>{app.businessType}</TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig.color} flex items-center gap-1 w-fit`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span>{docCount}/4</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-500">
                            {format(new Date(app.createdAt), "MMM d, yyyy")}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedApplication(app)}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              View
                            </Button>
                            {(app.status === "pending" || app.status === "under_review" || app.status === "requires_info") && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => openActionDialog(app, "approve")}
                                >
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => openActionDialog(app, "reject")}
                                >
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-orange-600 hover:text-orange-700"
                                  onClick={() => openActionDialog(app, "request_info")}
                                >
                                  <MessageSquare className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Application Detail Dialog */}
      <Dialog open={!!selectedApplication && !actionDialogOpen} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Application Details
            </DialogTitle>
            <DialogDescription>
              Review seller application information
            </DialogDescription>
          </DialogHeader>

          {selectedApplication && (
            <Tabs defaultValue="business" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="business">Business</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="payment">Payment</TabsTrigger>
              </TabsList>

              <TabsContent value="business" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Business Name</Label>
                    <p className="font-medium">{selectedApplication.businessName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Business Type</Label>
                    <p className="font-medium">{selectedApplication.businessType}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="text-gray-500">Address</Label>
                    <p className="font-medium">{selectedApplication.businessAddress}</p>
                  </div>
                  {selectedApplication.businessDescription && (
                    <div className="col-span-2">
                      <Label className="text-gray-500">Description</Label>
                      <p className="font-medium">{selectedApplication.businessDescription}</p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Applicant Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-500">Name</Label>
                      <p className="font-medium">{selectedApplication.applicantName}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Email</Label>
                      <p className="font-medium">{selectedApplication.applicantEmail}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Phone</Label>
                      <p className="font-medium">{selectedApplication.applicantPhone}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="documents" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg border ${selectedApplication.idDocument ? "bg-green-50 border-green-200" : "bg-gray-50"}`}>
                    <Label className="text-gray-500">ID Document</Label>
                    <p className="font-medium">{selectedApplication.idDocument ? "Uploaded" : "Not provided"}</p>
                  </div>
                  <div className={`p-4 rounded-lg border ${selectedApplication.businessLicense ? "bg-green-50 border-green-200" : "bg-gray-50"}`}>
                    <Label className="text-gray-500">Business License</Label>
                    <p className="font-medium">{selectedApplication.businessLicense ? "Uploaded" : "Not provided"}</p>
                  </div>
                  <div className={`p-4 rounded-lg border ${selectedApplication.taxCertificate ? "bg-green-50 border-green-200" : "bg-gray-50"}`}>
                    <Label className="text-gray-500">Tax Certificate</Label>
                    <p className="font-medium">{selectedApplication.taxCertificate ? "Uploaded" : "Not provided"}</p>
                  </div>
                  <div className={`p-4 rounded-lg border ${selectedApplication.proofOfAddress ? "bg-green-50 border-green-200" : "bg-gray-50"}`}>
                    <Label className="text-gray-500">Proof of Address</Label>
                    <p className="font-medium">{selectedApplication.proofOfAddress ? "Uploaded" : "Not provided"}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payment" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Bank Name</Label>
                    <p className="font-medium">{selectedApplication.bankName || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Account Number</Label>
                    <p className="font-medium">{selectedApplication.bankAccountNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Mobile Money Provider</Label>
                    <p className="font-medium capitalize">
                      {selectedApplication.mobileMoneyProvider?.replace("_", " ") || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Mobile Money Number</Label>
                    <p className="font-medium">{selectedApplication.mobileMoneyNumber || "Not provided"}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}

          {selectedApplication && (selectedApplication.status === "pending" || selectedApplication.status === "under_review" || selectedApplication.status === "requires_info") && (
            <DialogFooter className="flex gap-2">
              <Button
                variant="outline"
                className="text-orange-600"
                onClick={() => openActionDialog(selectedApplication, "request_info")}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Request Info
              </Button>
              <Button
                variant="outline"
                className="text-red-600"
                onClick={() => openActionDialog(selectedApplication, "reject")}
              >
                <ThumbsDown className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => openActionDialog(selectedApplication, "approve")}
              >
                <ThumbsUp className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approve Application"}
              {actionType === "reject" && "Reject Application"}
              {actionType === "request_info" && "Request More Information"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && "This will create a new seller account."}
              {actionType === "reject" && "Please provide a reason for rejection."}
              {actionType === "request_info" && "Specify what additional information is needed."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>
                {actionType === "approve" && "Review Notes (Optional)"}
                {actionType === "reject" && "Rejection Reason (Required)"}
                {actionType === "request_info" && "Information Needed (Required)"}
              </Label>
              <Textarea
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder={
                  actionType === "approve"
                    ? "Add any notes about this approval..."
                    : actionType === "reject"
                    ? "Explain why this application is being rejected..."
                    : "Describe what additional documents or information is required..."
                }
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={approveMutation.isPending || rejectMutation.isPending || requestInfoMutation.isPending}
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : actionType === "reject"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-orange-600 hover:bg-orange-700"
              }
            >
              {actionType === "approve" && "Approve"}
              {actionType === "reject" && "Reject"}
              {actionType === "request_info" && "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
