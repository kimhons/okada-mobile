import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Ban,
  CheckCircle,
  FileText,
  MessageSquare,
  Shield,
  ShoppingBag,
  Star,
  Users,
  XCircle,
} from "lucide-react";

interface GuidelineSection {
  title: string;
  icon: React.ReactNode;
  rules: {
    title: string;
    description: string;
    severity: "low" | "medium" | "high" | "critical";
    action: string;
  }[];
}

const SEVERITY_COLORS = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

const guidelines: GuidelineSection[] = [
  {
    title: "Product Listings",
    icon: <ShoppingBag className="h-5 w-5" />,
    rules: [
      {
        title: "Prohibited Items",
        description: "Products that are illegal, counterfeit, or violate local regulations are not allowed.",
        severity: "critical",
        action: "Immediate removal and seller warning. Repeat offenses result in account suspension.",
      },
      {
        title: "Misleading Descriptions",
        description: "Product descriptions must accurately represent the item being sold.",
        severity: "high",
        action: "Product listing suspended until corrected. Seller receives warning.",
      },
      {
        title: "Price Manipulation",
        description: "Artificially inflating prices or deceptive pricing practices.",
        severity: "high",
        action: "Price correction required. Seller flagged for monitoring.",
      },
      {
        title: "Low Quality Images",
        description: "Product images must be clear, relevant, and not misleading.",
        severity: "low",
        action: "Request for image update. Listing may be deprioritized.",
      },
    ],
  },
  {
    title: "User Behavior",
    icon: <Users className="h-5 w-5" />,
    rules: [
      {
        title: "Harassment",
        description: "Any form of harassment, threats, or abusive behavior towards other users.",
        severity: "critical",
        action: "Immediate account suspension. Report to authorities if necessary.",
      },
      {
        title: "Fake Reviews",
        description: "Posting fake reviews or incentivizing reviews inappropriately.",
        severity: "high",
        action: "Reviews removed. Account flagged. Repeat offenses lead to ban.",
      },
      {
        title: "Spam",
        description: "Excessive messaging, promotional spam, or unsolicited contact.",
        severity: "medium",
        action: "Warning issued. Messaging privileges may be restricted.",
      },
      {
        title: "Multiple Accounts",
        description: "Creating multiple accounts to circumvent restrictions or manipulate the platform.",
        severity: "high",
        action: "All associated accounts suspended pending review.",
      },
    ],
  },
  {
    title: "Rider Conduct",
    icon: <Star className="h-5 w-5" />,
    rules: [
      {
        title: "Delivery Fraud",
        description: "Marking deliveries as complete without actual delivery, or stealing items.",
        severity: "critical",
        action: "Immediate termination. Report to authorities. Blacklist from platform.",
      },
      {
        title: "Unprofessional Behavior",
        description: "Rude behavior, inappropriate comments, or poor customer service.",
        severity: "medium",
        action: "Warning issued. Training required. Repeat offenses lead to suspension.",
      },
      {
        title: "Safety Violations",
        description: "Dangerous driving, ignoring traffic rules, or compromising delivery safety.",
        severity: "high",
        action: "Immediate suspension pending safety review.",
      },
      {
        title: "Late Deliveries",
        description: "Consistently late deliveries without valid reasons.",
        severity: "low",
        action: "Performance review. May affect rider ranking and order priority.",
      },
    ],
  },
  {
    title: "Content & Reviews",
    icon: <MessageSquare className="h-5 w-5" />,
    rules: [
      {
        title: "Hate Speech",
        description: "Content promoting hatred, discrimination, or violence against any group.",
        severity: "critical",
        action: "Immediate removal. Account suspension. Permanent ban for repeat offenses.",
      },
      {
        title: "Adult Content",
        description: "Sexually explicit content or inappropriate material.",
        severity: "critical",
        action: "Immediate removal. Account review and possible suspension.",
      },
      {
        title: "Misinformation",
        description: "Spreading false information that could harm users or the platform.",
        severity: "high",
        action: "Content removed. User warned. Fact-check requirement for future posts.",
      },
      {
        title: "Copyright Violation",
        description: "Using copyrighted content without permission.",
        severity: "medium",
        action: "Content removed. DMCA process followed. Repeat offenses lead to ban.",
      },
    ],
  },
];

export default function ModerationGuidelines() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Moderation Guidelines</h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive rules and procedures for content moderation on the Okada platform.
          </p>
        </div>

        {/* Quick Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Severity Levels Quick Reference
            </CardTitle>
            <CardDescription>
              Understanding the severity levels and their typical actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  <span className="font-semibold text-blue-800">Low</span>
                </div>
                <p className="text-sm text-blue-700">
                  Minor issues. Warning or request for correction. No immediate action required.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <span className="font-semibold text-yellow-800">Medium</span>
                </div>
                <p className="text-sm text-yellow-700">
                  Moderate violations. Warning issued. Temporary restrictions may apply.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-orange-50 border-orange-200">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-orange-600" />
                  <span className="font-semibold text-orange-800">High</span>
                </div>
                <p className="text-sm text-orange-700">
                  Serious violations. Immediate action required. Account may be suspended.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-red-50 border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <Ban className="h-5 w-5 text-red-600" />
                  <span className="font-semibold text-red-800">Critical</span>
                </div>
                <p className="text-sm text-red-700">
                  Severe violations. Immediate suspension or ban. May involve legal action.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Guidelines Tabs */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="products" className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Products
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="riders" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Riders
            </TabsTrigger>
            <TabsTrigger value="content" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Content
            </TabsTrigger>
          </TabsList>

          {guidelines.map((section, sectionIndex) => (
            <TabsContent
              key={section.title}
              value={["products", "users", "riders", "content"][sectionIndex]}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {section.icon}
                    {section.title} Guidelines
                  </CardTitle>
                  <CardDescription>
                    Rules and actions for {section.title.toLowerCase()} moderation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {section.rules.map((rule, ruleIndex) => (
                      <div
                        key={`${section.title}-${ruleIndex}`}
                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-semibold">{rule.title}</h4>
                              <Badge className={SEVERITY_COLORS[rule.severity]}>
                                {rule.severity.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {rule.description}
                            </p>
                            <div className="flex items-start gap-2 text-sm">
                              <FileText className="h-4 w-4 mt-0.5 text-primary" />
                              <span>
                                <strong>Action:</strong> {rule.action}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>

        {/* Appeal Process */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Appeal Process
            </CardTitle>
            <CardDescription>
              How users can appeal moderation decisions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      1
                    </div>
                    <h4 className="font-semibold">Submit Appeal</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    User submits appeal through the app or support ticket within 7 days of action.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      2
                    </div>
                    <h4 className="font-semibold">Review</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Moderation team reviews the case within 48-72 hours. Additional evidence may be requested.
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      3
                    </div>
                    <h4 className="font-semibold">Decision</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Final decision communicated to user. Action may be upheld, modified, or reversed.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
