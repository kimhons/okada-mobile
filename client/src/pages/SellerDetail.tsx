import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Store, Mail, Phone, MapPin, CreditCard, TrendingUp, Package, Star } from "lucide-react";
import { toast } from "sonner";

export default function SellerDetail() {
  const [, params] = useRoute("/sellers/:id");
  const [, setLocation] = useLocation();
  const sellerId = params?.id ? parseInt(params.id) : 0;

  const { data: seller, isLoading, refetch } = trpc.sellers.getById.useQuery(
    { id: sellerId },
    { enabled: sellerId > 0 }
  );

  const { data: products } = trpc.sellers.getProducts.useQuery(
    { sellerId },
    { enabled: sellerId > 0 }
  );

  const updateStatus = trpc.sellers.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Seller status updated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  const handleStatusChange = (status: "pending" | "approved" | "rejected" | "suspended") => {
    updateStatus.mutate({ id: sellerId, status });
  };

  const formatCurrency = (cents: number) => {
    return `${(cents / 100).toLocaleString()} FCFA`;
  };

  const formatRating = (rating: number) => {
    return (rating / 10).toFixed(1);
  };

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading seller details...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Seller not found</p>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: "Pending" },
      approved: { variant: "default", label: "Approved" },
      rejected: { variant: "destructive", label: "Rejected" },
      suspended: { variant: "outline", label: "Suspended" },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="container py-8">
      <Button variant="ghost" onClick={() => setLocation("/sellers")} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Sellers
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">{seller.businessName}</h1>
          <p className="text-muted-foreground mt-2">
            {seller.businessType || "Marketplace Seller"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(seller.status)}
        </div>
      </div>

      {/* Status Actions */}
      {seller.status !== "approved" && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle>Seller Verification</CardTitle>
            <CardDescription>Review and approve this seller to enable their products</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button
                onClick={() => handleStatusChange("approved")}
                disabled={updateStatus.isPending}
              >
                Approve Seller
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleStatusChange("rejected")}
                disabled={updateStatus.isPending}
              >
                Reject
              </Button>
              {seller.status !== "pending" && seller.status !== "rejected" && (
                <Button
                  variant="outline"
                  onClick={() => handleStatusChange("suspended")}
                  disabled={updateStatus.isPending}
                >
                  Suspend
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Business Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Store className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Business Name</p>
                  <p className="text-sm text-muted-foreground">{seller.businessName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{seller.businessEmail || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{seller.businessPhone || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{seller.businessAddress || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Owner Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">{seller.ownerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{seller.ownerEmail}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Payment Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Mobile Money</p>
                    <p className="text-sm text-muted-foreground">
                      {seller.mobileMoneyProvider
                        ? `${seller.mobileMoneyProvider.replace("_", " ").toUpperCase()} - ${seller.mobileMoneyNumber}`
                        : "Not configured"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Bank Account</p>
                    <p className="text-sm text-muted-foreground">
                      {seller.bankName
                        ? `${seller.bankName} - ${seller.bankAccountNumber}`
                        : "Not configured"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(seller.totalSales || 0)}</div>
              <p className="text-xs text-muted-foreground mt-1">Lifetime revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{seller.totalOrders || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">Orders fulfilled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {seller.rating ? `${formatRating(seller.rating)}★` : "N/A"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Customer rating</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commission Rate</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{seller.commissionRate}%</div>
              <p className="text-xs text-muted-foreground mt-1">Platform fee</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <CardDescription>
            {products?.length || 0} product{products?.length !== 1 ? "s" : ""} listed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!products || products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No products listed yet
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.categoryId}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.price)}</TableCell>
                    <TableCell className="text-right">{product.stock}</TableCell>
                    <TableCell>
                      <Badge variant={product.isActive ? "default" : "secondary"}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

