import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Plus, Award, CheckCircle, Clock, Play } from "lucide-react";
import { toast } from "sonner";

export default function RiderTrainingTracker() {
  const [selectedRiderId, setSelectedRiderId] = useState<number>(1);
  const [createModuleDialogOpen, setCreateModuleDialogOpen] = useState(false);
  const [moduleDetailDialogOpen, setModuleDetailDialogOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<any>(null);

  const { data: modules, refetch: refetchModules } = trpc.training.getModules.useQuery({});
  const { data: stats } = trpc.training.getStats.useQuery();
  const { data: riderProgress } = trpc.training.getRiderProgress.useQuery({
    riderId: selectedRiderId,
  });
  const { data: completionRate } = trpc.training.getRiderCompletionRate.useQuery({
    riderId: selectedRiderId,
  });

  const createModuleMutation = trpc.training.createModule.useMutation({
    onSuccess: () => {
      toast.success("Training module created successfully");
      setCreateModuleDialogOpen(false);
      refetchModules();
    },
    onError: (error) => {
      toast.error(`Failed to create module: ${error.message}`);
    },
  });

  const startModuleMutation = trpc.training.startModule.useMutation({
    onSuccess: () => {
      toast.success("Training module started");
    },
    onError: (error) => {
      toast.error(`Failed to start module: ${error.message}`);
    },
  });

  const handleCreateModule = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    createModuleMutation.mutate({
      title: formData.get("title") as string,
      description: formData.get("description") as string || undefined,
      category: formData.get("category") as string,
      contentType: formData.get("contentType") as string,
      contentUrl: formData.get("contentUrl") as string || undefined,
      duration: formData.get("duration") ? Number(formData.get("duration")) : undefined,
      isMandatory: formData.get("isMandatory") === "true",
      minPassingScore: formData.get("minPassingScore") ? Number(formData.get("minPassingScore")) : undefined,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "in_progress": return "default";
      case "failed": return "destructive";
      case "not_started": return "secondary";
      default: return "secondary";
    }
  };

  const getCategoryIcon = (category: string) => {
    return <BookOpen className="h-4 w-4" />;
  };

  const completionPercentage = completionRate
    ? ((completionRate.completedModules / (completionRate.totalModules || 1)) * 100).toFixed(0)
    : "0";

  const mandatoryCompletionPercentage = completionRate
    ? ((completionRate.mandatoryCompleted / (completionRate.totalMandatory || 1)) * 100).toFixed(0)
    : "0";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Rider Training Tracker</h1>
            <p className="text-muted-foreground">
              Training modules, quizzes, and certifications
            </p>
          </div>
          <Button onClick={() => setCreateModuleDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Module
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Modules</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalModules || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.mandatoryModules || 0} mandatory
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalEnrollments || 0}</div>
              <p className="text-xs text-muted-foreground">
                Total enrollments
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.completedModules || 0}</div>
              <p className="text-xs text-muted-foreground">
                Modules completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certificates</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.certificatesIssued || 0}</div>
              <p className="text-xs text-muted-foreground">
                Certificates issued
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="modules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="modules">Training Modules</TabsTrigger>
            <TabsTrigger value="progress">Rider Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="modules" className="space-y-4">
            {/* Training Modules Table */}
            <Card>
              <CardHeader>
                <CardTitle>Training Modules</CardTitle>
                <CardDescription>
                  {modules?.length || 0} modules available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Mandatory</TableHead>
                      <TableHead>Min Score</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {modules?.map((module) => (
                      <TableRow key={module.id}>
                        <TableCell className="font-medium">{module.title}</TableCell>
                        <TableCell className="capitalize">
                          <div className="flex items-center gap-2">
                            {getCategoryIcon(module.category)}
                            {module.category.replace("_", " ")}
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{module.contentType}</TableCell>
                        <TableCell>{module.duration ? `${module.duration} min` : "-"}</TableCell>
                        <TableCell>
                          {module.isMandatory ? (
                            <Badge variant="destructive">Mandatory</Badge>
                          ) : (
                            <Badge variant="secondary">Optional</Badge>
                          )}
                        </TableCell>
                        <TableCell>{module.minPassingScore}%</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedModule(module);
                              setModuleDetailDialogOpen(true);
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-4">
            {/* Rider Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Rider</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="riderId">Rider ID</Label>
                    <Input
                      id="riderId"
                      type="number"
                      value={selectedRiderId}
                      onChange={(e) => setSelectedRiderId(Number(e.target.value))}
                      placeholder="Enter rider ID"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Completion Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Training Completion</CardTitle>
                <CardDescription>Rider #{selectedRiderId} progress overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Completion</span>
                    <span className="text-sm font-bold">{completionPercentage}%</span>
                  </div>
                  <Progress value={Number(completionPercentage)} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {completionRate?.completedModules || 0} of {completionRate?.totalModules || 0} modules completed
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Mandatory Modules</span>
                    <span className="text-sm font-bold">{mandatoryCompletionPercentage}%</span>
                  </div>
                  <Progress value={Number(mandatoryCompletionPercentage)} />
                  <p className="text-xs text-muted-foreground mt-1">
                    {completionRate?.mandatoryCompleted || 0} of {completionRate?.totalMandatory || 0} mandatory modules completed
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rider Progress Table */}
            <Card>
              <CardHeader>
                <CardTitle>Module Progress</CardTitle>
                <CardDescription>
                  Detailed progress for rider #{selectedRiderId}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Module</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Best Score</TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {riderProgress?.map((progress) => (
                      <TableRow key={progress.id}>
                        <TableCell className="font-medium">{progress.moduleTitle}</TableCell>
                        <TableCell className="capitalize">
                          {progress.moduleCategory.replace("_", " ")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(progress.status) as any}>
                            {progress.status.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={progress.progressPercentage} className="w-20" />
                            <span className="text-xs">{progress.progressPercentage}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {progress.bestQuizScore ? `${progress.bestQuizScore}%` : "-"}
                        </TableCell>
                        <TableCell>
                          {progress.certificateIssued ? (
                            <Badge variant="default">
                              <Award className="h-3 w-3 mr-1" />
                              Issued
                            </Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {progress.status === "not_started" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                startModuleMutation.mutate({
                                  riderId: selectedRiderId,
                                  moduleId: progress.moduleId,
                                })
                              }
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Module Dialog */}
        <Dialog open={createModuleDialogOpen} onOpenChange={setCreateModuleDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Training Module</DialogTitle>
              <DialogDescription>
                Add a new training module for riders
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateModule} className="space-y-4">
              <div>
                <Label htmlFor="title">Module Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g., Safe Riding Practices"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Module description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="safety">Safety</SelectItem>
                      <SelectItem value="customer_service">Customer Service</SelectItem>
                      <SelectItem value="app_usage">App Usage</SelectItem>
                      <SelectItem value="quality_photos">Quality Photos</SelectItem>
                      <SelectItem value="delivery_procedures">Delivery Procedures</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select name="contentType" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="document">Document</SelectItem>
                      <SelectItem value="interactive">Interactive</SelectItem>
                      <SelectItem value="quiz">Quiz</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    name="duration"
                    type="number"
                    placeholder="30"
                  />
                </div>

                <div>
                  <Label htmlFor="minPassingScore">Min Passing Score (%)</Label>
                  <Input
                    id="minPassingScore"
                    name="minPassingScore"
                    type="number"
                    defaultValue="70"
                  />
                </div>

                <div>
                  <Label htmlFor="isMandatory">Mandatory</Label>
                  <Select name="isMandatory" defaultValue="false">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="contentUrl">Content URL</Label>
                <Input
                  id="contentUrl"
                  name="contentUrl"
                  placeholder="https://..."
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateModuleDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createModuleMutation.isPending}>
                  {createModuleMutation.isPending ? "Creating..." : "Create Module"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Module Detail Dialog */}
        <Dialog open={moduleDetailDialogOpen} onOpenChange={setModuleDetailDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedModule?.title}</DialogTitle>
              <DialogDescription>
                {selectedModule?.category.replace("_", " ")} - {selectedModule?.contentType}
              </DialogDescription>
            </DialogHeader>
            {selectedModule && (
              <div className="space-y-4">
                <div>
                  <Label>Description</Label>
                  <p className="text-sm text-muted-foreground">
                    {selectedModule.description || "No description provided"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Duration</Label>
                    <p className="text-sm">{selectedModule.duration ? `${selectedModule.duration} minutes` : "Not specified"}</p>
                  </div>
                  <div>
                    <Label>Min Passing Score</Label>
                    <p className="text-sm">{selectedModule.minPassingScore}%</p>
                  </div>
                </div>

                <div>
                  <Label>Type</Label>
                  <div className="flex gap-2 mt-1">
                    {selectedModule.isMandatory ? (
                      <Badge variant="destructive">Mandatory</Badge>
                    ) : (
                      <Badge variant="secondary">Optional</Badge>
                    )}
                    <Badge variant="outline">{selectedModule.contentType}</Badge>
                  </div>
                </div>

                {selectedModule.contentUrl && (
                  <div>
                    <Label>Content URL</Label>
                    <a
                      href={selectedModule.contentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {selectedModule.contentUrl}
                    </a>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
