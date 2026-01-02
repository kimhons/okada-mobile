import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Receipt, FileText, Download, Calculator, AlertTriangle, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const VAT_RATE = 19.5; // Cameroon VAT rate

export default function TaxCompliance() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("current_month");
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  
  // Mock data for tax calculations - in production this would come from tRPC
  const taxData = {
    totalRevenue: 47847843,
    vatCollected: 9330929,
    vatPayable: 9330929,
    exemptTransactions: 1250000,
    taxableTransactions: 46597843,
    transactionCount: 1247,
    exemptCount: 45,
  };

  const monthlyReports = [
    { month: "December 2025", revenue: 5234567, vat: 1020740, status: "pending" },
    { month: "November 2025", revenue: 4987654, vat: 972593, status: "filed" },
    { month: "October 2025", revenue: 5123456, vat: 999074, status: "filed" },
    { month: "September 2025", revenue: 4876543, vat: 950926, status: "filed" },
    { month: "August 2025", revenue: 5012345, vat: 977407, status: "filed" },
    { month: "July 2025", revenue: 4765432, vat: 929259, status: "filed" },
  ];

  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-CM', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount) + ' FCFA';
  };

  const handleExportReport = (period: string) => {
    toast.success(`Exporting tax report for ${period}...`);
    // In production, this would trigger a file download
  };

  const handleFileReturn = (month: string) => {
    toast.success(`Filing tax return for ${month}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tax Compliance</h1>
          <p className="text-muted-foreground">VAT calculations and tax reporting for Cameroon (19.5% VAT)</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleExportReport("annual")}>
            <Download className="h-4 w-4 mr-2" />
            Export Annual Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFCFA(taxData.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">Year to date</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              VAT Collected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFCFA(taxData.vatCollected)}</div>
            <p className="text-xs text-muted-foreground">At {VAT_RATE}% rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              VAT Payable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatFCFA(taxData.vatPayable)}</div>
            <p className="text-xs text-muted-foreground">Due to tax authority</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Exempt Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFCFA(taxData.exemptTransactions)}</div>
            <p className="text-xs text-muted-foreground">{taxData.exemptCount} transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Tax Calculation Details */}
      <Card>
        <CardHeader>
          <CardTitle>VAT Calculation Breakdown</CardTitle>
          <CardDescription>Detailed breakdown of VAT calculations for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Gross Revenue</Label>
                <div className="text-lg font-semibold">{formatFCFA(taxData.totalRevenue)}</div>
              </div>
              <div className="space-y-2">
                <Label>Less: Exempt Transactions</Label>
                <div className="text-lg font-semibold text-red-600">- {formatFCFA(taxData.exemptTransactions)}</div>
              </div>
              <div className="space-y-2">
                <Label>Taxable Revenue</Label>
                <div className="text-lg font-semibold">{formatFCFA(taxData.taxableTransactions)}</div>
              </div>
              <div className="space-y-2">
                <Label>VAT Rate</Label>
                <div className="text-lg font-semibold">{VAT_RATE}%</div>
              </div>
              <div className="space-y-2 md:col-span-2 pt-4 border-t">
                <Label>Total VAT Payable</Label>
                <div className="text-2xl font-bold text-primary">{formatFCFA(taxData.vatPayable)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Tax Reports</CardTitle>
          <CardDescription>View and file monthly VAT returns</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Taxable Revenue</TableHead>
                <TableHead>VAT Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {monthlyReports.map((report) => (
                <TableRow key={report.month}>
                  <TableCell className="font-medium">{report.month}</TableCell>
                  <TableCell>{formatFCFA(report.revenue)}</TableCell>
                  <TableCell>{formatFCFA(report.vat)}</TableCell>
                  <TableCell>
                    <Badge variant={report.status === "filed" ? "default" : "secondary"}>
                      {report.status === "filed" ? (
                        <><CheckCircle className="h-3 w-3 mr-1" /> Filed</>
                      ) : (
                        "Pending"
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleExportReport(report.month)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {report.status === "pending" && (
                        <Button size="sm" onClick={() => handleFileReturn(report.month)}>
                          File Return
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

      {/* Tax Exemptions */}
      <Card>
        <CardHeader>
          <CardTitle>Tax Exemption Categories</CardTitle>
          <CardDescription>Transactions exempt from VAT under Cameroon tax law</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Agricultural Products (Raw)</p>
                <p className="text-sm text-muted-foreground">Unprocessed agricultural goods</p>
              </div>
              <Badge variant="outline">Exempt</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Medical Supplies</p>
                <p className="text-sm text-muted-foreground">Essential medical products</p>
              </div>
              <Badge variant="outline">Exempt</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-medium">Educational Materials</p>
                <p className="text-sm text-muted-foreground">Books and educational supplies</p>
              </div>
              <Badge variant="outline">Exempt</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
