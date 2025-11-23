import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Image as ImageIcon, MapPin, User } from "lucide-react";
import { toast } from "sonner";

export default function QualityVerification() {
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: pendingPhotos, isLoading, refetch } = trpc.qualityVerification.getPendingPhotos.useQuery();
  const approvePhoto = trpc.qualityVerification.approvePhoto.useMutation({
    onSuccess: () => {
      toast.success("Photo approved successfully");
      refetch();
      setSelectedPhoto(null);
    },
    onError: (error) => {
      toast.error(`Failed to approve photo: ${error.message}`);
    },
  });

  const rejectPhoto = trpc.qualityVerification.rejectPhoto.useMutation({
    onSuccess: () => {
      toast.success("Photo rejected");
      refetch();
      setSelectedPhoto(null);
      setShowRejectDialog(false);
      setRejectionReason("");
    },
    onError: (error) => {
      toast.error(`Failed to reject photo: ${error.message}`);
    },
  });

  const handleApprove = (photoId: number) => {
    approvePhoto.mutate({ photoId });
  };

  const handleReject = () => {
    if (!selectedPhoto || !rejectionReason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    rejectPhoto.mutate({
      photoId: selectedPhoto.id,
      reason: rejectionReason,
    });
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading quality verification photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Quality Verification Review</h1>
        <p className="text-muted-foreground mt-2">
          Review and approve delivery quality photos submitted by riders
        </p>
      </div>

      {!pendingPhotos || pendingPhotos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">No pending photos to review</p>
            <p className="text-sm text-muted-foreground">
              All quality verification photos have been reviewed
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingPhotos.map((photo: any) => (
            <Card key={photo.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{photo.orderNumber}</CardTitle>
                    <CardDescription className="mt-1">
                      <div className="flex items-center gap-1 text-sm">
                        <User className="h-3 w-3" />
                        {photo.riderName}
                      </div>
                    </CardDescription>
                  </div>
                  <Badge variant="secondary">Pending</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.photoUrl}
                    alt="Quality verification photo"
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Customer</p>
                      <p className="text-muted-foreground">{photo.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Delivery Address</p>
                      <p className="text-muted-foreground text-xs">{photo.deliveryAddress}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Uploaded: {new Date(photo.createdAt).toLocaleString()}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleApprove(photo.id)}
                    disabled={approvePhoto.isPending}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setSelectedPhoto(photo);
                      setShowRejectDialog(true);
                    }}
                    disabled={rejectPhoto.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Photo Detail Dialog */}
      {selectedPhoto && !showRejectDialog && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Quality Verification Photo</DialogTitle>
              <DialogDescription>
                Order {selectedPhoto.orderNumber} - {selectedPhoto.riderName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={selectedPhoto.photoUrl}
                  alt="Quality verification photo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">Customer</p>
                  <p className="text-muted-foreground">{selectedPhoto.customerName}</p>
                </div>
                <div>
                  <p className="font-medium">Rider</p>
                  <p className="text-muted-foreground">{selectedPhoto.riderName}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium">Delivery Address</p>
                  <p className="text-muted-foreground">{selectedPhoto.deliveryAddress}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium">Uploaded</p>
                  <p className="text-muted-foreground">
                    {new Date(selectedPhoto.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPhoto(null)}>
                Close
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowRejectDialog(true);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button
                onClick={() => handleApprove(selectedPhoto.id)}
                disabled={approvePhoto.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Quality Photo</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this photo. This will be sent to the rider.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter rejection reason..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectionReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectPhoto.isPending || !rejectionReason.trim()}
            >
              Reject Photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

