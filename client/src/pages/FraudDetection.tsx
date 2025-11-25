import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Shield, Eye, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

export default function FraudDetection() {
  const [statusFilter, setStatusFilter] = useState<string>("new");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>("all");
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [investigateDialogOpen, setInvestigateDialogOpen] = useState(false);
  const [investigationNotes, setInvestigationNotes] = useState("");
  const [actionTaken, setActionTaken] = useState("");

  const utils = trpc.useUtils();
  const { data: alerts, isLoading } = trpc.fraudDetection.getAlerts.useQuery({
    status: statusFilter === "all" ? undefined : statusFilter,
    severity: severityFilter === "all" ? undefined : severityFilter,
    alertType: alertTypeFilter === "all" ? undefined : alertTypeFilter,
  });

  const updateMutation = trpc.fraudDetection.updateAlert.useMutation({
    onSuccess: () => {
      toast.success("Alert updated successfully");
      utils.fraudDetection.getAlerts.invalidate();
      setInvestigateDialogOpen(false);
      setInvestigationNotes("");
      setActionTaken("");
    },
    onError: (error) => {
      toast.error(`Failed to update alert: ${error.message}`);
    },
  });

  const handleInvestigate = (alert: any) => {
    setSelectedAlert(alert);
    setInvestigationNotes(alert.investigationNotes || "");
    setActionTaken(alert.actionTaken || "");
    setInvestigateDialogOpen(true);
  };

  const handleConfirm = () => {
    if (selectedAlert) {
      updateMutation.mutate({
        alertId: selectedAlert.id,
        status: "confirmed",
        investigationNotes,
        actionTaken,
      });
    }
  };

  const handleFalsePositive = () => {
    if (selectedAlert) {
      updateMutation.mutate({
        alertId: selectedAlert.id,
        status: "false_positive",
        investigationNotes,
      });
    }
  };

  const handleResolve = () => {
    if (selectedAlert) {
      updateMutation.mutate({
        alertId: selectedAlert.id,
        status: "resolved",
        investigationNotes,
        actionTaken,
      });
    }
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
      new: "bg-purple-100 text-purple-800",
      investigating: "bg-blue-100 text-blue-800",
      confirmed: "bg-red-100 text-red-800",
      false_positive: "bg-green-100 text-green-800",
      resolved: "bg-gray-100 text-gray-800",
    };
    return <Badge className={colors[status] || ""}>{status.replace("_", " ").toUpperCase()}</Badge>;
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 60) return "text-orange-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            Fraud Detection
          </h1>
          <p className="text-muted-foreground">
            Monitor and investigate suspicious activity
          </p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="investigating">Investigating</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="false_positive">False Positive</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>

        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Severity</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Select value={alertTypeFilter} onValueChange={setAlertTypeFilter}>
          <SelectTrigger className="w-56">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Alert Types</SelectItem>
            <SelectItem value="suspicious_transaction">Suspicious Transaction</SelectItem>
            <SelectItem value="multiple_accounts">Multiple Accounts</SelectItem>
            <SelectItem value="fake_orders">Fake Orders</SelectItem>
            <SelectItem value="payment_fraud">Payment Fraud</SelectItem>
            <SelectItem value="identity_theft">Identity Theft</SelectItem>
            <SelectItem value="bot_activity">Bot Activity</SelectItem>
            <SelectItem value="unusual_pattern">Unusual Pattern</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Loading fraud alerts...
            </CardContent>
          </Card>
        ) : !alerts || alerts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-2 text-green-600" />
              <div>No fraud alerts found</div>
              <div className="text-sm">System is secure</div>
            </CardContent>
          </Card>
        ) : (
          alerts.map((alert: any) => (
            <Card
              key={alert.id}
              className={
                alert.severity === "critical"
                  ? "border-red-500 border-2"
                  : alert.severity === "high"
                  ? "border-orange-500"
                  : ""
              }
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getSeverityBadge(alert.severity)}
                      {getStatusBadge(alert.status)}
                      <Badge variant="outline">
                        {alert.alertType.replace("_", " ").toUpperCase()}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{alert.description}</CardTitle>
                    <CardDescription>
                      {alert.userName && `User: ${alert.userName} (${alert.userEmail})`}
                      {alert.orderId && ` • Order ID: ${alert.orderId}`}
                      {" • "}
                      {new Date(alert.createdAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  {(alert.status === "new" || alert.status === "investigating") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleInvestigate(alert)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Investigate
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Risk Score</Label>
                  <div className="flex items-center gap-3 mt-2">
                    <Progress value={alert.riskScore} className="flex-1" />
                    <span className={`text-2xl font-bold ${getRiskScoreColor(alert.riskScore)}`}>
                      {alert.riskScore}
                    </span>
                  </div>
                </div>

                {alert.detectionMethod && (
                  <div>
                    <Label className="text-sm font-medium">Detection Method</Label>
                    <div className="text-sm text-muted-foreground">{alert.detectionMethod}</div>
                  </div>
                )}

                {alert.evidenceData && (
                  <div>
                    <Label className="text-sm font-medium">Evidence</Label>
                    <div className="text-sm bg-muted p-3 rounded mt-1 font-mono">
                      {alert.evidenceData}
                    </div>
                  </div>
                )}

                {alert.investigationNotes && (
                  <div>
                    <Label className="text-sm font-medium">Investigation Notes</Label>
                    <div className="text-sm text-muted-foreground">{alert.investigationNotes}</div>
                  </div>
                )}

                {alert.actionTaken && (
                  <div>
                    <Label className="text-sm font-medium">Action Taken</Label>
                    <div className="text-sm text-muted-foreground">{alert.actionTaken}</div>
                  </div>
                )}

                {alert.resolvedAt && (
                  <div className="text-xs text-muted-foreground">
                    Resolved: {new Date(alert.resolvedAt).toLocaleString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Investigation Dialog */}
      <Dialog open={investigateDialogOpen} onOpenChange={setInvestigateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Investigate Fraud Alert</DialogTitle>
            <DialogDescription>
              Review evidence and take appropriate action
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedAlert && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Alert Type</Label>
                    <div className="text-sm">{selectedAlert.alertType.replace("_", " ")}</div>
                  </div>
                  <div>
                    <Label>Risk Score</Label>
                    <div className={`text-2xl font-bold ${getRiskScoreColor(selectedAlert.riskScore)}`}>
                      {selectedAlert.riskScore}
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Description</Label>
                  <div className="text-sm">{selectedAlert.description}</div>
                </div>

                {selectedAlert.evidenceData && (
                  <div>
                    <Label>Evidence</Label>
                    <div className="text-sm bg-muted p-3 rounded mt-1 font-mono">
                      {selectedAlert.evidenceData}
                    </div>
                  </div>
                )}

                <div>
                  <Label>Investigation Notes</Label>
                  <Textarea
                    value={investigationNotes}
                    onChange={(e) => setInvestigationNotes(e.target.value)}
                    placeholder="Document your investigation findings..."
                    rows={4}
                  />
                </div>

                <div>
                  <Label>Action Taken</Label>
                  <Textarea
                    value={actionTaken}
                    onChange={(e) => setActionTaken(e.target.value)}
                    placeholder="Describe the action taken..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setInvestigateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={handleFalsePositive}
              disabled={updateMutation.isPending}
              className="border-green-500 text-green-600"
            >
              <XCircle className="h-4 w-4 mr-2" />
              False Positive
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={updateMutation.isPending}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Confirm Fraud
            </Button>
            <Button
              onClick={handleResolve}
              disabled={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
