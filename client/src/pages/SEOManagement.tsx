import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Globe, TrendingUp, FileText, Link, RefreshCw, CheckCircle, AlertTriangle, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SEOManagement() {
  const [selectedPage, setSelectedPage] = useState<string | null>(null);

  // Mock data - in production this would come from tRPC
  const seoScore = 78;
  
  const pages = [
    { path: "/", title: "Home - Okada Delivery", description: "Fast and reliable delivery service in Cameroon", score: 92, status: "optimized" },
    { path: "/about", title: "About Us - Okada Delivery", description: "Learn about our mission and team", score: 85, status: "optimized" },
    { path: "/services", title: "Our Services", description: "Delivery services across Cameroon", score: 72, status: "needs_work" },
    { path: "/contact", title: "Contact Us", description: "", score: 45, status: "critical" },
    { path: "/faq", title: "FAQ - Frequently Asked Questions", description: "Common questions about our service", score: 88, status: "optimized" },
  ];

  const keywords = [
    { keyword: "delivery service cameroon", position: 3, change: 2, volume: 2400, difficulty: 45 },
    { keyword: "okada delivery", position: 1, change: 0, volume: 1800, difficulty: 15 },
    { keyword: "douala delivery", position: 5, change: -1, volume: 1200, difficulty: 38 },
    { keyword: "yaounde courier", position: 8, change: 3, volume: 890, difficulty: 42 },
    { keyword: "same day delivery cameroon", position: 12, change: 5, volume: 650, difficulty: 55 },
    { keyword: "motorcycle delivery", position: 4, change: 1, volume: 980, difficulty: 35 },
  ];

  const sitemapPages = [
    { url: "https://okada.cm/", lastmod: "2025-12-15", priority: 1.0, indexed: true },
    { url: "https://okada.cm/about", lastmod: "2025-12-10", priority: 0.8, indexed: true },
    { url: "https://okada.cm/services", lastmod: "2025-12-12", priority: 0.9, indexed: true },
    { url: "https://okada.cm/contact", lastmod: "2025-12-08", priority: 0.7, indexed: false },
    { url: "https://okada.cm/faq", lastmod: "2025-12-14", priority: 0.6, indexed: true },
  ];

  const handleGenerateSitemap = () => {
    toast.success("Sitemap generated successfully");
  };

  const handleSubmitToGoogle = () => {
    toast.success("Sitemap submitted to Google Search Console");
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      optimized: "bg-green-100 text-green-800",
      needs_work: "bg-yellow-100 text-yellow-800",
      critical: "bg-red-100 text-red-800",
    };
    const labels: Record<string, string> = {
      optimized: "Optimized",
      needs_work: "Needs Work",
      critical: "Critical",
    };
    return <Badge className={colors[status] || ""}>{labels[status] || status}</Badge>;
  };

  const getPositionChange = (change: number) => {
    if (change > 0) return <span className="text-green-600">↑ {change}</span>;
    if (change < 0) return <span className="text-red-600">↓ {Math.abs(change)}</span>;
    return <span className="text-gray-500">—</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">SEO Management</h1>
          <p className="text-muted-foreground">Optimize your site for search engines</p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleGenerateSitemap}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Regenerate Sitemap
          </Button>
          <Button onClick={handleSubmitToGoogle}>
            <Globe className="h-4 w-4 mr-2" />
            Submit to Google
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Search className="h-4 w-4" />
              Overall SEO Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getScoreColor(seoScore)}`}>{seoScore}/100</div>
            <p className="text-xs text-muted-foreground">Good - Room for improvement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Indexed Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sitemapPages.filter(p => p.indexed).length}/{sitemapPages.length}</div>
            <p className="text-xs text-muted-foreground">Pages in Google index</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Avg. Position
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5.5</div>
            <p className="text-xs text-muted-foreground">For tracked keywords</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Link className="h-4 w-4" />
              Backlinks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">247</div>
            <p className="text-xs text-muted-foreground">From 89 domains</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pages" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pages">Page Optimization</TabsTrigger>
          <TabsTrigger value="keywords">Keyword Rankings</TabsTrigger>
          <TabsTrigger value="sitemap">Sitemap</TabsTrigger>
          <TabsTrigger value="meta">Meta Tags</TabsTrigger>
        </TabsList>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Page SEO Scores</CardTitle>
              <CardDescription>Optimization status for each page</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Page</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow key={page.path}>
                      <TableCell className="font-mono text-sm">{page.path}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{page.title}</TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {page.description || <span className="text-red-500">Missing</span>}
                      </TableCell>
                      <TableCell>
                        <span className={`font-bold ${getScoreColor(page.score)}`}>{page.score}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(page.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => setSelectedPage(page.path)}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="keywords">
          <Card>
            <CardHeader>
              <CardTitle>Keyword Rankings</CardTitle>
              <CardDescription>Track your position for target keywords</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Keyword</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Search Volume</TableHead>
                    <TableHead>Difficulty</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keywords.map((kw) => (
                    <TableRow key={kw.keyword}>
                      <TableCell className="font-medium">{kw.keyword}</TableCell>
                      <TableCell>
                        <Badge variant={kw.position <= 3 ? "default" : "secondary"}>
                          #{kw.position}
                        </Badge>
                      </TableCell>
                      <TableCell>{getPositionChange(kw.change)}</TableCell>
                      <TableCell>{kw.volume.toLocaleString()}/mo</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${kw.difficulty > 50 ? "bg-red-500" : kw.difficulty > 30 ? "bg-yellow-500" : "bg-green-500"}`}
                              style={{ width: `${kw.difficulty}%` }}
                            />
                          </div>
                          <span className="text-sm">{kw.difficulty}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sitemap">
          <Card>
            <CardHeader>
              <CardTitle>Sitemap Management</CardTitle>
              <CardDescription>Manage your XML sitemap for search engines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">sitemap.xml</p>
                    <p className="text-sm text-muted-foreground">Last generated: Dec 15, 2025</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleGenerateSitemap}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Regenerate
                    </Button>
                  </div>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Last Modified</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Indexed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sitemapPages.map((page) => (
                      <TableRow key={page.url}>
                        <TableCell className="font-mono text-sm">{page.url}</TableCell>
                        <TableCell>{page.lastmod}</TableCell>
                        <TableCell>{page.priority}</TableCell>
                        <TableCell>
                          {page.indexed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meta">
          <Card>
            <CardHeader>
              <CardTitle>Meta Tag Templates</CardTitle>
              <CardDescription>Default meta tags for different page types</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Homepage</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Title Tag</Label>
                      <Input defaultValue="Okada Delivery - Fast & Reliable Delivery Service in Cameroon" />
                      <p className="text-xs text-muted-foreground">60 characters max recommended</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Meta Description</Label>
                      <Textarea 
                        defaultValue="Okada Delivery offers fast, reliable motorcycle delivery services across Cameroon. Same-day delivery in Douala, Yaoundé, and more. Track your orders in real-time."
                      />
                      <p className="text-xs text-muted-foreground">155 characters max recommended</p>
                    </div>
                    <div className="space-y-2">
                      <Label>Open Graph Image</Label>
                      <Input defaultValue="https://okada.cm/og-image.jpg" />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">Product Pages Template</h3>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Title Template</Label>
                      <Input defaultValue="{product_name} - Buy Online | Okada Delivery" />
                    </div>
                    <div className="space-y-2">
                      <Label>Description Template</Label>
                      <Textarea 
                        defaultValue="Order {product_name} online and get fast delivery in {city}. {short_description}"
                      />
                    </div>
                  </div>
                </div>

                <Button>Save Meta Tag Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
