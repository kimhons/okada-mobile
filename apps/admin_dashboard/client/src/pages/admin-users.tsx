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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserCog, Shield, User, ArrowUp, ArrowDown } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function AdminUsers() {
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [demoteDialogOpen, setDemoteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const { data: adminUsers, isLoading, refetch } = trpc.settings.getAllAdminUsers.useQuery();
  const promoteUserMutation = trpc.settings.promoteUserToAdmin.useMutation();
  const demoteAdminMutation = trpc.settings.demoteAdminToUser.useMutation();

  const handlePromote = (user: any) => {
    setSelectedUser(user);
    setPromoteDialogOpen(true);
  };

  const handleDemote = (user: any) => {
    setSelectedUser(user);
    setDemoteDialogOpen(true);
  };

  const confirmPromote = async () => {
    if (!selectedUser) return;

    try {
      await promoteUserMutation.mutateAsync({ userId: selectedUser.id });
      toast.success(`${selectedUser.name || selectedUser.email} promoted to admin`);
      refetch();
      setPromoteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error("Failed to promote user");
    }
  };

  const confirmDemote = async () => {
    if (!selectedUser) return;

    try {
      await demoteAdminMutation.mutateAsync({ userId: selectedUser.id });
      toast.success(`${selectedUser.name || selectedUser.email} demoted to user`);
      refetch();
      setDemoteDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error("Failed to demote admin");
    }
  };

  // Stats
  const totalUsers = adminUsers?.length || 0;
  const adminCount = adminUsers?.filter(u => u.role === "admin").length || 0;
  const userCount = totalUsers - adminCount;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <UserCog className="h-8 w-8 text-blue-600" />
              Admin Users Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage administrator accounts and role assignments
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">All platform users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminCount}</div>
              <p className="text-xs text-muted-foreground">Admin role assigned</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCount}</div>
              <p className="text-xs text-muted-foreground">Standard user role</p>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>
              View and manage user roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading users...
              </div>
            ) : adminUsers && adminUsers.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Login Method</TableHead>
                      <TableHead>Last Sign In</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {adminUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name || "Unknown"}
                        </TableCell>
                        <TableCell>{user.email || "-"}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                            {user.role === "admin" ? (
                              <Shield className="h-3 w-3 mr-1" />
                            ) : (
                              <User className="h-3 w-3 mr-1" />
                            )}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="capitalize">
                          {user.loginMethod || "-"}
                        </TableCell>
                        <TableCell>
                          {format(new Date(user.lastSignedIn), "MMM dd, yyyy HH:mm")}
                        </TableCell>
                        <TableCell>
                          {user.role === "admin" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDemote(user)}
                            >
                              <ArrowDown className="h-4 w-4 mr-1" />
                              Demote to User
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handlePromote(user)}
                            >
                              <ArrowUp className="h-4 w-4 mr-1" />
                              Promote to Admin
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No users found
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Promote Dialog */}
      <Dialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Promote User to Admin</DialogTitle>
            <DialogDescription>
              Are you sure you want to promote {selectedUser?.name || selectedUser?.email} to administrator?
              This will grant them full access to all admin features.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPromoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmPromote}
              disabled={promoteUserMutation.isPending}
            >
              {promoteUserMutation.isPending ? "Promoting..." : "Promote to Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Demote Dialog */}
      <Dialog open={demoteDialogOpen} onOpenChange={setDemoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Demote Admin to User</DialogTitle>
            <DialogDescription>
              Are you sure you want to demote {selectedUser?.name || selectedUser?.email} to regular user?
              This will remove their admin privileges.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDemoteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDemote}
              disabled={demoteAdminMutation.isPending}
            >
              {demoteAdminMutation.isPending ? "Demoting..." : "Demote to User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

