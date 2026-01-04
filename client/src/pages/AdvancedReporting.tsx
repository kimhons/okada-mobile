import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileText, Calendar, Play, Download, Plus, Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function AdvancedReporting() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<number | null>(null);

  // Form states
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportType, setReportType] = useState<string>("orders");
  const [scheduleName, setScheduleName] = useState("");
  const [frequency, setFrequency] = useState<string>("weekly");
  const [recipients, setRecipients] = useState("");
  const [format, setFormat] = useState<string>("pdf");

  // Queries
  const { data: reports, isLoading: reportsLoading, refetch: refetchReports } = trpc.reports.getAllReports.useQuery({});
  const { data: scheduledReports, refetch: refetchScheduled } = trpc.reports.getAllScheduledReports.useQuery({});
  const { data: executionHistory } = trpc.advancedReports.getExecutionHistory.useQuery({});

  // Mutations
  const createReport = trpc.reports.createReport.useMutation({
    onSuccess: () => {
      toast.success("Report template created successfully");
      setIsCreateDialogOpen(false);
      resetCreateForm();
      refetchReports();
    },
    onError: (error) => {
      toast.error(`Failed to create report: ${error.message}`);
    },
  });

  const createScheduled = trpc.reports.createScheduledReport.useMutation({
    onSuccess: () => {
      toast.success("Scheduled report created successfully");
      setIsScheduleDialogOpen(false);
      resetScheduleForm();
      refetchScheduled();
    },
    onError: (error) => {
      toast.error(`Failed to schedule report: ${error.message}`);
    },
  });

  const executeReport = trpc.advancedReports.executeReport.useMutation({
    onSuccess: (data) => {
      toast.success(`Report executed successfully. ${data?.recordCount || 0} records generated.`);
      refetchReports();
    },
    onError: (error) => {
      toast.error(`Failed to execute report: ${error.message}`);
    },
  });

  const deleteReport = trpc.reports.deleteReport.useMutation({
    onSuccess: () => {
      toast.success("Report deleted successfully");
      refetchReports();
    },
    onError: (error) => {
      toast.error(`Failed to delete report: ${error.message}`);
    },
  });

  const resetCreateForm = () => {
    setReportName("");
    setReportDescription("");
    setReportType("orders");
  };

  const resetScheduleForm = () => {
    setScheduleName("");
    setFrequency("weekly");
    setRecipients("");
    setFormat("pdf");
    setSelectedReport(null);
  };

  const handleCreateReport = () => {
    if (!reportName.trim()) {
      toast.error("Please enter a report name");
      return;
    }

    createReport.mutate({
      name: reportName,
      description: reportDescription,
      reportType: reportType as any,
      isPublic: false,
    });
  };

  const handleScheduleReport = () => {
    if (!selectedReport) {
      toast.error("Please select a report");
      return;
    }
    if (!scheduleName.trim()) {
      toast.error("Please enter a schedule name");
      return;
    }
    if (!recipients.trim()) {
      toast.error("Please enter recipient email addresses");
      return;
    }

    createScheduled.mutate({
      reportId: selectedReport,
      name: scheduleName,
      frequency: frequency as "daily" | "weekly" | "monthly" | "quarterly",
      time: "09:00",
      recipients,
      format: format as "pdf" | "csv" | "excel",
    });
  };

  const handleExecuteReport = (reportId: number) => {
    executeReport.mutate({ reportId });
  };

  const handleDeleteReport = (reportId: number) => {
    if (confirm("Are you sure you want to delete this report?")) {
      deleteReport.mutate({ id: reportId });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Success</Badge>;
      case "failed":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Running</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFormatBadge = (fmt: string) => {
    const colors: Record<string, string> = {
      pdf: "bg-red-100 text-red-800",
      excel: "bg-green-100 text-green-800",
      csv: "bg-blue-100 text-blue-800",
    };
    return <Badge className={colors[fmt] || ""}>{fmt.toUpperCase()}</Badge>;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Advanced Reporting Suite</h1>
            <p className="text-muted-foreground">Create custom reports, schedule automated delivery, and export in multiple formats</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Custom Report</DialogTitle>
                  <DialogDescription>
                    Define a new report template with custom filters and metrics
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="reportName">Report Name</Label>
                    <Input
                      id="reportName"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="e.g., Monthly Revenue Summary"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reportDescription">Description</Label>
                    <Textarea
                      id="reportDescription"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Describe what this report shows..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="reportType">Report Type</Label>
                    <Select value={reportType} onValueChange={setReportType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="orders">Orders</SelectItem>
                        <SelectItem value="revenue">Revenue</SelectItem>
                        <SelectItem value="riders">Riders</SelectItem>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="products">Products</SelectItem>
                        <SelectItem value="incidents">Incidents</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="training">Training</SelectItem>
                        <SelectItem value="custom">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateReport} disabled={createReport.isPending}>
                    {createReport.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Create Report
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Automated Report</DialogTitle>
                  <DialogDescription>
                    Set up automatic report generation and email delivery
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="selectReport">Select Report</Label>
                    <Select value={selectedReport?.toString()} onValueChange={(val) => setSelectedReport(Number(val))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a report template" />
                      </SelectTrigger>
                      <SelectContent>
                        {reports?.map((report) => (
                          <SelectItem key={report.id} value={report.id.toString()}>
                            {report.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="scheduleName">Schedule Name</Label>
                    <Input
                      id="scheduleName"
                      value={scheduleName}
                      onChange={(e) => setScheduleName(e.target.value)}
                      placeholder="e.g., Weekly Sales Report"
                    />
                  </div>
                  <div>
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={frequency} onValueChange={setFrequency}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="recipients">Recipients (comma-separated emails)</Label>
                    <Input
                      id="recipients"
                      value={recipients}
                      onChange={(e) => setRecipients(e.target.value)}
                      placeholder="admin@okada.com, manager@okada.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="format">Export Format</Label>
                    <Select value={format} onValueChange={setFormat}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleScheduleReport} disabled={createScheduled.isPending}>
                    {createScheduled.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Schedule Report
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="reports" className="space-y-4">
          <TabsList>
            <TabsTrigger value="reports">Report Templates</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            <TabsTrigger value="history">Execution History</TabsTrigger>
          </TabsList>

          <TabsContent value="reports" className="space-y-4">
            {reportsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : reports && reports.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                  <Card key={report.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <FileText className="w-8 h-8 text-blue-500" />
                        <Badge variant="outline">{report.reportType}</Badge>
                      </div>
                      <CardTitle className="text-lg">{report.name}</CardTitle>
                      <CardDescription>{report.description || "No description"}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleExecuteReport(report.id)}
                          disabled={executeReport.isPending}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Run
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedReport(report.id);
                            setIsScheduleDialogOpen(true);
                          }}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          Schedule
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteReport(report.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No report templates yet</p>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            {scheduledReports && scheduledReports.length > 0 ? (
              <div className="grid gap-4">
                {scheduledReports.map((schedule) => (
                  <Card key={schedule.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{schedule.name}</CardTitle>
                          <CardDescription>
                            Report ID: {schedule.reportId} • {schedule.frequency} • {getFormatBadge(schedule.format || "pdf")}
                          </CardDescription>
                        </div>
                        <Badge variant={schedule.isActive ? "default" : "secondary"}>
                          {schedule.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>Next run: {schedule.nextRunAt ? new Date(schedule.nextRunAt).toLocaleString() : "Not scheduled"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Recipients:</span>
                          <span>{schedule.recipients}</span>
                        </div>
                        {schedule.lastRunAt && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">Last run:</span>
                            <span>{new Date(schedule.lastRunAt).toLocaleString()}</span>
                            {schedule.lastStatus && getStatusBadge(schedule.lastStatus)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No scheduled reports yet</p>
                  <Button onClick={() => setIsScheduleDialogOpen(true)}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Schedule Your First Report
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            {executionHistory && executionHistory.length > 0 ? (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="p-4 font-medium">Report ID</th>
                          <th className="p-4 font-medium">Type</th>
                          <th className="p-4 font-medium">Status</th>
                          <th className="p-4 font-medium">Records</th>
                          <th className="p-4 font-medium">Format</th>
                          <th className="p-4 font-medium">Duration</th>
                          <th className="p-4 font-medium">Executed At</th>
                          <th className="p-4 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {executionHistory.map((execution) => (
                          <tr key={execution.id} className="border-b hover:bg-muted/50">
                            <td className="p-4">{execution.reportId || "-"}</td>
                            <td className="p-4">
                              <Badge variant="outline">{execution.executionType}</Badge>
                            </td>
                            <td className="p-4">{getStatusBadge(execution.status)}</td>
                            <td className="p-4">{execution.recordCount?.toLocaleString() || "-"}</td>
                            <td className="p-4">{getFormatBadge(execution.format || "unknown")}</td>
                            <td className="p-4">{execution.duration ? `${execution.duration}s` : "-"}</td>
                            <td className="p-4">{new Date(execution.startedAt).toLocaleString()}</td>
                            <td className="p-4">
                              {execution.fileUrl && execution.status === "success" && (
                                <Button size="sm" variant="ghost">
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Clock className="w-12 h-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No execution history yet</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
