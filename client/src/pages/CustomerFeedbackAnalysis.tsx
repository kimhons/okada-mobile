import { useState } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Star, TrendingUp, MessageSquare, ThumbsUp, ThumbsDown, Camera } from "lucide-react";
import { toast } from "sonner";

export default function CustomerFeedbackAnalysis() {
  const [sentimentFilter, setSentimentFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [respondDialogOpen, setRespondDialogOpen] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");

  const { data: feedback, isLoading, refetch } = trpc.feedback.getAll.useQuery({
    sentiment: sentimentFilter === "all" ? undefined : sentimentFilter,
    category: categoryFilter === "all" ? undefined : categoryFilter,
    limit: 100,
  });

  const { data: stats } = trpc.feedback.getStats.useQuery();
  const { data: trends } = trpc.feedback.getTrends.useQuery({ period });

  const respondMutation = trpc.feedback.respond.useMutation({
    onSuccess: () => {
      toast.success("Response sent successfully");
      setRespondDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to send response: ${error.message}`);
    },
  });

  const handleRespond = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFeedback) return;
    
    const formData = new FormData(e.currentTarget);
    respondMutation.mutate({
      id: selectedFeedback.id,
      responseText: formData.get("responseText") as string,
    });
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return "default";
      case "negative": return "destructive";
      case "neutral": return "secondary";
      default: return "secondary";
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "positive": return <ThumbsUp className="h-4 w-4" />;
      case "negative": return <ThumbsDown className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const averageRating = stats?.averageRating || 0;
  const qualityPhotoRating = stats?.averageQualityPhotoRating || 0;
  const positivePercentage = stats
    ? ((stats.positiveFeedback / (stats.totalFeedback || 1)) * 100).toFixed(1)
    : "0";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Customer Feedback Analysis</h1>
            <p className="text-muted-foreground">
              Sentiment analysis and satisfaction trends
            </p>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageRating.toFixed(1)} ★</div>
              <p className="text-xs text-muted-foreground">
                {stats?.totalFeedback || 0} reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quality Photos</CardTitle>
              <Camera className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{qualityPhotoRating.toFixed(1)} ★</div>
              <p className="text-xs text-muted-foreground">
                Photo quality rating
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive Feedback</CardTitle>
              <ThumbsUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{positivePercentage}%</div>
              <p className="text-xs text-muted-foreground">
                {stats?.positiveFeedback || 0} positive reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Responses</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.pendingFeedback || 0}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting response
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sentiment Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Distribution</CardTitle>
            <CardDescription>Breakdown of customer sentiment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsUp className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Positive</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-600"
                      style={{
                        width: `${
                          ((stats?.positiveFeedback || 0) / (stats?.totalFeedback || 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="font-bold w-16 text-right">{stats?.positiveFeedback || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  <span className="font-medium">Neutral</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-600"
                      style={{
                        width: `${
                          ((stats?.neutralFeedback || 0) / (stats?.totalFeedback || 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="font-bold w-16 text-right">{stats?.neutralFeedback || 0}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                  <span className="font-medium">Negative</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600"
                      style={{
                        width: `${
                          ((stats?.negativeFeedback || 0) / (stats?.totalFeedback || 1)) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="font-bold w-16 text-right">{stats?.negativeFeedback || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trends Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Feedback Trends</CardTitle>
                <CardDescription>Rating trends over time</CardDescription>
              </div>
              <Select value={period} onValueChange={(v) => setPeriod(v as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Daily</SelectItem>
                  <SelectItem value="week">Weekly</SelectItem>
                  <SelectItem value="month">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {trends && trends.length > 0 ? (
              <div className="space-y-2">
                {trends.slice(-10).map((trend: any, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm font-medium">{trend.period}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-sm">{trend.totalFeedback} reviews</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold">{Number(trend.averageRating).toFixed(1)}</span>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="default" className="text-xs">
                          +{trend.positiveCount}
                        </Badge>
                        <Badge variant="destructive" className="text-xs">
                          -{trend.negativeCount}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No trend data available</p>
            )}
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <div className="flex-1">
              <Label>Sentiment</Label>
              <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sentiments</SelectItem>
                  <SelectItem value="positive">Positive</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="negative">Negative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <Label>Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="delivery_speed">Delivery Speed</SelectItem>
                  <SelectItem value="quality_photos">Quality Photos</SelectItem>
                  <SelectItem value="product_quality">Product Quality</SelectItem>
                  <SelectItem value="rider_behavior">Rider Behavior</SelectItem>
                  <SelectItem value="app_experience">App Experience</SelectItem>
                  <SelectItem value="customer_service">Customer Service</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Feedback Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Feedback</CardTitle>
            <CardDescription>
              {isLoading ? "Loading..." : `${feedback?.length || 0} feedback entries`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Quality Photos</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {feedback?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono">#{item.id}</TableCell>
                    <TableCell>{renderStars(item.overallRating)}</TableCell>
                    <TableCell>
                      {item.qualityPhotoRating ? (
                        <div className="flex items-center gap-1">
                          <Camera className="h-4 w-4 text-muted-foreground" />
                          <span>{item.qualityPhotoRating}★</span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSentimentColor(item.sentiment || "neutral") as any}>
                        <span className="flex items-center gap-1">
                          {getSentimentIcon(item.sentiment || "neutral")}
                          {item.sentiment}
                        </span>
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">
                      {item.category?.replace("_", " ") || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === "pending" ? "destructive" : "secondary"}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {item.status === "pending" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedFeedback(item);
                            setRespondDialogOpen(true);
                          }}
                        >
                          Respond
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Respond Dialog */}
        <Dialog open={respondDialogOpen} onOpenChange={setRespondDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Respond to Feedback</DialogTitle>
              <DialogDescription>
                Customer #{selectedFeedback?.customerId} - Rating: {selectedFeedback?.overallRating}★
              </DialogDescription>
            </DialogHeader>
            {selectedFeedback && (
              <div className="space-y-4">
                <div>
                  <Label>Customer Feedback</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedFeedback.feedbackText || "No text provided"}
                  </p>
                </div>

                <form onSubmit={handleRespond} className="space-y-4">
                  <div>
                    <Label htmlFor="responseText">Your Response</Label>
                    <Textarea
                      id="responseText"
                      name="responseText"
                      placeholder="Thank you for your feedback..."
                      rows={4}
                      required
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setRespondDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={respondMutation.isPending}>
                      {respondMutation.isPending ? "Sending..." : "Send Response"}
                    </Button>
                  </DialogFooter>
                </form>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
