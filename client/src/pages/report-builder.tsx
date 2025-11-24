import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { BarChart3, Plus, Edit, Trash2, Play, Share2, Lock, Unlock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

const REPORT_TYPES = [
  { value: "orders", label: "Orders Report" },
  { value: "revenue", label: "Revenue Report" },
  { value: "users", label: "Users Report" },
  { value: "riders", label: "Riders Report" },
  { value: "products", label: "Products Report" },
  { value: "sellers", label: "Sellers Report" },
];

const CHART_TYPES = [
  { value: "table", label: "Table" },
  { value: "bar", label: "Bar Chart" },
  { value: "line", label: "Line Chart" },
  { value: "pie", label: "Pie Chart" },
];

export default function ReportBuilder() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  
  // Filters
  const [reportTypeFilter, setReportTypeFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [reportType, setReportType] = useState("");
  const [chartType, setChartType] = useState("table");
  const [isPublic, setIsPublic] = useState(false);

  const { data: reports, isLoading, refetch } = trpc.reports.getAllReports.useQuery({
    reportType: reportTypeFilter || undefined,
    search: searchQuery || undefined,
  });

  const createReportMutation = trpc.reports.createReport.useMutation();
  const updateReportMutation = trpc.reports.updateReport.useMutation();
  const deleteReportMutation = trpc.reports.deleteReport.useMutation();

  const handleCreate = () => {
    setName("");
    setDescription("");
    setReportType("");
    setChartType("table");
    setIsPublic(false);
    setCreateDialogOpen(true);
  };

  const confirmCreate = async () => {
    if (!name || !reportType) {
      toast.error("Name and report type are required");
      return;
    }

    try {
      await createReportMutation.mutateAsync({
        name,
        description: description || undefined,
        reportType,
        chartType,
        isPublic,
      });

      toast.success("Report created successfully");
      setCreateDialogOpen(false);
      refetch();
    } catch (error) {
      toast.error("Failed to create report");
    }
  };

  const handleEdit = (report: any) => {
    setSelectedReport(report);
    setName(report.name);
    setDescription(report.description || "");
    setReportType(report.reportType);
    setChartType(report.chartType || "table");
    setIsPublic(report.isPublic);
    setEditDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!selectedReport || !name || !reportType) {
      toast.error("Name and report type are required");
      return;
    }

    try {
      await updateReportMutation.mutateAsync({
        id: selectedReport.id,
        name,
        description: description || undefined,
        reportType,
        chartType,
        isPublic,
      });

      toast.success("Report updated successfully");
      setEditDialogOpen(false);
      setSelectedReport(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update report");
    }
  };

  const handleDelete = (report: any) => {
    setSelectedReport(report);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedReport) return;

    try {
      await deleteReportMutation.mutateAsync({ id: selectedReport.id });
      toast.success("Report deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedReport(null);
      refetch();
    } catch (error) {
      toast.error("Failed to delete report");
    }
  };

  const handleTogglePublic = async (report: any) => {
    try {
      await updateReportMutation.mutateAsync({
        id: report.id,
        isPublic: !report.isPublic,
      });
      toast.success(`Report ${report.isPublic ? "made private" : "shared with team"}`);
      refetch();
    } catch (error) {
      toast.error("Failed to update report");
    }
  };

  const handleRunReport = (report: any) => {
    toast.info(`Running report: ${report.name}...`);
    // In production, this would execute the report and show results
  };

  const clearFilters = () => {
    setReportTypeFilter("");
    setSearchQuery("");
  };

  // Stats
  const totalReports = reports?.length || 0;
  const publicReports = reports?.filter(r => r.isPublic).length || 0;
  const privateReports = totalReports - publicReports;
  const reportTypeCount = new Set(reports?.map(r => r.reportType)).size;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              Custom Report Builder
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage custom reports with filters and visualizations
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Report
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalReports}</div>
              <p className="text-xs text-muted-foreground">All custom reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Public Reports</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publicReports}</div>
              <p className="text-xs text-muted-foreground">Shared with team</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Private Reports</CardTitle>
              <Lock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{privateReports}</div>
              <p className="text-xs text-muted-foreground">Personal only</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Report Types</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportTypeCount}</div>
              <p className="text-xs text-muted-foreground">Different categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="search">Search</Label>
                <Input
                  id="search"
                  placeholder="Search reports..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportTypeFilter} onValueChange={setReportTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>My Reports</CardTitle>
            <CardDescription>
              {totalReports} {totalReports === 1 ? "report" : "reports"} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading reports...
              </div>
            ) : reports && reports.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Chart Type</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div className="font-medium">{report.name}</div>
                            {report.description && (
                              <div className="text-sm text-muted-foreground truncate max-w-md">
                                {report.description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {REPORT_TYPES.find(t => t.value === report.reportType)?.label || report.reportType}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {CHART_TYPES.find(t => t.value === report.chartType)?.label || "Table"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {report.isPublic ? (
                            <Badge variant="default">
                              <Share2 className="h-3 w-3 mr-1" />
                              Public
                            </Badge>
                          ) : (
                            <Badge variant="secondary">
                              <Lock className="h-3 w-3 mr-1" />
                              Private
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {format(new Date(report.createdAt), "MMM dd, yyyy")}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleRunReport(report)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleTogglePublic(report)}
                            >
                              {report.isPublic ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(report)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(report)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No reports found. Create your first custom report to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Report Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create Custom Report</DialogTitle>
            <DialogDescription>
              Define a new custom report with filters and visualization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Report Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Monthly Revenue Report"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this report shows..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="reportType">Report Type *</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="chartType">Visualization</Label>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHART_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="isPublic">Share with team (make public)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmCreate}
              disabled={createReportMutation.isPending}
            >
              {createReportMutation.isPending ? "Creating..." : "Create Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Report Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Report</DialogTitle>
            <DialogDescription>
              Update report configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Report Name *</Label>
              <Input
                id="edit-name"
                placeholder="e.g., Monthly Revenue Report"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                placeholder="Describe what this report shows..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="edit-reportType">Report Type *</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {REPORT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-chartType">Visualization</Label>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select chart type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CHART_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="h-4 w-4"
              />
              <Label htmlFor="edit-isPublic">Share with team (make public)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmEdit}
              disabled={updateReportMutation.isPending}
            >
              {updateReportMutation.isPending ? "Updating..." : "Update Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Report Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this report? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteReportMutation.isPending}
            >
              {deleteReportMutation.isPending ? "Deleting..." : "Delete Report"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

