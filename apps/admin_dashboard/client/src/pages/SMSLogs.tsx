import { useState } from "react";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  MessageSquare, 
  Search, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Send,
  AlertTriangle,
  Phone,
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

type SMSStatus = "sent" | "delivered" | "failed" | "pending" | "rejected";

interface SMSLog {
  id: number;
  recipient: string;
  message: string;
  status: SMSStatus;
  messageId: string | null;
  cost: string | null;
  errorMessage: string | null;
  sentAt: Date | string;
  deliveredAt: Date | string | null;
  orderId: number | null;
  notificationType: string | null;
  provider: string | null;
  createdAt: Date | string;
}

const STATUS_CONFIG: Record<SMSStatus, { label: string; color: string; icon: React.ReactNode }> = {
  sent: { label: "Sent", color: "bg-blue-100 text-blue-700", icon: <Send className="h-3 w-3" /> },
  delivered: { label: "Delivered", color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-3 w-3" /> },
  failed: { label: "Failed", color: "bg-red-100 text-red-700", icon: <XCircle className="h-3 w-3" /> },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="h-3 w-3" /> },
  rejected: { label: "Rejected", color: "bg-orange-100 text-orange-700", icon: <AlertTriangle className="h-3 w-3" /> },
};

export default function SMSLogs() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [recipientSearch, setRecipientSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<SMSLog | null>(null);

  const { data: logs = [], isLoading, refetch } = trpc.smsLogs.list.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    recipient: recipientSearch || undefined,
    limit: 100,
  });

  const { data: stats } = trpc.smsLogs.getStats.useQuery();

  const retryMutation = trpc.smsLogs.retry.useMutation({
    onSuccess: () => {
      toast.success("SMS queued for retry");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to retry SMS");
    },
  });

  const handleRetry = (id: number) => {
    retryMutation.mutate({ id });
  };

  const formatDate = (date: Date | string) => {
    return format(new Date(date), "MMM d, yyyy h:mm a");
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    return message.length > maxLength ? message.substring(0, maxLength) + "..." : message;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">SMS Logs</h1>
          <p className="text-gray-600 mt-1">Track and manage SMS delivery status</p>
        </div>
        <Button onClick={() => refetch()} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats?.total || 0}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-green-600">{stats?.delivered || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sent</p>
                <p className="text-2xl font-bold text-blue-600">{stats?.sent || 0}</p>
              </div>
              <Send className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats?.pending || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Failed</p>
                <p className="text-2xl font-bold text-red-600">{stats?.failed || 0}</p>
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
                placeholder="Search by phone number..."
                value={recipientSearch}
                onChange={(e) => setRecipientSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* SMS Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>SMS Messages ({logs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2D8659] mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading SMS logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No SMS logs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Sent At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => {
                    const statusConfig = STATUS_CONFIG[log.status as SMSStatus];
                    return (
                      <TableRow key={log.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="font-mono">{log.recipient}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-gray-600">
                            {truncateMessage(log.message)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig.color} flex items-center gap-1 w-fit`}>
                            {statusConfig.icon}
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm capitalize">
                            {log.notificationType?.replace(/_/g, " ") || "General"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(log.sentAt)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedLog(log as SMSLog)}
                            >
                              View
                            </Button>
                            {(log.status === "failed" || log.status === "rejected") && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRetry(log.id)}
                                disabled={retryMutation.isPending}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <RefreshCw className="h-3 w-3 mr-1" />
                                Retry
                              </Button>
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

      {/* SMS Detail Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Details
            </DialogTitle>
            <DialogDescription>
              Full details for this SMS message
            </DialogDescription>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Recipient</label>
                  <p className="font-mono">{selectedLog.recipient}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Badge className={STATUS_CONFIG[selectedLog.status].color}>
                      {STATUS_CONFIG[selectedLog.status].label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Sent At</label>
                  <p>{formatDate(selectedLog.sentAt)}</p>
                </div>
                {selectedLog.deliveredAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Delivered At</label>
                    <p>{formatDate(selectedLog.deliveredAt)}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-500">Provider</label>
                  <p className="capitalize">{selectedLog.provider || "Unknown"}</p>
                </div>
                {selectedLog.cost && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cost</label>
                    <p>{selectedLog.cost}</p>
                  </div>
                )}
                {selectedLog.orderId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Order ID</label>
                    <p>#{selectedLog.orderId}</p>
                  </div>
                )}
                {selectedLog.messageId && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Message ID</label>
                    <p className="font-mono text-xs">{selectedLog.messageId}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg text-sm">
                  {selectedLog.message}
                </div>
              </div>

              {selectedLog.errorMessage && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <label className="text-sm font-medium text-red-700">Error Message</label>
                  <p className="text-sm text-red-600 mt-1">{selectedLog.errorMessage}</p>
                </div>
              )}

              {(selectedLog.status === "failed" || selectedLog.status === "rejected") && (
                <div className="flex justify-end">
                  <Button
                    onClick={() => {
                      handleRetry(selectedLog.id);
                      setSelectedLog(null);
                    }}
                    disabled={retryMutation.isPending}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Delivery
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
