import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, FileCheck, AlertTriangle, CheckCircle2, Clock, RefreshCw, Scale, FileWarning, Calendar } from "lucide-react";

const AREAS = [
  { value: "data_privacy", label: "Data Privacy" },
  { value: "financial", label: "Financial" },
  { value: "tax", label: "Tax" },
  { value: "labor", label: "Labor" },
  { value: "consumer_protection", label: "Consumer Protection" },
  { value: "licensing", label: "Licensing" },
];

const CHECK_TYPES = [
  { value: "automated", label: "Automated" },
  { value: "manual", label: "Manual" },
  { value: "audit", label: "Audit" },
];

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "quarterly", label: "Quarterly" },
  { value: "annually", label: "Annually" },
];

const CHECK_STATUSES = [
  { value: "compliant", label: "Compliant", color: "bg-green-500" },
  { value: "non_compliant", label: "Non-Compliant", color: "bg-red-500" },
  { value: "pending_review", label: "Pending Review", color: "bg-yellow-500" },
  { value: "remediation", label: "In Remediation", color: "bg-orange-500" },
];

const VIOLATION_SEVERITIES = [
  { value: "minor", label: "Minor", color: "bg-blue-500" },
  { value: "moderate", label: "Moderate", color: "bg-yellow-500" },
  { value: "major", label: "Major", color: "bg-orange-500" },
  { value: "critical", label: "Critical", color: "bg-red-500" },
];

const REMEDIATION_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "overdue", label: "Overdue" },
];

