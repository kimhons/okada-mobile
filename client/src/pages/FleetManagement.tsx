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
import { Plus, Pencil, Trash2, Car, Wrench, Bike, Truck, RefreshCw, Calendar, DollarSign, AlertTriangle, CheckCircle2 } from "lucide-react";

const VEHICLE_TYPES = [
  { value: "motorcycle", label: "Motorcycle", icon: Bike },
  { value: "bicycle", label: "Bicycle", icon: Bike },
  { value: "car", label: "Car", icon: Car },
  { value: "van", label: "Van", icon: Truck },
  { value: "truck", label: "Truck", icon: Truck },
];

const VEHICLE_STATUSES = [
  { value: "available", label: "Available", color: "bg-green-500" },
  { value: "in_use", label: "In Use", color: "bg-blue-500" },
  { value: "maintenance", label: "Maintenance", color: "bg-yellow-500" },
  { value: "retired", label: "Retired", color: "bg-gray-500" },
];

const MAINTENANCE_TYPES = [
  { value: "routine", label: "Routine" },
  { value: "repair", label: "Repair" },
  { value: "inspection", label: "Inspection" },
  { value: "emergency", label: "Emergency" },
];

const MAINTENANCE_STATUSES = [
  { value: "scheduled", label: "Scheduled", color: "bg-blue-500" },
  { value: "in_progress", label: "In Progress", color: "bg-yellow-500" },
  { value: "completed", label: "Completed", color: "bg-green-500" },
  { value: "cancelled", label: "Cancelled", color: "bg-gray-500" },
];

