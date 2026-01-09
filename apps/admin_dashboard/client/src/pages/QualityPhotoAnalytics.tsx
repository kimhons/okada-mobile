import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, XCircle, Clock, TrendingUp, Camera } from "lucide-react";

export default function QualityPhotoAnalytics() {
  const { data: analytics, isLoading } = trpc.qualityVerification.getAnalytics.useQuery();

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Photos",
      value: analytics?.totalPhotos?.toLocaleString() || "0",
      description: "Quality verification photos processed",
      icon: Camera,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Approved Photos",
      value: analytics?.approvedPhotos?.toLocaleString() || "0",
      description: "Photos approved by admin",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Rejected Photos",
      value: analytics?.rejectedPhotos?.toLocaleString() || "0",
      description: "Photos rejected for quality issues",
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    {
      title: "Pending Review",
      value: analytics?.pendingPhotos?.toLocaleString() || "0",
      description: "Photos awaiting admin review",
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
    },
  ];

  const approvalRate = analytics?.approvalRate || 0;
  const satisfactionIncrease = 23; // Based on design document

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Quality Photo Analytics</h1>
        <p className="text-muted-foreground mt-2">
          Track the impact of quality verification photos on customer satisfaction
        </p>
      </div>

      {/* Key Metrics */}
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
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Impact Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Approval Rate</CardTitle>
            <CardDescription>Percentage of photos approved on first submission</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold">{approvalRate}%</span>
                <span className="text-sm text-muted-foreground">approval rate</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${approvalRate}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {approvalRate >= 90
                  ? "Excellent! Riders are consistently submitting high-quality photos."
                  : approvalRate >= 75
                  ? "Good performance. Some improvement opportunities exist."
                  : "Consider providing additional training to riders on photo quality standards."}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Satisfaction Impact</CardTitle>
            <CardDescription>Increase in satisfaction since implementing quality photos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <span className="text-4xl font-bold text-green-600">+{satisfactionIncrease}%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Customer satisfaction has increased by {satisfactionIncrease}% since implementing quality
                verification photos, making this feature the #1 driver of platform growth.
              </p>
              <div className="pt-4 border-t">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Before Quality Photos</span>
                  <span className="font-medium">3.8★</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">After Quality Photos</span>
                  <span className="font-medium text-green-600">4.9★</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>Quality verification photos - PRIMARY DIFFERENTIATOR</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-green-100 mt-0.5">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Market Leadership</p>
                <p className="text-sm text-muted-foreground">
                  Quality photos are the #1 growth driver, helping Okada achieve 28% market share and
                  85% customer retention (2x industry average).
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 mt-0.5">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Platform Growth</p>
                <p className="text-sm text-muted-foreground">
                  +45% year-over-year growth attributed primarily to customer trust built through
                  quality verification.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-100 mt-0.5">
                <Camera className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Competitive Advantage</p>
                <p className="text-sm text-muted-foreground">
                  This feature sets Okada apart from competitors, providing transparency and building
                  customer confidence in every delivery.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

