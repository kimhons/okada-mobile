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

export default function ActivityLog() {
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
        <h1 className="text-3xl font-bold">Activity Log</h1>
        <p className="text-muted-foreground mt-2">
          Track all admin actions with timestamps for security auditing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All recorded actions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activities</CardTitle>
            <Shield className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">
              Actions performed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
            <User className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">
              Unique administrators
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
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="create">Create Actions</SelectItem>
                <SelectItem value="update">Update Actions</SelectItem>
                <SelectItem value="delete">Delete Actions</SelectItem>
                <SelectItem value="send">Send Actions</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading activity log...
            </div>
          ) : filteredActivities && filteredActivities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admin</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Timestamp</TableHead>
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
              No activities found
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

