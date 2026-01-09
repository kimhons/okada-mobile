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
import { toast } from "sonner";
import { Plus, Pencil, Trash2, AlertTriangle, Shield, TrendingUp, RefreshCw, AlertCircle, CheckCircle2 } from "lucide-react";

const CATEGORIES = [
  { value: "financial", label: "Financial" },
  { value: "operational", label: "Operational" },
  { value: "compliance", label: "Compliance" },
  { value: "security", label: "Security" },
  { value: "reputational", label: "Reputational" },
];

const SEVERITIES = [
  { value: "low", label: "Low", color: "bg-green-500" },
  { value: "medium", label: "Medium", color: "bg-yellow-500" },
  { value: "high", label: "High", color: "bg-orange-500" },
  { value: "critical", label: "Critical", color: "bg-red-500" },
];

const LIKELIHOODS = [
  { value: "rare", label: "Rare", score: 1 },
  { value: "unlikely", label: "Unlikely", score: 2 },
  { value: "possible", label: "Possible", score: 3 },
  { value: "likely", label: "Likely", score: 4 },
  { value: "certain", label: "Certain", score: 5 },
];

const STATUSES = [
  { value: "identified", label: "Identified" },
  { value: "assessed", label: "Assessed" },
  { value: "mitigating", label: "Mitigating" },
  { value: "resolved", label: "Resolved" },
  { value: "accepted", label: "Accepted" },
];

const MITIGATION_STATUSES = [
  { value: "not_started", label: "Not Started" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "ongoing", label: "Ongoing" },
];

