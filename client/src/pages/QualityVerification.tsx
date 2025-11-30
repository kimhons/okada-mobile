import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { useI18nLoader } from "@/hooks/useI18nLoader";
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
  const { t } = useTranslation('quality');
  useI18nLoader(['quality']);
  
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { data: pendingPhotos, isLoading, refetch } = trpc.qualityVerification.getPendingPhotos.useQuery();
  const approvePhoto = trpc.qualityVerification.approvePhoto.useMutation({
    onSuccess: () => {
      toast.success(t('toast.approveSuccess'));
      refetch();
      setSelectedPhoto(null);
    },
    onError: (error) => {
      toast.error(t('toast.approveError', { error: error.message }));
    },
  });

  const rejectPhoto = trpc.qualityVerification.rejectPhoto.useMutation({
    onSuccess: () => {
      toast.success(t('toast.rejectSuccess'));
      refetch();
      setSelectedPhoto(null);
      setShowRejectDialog(false);
      setRejectionReason("");
    },
    onError: (error) => {
      toast.error(t('toast.rejectError', { error: error.message }));
    },
  });

  const handleApprove = (photoId: number) => {
    approvePhoto.mutate({ photoId });
  };

  const handleReject = () => {
    if (!selectedPhoto || !rejectionReason.trim()) {
      toast.error(t('toast.reasonRequired'));
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
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('subtitle')}
        </p>
      </div>

      {!pendingPhotos || pendingPhotos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium">{t('empty.title')}</p>
            <p className="text-sm text-muted-foreground">
              {t('empty.message')}
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
                  <Badge variant="secondary">{t('card.pending')}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="relative aspect-square rounded-lg overflow-hidden bg-muted cursor-pointer"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.photoUrl}
                    alt={t('card.photoAlt')}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{t('card.customer')}</p>
                      <p className="text-muted-foreground">{photo.customerName}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">{t('card.deliveryAddress')}</p>
                      <p className="text-muted-foreground text-xs">{photo.deliveryAddress}</p>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {t('card.uploaded')}: {new Date(photo.createdAt).toLocaleString()}
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
                    {t('card.approve')}
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
                    {t('card.reject')}
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
              <DialogTitle>{t('dialog.title')}</DialogTitle>
              <DialogDescription>
                {t('dialog.description', { orderNumber: selectedPhoto.orderNumber, riderName: selectedPhoto.riderName })}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                <img
                  src={selectedPhoto.photoUrl}
                  alt={t('card.photoAlt')}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium">{t('dialog.customer')}</p>
                  <p className="text-muted-foreground">{selectedPhoto.customerName}</p>
                </div>
                <div>
                  <p className="font-medium">{t('dialog.rider')}</p>
                  <p className="text-muted-foreground">{selectedPhoto.riderName}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium">{t('dialog.deliveryAddress')}</p>
                  <p className="text-muted-foreground">{selectedPhoto.deliveryAddress}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-medium">{t('dialog.uploaded')}</p>
                  <p className="text-muted-foreground">
                    {new Date(selectedPhoto.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelectedPhoto(null)}>
                {t('dialog.close')}
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setShowRejectDialog(true);
                }}
              >
                <XCircle className="h-4 w-4 mr-2" />
                {t('dialog.reject')}
              </Button>
              <Button
                onClick={() => handleApprove(selectedPhoto.id)}
                disabled={approvePhoto.isPending}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {t('dialog.approve')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('reject.title')}</DialogTitle>
            <DialogDescription>
              {t('reject.description')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder={t('reject.placeholder')}
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
              {t('reject.cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectPhoto.isPending || !rejectionReason.trim()}
            >
              {t('reject.submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

