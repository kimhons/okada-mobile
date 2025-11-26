import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Vibrate } from "lucide-react";
import { isHapticEnabled, setHapticEnabled, hapticFeedback } from "@/lib/haptic";

export function HapticSettings() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isHapticEnabled());
  }, []);

  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    setHapticEnabled(checked);
    
    // Provide feedback when enabling
    if (checked) {
      hapticFeedback.success();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Vibrate className="h-5 w-5" />
          Haptic Feedback
        </CardTitle>
        <CardDescription>
          Enable tactile feedback for touch interactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="haptic-toggle" className="text-base">
              Enable Vibration
            </Label>
            <p className="text-sm text-muted-foreground">
              Provides tactile feedback for swipes, taps, and actions
            </p>
          </div>
          <Switch
            id="haptic-toggle"
            checked={enabled}
            onCheckedChange={handleToggle}
          />
        </div>
        
        {enabled && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Haptic feedback requires a device with vibration support. 
              Desktop browsers may not support this feature.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
