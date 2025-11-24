import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { trpc } from "@/lib/trpc";
import { Receipt, DollarSign, TrendingUp, CheckCircle, Search, ArrowUpDown, ArrowUp, ArrowDown, X, Download, FileSpreadsheet, Eye } from "lucide-react";
import { toast } from "sonner";

export default function TransactionHistory() {
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount" | "type" | "status">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [isBulkActionDialogOpen, setIsBulkActionDialogOpen] = useState(false);

  const exportCSV = trpc.financial.exportTransactionsCSV.useMutation({
    onSuccess: (data) => {
      // Create a blob and download
      const blob = new Blob([data.content], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Exported ${data.count} transactions to CSV`);
    },
    onError: () => {
      toast.error("Failed to export transactions");
    },
  });

  const exportExcel = trpc.financial.exportTransactionsExcel.useMutation({
    onSuccess: (data) => {
      // For Excel, we'll use the same CSV format for now
      // In a real app, you'd use a library like xlsx to generate proper Excel files
      const headers = Object.keys(data.data[0] || {});
      const rows = data.data.map(row => headers.map(h => row[h as keyof typeof row]));
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(`Exported ${data.count} transactions to Excel`);
    },
    onError: () => {
      toast.error("Failed to export transactions");
    },
  });

  const handleExportCSV = () => {
    exportCSV.mutate({
      type: typeFilter || undefined,
      status: statusFilter || undefined,
      search: searchQuery || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      minAmount: minAmount ? parseFloat(minAmount) * 100 : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) * 100 : undefined,
    });
  };

  const handleExportExcel = () => {
    exportExcel.mutate({
      type: typeFilter || undefined,
      status: statusFilter || undefined,
      search: searchQuery || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      minAmount: minAmount ? parseFloat(minAmount) * 100 : undefined,
      maxAmount: maxAmount ? parseFloat(maxAmount) * 100 : undefined,
    });
  };

  const bulkUpdateStatus = trpc.financial.bulkUpdateTransactionStatus.useMutation({
    onSuccess: (data) => {
      toast.success(`Updated ${data.count} transactions`);
      setSelectedIds([]);
      setIsBulkActionDialogOpen(false);
      refetch();
    },
    onError: () => {
      toast.error("Failed to update transactions");
    },
  });

  const bulkRefund = trpc.financial.bulkRefundTransactions.useMutation({
    onSuccess: (data) => {
      toast.success(`Created ${data.count} refund transactions`);
      setSelectedIds([]);
      setIsBulkActionDialogOpen(false);
      refetch();
    },
    onError: () => {
      toast.error("Failed to create refunds");
    },
  });

  const bulkReconcile = trpc.financial.bulkReconcileTransactions.useMutation({
    onSuccess: (data) => {
      toast.success(`Reconciled ${data.count} transactions`);
      setSelectedIds([]);
      setIsBulkActionDialogOpen(false);
      refetch();
    },
    onError: () => {
      toast.error("Failed to reconcile transactions");
    },
  });

  const handleBulkAction = () => {
    if (selectedIds.length === 0) {
      toast.error("Please select at least one transaction");
      return;
    }
    setIsBulkActionDialogOpen(true);
  };

  const executeBulkAction = () => {
    if (bulkAction === "update_status") {
      bulkUpdateStatus.mutate({ ids: selectedIds, status: "completed" });
    } else if (bulkAction === "refund") {
      bulkRefund.mutate({ ids: selectedIds });
    } else if (bulkAction === "reconcile") {
      bulkReconcile.mutate({ ids: selectedIds });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === transactions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(transactions.map(t => t.id));
    }
  };

  const toggleSelectTransaction = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const generateReceipt = trpc.financial.generateTransactionReceipt.useMutation({
    onSuccess: (data) => {
      // Create a blob from HTML and open in new window for printing/saving as PDF
      const blob = new Blob([data.html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        newWindow.onload = () => {
          newWindow.print();
        };
      }
      toast.success("Receipt generated successfully");
    },
    onError: () => {
      toast.error("Failed to generate receipt");
    },
  });

  const handleDownloadReceipt = () => {
    if (selectedTransaction) {
      generateReceipt.mutate({ transactionId: selectedTransaction.id });
    }
  };

  const { data: transactions = [], isLoading, refetch } = trpc.financial.getAllTransactions.useQuery({
    type: typeFilter || undefined,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
    startDate: startDate ? new Date(startDate) : undefined,
    endDate: endDate ? new Date(endDate) : undefined,
    minAmount: minAmount ? parseFloat(minAmount) * 100 : undefined, // Convert to cents
    maxAmount: maxAmount ? parseFloat(maxAmount) * 100 : undefined, // Convert to cents
    sortBy,
    sortDirection,
  });

  // Calculate stats
  const totalTransactions = transactions.length;
  const completedTransactions = transactions.filter(t => t.status === "completed").length;
  const pendingTransactions = transactions.filter(t => t.status === "pending").length;
  const totalAmount = transactions
    .filter(t => t.status === "completed")
    .reduce((sum, t) => sum + t.amount, 0);

  const formatCurrency = (amount: number) => {
    return `${(amount / 100).toLocaleString()} FCFA`;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      pending: "secondary",
      failed: "destructive",
      cancelled: "outline",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      order_payment: "bg-blue-100 text-blue-800",
      payout: "bg-green-100 text-green-800",
      refund: "bg-red-100 text-red-800",
      commission: "bg-purple-100 text-purple-800",
      fee: "bg-yellow-100 text-yellow-800",
      adjustment: "bg-gray-100 text-gray-800",
    };
    return (
      <Badge className={colors[type] || "bg-gray-100 text-gray-800"} variant="outline">
        {type.replace("_", " ")}
      </Badge>
    );
  };

  const toggleSort = (column: "date" | "amount" | "type" | "status") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  const getSortIcon = (column: "date" | "amount" | "type" | "status") => {
    if (sortBy !== column) {
      return <ArrowUpDown className="h-4 w-4 ml-1 inline" />;
    }
    return sortDirection === "asc" ? 
      <ArrowUp className="h-4 w-4 ml-1 inline" /> : 
      <ArrowDown className="h-4 w-4 ml-1 inline" />;
  };

  const clearFilters = () => {
    setTypeFilter("");
    setStatusFilter("");
    setSearchQuery("");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    setSortBy("date");
    setSortDirection("desc");
  };

  const hasActiveFilters = typeFilter || statusFilter || searchQuery || startDate || endDate || minAmount || maxAmount;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground">View and filter all financial transactions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Successfully processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTransactions}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
            <p className="text-xs text-muted-foreground">
              Completed transactions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filters</CardTitle>
              <CardDescription>Filter and sort transactions</CardDescription>
            </div>
            <div className="flex gap-2">
              {selectedIds.length > 0 && (
                <Button 
                  variant="default" 
                  size="sm" 
                  onClick={handleBulkAction}
                >
                  Bulk Actions ({selectedIds.length})
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportCSV}
                disabled={exportCSV.isPending || transactions.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleExportExcel}
                disabled={exportExcel.isPending || transactions.length === 0}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Transaction ID or description"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="order_payment">Order Payment</SelectItem>
                  <SelectItem value="payout">Payout</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="commission">Commission</SelectItem>
                  <SelectItem value="fee">Fee</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Min Amount */}
            <div className="space-y-2">
              <Label>Min Amount (FCFA)</Label>
              <Input
                type="number"
                placeholder="0"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>

            {/* Max Amount */}
            <div className="space-y-2">
              <Label>Max Amount (FCFA)</Label>
              <Input
                type="number"
                placeholder="1000000"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transactions ({transactions.length})</CardTitle>
          <CardDescription>
            {hasActiveFilters ? "Filtered results" : "All transactions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">Loading transactions...</p>
            </div>
          ) : transactions.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p className="text-muted-foreground">No transactions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === transactions.length && transactions.length > 0}
                      onChange={toggleSelectAll}
                      className="cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleSort("type")}
                  >
                    Type {getSortIcon("type")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleSort("amount")}
                  >
                    Amount {getSortIcon("amount")}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleSort("status")}
                  >
                    Status {getSortIcon("status")}
                  </TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => toggleSort("date")}
                  >
                    Date {getSortIcon("date")}
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(transaction.id)}
                        onChange={() => toggleSelectTransaction(transaction.id)}
                        className="cursor-pointer"
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {transaction.transactionId}
                    </TableCell>
                    <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {transaction.description || "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTransaction(transaction);
                          setIsDetailModalOpen(true);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Transaction Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Transaction Details</DialogTitle>
                <DialogDescription>
                  Complete information about transaction {selectedTransaction?.transactionId}
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadReceipt}
                disabled={generateReceipt.isPending}
              >
                <Download className="h-4 w-4 mr-2" />
                {generateReceipt.isPending ? "Generating..." : "Download Receipt"}
              </Button>
            </div>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Transaction ID</Label>
                    <p className="font-mono text-sm mt-1">{selectedTransaction.transactionId}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Type</Label>
                    <div className="mt-1">{getTypeBadge(selectedTransaction.type)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Amount</Label>
                    <p className="font-semibold text-lg mt-1">{formatCurrency(selectedTransaction.amount)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Created At</Label>
                    <p className="mt-1">{new Date(selectedTransaction.createdAt).toLocaleString()}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Updated At</Label>
                    <p className="mt-1">{new Date(selectedTransaction.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Related Entities */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Related Entities</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">User ID</Label>
                    <p className="font-mono text-sm mt-1">{selectedTransaction.userId || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Order ID</Label>
                    <p className="font-mono text-sm mt-1">{selectedTransaction.orderId || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Payout ID</Label>
                    <p className="font-mono text-sm mt-1">{selectedTransaction.payoutId || '-'}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Description</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedTransaction.description || 'No description provided'}
                </p>
              </div>

              {/* Metadata */}
              {selectedTransaction.metadata && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Metadata</h3>
                    <div className="bg-muted p-4 rounded-lg">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(selectedTransaction.metadata, null, 2)}
                      </pre>
                    </div>
                  </div>
                </>
              )}

              {/* Transaction Timeline */}
              <Separator />
              <div>
                <h3 className="text-lg font-semibold mb-3">Transaction Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                    <div className="flex-1">
                      <p className="font-medium">Transaction Created</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedTransaction.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {selectedTransaction.updatedAt !== selectedTransaction.createdAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                      <div className="flex-1">
                        <p className="font-medium">Last Updated</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(selectedTransaction.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedTransaction.status === 'completed' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                      <div className="flex-1">
                        <p className="font-medium">Transaction Completed</p>
                        <p className="text-sm text-muted-foreground">
                          Successfully processed
                        </p>
                      </div>
                    </div>
                  )}
                  {selectedTransaction.status === 'failed' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />
                      <div className="flex-1">
                        <p className="font-medium">Transaction Failed</p>
                        <p className="text-sm text-muted-foreground">
                          Processing failed
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk Action Dialog */}
      <Dialog open={isBulkActionDialogOpen} onOpenChange={setIsBulkActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk Action</DialogTitle>
            <DialogDescription>
              Select an action to perform on {selectedIds.length} selected transaction(s)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={bulkAction} onValueChange={setBulkAction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="update_status">Mark as Completed</SelectItem>
                  <SelectItem value="refund">Create Refunds</SelectItem>
                  <SelectItem value="reconcile">Reconcile Transactions</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsBulkActionDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={executeBulkAction}
                disabled={!bulkAction || bulkUpdateStatus.isPending || bulkRefund.isPending || bulkReconcile.isPending}
              >
                {bulkUpdateStatus.isPending || bulkRefund.isPending || bulkReconcile.isPending ? "Processing..." : "Execute"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