export default function FleetManagement() {
  const [activeTab, setActiveTab] = useState("vehicles");
  const [isCreateVehicleOpen, setIsCreateVehicleOpen] = useState(false);
  const [isCreateMaintenanceOpen, setIsCreateMaintenanceOpen] = useState(false);
  const [isEditVehicleOpen, setIsEditVehicleOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  
  // Vehicle form state
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleType, setVehicleType] = useState<string>("motorcycle");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [color, setColor] = useState("");
  const [vehicleStatus, setVehicleStatus] = useState<string>("available");
  const [insuranceExpiry, setInsuranceExpiry] = useState("");
  const [insuranceProvider, setInsuranceProvider] = useState("");
  
  // Maintenance form state
  const [maintenanceVehicleId, setMaintenanceVehicleId] = useState<number | null>(null);
  const [maintenanceType, setMaintenanceType] = useState<string>("routine");
  const [maintenanceDescription, setMaintenanceDescription] = useState("");
  const [maintenanceCost, setMaintenanceCost] = useState("");
  const [maintenanceStatus, setMaintenanceStatus] = useState<string>("scheduled");
  const [scheduledDate, setScheduledDate] = useState("");
  const [maintenanceNotes, setMaintenanceNotes] = useState("");
  
  const utils = trpc.useUtils();
  
  const { data: vehicles, isLoading: vehiclesLoading } = trpc.fleet.listVehicles.useQuery({
    status: filterStatus === "all" ? undefined : filterStatus,
    type: filterType === "all" ? undefined : filterType,
  });
  
  const { data: maintenance, isLoading: maintenanceLoading } = trpc.fleet.listMaintenance.useQuery({});
  
  const { data: riders } = trpc.riders.list.useQuery({});
  
  const createVehicleMutation = trpc.fleet.createVehicle.useMutation({
    onSuccess: () => {
      toast.success("Vehicle added successfully");
      setIsCreateVehicleOpen(false);
      resetVehicleForm();
      utils.fleet.listVehicles.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateVehicleMutation = trpc.fleet.updateVehicle.useMutation({
    onSuccess: () => {
      toast.success("Vehicle updated successfully");
      setIsEditVehicleOpen(false);
      setSelectedVehicle(null);
      utils.fleet.listVehicles.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteVehicleMutation = trpc.fleet.deleteVehicle.useMutation({
    onSuccess: () => {
      toast.success("Vehicle deleted successfully");
      utils.fleet.listVehicles.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const createMaintenanceMutation = trpc.fleet.createMaintenance.useMutation({
    onSuccess: () => {
      toast.success("Maintenance scheduled successfully");
      setIsCreateMaintenanceOpen(false);
      resetMaintenanceForm();
      utils.fleet.listMaintenance.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateMaintenanceMutation = trpc.fleet.updateMaintenance.useMutation({
    onSuccess: () => {
      toast.success("Maintenance updated successfully");
      utils.fleet.listMaintenance.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const resetVehicleForm = () => {
    setPlateNumber("");
    setVehicleType("motorcycle");
    setMake("");
    setModel("");
    setYear("");
    setColor("");
    setVehicleStatus("available");
    setInsuranceExpiry("");
    setInsuranceProvider("");
  };
  
  const resetMaintenanceForm = () => {
    setMaintenanceVehicleId(null);
    setMaintenanceType("routine");
    setMaintenanceDescription("");
    setMaintenanceCost("");
    setMaintenanceStatus("scheduled");
    setScheduledDate("");
    setMaintenanceNotes("");
  };
  
  const handleCreateVehicle = () => {
    createVehicleMutation.mutate({
      plateNumber,
      type: vehicleType as any,
      make,
      model,
      year: year ? parseInt(year) : undefined,
      color,
      status: vehicleStatus as any,
      insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : undefined,
      insuranceProvider,
    });
  };
  
  const handleEditVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    setPlateNumber(vehicle.plateNumber);
    setVehicleType(vehicle.type);
    setMake(vehicle.make || "");
    setModel(vehicle.model || "");
    setYear(vehicle.year?.toString() || "");
    setColor(vehicle.color || "");
    setVehicleStatus(vehicle.status);
    setInsuranceExpiry(vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toISOString().split("T")[0] : "");
    setInsuranceProvider(vehicle.insuranceProvider || "");
    setIsEditVehicleOpen(true);
  };
  
  const handleUpdateVehicle = () => {
    if (!selectedVehicle) return;
    updateVehicleMutation.mutate({
      id: selectedVehicle.id,
      plateNumber,
      type: vehicleType as any,
      make,
      model,
      year: year ? parseInt(year) : undefined,
      color,
      status: vehicleStatus as any,
      insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : undefined,
      insuranceProvider,
    });
  };
  
  const handleDeleteVehicle = (id: number) => {
    if (confirm("Are you sure you want to delete this vehicle?")) {
      deleteVehicleMutation.mutate({ id });
    }
  };
  
  const handleCreateMaintenance = () => {
    if (!maintenanceVehicleId) return;
    createMaintenanceMutation.mutate({
      vehicleId: maintenanceVehicleId,
      type: maintenanceType as any,
      description: maintenanceDescription,
      cost: parseInt(maintenanceCost) * 100, // Convert to cents
      status: maintenanceStatus as any,
      scheduledDate: new Date(scheduledDate),
      notes: maintenanceNotes,
    });
  };
  
  const handleCompleteMaintenance = (id: number) => {
    updateMaintenanceMutation.mutate({
      id,
      status: "completed",
      completedDate: new Date(),
    });
  };
  
  const getStatusBadge = (status: string, type: "vehicle" | "maintenance") => {
    const statuses = type === "vehicle" ? VEHICLE_STATUSES : MAINTENANCE_STATUSES;
    const config = statuses.find(s => s.value === status);
    return (
      <Badge className={`${config?.color || "bg-gray-500"} text-white`}>
        {config?.label || status}
      </Badge>
    );
  };
  
  const getVehicleIcon = (type: string) => {
    const config = VEHICLE_TYPES.find(t => t.value === type);
    const Icon = config?.icon || Car;
    return <Icon className="h-4 w-4" />;
  };
  
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };
  
  const isInsuranceExpiringSoon = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow;
  };
  
  // Calculate stats
  const availableVehicles = vehicles?.filter((v: any) => v.status === "available").length || 0;
  const inUseVehicles = vehicles?.filter((v: any) => v.status === "in_use").length || 0;
  const maintenanceVehicles = vehicles?.filter((v: any) => v.status === "maintenance").length || 0;
  const pendingMaintenance = maintenance?.filter((m: any) => m.status === "scheduled" || m.status === "in_progress").length || 0;
  const totalMaintenanceCost = maintenance?.reduce((acc: number, m: any) => acc + (m.cost || 0), 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Fleet Management</h1>
            <p className="text-muted-foreground">
              Manage vehicles and maintenance schedules
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{availableVehicles}</div>
              <p className="text-xs text-muted-foreground">Ready for use</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Use</CardTitle>
              <Car className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-500">{inUseVehicles}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
              <Wrench className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-500">{maintenanceVehicles}</div>
              <p className="text-xs text-muted-foreground">Being serviced</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">{pendingMaintenance}</div>
              <p className="text-xs text-muted-foreground">Maintenance tasks</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalMaintenanceCost)}</div>
              <p className="text-xs text-muted-foreground">Maintenance spend</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
              <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              {activeTab === "vehicles" && (
                <Dialog open={isCreateVehicleOpen} onOpenChange={setIsCreateVehicleOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetVehicleForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Vehicle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Add New Vehicle</DialogTitle>
                      <DialogDescription>
                        Register a new vehicle to the fleet
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Plate Number *</Label>
                          <Input
                            value={plateNumber}
                            onChange={(e) => setPlateNumber(e.target.value)}
                            placeholder="e.g., LT 123 ABC"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Vehicle Type *</Label>
                          <Select value={vehicleType} onValueChange={setVehicleType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {VEHICLE_TYPES.map((type) => (
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
                          <Label>Make</Label>
                          <Input
                            value={make}
                            onChange={(e) => setMake(e.target.value)}
                            placeholder="e.g., Honda"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Model</Label>
                          <Input
                            value={model}
                            onChange={(e) => setModel(e.target.value)}
                            placeholder="e.g., CB125F"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Year</Label>
                          <Input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            placeholder="e.g., 2023"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Color</Label>
                          <Input
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            placeholder="e.g., Red"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Status</Label>
                        <Select value={vehicleStatus} onValueChange={setVehicleStatus}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {VEHICLE_STATUSES.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Insurance Expiry</Label>
                          <Input
                            type="date"
                            value={insuranceExpiry}
                            onChange={(e) => setInsuranceExpiry(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Insurance Provider</Label>
                          <Input
                            value={insuranceProvider}
                            onChange={(e) => setInsuranceProvider(e.target.value)}
                            placeholder="Provider name"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateVehicleOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateVehicle} disabled={!plateNumber || createVehicleMutation.isPending}>
                        {createVehicleMutation.isPending ? "Adding..." : "Add Vehicle"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {activeTab === "maintenance" && (
                <Dialog open={isCreateMaintenanceOpen} onOpenChange={setIsCreateMaintenanceOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetMaintenanceForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Schedule Maintenance
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Schedule Maintenance</DialogTitle>
                      <DialogDescription>
                        Schedule maintenance for a vehicle
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Vehicle *</Label>
                        <Select
                          value={maintenanceVehicleId?.toString() || ""}
                          onValueChange={(v) => setMaintenanceVehicleId(parseInt(v))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles?.map((vehicle: any) => (
                              <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                                {vehicle.plateNumber} - {vehicle.make} {vehicle.model}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Type *</Label>
                          <Select value={maintenanceType} onValueChange={setMaintenanceType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MAINTENANCE_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Scheduled Date *</Label>
                          <Input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Description *</Label>
                        <Textarea
                          value={maintenanceDescription}
                          onChange={(e) => setMaintenanceDescription(e.target.value)}
                          placeholder="Describe the maintenance work..."
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Estimated Cost (FCFA) *</Label>
                          <Input
                            type="number"
                            value={maintenanceCost}
                            onChange={(e) => setMaintenanceCost(e.target.value)}
                            placeholder="Cost estimate"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Status</Label>
                          <Select value={maintenanceStatus} onValueChange={setMaintenanceStatus}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {MAINTENANCE_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={maintenanceNotes}
                          onChange={(e) => setMaintenanceNotes(e.target.value)}
                          placeholder="Additional notes..."
                          rows={2}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateMaintenanceOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateMaintenance}
                        disabled={!maintenanceVehicleId || !maintenanceDescription || !scheduledDate || !maintenanceCost || createMaintenanceMutation.isPending}
                      >
                        {createMaintenanceMutation.isPending ? "Scheduling..." : "Schedule"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <TabsContent value="vehicles" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <Label>Filters:</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {VEHICLE_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {VEHICLE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Fleet Vehicles</CardTitle>
                <CardDescription>
                  Manage your delivery fleet
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vehiclesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : vehicles && vehicles.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead>Insurance</TableHead>
                        <TableHead className="text-right">Mileage</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicles.map((vehicle: any) => (
                        <TableRow key={vehicle.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{vehicle.plateNumber}</div>
                              <div className="text-sm text-muted-foreground">
                                {vehicle.make} {vehicle.model} {vehicle.year && `(${vehicle.year})`}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getVehicleIcon(vehicle.type)}
                              <span className="capitalize">{vehicle.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {vehicle.assignedRiderId
                              ? riders?.find((r: any) => r.id === vehicle.assignedRiderId)?.name || `Rider #${vehicle.assignedRiderId}`
                              : "-"}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(vehicle.status, "vehicle")}
                          </TableCell>
                          <TableCell>
                            {vehicle.insuranceExpiry ? (
                              <div className="flex items-center gap-1">
                                {isInsuranceExpiringSoon(vehicle.insuranceExpiry) && (
                                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                                )}
                                <span className={isInsuranceExpiringSoon(vehicle.insuranceExpiry) ? "text-orange-500" : ""}>
                                  {new Date(vehicle.insuranceExpiry).toLocaleDateString()}
                                </span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {vehicle.totalMileage ? `${vehicle.totalMileage.toLocaleString()} km` : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditVehicle(vehicle)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteVehicle(vehicle.id)}
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
                    <Car className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No vehicles yet</h3>
                    <p className="text-muted-foreground">
                      Add your first vehicle to the fleet
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Maintenance Schedule</CardTitle>
                <CardDescription>
                  Track vehicle maintenance and repairs
                </CardDescription>
              </CardHeader>
              <CardContent>
                {maintenanceLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : maintenance && maintenance.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Scheduled</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Cost</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {maintenance.map((m: any) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">
                            {vehicles?.find((v: any) => v.id === m.vehicleId)?.plateNumber || `ID: ${m.vehicleId}`}
                          </TableCell>
                          <TableCell className="capitalize">{m.type}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {m.description}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(m.scheduledDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(m.status, "maintenance")}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(m.cost)}
                          </TableCell>
                          <TableCell className="text-right">
                            {(m.status === "scheduled" || m.status === "in_progress") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCompleteMaintenance(m.id)}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No maintenance records</h3>
                    <p className="text-muted-foreground">
                      Schedule maintenance for your vehicles
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Vehicle Dialog */}
        <Dialog open={isEditVehicleOpen} onOpenChange={setIsEditVehicleOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Vehicle</DialogTitle>
              <DialogDescription>
                Update vehicle information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Plate Number *</Label>
                  <Input
                    value={plateNumber}
                    onChange={(e) => setPlateNumber(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Vehicle Type *</Label>
                  <Select value={vehicleType} onValueChange={setVehicleType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map((type) => (
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
                  <Label>Make</Label>
                  <Input
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Model</Label>
                  <Input
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Year</Label>
                  <Input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Color</Label>
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={vehicleStatus} onValueChange={setVehicleStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Insurance Expiry</Label>
                  <Input
                    type="date"
                    value={insuranceExpiry}
                    onChange={(e) => setInsuranceExpiry(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Insurance Provider</Label>
                  <Input
                    value={insuranceProvider}
                    onChange={(e) => setInsuranceProvider(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditVehicleOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateVehicle} disabled={!plateNumber || updateVehicleMutation.isPending}>
                {updateVehicleMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
