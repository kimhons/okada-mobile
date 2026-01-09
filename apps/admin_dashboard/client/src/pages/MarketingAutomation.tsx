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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Play, Pause, Mail, MessageSquare, Bell, Percent, RefreshCw, Zap, Clock, Target } from "lucide-react";

export default function MarketingAutomation() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAutomation, setSelectedAutomation] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [triggerType, setTriggerType] = useState<"time_based" | "event_based" | "segment_based">("time_based");
  const [actionType, setActionType] = useState<"email" | "sms" | "push" | "discount">("email");
  const [status, setStatus] = useState<"draft" | "active" | "paused" | "completed">("draft");
  const [triggerConfig, setTriggerConfig] = useState<any>({});
  const [actionConfig, setActionConfig] = useState<any>({});
  
  const utils = trpc.useUtils();
  
  const { data: automations, isLoading } = trpc.marketingAutomations.list.useQuery({
    status: filterStatus === "all" ? undefined : filterStatus,
  });
  
  const { data: segments } = trpc.customerSegments.list.useQuery({ isActive: true });
  
  const createMutation = trpc.marketingAutomations.create.useMutation({
    onSuccess: () => {
      toast.success("Automation created successfully");
      setIsCreateOpen(false);
      resetForm();
      utils.marketingAutomations.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateMutation = trpc.marketingAutomations.update.useMutation({
    onSuccess: () => {
      toast.success("Automation updated successfully");
      setIsEditOpen(false);
      setSelectedAutomation(null);
      utils.marketingAutomations.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteMutation = trpc.marketingAutomations.delete.useMutation({
    onSuccess: () => {
      toast.success("Automation deleted successfully");
      utils.marketingAutomations.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const resetForm = () => {
    setName("");
    setDescription("");
    setTriggerType("time_based");
    setActionType("email");
    setStatus("draft");
    setTriggerConfig({});
    setActionConfig({});
  };
  
  const handleCreate = () => {
    createMutation.mutate({
      name,
      description,
      triggerType,
      triggerConfig: JSON.stringify(triggerConfig),
      actionType,
      actionConfig: JSON.stringify(actionConfig),
      status,
    });
  };
  
  const handleEdit = (automation: any) => {
    setSelectedAutomation(automation);
    setName(automation.name);
    setDescription(automation.description || "");
    setTriggerType(automation.triggerType);
    setActionType(automation.actionType);
    setStatus(automation.status);
    try {
      setTriggerConfig(JSON.parse(automation.triggerConfig || "{}"));
      setActionConfig(JSON.parse(automation.actionConfig || "{}"));
    } catch {
      setTriggerConfig({});
      setActionConfig({});
    }
    setIsEditOpen(true);
  };
  
  const handleUpdate = () => {
    if (!selectedAutomation) return;
    updateMutation.mutate({
      id: selectedAutomation.id,
      name,
      description,
      triggerType,
      triggerConfig: JSON.stringify(triggerConfig),
      actionType,
      actionConfig: JSON.stringify(actionConfig),
      status,
    });
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this automation?")) {
      deleteMutation.mutate({ id });
    }
  };
  
  const toggleStatus = (automation: any) => {
    const newStatus = automation.status === "active" ? "paused" : "active";
    updateMutation.mutate({
      id: automation.id,
      status: newStatus,
    });
  };
  
  const getActionIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-4 w-4" />;
      case "sms": return <MessageSquare className="h-4 w-4" />;
      case "push": return <Bell className="h-4 w-4" />;
      case "discount": return <Percent className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };
  
  const getTriggerIcon = (type: string) => {
    switch (type) {
      case "time_based": return <Clock className="h-4 w-4" />;
      case "event_based": return <Zap className="h-4 w-4" />;
      case "segment_based": return <Target className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "default";
      case "paused": return "secondary";
      case "completed": return "outline";
      case "draft": return "outline";
      default: return "outline";
    }
  };
  
  const calculateConversionRate = (automation: any) => {
    if (!automation.sentCount || automation.sentCount === 0) return 0;
    return Math.round((automation.convertedCount / automation.sentCount) * 100);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Marketing Automation</h1>
            <p className="text-muted-foreground">
              Create automated marketing campaigns and workflows
            </p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="mr-2 h-4 w-4" />
                Create Automation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Marketing Automation</DialogTitle>
                <DialogDescription>
                  Set up an automated marketing workflow
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="trigger">Trigger</TabsTrigger>
                  <TabsTrigger value="action">Action</TabsTrigger>
                </TabsList>
                <TabsContent value="basic" className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Automation Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Welcome Email Series"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe this automation..."
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Initial Status</Label>
                    <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                <TabsContent value="trigger" className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    <Label>Trigger Type</Label>
                    <Select value={triggerType} onValueChange={(v: any) => setTriggerType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time_based">Time-Based (Scheduled)</SelectItem>
                        <SelectItem value="event_based">Event-Based (On Action)</SelectItem>
                        <SelectItem value="segment_based">Segment-Based (On Join)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {triggerType === "time_based" && (
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label>Schedule (Cron Expression)</Label>
                        <Input
                          value={triggerConfig.schedule || ""}
                          onChange={(e) => setTriggerConfig({ ...triggerConfig, schedule: e.target.value })}
                          placeholder="0 9 * * * (Daily at 9 AM)"
                        />
                      </div>
                    </div>
                  )}
                  {triggerType === "event_based" && (
                    <div className="grid gap-2">
                      <Label>Event Type</Label>
                      <Select
                        value={triggerConfig.event || ""}
                        onValueChange={(v) => setTriggerConfig({ ...triggerConfig, event: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="order_completed">Order Completed</SelectItem>
                          <SelectItem value="order_cancelled">Order Cancelled</SelectItem>
                          <SelectItem value="user_registered">User Registered</SelectItem>
                          <SelectItem value="cart_abandoned">Cart Abandoned</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {triggerType === "segment_based" && (
                    <div className="grid gap-2">
                      <Label>Target Segment</Label>
                      <Select
                        value={triggerConfig.segmentId?.toString() || ""}
                        onValueChange={(v) => setTriggerConfig({ ...triggerConfig, segmentId: parseInt(v) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select segment" />
                        </SelectTrigger>
                        <SelectContent>
                          {segments?.map((segment: any) => (
                            <SelectItem key={segment.id} value={segment.id.toString()}>
                              {segment.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="action" className="space-y-4 pt-4">
                  <div className="grid gap-2">
                    <Label>Action Type</Label>
                    <Select value={actionType} onValueChange={(v: any) => setActionType(v)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Send Email</SelectItem>
                        <SelectItem value="sms">Send SMS</SelectItem>
                        <SelectItem value="push">Push Notification</SelectItem>
                        <SelectItem value="discount">Apply Discount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {(actionType === "email" || actionType === "sms" || actionType === "push") && (
                    <>
                      <div className="grid gap-2">
                        <Label>Subject/Title</Label>
                        <Input
                          value={actionConfig.subject || ""}
                          onChange={(e) => setActionConfig({ ...actionConfig, subject: e.target.value })}
                          placeholder="Message subject or title"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Message Content</Label>
                        <Textarea
                          value={actionConfig.message || ""}
                          onChange={(e) => setActionConfig({ ...actionConfig, message: e.target.value })}
                          placeholder="Enter your message content..."
                          rows={4}
                        />
                      </div>
                    </>
                  )}
                  {actionType === "discount" && (
                    <>
                      <div className="grid gap-2">
                        <Label>Discount Code</Label>
                        <Input
                          value={actionConfig.discountCode || ""}
                          onChange={(e) => setActionConfig({ ...actionConfig, discountCode: e.target.value })}
                          placeholder="e.g., WELCOME10"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Discount Percentage</Label>
                        <Input
                          type="number"
                          value={actionConfig.discountPercent || ""}
                          onChange={(e) => setActionConfig({ ...actionConfig, discountPercent: parseInt(e.target.value) })}
                          placeholder="e.g., 10"
                        />
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!name || createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Automation"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Automations</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{automations?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
              <Play className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {automations?.filter((a: any) => a.status === "active").length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sent</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {automations?.reduce((acc: number, a: any) => acc + (a.sentCount || 0), 0).toLocaleString() || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {automations && automations.length > 0
                  ? Math.round(automations.reduce((acc: number, a: any) => acc + calculateConversionRate(a), 0) / automations.length)
                  : 0}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Label>Filter:</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All automations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Automations</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Automations Table */}
        <Card>
          <CardHeader>
            <CardTitle>Marketing Automations</CardTitle>
            <CardDescription>
              Manage your automated marketing workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : automations && automations.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Performance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {automations.map((automation: any) => (
                    <TableRow key={automation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{automation.name}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {automation.description || "No description"}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTriggerIcon(automation.triggerType)}
                          <span className="capitalize">{automation.triggerType.replace("_", " ")}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getActionIcon(automation.actionType)}
                          <span className="capitalize">{automation.actionType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusColor(automation.status) as any}>
                          {automation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>Sent: {automation.sentCount || 0}</span>
                            <span>Conv: {calculateConversionRate(automation)}%</span>
                          </div>
                          <Progress value={calculateConversionRate(automation)} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleStatus(automation)}
                            title={automation.status === "active" ? "Pause" : "Activate"}
                          >
                            {automation.status === "active" ? (
                              <Pause className="h-4 w-4" />
                            ) : (
                              <Play className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(automation)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(automation.id)}
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
                <Zap className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No automations yet</h3>
                <p className="text-muted-foreground">
                  Create your first marketing automation to engage customers
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Marketing Automation</DialogTitle>
              <DialogDescription>
                Update automation settings and configuration
              </DialogDescription>
            </DialogHeader>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="trigger">Trigger</TabsTrigger>
                <TabsTrigger value="action">Action</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label>Automation Name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="trigger" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label>Trigger Type</Label>
                  <Select value={triggerType} onValueChange={(v: any) => setTriggerType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time_based">Time-Based</SelectItem>
                      <SelectItem value="event_based">Event-Based</SelectItem>
                      <SelectItem value="segment_based">Segment-Based</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {triggerType === "time_based" && (
                  <div className="grid gap-2">
                    <Label>Schedule (Cron)</Label>
                    <Input
                      value={triggerConfig.schedule || ""}
                      onChange={(e) => setTriggerConfig({ ...triggerConfig, schedule: e.target.value })}
                    />
                  </div>
                )}
                {triggerType === "event_based" && (
                  <div className="grid gap-2">
                    <Label>Event Type</Label>
                    <Select
                      value={triggerConfig.event || ""}
                      onValueChange={(v) => setTriggerConfig({ ...triggerConfig, event: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select event" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="order_completed">Order Completed</SelectItem>
                        <SelectItem value="order_cancelled">Order Cancelled</SelectItem>
                        <SelectItem value="user_registered">User Registered</SelectItem>
                        <SelectItem value="cart_abandoned">Cart Abandoned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="action" className="space-y-4 pt-4">
                <div className="grid gap-2">
                  <Label>Action Type</Label>
                  <Select value={actionType} onValueChange={(v: any) => setActionType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Send Email</SelectItem>
                      <SelectItem value="sms">Send SMS</SelectItem>
                      <SelectItem value="push">Push Notification</SelectItem>
                      <SelectItem value="discount">Apply Discount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {(actionType === "email" || actionType === "sms" || actionType === "push") && (
                  <>
                    <div className="grid gap-2">
                      <Label>Subject/Title</Label>
                      <Input
                        value={actionConfig.subject || ""}
                        onChange={(e) => setActionConfig({ ...actionConfig, subject: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Message Content</Label>
                      <Textarea
                        value={actionConfig.message || ""}
                        onChange={(e) => setActionConfig({ ...actionConfig, message: e.target.value })}
                        rows={4}
                      />
                    </div>
                  </>
                )}
                {actionType === "discount" && (
                  <>
                    <div className="grid gap-2">
                      <Label>Discount Code</Label>
                      <Input
                        value={actionConfig.discountCode || ""}
                        onChange={(e) => setActionConfig({ ...actionConfig, discountCode: e.target.value })}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Discount Percentage</Label>
                      <Input
                        type="number"
                        value={actionConfig.discountPercent || ""}
                        onChange={(e) => setActionConfig({ ...actionConfig, discountPercent: parseInt(e.target.value) })}
                      />
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={!name || updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
