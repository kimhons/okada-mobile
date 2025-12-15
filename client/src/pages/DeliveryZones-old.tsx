import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, Plus, Edit, Trash2, Clock, DollarSign } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DeliveryZones() {
  const { data: zones, isLoading, refetch } = trpc.deliveryZones.list.useQuery();
  const createZone = trpc.deliveryZones.create.useMutation({
    onSuccess: () => {
      toast.success("Delivery zone created successfully");
      refetch();
      setShowCreateDialog(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateZone = trpc.deliveryZones.update.useMutation({
    onSuccess: () => {
      toast.success("Delivery zone updated successfully");
      refetch();
      setShowEditDialog(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deleteZone = trpc.deliveryZones.delete.useMutation({
    onSuccess: () => {
      toast.success("Delivery zone deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    city: "douala",
    baseFee: 0,
    perKmFee: 0,
    estimatedMinutes: 30,
    isActive: true,
  });

  const formatCurrency = (cents: number) => {
    return `${(cents / 100).toLocaleString()} FCFA`;
  };

  const handleCreate = () => {
    createZone.mutate({
      ...formData,
      baseFee: Math.round(formData.baseFee * 100),
      perKmFee: Math.round(formData.perKmFee * 100),
    });
  };

  const handleUpdate = () => {
    if (!selectedZone) return;
    updateZone.mutate({
      id: selectedZone.id,
      ...formData,
      baseFee: Math.round(formData.baseFee * 100),
      perKmFee: Math.round(formData.perKmFee * 100),
    });
  };

  const handleEdit = (zone: any) => {
    setSelectedZone(zone);
    setFormData({
      name: zone.name,
      city: zone.city,
      baseFee: zone.baseFee / 100,
      perKmFee: zone.perKmFee / 100,
      estimatedMinutes: zone.estimatedMinutes,
      isActive: zone.isActive,
    });
    setShowEditDialog(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this delivery zone?")) {
      deleteZone.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading delivery zones...</div>
      </div>
    );
  }

  const doualaZones = zones?.filter((z) => z.city === "douala") || [];
  const yaoundeZones = zones?.filter((z) => z.city === "yaounde") || [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Delivery Zones</h1>
          <p className="text-muted-foreground mt-2">
            Configure delivery zones for Douala and Yaoundé with pricing tiers and time estimates
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Zone
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Delivery Zone</DialogTitle>
              <DialogDescription>
                Add a new delivery zone with pricing and time estimates
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Zone Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Akwa, Bonanjo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="douala">Douala</SelectItem>
                    <SelectItem value="yaounde">Yaoundé</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseFee">Base Fee (FCFA)</Label>
                <Input
                  id="baseFee"
                  type="number"
                  value={formData.baseFee}
                  onChange={(e) => setFormData({ ...formData, baseFee: parseFloat(e.target.value) })}
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="perKmFee">Per KM Fee (FCFA)</Label>
                <Input
                  id="perKmFee"
                  type="number"
                  value={formData.perKmFee}
                  onChange={(e) => setFormData({ ...formData, perKmFee: parseFloat(e.target.value) })}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedMinutes">Estimated Delivery Time (minutes)</Label>
                <Input
                  id="estimatedMinutes"
                  type="number"
                  value={formData.estimatedMinutes}
                  onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) })}
                  placeholder="30"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Zone</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Douala Zones
            </CardTitle>
            <CardDescription>
              {doualaZones.length} delivery zones configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {doualaZones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No delivery zones configured for Douala
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doualaZones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatCurrency(zone.baseFee)} base</div>
                          <div className="text-muted-foreground">
                            +{formatCurrency(zone.perKmFee)}/km
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {zone.estimatedMinutes} min
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={zone.isActive ? "default" : "secondary"}>
                          {zone.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(zone)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(zone.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Yaoundé Zones
            </CardTitle>
            <CardDescription>
              {yaoundeZones.length} delivery zones configured
            </CardDescription>
          </CardHeader>
          <CardContent>
            {yaoundeZones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No delivery zones configured for Yaoundé
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Zone</TableHead>
                    <TableHead>Pricing</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yaoundeZones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatCurrency(zone.baseFee)} base</div>
                          <div className="text-muted-foreground">
                            +{formatCurrency(zone.perKmFee)}/km
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {zone.estimatedMinutes} min
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={zone.isActive ? "default" : "secondary"}>
                          {zone.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(zone)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(zone.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Delivery Zone</DialogTitle>
            <DialogDescription>
              Update zone pricing and time estimates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Zone Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">City</Label>
              <Select
                value={formData.city}
                onValueChange={(value) => setFormData({ ...formData, city: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="douala">Douala</SelectItem>
                  <SelectItem value="yaounde">Yaoundé</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-baseFee">Base Fee (FCFA)</Label>
              <Input
                id="edit-baseFee"
                type="number"
                value={formData.baseFee}
                onChange={(e) => setFormData({ ...formData, baseFee: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-perKmFee">Per KM Fee (FCFA)</Label>
              <Input
                id="edit-perKmFee"
                type="number"
                value={formData.perKmFee}
                onChange={(e) => setFormData({ ...formData, perKmFee: parseFloat(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-estimatedMinutes">Estimated Delivery Time (minutes)</Label>
              <Input
                id="edit-estimatedMinutes"
                type="number"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Update Zone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

