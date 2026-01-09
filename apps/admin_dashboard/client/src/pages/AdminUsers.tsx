import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Shield, ShieldOff, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<{ id: number; name: string; action: "promote" | "demote" } | null>(null);
  
  const { data: admins, isLoading, refetch } = trpc.settings.getAllAdminUsers.useQuery();
  const promoteUser = trpc.settings.promoteUserToAdmin.useMutation({
    onSuccess: () => {
      toast.success("User promoted to admin successfully");
      refetch();
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(`Failed to promote user: ${error.message}`);
    },
  });
  
  const demoteAdmin = trpc.settings.demoteAdminToUser.useMutation({
    onSuccess: () => {
      toast.success("Admin demoted to user successfully");
      refetch();
      setSelectedUser(null);
    },
    onError: (error) => {
      toast.error(`Failed to demote admin: ${error.message}`);
    },
  });

  const handleConfirmAction = () => {
    if (!selectedUser) return;
    
    if (selectedUser.action === "promote") {
      promoteUser.mutate({ userId: selectedUser.id });
    } else {
      demoteAdmin.mutate({ userId: selectedUser.id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Loading admin users...</div>
      </div>
    );
  }

  const totalAdmins = admins?.length || 0;
  const activeAdmins = admins?.filter(admin => admin.lastSignedIn && new Date(admin.lastSignedIn) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Users Management</h1>
        <p className="text-muted-foreground">Manage administrator accounts and permissions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Admins</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAdmins}</div>
            <p className="text-xs text-muted-foreground">
              Administrator accounts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Admins (30d)</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAdmins}</div>
            <p className="text-xs text-muted-foreground">
              Signed in within 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Administrator Accounts</CardTitle>
          <CardDescription>
            View and manage users with administrator privileges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Login Method</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins && admins.length > 0 ? (
                admins.map((admin) => {
                  const lastSignIn = admin.lastSignedIn ? new Date(admin.lastSignedIn) : null;
                  const isActive = lastSignIn && lastSignIn > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                  
                  return (
                    <TableRow key={admin.id}>
                      <TableCell className="font-medium">{admin.name || "N/A"}</TableCell>
                      <TableCell>{admin.email || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{admin.loginMethod || "N/A"}</Badge>
                      </TableCell>
                      <TableCell>
                        {lastSignIn ? lastSignIn.toLocaleDateString() : "Never"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isActive ? "default" : "secondary"}>
                          {isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedUser({ id: admin.id, name: admin.name || "User", action: "demote" })}
                        >
                          <ShieldOff className="h-4 w-4 mr-2" />
                          Demote
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No admin users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AlertDialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedUser?.action === "promote" ? "Promote User to Admin" : "Demote Admin to User"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedUser?.action === "promote"
                ? `Are you sure you want to promote ${selectedUser?.name} to administrator? They will have full access to all admin features.`
                : `Are you sure you want to demote ${selectedUser?.name} from administrator? They will lose access to admin features.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmAction}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

