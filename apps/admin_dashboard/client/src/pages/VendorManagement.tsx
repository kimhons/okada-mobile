import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Building2, FileText, Star, Phone, Mail, RefreshCw, DollarSign, Calendar } from "lucide-react";

const VENDOR_STATUSES = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "suspended", label: "Suspended" },
  { value: "pending", label: "Pending" },
];

const CONTRACT_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "active", label: "Active" },
  { value: "expired", label: "Expired" },
  { value: "terminated", label: "Terminated" },
  { value: "renewed", label: "Renewed" },
];

export default function VendorManagement() {
  const [activeTab, setActiveTab] = useState("vendors");
  const [isCreateVendorOpen, setIsCreateVendorOpen] = useState(false);
  const [isCreateContractOpen, setIsCreateContractOpen] = useState(false);
  const [isEditVendorOpen, setIsEditVendorOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  
  // Vendor form state
  const [vendorName, setVendorName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [taxId, setTaxId] = useState("");
  const [vendorStatus, setVendorStatus] = useState<string>("pending");
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");
  
  // Contract form state
  const [contractVendorId, setContractVendorId] = useState<number | null>(null);
  const [contractNumber, setContractNumber] = useState("");
  const [contractTitle, setContractTitle] = useState("");
  const [contractDescription, setContractDescription] = useState("");
  const [contractStartDate, setContractStartDate] = useState("");
  const [contractEndDate, setContractEndDate] = useState("");
  const [contractValue, setContractValue] = useState("");
  const [contractStatus, setContractStatus] = useState<string>("draft");
  
  const utils = trpc.useUtils();
  
  const { data: vendors, isLoading: vendorsLoading } = trpc.vendors.list.useQuery({
    status: filterStatus === "all" ? undefined : filterStatus,
  });
  
  const { data: contracts, isLoading: contractsLoading } = trpc.vendors.listContracts.useQuery({});
  
  const createVendorMutation = trpc.vendors.create.useMutation({
    onSuccess: () => {
      toast.success("Vendor created successfully");
      setIsCreateVendorOpen(false);
      resetVendorForm();
      utils.vendors.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const updateVendorMutation = trpc.vendors.update.useMutation({
    onSuccess: () => {
      toast.success("Vendor updated successfully");
      setIsEditVendorOpen(false);
      setSelectedVendor(null);
      utils.vendors.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const deleteVendorMutation = trpc.vendors.delete.useMutation({
    onSuccess: () => {
      toast.success("Vendor deleted successfully");
      utils.vendors.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const createContractMutation = trpc.vendors.createContract.useMutation({
    onSuccess: () => {
      toast.success("Contract created successfully");
      setIsCreateContractOpen(false);
      resetContractForm();
      utils.vendors.listContracts.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
  
  const resetVendorForm = () => {
    setVendorName("");
    setContactPerson("");
    setEmail("");
    setPhone("");
    setAddress("");
    setBusinessType("");
    setTaxId("");
    setVendorStatus("pending");
    setPaymentTerms("");
    setNotes("");
  };
  
  const resetContractForm = () => {
    setContractVendorId(null);
    setContractNumber("");
    setContractTitle("");
    setContractDescription("");
    setContractStartDate("");
    setContractEndDate("");
    setContractValue("");
    setContractStatus("draft");
  };
  
  const handleCreateVendor = () => {
    createVendorMutation.mutate({
      name: vendorName,
      contactPerson,
      email,
      phone,
      address,
      businessType,
      taxId,
      status: vendorStatus as any,
      paymentTerms,
      notes,
    });
  };
  
  const handleEditVendor = (vendor: any) => {
    setSelectedVendor(vendor);
    setVendorName(vendor.name);
    setContactPerson(vendor.contactPerson || "");
    setEmail(vendor.email || "");
    setPhone(vendor.phone || "");
    setAddress(vendor.address || "");
    setBusinessType(vendor.businessType || "");
    setTaxId(vendor.taxId || "");
    setVendorStatus(vendor.status);
    setPaymentTerms(vendor.paymentTerms || "");
    setNotes(vendor.notes || "");
    setIsEditVendorOpen(true);
  };
  
  const handleUpdateVendor = () => {
    if (!selectedVendor) return;
    updateVendorMutation.mutate({
      id: selectedVendor.id,
      name: vendorName,
      contactPerson,
      email,
      phone,
      address,
      businessType,
      taxId,
      status: vendorStatus as any,
      paymentTerms,
      notes,
    });
  };
  
  const handleDeleteVendor = (id: number) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      deleteVendorMutation.mutate({ id });
    }
  };
  
  const handleCreateContract = () => {
    if (!contractVendorId) return;
    createContractMutation.mutate({
      vendorId: contractVendorId,
      contractNumber,
      title: contractTitle,
      description: contractDescription,
      startDate: new Date(contractStartDate),
      endDate: new Date(contractEndDate),
      value: parseInt(contractValue) * 100, // Convert to cents
      status: contractStatus as any,
    });
  };
  
  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-500",
      inactive: "bg-gray-500",
      suspended: "bg-red-500",
      pending: "bg-yellow-500",
      draft: "bg-blue-500",
      expired: "bg-orange-500",
      terminated: "bg-red-500",
      renewed: "bg-purple-500",
    };
    return (
      <Badge className={`${colors[status] || "bg-gray-500"} text-white`}>
        {VENDOR_STATUSES.find(s => s.value === status)?.label ||
         CONTRACT_STATUSES.find(s => s.value === status)?.label ||
         status}
      </Badge>
    );
  };
  
  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("fr-CM", {
      style: "currency",
      currency: "XAF",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };
  
  // Calculate stats
  const activeVendors = vendors?.filter((v: any) => v.status === "active").length || 0;
  const totalPurchases = vendors?.reduce((acc: number, v: any) => acc + (v.totalPurchases || 0), 0) || 0;
  const activeContracts = contracts?.filter((c: any) => c.status === "active").length || 0;
  const totalContractValue = contracts?.reduce((acc: number, c: any) => acc + (c.value || 0), 0) || 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Vendor Management</h1>
            <p className="text-muted-foreground">
              Manage vendors, suppliers, and contracts
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Vendors</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeVendors}</div>
              <p className="text-xs text-muted-foreground">
                of {vendors?.length || 0} total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPurchases)}</div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeContracts}</div>
              <p className="text-xs text-muted-foreground">
                of {contracts?.length || 0} total
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contract Value</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalContractValue)}</div>
              <p className="text-xs text-muted-foreground">Total committed</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="vendors">Vendors</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
            </TabsList>
            <div className="flex gap-2">
              {activeTab === "vendors" && (
                <Dialog open={isCreateVendorOpen} onOpenChange={setIsCreateVendorOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetVendorForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Vendor
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Vendor</DialogTitle>
                      <DialogDescription>
                        Register a new vendor or supplier
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Vendor Name *</Label>
                          <Input
                            value={vendorName}
                            onChange={(e) => setVendorName(e.target.value)}
                            placeholder="Company name"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Contact Person</Label>
                          <Input
                            value={contactPerson}
                            onChange={(e) => setContactPerson(e.target.value)}
                            placeholder="Primary contact"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Email</Label>
                          <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="vendor@example.com"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Phone</Label>
                          <Input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+237 6XX XXX XXX"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Address</Label>
                        <Textarea
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Full business address"
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Business Type</Label>
                          <Input
                            value={businessType}
                            onChange={(e) => setBusinessType(e.target.value)}
                            placeholder="e.g., Supplier, Service Provider"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Tax ID</Label>
                          <Input
                            value={taxId}
                            onChange={(e) => setTaxId(e.target.value)}
                            placeholder="Tax identification number"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Status</Label>
                          <Select value={vendorStatus} onValueChange={setVendorStatus}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {VENDOR_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label>Payment Terms</Label>
                          <Input
                            value={paymentTerms}
                            onChange={(e) => setPaymentTerms(e.target.value)}
                            placeholder="e.g., Net 30"
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Notes</Label>
                        <Textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Additional notes..."
                          rows={2}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateVendorOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateVendor} disabled={!vendorName || createVendorMutation.isPending}>
                        {createVendorMutation.isPending ? "Creating..." : "Create Vendor"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
              {activeTab === "contracts" && (
                <Dialog open={isCreateContractOpen} onOpenChange={setIsCreateContractOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetContractForm}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Contract
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Create Contract</DialogTitle>
                      <DialogDescription>
                        Create a new vendor contract
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label>Vendor *</Label>
                        <Select
                          value={contractVendorId?.toString() || ""}
                          onValueChange={(v) => setContractVendorId(parseInt(v))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a vendor" />
                          </SelectTrigger>
                          <SelectContent>
                            {vendors?.map((vendor: any) => (
                              <SelectItem key={vendor.id} value={vendor.id.toString()}>
                                {vendor.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Contract Number *</Label>
                          <Input
                            value={contractNumber}
                            onChange={(e) => setContractNumber(e.target.value)}
                            placeholder="e.g., CNT-2024-001"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Status</Label>
                          <Select value={contractStatus} onValueChange={setContractStatus}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {CONTRACT_STATUSES.map((status) => (
                                <SelectItem key={status.value} value={status.value}>
                                  {status.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Contract Title *</Label>
                        <Input
                          value={contractTitle}
                          onChange={(e) => setContractTitle(e.target.value)}
                          placeholder="Contract title"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea
                          value={contractDescription}
                          onChange={(e) => setContractDescription(e.target.value)}
                          placeholder="Contract description..."
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label>Start Date *</Label>
                          <Input
                            type="date"
                            value={contractStartDate}
                            onChange={(e) => setContractStartDate(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>End Date *</Label>
                          <Input
                            type="date"
                            value={contractEndDate}
                            onChange={(e) => setContractEndDate(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label>Contract Value (FCFA) *</Label>
                        <Input
                          type="number"
                          value={contractValue}
                          onChange={(e) => setContractValue(e.target.value)}
                          placeholder="Total contract value"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateContractOpen(false)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={handleCreateContract}
                        disabled={!contractVendorId || !contractNumber || !contractTitle || !contractStartDate || !contractEndDate || !contractValue || createContractMutation.isPending}
                      >
                        {createContractMutation.isPending ? "Creating..." : "Create Contract"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>

          <TabsContent value="vendors" className="space-y-4">
            {/* Filter */}
            <div className="flex items-center gap-4">
              <Label>Filter:</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All vendors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Vendors</SelectItem>
                  {VENDOR_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Vendors</CardTitle>
                <CardDescription>
                  Manage your vendors and suppliers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {vendorsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : vendors && vendors.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Business Type</TableHead>
                        <TableHead className="text-center">Rating</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Total Purchases</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vendors.map((vendor: any) => (
                        <TableRow key={vendor.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{vendor.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {vendor.contactPerson || "No contact"}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {vendor.email && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Mail className="h-3 w-3" />
                                  {vendor.email}
                                </div>
                              )}
                              {vendor.phone && (
                                <div className="flex items-center gap-1 text-sm">
                                  <Phone className="h-3 w-3" />
                                  {vendor.phone}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{vendor.businessType || "-"}</TableCell>
                          <TableCell className="text-center">
                            {vendor.rating ? (
                              <div className="flex items-center justify-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>{vendor.rating.toFixed(1)}</span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(vendor.status)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(vendor.totalPurchases || 0)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditVendor(vendor)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteVendor(vendor.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No vendors yet</h3>
                    <p className="text-muted-foreground">
                      Add your first vendor to get started
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Contracts</CardTitle>
                <CardDescription>
                  Manage contracts with your vendors
                </CardDescription>
              </CardHeader>
              <CardContent>
                {contractsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : contracts && contracts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contract</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {contracts.map((contract: any) => (
                        <TableRow key={contract.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{contract.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {contract.contractNumber}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {vendors?.find((v: any) => v.id === contract.vendorId)?.name || `ID: ${contract.vendorId}`}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Calendar className="h-3 w-3" />
                              {new Date(contract.startDate).toLocaleDateString()} - {new Date(contract.endDate).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {getStatusBadge(contract.status)}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(contract.value)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No contracts yet</h3>
                    <p className="text-muted-foreground">
                      Create contracts to track vendor agreements
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Vendor Dialog */}
        <Dialog open={isEditVendorOpen} onOpenChange={setIsEditVendorOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Vendor</DialogTitle>
              <DialogDescription>
                Update vendor information
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Vendor Name *</Label>
                  <Input
                    value={vendorName}
                    onChange={(e) => setVendorName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Contact Person</Label>
                  <Input
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Address</Label>
                <Textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Business Type</Label>
                  <Input
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Tax ID</Label>
                  <Input
                    value={taxId}
                    onChange={(e) => setTaxId(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={vendorStatus} onValueChange={setVendorStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VENDOR_STATUSES.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Payment Terms</Label>
                  <Input
                    value={paymentTerms}
                    onChange={(e) => setPaymentTerms(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Notes</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditVendorOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateVendor} disabled={!vendorName || updateVendorMutation.isPending}>
                {updateVendorMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
