import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Search, Filter, X, Calendar, User, FileText } from "lucide-react";
import { format } from "date-fns";

export default function AuditTrail() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState("all");
  const [adminFilter, setAdminFilter] = useState("all");

  const { data: activities, isLoading } = trpc.activityLog.getAll.useQuery();
  const { data: admins } = trpc.settings.getAllAdminUsers.useQuery();

  // Get unique action types and entity types
  const actionTypes = Array.from(new Set(activities?.map(a => a.action) || []));
  const entityTypes = Array.from(new Set(activities?.map(a => a.entityType) || []));

  // Filter activities
  const filteredActivities = activities?.filter(activity => {
    const matchesSearch = 
      searchQuery === "" ||
      activity.adminName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (activity.details && activity.details.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesAction = actionFilter === "all" || activity.action === actionFilter;
    const matchesEntityType = entityTypeFilter === "all" || activity.entityType === entityTypeFilter;
    const matchesAdmin = adminFilter === "all" || activity.adminId.toString() === adminFilter;
    
    return matchesSearch && matchesAction && matchesEntityType && matchesAdmin;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setActionFilter("all");
    setEntityTypeFilter("all");
    setAdminFilter("all");
  };

  const hasActiveFilters = searchQuery !== "" || actionFilter !== "all" || entityTypeFilter !== "all" || adminFilter !== "all";

  // Stats
  const totalLogs = activities?.length || 0;
  const uniqueAdmins = new Set(activities?.map(a => a.adminId)).size;
  const recentLogs = activities?.filter(a => {
    const logDate = new Date(a.createdAt);
    const dayAgo = new Date();
    dayAgo.setDate(dayAgo.getDate() - 1);
    return logDate >= dayAgo;
  }).length || 0;

  const getActionBadgeColor = (action: string) => {
    if (action.includes("delete") || action.includes("reject") || action.includes("suspend")) {
      return "destructive";
    }
    if (action.includes("create") || action.includes("approve") || action.includes("promote")) {
      return "default";
    }
    if (action.includes("update") || action.includes("edit")) {
      return "secondary";
    }
    return "outline";
  };

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8 text-blue-600" />
              Audit Trail
            </h1>
            <p className="text-muted-foreground mt-1">
              Security log of all administrative actions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Logs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLogs.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Admins</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{uniqueAdmins}</div>
              <p className="text-xs text-muted-foreground">Unique administrators</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentLogs}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <CardDescription>
              Filter audit logs by admin, action type, entity type, or search
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Select value={adminFilter} onValueChange={setAdminFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Admins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Admins</SelectItem>
                  {admins?.map((admin) => (
                    <SelectItem key={admin.id} value={admin.id.toString()}>
                      {admin.name || admin.email || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  {actionTypes.map((action) => (
                    <SelectItem key={action} value={action}>
                      {formatAction(action)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={entityTypeFilter} onValueChange={setEntityTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Entity Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Entity Types</SelectItem>
                  {entityTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredActivities?.length || 0} of {totalLogs} logs
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-8"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle>Security Logs</CardTitle>
            <CardDescription>
              Detailed log of all administrative actions and changes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading audit logs...
              </div>
            ) : filteredActivities && filteredActivities.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity Type</TableHead>
                      <TableHead>Entity ID</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredActivities.map((activity) => (
                      <TableRow key={activity.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(activity.createdAt), "MMM dd, yyyy HH:mm:ss")}
                        </TableCell>
                        <TableCell className="font-medium">
                          {activity.adminName}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getActionBadgeColor(activity.action)}>
                            {formatAction(activity.action)}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">
                          {activity.entityType}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {activity.entityId || "-"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                          {activity.details || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {hasActiveFilters ? "No logs match your filters" : "No audit logs found"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

