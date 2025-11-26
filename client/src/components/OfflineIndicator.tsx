import { useOffline } from "@/lib/offline";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw, CheckCircle } from "lucide-react";

export function OfflineIndicator() {
  const { isOnline, queuedCount, syncNow } = useOffline();

  // Don't show anything if online and no queued mutations
  if (isOnline && queuedCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
      {!isOnline ? (
        <Alert variant="destructive" className="border-2">
          <WifiOff className="h-5 w-5" />
          <AlertTitle className="font-bold">You're Offline</AlertTitle>
          <AlertDescription>
            {queuedCount > 0 ? (
              <span>
                {queuedCount} action{queuedCount !== 1 ? "s" : ""} queued for sync when connection is restored.
              </span>
            ) : (
              <span>
                Some features may not be available. Changes will be synced when you're back online.
              </span>
            )}
          </AlertDescription>
        </Alert>
      ) : queuedCount > 0 ? (
        <Alert className="border-2 border-primary">
          <RefreshCw className="h-5 w-5 text-primary" />
          <AlertTitle className="font-bold">Syncing Changes</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>
              {queuedCount} pending action{queuedCount !== 1 ? "s" : ""}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={syncNow}
              className="ml-2"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Sync Now
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

export function OfflineBadge() {
  const { isOnline } = useOffline();

  if (isOnline) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
      <WifiOff className="h-4 w-4" />
      <span>Offline</span>
    </div>
  );
}

export function OnlineStatus() {
  const { isOnline } = useOffline();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
      isOnline 
        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
        : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
    }`}>
      {isOnline ? (
        <>
          <CheckCircle className="h-4 w-4" />
          <span>Online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Offline</span>
        </>
      )}
    </div>
  );
}