export default function RiskManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<any>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("operational");
  const [severity, setSeverity] = useState<string>("medium");
  const [likelihood, setLikelihood] = useState<string>("possible");
  const [impactScore, setImpactScore] = useState(5);
  const [mitigationPlan, setMitigationPlan] = useState("");
  const [mitigationStatus, setMitigationStatus] = useState<string>("not_started");
  const [status, setStatus] = useState<string>("identified");
  
  const utils = trpc.useUtils();
  
  const { data: risks, isLoading } = trpc.riskAssessments.list.useQuery({
    category: filterCategory === "all" ? undefined : filterCategory,
    severity: filterSeverity === "all" ? undefined : filterSeverity,
  });
  
  const createMutation = trpc.riskAssessments.create.useMutation({
    onSuccess: () => {
      toast.success("Risk assessment created successfully");
      setIsCreateOpen(false);
      resetForm();
      utils.riskAssessments.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateMutation = trpc.riskAssessments.update.useMutation({
    onSuccess: () => {
      toast.success("Risk assessment updated successfully");
      setIsEditOpen(false);
      setSelectedRisk(null);
      utils.riskAssessments.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteMutation = trpc.riskAssessments.delete.useMutation({
    onSuccess: () => {
      toast.success("Risk assessment deleted successfully");
      utils.riskAssessments.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCategory("operational");
    setSeverity("medium");
    setLikelihood("possible");
    setImpactScore(5);
    setMitigationPlan("");
    setMitigationStatus("not_started");
    setStatus("identified");
  };
  
  const calculateRiskScore = () => {
    const severityScores: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };
    const likelihoodScore = LIKELIHOODS.find(l => l.value === likelihood)?.score || 3;
    return (severityScores[severity] || 2) * likelihoodScore * impactScore;
  };
  
  const handleCreate = () => {
    createMutation.mutate({
      title,
      description,
      category: category as any,
      severity: severity as any,
      likelihood: likelihood as any,
      impactScore,
      riskScore: calculateRiskScore(),
      mitigationPlan,
      mitigationStatus: mitigationStatus as any,
      status: status as any,
    });
  };
  
  const handleEdit = (risk: any) => {
    setSelectedRisk(risk);
    setTitle(risk.title);
    setDescription(risk.description || "");
    setCategory(risk.category);
    setSeverity(risk.severity);
    setLikelihood(risk.likelihood);
    setImpactScore(risk.impactScore);
    setMitigationPlan(risk.mitigationPlan || "");
    setMitigationStatus(risk.mitigationStatus);
    setStatus(risk.status);
    setIsEditOpen(true);
  };
  
  const handleUpdate = () => {
    if (!selectedRisk) return;
    updateMutation.mutate({
      id: selectedRisk.id,
      title,
      description,
      category: category as any,
      severity: severity as any,
      likelihood: likelihood as any,
      impactScore,
      riskScore: calculateRiskScore(),
      mitigationPlan,
      mitigationStatus: mitigationStatus as any,
      status: status as any,
    });
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this risk assessment?")) {
      deleteMutation.mutate({ id });
    }
  };
  
  const getSeverityBadge = (sev: string) => {
    const config = SEVERITIES.find(s => s.value === sev);
    return (
      <Badge className={`${config?.color} text-white`}>
        {config?.label || sev}
      </Badge>
    );
  };
  
  const getStatusBadge = (stat: string) => {
    const colors: Record<string, string> = {
      identified: "bg-blue-500",
      assessed: "bg-purple-500",
      mitigating: "bg-yellow-500",
      resolved: "bg-green-500",
      accepted: "bg-gray-500",
    };
    return (
      <Badge className={`${colors[stat] || "bg-gray-500"} text-white`}>
        {STATUSES.find(s => s.value === stat)?.label || stat}
      </Badge>
    );
  };
  
  const getRiskScoreColor = (score: number) => {
    if (score <= 20) return "text-green-500";
    if (score <= 40) return "text-yellow-500";
    if (score <= 60) return "text-orange-500";
    return "text-red-500";
  };
  
  // Calculate stats
  const criticalRisks = risks?.filter((r: any) => r.severity === "critical").length || 0;
  const highRisks = risks?.filter((r: any) => r.severity === "high").length || 0;
  const mitigatedRisks = risks?.filter((r: any) => r.status === "resolved" || r.status === "accepted").length || 0;
  const avgRiskScore = risks && risks.length > 0
    ? Math.round(risks.reduce((acc: number, r: any) => acc + r.riskScore, 0) / risks.length)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Risk Management</h1>
            <p className="text-muted-foreground">
              Identify, assess, and mitigate platform risks
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Add Risk Assessment
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Risk Assessment</DialogTitle>
                <DialogDescription>
                  Document and assess a new risk to the platform
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                <div className="grid gap-2">
                  <Label htmlFor="title">Risk Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Payment Gateway Downtime"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the risk in detail..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            {cat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Severity</Label>
                    <Select value={severity} onValueChange={setSeverity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SEVERITIES.map((sev) => (
                          <SelectItem key={sev.value} value={sev.value}>
                            {sev.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Likelihood</Label>
                    <Select value={likelihood} onValueChange={setLikelihood}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {LIKELIHOODS.map((lik) => (
                          <SelectItem key={lik.value} value={lik.value}>
                            {lik.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Impact Score (1-10)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={impactScore}
                      onChange={(e) => setImpactScore(parseInt(e.target.value) || 5)}
                    />
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Calculated Risk Score:</span>
                    <span className={`text-2xl font-bold ${getRiskScoreColor(calculateRiskScore())}`}>
                      {calculateRiskScore()}
                    </span>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Mitigation Plan</Label>
                  <Textarea
                    value={mitigationPlan}
                    onChange={(e) => setMitigationPlan(e.target.value)}
                    placeholder="Describe how this risk will be mitigated..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Mitigation Status</Label>
                    <Select value={mitigationStatus} onValueChange={setMitigationStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {MITIGATION_STATUSES.map((stat) => (
                          <SelectItem key={stat.value} value={stat.value}>
                            {stat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Risk Status</Label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((stat) => (
                          <SelectItem key={stat.value} value={stat.value}>
                            {stat.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!title || createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Assessment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Risks</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{criticalRisks}</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Risks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{highRisks}</div>
              <p className="text-xs text-muted-foreground">Need monitoring</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Mitigated</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{mitigatedRisks}</div>
              <p className="text-xs text-muted-foreground">Resolved or accepted</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getRiskScoreColor(avgRiskScore)}`}>
                {avgRiskScore}
              </div>
              <p className="text-xs text-muted-foreground">Across all assessments</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <Label>Filters:</Label>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterSeverity} onValueChange={setFilterSeverity}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Severities</SelectItem>
              {SEVERITIES.map((sev) => (
                <SelectItem key={sev.value} value={sev.value}>
                  {sev.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Risks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Risk Assessments</CardTitle>
            <CardDescription>
              All identified risks sorted by risk score
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : risks && risks.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Risk</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-center">Severity</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Mitigation</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {risks.map((risk: any) => (
                    <TableRow key={risk.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{risk.title}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {risk.description || "No description"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="capitalize">{risk.category}</TableCell>
                      <TableCell className="text-center">
                        {getSeverityBadge(risk.severity)}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`font-bold ${getRiskScoreColor(risk.riskScore)}`}>
                          {risk.riskScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(risk.status)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {risk.mitigationStatus.replace("_", " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(risk)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(risk.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Shield className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No risk assessments</h3>
                <p className="text-muted-foreground">
                  Start documenting risks to improve platform safety
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Risk Assessment</DialogTitle>
              <DialogDescription>
                Update risk details and mitigation status
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label>Risk Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Severity</Label>
                  <Select value={severity} onValueChange={setSeverity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SEVERITIES.map((sev) => (
                        <SelectItem key={sev.value} value={sev.value}>
                          {sev.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Likelihood</Label>
                  <Select value={likelihood} onValueChange={setLikelihood}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LIKELIHOODS.map((lik) => (
                        <SelectItem key={lik.value} value={lik.value}>
                          {lik.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Impact Score (1-10)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={impactScore}
                    onChange={(e) => setImpactScore(parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Calculated Risk Score:</span>
                  <span className={`text-2xl font-bold ${getRiskScoreColor(calculateRiskScore())}`}>
                    {calculateRiskScore()}
                  </span>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Mitigation Plan</Label>
                <Textarea
                  value={mitigationPlan}
                  onChange={(e) => setMitigationPlan(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Mitigation Status</Label>
                  <Select value={mitigationStatus} onValueChange={setMitigationStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MITIGATION_STATUSES.map((stat) => (
                        <SelectItem key={stat.value} value={stat.value}>
                          {stat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Risk Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((stat) => (
                        <SelectItem key={stat.value} value={stat.value}>
                          {stat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={!title || updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