export default function ComplianceCenter() {
  const [activeTab, setActiveTab] = useState("checks");
  const [isCreateCheckOpen, setIsCreateCheckOpen] = useState(false);
  const [isCreateViolationOpen, setIsCreateViolationOpen] = useState(false);
  const [isEditCheckOpen, setIsEditCheckOpen] = useState(false);
  const [selectedCheck, setSelectedCheck] = useState<any>(null);
  const [filterArea, setFilterArea] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Check form state
  const [checkName, setCheckName] = useState("");
  const [checkDescription, setCheckDescription] = useState("");
  const [checkArea, setCheckArea] = useState<string>("data_privacy");
  const [checkRegulation, setCheckRegulation] = useState("");
  const [checkType, setCheckType] = useState<string>("manual");
  const [checkFrequency, setCheckFrequency] = useState<string>("monthly");
  const [checkStatus, setCheckStatus] = useState<string>("pending_review");
  
  // Violation form state
  const [violationCheckId, setViolationCheckId] = useState<number | null>(null);
  const [violationDescription, setViolationDescription] = useState("");
  const [violationSeverity, setViolationSeverity] = useState<string>("moderate");
  const [violationRemediationPlan, setViolationRemediationPlan] = useState("");
  
  const utils = trpc.useUtils();
  
  const { data: checks, isLoading: checksLoading } = trpc.compliance.listChecks.useQuery({
    area: filterArea === "all" ? undefined : filterArea,
    status: filterStatus === "all" ? undefined : filterStatus,
  });
  
  const { data: violations, isLoading: violationsLoading } = trpc.compliance.listViolations.useQuery({});
  
  const createCheckMutation = trpc.compliance.createCheck.useMutation({
    onSuccess: () => {
      toast.success("Compliance check created successfully");
      setIsCreateCheckOpen(false);
      resetCheckForm();
      utils.compliance.listChecks.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateCheckMutation = trpc.compliance.updateCheck.useMutation({
    onSuccess: () => {
      toast.success("Compliance check updated successfully");
      setIsEditCheckOpen(false);
      setSelectedCheck(null);
      utils.compliance.listChecks.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const createViolationMutation = trpc.compliance.createViolation.useMutation({
    onSuccess: () => {
      toast.success("Violation reported successfully");
      setIsCreateViolationOpen(false);
      resetViolationForm();
      utils.compliance.listViolations.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateViolationMutation = trpc.compliance.updateViolation.useMutation({
    onSuccess: () => {
      toast.success("Violation updated successfully");
      utils.compliance.listViolations.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const resetCheckForm = () => {
    setCheckName("");
    setCheckDescription("");
    setCheckArea("data_privacy");
    setCheckRegulation("");
    setCheckType("manual");
    setCheckFrequency("monthly");
    setCheckStatus("pending_review");
  };
  
  const resetViolationForm = () => {
    setViolationCheckId(null);
    setViolationDescription("");
    setViolationSeverity("moderate");
    setViolationRemediationPlan("");
  };
  
  const handleCreateCheck = () => {
    createCheckMutation.mutate({
      name: checkName,
      description: checkDescription,
      area: checkArea as any,
      regulation: checkRegulation,
      checkType: checkType as any,
      frequency: checkFrequency as any,
      status: checkStatus as any,
    });
  };
  
  const handleEditCheck = (check: any) => {
    setSelectedCheck(check);
    setCheckName(check.name);
    setCheckDescription(check.description || "");
    setCheckArea(check.area);
    setCheckRegulation(check.regulation || "");
    setCheckType(check.checkType);
    setCheckFrequency(check.frequency);
    setCheckStatus(check.status);
    setIsEditCheckOpen(true);
  };
  
  const handleUpdateCheck = () => {
    if (!selectedCheck) return;
    updateCheckMutation.mutate({
      id: selectedCheck.id,
      name: checkName,
      description: checkDescription,
      area: checkArea as any,
      regulation: checkRegulation,
      checkType: checkType as any,
      frequency: checkFrequency as any,
      status: checkStatus as any,
    });
  };
  
  const handleCreateViolation = () => {
    if (!violationCheckId) return;
    createViolationMutation.mutate({
      checkId: violationCheckId,
      description: violationDescription,
      severity: violationSeverity as any,
      remediationPlan: violationRemediationPlan,
    });
  };
  
  const handleResolveViolation = (id: number) => {
    updateViolationMutation.mutate({
      id,
      remediationStatus: "completed",
      resolvedAt: new Date(),
    });
  };
  
  const getStatusBadge = (status: string) => {
    const config = CHECK_STATUSES.find(s => s.value === status);
    return (
      <Badge className={`${config?.color || "bg-gray-500"} text-white`}>
        {config?.label || status}
      </Badge>
    );
  };
  
  const getSeverityBadge = (severity: string) => {
    const config = VIOLATION_SEVERITIES.find(s => s.value === severity);
    return (
      <Badge className={`${config?.color || "bg-gray-500"} text-white`}>
        {config?.label || severity}
      </Badge>
    );
  };
  
  // Calculate stats
  const compliantCount = checks?.filter((c: any) => c.status === "compliant").length || 0;
  const nonCompliantCount = checks?.filter((c: any) => c.status === "non_compliant").length || 0;
  const pendingCount = checks?.filter((c: any) => c.status === "pending_review").length || 0;
  const openViolations = violations?.filter((v: any) => v.remediationStatus !== "completed").length || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Compliance Center</h1>
            <p className="text-muted-foreground">
              Manage regulatory compliance and audit requirements
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Compliant</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{compliantCount}</div>
              <p className="text-xs text-muted-foreground">Checks passing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Non-Compliant</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{nonCompliantCount}</div>
              <p className="text-xs text-muted-foreground">Require action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">Awaiting assessment</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Open Violations</CardTitle>
              <FileWarning className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{openViolations}</div>
              <p className="text-xs text-muted-foreground">Need remediation</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="checks">Compliance Checks</TabsTrigger>
              <TabsTrigger value="violations">Violations</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              {activeTab === "checks" && (
                <Dialog open={isCreateCheckOpen} onOpenChange={setIsCreateCheckOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetCheckForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Check
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create Compliance Check</DialogTitle>
                      <DialogDescription>
                        Define a new compliance requirement to track
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Check Name</Label>
                        <Input
                          value={checkName}
                          onChange={(e) => setCheckName(e.target.value)}
                          placeholder="e.g., GDPR Data Retention Policy"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                          value={checkDescription}
                          onChange={(e) => setCheckDescription(e.target.value)}
                          placeholder="Describe the compliance requirement..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Area</Label>
                          <Select value={checkArea} onValueChange={setCheckArea}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {AREAS.map((area) => (
                                <SelectItem key={area.value} value={area.value}>
                                  {area.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Check Type</Label>
                          <Select value={checkType} onValueChange={setCheckType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CHECK_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Frequency</Label>
                          <Select value={checkFrequency} onValueChange={setCheckFrequency}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {FREQUENCIES.map((freq) => (
                                <SelectItem key={freq.value} value={freq.value}>
                                  {freq.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Initial Status</Label>
                          <Select value={checkStatus} onValueChange={setCheckStatus}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CHECK_STATUSES.map((stat) => (
                                <SelectItem key={stat.value} value={stat.value}>
                                  {stat.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Regulation Reference</Label>
                        <Input
                          value={checkRegulation}
                          onChange={(e) => setCheckRegulation(e.target.value)}
                          placeholder="e.g., GDPR Article 17"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateCheckOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateCheck} disabled={!checkName || createCheckMutation.isPending}>
                        {createCheckMutation.isPending ? "Creating..." : "Create Check"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {activeTab === "violations" && (
                <Dialog open={isCreateViolationOpen} onOpenChange={setIsCreateViolationOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetViolationForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Report Violation
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Report Compliance Violation</DialogTitle>
                      <DialogDescription>
                        Document a compliance violation for tracking
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Related Check</Label>
                        <Select
                          value={violationCheckId?.toString() || ""}
                          onValueChange={(v) => setViolationCheckId(parseInt(v))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a compliance check" />
                          </SelectTrigger>
                          <SelectContent>
                            {checks?.map((check: any) => (
                              <SelectItem key={check.id} value={check.id.toString()}>
                                {check.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Violation Description</Label>
                        <Textarea
                          value={violationDescription}
                          onChange={(e) => setViolationDescription(e.target.value)}
                          placeholder="Describe the violation in detail..."
                          rows={3}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Severity</Label>
                        <Select value={violationSeverity} onValueChange={setViolationSeverity}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {VIOLATION_SEVERITIES.map((sev) => (
                              <SelectItem key={sev.value} value={sev.value}>
                                {sev.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label>Remediation Plan</Label>
                        <Textarea
                          value={violationRemediationPlan}
                          onChange={(e) => setViolationRemediationPlan(e.target.value)}
                          placeholder="Describe how this will be fixed..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateViolationOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateViolation}
                        disabled={!violationCheckId || !violationDescription || createViolationMutation.isPending}
                      >
                        {createViolationMutation.isPending ? "Reporting..." : "Report Violation"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <TabsContent value="checks" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <Label>Filters:</Label>
              <Select value={filterArea} onValueChange={setFilterArea}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  {AREAS.map((area) => (
                    <SelectItem key={area.value} value={area.value}>
                      {area.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {CHECK_STATUSES.map((stat) => (
                    <SelectItem key={stat.value} value={stat.value}>
                      {stat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Checks</CardTitle>
                <CardDescription>
                  Track regulatory requirements and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {checksLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : checks && checks.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Check</TableHead>
                        <TableHead>Area</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Next Check</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checks.map((check: any) => (
                        <TableRow key={check.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{check.name}</div>
                              <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                                {check.regulation || "No regulation reference"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {check.area.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell className="capitalize">{check.checkType}</TableCell>
                          <TableCell className="capitalize">{check.frequency}</TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(check.status)}
                          </TableCell>
                          <TableCell>
                            {check.nextCheckDate
                              ? new Date(check.nextCheckDate).toLocaleDateString()
                              : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditCheck(check)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Scale className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No compliance checks</h3>
                    <p className="text-muted-foreground">
                      Add compliance requirements to track
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="violations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Violations</CardTitle>
                <CardDescription>
                  Track and remediate compliance violations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {violationsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : violations && violations.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center">Severity</TableHead>
                        <TableHead>Remediation Status</TableHead>
                        <TableHead>Reported</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {violations.map((violation: any) => (
                        <TableRow key={violation.id}>
                          <TableCell>
                            <div className="max-w-[300px] truncate">
                              {violation.description}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {getSeverityBadge(violation.severity)}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {violation.remediationStatus.replace("_", " ")}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(violation.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            {violation.remediationStatus !== "completed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleResolveViolation(violation.id)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileCheck className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No violations</h3>
                    <p className="text-muted-foreground">
                      All compliance checks are passing
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Check Dialog */}
        <Dialog open={isEditCheckOpen} onOpenChange={setIsEditCheckOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Compliance Check</DialogTitle>
              <DialogDescription>
                Update compliance check details and status
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Check Name</Label>
                <Input
                  value={checkName}
                  onChange={(e) => setCheckName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={checkDescription}
                  onChange={(e) => setCheckDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Area</Label>
                  <Select value={checkArea} onValueChange={setCheckArea}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AREAS.map((area) => (
                        <SelectItem key={area.value} value={area.value}>
                          {area.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={checkStatus} onValueChange={setCheckStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHECK_STATUSES.map((stat) => (
                        <SelectItem key={stat.value} value={stat.value}>
                          {stat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Check Type</Label>
                  <Select value={checkType} onValueChange={setCheckType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHECK_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Frequency</Label>
                  <Select value={checkFrequency} onValueChange={setCheckFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FREQUENCIES.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Regulation Reference</Label>
                <Input
                  value={checkRegulation}
                  onChange={(e) => setCheckRegulation(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditCheckOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCheck} disabled={!checkName || updateCheckMutation.isPending}>
                {updateCheckMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
