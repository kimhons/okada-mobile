import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { FlaskConical, Play, Pause, CheckCircle, TrendingUp, Users, Target, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ABTesting() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newExperiment, setNewExperiment] = useState({
    name: "",
    description: "",
    targetMetric: "conversion",
    trafficSplit: "50",
  });

  // Mock data - in production this would come from tRPC
  const experiments = [
    {
      id: 1,
      name: "Checkout Button Color",
      description: "Testing green vs blue checkout button",
      status: "running",
      startDate: "2025-12-01",
      variants: [
        { name: "Control (Blue)", visitors: 5420, conversions: 324, rate: 5.98 },
        { name: "Variant A (Green)", visitors: 5380, conversions: 398, rate: 7.40 },
      ],
      trafficSplit: 50,
      targetMetric: "conversion",
      confidence: 95.2,
      winner: "Variant A",
    },
    {
      id: 2,
      name: "Homepage Hero Text",
      description: "Testing different value propositions",
      status: "running",
      startDate: "2025-12-10",
      variants: [
        { name: "Control", visitors: 2100, conversions: 84, rate: 4.00 },
        { name: "Variant A", visitors: 2050, conversions: 92, rate: 4.49 },
      ],
      trafficSplit: 50,
      targetMetric: "signup",
      confidence: 72.5,
      winner: null,
    },
    {
      id: 3,
      name: "Delivery Fee Display",
      description: "Show fee upfront vs at checkout",
      status: "completed",
      startDate: "2025-11-15",
      endDate: "2025-12-05",
      variants: [
        { name: "Control (At Checkout)", visitors: 8900, conversions: 445, rate: 5.00 },
        { name: "Variant A (Upfront)", visitors: 8850, conversions: 531, rate: 6.00 },
      ],
      trafficSplit: 50,
      targetMetric: "order_completion",
      confidence: 99.1,
      winner: "Variant A",
    },
    {
      id: 4,
      name: "Mobile App Onboarding",
      description: "3-step vs 5-step onboarding flow",
      status: "paused",
      startDate: "2025-12-08",
      variants: [
        { name: "Control (5 steps)", visitors: 1200, conversions: 720, rate: 60.00 },
        { name: "Variant A (3 steps)", visitors: 1180, conversions: 826, rate: 70.00 },
      ],
      trafficSplit: 50,
      targetMetric: "onboarding_completion",
      confidence: 88.3,
      winner: null,
    },
  ];

  const filteredExperiments = statusFilter === "all" 
    ? experiments 
    : experiments.filter(e => e.status === statusFilter);

  const handleCreateExperiment = () => {
    if (!newExperiment.name.trim()) {
      toast.error("Please enter an experiment name");
      return;
    }
    toast.success(`Experiment "${newExperiment.name}" created`);
    setCreateDialogOpen(false);
    setNewExperiment({ name: "", description: "", targetMetric: "conversion", trafficSplit: "50" });
  };

  const handleToggleExperiment = (id: number, currentStatus: string) => {
    const action = currentStatus === "running" ? "paused" : "resumed";
    toast.success(`Experiment ${action}`);
  };

  const handleEndExperiment = (id: number) => {
    toast.success("Experiment ended and winner declared");
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      running: "bg-green-100 text-green-800",
      paused: "bg-yellow-100 text-yellow-800",
      completed: "bg-blue-100 text-blue-800",
      draft: "bg-gray-100 text-gray-800",
    };
    return <Badge className={colors[status] || ""}>{status.toUpperCase()}</Badge>;
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 95) return "text-green-600";
    if (confidence >= 80) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">A/B Testing</h1>
          <p className="text-muted-foreground">Create and manage experiments to optimize conversions</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Experiments</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Experiment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Experiment</DialogTitle>
                <DialogDescription>Set up a new A/B test to optimize your platform</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Experiment Name</Label>
                  <Input
                    value={newExperiment.name}
                    onChange={(e) => setNewExperiment({ ...newExperiment, name: e.target.value })}
                    placeholder="e.g., Checkout Button Color"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newExperiment.description}
                    onChange={(e) => setNewExperiment({ ...newExperiment, description: e.target.value })}
                    placeholder="Describe what you're testing..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target Metric</Label>
                  <Select
                    value={newExperiment.targetMetric}
                    onValueChange={(value) => setNewExperiment({ ...newExperiment, targetMetric: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conversion">Conversion Rate</SelectItem>
                      <SelectItem value="signup">Sign-up Rate</SelectItem>
                      <SelectItem value="order_completion">Order Completion</SelectItem>
                      <SelectItem value="engagement">Engagement</SelectItem>
                      <SelectItem value="revenue">Revenue per User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Traffic Split (%)</Label>
                  <Input
                    type="number"
                    value={newExperiment.trafficSplit}
                    onChange={(e) => setNewExperiment({ ...newExperiment, trafficSplit: e.target.value })}
                    min="10"
                    max="90"
                  />
                  <p className="text-xs text-muted-foreground">
                    {newExperiment.trafficSplit}% to variant, {100 - parseInt(newExperiment.trafficSplit || "50")}% to control
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateExperiment}>Create Experiment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              Active Experiments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiments.filter(e => e.status === "running").length}</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Participants
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {experiments.reduce((acc, e) => acc + e.variants.reduce((a, v) => a + v.visitors, 0), 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Across all experiments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completed Tests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiments.filter(e => e.status === "completed").length}</div>
            <p className="text-xs text-muted-foreground">With declared winners</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg. Lift
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+18.5%</div>
            <p className="text-xs text-muted-foreground">From winning variants</p>
          </CardContent>
        </Card>
      </div>

      {/* Experiments List */}
      {filteredExperiments.map((experiment) => (
        <Card key={experiment.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {experiment.name}
                  {getStatusBadge(experiment.status)}
                </CardTitle>
                <CardDescription>{experiment.description}</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                {experiment.status !== "completed" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleExperiment(experiment.id, experiment.status)}
                    >
                      {experiment.status === "running" ? (
                        <><Pause className="h-4 w-4 mr-1" /> Pause</>
                      ) : (
                        <><Play className="h-4 w-4 mr-1" /> Resume</>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleEndExperiment(experiment.id)}
                    >
                      End Test
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Variants Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Variant</TableHead>
                    <TableHead>Visitors</TableHead>
                    <TableHead>Conversions</TableHead>
                    <TableHead>Conversion Rate</TableHead>
                    <TableHead>Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {experiment.variants.map((variant, index) => {
                    const isWinner = experiment.winner === variant.name;
                    const controlRate = experiment.variants[0].rate;
                    const lift = index === 0 ? 0 : ((variant.rate - controlRate) / controlRate * 100);
                    
                    return (
                      <TableRow key={variant.name}>
                        <TableCell className="font-medium">
                          {variant.name}
                          {isWinner && <Badge className="ml-2 bg-green-100 text-green-800">Winner</Badge>}
                        </TableCell>
                        <TableCell>{variant.visitors.toLocaleString()}</TableCell>
                        <TableCell>{variant.conversions.toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">{variant.rate.toFixed(2)}%</TableCell>
                        <TableCell>
                          {index === 0 ? (
                            <span className="text-muted-foreground">Baseline</span>
                          ) : (
                            <span className={lift > 0 ? "text-green-600" : "text-red-600"}>
                              {lift > 0 ? "+" : ""}{lift.toFixed(1)}%
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {/* Confidence Level */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  <span className="font-medium">Statistical Confidence</span>
                </div>
                <div className="flex items-center gap-4">
                  <Progress value={experiment.confidence} className="w-32 h-2" />
                  <span className={`font-bold ${getConfidenceColor(experiment.confidence)}`}>
                    {experiment.confidence}%
                  </span>
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>Started: {experiment.startDate}</span>
                {experiment.endDate && <span>Ended: {experiment.endDate}</span>}
                <span>Traffic Split: {experiment.trafficSplit}%</span>
                <span>Metric: {experiment.targetMetric.replace("_", " ")}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
