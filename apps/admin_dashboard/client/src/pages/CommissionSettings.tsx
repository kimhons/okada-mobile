import { useState } from "react";
import { useTranslation } from "react-i18next";
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Settings, Percent, DollarSign, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function CommissionSettings() {
  const { t } = useTranslation();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<number>(0);
  const [editIsActive, setEditIsActive] = useState<boolean>(true);

  const { data: settings, isLoading, refetch } = trpc.financial.getCommissionSettings.useQuery();

  const updateSetting = trpc.financial.updateCommissionSetting.useMutation({
    onSuccess: () => {
      toast.success("Commission setting updated successfully");
      setEditingId(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update setting: ${error.message}`);
    },
  });

  const handleEdit = (setting: any) => {
    setEditingId(setting.id);
    setEditValue(setting.value);
    setEditIsActive(setting.isActive);
  };

  const handleSave = () => {
    if (editingId === null) return;

    updateSetting.mutate({
      id: editingId,
      value: editValue,
      isActive: editIsActive,
    });
  };

  const formatValue = (value: number, type: string) => {
    if (type === "percentage") {
      return `${value}%`;
    }
    return `${(value / 100).toLocaleString()} FCFA`;
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading commission settings...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: t("commission:seller_commission"),
      value: settings?.find((s: any) => s.entityType === "seller")?.value || 15,
      suffix: "%",
      icon: DollarSign,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: t("commission:rider_commission"),
      value: settings?.find((s: any) => s.entityType === "rider")?.value || 20,
      suffix: "%",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: t("commission:active_settings"),
      value: settings?.filter((s: any) => s.isActive).length || 0,
      suffix: "",
      icon: Settings,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: t("commission:total_settings"),
      value: settings?.length || 0,
      suffix: "",
      icon: Percent,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("commission:title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("commission:description")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stat.value}
                  {stat.suffix}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Commission Settings Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t("commission:configuration_title")}</CardTitle>
          <CardDescription>
            {t("commission:configuration_description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("commission:entity_type")}</TableHead>
                  <TableHead>{t("commission:commission_type")}</TableHead>
                  <TableHead className="text-right">{t("commission:value")}</TableHead>
                  <TableHead className="text-right">{t("commission:min_amount")}</TableHead>
                  <TableHead className="text-right">{t("commission:max_amount")}</TableHead>
                  <TableHead>{t("commission:status")}</TableHead>
                  <TableHead className="text-right">{t("commission:actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!settings || settings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {t("commission:no_settings")}
                    </TableCell>
                  </TableRow>
                ) : (
                  settings.map((setting: any) => (
                    <TableRow key={setting.id}>
                      <TableCell className="font-medium capitalize">
                        {setting.entityType}
                      </TableCell>
                      <TableCell className="capitalize">{setting.commissionType}</TableCell>
                      <TableCell className="text-right">
                        {formatValue(setting.value, setting.commissionType)}
                      </TableCell>
                      <TableCell className="text-right">
                        {setting.minAmount ? `${(setting.minAmount / 100).toLocaleString()} FCFA` : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        {setting.maxAmount ? `${(setting.maxAmount / 100).toLocaleString()} FCFA` : "N/A"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={setting.isActive ? "default" : "secondary"}>
                          {setting.isActive ? t("commission:active") : t("commission:inactive")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(setting)}
                        >
                          {t("commission:edit")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editingId !== null} onOpenChange={(open) => !open && setEditingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("commission:edit_dialog_title")}</DialogTitle>
            <DialogDescription>
              {t("commission:edit_dialog_description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="value">
                {t("commission:commission_value")}{" "}
                {settings?.find((s: any) => s.id === editingId)?.commissionType === "percentage"
                  ? "(%)"
                  : "(FCFA cents)"}
              </Label>
              <Input
                id="value"
                type="number"
                value={editValue}
                onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                placeholder="Enter value"
              />
              <p className="text-xs text-muted-foreground">
                {settings?.find((s: any) => s.id === editingId)?.commissionType === "percentage"
                  ? "Enter percentage value (e.g., 15 for 15%)"
                  : "Enter amount in cents (e.g., 50000 for 500 FCFA)"}
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={editIsActive}
                onCheckedChange={setEditIsActive}
              />
              <Label htmlFor="isActive">{t("commission:active")}</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingId(null)}>
              {t("commission:cancel")}
            </Button>
            <Button onClick={handleSave} disabled={updateSetting.isPending}>
              {updateSetting.isPending ? t("commission:saving") : t("commission:save_changes")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

