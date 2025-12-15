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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Send, Users, History } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function NotificationsCenter() {
  const [, setLocation] = useLocation();
  const { data: users } = trpc.users.list.useQuery();
  const sendBulk = trpc.notifications.sendBulk.useMutation({
    onSuccess: (data) => {
      toast.success(`Notification sent to ${data.count} users successfully`);
      setShowSendDialog(false);
      setFormData({
        title: "",
        message: "",
        type: "system",
        targetAudience: "all",
      });
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const [showSendDialog, setShowSendDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "system" as "order" | "delivery" | "payment" | "system",
    targetAudience: "all" as "all" | "specific",
  });

  const handleSend = () => {
    if (!formData.title || !formData.message) {
      toast.error("Title and message are required");
      return;
    }

    let userIds: number[] = [];
    
    if (formData.targetAudience === "all") {
      userIds = users?.map(u => u.id) || [];
    }

    if (userIds.length === 0) {
      toast.error("No users selected");
      return;
    }

    sendBulk.mutate({
      userIds,
      title: formData.title,
      message: formData.message,
      type: formData.type,
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Notifications Center</h1>
          <p className="text-muted-foreground mt-2">
            Compose and send push notifications to users
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setLocation("/notification-history")}
          >
            <History className="h-4 w-4" />
            View History
          </Button>
          <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Send className="h-4 w-4" />
                Send Notification
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Send Push Notification</DialogTitle>
                <DialogDescription>
                  Compose and send a notification to selected users
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Notification Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., New Promotion Available"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.title.length}/100 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Enter your notification message here..."
                    rows={5}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.message.length}/500 characters
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Notification Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="system">System</SelectItem>
                        <SelectItem value="order">Order</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                        <SelectItem value="payment">Payment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience</Label>
                    <Select
                      value={formData.targetAudience}
                      onValueChange={(value: any) => setFormData({ ...formData, targetAudience: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="specific">Specific Users</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {formData.targetAudience === "all" && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      This notification will be sent to <strong>{users?.length || 0} users</strong>
                    </span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSend} disabled={sendBulk.isPending}>
                  {sendBulk.isPending ? "Sending..." : "Send Notification"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered users in the system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notification Types</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
            <p className="text-xs text-muted-foreground">
              System, Order, Delivery, Payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Send</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowSendDialog(true)}
            >
              Compose Notification
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Templates</CardTitle>
          <CardDescription>
            Pre-defined notification templates for common scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => {
                setFormData({
                  title: "Order Delivered Successfully",
                  message: "Your order has been delivered. Thank you for choosing Okada!",
                  type: "delivery",
                  targetAudience: "specific",
                });
                setShowSendDialog(true);
              }}
            >
              <h3 className="font-semibold mb-1">Delivery Confirmation</h3>
              <p className="text-sm text-muted-foreground">
                Notify users when their order is delivered
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => {
                setFormData({
                  title: "New Promotion Available!",
                  message: "Check out our latest deals and save up to 30% on your next order!",
                  type: "system",
                  targetAudience: "all",
                });
                setShowSendDialog(true);
              }}
            >
              <h3 className="font-semibold mb-1">Promotional Campaign</h3>
              <p className="text-sm text-muted-foreground">
                Announce new promotions to all users
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => {
                setFormData({
                  title: "Payment Received",
                  message: "We have received your payment. Your order is being processed.",
                  type: "payment",
                  targetAudience: "specific",
                });
                setShowSendDialog(true);
              }}
            >
              <h3 className="font-semibold mb-1">Payment Confirmation</h3>
              <p className="text-sm text-muted-foreground">
                Confirm successful payment transactions
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 cursor-pointer transition-colors"
              onClick={() => {
                setFormData({
                  title: "System Maintenance Notice",
                  message: "The platform will undergo maintenance on [date]. Service may be temporarily unavailable.",
                  type: "system",
                  targetAudience: "all",
                });
                setShowSendDialog(true);
              }}
            >
              <h3 className="font-semibold mb-1">System Announcement</h3>
              <p className="text-sm text-muted-foreground">
                Inform users about system updates or maintenance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

