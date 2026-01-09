import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Users, Filter, Download, RefreshCw } from "lucide-react";

interface SegmentCriteria {
  minOrders?: number;
  maxOrders?: number;
  minSpent?: number;
  maxSpent?: number;
  location?: string;
  lastOrderDays?: number;
  registrationDays?: number;
}

export default function CustomerSegmentation() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedSegment, setSelectedSegment] = useState<any>(null);
  const [filterActive, setFilterActive] = useState<string>("all");
  
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [criteria, setCriteria] = useState<SegmentCriteria>({});
  
  const utils = trpc.useUtils();
  
  const { data: segments, isLoading } = trpc.customerSegments.list.useQuery({
    isActive: filterActive === "all" ? undefined : filterActive === "active",
  });
  
  const createMutation = trpc.customerSegments.create.useMutation({
    onSuccess: () => {
      toast.success("Segment created successfully");
      setIsCreateOpen(false);
      resetForm();
      utils.customerSegments.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateMutation = trpc.customerSegments.update.useMutation({
    onSuccess: () => {
      toast.success("Segment updated successfully");
      setIsEditOpen(false);
      setSelectedSegment(null);
      utils.customerSegments.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteMutation = trpc.customerSegments.delete.useMutation({
    onSuccess: () => {
      toast.success("Segment deleted successfully");
      utils.customerSegments.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const resetForm = () => {
    setName("");
    setDescription("");
    setIsActive(true);
    setCriteria({});
  };
  
  const handleCreate = () => {
    createMutation.mutate({
      name,
      description,
      criteria: JSON.stringify(criteria),
      isActive,
    });
  };
  
  const handleEdit = (segment: any) => {
    setSelectedSegment(segment);
    setName(segment.name);
    setDescription(segment.description || "");
    setIsActive(segment.isActive);
    try {
      setCriteria(JSON.parse(segment.criteria || "{}"));
    } catch {
      setCriteria({});
    }
    setIsEditOpen(true);
  };
  
  const handleUpdate = () => {
    if (!selectedSegment) return;
    updateMutation.mutate({
      id: selectedSegment.id,
      name,
      description,
      criteria: JSON.stringify(criteria),
      isActive,
    });
  };
  
  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this segment?")) {
      deleteMutation.mutate({ id });
    }
  };
  
  const formatCriteria = (criteriaJson: string) => {
    try {
      const c = JSON.parse(criteriaJson) as SegmentCriteria;
      const parts: string[] = [];
      if (c.minOrders) parts.push(`≥${c.minOrders} orders`);
      if (c.maxOrders) parts.push(`≤${c.maxOrders} orders`);
      if (c.minSpent) parts.push(`≥${(c.minSpent / 100).toLocaleString()} FCFA spent`);
      if (c.maxSpent) parts.push(`≤${(c.maxSpent / 100).toLocaleString()} FCFA spent`);
      if (c.location) parts.push(`Location: ${c.location}`);
      if (c.lastOrderDays) parts.push(`Last order within ${c.lastOrderDays} days`);
      return parts.length > 0 ? parts.join(", ") : "No criteria";
    } catch {
      return "Invalid criteria";
    }
  };
  
  const exportSegments = () => {
    if (!segments) return;
    const csv = [
      ["Name", "Description", "Customers", "Status", "Created"].join(","),
      ...segments.map((s: any) => [
        `"${s.name}"`,
        `"${s.description || ""}"`,
        s.customerCount,
        s.isActive ? "Active" : "Inactive",
        new Date(s.createdAt).toLocaleDateString(),
      ].join(",")),
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customer-segments.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Segments exported");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Segmentation</h1>
            <p className="text-muted-foreground">
              Create and manage customer segments for targeted marketing
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportSegments}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Segment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Customer Segment</DialogTitle>
                  <DialogDescription>
                    Define criteria to group customers for targeted campaigns
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Segment Name</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., High Value Customers"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe this segment..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Min Orders</Label>
                      <Input
                        type="number"
                        value={criteria.minOrders || ""}
                        onChange={(e) => setCriteria({ ...criteria, minOrders: parseInt(e.target.value) || undefined })}
                        placeholder="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Max Orders</Label>
                      <Input
                        type="number"
                        value={criteria.maxOrders || ""}
                        onChange={(e) => setCriteria({ ...criteria, maxOrders: parseInt(e.target.value) || undefined })}
                        placeholder="No limit"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Min Spent (FCFA)</Label>
                      <Input
                        type="number"
                        value={criteria.minSpent ? criteria.minSpent / 100 : ""}
                        onChange={(e) => setCriteria({ ...criteria, minSpent: (parseInt(e.target.value) || 0) * 100 })}
                        placeholder="0"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Max Spent (FCFA)</Label>
                      <Input
                        type="number"
                        value={criteria.maxSpent ? criteria.maxSpent / 100 : ""}
                        onChange={(e) => setCriteria({ ...criteria, maxSpent: (parseInt(e.target.value) || 0) * 100 })}
                        placeholder="No limit"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label>Location</Label>
                      <Input
                        value={criteria.location || ""}
                        onChange={(e) => setCriteria({ ...criteria, location: e.target.value || undefined })}
                        placeholder="e.g., Douala"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Last Order Within (days)</Label>
                      <Input
                        type="number"
                        value={criteria.lastOrderDays || ""}
                        onChange={(e) => setCriteria({ ...criteria, lastOrderDays: parseInt(e.target.value) || undefined })}
                        placeholder="e.g., 30"
                      />
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
                  <Button onClick={handleCreate} disabled={!name || createMutation.isPending}>
                    {createMutation.isPending ? "Creating..." : "Create Segment"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Segments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{segments?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Segments</CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {segments?.filter((s: any) => s.isActive).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {segments?.reduce((acc: number, s: any) => acc + (s.customerCount || 0), 0) || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg per Segment</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {segments && segments.length > 0
                  ? Math.round(segments.reduce((acc: number, s: any) => acc + (s.customerCount || 0), 0) / segments.length)
                  : 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-4">
          <Label>Filter:</Label>
          <Select value={filterActive} onValueChange={setFilterActive}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All segments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Segments</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Segments Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Segments</CardTitle>
            <CardDescription>
              Manage your customer segments and their criteria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : segments && segments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Criteria</TableHead>
                    <TableHead className="text-center">Customers</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {segments.map((segment: any) => (
                    <TableRow key={segment.id}>
                      <TableCell className="font-medium">{segment.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {segment.description || "-"}
                      </TableCell>
                      <TableCell className="max-w-[250px] truncate text-sm text-muted-foreground">
                        {formatCriteria(segment.criteria)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary">{segment.customerCount || 0}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant={segment.isActive ? "default" : "outline"}>
                          {segment.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(segment.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(segment)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(segment.id)}
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
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No segments yet</h3>
                <p className="text-muted-foreground">
                  Create your first customer segment to start targeting
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Customer Segment</DialogTitle>
              <DialogDescription>
                Update segment criteria and settings
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Segment Name</Label>
                <Input
                  id="edit-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Min Orders</Label>
                  <Input
                    type="number"
                    value={criteria.minOrders || ""}
                    onChange={(e) => setCriteria({ ...criteria, minOrders: parseInt(e.target.value) || undefined })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Max Orders</Label>
                  <Input
                    type="number"
                    value={criteria.maxOrders || ""}
                    onChange={(e) => setCriteria({ ...criteria, maxOrders: parseInt(e.target.value) || undefined })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Min Spent (FCFA)</Label>
                  <Input
                    type="number"
                    value={criteria.minSpent ? criteria.minSpent / 100 : ""}
                    onChange={(e) => setCriteria({ ...criteria, minSpent: (parseInt(e.target.value) || 0) * 100 })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Max Spent (FCFA)</Label>
                  <Input
                    type="number"
                    value={criteria.maxSpent ? criteria.maxSpent / 100 : ""}
                    onChange={(e) => setCriteria({ ...criteria, maxSpent: (parseInt(e.target.value) || 0) * 100 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Location</Label>
                  <Input
                    value={criteria.location || ""}
                    onChange={(e) => setCriteria({ ...criteria, location: e.target.value || undefined })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Last Order Within (days)</Label>
                  <Input
                    type="number"
                    value={criteria.lastOrderDays || ""}
                    onChange={(e) => setCriteria({ ...criteria, lastOrderDays: parseInt(e.target.value) || undefined })}
                  />
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
