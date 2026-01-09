import { useOffline } from "@/lib/offline";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WifiOff, RefreshCw, CheckCircle, Clock, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

export function OfflineIndicator() {
  const { isOnline, queuedCount, syncNow, lastSyncTime, isSyncing } = useOffline();
  const { t } = useTranslation();
  const [showDetails, setShowDetails] = useState(false);

  // Don't show anything if online and no queued mutations
  if (isOnline && queuedCount === 0) {
    return null;
  }

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return t("offline.never_synced", "Never synced");
    
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return t("offline.just_now", "Just now");
    if (minutes < 60) return t("offline.minutes_ago", `${minutes} minutes ago`, { minutes });
    if (hours < 24) return t("offline.hours_ago", `${hours} hours ago`, { hours });
    return t("offline.days_ago", `${days} days ago`, { days });
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
      {!isOnline ? (
        <Alert variant="destructive" className="border-2 shadow-lg">
          <WifiOff className="h-5 w-5" />
          <AlertTitle className="font-bold flex items-center justify-between">
            {t("offline.youre_offline", "You're Offline")}
            {queuedCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {queuedCount}
              </Badge>
            )}
          </AlertTitle>
          <AlertDescription className="space-y-2">
            {queuedCount > 0 ? (
              <>
                <p>
                  {t("offline.queued_actions", `${queuedCount} action(s) queued for sync when connection is restored.`, { count: queuedCount })}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full mt-2"
                >
                  {showDetails ? t("offline.hide_details", "Hide Details") : t("offline.show_details", "Show Details")}
                </Button>
              </>
            ) : (
              <p>
                {t("offline.limited_features", "Some features may not be available. Changes will be synced when you're back online.")}
              </p>
            )}
            
            {showDetails && queuedCount > 0 && (
              <div className="mt-3 p-3 bg-background/50 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("offline.pending_changes", "Pending changes")}:</span>
                  <span className="font-semibold">{queuedCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{t("offline.last_sync", "Last sync")}:</span>
                  <span className="font-semibold">{formatLastSync(lastSyncTime)}</span>
                </div>
              </div>
            )}
          </AlertDescription>
        </Alert>
      ) : queuedCount > 0 ? (
        <Alert className="border-2 border-primary shadow-lg bg-primary/5">
          {isSyncing ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5 text-primary" />
          )}
          <AlertTitle className="font-bold flex items-center justify-between">
            {isSyncing 
              ? t("offline.syncing_changes", "Syncing Changes...") 
              : t("offline.pending_sync", "Pending Sync")}
            <Badge variant="outline" className="ml-2 border-primary text-primary">
              {queuedCount}
            </Badge>
          </AlertTitle>
          <AlertDescription className="space-y-2">
            <div className="flex items-center justify-between">
              <span>
                {t("offline.pending_actions", `${queuedCount} pending action(s)`, { count: queuedCount })}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={syncNow}
                disabled={isSyncing}
                className="ml-2"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    {t("offline.syncing", "Syncing...")}
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    {t("offline.sync_now", "Sync Now")}
                  </>
                )}
              </Button>
            </div>
            
            {lastSyncTime && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <Clock className="h-3 w-3" />
                <span>{t("offline.last_synced", "Last synced")}: {formatLastSync(lastSyncTime)}</span>
              </div>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(!showDetails)}
              className="w-full mt-2 text-xs"
            >
              {showDetails ? t("offline.hide_details", "Hide Details") : t("offline.show_details", "Show Details")}
            </Button>
            
            {showDetails && (
              <div className="mt-3 p-3 bg-background rounded-lg text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">{t("offline.auto_sync_enabled", "Auto-sync enabled")}</span>
                </div>
                <p className="text-muted-foreground">
                  {t("offline.auto_sync_description", "Changes will be automatically synced when connection is stable. You can also manually trigger sync using the button above.")}
                </p>
              </div>
            )}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

export function OfflineBadge() {
  const { isOnline } = useOffline();
  const { t } = useTranslation();

  if (isOnline) {
    return null;
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 bg-destructive/10 text-destructive rounded-full text-sm font-medium">
      <WifiOff className="h-4 w-4" />
      <span>{t("offline.offline", "Offline")}</span>
    </div>
  );
}

export function OnlineStatus() {
  const { isOnline, queuedCount } = useOffline();
  const { t } = useTranslation();

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
      isOnline 
        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" 
        : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
    }`}>
      {isOnline ? (
        <>
          <CheckCircle className="h-4 w-4" />
          <span>{t("offline.online", "Online")}</span>
          {queuedCount > 0 && (
            <Badge variant="outline" className="ml-1 h-5 px-1.5 text-xs">
              {queuedCount}
            </Badge>
          )}
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>{t("offline.offline", "Offline")}</span>
          {queuedCount > 0 && (
            <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
              {queuedCount}
            </Badge>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Detailed offline status card for settings/debug pages
 */
export function OfflineStatusCard() {
  const { isOnline, queuedCount, syncNow, lastSyncTime, isSyncing } = useOffline();
  const { t } = useTranslation();

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return t("offline.never_synced", "Never synced");
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isOnline ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
          {t("offline.connection_status", "Connection Status")}
        </CardTitle>
        <CardDescription>
          {t("offline.offline_support_description", "Offline support with automatic background sync")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("offline.status", "Status")}</p>
            <p className="text-lg font-semibold">
              {isOnline ? t("offline.online", "Online") : t("offline.offline", "Offline")}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("offline.pending_changes", "Pending Changes")}</p>
            <p className="text-lg font-semibold">{queuedCount}</p>
          </div>
        </div>
        
        {lastSyncTime && (
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{t("offline.last_successful_sync", "Last Successful Sync")}</p>
            <p className="text-sm font-medium">{formatLastSync(lastSyncTime)}</p>
          </div>
        )}
        
        {queuedCount > 0 && (
          <Button
            onClick={syncNow}
            disabled={isSyncing || !isOnline}
            className="w-full"
          >
            {isSyncing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("offline.syncing", "Syncing...")}
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                {t("offline.sync_now", "Sync Now")}
              </>
            )}
          </Button>
        )}
        
        {!isOnline && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("offline.no_connection_warning", "No internet connection. Changes will be synced automatically when connection is restored.")}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
