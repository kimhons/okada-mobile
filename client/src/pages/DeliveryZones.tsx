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
import { MapPin, Plus, Edit, Trash2, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useI18nLoader } from "@/hooks/useI18nLoader";

export default function DeliveryZones() {
  const { t } = useTranslation("zones");
  useI18nLoader(["zones"]);

  const { data: zones, isLoading, refetch } = trpc.deliveryZones.getAll.useQuery();
  const createZone = trpc.deliveryZones.create.useMutation({
    onSuccess: () => {
      toast.success(t("toast.createSuccess"));
      refetch();
      setShowCreateDialog(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const updateZone = trpc.deliveryZones.update.useMutation({
    onSuccess: () => {
      toast.success(t("toast.updateSuccess"));
      refetch();
      setShowEditDialog(false);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  const deleteZone = trpc.deliveryZones.delete.useMutation({
    onSuccess: () => {
      toast.success(t("toast.deleteSuccess"));
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
    if (confirm(t("deleteConfirm"))) {
      deleteZone.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">{t("loading")}</div>
      </div>
    );
  };

  const doualaZones = zones?.filter((z) => z.city === "douala") || [];
  const yaoundeZones = zones?.filter((z) => z.city === "yaounde") || [];

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mt-2">
            {t("subtitle")}
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("addZone")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("dialog.createTitle")}</DialogTitle>
              <DialogDescription>
                {t("dialog.createDescription")}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("dialog.zoneName")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t("dialog.zoneNamePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t("dialog.city")}</Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="douala">{t("cities.douala")}</SelectItem>
                    <SelectItem value="yaounde">{t("cities.yaounde")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="baseFee">{t("dialog.baseFee")}</Label>
                <Input
                  id="baseFee"
                  type="number"
                  value={formData.baseFee}
                  onChange={(e) => setFormData({ ...formData, baseFee: parseFloat(e.target.value) })}
                  placeholder="500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="perKmFee">{t("dialog.perKmFee")}</Label>
                <Input
                  id="perKmFee"
                  type="number"
                  value={formData.perKmFee}
                  onChange={(e) => setFormData({ ...formData, perKmFee: parseFloat(e.target.value) })}
                  placeholder="100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedMinutes">{t("dialog.estimatedTime")}</Label>
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
                {t("dialog.cancel")}
              </Button>
              <Button onClick={handleCreate}>{t("dialog.create")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {t("cards.doualaZones")}
            </CardTitle>
            <CardDescription>
              {doualaZones.length} {t("cards.zonesConfigured")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {doualaZones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("cards.noZonesDouala")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.zone")}</TableHead>
                    <TableHead>{t("table.pricing")}</TableHead>
                    <TableHead>{t("table.time")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead>{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {doualaZones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatCurrency(zone.baseFee)} {t("table.base")}</div>
                          <div className="text-muted-foreground">
                            +{formatCurrency(zone.perKmFee)}{t("table.perKm")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {zone.minDeliveryTime || '-'} {t("table.min")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={zone.isActive ? "default" : "secondary"}>
                          {zone.isActive ? t("table.active") : t("table.inactive")}
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
              {t("cards.yaoundeZones")}
            </CardTitle>
            <CardDescription>
              {yaoundeZones.length} {t("cards.zonesConfigured")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {yaoundeZones.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {t("cards.noZonesYaounde")}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("table.zone")}</TableHead>
                    <TableHead>{t("table.pricing")}</TableHead>
                    <TableHead>{t("table.time")}</TableHead>
                    <TableHead>{t("table.status")}</TableHead>
                    <TableHead>{t("table.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {yaoundeZones.map((zone) => (
                    <TableRow key={zone.id}>
                      <TableCell className="font-medium">{zone.name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatCurrency(zone.baseFee)} {t("table.base")}</div>
                          <div className="text-muted-foreground">
                            +{formatCurrency(zone.perKmFee)}{t("table.perKm")}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3 w-3" />
                          {zone.minDeliveryTime || '-'} {t("table.min")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={zone.isActive ? "default" : "secondary"}>
                          {zone.isActive ? t("table.active") : t("table.inactive")}
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

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dialog.editTitle")}</DialogTitle>
            <DialogDescription>
              {t("dialog.editDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t("dialog.zoneName")}</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t("dialog.zoneNamePlaceholder")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-city">{t("dialog.city")}</Label>
              <Select
                value={formData.city}
                onValueChange={(value) => setFormData({ ...formData, city: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="douala">{t("cities.douala")}</SelectItem>
                  <SelectItem value="yaounde">{t("cities.yaounde")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-baseFee">{t("dialog.baseFee")}</Label>
              <Input
                id="edit-baseFee"
                type="number"
                value={formData.baseFee}
                onChange={(e) => setFormData({ ...formData, baseFee: parseFloat(e.target.value) })}
                placeholder="500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-perKmFee">{t("dialog.perKmFee")}</Label>
              <Input
                id="edit-perKmFee"
                type="number"
                value={formData.perKmFee}
                onChange={(e) => setFormData({ ...formData, perKmFee: parseFloat(e.target.value) })}
                placeholder="100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-estimatedMinutes">{t("dialog.estimatedTime")}</Label>
              <Input
                id="edit-estimatedMinutes"
                type="number"
                value={formData.estimatedMinutes}
                onChange={(e) => setFormData({ ...formData, estimatedMinutes: parseInt(e.target.value) })}
                placeholder="30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              {t("dialog.cancel")}
            </Button>
            <Button onClick={handleUpdate}>{t("dialog.update")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
