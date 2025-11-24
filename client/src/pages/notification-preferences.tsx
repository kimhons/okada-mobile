import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Settings, Edit, CheckCircle, XCircle, Mail, Bell, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function NotificationPreferences() {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedPreference, setSelectedPreference] = useState<any>(null);
  
  // Form state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promotions, setPromotions] = useState(true);
  const [newsletter, setNewsletter] = useState(false);
  const [riderUpdates, setRiderUpdates] = useState(true);
  const [paymentAlerts, setPaymentAlerts] = useState(true);

  const { data: preferences, isLoading, refetch } = trpc.notifications.getAllNotificationPreferences.useQuery();
  const updatePreferenceMutation = trpc.notifications.updateNotificationPreference.useMutation();

  const handleEdit = (preference: any) => {
    setSelectedPreference(preference);
    setEmailNotifications(preference.emailNotifications);
    setPushNotifications(preference.pushNotifications);
    setSmsNotifications(preference.smsNotifications);
    setOrderUpdates(preference.orderUpdates);
    setPromotions(preference.promotions);
    setNewsletter(preference.newsletter);
    setRiderUpdates(preference.riderUpdates);
    setPaymentAlerts(preference.paymentAlerts);
    setEditDialogOpen(true);
  };

  const confirmEdit = async () => {
    if (!selectedPreference) return;

    try {
      await updatePreferenceMutation.mutateAsync({
        userId: selectedPreference.userId,
        emailNotifications,
        pushNotifications,
        smsNotifications,
        orderUpdates,
        promotions,
        newsletter,
        riderUpdates,
        paymentAlerts,
      });

      toast.success("Notification preferences updated successfully");
      setEditDialogOpen(false);
      setSelectedPreference(null);
      refetch();
    } catch (error) {
      toast.error("Failed to update notification preferences");
    }
  };

  // Stats
  const totalUsers = preferences?.length || 0;
  const emailEnabled = preferences?.filter(p => p.emailNotifications).length || 0;
  const pushEnabled = preferences?.filter(p => p.pushNotifications).length || 0;
  const smsEnabled = preferences?.filter(p => p.smsNotifications).length || 0;

  const getChannelBadges = (preference: any) => {
    const channels = [];
    if (preference.emailNotifications) channels.push({ icon: Mail, label: "Email", color: "bg-blue-600" });
    if (preference.pushNotifications) channels.push({ icon: Bell, label: "Push", color: "bg-green-600" });
    if (preference.smsNotifications) channels.push({ icon: MessageSquare, label: "SMS", color: "bg-purple-600" });
    
    return channels.length > 0 ? (
      <div className="flex gap-1 flex-wrap">
        {channels.map((channel, idx) => {
          const Icon = channel.icon;
          return (
            <Badge key={idx} variant="default" className={`${channel.color} text-xs`}>
              <Icon className="h-3 w-3 mr-1" />
              {channel.label}
            </Badge>
          );
        })}
      </div>
    ) : (
      <Badge variant="secondary">None</Badge>
    );
  };

  const getPreferencesSummary = (preference: any) => {
    const enabled = [];
    if (preference.orderUpdates) enabled.push("Orders");
    if (preference.riderUpdates) enabled.push("Riders");
    if (preference.paymentAlerts) enabled.push("Payments");
    if (preference.promotions) enabled.push("Promos");
    if (preference.newsletter) enabled.push("Newsletter");
    
    return enabled.length > 0 ? enabled.join(", ") : "None";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Settings className="h-8 w-8 text-blue-600" />
            Notification Preferences
          </h1>
          <p className="text-muted-foreground mt-1">
            User notification settings and preferences management
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
            <p className="text-xs text-muted-foreground">With preferences set</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Enabled</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emailEnabled}</div>
            <p className="text-xs text-muted-foreground">
              {totalUsers > 0 ? Math.round((emailEnabled / totalUsers) * 100) : 0}% of users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Push Enabled</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pushEnabled}</div>
            <p className="text-xs text-muted-foreground">
              {totalUsers > 0 ? Math.round((pushEnabled / totalUsers) * 100) : 0}% of users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Enabled</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{smsEnabled}</div>
            <p className="text-xs text-muted-foreground">
              {totalUsers > 0 ? Math.round((smsEnabled / totalUsers) * 100) : 0}% of users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Preferences Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Notification Preferences</CardTitle>
          <CardDescription>
            {totalUsers} {totalUsers === 1 ? "user" : "users"} with notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading preferences...
            </div>
          ) : preferences && preferences.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User ID</TableHead>
                    <TableHead>Channels</TableHead>
                    <TableHead>Enabled Notifications</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preferences.map((preference) => (
                    <TableRow key={preference.id}>
                      <TableCell className="font-medium">
                        User #{preference.userId}
                      </TableCell>
                      <TableCell>
                        {getChannelBadges(preference)}
                      </TableCell>
                      <TableCell className="max-w-md">
                        <span className="text-sm">{getPreferencesSummary(preference)}</span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(preference.updatedAt), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEdit(preference)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No notification preferences found. Users will use default settings.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Preference Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Notification Preferences</DialogTitle>
            <DialogDescription>
              Update notification settings for User #{selectedPreference?.userId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            {/* Notification Channels */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Notification Channels</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="emailNotifications" className="cursor-pointer">
                      Email Notifications
                    </Label>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="pushNotifications" className="cursor-pointer">
                      Push Notifications
                    </Label>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="smsNotifications" className="cursor-pointer">
                      SMS Notifications
                    </Label>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                  />
                </div>
              </div>
            </div>

            {/* Notification Types */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Notification Types</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="orderUpdates" className="cursor-pointer">
                    Order Updates
                  </Label>
                  <Switch
                    id="orderUpdates"
                    checked={orderUpdates}
                    onCheckedChange={setOrderUpdates}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="riderUpdates" className="cursor-pointer">
                    Rider Updates
                  </Label>
                  <Switch
                    id="riderUpdates"
                    checked={riderUpdates}
                    onCheckedChange={setRiderUpdates}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="paymentAlerts" className="cursor-pointer">
                    Payment Alerts
                  </Label>
                  <Switch
                    id="paymentAlerts"
                    checked={paymentAlerts}
                    onCheckedChange={setPaymentAlerts}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="promotions" className="cursor-pointer">
                    Promotions & Offers
                  </Label>
                  <Switch
                    id="promotions"
                    checked={promotions}
                    onCheckedChange={setPromotions}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="newsletter" className="cursor-pointer">
                    Newsletter
                  </Label>
                  <Switch
                    id="newsletter"
                    checked={newsletter}
                    onCheckedChange={setNewsletter}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmEdit}
              disabled={updatePreferenceMutation.isPending}
            >
              {updatePreferenceMutation.isPending ? "Updating..." : "Update Preferences"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

