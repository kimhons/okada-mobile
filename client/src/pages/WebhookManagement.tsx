import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Webhook, Send, CheckCircle2, XCircle, Clock, RefreshCw, Eye, EyeOff, Copy, ExternalLink } from "lucide-react";

const AUTH_TYPES = [
  { value: "none", label: "No Authentication" },
  { value: "basic", label: "Basic Auth" },
  { value: "bearer", label: "Bearer Token" },
  { value: "hmac", label: "HMAC Signature" },
];

const EVENT_TYPES = [
  { value: "order.created", label: "Order Created" },
  { value: "order.updated", label: "Order Updated" },
  { value: "order.completed", label: "Order Completed" },
  { value: "order.cancelled", label: "Order Cancelled" },
  { value: "rider.assigned", label: "Rider Assigned" },
  { value: "rider.location_updated", label: "Rider Location Updated" },
  { value: "payment.received", label: "Payment Received" },
  { value: "payment.refunded", label: "Payment Refunded" },
  { value: "user.registered", label: "User Registered" },
  { value: "user.updated", label: "User Updated" },
];

export default function WebhookManagement() {
  const [activeTab, setActiveTab] = useState("endpoints");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewLogOpen, setIsViewLogOpen] = useState(false);
  const [selectedEndpoint, setSelectedEndpoint] = useState<any>(null);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [showSecret, setShowSecret] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [authType, setAuthType] = useState<string>("none");
  const [authCredentials, setAuthCredentials] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [maxRetries, setMaxRetries] = useState(3);
  const [retryDelay, setRetryDelay] = useState(60);
  
  const utils = trpc.useUtils();
  
  const { data: endpoints, isLoading: endpointsLoading } = trpc.webhooks.listEndpoints.useQuery({});
  const { data: logs, isLoading: logsLoading } = trpc.webhooks.listLogs.useQuery({ limit: 100 });
  
  const createMutation = trpc.webhooks.createEndpoint.useMutation({
    onSuccess: () => {
      toast.success("Webhook endpoint created successfully");
      setIsCreateOpen(false);
      resetForm();
      utils.webhooks.listEndpoints.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateMutation = trpc.webhooks.updateEndpoint.useMutation({
    onSuccess: () => {
      toast.success("Webhook endpoint updated successfully");
      setIsEditOpen(false);
      setSelectedEndpoint(null);
      utils.webhooks.listEndpoints.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteMutation = trpc.webhooks.deleteEndpoint.useMutation({
    onSuccess: () => {
      toast.success("Webhook endpoint deleted successfully");
      utils.webhooks.listEndpoints.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const resetForm = () => {
    setName("");
    setUrl("");
    setSecret(generateSecret());
    setAuthType("none");
    setAuthCredentials("");
    setSelectedEvents([]);
    setIsActive(true);
    setMaxRetries(3);
    setRetryDelay(60);
  };
  
  const generateSecret = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };
  
  const handleCreate = () => {
    createMutation.mutate({
      name,
      url,
      secret,
      authType: authType as any,
      authCredentials: authCredentials || undefined,
      events: JSON.stringify(selectedEvents),
      isActive,
      maxRetries,
      retryDelay,
    });
  };
  
  const handleEdit = (endpoint: any) => {
    setSelectedEndpoint(endpoint);
    setName(endpoint.name);
    setUrl(endpoint.url);
    setSecret(endpoint.secret);
    setAuthType(endpoint.authType);
    setAuthCredentials(endpoint.authCredentials || "");
    try {
      setSelectedEvents(JSON.parse(endpoint.events || "[]"));
    } catch {
      setSelectedEvents([]);
    }
    setIsActive(endpoint.isActive);
    setMaxRetries(endpoint.maxRetries);
    setRetryDelay(endpoint.retryDelay);
    setIsEditOpen(true);
  };
  
  const handleUpdate = () => {
    if (!selectedEndpoint) return;
    updateMutation.mutate({
      id: selectedEndpoint.id,
      name,
      url,
      secret,
      authType: authType as any,
      authCredentials: authCredentials || undefined,
      events: JSON.stringify(selectedEvents),
      isActive,
      maxRetries,
      retryDelay,
    });
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this webhook endpoint?")) {
      deleteMutation.mutate({ id });
    }
  };
  
  const toggleEvent = (event: string) => {
    setSelectedEvents(prev =>
      prev.includes(event)
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500 text-white">Success</Badge>;
      case "failed":
        return <Badge className="bg-red-500 text-white">Failed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500 text-white">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const formatEvents = (eventsJson: string) => {
    try {
      const events = JSON.parse(eventsJson);
      if (events.length === 0) return "No events";
      if (events.length <= 2) return events.join(", ");
      return `${events.slice(0, 2).join(", ")} +${events.length - 2} more`;
    } catch {
      return "Invalid";
    }
  };
  
  // Calculate stats
  const activeEndpoints = endpoints?.filter((e: any) => e.isActive).length || 0;
  const successfulDeliveries = logs?.filter((l: any) => l.status === "success").length || 0;
  const failedDeliveries = logs?.filter((l: any) => l.status === "failed").length || 0;
  const successRate = logs && logs.length > 0
    ? Math.round((successfulDeliveries / logs.length) * 100)
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Webhook Management</h1>
            <p className="text-muted-foreground">
              Configure webhook endpoints for real-time event notifications
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Endpoints</CardTitle>
              <Webhook className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeEndpoints}</div>
              <p className="text-xs text-muted-foreground">
                of {endpoints?.length || 0} total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Successful</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{successfulDeliveries}</div>
              <p className="text-xs text-muted-foreground">Deliveries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{failedDeliveries}</div>
              <p className="text-xs text-muted-foreground">Deliveries</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <Send className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{successRate}%</div>
              <p className="text-xs text-muted-foreground">Last 100 deliveries</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
            </TabsList>
            {activeTab === "endpoints" && (
              <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Endpoint
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Webhook Endpoint</DialogTitle>
                    <DialogDescription>
                      Configure a new webhook endpoint to receive event notifications
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                    <div className="grid gap-2">
                      <Label>Endpoint Name</Label>
                      <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Order Notifications"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Webhook URL</Label>
                      <Input
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="https://your-server.com/webhook"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Signing Secret</Label>
                      <div className="flex gap-2">
                        <Input
                          type={showSecret ? "text" : "password"}
                          value={secret}
                          onChange={(e) => setSecret(e.target.value)}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setSecret(generateSecret())}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Used to verify webhook signatures
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Authentication Type</Label>
                        <Select value={authType} onValueChange={setAuthType}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AUTH_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {authType !== "none" && (
                        <div className="grid gap-2">
                          <Label>Auth Credentials</Label>
                          <Input
                            type="password"
                            value={authCredentials}
                            onChange={(e) => setAuthCredentials(e.target.value)}
                            placeholder={authType === "basic" ? "user:password" : "token"}
                          />
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Max Retries</Label>
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          value={maxRetries}
                          onChange={(e) => setMaxRetries(parseInt(e.target.value) || 3)}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Retry Delay (seconds)</Label>
                        <Input
                          type="number"
                          min={10}
                          max={3600}
                          value={retryDelay}
                          onChange={(e) => setRetryDelay(parseInt(e.target.value) || 60)}
                        />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Events to Subscribe</Label>
                      <div className="grid grid-cols-2 gap-2 p-4 border rounded-lg max-h-[200px] overflow-y-auto">
                        {EVENT_TYPES.map((event) => (
                          <div key={event.value} className="flex items-center space-x-2">
                            <Checkbox
                              id={event.value}
                              checked={selectedEvents.includes(event.value)}
                              onCheckedChange={() => toggleEvent(event.value)}
                            />
                            <Label htmlFor={event.value} className="text-sm cursor-pointer">
                              {event.label}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active"
                        checked={isActive}
                        onCheckedChange={setIsActive}
                      />
                      <Label htmlFor="active">Active</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreate}
                      disabled={!name || !url || !secret || selectedEvents.length === 0 || createMutation.isPending}
                    >
                      {createMutation.isPending ? "Creating..." : "Create Endpoint"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <TabsContent value="endpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Webhook Endpoints</CardTitle>
                <CardDescription>
                  Manage your webhook endpoints and subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {endpointsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : endpoints && endpoints.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>URL</TableHead>
                        <TableHead>Events</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Success Rate</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {endpoints.map((endpoint: any) => (
                        <TableRow key={endpoint.id}>
                          <TableCell className="font-medium">{endpoint.name}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 max-w-[200px]">
                              <span className="truncate text-sm">{endpoint.url}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(endpoint.url)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {formatEvents(endpoint.events)}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={endpoint.isActive ? "default" : "secondary"}>
                              {endpoint.isActive ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {endpoint.successCount || 0}/{(endpoint.successCount || 0) + (endpoint.failureCount || 0)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(endpoint)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(endpoint.id)}
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
                    <Webhook className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No webhook endpoints</h3>
                    <p className="text-muted-foreground">
                      Create an endpoint to receive event notifications
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Logs</CardTitle>
                <CardDescription>
                  Recent webhook delivery attempts and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {logsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : logs && logs.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Event</TableHead>
                        <TableHead>Endpoint</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Response Code</TableHead>
                        <TableHead>Timestamp</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log: any) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-medium">{log.eventType}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {endpoints?.find((e: any) => e.id === log.endpointId)?.name || `ID: ${log.endpointId}`}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(log.status)}
                          </TableCell>
                          <TableCell>{log.statusCode || "-"}</TableCell>
                          <TableCell>
                            {new Date(log.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedLog(log);
                                setIsViewLogOpen(true);
                              }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No delivery logs</h3>
                    <p className="text-muted-foreground">
                      Webhook deliveries will appear here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Endpoint Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Webhook Endpoint</DialogTitle>
              <DialogDescription>
                Update webhook endpoint configuration
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid gap-2">
                <Label>Endpoint Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Webhook URL</Label>
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Signing Secret</Label>
                <div className="flex gap-2">
                  <Input
                    type={showSecret ? "text" : "password"}
                    value={secret}
                    onChange={(e) => setSecret(e.target.value)}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowSecret(!showSecret)}
                  >
                    {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Authentication Type</Label>
                  <Select value={authType} onValueChange={setAuthType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AUTH_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {authType !== "none" && (
                  <div className="grid gap-2">
                    <Label>Auth Credentials</Label>
                    <Input
                      type="password"
                      value={authCredentials}
                      onChange={(e) => setAuthCredentials(e.target.value)}
                    />
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Max Retries</Label>
                  <Input
                    type="number"
                    min={0}
                    max={10}
                    value={maxRetries}
                    onChange={(e) => setMaxRetries(parseInt(e.target.value) || 3)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Retry Delay (seconds)</Label>
                  <Input
                    type="number"
                    min={10}
                    max={3600}
                    value={retryDelay}
                    onChange={(e) => setRetryDelay(parseInt(e.target.value) || 60)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Events to Subscribe</Label>
                <div className="grid grid-cols-2 gap-2 p-4 border rounded-lg max-h-[200px] overflow-y-auto">
                  {EVENT_TYPES.map((event) => (
                    <div key={event.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`edit-${event.value}`}
                        checked={selectedEvents.includes(event.value)}
                        onCheckedChange={() => toggleEvent(event.value)}
                      />
                      <Label htmlFor={`edit-${event.value}`} className="text-sm cursor-pointer">
                        {event.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="edit-active">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdate}
                disabled={!name || !url || !secret || selectedEvents.length === 0 || updateMutation.isPending}
              >
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Log Dialog */}
        <Dialog open={isViewLogOpen} onOpenChange={setIsViewLogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Delivery Log Details</DialogTitle>
              <DialogDescription>
                View webhook delivery attempt details
              </DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Event Type</Label>
                    <p className="font-medium">{selectedLog.eventType}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status</Label>
                    <div className="mt-1">{getStatusBadge(selectedLog.status)}</div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Status Code</Label>
                    <p className="font-medium">{selectedLog.statusCode || "N/A"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Timestamp</Label>
                    <p className="font-medium">
                      {new Date(selectedLog.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payload</Label>
                  <pre className="mt-1 p-4 bg-muted rounded-lg text-sm overflow-auto max-h-[200px]">
                    {selectedLog.payload ? JSON.stringify(JSON.parse(selectedLog.payload), null, 2) : "No payload"}
                  </pre>
                </div>
                {selectedLog.response && (
                  <div>
                    <Label className="text-muted-foreground">Response</Label>
                    <pre className="mt-1 p-4 bg-muted rounded-lg text-sm overflow-auto max-h-[200px]">
                      {selectedLog.response}
                    </pre>
                  </div>
                )}
                {selectedLog.errorMessage && (
                  <div>
                    <Label className="text-muted-foreground">Error</Label>
                    <p className="mt-1 p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                      {selectedLog.errorMessage}
                    </p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewLogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
