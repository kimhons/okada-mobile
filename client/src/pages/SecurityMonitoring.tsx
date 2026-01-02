import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Shield, AlertTriangle, Lock, Eye, Ban, Activity, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function SecurityMonitoring() {
  const [timeRange, setTimeRange] = useState<string>("24h");
  const [threatFilter, setThreatFilter] = useState<string>("all");
  const [selectedThreat, setSelectedThreat] = useState<any>(null);
  const [blockDialogOpen, setBlockDialogOpen] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  // Mock data - in production this would come from tRPC
  const securityStats = {
    totalLogins: 1247,
    failedLogins: 89,
    suspiciousActivities: 12,
    blockedIPs: 5,
    activeThreats: 3,
  };

  const loginAttempts = [
    { id: 1, user: "john@example.com", ip: "192.168.1.100", status: "success", time: "2 min ago", location: "Douala, CM" },
    { id: 2, user: "admin@okada.cm", ip: "10.0.0.50", status: "success", time: "5 min ago", location: "Yaoundé, CM" },
    { id: 3, user: "unknown", ip: "45.33.32.156", status: "failed", time: "8 min ago", location: "Unknown" },
    { id: 4, user: "seller@shop.cm", ip: "192.168.1.105", status: "success", time: "12 min ago", location: "Douala, CM" },
    { id: 5, user: "unknown", ip: "45.33.32.156", status: "failed", time: "15 min ago", location: "Unknown" },
    { id: 6, user: "rider@okada.cm", ip: "192.168.1.110", status: "success", time: "20 min ago", location: "Buea, CM" },
  ];

  const threats = [
    { id: 1, type: "brute_force", ip: "45.33.32.156", attempts: 15, severity: "high", status: "active", firstSeen: "1 hour ago" },
    { id: 2, type: "suspicious_location", ip: "103.45.67.89", attempts: 3, severity: "medium", status: "investigating", firstSeen: "3 hours ago" },
    { id: 3, type: "rate_limit", ip: "192.168.50.25", attempts: 100, severity: "low", status: "resolved", firstSeen: "1 day ago" },
  ];

  const blockedIPs = [
    { ip: "45.33.32.156", reason: "Brute force attack", blockedAt: "2025-12-15", blockedBy: "System" },
    { ip: "103.45.67.89", reason: "Suspicious activity", blockedAt: "2025-12-14", blockedBy: "Admin" },
    { ip: "185.220.101.1", reason: "Known malicious IP", blockedAt: "2025-12-10", blockedBy: "System" },
  ];

  const handleBlockIP = () => {
    if (!selectedThreat || !blockReason.trim()) {
      toast.error("Please provide a reason for blocking");
      return;
    }
    toast.success(`IP ${selectedThreat.ip} has been blocked`);
    setBlockDialogOpen(false);
    setBlockReason("");
  };

  const handleUnblockIP = (ip: string) => {
    toast.success(`IP ${ip} has been unblocked`);
  };

  const getSeverityBadge = (severity: string) => {
    const colors: Record<string, string> = {
      low: "bg-blue-100 text-blue-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      critical: "bg-red-100 text-red-800",
    };
    return <Badge className={colors[severity] || ""}>{severity.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-red-100 text-red-800",
      investigating: "bg-yellow-100 text-yellow-800",
      resolved: "bg-green-100 text-green-800",
      blocked: "bg-gray-100 text-gray-800",
    };
    return <Badge className={colors[status] || ""}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Security Monitoring</h1>
          <p className="text-muted-foreground">Track login attempts, threats, and security events</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Activity className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Total Logins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.totalLogins}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <XCircle className="h-4 w-4 text-red-500" />
              Failed Logins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{securityStats.failedLogins}</div>
            <p className="text-xs text-muted-foreground">{((securityStats.failedLogins / securityStats.totalLogins) * 100).toFixed(1)}% failure rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Suspicious Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{securityStats.suspiciousActivities}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Ban className="h-4 w-4" />
              Blocked IPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats.blockedIPs}</div>
            <p className="text-xs text-muted-foreground">Currently blocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              Active Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{securityStats.activeThreats}</div>
            <p className="text-xs text-muted-foreground">Being monitored</p>
          </CardContent>
        </Card>
      </div>

      {/* Threat Detection */}
      <Card>
        <CardHeader>
          <CardTitle>Threat Detection</CardTitle>
          <CardDescription>Active and recent security threats</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>First Seen</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {threats.map((threat) => (
                <TableRow key={threat.id}>
                  <TableCell className="font-medium">{threat.type.replace("_", " ").toUpperCase()}</TableCell>
                  <TableCell className="font-mono">{threat.ip}</TableCell>
                  <TableCell>{threat.attempts}</TableCell>
                  <TableCell>{getSeverityBadge(threat.severity)}</TableCell>
                  <TableCell>{getStatusBadge(threat.status)}</TableCell>
                  <TableCell>{threat.firstSeen}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {threat.status !== "resolved" && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            setSelectedThreat(threat);
                            setBlockDialogOpen(true);
                          }}
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Login Attempts */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Login Attempts</CardTitle>
          <CardDescription>Track successful and failed login attempts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loginAttempts.map((attempt) => (
                <TableRow key={attempt.id}>
                  <TableCell className="font-medium">{attempt.user}</TableCell>
                  <TableCell className="font-mono">{attempt.ip}</TableCell>
                  <TableCell>{attempt.location}</TableCell>
                  <TableCell>
                    <Badge variant={attempt.status === "success" ? "default" : "destructive"}>
                      {attempt.status === "success" ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Success</>
                      ) : (
                        <><XCircle className="h-3 w-3 mr-1" /> Failed</>
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>{attempt.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Blocked IPs */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked IP Addresses</CardTitle>
          <CardDescription>Manage blocked IP addresses</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP Address</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Blocked At</TableHead>
                <TableHead>Blocked By</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blockedIPs.map((blocked) => (
                <TableRow key={blocked.ip}>
                  <TableCell className="font-mono">{blocked.ip}</TableCell>
                  <TableCell>{blocked.reason}</TableCell>
                  <TableCell>{blocked.blockedAt}</TableCell>
                  <TableCell>{blocked.blockedBy}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUnblockIP(blocked.ip)}
                    >
                      Unblock
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Block IP Dialog */}
      <Dialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block IP Address</DialogTitle>
            <DialogDescription>
              Block IP {selectedThreat?.ip} from accessing the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Reason for blocking</Label>
              <Textarea
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="Enter reason for blocking this IP..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBlockIP}>
              Block IP
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
