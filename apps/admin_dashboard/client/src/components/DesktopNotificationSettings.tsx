import { useDesktopNotifications } from "@/hooks/useDesktopNotifications";
import { useNotificationSound, NotificationSoundType } from "@/hooks/useNotificationSound";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Play,
  Monitor
} from "lucide-react";
import { toast } from "sonner";

export function DesktopNotificationSettings() {
  const {
    isSupported,
    permission,
    isEnabled,
    setEnabled,
    requestPermission,
    showNotification,
    hasRequestedPermission,
  } = useDesktopNotifications();

  const {
    soundEnabled,
    setSoundEnabled,
    volume,
    setVolume,
    soundPreferences,
    setSoundPreference,
    getSoundTypes,
    playSound,
  } = useNotificationSound();

  const handleRequestPermission = async () => {
    const result = await requestPermission();
    if (result === "granted") {
      toast.success("Desktop notifications enabled!");
      // Show a test notification
      showNotification({
        title: "Notifications Enabled",
        body: "You will now receive desktop notifications for important events.",
      });
    } else if (result === "denied") {
      toast.error("Notification permission denied. Please enable in browser settings.");
    }
  };

  const handleTestNotification = () => {
    const notification = showNotification({
      title: "Test Notification",
      body: "This is a test notification from Okada Admin Dashboard.",
      onClick: () => toast.info("Notification clicked!"),
    });
    
    if (notification) {
      toast.success("Test notification sent!");
    } else {
      toast.error("Could not send notification. Check permissions.");
    }
  };

  const handleTestSound = (type: NotificationSoundType) => {
    playSound(type);
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case "granted":
        return (
          <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Granted
          </Badge>
        );
      case "denied":
        return (
          <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Denied
          </Badge>
        );
      default:
        return (
          <Badge className="bg-yellow-100 text-yellow-700 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Not Set
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Desktop Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Desktop Notifications
          </CardTitle>
          <CardDescription>
            Receive browser notifications for important events even when the app is in the background
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSupported ? (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-700">
                Desktop notifications are not supported in your browser.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Browser Permission</Label>
                  <p className="text-sm text-gray-500">
                    {permission === "granted" 
                      ? "You can receive desktop notifications"
                      : permission === "denied"
                      ? "Notifications blocked. Enable in browser settings."
                      : "Click to enable desktop notifications"}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getPermissionBadge()}
                  {permission === "default" && (
                    <Button onClick={handleRequestPermission} size="sm">
                      Enable
                    </Button>
                  )}
                </div>
              </div>

              {permission === "granted" && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Desktop Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Show notifications for new orders and alerts
                      </p>
                    </div>
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={setEnabled}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleTestNotification}
                      disabled={!isEnabled}
                    >
                      <Bell className="h-4 w-4 mr-2" />
                      Test Notification
                    </Button>
                  </div>
                </>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Sound Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            Notification Sounds
          </CardTitle>
          <CardDescription>
            Configure audio alerts for different notification types
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Sounds</Label>
              <p className="text-sm text-gray-500">
                Play audio alerts for notifications
              </p>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>

          {soundEnabled && (
            <>
              <div className="space-y-2">
                <Label>Volume</Label>
                <div className="flex items-center gap-4">
                  <VolumeX className="h-4 w-4 text-gray-400" />
                  <Slider
                    value={[volume * 100]}
                    onValueChange={(v) => setVolume(v[0] / 100)}
                    max={100}
                    step={5}
                    className="flex-1"
                  />
                  <Volume2 className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500 w-12 text-right">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Sound Types</Label>
                <div className="space-y-2">
                  {getSoundTypes().map(({ type, description }) => (
                    <div 
                      key={type}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={soundPreferences[type]}
                          onCheckedChange={(checked) => setSoundPreference(type, checked)}
                        />
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {type.replace(/([A-Z])/g, " $1").trim()}
                          </p>
                          <p className="text-xs text-gray-500">{description}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTestSound(type)}
                        disabled={!soundPreferences[type]}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DesktopNotificationSettings;
