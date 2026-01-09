import { trpc } from "@/lib/trpc";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Activity, Search, Shield, User } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useI18nLoader } from "@/hooks/useI18nLoader";

export default function ActivityLog() {
  const { t } = useTranslation("activity");
  useI18nLoader(["activity"]);

  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const { data: activities, isLoading } = trpc.activityLog.list.useQuery({
    limit: 100,
  });

  const filteredActivities = activities?.filter((activity) => {
    const matchesSearch = activity.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.details && activity.details.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAction = actionFilter === "all" || activity.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  const stats = {
    total: activities?.length || 0,
    today: activities?.filter(a => {
      const activityDate = new Date(a.createdAt);
      const today = new Date();
      return activityDate.toDateString() === today.toDateString();
    }).length || 0,
    admins: new Set(activities?.map(a => a.adminId)).size || 0,
  };

  const getActionColor = (action: string) => {
    if (action.includes("create")) return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
    if (action.includes("update")) return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
    if (action.includes("delete")) return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
    if (action.includes("send")) return "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20";
    return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
  };

  const formatAction = (action: string) => {
    return action.split("_").map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(" ");
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.totalActivities")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.allRecorded")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.todaysActivities")}</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.performedToday")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("stats.activeAdmins")}</CardTitle>
            <User className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">
              {t("stats.uniqueAdmins")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
          <CardDescription>
            Complete audit trail of all administrative actions
          </CardDescription>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("filters.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder={t("filters.filterByAction")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("filters.allActions")}</SelectItem>
                <SelectItem value="create">{t("filters.createActions")}</SelectItem>
                <SelectItem value="update">{t("filters.updateActions")}</SelectItem>
                <SelectItem value="delete">{t("filters.deleteActions")}</SelectItem>
                <SelectItem value="send">{t("filters.sendActions")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t("loading")}
            </div>
          ) : filteredActivities && filteredActivities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("table.admin")}</TableHead>
                  <TableHead>{t("table.action")}</TableHead>
                  <TableHead>{t("table.entity")}</TableHead>
                  <TableHead>{t("table.details")}</TableHead>
                  <TableHead>{t("table.ipAddress")}</TableHead>
                  <TableHead>{t("table.timestamp")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {activity.adminName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getActionColor(activity.action)}>
                        {formatAction(activity.action)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {activity.entityType ? (
                        <span className="text-sm">
                          {activity.entityType}
                          {activity.entityId && ` #${activity.entityId}`}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {activity.details || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {activity.ipAddress || "-"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(activity.createdAt).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {t("empty.noActivities")}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
