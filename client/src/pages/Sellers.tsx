import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
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
import { Search, Eye, Store, TrendingUp, DollarSign, Package } from "lucide-react";
import { useLocation } from "wouter";

export default function Sellers() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: sellers, isLoading } = trpc.sellers.getAll.useQuery();

  const filteredSellers = sellers?.filter((seller: any) => {
    const matchesSearch =
      !searchQuery ||
      seller.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.businessEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.ownerName?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || seller.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      pending: { variant: "secondary", label: t('sellers:status_pending') },
      approved: { variant: "default", label: t('sellers:status_approved') },
      rejected: { variant: "destructive", label: t('sellers:status_rejected') },
      suspended: { variant: "outline", label: t('sellers:status_suspended') },
    };
    const config = variants[status] || variants.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
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
          <p className="text-muted-foreground">{t('sellers:loading')}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: t('sellers:total_sellers'),
      value: sellers?.length.toLocaleString() || "0",
      icon: Store,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: t('sellers:approved_sellers'),
      value: sellers?.filter((s: any) => s.status === "approved").length.toLocaleString() || "0",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: t('sellers:pending_approval'),
      value: sellers?.filter((s: any) => s.status === "pending").length.toLocaleString() || "0",
      icon: Package,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
    {
      title: t('sellers:total_revenue'),
      value: formatCurrency(
        sellers?.reduce((sum: number, s: any) => sum + (s.totalSales || 0), 0) || 0
      ),
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t('sellers:title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('sellers:description')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{t('sellers:search_filter')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('sellers:search_placeholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder={t('sellers:filter_by_status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('sellers:all_statuses')}</SelectItem>
                <SelectItem value="pending">{t('sellers:status_pending')}</SelectItem>
                <SelectItem value="approved">{t('sellers:status_approved')}</SelectItem>
                <SelectItem value="rejected">{t('sellers:status_rejected')}</SelectItem>
                <SelectItem value="suspended">{t('sellers:status_suspended')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sellers Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('sellers:all_sellers')}</CardTitle>
          <CardDescription>
            {t('sellers:sellers_found', { count: filteredSellers?.length || 0 })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('sellers:table_business_name')}</TableHead>
                  <TableHead>{t('sellers:table_owner')}</TableHead>
                  <TableHead>{t('sellers:table_type')}</TableHead>
                  <TableHead>{t('sellers:table_status')}</TableHead>
                  <TableHead className="text-right">{t('sellers:table_total_sales')}</TableHead>
                  <TableHead className="text-right">{t('sellers:table_orders')}</TableHead>
                  <TableHead className="text-right">{t('sellers:table_rating')}</TableHead>
                  <TableHead className="text-right">{t('sellers:table_commission')}</TableHead>
                  <TableHead className="text-right">{t('sellers:table_actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!filteredSellers || filteredSellers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {t('sellers:no_sellers')}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSellers.map((seller: any) => (
                    <TableRow key={seller.id}>
                      <TableCell className="font-medium">{seller.businessName}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{seller.ownerName}</p>
                          <p className="text-sm text-muted-foreground">{seller.ownerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell>{seller.businessType || "N/A"}</TableCell>
                      <TableCell>{getStatusBadge(seller.status)}</TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(seller.totalSales || 0)}
                      </TableCell>
                      <TableCell className="text-right">{seller.totalOrders || 0}</TableCell>
                      <TableCell className="text-right">
                        {seller.rating ? `${formatRating(seller.rating)}★` : "N/A"}
                      </TableCell>
                      <TableCell className="text-right">{seller.commissionRate}%</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setLocation(`/sellers/${seller.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

