import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, Plus, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function SystemSettings() {
  const [category, setCategory] = useState<string>("all");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<any>(null);
  const [editValue, setEditValue] = useState("");
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const [newSetting, setNewSetting] = useState({
    settingKey: "",
    settingValue: "",
    settingType: "string" as "string" | "number" | "boolean" | "json",
    category: "general",
    description: "",
    isPublic: false,
  });

  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.systemSettings.getAll.useQuery({
    category: category === "all" ? undefined : category,
  });

  const updateMutation = trpc.systemSettings.update.useMutation({
    onSuccess: () => {
      toast.success("Setting updated successfully");
      utils.systemSettings.getAll.invalidate();
      setEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to update setting: ${error.message}`);
    },
  });

  const createMutation = trpc.systemSettings.create.useMutation({
    onSuccess: () => {
      toast.success("Setting created successfully");
      utils.systemSettings.getAll.invalidate();
      setCreateDialogOpen(false);
      setNewSetting({
        settingKey: "",
        settingValue: "",
        settingType: "string",
        category: "general",
        description: "",
        isPublic: false,
      });
    },
    onError: (error) => {
      toast.error(`Failed to create setting: ${error.message}`);
    },
  });

  const handleEdit = (setting: any) => {
    setSelectedSetting(setting);
    setEditValue(setting.settingValue);
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (selectedSetting) {
      updateMutation.mutate({
        key: selectedSetting.settingKey,
        value: editValue,
      });
    }
  };

  const handleCreate = () => {
    createMutation.mutate(newSetting);
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isSecretField = (key: string) => {
    return key.toLowerCase().includes("secret") || 
           key.toLowerCase().includes("password") || 
           key.toLowerCase().includes("key") ||
           key.toLowerCase().includes("token");
  };

  const maskValue = (value: string) => {
    return "•".repeat(Math.min(value.length, 20));
  };

  const getCategoryBadgeColor = (cat: string) => {
    const colors: Record<string, string> = {
      general: "bg-gray-100 text-gray-800",
      payment: "bg-green-100 text-green-800",
      delivery: "bg-blue-100 text-blue-800",
      notification: "bg-purple-100 text-purple-800",
      security: "bg-red-100 text-red-800",
      api: "bg-yellow-100 text-yellow-800",
      feature_flags: "bg-indigo-100 text-indigo-800",
    };
    return colors[cat] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-8 w-8" />
            System Settings
          </h1>
          <p className="text-muted-foreground">
            Configure platform settings and feature flags
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Setting
        </Button>
      </div>

      <div className="flex gap-2">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="general">General</SelectItem>
            <SelectItem value="payment">Payment</SelectItem>
            <SelectItem value="delivery">Delivery</SelectItem>
            <SelectItem value="notification">Notification</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="api">API</SelectItem>
            <SelectItem value="feature_flags">Feature Flags</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading settings...
            </CardContent>
          </Card>
        ) : !settings || settings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No settings found
            </CardContent>
          </Card>
        ) : (
          settings.map((setting: any) => (
            <Card key={setting.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{setting.settingKey}</CardTitle>
                      <Badge className={getCategoryBadgeColor(setting.category)}>
                        {setting.category}
                      </Badge>
                      <Badge variant="outline">{setting.settingType}</Badge>
                      {setting.isPublic === 1 && (
                        <Badge variant="secondary">Public</Badge>
                      )}
                    </div>
                    {setting.description && (
                      <CardDescription className="mt-1">
                        {setting.description}
                      </CardDescription>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(setting)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <div className="flex-1 font-mono text-sm bg-muted p-3 rounded">
                    {isSecretField(setting.settingKey) && !showSecrets[setting.settingKey]
                      ? maskValue(setting.settingValue)
                      : setting.settingValue}
                  </div>
                  {isSecretField(setting.settingKey) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleSecretVisibility(setting.settingKey)}
                    >
                      {showSecrets[setting.settingKey] ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Last updated: {new Date(setting.updatedAt).toLocaleString()}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Setting</DialogTitle>
            <DialogDescription>
              Update the value for {selectedSetting?.settingKey}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Setting Key</Label>
              <Input value={selectedSetting?.settingKey || ""} disabled />
            </div>
            <div>
              <Label>Value</Label>
              {selectedSetting?.settingType === "json" ? (
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={6}
                  className="font-mono text-sm"
                />
              ) : (
                <Input
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  type={selectedSetting?.settingType === "number" ? "number" : "text"}
                />
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={updateMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Setting</DialogTitle>
            <DialogDescription>
              Add a new system setting
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Setting Key</Label>
              <Input
                value={newSetting.settingKey}
                onChange={(e) => setNewSetting({ ...newSetting, settingKey: e.target.value })}
                placeholder="e.g., max_delivery_distance"
              />
            </div>
            <div>
              <Label>Value</Label>
              <Input
                value={newSetting.settingValue}
                onChange={(e) => setNewSetting({ ...newSetting, settingValue: e.target.value })}
                placeholder="Setting value"
              />
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={newSetting.settingType}
                onValueChange={(value: any) => setNewSetting({ ...newSetting, settingType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={newSetting.category}
                onValueChange={(value) => setNewSetting({ ...newSetting, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="delivery">Delivery</SelectItem>
                  <SelectItem value="notification">Notification</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="feature_flags">Feature Flags</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Description (optional)</Label>
              <Textarea
                value={newSetting.description}
                onChange={(e) => setNewSetting({ ...newSetting, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>
              <Plus className="h-4 w-4 mr-2" />
              Create Setting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
