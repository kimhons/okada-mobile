import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  Bike,
  CheckCircle,
  XCircle,
  Clock,
  Ban,
  DollarSign,
  Package,
  Star,
  Phone,
  MapPin,
  FileSpreadsheet,
} from "lucide-react";
import { toast } from "sonner";
import { exportRidersToExcel } from "@/lib/exportUtils";
import { BadgeDisplay } from "@/components/BadgeDisplay";
import { RiderBadgeProfile } from "@/components/RiderBadgeProfile";

export default function Riders() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedRiderId, setSelectedRiderId] = useState<number | null>(null);

  const { data: riders = [], isLoading, refetch } = trpc.riders.list.useQuery({
    search,
    status: statusFilter || undefined,
  });

  const { data: riderDetails } = trpc.riders.getById.useQuery(
    { id: selectedRiderId! },
    { enabled: !!selectedRiderId }
  );

  const updateStatusMutation = trpc.riders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Rider status updated successfully");
      refetch();
      setSelectedRiderId(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update rider status");
    },
  });

  const handleUpdateStatus = (
    riderId: number,
    status: "pending" | "approved" | "rejected" | "suspended"
  ) => {
    const confirmMessage = `Are you sure you want to ${status} this rider?`;
    if (confirm(confirmMessage)) {
      updateStatusMutation.mutate({ riderId, status });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4" />;
      case "rejected":
        return <XCircle className="h-4 w-4" />;
      case "suspended":
        return <Ban className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "border-green-500 text-green-700 bg-green-50";
      case "rejected":
        return "border-red-500 text-red-700 bg-red-50";
      case "suspended":
        return "border-orange-500 text-orange-700 bg-orange-50";
      case "pending":
        return "border-yellow-500 text-yellow-700 bg-yellow-50";
      default:
        return "";
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('riders:title')}</h1>
          <p className="text-gray-600 mt-1">
            {t('riders:description')}
          </p>
        </div>
        <Button
          onClick={() => {
            if (!riders || riders.length === 0) {
              toast.error("No riders to export");
              return;
            }
            exportRidersToExcel(riders);
            toast.success("Riders exported to Excel");
          }}
          className="bg-[#2D8659] hover:bg-[#236B47]"
        >
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {t('riders:export_excel')}
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder={t('riders:search_placeholder')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder={t('riders:filter_by_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('riders:all_status')}</SelectItem>
                <SelectItem value="pending">{t('riders:status_pending')}</SelectItem>
                <SelectItem value="approved">{t('riders:status_approved')}</SelectItem>
                <SelectItem value="rejected">{t('riders:status_rejected')}</SelectItem>
                <SelectItem value="suspended">{t('riders:status_suspended')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Riders Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('riders:all_riders', { count: riders.length })}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D8659] mx-auto"></div>
              <p className="text-gray-600 mt-4">{t('riders:loading')}</p>
            </div>
          ) : riders.length === 0 ? (
            <div className="text-center py-12">
              <Bike className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">{t('riders:no_riders')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('riders:table_rider')}</TableHead>
                    <TableHead>{t('riders:table_phone')}</TableHead>
                    <TableHead>{t('riders:table_vehicle')}</TableHead>
                    <TableHead>{t('riders:table_rating')}</TableHead>
                    <TableHead>{t('riders:table_status')}</TableHead>
                    <TableHead>{t('riders:table_joined')}</TableHead>
                    <TableHead>{t('riders:table_actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {riders.map((rider) => (
                    <TableRow key={rider.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-[#2D8659] flex items-center justify-center text-white font-semibold">
                            <Bike className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">{rider.name}</div>
                            <div className="text-sm text-gray-500">ID: {rider.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{rider.phone}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{rider.vehicleType}</div>
                          <div className="text-sm text-gray-500">
                            {rider.vehicleNumber}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span className="font-medium">
                            {rider.rating?.toFixed(1) || "N/A"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`flex items-center gap-1 w-fit ${getStatusColor(
                            rider.status
                          )}`}
                        >
                          {getStatusIcon(rider.status)}
                          {rider.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(rider.createdAt)}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedRiderId(rider.id)}
                        >
                          {t('riders:view_details')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rider Details Dialog */}
      <Dialog open={!!selectedRiderId} onOpenChange={() => setSelectedRiderId(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('riders:rider_details')}</DialogTitle>
            <DialogDescription>
              {t('riders:rider_details_description')}
            </DialogDescription>
          </DialogHeader>

          {riderDetails && (
            <div className="space-y-6">
              {/* Rider Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t('riders:rider_information')}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">{t('riders:name')}</label>
                      <p className="text-base">{riderDetails.rider?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {t('riders:phone')}
                      </label>
                      <p className="text-base">{riderDetails.rider?.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">{t('riders:rating')}</label>
                      <div className="flex items-center gap-1">
                        <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                        <span className="text-base font-semibold">
                          {riderDetails.rider?.rating?.toFixed(1) || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {t('riders:vehicle_type')}
                      </label>
                      <p className="text-base">{riderDetails.rider?.vehicleType}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">
                        {t('riders:vehicle_number')}
                      </label>
                      <p className="text-base">{riderDetails.rider?.vehicleNumber}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">{t('riders:status')}</label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className={`flex items-center gap-1 ${getStatusColor(
                            riderDetails.rider?.status || ""
                          )}`}
                        >
                          {getStatusIcon(riderDetails.rider?.status || "")}
                          {riderDetails.rider?.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Status Actions */}
                  {riderDetails.rider?.status === "pending" && (
                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        onClick={() =>
                          handleUpdateStatus(riderDetails.rider!.id, "approved")
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('riders:approve_rider')}
                      </Button>
                      <Button
                        onClick={() =>
                          handleUpdateStatus(riderDetails.rider!.id, "rejected")
                        }
                        variant="destructive"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        {t('riders:reject_application')}
                      </Button>
                    </div>
                  )}

                  {riderDetails.rider?.status === "approved" && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() =>
                          handleUpdateStatus(riderDetails.rider!.id, "suspended")
                        }
                        variant="outline"
                        className="border-orange-500 text-orange-700 hover:bg-orange-50"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        {t('riders:suspend_rider')}
                      </Button>
                    </div>
                  )}

                  {riderDetails.rider?.status === "suspended" && (
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() =>
                          handleUpdateStatus(riderDetails.rider!.id, "approved")
                        }
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {t('riders:reactivate_rider')}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Badges & Achievements */}
              {riderDetails.rider && (
                <RiderBadgeProfile riderId={riderDetails.rider.id} />
              )}

              {/* Earnings Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    {t('riders:earnings_summary')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!riderDetails.earnings || riderDetails.earnings.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">{t('riders:no_earnings')}</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">{t('riders:total_earnings')}</p>
                          <p className="text-2xl font-bold text-[#2D8659]">
                            {riderDetails.earnings
                              .reduce((sum, e) => sum + e.amount, 0)
                              .toLocaleString()}{" "}
                            FCFA
                          </p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">{t('riders:total_deliveries')}</p>
                          <p className="text-2xl font-bold text-blue-700">
                            {riderDetails.deliveries?.length || 0}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600">{t('riders:avg_per_delivery')}</p>
                          <p className="text-2xl font-bold text-purple-700">
                            {riderDetails.earnings.length > 0
                              ? (
                                  riderDetails.earnings.reduce(
                                    (sum, e) => sum + e.amount,
                                    0
                                  ) / riderDetails.earnings.length
                                ).toLocaleString(undefined, {
                                  maximumFractionDigits: 0,
                                })
                              : 0}{" "}
                            FCFA
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {riderDetails.earnings.slice(0, 5).map((earning) => (
                          <div
                            key={earning.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <p className="font-medium">Delivery Earning</p>
                              <p className="text-sm text-gray-500">
                                {formatDate(earning.createdAt)} • {earning.status}
                              </p>
                            </div>
                            <p className="font-semibold text-[#2D8659]">
                              +{earning.amount.toLocaleString()} FCFA
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Delivery History */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    {t('riders:recent_deliveries', { count: riderDetails.deliveries?.length || 0 })}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!riderDetails.deliveries || riderDetails.deliveries.length === 0 ? (
                    <p className="text-gray-500 text-center py-6">
                      {t('riders:no_deliveries')}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {riderDetails.deliveries.slice(0, 5).map((delivery) => (
                        <div
                          key={delivery.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                        >
                          <div>
                            <p className="font-medium">Order #{delivery.id}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {delivery.deliveryAddress}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(delivery.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-[#2D8659]">
                              {delivery.total.toLocaleString()} FCFA
                            </p>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(delivery.status)}`}
                            >
                              {delivery.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
