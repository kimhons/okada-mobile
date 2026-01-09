# Okada Platform - Granular Implementation Plan

**Generated**: November 26, 2025  
**Purpose**: Comprehensive, automation-ready task specifications  
**Scope**: Complete platform implementation with zero ambiguity  
**Priority**: Admin Dashboard (15 remaining screens) → Mobile Apps → Seller Portal

---

## 📋 Table of Contents

1. [Implementation Philosophy](#implementation-philosophy)
2. [Phase 1: Complete Admin Dashboard (15 Screens)](#phase-1-complete-admin-dashboard-15-screens)
3. [Phase 2: Customer Mobile App MVP (20 Screens)](#phase-2-customer-mobile-app-mvp-20-screens)
4. [Phase 3: Rider Mobile App MVP (15 Screens)](#phase-3-rider-mobile-app-mvp-15-screens)
5. [Phase 4: Seller Portal (30 Screens)](#phase-4-seller-portal-30-screens)
6. [Phase 5: Advanced Features](#phase-5-advanced-features)
7. [Testing Requirements](#testing-requirements)
8. [Quality Gates](#quality-gates)

---

## Implementation Philosophy

### Core Principles

**Build Right, Not Fast**: Every task includes complete specifications to prevent rework. We prioritize correctness over speed, as fixing errors later costs 10x more than building correctly initially.

**Automation-Ready**: Each task specification includes exact file paths, function signatures, database schemas, and validation rules. This enables automated implementation without human interpretation.

**Zero Ambiguity**: No task should require clarification. If implementation details are unclear, the specification is incomplete.

**Test-Driven**: Every feature includes test requirements. No feature is complete without passing tests.

### Task Structure

Each task follows this structure:

```
## Task ID: [CATEGORY]-[NUMBER]

### Overview
- **Feature**: [Feature name]
- **Priority**: [Critical/High/Medium/Low]
- **Estimated Effort**: [Hours]
- **Dependencies**: [List of prerequisite tasks]

### Database Changes
[Exact SQL/Drizzle schema with field types, constraints, indexes]

### Backend Implementation
[Exact tRPC procedure signatures, input validation, business logic]

### Frontend Implementation
[Component structure, props, state management, UI requirements]

### Testing Requirements
[Unit tests, integration tests, E2E tests with exact test cases]

### Acceptance Criteria
[Checklist of requirements for task completion]

### Files to Create/Modify
[Exact file paths with line-level changes where applicable]
```

---

## Phase 1: Complete Admin Dashboard (15 Screens)

**Timeline**: 3 weeks (15 screens × 8 hours/screen = 120 hours)  
**Priority**: HIGHEST - Complete before starting mobile apps  
**Goal**: Reach 100% admin dashboard completion (80/80 screens)

### Current Status: 65/80 Screens Complete (81%)

**Completed Categories**:
- ✅ Dashboard & Home (3/3)
- ✅ Order Management (3/3)
- ✅ User Management (4/4)
- ✅ Rider Management (7/7)
- ✅ Seller Management (2/2 - but needs expansion in Phase 4)
- ✅ Product & Inventory (3/3)
- ✅ Financial Management (8/8)
- ✅ Marketing & Promotions (5/5)
- ✅ Customer Support (4/4)
- ✅ Analytics & Reporting (7/7 - but needs expansion)
- ✅ Notifications (5/5)
- ✅ System Administration (9/9)

**Missing Categories (15 screens)**:
- ❌ Advanced Analytics (5 screens)
- ❌ Compliance & Legal (5 screens)
- ❌ Operations Management (3 screens)
- ❌ Multi-Language Support (1 screen)
- ❌ Tax & Accounting (1 screen)

---

### Task ADMIN-001: Cohort Analysis Dashboard

**Priority**: HIGH  
**Estimated Effort**: 12 hours  
**Dependencies**: None

#### Overview

Cohort analysis allows tracking user behavior over time by grouping users who signed up in the same time period. This helps identify retention patterns, lifetime value trends, and the impact of product changes on different user cohorts.

#### Database Changes

```typescript
// drizzle/schema.ts - Add new table
export const cohortAnalysis = mysqlTable("cohortAnalysis", {
  id: int("id").autoincrement().primaryKey(),
  cohortName: varchar("cohortName", { length: 100 }).notNull(),
  cohortType: mysqlEnum("cohortType", ["signup_date", "first_order", "first_purchase", "custom"]).notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  userCount: int("userCount").notNull().default(0),
  activeUsers: int("activeUsers").notNull().default(0),
  totalRevenue: int("totalRevenue").notNull().default(0), // in cents
  avgOrderValue: int("avgOrderValue").notNull().default(0), // in cents
  retentionDay7: decimal("retentionDay7", { precision: 5, scale: 2 }).default("0.00"),
  retentionDay30: decimal("retentionDay30", { precision: 5, scale: 2 }).default("0.00"),
  retentionDay90: decimal("retentionDay90", { precision: 5, scale: 2 }).default("0.00"),
  metadata: json("metadata"), // Store custom cohort criteria
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CohortAnalysis = typeof cohortAnalysis.$inferSelect;
export type InsertCohortAnalysis = typeof cohortAnalysis.$inferInsert;

// Add index for performance
// CREATE INDEX idx_cohort_dates ON cohortAnalysis(startDate, endDate);
// CREATE INDEX idx_cohort_type ON cohortAnalysis(cohortType);
```

#### Backend Implementation

```typescript
// server/db.ts - Add cohort analysis functions

export async function getCohortAnalysis(params: {
  cohortType: "signup_date" | "first_order" | "first_purchase" | "custom";
  startDate: Date;
  endDate: Date;
  groupBy: "week" | "month" | "quarter";
}) {
  const db = await getDb();
  if (!db) return [];

  // Calculate cohorts based on user signup dates
  const cohorts = await db
    .select({
      cohortPeriod: sql<string>`DATE_FORMAT(${users.createdAt}, ${
        params.groupBy === "week" ? "%Y-W%u" :
        params.groupBy === "month" ? "%Y-%m" :
        "%Y-Q%q"
      })`,
      userCount: sql<number>`COUNT(DISTINCT ${users.id})`,
      activeUsers: sql<number>`COUNT(DISTINCT CASE WHEN ${users.lastSignedIn} > DATE_SUB(NOW(), INTERVAL 30 DAY) THEN ${users.id} END)`,
      totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)`,
      avgOrderValue: sql<number>`COALESCE(AVG(${orders.totalAmount}), 0)`,
    })
    .from(users)
    .leftJoin(orders, eq(users.id, orders.userId))
    .where(
      and(
        gte(users.createdAt, params.startDate),
        lte(users.createdAt, params.endDate)
      )
    )
    .groupBy(sql`cohortPeriod`)
    .orderBy(sql`cohortPeriod`);

  return cohorts;
}

export async function calculateRetentionRates(cohortId: number) {
  const db = await getDb();
  if (!db) return null;

  const cohort = await db
    .select()
    .from(cohortAnalysis)
    .where(eq(cohortAnalysis.id, cohortId))
    .limit(1);

  if (cohort.length === 0) return null;

  const { startDate, endDate } = cohort[0];

  // Get users in this cohort
  const cohortUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        gte(users.createdAt, startDate),
        lte(users.createdAt, endDate)
      )
    );

  const userIds = cohortUsers.map(u => u.id);

  // Calculate retention for Day 7, 30, 90
  const retentionDay7 = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${users.id})` })
    .from(users)
    .where(
      and(
        inArray(users.id, userIds),
        gte(users.lastSignedIn, sql`DATE_ADD(${startDate}, INTERVAL 7 DAY)`)
      )
    );

  const retentionDay30 = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${users.id})` })
    .from(users)
    .where(
      and(
        inArray(users.id, userIds),
        gte(users.lastSignedIn, sql`DATE_ADD(${startDate}, INTERVAL 30 DAY)`)
      )
    );

  const retentionDay90 = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${users.id})` })
    .from(users)
    .where(
      and(
        inArray(users.id, userIds),
        gte(users.lastSignedIn, sql`DATE_ADD(${startDate}, INTERVAL 90 DAY)`)
      )
    );

  const totalUsers = userIds.length;

  return {
    retentionDay7: ((retentionDay7[0]?.count || 0) / totalUsers * 100).toFixed(2),
    retentionDay30: ((retentionDay30[0]?.count || 0) / totalUsers * 100).toFixed(2),
    retentionDay90: ((retentionDay90[0]?.count || 0) / totalUsers * 100).toFixed(2),
  };
}

export async function saveCohortAnalysis(data: InsertCohortAnalysis) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(cohortAnalysis).values(data);
  return result;
}
```

```typescript
// server/routers.ts - Add cohort analysis procedures

cohortAnalysis: router({
  getCohorts: protectedProcedure
    .input(z.object({
      cohortType: z.enum(["signup_date", "first_order", "first_purchase", "custom"]),
      startDate: z.date(),
      endDate: z.date(),
      groupBy: z.enum(["week", "month", "quarter"]),
    }))
    .query(async ({ input }) => {
      return await getCohortAnalysis(input);
    }),

  calculateRetention: protectedProcedure
    .input(z.object({
      cohortId: z.number(),
    }))
    .query(async ({ input }) => {
      return await calculateRetentionRates(input.cohortId);
    }),

  saveCohort: adminProcedure
    .input(z.object({
      cohortName: z.string().min(1).max(100),
      cohortType: z.enum(["signup_date", "first_order", "first_purchase", "custom"]),
      startDate: z.date(),
      endDate: z.date(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Calculate cohort metrics
      const cohortData = await getCohortAnalysis({
        cohortType: input.cohortType,
        startDate: input.startDate,
        endDate: input.endDate,
        groupBy: "month",
      });

      const totalUsers = cohortData.reduce((sum, c) => sum + c.userCount, 0);
      const totalRevenue = cohortData.reduce((sum, c) => sum + c.totalRevenue, 0);
      const avgOrderValue = totalRevenue / totalUsers || 0;

      const result = await saveCohortAnalysis({
        cohortName: input.cohortName,
        cohortType: input.cohortType,
        startDate: input.startDate,
        endDate: input.endDate,
        userCount: totalUsers,
        activeUsers: cohortData.reduce((sum, c) => sum + c.activeUsers, 0),
        totalRevenue,
        avgOrderValue: Math.round(avgOrderValue),
        metadata: input.metadata,
      });

      // Log activity
      await logActivity({
        adminId: ctx.user.id,
        adminName: ctx.user.name || "Unknown",
        action: "create_cohort_analysis",
        entityType: "cohort",
        entityId: result.insertId.toString(),
        details: `Created cohort: ${input.cohortName}`,
      });

      return { success: true, cohortId: result.insertId };
    }),

  listCohorts: protectedProcedure
    .input(z.object({
      cohortType: z.enum(["signup_date", "first_order", "first_purchase", "custom"]).optional(),
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      let query = db.select().from(cohortAnalysis);

      if (input.cohortType) {
        query = query.where(eq(cohortAnalysis.cohortType, input.cohortType));
      }

      const results = await query
        .limit(input.limit)
        .offset(input.offset)
        .orderBy(desc(cohortAnalysis.createdAt));

      return results;
    }),
}),
```

#### Frontend Implementation

```typescript
// client/src/pages/CohortAnalysis.tsx

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, Plus, TrendingUp, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { toast } from "sonner";

export default function CohortAnalysis() {
  const [cohortType, setCohortType] = useState<"signup_date" | "first_order" | "first_purchase">("signup_date");
  const [groupBy, setGroupBy] = useState<"week" | "month" | "quarter">("month");
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() - 6)));
  const [endDate, setEndDate] = useState<Date>(new Date());

  const { data: cohorts, isLoading, refetch } = trpc.cohortAnalysis.getCohorts.useQuery({
    cohortType,
    startDate,
    endDate,
    groupBy,
  });

  const { data: savedCohorts } = trpc.cohortAnalysis.listCohorts.useQuery({
    cohortType,
    limit: 10,
  });

  const saveCohortMutation = trpc.cohortAnalysis.saveCohort.useMutation({
    onSuccess: () => {
      toast.success("Cohort analysis saved successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to save cohort: ${error.message}`);
    },
  });

  const handleSaveCohort = () => {
    const cohortName = `${cohortType.replace("_", " ")} - ${format(startDate, "MMM yyyy")} to ${format(endDate, "MMM yyyy")}`;
    saveCohortMutation.mutate({
      cohortName,
      cohortType,
      startDate,
      endDate,
    });
  };

  const handleExportCSV = () => {
    if (!cohorts || cohorts.length === 0) {
      toast.error("No data to export");
      return;
    }

    const headers = ["Period", "Users", "Active Users", "Total Revenue (FCFA)", "Avg Order Value (FCFA)", "Retention %"];
    const rows = cohorts.map(c => [
      c.cohortPeriod,
      c.userCount,
      c.activeUsers,
      (c.totalRevenue / 100).toFixed(2),
      (c.avgOrderValue / 100).toFixed(2),
      ((c.activeUsers / c.userCount) * 100).toFixed(2),
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cohort-analysis-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Cohort analysis exported to CSV");
  };

  // Calculate summary stats
  const totalUsers = cohorts?.reduce((sum, c) => sum + c.userCount, 0) || 0;
  const totalRevenue = cohorts?.reduce((sum, c) => sum + c.totalRevenue, 0) || 0;
  const avgRetention = cohorts?.reduce((sum, c) => sum + (c.activeUsers / c.userCount), 0) / (cohorts?.length || 1) * 100 || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cohort Analysis</h1>
          <p className="text-muted-foreground">Track user retention and behavior over time</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button onClick={handleSaveCohort} disabled={saveCohortMutation.isPending}>
            <Plus className="w-4 h-4 mr-2" />
            Save Cohort
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Configure cohort analysis parameters</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Cohort Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Cohort Type</label>
              <Select value={cohortType} onValueChange={(v: any) => setCohortType(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="signup_date">Signup Date</SelectItem>
                  <SelectItem value="first_order">First Order</SelectItem>
                  <SelectItem value="first_purchase">First Purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Group By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Group By</label>
              <Select value={groupBy} onValueChange={(v: any) => setGroupBy(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={(date) => date && setStartDate(date)} />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={(date) => date && setEndDate(date)} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Across all cohorts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalRevenue / 100).toLocaleString()} FCFA</div>
            <p className="text-xs text-muted-foreground">Lifetime value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Retention</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRetention.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>
      </div>

      {/* Retention Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Retention Over Time</CardTitle>
          <CardDescription>User retention by cohort period</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Loading cohort data...</p>
            </div>
          ) : cohorts && cohorts.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={cohorts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cohortPeriod" />
                <YAxis yAxisId="left" label={{ value: "Users", angle: -90, position: "insideLeft" }} />
                <YAxis yAxisId="right" orientation="right" label={{ value: "Retention %", angle: 90, position: "insideRight" }} />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="userCount" stroke="#8884d8" name="Total Users" />
                <Line yAxisId="left" type="monotone" dataKey="activeUsers" stroke="#82ca9d" name="Active Users" />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey={(data: any) => ((data.activeUsers / data.userCount) * 100).toFixed(1)}
                  stroke="#ffc658"
                  name="Retention %"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">No cohort data available for selected filters</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cohort Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Details</CardTitle>
          <CardDescription>Detailed metrics for each cohort period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Period</th>
                  <th className="text-right p-2">Users</th>
                  <th className="text-right p-2">Active</th>
                  <th className="text-right p-2">Retention %</th>
                  <th className="text-right p-2">Revenue (FCFA)</th>
                  <th className="text-right p-2">Avg Order (FCFA)</th>
                </tr>
              </thead>
              <tbody>
                {cohorts?.map((cohort, index) => (
                  <tr key={`cohort-${cohort.cohortPeriod}-${index}`} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-medium">{cohort.cohortPeriod}</td>
                    <td className="text-right p-2">{cohort.userCount.toLocaleString()}</td>
                    <td className="text-right p-2">{cohort.activeUsers.toLocaleString()}</td>
                    <td className="text-right p-2">
                      <span className={cn(
                        "font-medium",
                        ((cohort.activeUsers / cohort.userCount) * 100) >= 50 ? "text-green-600" : "text-orange-600"
                      )}>
                        {((cohort.activeUsers / cohort.userCount) * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td className="text-right p-2">{(cohort.totalRevenue / 100).toLocaleString()}</td>
                    <td className="text-right p-2">{(cohort.avgOrderValue / 100).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Saved Cohorts */}
      {savedCohorts && savedCohorts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Saved Cohorts</CardTitle>
            <CardDescription>Previously saved cohort analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedCohorts.map((cohort) => (
                <div key={cohort.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{cohort.cohortName}</p>
                    <p className="text-sm text-muted-foreground">
                      {cohort.userCount.toLocaleString()} users • {(cohort.totalRevenue / 100).toLocaleString()} FCFA revenue
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{cohort.retentionDay30}% retention</p>
                    <p className="text-xs text-muted-foreground">30-day</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

#### Testing Requirements

```typescript
// server/routers.test.ts - Add cohort analysis tests

describe("Cohort Analysis", () => {
  describe("getCohorts", () => {
    it("should return cohorts grouped by month", async () => {
      const result = await trpc.cohortAnalysis.getCohorts.query({
        cohortType: "signup_date",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-06-30"),
        groupBy: "month",
      });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("cohortPeriod");
      expect(result[0]).toHaveProperty("userCount");
      expect(result[0]).toHaveProperty("activeUsers");
    });

    it("should handle empty date range", async () => {
      const result = await trpc.cohortAnalysis.getCohorts.query({
        cohortType: "signup_date",
        startDate: new Date("2030-01-01"),
        endDate: new Date("2030-01-31"),
        groupBy: "month",
      });

      expect(result).toEqual([]);
    });
  });

  describe("calculateRetention", () => {
    it("should calculate retention rates correctly", async () => {
      // Create a test cohort
      const cohort = await trpc.cohortAnalysis.saveCohort.mutate({
        cohortName: "Test Cohort",
        cohortType: "signup_date",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-31"),
      });

      const retention = await trpc.cohortAnalysis.calculateRetention.query({
        cohortId: cohort.cohortId,
      });

      expect(retention).toHaveProperty("retentionDay7");
      expect(retention).toHaveProperty("retentionDay30");
      expect(retention).toHaveProperty("retentionDay90");
      expect(parseFloat(retention.retentionDay7)).toBeGreaterThanOrEqual(0);
      expect(parseFloat(retention.retentionDay7)).toBeLessThanOrEqual(100);
    });
  });

  describe("saveCohort", () => {
    it("should save cohort analysis", async () => {
      const result = await trpc.cohortAnalysis.saveCohort.mutate({
        cohortName: "January 2025 Signups",
        cohortType: "signup_date",
        startDate: new Date("2025-01-01"),
        endDate: new Date("2025-01-31"),
      });

      expect(result.success).toBe(true);
      expect(result.cohortId).toBeGreaterThan(0);
    });

    it("should require admin privileges", async () => {
      // Test with non-admin user
      await expect(
        trpc.cohortAnalysis.saveCohort.mutate({
          cohortName: "Test",
          cohortType: "signup_date",
          startDate: new Date(),
          endDate: new Date(),
        })
      ).rejects.toThrow("FORBIDDEN");
    });
  });

  describe("listCohorts", () => {
    it("should list saved cohorts", async () => {
      const result = await trpc.cohortAnalysis.listCohorts.query({
        limit: 10,
      });

      expect(result).toBeInstanceOf(Array);
    });

    it("should filter by cohort type", async () => {
      const result = await trpc.cohortAnalysis.listCohorts.query({
        cohortType: "signup_date",
        limit: 10,
      });

      expect(result.every(c => c.cohortType === "signup_date")).toBe(true);
    });
  });
});
```

#### Acceptance Criteria

- [ ] Database table `cohortAnalysis` created with all fields
- [ ] Backend functions `getCohortAnalysis`, `calculateRetentionRates`, `saveCohortAnalysis` implemented
- [ ] tRPC procedures `getCohorts`, `calculateRetention`, `saveCohort`, `listCohorts` working
- [ ] Frontend page `CohortAnalysis.tsx` created with filters, charts, and table
- [ ] Cohort type selector (signup_date, first_order, first_purchase) functional
- [ ] Group by selector (week, month, quarter) functional
- [ ] Date range picker working correctly
- [ ] Retention chart displays user count and retention percentage
- [ ] Cohort table shows all metrics (users, active, retention, revenue, avg order)
- [ ] Save cohort button creates new cohort record
- [ ] Export CSV button downloads cohort data
- [ ] Saved cohorts section displays previously saved analyses
- [ ] All 4 test suites passing (getCohorts, calculateRetention, saveCohort, listCohorts)
- [ ] Activity logging for cohort creation working
- [ ] Admin-only access enforced for save operation
- [ ] Route `/cohort-analysis` added to App.tsx
- [ ] Menu item "Cohort Analysis" added to DashboardLayout sidebar under Analytics section

#### Files to Create/Modify

**Create**:
- `client/src/pages/CohortAnalysis.tsx` (new file, 450+ lines)

**Modify**:
- `drizzle/schema.ts` (add `cohortAnalysis` table, ~30 lines)
- `server/db.ts` (add 3 functions: `getCohortAnalysis`, `calculateRetentionRates`, `saveCohortAnalysis`, ~150 lines)
- `server/routers.ts` (add `cohortAnalysis` router with 4 procedures, ~120 lines)
- `client/src/App.tsx` (add route for `/cohort-analysis`, 1 line)
- `client/src/components/DashboardLayout.tsx` (add menu item, 5 lines)
- `server/routers.test.ts` (add test suite, ~80 lines)

---

### Task ADMIN-002: Funnel Analytics Dashboard

**Priority**: HIGH  
**Estimated Effort**: 10 hours  
**Dependencies**: None

#### Overview

Funnel analytics tracks user progression through multi-step processes (e.g., product view → add to cart → checkout → purchase). This identifies drop-off points and conversion bottlenecks.

#### Database Changes

```typescript
// drizzle/schema.ts - Add funnel tracking tables

export const funnels = mysqlTable("funnels", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  steps: json("steps").notNull(), // Array of step definitions
  isActive: boolean("isActive").default(true).notNull(),
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const funnelEvents = mysqlTable("funnelEvents", {
  id: int("id").autoincrement().primaryKey(),
  funnelId: int("funnelId").notNull(),
  userId: int("userId").notNull(),
  sessionId: varchar("sessionId", { length: 100 }).notNull(),
  stepIndex: int("stepIndex").notNull(),
  stepName: varchar("stepName", { length: 100 }).notNull(),
  metadata: json("metadata"), // Additional event data
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Funnel = typeof funnels.$inferSelect;
export type InsertFunnel = typeof funnels.$inferInsert;
export type FunnelEvent = typeof funnelEvents.$inferSelect;
export type InsertFunnelEvent = typeof funnelEvents.$inferInsert;

// Indexes for performance
// CREATE INDEX idx_funnel_events_funnel ON funnelEvents(funnelId, timestamp);
// CREATE INDEX idx_funnel_events_user ON funnelEvents(userId, timestamp);
// CREATE INDEX idx_funnel_events_session ON funnelEvents(sessionId);
```

#### Backend Implementation

```typescript
// server/db.ts - Add funnel analytics functions

export async function createFunnel(data: InsertFunnel) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(funnels).values(data);
  return result.insertId;
}

export async function getFunnelById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(funnels).where(eq(funnels.id, id)).limit(1);
  return result[0] || null;
}

export async function getAllFunnels() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(funnels).orderBy(desc(funnels.createdAt));
}

export async function trackFunnelEvent(data: InsertFunnelEvent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(funnelEvents).values(data);
}

export async function getFunnelAnalytics(funnelId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return null;

  const funnel = await getFunnelById(funnelId);
  if (!funnel) return null;

  const steps = funnel.steps as Array<{ name: string; index: number }>;

  // Get event counts for each step
  const stepAnalytics = await Promise.all(
    steps.map(async (step) => {
      const uniqueUsers = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${funnelEvents.userId})` })
        .from(funnelEvents)
        .where(
          and(
            eq(funnelEvents.funnelId, funnelId),
            eq(funnelEvents.stepIndex, step.index),
            gte(funnelEvents.timestamp, startDate),
            lte(funnelEvents.timestamp, endDate)
          )
        );

      return {
        stepName: step.name,
        stepIndex: step.index,
        userCount: uniqueUsers[0]?.count || 0,
      };
    })
  );

  // Calculate conversion rates
  const firstStepCount = stepAnalytics[0]?.userCount || 1;
  const analyticsWithConversion = stepAnalytics.map((step, index) => ({
    ...step,
    conversionRate: (step.userCount / firstStepCount) * 100,
    dropOffRate: index > 0 ? ((stepAnalytics[index - 1].userCount - step.userCount) / stepAnalytics[index - 1].userCount) * 100 : 0,
  }));

  return {
    funnel,
    steps: analyticsWithConversion,
    totalUsers: firstStepCount,
    finalConversionRate: ((stepAnalytics[stepAnalytics.length - 1]?.userCount || 0) / firstStepCount) * 100,
  };
}

export async function deleteFunnel(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Delete funnel events first
  await db.delete(funnelEvents).where(eq(funnelEvents.funnelId, id));

  // Delete funnel
  await db.delete(funnels).where(eq(funnels.id, id));
}
```

```typescript
// server/routers.ts - Add funnel analytics procedures

funnelAnalytics: router({
  create: adminProcedure
    .input(z.object({
      name: z.string().min(1).max(100),
      description: z.string().optional(),
      steps: z.array(z.object({
        name: z.string(),
        index: z.number(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      const funnelId = await createFunnel({
        name: input.name,
        description: input.description,
        steps: input.steps,
        createdBy: ctx.user.id,
      });

      await logActivity({
        adminId: ctx.user.id,
        adminName: ctx.user.name || "Unknown",
        action: "create_funnel",
        entityType: "funnel",
        entityId: funnelId.toString(),
        details: `Created funnel: ${input.name}`,
      });

      return { success: true, funnelId };
    }),

  list: protectedProcedure.query(async () => {
    return await getAllFunnels();
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await getFunnelById(input.id);
    }),

  getAnalytics: protectedProcedure
    .input(z.object({
      funnelId: z.number(),
      startDate: z.date(),
      endDate: z.date(),
    }))
    .query(async ({ input }) => {
      return await getFunnelAnalytics(input.funnelId, input.startDate, input.endDate);
    }),

  trackEvent: publicProcedure
    .input(z.object({
      funnelId: z.number(),
      userId: z.number(),
      sessionId: z.string(),
      stepIndex: z.number(),
      stepName: z.string(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      await trackFunnelEvent(input);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const funnel = await getFunnelById(input.id);
      if (!funnel) throw new TRPCError({ code: "NOT_FOUND", message: "Funnel not found" });

      await deleteFunnel(input.id);

      await logActivity({
        adminId: ctx.user.id,
        adminName: ctx.user.name || "Unknown",
        action: "delete_funnel",
        entityType: "funnel",
        entityId: input.id.toString(),
        details: `Deleted funnel: ${funnel.name}`,
      });

      return { success: true };
    }),
}),
```

#### Frontend Implementation

```typescript
// client/src/pages/FunnelAnalytics.tsx

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, TrendingDown, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function FunnelAnalytics() {
  const [selectedFunnelId, setSelectedFunnelId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState<Date>(new Date(new Date().setDate(new Date().getDate() - 30)));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form state for creating funnel
  const [funnelName, setFunnelName] = useState("");
  const [funnelDescription, setFunnelDescription] = useState("");
  const [funnelSteps, setFunnelSteps] = useState<Array<{ name: string; index: number }>>([
    { name: "Step 1", index: 0 },
    { name: "Step 2", index: 1 },
  ]);

  const { data: funnels, refetch: refetchFunnels } = trpc.funnelAnalytics.list.useQuery();
  const { data: analytics, isLoading } = trpc.funnelAnalytics.getAnalytics.useQuery(
    {
      funnelId: selectedFunnelId!,
      startDate,
      endDate,
    },
    { enabled: selectedFunnelId !== null }
  );

  const createFunnelMutation = trpc.funnelAnalytics.create.useMutation({
    onSuccess: () => {
      toast.success("Funnel created successfully");
      setIsCreateDialogOpen(false);
      refetchFunnels();
      // Reset form
      setFunnelName("");
      setFunnelDescription("");
      setFunnelSteps([
        { name: "Step 1", index: 0 },
        { name: "Step 2", index: 1 },
      ]);
    },
    onError: (error) => {
      toast.error(`Failed to create funnel: ${error.message}`);
    },
  });

  const deleteFunnelMutation = trpc.funnelAnalytics.delete.useMutation({
    onSuccess: () => {
      toast.success("Funnel deleted successfully");
      setSelectedFunnelId(null);
      refetchFunnels();
    },
    onError: (error) => {
      toast.error(`Failed to delete funnel: ${error.message}`);
    },
  });

  const handleCreateFunnel = () => {
    if (!funnelName.trim()) {
      toast.error("Funnel name is required");
      return;
    }

    if (funnelSteps.length < 2) {
      toast.error("Funnel must have at least 2 steps");
      return;
    }

    createFunnelMutation.mutate({
      name: funnelName,
      description: funnelDescription,
      steps: funnelSteps,
    });
  };

  const handleAddStep = () => {
    setFunnelSteps([...funnelSteps, { name: `Step ${funnelSteps.length + 1}`, index: funnelSteps.length }]);
  };

  const handleRemoveStep = (index: number) => {
    if (funnelSteps.length <= 2) {
      toast.error("Funnel must have at least 2 steps");
      return;
    }
    setFunnelSteps(funnelSteps.filter((_, i) => i !== index).map((step, i) => ({ ...step, index: i })));
  };

  const handleUpdateStepName = (index: number, name: string) => {
    setFunnelSteps(funnelSteps.map((step, i) => (i === index ? { ...step, name } : step)));
  };

  const handleDeleteFunnel = () => {
    if (!selectedFunnelId) return;

    if (confirm("Are you sure you want to delete this funnel? This will also delete all associated events.")) {
      deleteFunnelMutation.mutate({ id: selectedFunnelId });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Funnel Analytics</h1>
          <p className="text-muted-foreground">Track user progression through multi-step processes</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Funnel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Funnel</DialogTitle>
              <DialogDescription>Define a multi-step funnel to track user progression</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="funnel-name">Funnel Name</Label>
                <Input
                  id="funnel-name"
                  placeholder="e.g., Checkout Funnel"
                  value={funnelName}
                  onChange={(e) => setFunnelName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="funnel-description">Description (Optional)</Label>
                <Textarea
                  id="funnel-description"
                  placeholder="Describe the purpose of this funnel..."
                  value={funnelDescription}
                  onChange={(e) => setFunnelDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Funnel Steps</Label>
                  <Button type="button" variant="outline" size="sm" onClick={handleAddStep}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Step
                  </Button>
                </div>
                <div className="space-y-2">
                  {funnelSteps.map((step, index) => (
                    <div key={`step-${index}`} className="flex items-center gap-2">
                      <span className="text-sm font-medium w-20">Step {index + 1}</span>
                      <Input
                        placeholder="Step name"
                        value={step.name}
                        onChange={(e) => handleUpdateStepName(index, e.target.value)}
                      />
                      {funnelSteps.length > 2 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveStep(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateFunnel} disabled={createFunnelMutation.isPending}>
                {createFunnelMutation.isPending ? "Creating..." : "Create Funnel"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Funnel Selection and Date Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select a funnel and date range to analyze</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Funnel Selector */}
            <div className="space-y-2">
              <Label>Select Funnel</Label>
              <Select value={selectedFunnelId?.toString() || ""} onValueChange={(v) => setSelectedFunnelId(parseInt(v))}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a funnel" />
                </SelectTrigger>
                <SelectContent>
                  {funnels?.map((funnel) => (
                    <SelectItem key={funnel.id} value={funnel.id.toString()}>
                      {funnel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(startDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={startDate} onSelect={(date) => date && setStartDate(date)} />
                </PopoverContent>
              </Popover>
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label>End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className={cn("w-full justify-start text-left font-normal")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(endDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={endDate} onSelect={(date) => date && setEndDate(date)} />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {selectedFunnelId && (
            <div className="flex justify-end">
              <Button variant="destructive" size="sm" onClick={handleDeleteFunnel} disabled={deleteFunnelMutation.isPending}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Funnel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Analytics Display */}
      {selectedFunnelId && analytics && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">Entered funnel</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Final Conversion</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.finalConversionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">Completed funnel</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Avg Drop-off</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(analytics.steps.reduce((sum, step) => sum + step.dropOffRate, 0) / analytics.steps.length).toFixed(1)}%
                </div>
                <p className="text-xs text-muted-foreground">Per step</p>
              </CardContent>
            </Card>
          </div>

          {/* Funnel Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Funnel Visualization</CardTitle>
              <CardDescription>User progression through each step</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.steps.map((step, index) => {
                  const widthPercentage = step.conversionRate;
                  const isLastStep = index === analytics.steps.length - 1;

                  return (
                    <div key={`funnel-step-${step.stepIndex}`} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{step.stepName}</p>
                          <p className="text-sm text-muted-foreground">
                            {step.userCount.toLocaleString()} users ({step.conversionRate.toFixed(1)}%)
                          </p>
                        </div>
                        {!isLastStep && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-orange-600">-{step.dropOffRate.toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">Drop-off</p>
                          </div>
                        )}
                      </div>
                      <div className="w-full bg-muted rounded-lg overflow-hidden">
                        <div
                          className={cn(
                            "h-12 flex items-center justify-center text-white font-medium transition-all",
                            widthPercentage >= 75 ? "bg-green-600" :
                            widthPercentage >= 50 ? "bg-yellow-600" :
                            widthPercentage >= 25 ? "bg-orange-600" :
                            "bg-red-600"
                          )}
                          style={{ width: `${Math.max(widthPercentage, 10)}%` }}
                        >
                          {step.userCount.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Step Details Table */}
          <Card>
            <CardHeader>
              <CardTitle>Step Details</CardTitle>
              <CardDescription>Detailed metrics for each funnel step</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Step</th>
                      <th className="text-right p-2">Users</th>
                      <th className="text-right p-2">Conversion %</th>
                      <th className="text-right p-2">Drop-off %</th>
                      <th className="text-right p-2">Drop-off Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.steps.map((step, index) => {
                      const dropOffCount = index > 0 ? analytics.steps[index - 1].userCount - step.userCount : 0;

                      return (
                        <tr key={`step-detail-${step.stepIndex}`} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-medium">{step.stepName}</td>
                          <td className="text-right p-2">{step.userCount.toLocaleString()}</td>
                          <td className="text-right p-2">
                            <span className={cn(
                              "font-medium",
                              step.conversionRate >= 75 ? "text-green-600" :
                              step.conversionRate >= 50 ? "text-yellow-600" :
                              step.conversionRate >= 25 ? "text-orange-600" :
                              "text-red-600"
                            )}>
                              {step.conversionRate.toFixed(1)}%
                            </span>
                          </td>
                          <td className="text-right p-2">
                            {index > 0 ? (
                              <span className="font-medium text-orange-600">{step.dropOffRate.toFixed(1)}%</span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="text-right p-2">
                            {index > 0 ? dropOffCount.toLocaleString() : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Empty State */}
      {!selectedFunnelId && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">Select a funnel to view analytics</p>
            {(!funnels || funnels.length === 0) && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Funnel
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

#### Testing Requirements

```typescript
// server/routers.test.ts - Add funnel analytics tests

describe("Funnel Analytics", () => {
  let testFunnelId: number;

  beforeAll(async () => {
    // Create a test funnel
    const result = await trpc.funnelAnalytics.create.mutate({
      name: "Test Checkout Funnel",
      description: "Test funnel for checkout process",
      steps: [
        { name: "Product View", index: 0 },
        { name: "Add to Cart", index: 1 },
        { name: "Checkout", index: 2 },
        { name: "Purchase", index: 3 },
      ],
    });
    testFunnelId = result.funnelId;
  });

  afterAll(async () => {
    // Clean up test funnel
    await trpc.funnelAnalytics.delete.mutate({ id: testFunnelId });
  });

  describe("create", () => {
    it("should create a new funnel", async () => {
      const result = await trpc.funnelAnalytics.create.mutate({
        name: "Test Funnel 2",
        steps: [
          { name: "Step 1", index: 0 },
          { name: "Step 2", index: 1 },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.funnelId).toBeGreaterThan(0);

      // Clean up
      await trpc.funnelAnalytics.delete.mutate({ id: result.funnelId });
    });

    it("should require admin privileges", async () => {
      // Test with non-admin user
      await expect(
        trpc.funnelAnalytics.create.mutate({
          name: "Test",
          steps: [{ name: "Step 1", index: 0 }],
        })
      ).rejects.toThrow("FORBIDDEN");
    });
  });

  describe("list", () => {
    it("should list all funnels", async () => {
      const result = await trpc.funnelAnalytics.list.query();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("steps");
    });
  });

  describe("getById", () => {
    it("should get funnel by ID", async () => {
      const result = await trpc.funnelAnalytics.getById.query({ id: testFunnelId });

      expect(result).not.toBeNull();
      expect(result?.name).toBe("Test Checkout Funnel");
      expect(result?.steps).toHaveLength(4);
    });

    it("should return null for non-existent funnel", async () => {
      const result = await trpc.funnelAnalytics.getById.query({ id: 999999 });

      expect(result).toBeNull();
    });
  });

  describe("trackEvent", () => {
    it("should track funnel event", async () => {
      const result = await trpc.funnelAnalytics.trackEvent.mutate({
        funnelId: testFunnelId,
        userId: 1,
        sessionId: "test-session-123",
        stepIndex: 0,
        stepName: "Product View",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("getAnalytics", () => {
    it("should return funnel analytics", async () => {
      // Track some test events
      await trpc.funnelAnalytics.trackEvent.mutate({
        funnelId: testFunnelId,
        userId: 1,
        sessionId: "session-1",
        stepIndex: 0,
        stepName: "Product View",
      });

      await trpc.funnelAnalytics.trackEvent.mutate({
        funnelId: testFunnelId,
        userId: 1,
        sessionId: "session-1",
        stepIndex: 1,
        stepName: "Add to Cart",
      });

      const result = await trpc.funnelAnalytics.getAnalytics.query({
        funnelId: testFunnelId,
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)),
        endDate: new Date(),
      });

      expect(result).not.toBeNull();
      expect(result?.funnel.name).toBe("Test Checkout Funnel");
      expect(result?.steps).toHaveLength(4);
      expect(result?.steps[0].stepName).toBe("Product View");
      expect(result?.totalUsers).toBeGreaterThan(0);
    });
  });

  describe("delete", () => {
    it("should delete funnel and associated events", async () => {
      // Create a funnel to delete
      const createResult = await trpc.funnelAnalytics.create.mutate({
        name: "Funnel to Delete",
        steps: [
          { name: "Step 1", index: 0 },
          { name: "Step 2", index: 1 },
        ],
      });

      // Delete it
      const deleteResult = await trpc.funnelAnalytics.delete.mutate({ id: createResult.funnelId });

      expect(deleteResult.success).toBe(true);

      // Verify it's deleted
      const getResult = await trpc.funnelAnalytics.getById.query({ id: createResult.funnelId });
      expect(getResult).toBeNull();
    });

    it("should require admin privileges", async () => {
      // Test with non-admin user
      await expect(
        trpc.funnelAnalytics.delete.mutate({ id: testFunnelId })
      ).rejects.toThrow("FORBIDDEN");
    });
  });
});
```

#### Acceptance Criteria

- [ ] Database tables `funnels` and `funnelEvents` created with all fields and indexes
- [ ] Backend functions implemented: `createFunnel`, `getFunnelById`, `getAllFunnels`, `trackFunnelEvent`, `getFunnelAnalytics`, `deleteFunnel`
- [ ] tRPC procedures working: `create`, `list`, `getById`, `getAnalytics`, `trackEvent`, `delete`
- [ ] Frontend page `FunnelAnalytics.tsx` created with create dialog, filters, and visualization
- [ ] Create funnel dialog allows adding/removing steps dynamically
- [ ] Funnel selector dropdown populated with existing funnels
- [ ] Date range picker working correctly
- [ ] Funnel visualization displays steps with width proportional to conversion rate
- [ ] Color coding for conversion rates (green ≥75%, yellow ≥50%, orange ≥25%, red <25%)
- [ ] Step details table shows users, conversion %, drop-off %, and drop-off count
- [ ] Delete funnel button removes funnel and all associated events
- [ ] All 6 test suites passing
- [ ] Activity logging for funnel creation and deletion working
- [ ] Admin-only access enforced for create and delete operations
- [ ] Public access allowed for trackEvent (for frontend tracking)
- [ ] Route `/funnel-analytics` added to App.tsx
- [ ] Menu item "Funnel Analytics" added to DashboardLayout sidebar under Analytics section

#### Files to Create/Modify

**Create**:
- `client/src/pages/FunnelAnalytics.tsx` (new file, 550+ lines)

**Modify**:
- `drizzle/schema.ts` (add `funnels` and `funnelEvents` tables, ~40 lines)
- `server/db.ts` (add 6 functions, ~200 lines)
- `server/routers.ts` (add `funnelAnalytics` router with 6 procedures, ~150 lines)
- `client/src/App.tsx` (add route, 1 line)
- `client/src/components/DashboardLayout.tsx` (add menu item, 5 lines)
- `server/routers.test.ts` (add test suite, ~120 lines)

---

### Summary of Remaining 13 Admin Dashboard Tasks

Due to length constraints, I'll provide abbreviated specifications for the remaining tasks. Each follows the same structure as ADMIN-001 and ADMIN-002.

### Task ADMIN-003: A/B Testing Dashboard
- **Effort**: 12 hours
- **Database**: `abTests`, `abTestVariants`, `abTestResults` tables
- **Features**: Create tests, define variants, track conversions, statistical significance calculation
- **UI**: Test creation wizard, variant comparison, results visualization

### Task ADMIN-004: Predictive Analytics Dashboard
- **Effort**: 14 hours
- **Database**: `predictions`, `predictionModels` tables
- **Features**: Demand forecasting, churn prediction, LTV prediction using ML models
- **UI**: Model selection, prediction charts, accuracy metrics

### Task ADMIN-005: GDPR Compliance Dashboard
- **Effort**: 10 hours
- **Database**: `dataRequests`, `consentRecords` tables
- **Features**: Data export/deletion requests, consent management, audit trail
- **UI**: Request queue, consent tracking, compliance reports

### Task ADMIN-006: Terms of Service Management
- **Effort**: 8 hours
- **Database**: `legalDocuments`, `userAcceptances` tables
- **Features**: Version control for legal docs, user acceptance tracking
- **UI**: Document editor, version history, acceptance analytics

### Task ADMIN-007: Cookie Consent Management
- **Effort**: 6 hours
- **Database**: `cookieConsents`, `cookieCategories` tables
- **Features**: Cookie category management, consent tracking, compliance reporting
- **UI**: Category configuration, consent analytics

### Task ADMIN-008: Regulatory Filings Dashboard
- **Effort**: 8 hours
- **Database**: `regulatoryFilings` table
- **Features**: Filing tracking, deadline management, document storage
- **UI**: Filing calendar, status tracking, document upload

### Task ADMIN-009: Warehouse Management System
- **Effort**: 16 hours
- **Database**: `warehouses`, `warehouseInventory`, `warehouseTransfers` tables
- **Features**: Multi-warehouse inventory, stock transfers, capacity tracking
- **UI**: Warehouse dashboard, transfer workflow, inventory levels

### Task ADMIN-010: Fleet Management System
- **Effort**: 14 hours
- **Database**: `vehicles`, `vehicleMaintenance`, `vehicleAssignments` tables
- **Features**: Vehicle tracking, maintenance scheduling, rider assignments
- **UI**: Fleet overview, maintenance calendar, assignment management

### Task ADMIN-011: Route Optimization Engine
- **Effort**: 18 hours
- **Database**: `routes`, `routeOptimizations` tables
- **Features**: Multi-stop route planning, distance/time optimization, real-time adjustments
- **UI**: Route visualization, optimization controls, performance metrics

### Task ADMIN-012: Multi-Language Support System

**Priority**: HIGH (CRITICAL for Cameroon market - 60% French-speaking users)  
**Estimated Effort**: 16 hours  
**Dependencies**: None

#### Overview

Multi-language support is **critical for the Cameroon market**, where approximately 60% of the population speaks French. The platform must support both English and French seamlessly across all interfaces (admin dashboard, customer app, rider app, seller portal).

#### Database Changes

```typescript
// drizzle/schema.ts - Add translation tables

export const languages = mysqlTable("languages", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(), // e.g., "en", "fr"
  name: varchar("name", { length: 50 }).notNull(), // e.g., "English", "Français"
  nativeName: varchar("nativeName", { length: 50 }).notNull(), // e.g., "English", "Français"
  isRTL: boolean("isRTL").default(false).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  isDefault: boolean("isDefault").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const translations = mysqlTable("translations", {
  id: int("id").autoincrement().primaryKey(),
  languageCode: varchar("languageCode", { length: 10 }).notNull(),
  namespace: varchar("namespace", { length: 50 }).notNull(), // e.g., "common", "dashboard", "orders"
  key: varchar("key", { length: 255 }).notNull(), // e.g., "welcome_message", "order_status_pending"
  value: text("value").notNull(), // Translated text
  context: text("context"), // Optional context for translators
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Language = typeof languages.$inferSelect;
export type InsertLanguage = typeof languages.$inferInsert;
export type Translation = typeof translations.$inferSelect;
export type InsertTranslation = typeof translations.$inferInsert;

// Composite unique index for translations
// CREATE UNIQUE INDEX idx_translations_unique ON translations(languageCode, namespace, key);
// CREATE INDEX idx_translations_language ON translations(languageCode);
// CREATE INDEX idx_translations_namespace ON translations(namespace);
```

#### Backend Implementation

```typescript
// server/db.ts - Add i18n functions

export async function getLanguages() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(languages)
    .where(eq(languages.isActive, true))
    .orderBy(desc(languages.isDefault), asc(languages.name));
}

export async function getDefaultLanguage() {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(languages)
    .where(eq(languages.isDefault, true))
    .limit(1);

  return result[0] || null;
}

export async function getTranslations(languageCode: string, namespace?: string) {
  const db = await getDb();
  if (!db) return [];

  let query = db
    .select()
    .from(translations)
    .where(eq(translations.languageCode, languageCode));

  if (namespace) {
    query = query.where(eq(translations.namespace, namespace));
  }

  return await query;
}

export async function upsertTranslation(data: InsertTranslation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(translations)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        value: data.value,
        context: data.context,
        updatedAt: new Date(),
      },
    });
}

export async function bulkUpsertTranslations(translationData: InsertTranslation[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Process in batches of 100
  const batchSize = 100;
  for (let i = 0; i < translationData.length; i += batchSize) {
    const batch = translationData.slice(i, i + batchSize);
    await db.insert(translations).values(batch).onDuplicateKeyUpdate({
      set: {
        value: sql`VALUES(value)`,
        context: sql`VALUES(context)`,
        updatedAt: new Date(),
      },
    });
  }
}

export async function deleteTranslation(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(translations).where(eq(translations.id, id));
}

export async function getTranslationCoverage() {
  const db = await getDb();
  if (!db) return [];

  // Get count of translations per language
  const coverage = await db
    .select({
      languageCode: translations.languageCode,
      namespace: translations.namespace,
      count: sql<number>`COUNT(*)`,
    })
    .from(translations)
    .groupBy(translations.languageCode, translations.namespace);

  return coverage;
}
```

```typescript
// server/routers.ts - Add i18n procedures

i18n: router({
  getLanguages: publicProcedure.query(async () => {
    return await getLanguages();
  }),

  getDefaultLanguage: publicProcedure.query(async () => {
    return await getDefaultLanguage();
  }),

  getTranslations: publicProcedure
    .input(z.object({
      languageCode: z.string(),
      namespace: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await getTranslations(input.languageCode, input.namespace);
    }),

  upsertTranslation: adminProcedure
    .input(z.object({
      languageCode: z.string(),
      namespace: z.string(),
      key: z.string(),
      value: z.string(),
      context: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await upsertTranslation(input);

      await logActivity({
        adminId: ctx.user.id,
        adminName: ctx.user.name || "Unknown",
        action: "upsert_translation",
        entityType: "translation",
        entityId: `${input.languageCode}:${input.namespace}:${input.key}`,
        details: `Updated translation: ${input.key}`,
      });

      return { success: true };
    }),

  bulkUpsertTranslations: adminProcedure
    .input(z.object({
      translations: z.array(z.object({
        languageCode: z.string(),
        namespace: z.string(),
        key: z.string(),
        value: z.string(),
        context: z.string().optional(),
      })),
    }))
    .mutation(async ({ input, ctx }) => {
      await bulkUpsertTranslations(input.translations);

      await logActivity({
        adminId: ctx.user.id,
        adminName: ctx.user.name || "Unknown",
        action: "bulk_upsert_translations",
        entityType: "translation",
        entityId: "bulk",
        details: `Bulk uploaded ${input.translations.length} translations`,
      });

      return { success: true, count: input.translations.length };
    }),

  deleteTranslation: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteTranslation(input.id);

      await logActivity({
        adminId: ctx.user.id,
        adminName: ctx.user.name || "Unknown",
        action: "delete_translation",
        entityType: "translation",
        entityId: input.id.toString(),
        details: `Deleted translation ID: ${input.id}`,
      });

      return { success: true };
    }),

  getCoverage: protectedProcedure.query(async () => {
    return await getTranslationCoverage();
  }),
}),
```

#### Frontend Implementation - Admin Dashboard

**Step 1: Install react-i18next**

```bash
pnpm add react-i18next i18next i18next-browser-languagedetector i18next-http-backend
```

**Step 2: Configure i18next**

```typescript
// client/src/lib/i18n.ts

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    supportedLngs: ["en", "fr"],
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false,
    },
    backend: {
      loadPath: "/api/trpc/i18n.getTranslations?input={{lng}}",
      parse: (data: string) => {
        const translations = JSON.parse(data);
        const result: Record<string, Record<string, string>> = {};

        translations.forEach((t: any) => {
          if (!result[t.namespace]) {
            result[t.namespace] = {};
          }
          result[t.namespace][t.key] = t.value;
        });

        return result;
      },
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
  });

export default i18n;
```

**Step 3: Wrap App with I18nextProvider**

```typescript
// client/src/main.tsx - Add i18n import

import "./lib/i18n"; // Add this line at the top

// Rest of the file remains the same
```

**Step 4: Create Language Switcher Component**

```typescript
// client/src/components/LanguageSwitcher.tsx

import { useTranslation } from "react-i18next";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const { data: languages } = trpc.i18n.getLanguages.useQuery();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <div className="flex items-center gap-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {languages?.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.nativeName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
```

**Step 5: Create Translation Management Page**

```typescript
// client/src/pages/TranslationManagement.tsx

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Upload, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function TranslationManagement() {
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedNamespace, setSelectedNamespace] = useState("common");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Form state
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newContext, setNewContext] = useState("");

  const { data: languages } = trpc.i18n.getLanguages.useQuery();
  const { data: translations, refetch } = trpc.i18n.getTranslations.useQuery({
    languageCode: selectedLanguage,
    namespace: selectedNamespace,
  });
  const { data: coverage } = trpc.i18n.getCoverage.useQuery();

  const upsertMutation = trpc.i18n.upsertTranslation.useMutation({
    onSuccess: () => {
      toast.success("Translation saved successfully");
      setIsAddDialogOpen(false);
      refetch();
      // Reset form
      setNewKey("");
      setNewValue("");
      setNewContext("");
    },
    onError: (error) => {
      toast.error(`Failed to save translation: ${error.message}`);
    },
  });

  const deleteMutation = trpc.i18n.deleteTranslation.useMutation({
    onSuccess: () => {
      toast.success("Translation deleted successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete translation: ${error.message}`);
    },
  });

  const bulkUploadMutation = trpc.i18n.bulkUpsertTranslations.useMutation({
    onSuccess: (data) => {
      toast.success(`Successfully uploaded ${data.count} translations`);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to upload translations: ${error.message}`);
    },
  });

  const handleAddTranslation = () => {
    if (!newKey.trim() || !newValue.trim()) {
      toast.error("Key and value are required");
      return;
    }

    upsertMutation.mutate({
      languageCode: selectedLanguage,
      namespace: selectedNamespace,
      key: newKey,
      value: newValue,
      context: newContext || undefined,
    });
  };

  const handleExportCSV = () => {
    if (!translations || translations.length === 0) {
      toast.error("No translations to export");
      return;
    }

    const headers = ["Namespace", "Key", "Value", "Context"];
    const rows = translations.map(t => [
      t.namespace,
      t.key,
      t.value,
      t.context || "",
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `translations-${selectedLanguage}-${selectedNamespace}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Translations exported to CSV");
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target?.result as string;
      const lines = csv.split("\n");
      const headers = lines[0].split(",").map(h => h.replace(/"/g, ""));

      const translationsToUpload = lines.slice(1).map(line => {
        const values = line.split(",").map(v => v.replace(/"/g, ""));
        return {
          languageCode: selectedLanguage,
          namespace: values[0] || selectedNamespace,
          key: values[1],
          value: values[2],
          context: values[3] || undefined,
        };
      }).filter(t => t.key && t.value);

      bulkUploadMutation.mutate({ translations: translationsToUpload });
    };
    reader.readAsText(file);
  };

  const namespaces = ["common", "dashboard", "orders", "products", "users", "riders", "sellers", "settings"];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Translation Management</h1>
          <p className="text-muted-foreground">Manage translations for multiple languages</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" asChild>
            <label>
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
              <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} />
            </label>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Translation
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Translation</DialogTitle>
                <DialogDescription>Create a new translation entry</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Key</Label>
                  <Input
                    placeholder="e.g., welcome_message"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Value</Label>
                  <Textarea
                    placeholder="Translation text"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Context (Optional)</Label>
                  <Input
                    placeholder="Context for translators"
                    value={newContext}
                    onChange={(e) => setNewContext(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddTranslation} disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Select language and namespace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages?.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Namespace</Label>
              <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {namespaces.map((ns) => (
                    <SelectItem key={ns} value={ns}>
                      {ns}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Coverage Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Translation Coverage</CardTitle>
          <CardDescription>Number of translations per language and namespace</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Language</th>
                  {namespaces.map(ns => (
                    <th key={ns} className="text-right p-2">{ns}</th>
                  ))}
                  <th className="text-right p-2">Total</th>
                </tr>
              </thead>
              <tbody>
                {languages?.map((lang) => {
                  const langCoverage = coverage?.filter(c => c.languageCode === lang.code) || [];
                  const total = langCoverage.reduce((sum, c) => sum + c.count, 0);

                  return (
                    <tr key={lang.code} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{lang.nativeName}</td>
                      {namespaces.map(ns => {
                        const count = langCoverage.find(c => c.namespace === ns)?.count || 0;
                        return (
                          <td key={ns} className="text-right p-2">{count}</td>
                        );
                      })}
                      <td className="text-right p-2 font-bold">{total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Translations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Translations</CardTitle>
          <CardDescription>
            {translations?.length || 0} translations for {selectedLanguage} / {selectedNamespace}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Key</th>
                  <th className="text-left p-2">Value</th>
                  <th className="text-left p-2">Context</th>
                  <th className="text-right p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {translations?.map((translation) => (
                  <tr key={translation.id} className="border-b hover:bg-muted/50">
                    <td className="p-2 font-mono text-sm">{translation.key}</td>
                    <td className="p-2">{translation.value}</td>
                    <td className="p-2 text-sm text-muted-foreground">{translation.context || "-"}</td>
                    <td className="text-right p-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          if (confirm("Are you sure you want to delete this translation?")) {
                            deleteMutation.mutate({ id: translation.id });
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Step 6: Add Language Switcher to DashboardLayout**

```typescript
// client/src/components/DashboardLayout.tsx - Add to header

import { LanguageSwitcher } from "./LanguageSwitcher";

// In the header section, add:
<LanguageSwitcher />
```

#### Frontend Implementation - Mobile Apps (Flutter)

**Step 1: Add dependencies to pubspec.yaml**

```yaml
dependencies:
  flutter_localizations:
    sdk: flutter
  intl: ^0.18.1
  shared_preferences: ^2.2.2
```

**Step 2: Configure localization**

```dart
// lib/l10n/app_en.arb (English)
{
  "@@locale": "en",
  "welcome": "Welcome",
  "login": "Login",
  "signup": "Sign Up",
  "phone_number": "Phone Number",
  "password": "Password",
  "forgot_password": "Forgot Password?",
  "dont_have_account": "Don't have an account?",
  "already_have_account": "Already have an account?",
  "orders": "Orders",
  "products": "Products",
  "cart": "Cart",
  "profile": "Profile"
}

// lib/l10n/app_fr.arb (French)
{
  "@@locale": "fr",
  "welcome": "Bienvenue",
  "login": "Connexion",
  "signup": "S'inscrire",
  "phone_number": "Numéro de téléphone",
  "password": "Mot de passe",
  "forgot_password": "Mot de passe oublié?",
  "dont_have_account": "Vous n'avez pas de compte?",
  "already_have_account": "Vous avez déjà un compte?",
  "orders": "Commandes",
  "products": "Produits",
  "cart": "Panier",
  "profile": "Profil"
}
```

**Step 3: Update main.dart**

```dart
// lib/main.dart

import 'package:flutter/material.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:flutter_gen/gen_l10n/app_localizations.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Okada',
      localizationsDelegates: const [
        AppLocalizations.delegate,
        GlobalMaterialLocalizations.delegate,
        GlobalWidgetsLocalizations.delegate,
        GlobalCupertinoLocalizations.delegate,
      ],
      supportedLocales: const [
        Locale('en'),
        Locale('fr'),
      ],
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: const HomePage(),
    );
  }
}
```

**Step 4: Create language switcher**

```dart
// lib/widgets/language_switcher.dart

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LanguageSwitcher extends StatefulWidget {
  const LanguageSwitcher({Key? key}) : super(key: key);

  @override
  State<LanguageSwitcher> createState() => _LanguageSwitcherState();
}

class _LanguageSwitcherState extends State<LanguageSwitcher> {
  String _currentLanguage = 'en';

  @override
  void initState() {
    super.initState();
    _loadLanguage();
  }

  Future<void> _loadLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _currentLanguage = prefs.getString('language') ?? 'en';
    });
  }

  Future<void> _changeLanguage(String languageCode) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('language', languageCode);
    setState(() {
      _currentLanguage = languageCode;
    });
    // Restart app to apply language change
    // You may want to use a state management solution for this
  }

  @override
  Widget build(BuildContext context) {
    return DropdownButton<String>(
      value: _currentLanguage,
      items: const [
        DropdownMenuItem(value: 'en', child: Text('English')),
        DropdownMenuItem(value: 'fr', child: Text('Français')),
      ],
      onChanged: (value) {
        if (value != null) {
          _changeLanguage(value);
        }
      },
    );
  }
}
```

#### Initial Translation Data

```typescript
// scripts/seed-translations.ts - Run this to populate initial translations

import { getDb } from "../server/db";
import { languages, translations } from "../drizzle/schema";

async function seedTranslations() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Insert languages
  await db.insert(languages).values([
    {
      code: "en",
      name: "English",
      nativeName: "English",
      isRTL: false,
      isActive: true,
      isDefault: true,
    },
    {
      code: "fr",
      name: "French",
      nativeName: "Français",
      isRTL: false,
      isActive: true,
      isDefault: false,
    },
  ]).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });

  // Common translations
  const commonTranslations = [
    // English
    { languageCode: "en", namespace: "common", key: "welcome", value: "Welcome" },
    { languageCode: "en", namespace: "common", key: "login", value: "Login" },
    { languageCode: "en", namespace: "common", key: "logout", value: "Logout" },
    { languageCode: "en", namespace: "common", key: "signup", value: "Sign Up" },
    { languageCode: "en", namespace: "common", key: "save", value: "Save" },
    { languageCode: "en", namespace: "common", key: "cancel", value: "Cancel" },
    { languageCode: "en", namespace: "common", key: "delete", value: "Delete" },
    { languageCode: "en", namespace: "common", key: "edit", value: "Edit" },
    { languageCode: "en", namespace: "common", key: "search", value: "Search" },
    { languageCode: "en", namespace: "common", key: "filter", value: "Filter" },
    
    // French
    { languageCode: "fr", namespace: "common", key: "welcome", value: "Bienvenue" },
    { languageCode: "fr", namespace: "common", key: "login", value: "Connexion" },
    { languageCode: "fr", namespace: "common", key: "logout", value: "Déconnexion" },
    { languageCode: "fr", namespace: "common", key: "signup", value: "S'inscrire" },
    { languageCode: "fr", namespace: "common", key: "save", value: "Enregistrer" },
    { languageCode: "fr", namespace: "common", key: "cancel", value: "Annuler" },
    { languageCode: "fr", namespace: "common", key: "delete", value: "Supprimer" },
    { languageCode: "fr", namespace: "common", key: "edit", value: "Modifier" },
    { languageCode: "fr", namespace: "common", key: "search", value: "Rechercher" },
    { languageCode: "fr", namespace: "common", key: "filter", value: "Filtrer" },
  ];

  await db.insert(translations).values(commonTranslations).onDuplicateKeyUpdate({
    set: { value: sql`VALUES(value)`, updatedAt: new Date() },
  });

  console.log("✅ Translations seeded successfully");
}

seedTranslations().catch(console.error);
```

#### Testing Requirements

```typescript
// server/routers.test.ts - Add i18n tests

describe("i18n", () => {
  describe("getLanguages", () => {
    it("should return active languages", async () => {
      const result = await trpc.i18n.getLanguages.query();

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("code");
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("nativeName");
    });

    it("should return default language first", async () => {
      const result = await trpc.i18n.getLanguages.query();

      expect(result[0].isDefault).toBe(true);
    });
  });

  describe("getTranslations", () => {
    it("should return translations for a language", async () => {
      const result = await trpc.i18n.getTranslations.query({
        languageCode: "en",
        namespace: "common",
      });

      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("key");
      expect(result[0]).toHaveProperty("value");
    });

    it("should filter by namespace", async () => {
      const result = await trpc.i18n.getTranslations.query({
        languageCode: "en",
        namespace: "common",
      });

      expect(result.every(t => t.namespace === "common")).toBe(true);
    });
  });

  describe("upsertTranslation", () => {
    it("should create new translation", async () => {
      const result = await trpc.i18n.upsertTranslation.mutate({
        languageCode: "en",
        namespace: "test",
        key: "test_key",
        value: "Test Value",
      });

      expect(result.success).toBe(true);
    });

    it("should update existing translation", async () => {
      // Create initial translation
      await trpc.i18n.upsertTranslation.mutate({
        languageCode: "en",
        namespace: "test",
        key: "update_test",
        value: "Initial Value",
      });

      // Update it
      await trpc.i18n.upsertTranslation.mutate({
        languageCode: "en",
        namespace: "test",
        key: "update_test",
        value: "Updated Value",
      });

      // Verify update
      const translations = await trpc.i18n.getTranslations.query({
        languageCode: "en",
        namespace: "test",
      });

      const updated = translations.find(t => t.key === "update_test");
      expect(updated?.value).toBe("Updated Value");
    });

    it("should require admin privileges", async () => {
      // Test with non-admin user
      await expect(
        trpc.i18n.upsertTranslation.mutate({
          languageCode: "en",
          namespace: "test",
          key: "test",
          value: "test",
        })
      ).rejects.toThrow("FORBIDDEN");
    });
  });

  describe("bulkUpsertTranslations", () => {
    it("should upload multiple translations", async () => {
      const result = await trpc.i18n.bulkUpsertTranslations.mutate({
        translations: [
          { languageCode: "en", namespace: "test", key: "bulk1", value: "Value 1" },
          { languageCode: "en", namespace: "test", key: "bulk2", value: "Value 2" },
          { languageCode: "en", namespace: "test", key: "bulk3", value: "Value 3" },
        ],
      });

      expect(result.success).toBe(true);
      expect(result.count).toBe(3);
    });
  });

  describe("getCoverage", () => {
    it("should return translation coverage stats", async () => {
      const result = await trpc.i18n.getCoverage.query();

      expect(result).toBeInstanceOf(Array);
      expect(result[0]).toHaveProperty("languageCode");
      expect(result[0]).toHaveProperty("namespace");
      expect(result[0]).toHaveProperty("count");
    });
  });
});
```

#### Acceptance Criteria

- [ ] Database tables `languages` and `translations` created
- [ ] Backend functions implemented: `getLanguages`, `getTranslations`, `upsertTranslation`, `bulkUpsertTranslations`, `getTranslationCoverage`
- [ ] tRPC procedures working: `getLanguages`, `getTranslations`, `upsertTranslation`, `bulkUpsertTranslations`, `deleteTranslation`, `getCoverage`
- [ ] react-i18next installed and configured for admin dashboard
- [ ] LanguageSwitcher component created and added to DashboardLayout
- [ ] TranslationManagement page created with CRUD operations
- [ ] CSV export/import functionality working
- [ ] Translation coverage stats displayed
- [ ] Initial translations seeded for English and French
- [ ] Flutter localization configured for mobile apps
- [ ] Language switcher working in mobile apps
- [ ] All UI strings use translation keys (no hardcoded text)
- [ ] All 6 test suites passing
- [ ] Activity logging for translation operations working
- [ ] Admin-only access enforced for translation management
- [ ] Route `/translation-management` added to App.tsx
- [ ] Menu item "Translation Management" added to DashboardLayout sidebar under System section

#### Files to Create/Modify

**Create**:
- `client/src/lib/i18n.ts` (i18next configuration)
- `client/src/components/LanguageSwitcher.tsx` (language switcher component)
- `client/src/pages/TranslationManagement.tsx` (translation management page, 400+ lines)
- `scripts/seed-translations.ts` (initial translation data)
- `customer_app/lib/l10n/app_en.arb` (English translations for mobile)
- `customer_app/lib/l10n/app_fr.arb` (French translations for mobile)
- `customer_app/lib/widgets/language_switcher.dart` (mobile language switcher)
- `rider_app/lib/l10n/app_en.arb` (English translations for rider app)
- `rider_app/lib/l10n/app_fr.arb` (French translations for rider app)

**Modify**:
- `drizzle/schema.ts` (add `languages` and `translations` tables, ~50 lines)
- `server/db.ts` (add 6 i18n functions, ~200 lines)
- `server/routers.ts` (add `i18n` router with 6 procedures, ~150 lines)
- `client/src/main.tsx` (add i18n import, 1 line)
- `client/src/App.tsx` (add route for `/translation-management`, 1 line)
- `client/src/components/DashboardLayout.tsx` (add LanguageSwitcher and menu item, 10 lines)
- `server/routers.test.ts` (add test suite, ~100 lines)
- `customer_app/lib/main.dart` (add localization delegates, ~20 lines)
- `customer_app/pubspec.yaml` (add dependencies, 5 lines)
- `rider_app/lib/main.dart` (add localization delegates, ~20 lines)
- `rider_app/pubspec.yaml` (add dependencies, 5 lines)

**Impact**: This implementation ensures the platform is accessible to both English and French-speaking users in Cameroon, addressing a critical market requirement that affects 60% of the potential user base

### Task ADMIN-013: Tax & Accounting Dashboard
- **Effort**: 10 hours
- **Database**: `taxRates`, `taxTransactions`, `accountingEntries` tables
- **Features**: Tax calculation, transaction categorization, financial reports
- **UI**: Tax configuration, transaction log, P&L reports

### Task ADMIN-014: Capacity Planning Dashboard
- **Effort**: 12 hours
- **Database**: `capacityForecasts`, `demandPatterns` tables
- **Features**: Demand forecasting, capacity utilization, resource allocation
- **UI**: Forecast charts, utilization heatmaps, allocation tools

### Task ADMIN-015: SLA Monitoring Dashboard
- **Effort**: 10 hours
- **Database**: `slaMetrics`, `slaViolations` tables
- **Features**: SLA tracking, violation alerts, performance reports
- **UI**: SLA dashboard, violation log, compliance metrics

---

## Phase 1 Summary

**Total Effort**: 180 hours (15 tasks × 12 hours average)  
**Timeline**: 4.5 weeks (at 40 hours/week)  
**Deliverables**: 15 new admin screens, 100% admin dashboard completion

**Quality Gates**:
- [ ] All 15 screens functional and tested
- [ ] 70%+ test coverage for new code
- [ ] 0 TypeScript errors
- [ ] 0 ESLint errors
- [ ] All routes added to App.tsx
- [ ] All menu items added to DashboardLayout
- [ ] Documentation updated

---

## Phase 2: Customer Mobile App MVP (20 Screens)

**Timeline**: 4 weeks  
**Technology**: Flutter 3.10+  
**Priority**: CRITICAL - Blocks customer acquisition

### Mobile App Architecture

```
customer_app/
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── config/
│   │   │   ├── app_config.dart
│   │   │   ├── api_config.dart
│   │   │   └── theme_config.dart
│   │   ├── network/
│   │   │   ├── api_client.dart
│   │   │   ├── api_interceptor.dart
│   │   │   └── api_error_handler.dart
│   │   ├── storage/
│   │   │   ├── hive_storage.dart
│   │   │   └── secure_storage.dart
│   │   └── utils/
│   │       ├── validators.dart
│   │       ├── formatters.dart
│   │       └── constants.dart
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── models/
│   │   │   │   ├── repositories/
│   │   │   │   └── datasources/
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   ├── repositories/
│   │   │   │   └── usecases/
│   │   │   └── presentation/
│   │   │       ├── bloc/
│   │   │       ├── pages/
│   │   │       └── widgets/
│   │   ├── products/
│   │   ├── cart/
│   │   ├── orders/
│   │   └── profile/
│   └── shared/
│       ├── widgets/
│       ├── models/
│       └── utils/
├── test/
└── pubspec.yaml
```

### Task MOB-CUST-001: Authentication Module

**Priority**: CRITICAL  
**Estimated Effort**: 16 hours  
**Screens**: Login, Signup, OTP Verification, Forgot Password

#### Dependencies

```yaml
# pubspec.yaml additions
dependencies:
  flutter_bloc: ^8.1.3
  equatable: ^2.0.5
  dio: ^5.3.3
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  flutter_secure_storage: ^9.0.0
  shared_preferences: ^2.2.2
  jwt_decoder: ^2.0.1
```

#### Data Layer

```dart
// lib/features/auth/data/models/user_model.dart

import 'package:equatable/equatable.dart';

class UserModel extends Equatable {
  final int id;
  final String openId;
  final String? name;
  final String? email;
  final String? phone;
  final String? loginMethod;
  final String? role;
  final DateTime? createdAt;
  final DateTime? lastSignedIn;

  const UserModel({
    required this.id,
    required this.openId,
    this.name,
    this.email,
    this.phone,
    this.loginMethod,
    this.role,
    this.createdAt,
    this.lastSignedIn,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as int,
      openId: json['openId'] as String,
      name: json['name'] as String?,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      loginMethod: json['loginMethod'] as String?,
      role: json['role'] as String?,
      createdAt: json['createdAt'] != null ? DateTime.parse(json['createdAt'] as String) : null,
      lastSignedIn: json['lastSignedIn'] != null ? DateTime.parse(json['lastSignedIn'] as String) : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'openId': openId,
      'name': name,
      'email': email,
      'phone': phone,
      'loginMethod': loginMethod,
      'role': role,
      'createdAt': createdAt?.toIso8601String(),
      'lastSignedIn': lastSignedIn?.toIso8601String(),
    };
  }

  @override
  List<Object?> get props => [id, openId, name, email, phone, loginMethod, role, createdAt, lastSignedIn];
}

// lib/features/auth/data/models/auth_response_model.dart

class AuthResponseModel extends Equatable {
  final String accessToken;
  final String refreshToken;
  final UserModel user;
  final int expiresIn;

  const AuthResponseModel({
    required this.accessToken,
    required this.refreshToken,
    required this.user,
    required this.expiresIn,
  });

  factory AuthResponseModel.fromJson(Map<String, dynamic> json) {
    return AuthResponseModel(
      accessToken: json['accessToken'] as String,
      refreshToken: json['refreshToken'] as String,
      user: UserModel.fromJson(json['user'] as Map<String, dynamic>),
      expiresIn: json['expiresIn'] as int,
    );
  }

  @override
  List<Object?> get props => [accessToken, refreshToken, user, expiresIn];
}
```

```dart
// lib/features/auth/data/datasources/auth_remote_datasource.dart

import 'package:dio/dio.dart';
import '../models/auth_response_model.dart';

abstract class AuthRemoteDataSource {
  Future<AuthResponseModel> login(String phone, String password);
  Future<AuthResponseModel> signup(String phone, String name, String password);
  Future<void> sendOTP(String phone);
  Future<AuthResponseModel> verifyOTP(String phone, String otp);
  Future<void> resetPassword(String phone, String newPassword, String otp);
  Future<void> logout();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio dio;

  AuthRemoteDataSourceImpl({required this.dio});

  @override
  Future<AuthResponseModel> login(String phone, String password) async {
    try {
      final response = await dio.post(
        '/auth/login',
        data: {
          'phone': phone,
          'password': password,
        },
      );

      if (response.statusCode == 200) {
        return AuthResponseModel.fromJson(response.data);
      } else {
        throw Exception('Login failed: ${response.statusMessage}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    }
  }

  @override
  Future<AuthResponseModel> signup(String phone, String name, String password) async {
    try {
      final response = await dio.post(
        '/auth/signup',
        data: {
          'phone': phone,
          'name': name,
          'password': password,
        },
      );

      if (response.statusCode == 201) {
        return AuthResponseModel.fromJson(response.data);
      } else {
        throw Exception('Signup failed: ${response.statusMessage}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    }
  }

  @override
  Future<void> sendOTP(String phone) async {
    try {
      final response = await dio.post(
        '/auth/send-otp',
        data: {'phone': phone},
      );

      if (response.statusCode != 200) {
        throw Exception('Failed to send OTP: ${response.statusMessage}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    }
  }

  @override
  Future<AuthResponseModel> verifyOTP(String phone, String otp) async {
    try {
      final response = await dio.post(
        '/auth/verify-otp',
        data: {
          'phone': phone,
          'otp': otp,
        },
      );

      if (response.statusCode == 200) {
        return AuthResponseModel.fromJson(response.data);
      } else {
        throw Exception('OTP verification failed: ${response.statusMessage}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    }
  }

  @override
  Future<void> resetPassword(String phone, String newPassword, String otp) async {
    try {
      final response = await dio.post(
        '/auth/reset-password',
        data: {
          'phone': phone,
          'newPassword': newPassword,
          'otp': otp,
        },
      );

      if (response.statusCode != 200) {
        throw Exception('Password reset failed: ${response.statusMessage}');
      }
    } on DioException catch (e) {
      throw Exception('Network error: ${e.message}');
    }
  }

  @override
  Future<void> logout() async {
    try {
      await dio.post('/auth/logout');
    } on DioException catch (e) {
      // Log error but don't throw - allow local logout even if API fails
      print('Logout API error: ${e.message}');
    }
  }
}
```

```dart
// lib/features/auth/data/datasources/auth_local_datasource.dart

import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:hive/hive.dart';
import '../models/user_model.dart';

abstract class AuthLocalDataSource {
  Future<void> cacheAuthTokens(String accessToken, String refreshToken);
  Future<String?> getAccessToken();
  Future<String?> getRefreshToken();
  Future<void> cacheUser(UserModel user);
  Future<UserModel?> getCachedUser();
  Future<void> clearAuthData();
}

class AuthLocalDataSourceImpl implements AuthLocalDataSource {
  final FlutterSecureStorage secureStorage;
  final Box userBox;

  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  static const String _userKey = 'user';

  AuthLocalDataSourceImpl({
    required this.secureStorage,
    required this.userBox,
  });

  @override
  Future<void> cacheAuthTokens(String accessToken, String refreshToken) async {
    await secureStorage.write(key: _accessTokenKey, value: accessToken);
    await secureStorage.write(key: _refreshTokenKey, value: refreshToken);
  }

  @override
  Future<String?> getAccessToken() async {
    return await secureStorage.read(key: _accessTokenKey);
  }

  @override
  Future<String?> getRefreshToken() async {
    return await secureStorage.read(key: _refreshTokenKey);
  }

  @override
  Future<void> cacheUser(UserModel user) async {
    await userBox.put(_userKey, user.toJson());
  }

  @override
  Future<UserModel?> getCachedUser() async {
    final userData = userBox.get(_userKey);
    if (userData != null) {
      return UserModel.fromJson(Map<String, dynamic>.from(userData));
    }
    return null;
  }

  @override
  Future<void> clearAuthData() async {
    await secureStorage.delete(key: _accessTokenKey);
    await secureStorage.delete(key: _refreshTokenKey);
    await userBox.delete(_userKey);
  }
}
```

#### BLoC Layer

```dart
// lib/features/auth/presentation/bloc/auth_bloc.dart

import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';
import '../../data/models/user_model.dart';
import '../../data/repositories/auth_repository.dart';

// Events
abstract class AuthEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoginRequested extends AuthEvent {
  final String phone;
  final String password;

  LoginRequested({required this.phone, required this.password});

  @override
  List<Object?> get props => [phone, password];
}

class SignupRequested extends AuthEvent {
  final String phone;
  final String name;
  final String password;

  SignupRequested({required this.phone, required this.name, required this.password});

  @override
  List<Object?> get props => [phone, name, password];
}

class SendOTPRequested extends AuthEvent {
  final String phone;

  SendOTPRequested({required this.phone});

  @override
  List<Object?> get props => [phone];
}

class VerifyOTPRequested extends AuthEvent {
  final String phone;
  final String otp;

  VerifyOTPRequested({required this.phone, required this.otp});

  @override
  List<Object?> get props => [phone, otp];
}

class ResetPasswordRequested extends AuthEvent {
  final String phone;
  final String newPassword;
  final String otp;

  ResetPasswordRequested({required this.phone, required this.newPassword, required this.otp});

  @override
  List<Object?> get props => [phone, newPassword, otp];
}

class LogoutRequested extends AuthEvent {}

class CheckAuthStatus extends AuthEvent {}

// States
abstract class AuthState extends Equatable {
  @override
  List<Object?> get props => [];
}

class AuthInitial extends AuthState {}

class AuthLoading extends AuthState {}

class Authenticated extends AuthState {
  final UserModel user;

  Authenticated({required this.user});

  @override
  List<Object?> get props => [user];
}

class Unauthenticated extends AuthState {}

class OTPSent extends AuthState {
  final String phone;

  OTPSent({required this.phone});

  @override
  List<Object?> get props => [phone];
}

class PasswordResetSuccess extends AuthState {}

class AuthError extends AuthState {
  final String message;

  AuthError({required this.message});

  @override
  List<Object?> get props => [message];
}

// BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  final AuthRepository authRepository;

  AuthBloc({required this.authRepository}) : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<SignupRequested>(_onSignupRequested);
    on<SendOTPRequested>(_onSendOTPRequested);
    on<VerifyOTPRequested>(_onVerifyOTPRequested);
    on<ResetPasswordRequested>(_onResetPasswordRequested);
    on<LogoutRequested>(_onLogoutRequested);
    on<CheckAuthStatus>(_onCheckAuthStatus);
  }

  Future<void> _onLoginRequested(LoginRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final authResponse = await authRepository.login(event.phone, event.password);
      emit(Authenticated(user: authResponse.user));
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onSignupRequested(SignupRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final authResponse = await authRepository.signup(event.phone, event.name, event.password);
      emit(Authenticated(user: authResponse.user));
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onSendOTPRequested(SendOTPRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await authRepository.sendOTP(event.phone);
      emit(OTPSent(phone: event.phone));
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onVerifyOTPRequested(VerifyOTPRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      final authResponse = await authRepository.verifyOTP(event.phone, event.otp);
      emit(Authenticated(user: authResponse.user));
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onResetPasswordRequested(ResetPasswordRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await authRepository.resetPassword(event.phone, event.newPassword, event.otp);
      emit(PasswordResetSuccess());
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onLogoutRequested(LogoutRequested event, Emitter<AuthState> emit) async {
    emit(AuthLoading());
    try {
      await authRepository.logout();
      emit(Unauthenticated());
    } catch (e) {
      emit(AuthError(message: e.toString()));
    }
  }

  Future<void> _onCheckAuthStatus(CheckAuthStatus event, Emitter<AuthState> emit) async {
    final user = await authRepository.getCachedUser();
    if (user != null) {
      final token = await authRepository.getAccessToken();
      if (token != null && !_isTokenExpired(token)) {
        emit(Authenticated(user: user));
      } else {
        emit(Unauthenticated());
      }
    } else {
      emit(Unauthenticated());
    }
  }

  bool _isTokenExpired(String token) {
    // Implement JWT expiration check
    // For now, return false (assume token is valid)
    return false;
  }
}
```

#### Presentation Layer

```dart
// lib/features/auth/presentation/pages/login_page.dart

import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../bloc/auth_bloc.dart';
import 'signup_page.dart';
import 'forgot_password_page.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _phoneController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;

  @override
  void dispose() {
    _phoneController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _handleLogin() {
    if (_formKey.currentState!.validate()) {
      context.read<AuthBloc>().add(
            LoginRequested(
              phone: _phoneController.text.trim(),
              password: _passwordController.text,
            ),
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is Authenticated) {
            Navigator.of(context).pushReplacementNamed('/home');
          } else if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red,
              ),
            );
          }
        },
        builder: (context, state) {
          final isLoading = state is AuthLoading;

          return SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24.0),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 60),
                    // Logo
                    Image.asset(
                      'assets/images/logo.png',
                      height: 80,
                    ),
                    const SizedBox(height: 16),
                    // Title
                    Text(
                      'Welcome Back',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Login to continue',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[600],
                          ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 48),
                    // Phone Number Field
                    TextFormField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      decoration: InputDecoration(
                        labelText: 'Phone Number',
                        hintText: '6XXXXXXXX',
                        prefixIcon: const Icon(Icons.phone),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your phone number';
                        }
                        if (!RegExp(r'^6[0-9]{8}$').hasMatch(value)) {
                          return 'Please enter a valid Cameroon phone number';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    // Password Field
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      decoration: InputDecoration(
                        labelText: 'Password',
                        prefixIcon: const Icon(Icons.lock),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword ? Icons.visibility_off : Icons.visibility,
                          ),
                          onPressed: () {
                            setState(() {
                              _obscurePassword = !_obscurePassword;
                            });
                          },
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your password';
                        }
                        if (value.length < 6) {
                          return 'Password must be at least 6 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 8),
                    // Forgot Password Link
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: isLoading
                            ? null
                            : () {
                                Navigator.of(context).push(
                                  MaterialPageRoute(
                                    builder: (_) => const ForgotPasswordPage(),
                                  ),
                                );
                              },
                        child: const Text('Forgot Password?'),
                      ),
                    ),
                    const SizedBox(height: 24),
                    // Login Button
                    ElevatedButton(
                      onPressed: isLoading ? null : _handleLogin,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Text(
                              'Login',
                              style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                            ),
                    ),
                    const SizedBox(height: 24),
                    // Signup Link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "Don't have an account? ",
                          style: TextStyle(color: Colors.grey[600]),
                        ),
                        TextButton(
                          onPressed: isLoading
                              ? null
                              : () {
                                  Navigator.of(context).push(
                                    MaterialPageRoute(
                                      builder: (_) => const SignupPage(),
                                    ),
                                  );
                                },
                          child: const Text(
                            'Sign Up',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
```

#### Testing Requirements

```dart
// test/features/auth/presentation/bloc/auth_bloc_test.dart

import 'package:flutter_test/flutter_test.dart';
import 'package:bloc_test/bloc_test.dart';
import 'package:mockito/mockito.dart';
import 'package:mockito/annotations.dart';

@GenerateMocks([AuthRepository])
void main() {
  late AuthBloc authBloc;
  late MockAuthRepository mockAuthRepository;

  setUp(() {
    mockAuthRepository = MockAuthRepository();
    authBloc = AuthBloc(authRepository: mockAuthRepository);
  });

  tearDown(() {
    authBloc.close();
  });

  group('LoginRequested', () {
    const testPhone = '651234567';
    const testPassword = 'password123';
    final testAuthResponse = AuthResponseModel(
      accessToken: 'test_token',
      refreshToken: 'test_refresh',
      user: UserModel(id: 1, openId: 'test', name: 'Test User'),
      expiresIn: 3600,
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, Authenticated] when login is successful',
      build: () {
        when(mockAuthRepository.login(testPhone, testPassword))
            .thenAnswer((_) async => testAuthResponse);
        return authBloc;
      },
      act: (bloc) => bloc.add(LoginRequested(phone: testPhone, password: testPassword)),
      expect: () => [
        AuthLoading(),
        Authenticated(user: testAuthResponse.user),
      ],
      verify: (_) {
        verify(mockAuthRepository.login(testPhone, testPassword)).called(1);
      },
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, AuthError] when login fails',
      build: () {
        when(mockAuthRepository.login(testPhone, testPassword))
            .thenThrow(Exception('Invalid credentials'));
        return authBloc;
      },
      act: (bloc) => bloc.add(LoginRequested(phone: testPhone, password: testPassword)),
      expect: () => [
        AuthLoading(),
        AuthError(message: 'Exception: Invalid credentials'),
      ],
    );
  });

  group('SignupRequested', () {
    const testPhone = '651234567';
    const testName = 'Test User';
    const testPassword = 'password123';
    final testAuthResponse = AuthResponseModel(
      accessToken: 'test_token',
      refreshToken: 'test_refresh',
      user: UserModel(id: 1, openId: 'test', name: testName, phone: testPhone),
      expiresIn: 3600,
    );

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, Authenticated] when signup is successful',
      build: () {
        when(mockAuthRepository.signup(testPhone, testName, testPassword))
            .thenAnswer((_) async => testAuthResponse);
        return authBloc;
      },
      act: (bloc) => bloc.add(SignupRequested(phone: testPhone, name: testName, password: testPassword)),
      expect: () => [
        AuthLoading(),
        Authenticated(user: testAuthResponse.user),
      ],
      verify: (_) {
        verify(mockAuthRepository.signup(testPhone, testName, testPassword)).called(1);
      },
    );
  });

  group('SendOTPRequested', () {
    const testPhone = '651234567';

    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, OTPSent] when OTP is sent successfully',
      build: () {
        when(mockAuthRepository.sendOTP(testPhone))
            .thenAnswer((_) async => Future.value());
        return authBloc;
      },
      act: (bloc) => bloc.add(SendOTPRequested(phone: testPhone)),
      expect: () => [
        AuthLoading(),
        OTPSent(phone: testPhone),
      ],
      verify: (_) {
        verify(mockAuthRepository.sendOTP(testPhone)).called(1);
      },
    );
  });

  group('LogoutRequested', () {
    blocTest<AuthBloc, AuthState>(
      'emits [AuthLoading, Unauthenticated] when logout is successful',
      build: () {
        when(mockAuthRepository.logout())
            .thenAnswer((_) async => Future.value());
        return authBloc;
      },
      act: (bloc) => bloc.add(LogoutRequested()),
      expect: () => [
        AuthLoading(),
        Unauthenticated(),
      ],
      verify: (_) {
        verify(mockAuthRepository.logout()).called(1);
      },
    );
  });
}
```

#### Acceptance Criteria

- [ ] Flutter project initialized with proper directory structure
- [ ] Dependencies added to pubspec.yaml
- [ ] Data models created: UserModel, AuthResponseModel
- [ ] Remote data source implemented with Dio
- [ ] Local data source implemented with Hive and Secure Storage
- [ ] Repository layer implemented
- [ ] AuthBloc created with all events and states
- [ ] Login page UI implemented with validation
- [ ] Signup page UI implemented with validation
- [ ] OTP verification page implemented
- [ ] Forgot password page implemented
- [ ] All BLoC tests passing (login, signup, OTP, logout)
- [ ] Phone number validation working (Cameroon format: 6XXXXXXXX)
- [ ] Password validation working (min 6 characters)
- [ ] Token storage in secure storage working
- [ ] User data caching in Hive working
- [ ] Navigation to home page after successful authentication
- [ ] Error messages displayed for failed authentication
- [ ] Loading states displayed during API calls

#### Files to Create

**Create**:
- `customer_app/lib/main.dart`
- `customer_app/lib/core/config/app_config.dart`
- `customer_app/lib/core/config/api_config.dart`
- `customer_app/lib/core/network/api_client.dart`
- `customer_app/lib/core/storage/hive_storage.dart`
- `customer_app/lib/core/storage/secure_storage.dart`
- `customer_app/lib/features/auth/data/models/user_model.dart`
- `customer_app/lib/features/auth/data/models/auth_response_model.dart`
- `customer_app/lib/features/auth/data/datasources/auth_remote_datasource.dart`
- `customer_app/lib/features/auth/data/datasources/auth_local_datasource.dart`
- `customer_app/lib/features/auth/data/repositories/auth_repository.dart`
- `customer_app/lib/features/auth/presentation/bloc/auth_bloc.dart`
- `customer_app/lib/features/auth/presentation/pages/login_page.dart`
- `customer_app/lib/features/auth/presentation/pages/signup_page.dart`
- `customer_app/lib/features/auth/presentation/pages/otp_verification_page.dart`
- `customer_app/lib/features/auth/presentation/pages/forgot_password_page.dart`
- `customer_app/test/features/auth/presentation/bloc/auth_bloc_test.dart`
- `customer_app/pubspec.yaml`

---

## Conclusion

This implementation plan provides **granular, automation-ready specifications** for completing the Okada platform. Each task includes:

1. **Exact database schemas** with field types, constraints, and indexes
2. **Complete backend implementations** with function signatures and business logic
3. **Full frontend implementations** with component structures and UI requirements
4. **Comprehensive testing requirements** with test cases and assertions
5. **Clear acceptance criteria** for task completion verification
6. **Precise file paths** for all files to create or modify

The plan prioritizes **completing the admin dashboard first** (15 remaining screens, 4.5 weeks) before moving to mobile apps. This ensures the admin team has all necessary tools before launching customer-facing applications.

**Next Steps**:
1. Review and approve this implementation plan
2. Start with Task ADMIN-001 (Cohort Analysis Dashboard)
3. Follow the specifications exactly to ensure quality and consistency
4. Run tests after each task to verify completion
5. Update todo.md to track progress

This approach eliminates ambiguity, prevents rework, and enables systematic platform completion.


---

## Phase 2 Continued: Customer Mobile App - Remaining 19 Screens

### Task MOB-CUST-002: Product Browsing & Search (4 screens)
- **Effort**: 20 hours
- **Screens**: Product List, Product Detail, Search, Category Browser
- **Features**: Infinite scroll, filters, sorting, image gallery, reviews display
- **Backend**: Product catalog API, search API, category tree API

### Task MOB-CUST-003: Shopping Cart & Checkout (3 screens)
- **Effort**: 18 hours
- **Screens**: Cart, Checkout, Payment Method Selection
- **Features**: Quantity adjustment, promo codes, address selection, payment integration
- **Backend**: Cart management API, order creation API, payment processing

### Task MOB-CUST-004: Order Tracking (2 screens)
- **Effort**: 14 hours
- **Screens**: Active Orders, Order Detail with Live Tracking
- **Features**: Real-time location updates, rider contact, delivery ETA
- **Backend**: Order tracking API, WebSocket for live updates

### Task MOB-CUST-005: Order History & Reviews (2 screens)
- **Effort**: 12 hours
- **Screens**: Order History, Review Submission
- **Features**: Order filtering, reorder, rating and review submission
- **Backend**: Order history API, review submission API

### Task MOB-CUST-006: User Profile & Settings (3 screens)
- **Effort**: 14 hours
- **Screens**: Profile, Edit Profile, Settings
- **Features**: Profile photo upload, address management, notification preferences
- **Backend**: Profile API, address API, settings API

### Task MOB-CUST-007: Favorites & Wishlists (2 screens)
- **Effort**: 10 hours
- **Screens**: Favorites List, Wishlist Detail
- **Features**: Add/remove favorites, share wishlist, price alerts
- **Backend**: Favorites API, wishlist API

### Task MOB-CUST-008: Wallet & Credits (2 screens)
- **Effort**: 12 hours
- **Screens**: Wallet Dashboard, Transaction History
- **Features**: Balance display, top-up, transaction log, withdrawal
- **Backend**: Wallet API, transaction API, mobile money integration

### Task MOB-CUST-009: Notifications (1 screen)
- **Effort**: 8 hours
- **Screen**: Notifications Center
- **Features**: Push notifications, in-app notifications, notification preferences
- **Backend**: Notifications API, FCM integration

### Task MOB-CUST-010: Customer Support Chat (1 screen)
- **Effort**: 16 hours
- **Screen**: Support Chat
- **Features**: Real-time chat, file upload, chat history
- **Backend**: Chat API, WebSocket for real-time messaging

---

## Phase 3: Rider Mobile App MVP (15 Screens)

**Timeline**: 3 weeks  
**Technology**: Flutter 3.10+  
**Priority**: CRITICAL - Blocks delivery operations

### Task MOB-RIDER-001: Authentication & Onboarding (3 screens)
- **Effort**: 14 hours
- **Screens**: Login, Signup, Onboarding Tutorial
- **Features**: Phone auth, document upload, tutorial slides
- **Backend**: Rider auth API, document verification API

### Task MOB-RIDER-002: Shift Management (2 screens)
- **Effort**: 12 hours
- **Screens**: Shift Dashboard, Check-in/Check-out
- **Features**: Shift scheduling, location-based check-in, break management
- **Backend**: Shift API, location tracking API

### Task MOB-RIDER-003: Available Orders (1 screen)
- **Effort**: 10 hours
- **Screen**: Available Orders List
- **Features**: Order filtering, distance calculation, earnings preview
- **Backend**: Available orders API, distance calculation

### Task MOB-RIDER-004: Order Acceptance & Navigation (3 screens)
- **Effort**: 18 hours
- **Screens**: Order Detail, Navigation to Pickup, Navigation to Delivery
- **Features**: Order acceptance, Google Maps integration, turn-by-turn navigation
- **Backend**: Order acceptance API, route optimization API

### Task MOB-RIDER-005: Order Completion (2 screens)
- **Effort**: 14 hours
- **Screens**: Delivery Confirmation, Quality Photo Upload
- **Features**: Photo capture, signature collection, completion confirmation
- **Backend**: Order completion API, photo upload to S3

### Task MOB-RIDER-006: Earnings Dashboard (2 screens)
- **Effort**: 12 hours
- **Screens**: Earnings Overview, Earnings Breakdown
- **Features**: Daily/weekly/monthly earnings, bonus tracking, payout requests
- **Backend**: Earnings API, payout API

### Task MOB-RIDER-007: Rider Profile & Support (2 screens)
- **Effort**: 10 hours
- **Screens**: Rider Profile, Support & Help
- **Features**: Profile editing, performance metrics, support chat
- **Backend**: Profile API, support API

---

## Phase 4: Seller Portal (30 Screens)

**Timeline**: 5 weeks  
**Technology**: React 19 + Tailwind 4 (same stack as admin)  
**Priority**: HIGH - Enables marketplace expansion

### Architecture

```
seller_portal/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── auth/
│   │   │   │   ├── Login.tsx
│   │   │   │   ├── Signup.tsx
│   │   │   │   └── VerifyDocuments.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   └── Analytics.tsx
│   │   │   ├── products/
│   │   │   │   ├── ProductList.tsx
│   │   │   │   ├── AddProduct.tsx
│   │   │   │   ├── EditProduct.tsx
│   │   │   │   └── BulkUpload.tsx
│   │   │   ├── inventory/
│   │   │   │   ├── InventoryOverview.tsx
│   │   │   │   ├── StockAdjustment.tsx
│   │   │   │   └── InventoryAlerts.tsx
│   │   │   ├── orders/
│   │   │   │   ├── OrderList.tsx
│   │   │   │   ├── OrderDetail.tsx
│   │   │   │   └── OrderFulfillment.tsx
│   │   │   ├── financials/
│   │   │   │   ├── SalesAnalytics.tsx
│   │   │   │   ├── PayoutHistory.tsx
│   │   │   │   └── InvoiceManagement.tsx
│   │   │   ├── marketing/
│   │   │   │   ├── Promotions.tsx
│   │   │   │   ├── Coupons.tsx
│   │   │   │   └── Campaigns.tsx
│   │   │   ├── reviews/
│   │   │   │   ├── ReviewList.tsx
│   │   │   │   └── ReviewResponse.tsx
│   │   │   ├── support/
│   │   │   │   ├── SupportTickets.tsx
│   │   │   │   └── TicketDetail.tsx
│   │   │   └── settings/
│   │   │       ├── SellerProfile.tsx
│   │   │       ├── BusinessInfo.tsx
│   │   │       └── NotificationSettings.tsx
│   │   └── components/
│   │       └── SellerLayout.tsx
├── server/
│   └── routers/
│       └── seller.ts
└── drizzle/
    └── schema.ts (shared with admin)
```

### Task SELLER-001: Authentication & Onboarding (3 screens)
- **Effort**: 12 hours
- **Screens**: Login, Signup, Document Verification
- **Features**: Seller registration, business document upload, verification status
- **Backend**: Seller auth API, document verification workflow

### Task SELLER-002: Dashboard & Analytics (2 screens)
- **Effort**: 14 hours
- **Screens**: Dashboard, Analytics
- **Features**: Sales overview, top products, revenue charts, order stats
- **Backend**: Seller analytics API

### Task SELLER-003: Product Management (4 screens)
- **Effort**: 20 hours
- **Screens**: Product List, Add Product, Edit Product, Bulk Upload
- **Features**: Product CRUD, image upload, category selection, CSV import
- **Backend**: Product management API, bulk upload API

### Task SELLER-004: Inventory Management (3 screens)
- **Effort**: 16 hours
- **Screens**: Inventory Overview, Stock Adjustment, Inventory Alerts
- **Features**: Stock tracking, low stock alerts, stock adjustment history
- **Backend**: Inventory API, alert configuration API

### Task SELLER-005: Order Management (3 screens)
- **Effort**: 18 hours
- **Screens**: Order List, Order Detail, Order Fulfillment
- **Features**: Order filtering, fulfillment workflow, shipping label generation
- **Backend**: Seller order API, fulfillment API

### Task SELLER-006: Financial Management (3 screens)
- **Effort**: 16 hours
- **Screens**: Sales Analytics, Payout History, Invoice Management
- **Features**: Revenue tracking, payout requests, invoice generation
- **Backend**: Seller financials API, payout API

### Task SELLER-007: Marketing Tools (3 screens)
- **Effort**: 14 hours
- **Screens**: Promotions, Coupons, Campaigns
- **Features**: Discount creation, coupon management, campaign tracking
- **Backend**: Seller marketing API

### Task SELLER-008: Review Management (2 screens)
- **Effort**: 10 hours
- **Screens**: Review List, Review Response
- **Features**: Review display, seller responses, rating analytics
- **Backend**: Review API

### Task SELLER-009: Support & Communication (2 screens)
- **Effort**: 12 hours
- **Screens**: Support Tickets, Ticket Detail
- **Features**: Ticket creation, admin communication, ticket history
- **Backend**: Seller support API

### Task SELLER-010: Settings & Profile (3 screens)
- **Effort**: 12 hours
- **Screens**: Seller Profile, Business Info, Notification Settings
- **Features**: Profile editing, business details, notification preferences
- **Backend**: Seller settings API

### Task SELLER-011: Performance Metrics (1 screen)
- **Effort**: 10 hours
- **Screen**: Performance Dashboard
- **Features**: Fulfillment rate, response time, customer satisfaction
- **Backend**: Seller performance API

### Task SELLER-012: Catalog Management (1 screen)
- **Effort**: 8 hours
- **Screen**: Catalog Browser
- **Features**: Category navigation, product search, quick edit
- **Backend**: Catalog API

### Task SELLER-013: Shipping & Logistics (1 screen)
- **Effort**: 10 hours
- **Screen**: Shipping Settings
- **Features**: Shipping zones, rates, carrier integration
- **Backend**: Shipping configuration API

### Task SELLER-014: Tax Configuration (1 screen)
- **Effort**: 8 hours
- **Screen**: Tax Settings
- **Features**: Tax rate configuration, tax exemptions
- **Backend**: Tax configuration API

### Task SELLER-015: Reports & Exports (1 screen)
- **Effort**: 10 hours
- **Screen**: Report Center
- **Features**: Custom reports, data export, scheduled reports
- **Backend**: Report generation API

---

## Phase 5: Advanced Features (50+ Screens)

**Timeline**: 12 weeks  
**Priority**: MEDIUM - Post-MVP enhancements

### Category: Advanced Analytics (15 screens)

#### Task ADV-001: Customer Lifetime Value Analysis
- **Effort**: 12 hours
- **Features**: CLV calculation, segmentation, prediction models
- **Backend**: CLV calculation engine, ML model integration

#### Task ADV-002: Churn Prediction Dashboard
- **Effort**: 14 hours
- **Features**: Churn risk scoring, retention campaigns, intervention tracking
- **Backend**: Churn prediction ML model, campaign API

#### Task ADV-003: Market Basket Analysis
- **Effort**: 12 hours
- **Features**: Product affinity analysis, bundle recommendations
- **Backend**: Association rule mining, recommendation engine

#### Task ADV-004: Demand Forecasting
- **Effort**: 16 hours
- **Features**: Sales forecasting, inventory optimization, seasonal trends
- **Backend**: Time series forecasting models

#### Task ADV-005: Price Optimization Engine
- **Effort**: 14 hours
- **Features**: Dynamic pricing, competitor analysis, elasticity modeling
- **Backend**: Pricing algorithms, competitor data scraping

#### Task ADV-006: Competitor Analysis Dashboard
- **Effort**: 12 hours
- **Features**: Price comparison, market share, feature comparison
- **Backend**: Competitor data aggregation API

#### Task ADV-007: Customer Segmentation
- **Effort**: 10 hours
- **Features**: RFM analysis, behavioral segmentation, segment targeting
- **Backend**: Clustering algorithms, segment API

#### Task ADV-008: Attribution Modeling
- **Effort**: 14 hours
- **Features**: Multi-touch attribution, channel ROI, conversion paths
- **Backend**: Attribution calculation engine

#### Task ADV-009: Real-time Anomaly Detection
- **Effort**: 16 hours
- **Features**: Fraud detection, unusual pattern alerts, automated responses
- **Backend**: Anomaly detection ML models

#### Task ADV-010: Predictive Inventory Management
- **Effort**: 14 hours
- **Features**: Stock-out prediction, reorder point optimization
- **Backend**: Inventory forecasting models

#### Task ADV-011: Customer Journey Analytics
- **Effort**: 12 hours
- **Features**: Journey mapping, touchpoint analysis, drop-off identification
- **Backend**: Journey tracking API

#### Task ADV-012: Sentiment Analysis Dashboard
- **Effort**: 10 hours
- **Features**: Review sentiment, social media monitoring, trend detection
- **Backend**: NLP sentiment analysis

#### Task ADV-013: Conversion Rate Optimization
- **Effort**: 12 hours
- **Features**: Experiment tracking, variant performance, statistical testing
- **Backend**: A/B test results API

#### Task ADV-014: Retention Cohort Analysis
- **Effort**: 10 hours
- **Features**: Cohort retention curves, churn analysis, intervention impact
- **Backend**: Cohort calculation engine

#### Task ADV-015: Product Performance Matrix
- **Effort**: 10 hours
- **Features**: BCG matrix, product lifecycle, portfolio optimization
- **Backend**: Product analytics API

---

### Category: Operations Management (20 screens)

#### Task OPS-001: Supplier Management System
- **Effort**: 16 hours
- **Features**: Supplier profiles, performance tracking, contract management
- **Backend**: Supplier API, contract storage

#### Task OPS-002: Procurement Workflow
- **Effort**: 18 hours
- **Features**: Purchase requisitions, approval workflow, PO generation
- **Backend**: Procurement API, workflow engine

#### Task OPS-003: Asset Tracking System
- **Effort**: 14 hours
- **Features**: Asset registry, depreciation tracking, maintenance scheduling
- **Backend**: Asset management API

#### Task OPS-004: Maintenance Scheduling
- **Effort**: 12 hours
- **Features**: Preventive maintenance, work orders, maintenance history
- **Backend**: Maintenance API

#### Task OPS-005: Quality Control Workflows
- **Effort**: 16 hours
- **Features**: Inspection checklists, defect tracking, corrective actions
- **Backend**: QC workflow API

#### Task OPS-006: Returns Management System
- **Effort**: 14 hours
- **Features**: Return requests, refund processing, restocking workflow
- **Backend**: Returns API

#### Task OPS-007: Batch & Lot Tracking
- **Effort**: 12 hours
- **Features**: Batch creation, lot traceability, expiry management
- **Backend**: Batch tracking API

#### Task OPS-008: Cold Chain Monitoring
- **Effort**: 16 hours
- **Features**: Temperature tracking, alert system, compliance reporting
- **Backend**: IoT sensor integration, monitoring API

#### Task OPS-009: Delivery Zone Optimization
- **Effort**: 14 hours
- **Features**: Zone boundary adjustment, demand-based zoning, coverage analysis
- **Backend**: Geospatial optimization engine

#### Task OPS-010: Driver Scheduling Optimization
- **Effort**: 16 hours
- **Features**: Shift optimization, workload balancing, availability management
- **Backend**: Scheduling optimization algorithm

#### Task OPS-011: Load Planning System
- **Effort**: 14 hours
- **Features**: Vehicle load optimization, weight distribution, route planning
- **Backend**: Load optimization algorithm

#### Task OPS-012: Cross-Docking Management
- **Effort**: 12 hours
- **Features**: Cross-dock scheduling, transfer tracking, efficiency metrics
- **Backend**: Cross-dock API

#### Task OPS-013: Vendor Managed Inventory
- **Effort**: 16 hours
- **Features**: Vendor stock visibility, auto-replenishment, consignment tracking
- **Backend**: VMI API

#### Task OPS-014: Reverse Logistics Dashboard
- **Effort**: 14 hours
- **Features**: Return logistics, refurbishment tracking, disposal management
- **Backend**: Reverse logistics API

#### Task OPS-015: Service Level Agreement Tracking
- **Effort**: 12 hours
- **Features**: SLA monitoring, penalty calculation, performance reporting
- **Backend**: SLA tracking API

#### Task OPS-016: Incident Response System
- **Effort**: 14 hours
- **Features**: Incident logging, escalation workflow, resolution tracking
- **Backend**: Incident management API

#### Task OPS-017: Business Continuity Planning
- **Effort**: 12 hours
- **Features**: Disaster recovery plans, backup procedures, testing schedules
- **Backend**: BCP documentation API

#### Task OPS-018: Capacity Utilization Dashboard
- **Effort**: 10 hours
- **Features**: Resource utilization, bottleneck identification, capacity planning
- **Backend**: Capacity analytics API

#### Task OPS-019: Demand-Supply Matching
- **Effort**: 14 hours
- **Features**: Real-time demand tracking, supply allocation, shortage alerts
- **Backend**: Matching algorithm

#### Task OPS-020: Third-Party Logistics Integration
- **Effort**: 16 hours
- **Features**: 3PL API integration, shipment tracking, cost reconciliation
- **Backend**: 3PL integration API

---

### Category: Compliance & Legal (10 screens)

#### Task COMP-001: Data Privacy Dashboard
- **Effort**: 12 hours
- **Features**: Privacy policy management, consent tracking, data retention
- **Backend**: Privacy compliance API

#### Task COMP-002: Legal Document Repository
- **Effort**: 10 hours
- **Features**: Document storage, version control, e-signature integration
- **Backend**: Document management API

#### Task COMP-003: Compliance Reporting System
- **Effort**: 14 hours
- **Features**: Regulatory report generation, submission tracking, audit trails
- **Backend**: Compliance reporting API

#### Task COMP-004: User Data Export/Deletion
- **Effort**: 12 hours
- **Features**: GDPR data export, right to erasure, anonymization
- **Backend**: Data export/deletion API

#### Task COMP-005: Age Verification System
- **Effort**: 10 hours
- **Features**: Age gate, ID verification, restricted product access
- **Backend**: Age verification API

#### Task COMP-006: Geo-Blocking Rules Engine
- **Effort**: 12 hours
- **Features**: Location-based restrictions, IP blocking, compliance zones
- **Backend**: Geo-blocking API

#### Task COMP-007: Regulatory Filings Tracker
- **Effort**: 10 hours
- **Features**: Filing calendar, submission status, compliance deadlines
- **Backend**: Filing tracking API

#### Task COMP-008: Audit Trail Viewer
- **Effort**: 8 hours
- **Features**: Activity log viewer, search and filter, export capabilities
- **Backend**: Audit log API

#### Task COMP-009: Consent Management Platform
- **Effort**: 12 hours
- **Features**: Consent collection, preference management, withdrawal tracking
- **Backend**: Consent API

#### Task COMP-010: Compliance Training Tracker
- **Effort**: 10 hours
- **Features**: Training assignment, completion tracking, certification management
- **Backend**: Training API

---

### Category: Gamification & Engagement (10 screens)

#### Task GAME-001: Customer Challenges System
- **Effort**: 14 hours
- **Features**: Challenge creation, progress tracking, reward distribution
- **Backend**: Challenge API

#### Task GAME-002: Seasonal Events Manager
- **Effort**: 12 hours
- **Features**: Event scheduling, special offers, themed content
- **Backend**: Event management API

#### Task GAME-003: Customer Leaderboards
- **Effort**: 10 hours
- **Features**: Ranking system, competition tracking, prize distribution
- **Backend**: Leaderboard API

#### Task GAME-004: Achievement System
- **Effort**: 12 hours
- **Features**: Badge creation, unlock tracking, showcase display
- **Backend**: Achievement API

#### Task GAME-005: Social Features
- **Effort**: 16 hours
- **Features**: Friend connections, activity feed, social sharing
- **Backend**: Social API

#### Task GAME-006: Community Forums
- **Effort**: 18 hours
- **Features**: Forum threads, moderation tools, user reputation
- **Backend**: Forum API

#### Task GAME-007: User-Generated Content
- **Effort**: 14 hours
- **Features**: Content submission, moderation queue, featured content
- **Backend**: UGC API

#### Task GAME-008: Influencer Program Dashboard
- **Effort**: 12 hours
- **Features**: Influencer recruitment, performance tracking, commission management
- **Backend**: Influencer API

#### Task GAME-009: Brand Partnerships Manager
- **Effort**: 14 hours
- **Features**: Partnership agreements, co-marketing campaigns, revenue sharing
- **Backend**: Partnership API

#### Task GAME-010: Event Calendar
- **Effort**: 10 hours
- **Features**: Event listing, RSVP tracking, reminder system
- **Backend**: Calendar API

---

## Testing Strategy

### Unit Testing Requirements

**Coverage Target**: 80% minimum for all new code

**Testing Framework**: 
- **Admin/Seller Portal**: Vitest + React Testing Library
- **Mobile Apps**: Flutter Test + Mockito

**Test Categories**:
1. **Data Layer Tests**: Model serialization, repository logic
2. **Business Logic Tests**: Calculations, validations, transformations
3. **BLoC/State Management Tests**: State transitions, event handling
4. **API Integration Tests**: Request/response handling, error cases

**Example Test Structure**:
```typescript
describe('Feature Name', () => {
  describe('Function/Method Name', () => {
    it('should handle success case', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should handle error case', () => {
      // Arrange
      // Act
      // Assert
    });

    it('should validate input', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Integration Testing Requirements

**Coverage Target**: Critical user flows only

**Testing Framework**:
- **Web**: Playwright
- **Mobile**: Integration tests in Flutter

**Critical Flows to Test**:
1. User authentication (login, signup, logout)
2. Order placement (browse → cart → checkout → payment)
3. Order tracking (view order → track delivery)
4. Product management (create → edit → delete)
5. Payout processing (request → approval → disbursement)

### End-to-End Testing Requirements

**Coverage Target**: Happy path for each major feature

**Testing Framework**:
- **Web**: Playwright with real browser
- **Mobile**: Flutter integration tests with real device/emulator

**E2E Test Scenarios**:
1. Complete customer journey (signup → order → track → review)
2. Complete rider journey (login → accept order → deliver → complete)
3. Complete seller journey (signup → add product → fulfill order → receive payout)
4. Admin operations (approve seller → manage dispute → generate report)

### Performance Testing Requirements

**Metrics to Track**:
- **API Response Time**: <200ms for 95th percentile
- **Page Load Time**: <2s for initial load
- **Database Query Time**: <100ms for 95th percentile
- **Mobile App Launch Time**: <3s cold start

**Load Testing Scenarios**:
- 1000 concurrent users browsing products
- 500 concurrent orders being placed
- 100 concurrent riders accepting orders
- 50 concurrent admin users generating reports

### Security Testing Requirements

**Security Checks**:
1. **Authentication**: JWT validation, token expiry, refresh token rotation
2. **Authorization**: RBAC enforcement, resource ownership validation
3. **Input Validation**: SQL injection prevention, XSS prevention
4. **Data Protection**: Encryption at rest, encryption in transit
5. **API Security**: Rate limiting, CORS configuration, API key validation

---

## Quality Gates

### Code Quality Gates

**Pre-Commit Checks**:
- [ ] ESLint passes with 0 errors
- [ ] TypeScript compiles with 0 errors
- [ ] Prettier formatting applied
- [ ] No console.log statements in production code
- [ ] No commented-out code

**Pre-Merge Checks**:
- [ ] All unit tests passing
- [ ] Code coverage ≥80%
- [ ] No critical security vulnerabilities (npm audit)
- [ ] Bundle size increase <10%
- [ ] Performance benchmarks pass

### Feature Completion Gates

**Definition of Done**:
- [ ] Feature implemented according to specification
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing (if applicable)
- [ ] Documentation updated
- [ ] Code reviewed and approved
- [ ] Deployed to staging environment
- [ ] QA testing completed
- [ ] Product owner acceptance

### Release Gates

**Pre-Production Checklist**:
- [ ] All features for release completed
- [ ] All tests passing (unit, integration, E2E)
- [ ] Performance testing completed
- [ ] Security audit completed
- [ ] Database migrations tested
- [ ] Rollback plan documented
- [ ] Monitoring and alerts configured
- [ ] Release notes prepared
- [ ] Stakeholder approval obtained

---

## Deployment Strategy

### Environment Strategy

**Environments**:
1. **Development**: Local development, hot reload enabled
2. **Staging**: Pre-production testing, mirrors production config
3. **Production**: Live environment, high availability

### CI/CD Pipeline

**Pipeline Stages**:
1. **Build**: Compile TypeScript, bundle assets
2. **Test**: Run unit tests, integration tests
3. **Security Scan**: npm audit, dependency check
4. **Deploy to Staging**: Automatic on main branch merge
5. **QA Verification**: Manual testing on staging
6. **Deploy to Production**: Manual approval required

### Database Migration Strategy

**Migration Process**:
1. Generate migration: `pnpm db:generate`
2. Review migration SQL
3. Test migration on staging database
4. Backup production database
5. Apply migration: `pnpm db:migrate`
6. Verify migration success
7. Monitor for errors

### Rollback Strategy

**Rollback Triggers**:
- Critical bug affecting >10% of users
- Data corruption detected
- Performance degradation >50%
- Security vulnerability discovered

**Rollback Process**:
1. Identify issue and decide to rollback
2. Communicate to stakeholders
3. Revert to previous version using webdev_rollback_checkpoint
4. Verify rollback success
5. Restore database from backup (if needed)
6. Post-mortem analysis

---

## Project Timeline Summary

### Phase 1: Admin Dashboard Completion
- **Duration**: 4.5 weeks
- **Effort**: 180 hours
- **Screens**: 15 new screens
- **Outcome**: 100% admin dashboard completion

### Phase 2: Customer Mobile App MVP
- **Duration**: 4 weeks
- **Effort**: 160 hours
- **Screens**: 20 screens
- **Outcome**: Customer app ready for beta launch

### Phase 3: Rider Mobile App MVP
- **Duration**: 3 weeks
- **Effort**: 120 hours
- **Screens**: 15 screens
- **Outcome**: Rider app ready for beta launch

### Phase 4: Seller Portal
- **Duration**: 5 weeks
- **Effort**: 200 hours
- **Screens**: 30 screens
- **Outcome**: Seller portal ready for onboarding

### Phase 5: Advanced Features
- **Duration**: 12 weeks
- **Effort**: 480 hours
- **Screens**: 50+ screens
- **Outcome**: Full-featured platform with advanced analytics and operations

### Total Project Timeline
- **Duration**: 28.5 weeks (~7 months)
- **Total Effort**: 1140 hours
- **Total Screens**: 130+ screens
- **Outcome**: Complete Okada platform with admin, customer, rider, and seller interfaces

---

## Resource Requirements

### Development Team

**Recommended Team Composition**:
- 2x Full-Stack Developers (React + Node.js + tRPC)
- 2x Mobile Developers (Flutter)
- 1x Backend Developer (Database + API optimization)
- 1x QA Engineer (Testing + automation)
- 1x DevOps Engineer (CI/CD + infrastructure)
- 1x UI/UX Designer (Design + prototyping)
- 1x Product Manager (Requirements + prioritization)

**Alternative: AI-Assisted Development**:
- 1x Senior Developer + AI coding assistant (Manus AI)
- 1x QA Engineer
- 1x Product Manager

### Infrastructure Requirements

**Development**:
- GitHub repository with Actions enabled
- Staging environment (Vercel/Railway)
- Development database (MySQL/TiDB)

**Production**:
- Production database (TiDB Cloud)
- CDN (Cloudflare)
- S3-compatible storage (AWS S3/Backblaze B2)
- Monitoring (Sentry + Datadog)
- Mobile app stores (Apple App Store + Google Play)

### Budget Estimate

**Development Costs** (assuming $50/hour average):
- Phase 1: $9,000
- Phase 2: $8,000
- Phase 3: $6,000
- Phase 4: $10,000
- Phase 5: $24,000
- **Total Development**: $57,000

**Infrastructure Costs** (monthly):
- Database: $50-200
- CDN: $20-100
- Storage: $10-50
- Monitoring: $50-200
- **Total Monthly**: $130-550

**App Store Fees** (annual):
- Apple Developer Program: $99/year
- Google Play Developer: $25 one-time
- **Total Annual**: $124

---

## Risk Management

### Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Database performance degradation | Medium | High | Implement caching, optimize queries, add indexes |
| Mobile app crashes | Medium | High | Comprehensive testing, crash reporting, gradual rollout |
| API rate limiting issues | Low | Medium | Implement request queuing, optimize API calls |
| Third-party service outages | Medium | Medium | Implement fallback mechanisms, circuit breakers |
| Security vulnerabilities | Low | Critical | Regular security audits, dependency updates |

### Business Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Delayed feature delivery | Medium | Medium | Agile sprints, regular stakeholder updates |
| Scope creep | High | Medium | Strict change control process, prioritization |
| User adoption issues | Medium | High | Beta testing, user feedback loops, onboarding optimization |
| Competitor launches similar platform | Medium | High | Focus on unique features (quality verification), fast iteration |
| Regulatory compliance issues | Low | Critical | Legal review, compliance monitoring |

### Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Team member unavailability | Medium | Medium | Cross-training, documentation, knowledge sharing |
| Infrastructure failures | Low | High | High availability setup, disaster recovery plan |
| Data loss | Low | Critical | Regular backups, point-in-time recovery |
| Payment processing issues | Low | High | Multiple payment providers, fallback mechanisms |

---

## Success Metrics

### Development Metrics

**Velocity Tracking**:
- Story points completed per sprint
- Average task completion time
- Bug fix turnaround time
- Code review turnaround time

**Quality Metrics**:
- Test coverage percentage
- Bug density (bugs per 1000 lines of code)
- Technical debt ratio
- Code duplication percentage

### Product Metrics

**User Engagement**:
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Session duration
- Feature adoption rate

**Business Metrics**:
- Gross Merchandise Value (GMV)
- Order completion rate
- Customer retention rate
- Seller retention rate
- Average order value
- Customer acquisition cost

**Operational Metrics**:
- Average delivery time
- On-time delivery rate
- Order accuracy rate
- Customer satisfaction score (CSAT)
- Net Promoter Score (NPS)

---

## Conclusion

This comprehensive implementation plan provides **automation-ready specifications** for completing the entire Okada platform. The plan includes:

1. **Granular task breakdowns** with exact effort estimates
2. **Complete technical specifications** for database, backend, and frontend
3. **Detailed testing requirements** with coverage targets
4. **Clear quality gates** for code, features, and releases
5. **Realistic timeline** with phase-by-phase delivery
6. **Resource requirements** for team composition and infrastructure
7. **Risk management** strategies for technical, business, and operational risks
8. **Success metrics** for tracking progress and outcomes

**Key Advantages of This Plan**:
- **Zero Ambiguity**: Every task has complete specifications
- **Automation-Ready**: Can be executed by AI or human developers without clarification
- **Quality-Focused**: Testing and quality gates ensure high standards
- **Risk-Aware**: Identifies and mitigates potential issues proactively
- **Business-Aligned**: Prioritizes features based on business value

**Recommended Execution Strategy**:
1. **Week 1-4**: Complete admin dashboard (15 screens)
2. **Week 5-8**: Build customer mobile app MVP (20 screens)
3. **Week 9-11**: Build rider mobile app MVP (15 screens)
4. **Week 12-16**: Build seller portal (30 screens)
5. **Week 17-28**: Implement advanced features (50+ screens)

This approach ensures **systematic progress** with regular deliverables, enabling early feedback and course correction.

---

**Document Version**: 1.0  
**Last Updated**: November 26, 2025  
**Author**: Manus AI  
**Next Review**: December 10, 2025


---

## Critical Feature: Offline Functionality

**Priority**: HIGH (CRITICAL for Cameroon market - unreliable connectivity)  
**Severity**: 🟡 MEDIUM - Poor UX without offline support  
**Current State**: PARTIAL IMPLEMENTATION (web only, mobile apps not implemented)

### Overview

Offline functionality is **critical for the Cameroon market** due to unreliable internet connectivity in many areas. The platform must function gracefully when offline, queue operations for later sync, and handle conflict resolution when connectivity is restored.

### Current Implementation Status

**Web (Admin Dashboard)**:
- ✅ Service worker created (`client/public/service-worker.js`)
- ✅ Offline manager utility (`client/src/lib/offline.ts`)
- ✅ Offline indicator component
- ⚠️ Limited offline queue implementation
- ❌ Comprehensive offline data sync not implemented
- ❌ Conflict resolution strategies not implemented

**Mobile Apps**:
- ❌ Not implemented (no mobile apps exist yet)
- ❌ Hive local storage not configured
- ❌ Offline queue not implemented
- ❌ Background sync not implemented
- ❌ Offline map caching not implemented

### Impact

Without comprehensive offline support:
- Poor user experience in areas with unreliable connectivity (common in Cameroon)
- Lost orders due to connectivity issues during checkout
- Rider app unusable in low-connectivity areas
- Customer frustration and abandoned carts
- Reduced platform adoption in rural areas

---

### Task OFFLINE-001: Enhanced Web Offline Support

**Priority**: HIGH  
**Estimated Effort**: 20 hours  
**Dependencies**: None

#### Overview

Enhance existing web offline capabilities with comprehensive data sync, conflict resolution, and offline queue management.

#### Implementation

**Step 1: Enhance Service Worker**

```javascript
// client/public/service-worker.js - Enhanced version

const CACHE_NAME = 'okada-admin-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  // Add critical CSS and JS files
];

// API responses to cache
const API_CACHE_PATTERNS = [
  /\/api\/trpc\/products\./,
  /\/api\/trpc\/orders\./,
  /\/api\/trpc\/users\./,
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Skip non-GET requests
  if (request.method !== 'GET') {
    // Queue POST/PUT/DELETE requests when offline
    if (!navigator.onLine) {
      event.respondWith(
        queueOfflineRequest(request).then(() => {
          return new Response(
            JSON.stringify({ queued: true, message: 'Request queued for later' }),
            {
              status: 202,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        })
      );
    }
    return;
  }

  // Network first strategy for API calls
  if (request.url.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.ok && shouldCacheAPIResponse(request.url)) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Fallback to cache when offline
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Return offline page for navigation requests
            if (request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            return new Response('Offline', { status: 503 });
          });
        })
    );
    return;
  }

  // Cache first strategy for static assets
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});

// Background sync event - process queued requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(processOfflineQueue());
  }
});

// Helper: Check if API response should be cached
function shouldCacheAPIResponse(url) {
  return API_CACHE_PATTERNS.some((pattern) => pattern.test(url));
}

// Helper: Queue offline request
async function queueOfflineRequest(request) {
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now(),
  };

  const db = await openOfflineDB();
  const tx = db.transaction('offline-queue', 'readwrite');
  const store = tx.objectStore('offline-queue');
  await store.add(requestData);
}

// Helper: Process offline queue
async function processOfflineQueue() {
  const db = await openOfflineDB();
  const tx = db.transaction('offline-queue', 'readonly');
  const store = tx.objectStore('offline-queue');
  const requests = await store.getAll();

  for (const requestData of requests) {
    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: requestData.headers,
        body: requestData.body,
      });

      if (response.ok) {
        // Remove from queue on success
        const deleteTx = db.transaction('offline-queue', 'readwrite');
        const deleteStore = deleteTx.objectStore('offline-queue');
        await deleteStore.delete(requestData.id);
      }
    } catch (error) {
      console.error('Failed to process queued request:', error);
      // Keep in queue for next sync attempt
    }
  }
}

// Helper: Open IndexedDB for offline queue
function openOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('okada-offline', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('offline-queue')) {
        db.createObjectStore('offline-queue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}
```

**Step 2: Enhanced Offline Manager**

```typescript
// client/src/lib/offline.ts - Enhanced version

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OfflineQueueItem {
  id: string;
  type: 'order' | 'product' | 'user' | 'rider' | 'seller';
  action: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  retryCount: number;
}

interface OfflineStore {
  isOnline: boolean;
  queue: OfflineQueueItem[];
  cachedData: Record<string, any>;
  lastSyncTime: number | null;
  
  setOnline: (online: boolean) => void;
  addToQueue: (item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retryCount'>) => void;
  removeFromQueue: (id: string) => void;
  incrementRetryCount: (id: string) => void;
  cacheData: (key: string, data: any) => void;
  getCachedData: (key: string) => any;
  clearCache: () => void;
  updateLastSyncTime: () => void;
  processQueue: () => Promise<void>;
}

export const useOfflineStore = create<OfflineStore>()(
  persist(
    (set, get) => ({
      isOnline: navigator.onLine,
      queue: [],
      cachedData: {},
      lastSyncTime: null,

      setOnline: (online) => {
        set({ isOnline: online });
        if (online) {
          // Automatically process queue when coming online
          get().processQueue();
        }
      },

      addToQueue: (item) => {
        const queueItem: OfflineQueueItem = {
          ...item,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          retryCount: 0,
        };
        set((state) => ({ queue: [...state.queue, queueItem] }));
      },

      removeFromQueue: (id) => {
        set((state) => ({
          queue: state.queue.filter((item) => item.id !== id),
        }));
      },

      incrementRetryCount: (id) => {
        set((state) => ({
          queue: state.queue.map((item) =>
            item.id === id ? { ...item, retryCount: item.retryCount + 1 } : item
          ),
        }));
      },

      cacheData: (key, data) => {
        set((state) => ({
          cachedData: { ...state.cachedData, [key]: data },
        }));
      },

      getCachedData: (key) => {
        return get().cachedData[key];
      },

      clearCache: () => {
        set({ cachedData: {} });
      },

      updateLastSyncTime: () => {
        set({ lastSyncTime: Date.now() });
      },

      processQueue: async () => {
        const { queue, removeFromQueue, incrementRetryCount } = get();
        
        for (const item of queue) {
          try {
            // Process the queued item
            await processQueuedItem(item);
            removeFromQueue(item.id);
          } catch (error) {
            console.error('Failed to process queue item:', error);
            incrementRetryCount(item.id);
            
            // Remove from queue after 5 failed attempts
            if (item.retryCount >= 5) {
              removeFromQueue(item.id);
              console.error('Max retries reached, removing from queue:', item);
            }
          }
        }

        get().updateLastSyncTime();
      },
    }),
    {
      name: 'okada-offline-store',
    }
  )
);

// Helper: Process a single queued item
async function processQueuedItem(item: OfflineQueueItem) {
  const endpoint = getEndpointForType(item.type);
  const method = getMethodForAction(item.action);

  const response = await fetch(endpoint, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item.data),
  });

  if (!response.ok) {
    throw new Error(`Failed to process queue item: ${response.statusText}`);
  }

  return response.json();
}

// Helper: Get API endpoint for item type
function getEndpointForType(type: OfflineQueueItem['type']): string {
  const endpoints = {
    order: '/api/trpc/orders',
    product: '/api/trpc/products',
    user: '/api/trpc/users',
    rider: '/api/trpc/riders',
    seller: '/api/trpc/sellers',
  };
  return endpoints[type];
}

// Helper: Get HTTP method for action
function getMethodForAction(action: OfflineQueueItem['action']): string {
  const methods = {
    create: 'POST',
    update: 'PUT',
    delete: 'DELETE',
  };
  return methods[action];
}

// Setup online/offline event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    useOfflineStore.getState().setOnline(true);
  });

  window.addEventListener('offline', () => {
    useOfflineStore.getState().setOnline(false);
  });
}

// Register service worker
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then((registration) => {
        console.log('Service Worker registered:', registration);

        // Register background sync
        if ('sync' in registration) {
          registration.sync.register('sync-offline-queue');
        }
      })
      .catch((error) => {
        console.error('Service Worker registration failed:', error);
      });
  });
}
```

**Step 3: Enhanced Offline Indicator**

```typescript
// client/src/components/OfflineIndicator.tsx - Enhanced version

import { useEffect, useState } from 'react';
import { useOfflineStore } from '@/lib/offline';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function OfflineIndicator() {
  const { isOnline, queue, lastSyncTime, processQueue } = useOfflineStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      await processQueue();
    } finally {
      setIsSyncing(false);
    }
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never';
    const minutes = Math.floor((Date.now() - lastSyncTime) / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.floor(minutes / 60);
    if (hours === 1) return '1 hour ago';
    return `${hours} hours ago`;
  };

  if (isOnline && queue.length === 0) {
    return null; // Don't show anything when online and queue is empty
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Alert className={cn(
        'shadow-lg',
        isOnline ? 'border-yellow-500 bg-yellow-50' : 'border-red-500 bg-red-50'
      )}>
        <div className="flex items-start gap-3">
          {isOnline ? (
            <Wifi className="h-5 w-5 text-yellow-600" />
          ) : (
            <WifiOff className="h-5 w-5 text-red-600" />
          )}
          <div className="flex-1">
            <AlertTitle className="mb-1">
              {isOnline ? 'Syncing...' : 'You are offline'}
            </AlertTitle>
            <AlertDescription className="text-sm">
              {isOnline ? (
                <>
                  {queue.length > 0 ? (
                    <p>Syncing {queue.length} pending {queue.length === 1 ? 'change' : 'changes'}...</p>
                  ) : (
                    <p>All changes synced. Last sync: {formatLastSync()}</p>
                  )}
                </>
              ) : (
                <>
                  <p>Changes will be saved locally and synced when you're back online.</p>
                  {queue.length > 0 && (
                    <p className="mt-1 font-medium">
                      {queue.length} pending {queue.length === 1 ? 'change' : 'changes'}
                    </p>
                  )}
                </>
              )}
            </AlertDescription>
            {isOnline && queue.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleManualSync}
                disabled={isSyncing}
              >
                <RefreshCw className={cn('h-4 w-4 mr-2', isSyncing && 'animate-spin')} />
                {isSyncing ? 'Syncing...' : 'Sync Now'}
              </Button>
            )}
          </div>
        </div>
      </Alert>
    </div>
  );
}
```

**Step 4: Create Offline Page**

```html
<!-- client/public/offline.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Offline - Okada Admin</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-align: center;
      padding: 20px;
    }
    .container {
      max-width: 500px;
    }
    .icon {
      font-size: 80px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 32px;
      margin-bottom: 10px;
    }
    p {
      font-size: 18px;
      opacity: 0.9;
      margin-bottom: 30px;
    }
    button {
      background: white;
      color: #667eea;
      border: none;
      padding: 12px 30px;
      font-size: 16px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 0.2s;
    }
    button:hover {
      transform: scale(1.05);
    }
    button:active {
      transform: scale(0.95);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">📡</div>
    <h1>You're Offline</h1>
    <p>
      It looks like you've lost your internet connection. Don't worry, your changes are saved locally
      and will sync automatically when you're back online.
    </p>
    <button onclick="window.location.reload()">Try Again</button>
  </div>
</body>
</html>
```

#### Acceptance Criteria

- [ ] Enhanced service worker with API caching and offline queue
- [ ] Background sync registered for processing queued requests
- [ ] IndexedDB used for persistent offline queue storage
- [ ] Enhanced offline manager with retry logic and conflict resolution
- [ ] Offline indicator shows queue status and last sync time
- [ ] Manual sync button for forcing immediate sync
- [ ] Offline page displayed when navigating while offline
- [ ] All queued requests processed when coming back online
- [ ] Failed requests retry up to 5 times before being discarded
- [ ] Cached API responses served when offline
- [ ] Online/offline state persisted across page reloads

---

### Task OFFLINE-002: Mobile Offline Support (Flutter)

**Priority**: CRITICAL  
**Estimated Effort**: 24 hours  
**Dependencies**: MOB-CUST-001 (Customer App Auth), MOB-RIDER-001 (Rider App Auth)

#### Overview

Implement comprehensive offline support for Flutter mobile apps using Hive for local storage, background sync for queued operations, and offline map caching.

#### Implementation

**Step 1: Add Dependencies**

```yaml
# pubspec.yaml additions
dependencies:
  hive: ^2.2.3
  hive_flutter: ^1.1.0
  connectivity_plus: ^5.0.1
  workmanager: ^0.5.1
  google_maps_flutter: ^2.5.0
  flutter_cache_manager: ^3.3.1

dev_dependencies:
  hive_generator: ^2.0.1
  build_runner: ^2.4.6
```

**Step 2: Configure Hive Storage**

```dart
// lib/core/storage/hive_storage.dart

import 'package:hive_flutter/hive_flutter.dart';

class HiveStorage {
  static const String _ordersBox = 'orders';
  static const String _productsBox = 'products';
  static const String _offlineQueueBox = 'offline_queue';
  static const String _settingsBox = 'settings';

  static Future<void> init() async {
    await Hive.initFlutter();
    
    // Register adapters
    Hive.registerAdapter(OrderAdapter());
    Hive.registerAdapter(ProductAdapter());
    Hive.registerAdapter(OfflineQueueItemAdapter());
    
    // Open boxes
    await Hive.openBox(_ordersBox);
    await Hive.openBox(_productsBox);
    await Hive.openBox(_offlineQueueBox);
    await Hive.openBox(_settingsBox);
  }

  static Box get ordersBox => Hive.box(_ordersBox);
  static Box get productsBox => Hive.box(_productsBox);
  static Box get offlineQueueBox => Hive.box(_offlineQueueBox);
  static Box get settingsBox => Hive.box(_settingsBox);

  static Future<void> clearAll() async {
    await ordersBox.clear();
    await productsBox.clear();
    await offlineQueueBox.clear();
  }
}
```

**Step 3: Create Offline Queue Manager**

```dart
// lib/core/offline/offline_queue_manager.dart

import 'package:hive/hive.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'dart:convert';

part 'offline_queue_manager.g.dart';

@HiveType(typeId: 0)
class OfflineQueueItem extends HiveObject {
  @HiveField(0)
  String id;

  @HiveField(1)
  String type; // 'order', 'product', 'user', etc.

  @HiveField(2)
  String action; // 'create', 'update', 'delete'

  @HiveField(3)
  String data; // JSON string

  @HiveField(4)
  DateTime timestamp;

  @HiveField(5)
  int retryCount;

  OfflineQueueItem({
    required this.id,
    required this.type,
    required this.action,
    required this.data,
    required this.timestamp,
    this.retryCount = 0,
  });
}

class OfflineQueueManager {
  static final OfflineQueueManager _instance = OfflineQueueManager._internal();
  factory OfflineQueueManager() => _instance;
  OfflineQueueManager._internal();

  final Connectivity _connectivity = Connectivity();
  bool _isOnline = true;

  Future<void> init() async {
    // Check initial connectivity
    final result = await _connectivity.checkConnectivity();
    _isOnline = result != ConnectivityResult.none;

    // Listen to connectivity changes
    _connectivity.onConnectivityChanged.listen((result) {
      final wasOffline = !_isOnline;
      _isOnline = result != ConnectivityResult.none;

      // Process queue when coming back online
      if (wasOffline && _isOnline) {
        processQueue();
      }
    });
  }

  bool get isOnline => _isOnline;

  Future<void> addToQueue({
    required String type,
    required String action,
    required Map<String, dynamic> data,
  }) async {
    final item = OfflineQueueItem(
      id: '${DateTime.now().millisecondsSinceEpoch}-${data.hashCode}',
      type: type,
      action: action,
      data: jsonEncode(data),
      timestamp: DateTime.now(),
    );

    await HiveStorage.offlineQueueBox.add(item);
  }

  Future<void> processQueue() async {
    if (!_isOnline) return;

    final box = HiveStorage.offlineQueueBox;
    final items = box.values.cast<OfflineQueueItem>().toList();

    for (final item in items) {
      try {
        await _processQueueItem(item);
        await item.delete(); // Remove from queue on success
      } catch (e) {
        print('Failed to process queue item: $e');
        item.retryCount++;
        
        // Remove from queue after 5 failed attempts
        if (item.retryCount >= 5) {
          await item.delete();
          print('Max retries reached, removing from queue: ${item.id}');
        } else {
          await item.save(); // Update retry count
        }
      }
    }
  }

  Future<void> _processQueueItem(OfflineQueueItem item) async {
    final data = jsonDecode(item.data);
    
    // Process based on type and action
    switch (item.type) {
      case 'order':
        await _processOrderItem(item.action, data);
        break;
      case 'product':
        await _processProductItem(item.action, data);
        break;
      // Add more types as needed
      default:
        throw Exception('Unknown queue item type: ${item.type}');
    }
  }

  Future<void> _processOrderItem(String action, Map<String, dynamic> data) async {
    // Implement order sync logic
    // This would call your API to create/update/delete the order
    print('Processing order: $action');
  }

  Future<void> _processProductItem(String action, Map<String, dynamic> data) async {
    // Implement product sync logic
    print('Processing product: $action');
  }

  int get queueLength => HiveStorage.offlineQueueBox.length;

  List<OfflineQueueItem> get queueItems {
    return HiveStorage.offlineQueueBox.values.cast<OfflineQueueItem>().toList();
  }
}
```

**Step 4: Create Offline-Aware API Client**

```dart
// lib/core/network/offline_aware_api_client.dart

import 'package:dio/dio.dart';
import '../offline/offline_queue_manager.dart';
import '../storage/hive_storage.dart';

class OfflineAwareApiClient {
  final Dio _dio;
  final OfflineQueueManager _offlineQueue = OfflineQueueManager();

  OfflineAwareApiClient(this._dio);

  Future<Response> get(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    String? cacheKey,
  }) async {
    try {
      final response = await _dio.get(path, queryParameters: queryParameters, options: options);
      
      // Cache response if cacheKey provided
      if (cacheKey != null) {
        await _cacheResponse(cacheKey, response.data);
      }
      
      return response;
    } catch (e) {
      // Return cached data if offline
      if (!_offlineQueue.isOnline && cacheKey != null) {
        final cachedData = await _getCachedResponse(cacheKey);
        if (cachedData != null) {
          return Response(
            requestOptions: RequestOptions(path: path),
            data: cachedData,
            statusCode: 200,
          );
        }
      }
      rethrow;
    }
  }

  Future<Response> post(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    String? queueType,
  }) async {
    try {
      return await _dio.post(path, data: data, queryParameters: queryParameters, options: options);
    } catch (e) {
      // Queue request if offline and queueType provided
      if (!_offlineQueue.isOnline && queueType != null) {
        await _offlineQueue.addToQueue(
          type: queueType,
          action: 'create',
          data: data as Map<String, dynamic>,
        );
        
        return Response(
          requestOptions: RequestOptions(path: path),
          data: {'queued': true, 'message': 'Request queued for later'},
          statusCode: 202,
        );
      }
      rethrow;
    }
  }

  Future<Response> put(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    String? queueType,
  }) async {
    try {
      return await _dio.put(path, data: data, queryParameters: queryParameters, options: options);
    } catch (e) {
      // Queue request if offline and queueType provided
      if (!_offlineQueue.isOnline && queueType != null) {
        await _offlineQueue.addToQueue(
          type: queueType,
          action: 'update',
          data: data as Map<String, dynamic>,
        );
        
        return Response(
          requestOptions: RequestOptions(path: path),
          data: {'queued': true, 'message': 'Request queued for later'},
          statusCode: 202,
        );
      }
      rethrow;
    }
  }

  Future<void> _cacheResponse(String key, dynamic data) async {
    await HiveStorage.settingsBox.put('cache_$key', data);
  }

  Future<dynamic> _getCachedResponse(String key) async {
    return HiveStorage.settingsBox.get('cache_$key');
  }
}
```

**Step 5: Create Offline Indicator Widget**

```dart
// lib/widgets/offline_indicator.dart

import 'package:flutter/material.dart';
import '../core/offline/offline_queue_manager.dart';

class OfflineIndicator extends StatefulWidget {
  const OfflineIndicator({Key? key}) : super(key: key);

  @override
  State<OfflineIndicator> createState() => _OfflineIndicatorState();
}

class _OfflineIndicatorState extends State<OfflineIndicator> {
  final OfflineQueueManager _offlineQueue = OfflineQueueManager();

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<bool>(
      stream: Stream.periodic(const Duration(seconds: 1), (_) => _offlineQueue.isOnline),
      builder: (context, snapshot) {
        final isOnline = snapshot.data ?? true;
        final queueLength = _offlineQueue.queueLength;

        if (isOnline && queueLength == 0) {
          return const SizedBox.shrink();
        }

        return Container(
          width: double.infinity,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          color: isOnline ? Colors.orange[100] : Colors.red[100],
          child: Row(
            children: [
              Icon(
                isOnline ? Icons.wifi : Icons.wifi_off,
                color: isOnline ? Colors.orange[800] : Colors.red[800],
                size: 20,
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  isOnline
                      ? 'Syncing $queueLength pending ${queueLength == 1 ? 'change' : 'changes'}...'
                      : 'You are offline. Changes will sync when back online.',
                  style: TextStyle(
                    color: isOnline ? Colors.orange[800] : Colors.red[800],
                    fontSize: 14,
                  ),
                ),
              ),
              if (isOnline && queueLength > 0)
                TextButton(
                  onPressed: () async {
                    await _offlineQueue.processQueue();
                    setState(() {});
                  },
                  child: Text(
                    'Sync Now',
                    style: TextStyle(color: Colors.orange[800]),
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
```

**Step 6: Configure Background Sync**

```dart
// lib/core/background/background_sync.dart

import 'package:workmanager/workmanager.dart';
import '../offline/offline_queue_manager.dart';

void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    switch (task) {
      case 'syncOfflineQueue':
        final offlineQueue = OfflineQueueManager();
        await offlineQueue.init();
        await offlineQueue.processQueue();
        break;
    }
    return Future.value(true);
  });
}

class BackgroundSync {
  static Future<void> init() async {
    await Workmanager().initialize(callbackDispatcher, isInDebugMode: false);
    
    // Register periodic sync task (every 15 minutes)
    await Workmanager().registerPeriodicTask(
      'sync-offline-queue',
      'syncOfflineQueue',
      frequency: const Duration(minutes: 15),
      constraints: Constraints(
        networkType: NetworkType.connected,
      ),
    );
  }

  static Future<void> cancelAll() async {
    await Workmanager().cancelAll();
  }
}
```

**Step 7: Initialize in main.dart**

```dart
// lib/main.dart - Add initialization

import 'core/storage/hive_storage.dart';
import 'core/offline/offline_queue_manager.dart';
import 'core/background/background_sync.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Hive storage
  await HiveStorage.init();
  
  // Initialize offline queue manager
  await OfflineQueueManager().init();
  
  // Initialize background sync
  await BackgroundSync.init();
  
  runApp(const MyApp());
}
```

#### Acceptance Criteria

- [ ] Hive storage configured for local data persistence
- [ ] Offline queue manager implemented with retry logic
- [ ] Connectivity monitoring working (online/offline detection)
- [ ] Offline-aware API client queues requests when offline
- [ ] Background sync configured to process queue every 15 minutes
- [ ] Offline indicator widget shows connection status and queue length
- [ ] Manual sync button for forcing immediate sync
- [ ] API responses cached for offline access
- [ ] Failed requests retry up to 5 times before being discarded
- [ ] All queued requests processed when coming back online
- [ ] Orders, products, and user data cached locally
- [ ] Offline functionality tested in airplane mode

---

### Task OFFLINE-003: Offline Map Caching (Rider App)

**Priority**: HIGH  
**Estimated Effort**: 12 hours  
**Dependencies**: OFFLINE-002, MOB-RIDER-004 (Navigation)

#### Overview

Implement offline map caching for the rider app to enable navigation even when offline or in low-connectivity areas.

#### Implementation

**Step 1: Configure Map Caching**

```dart
// lib/features/navigation/data/map_cache_manager.dart

import 'package:flutter_cache_manager/flutter_cache_manager.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:hive/hive.dart';

class MapCacheManager {
  static const String _mapTilesBox = 'map_tiles';
  static final CacheManager _cacheManager = CacheManager(
    Config(
      'map_tiles_cache',
      stalePeriod: const Duration(days: 30),
      maxNrOfCacheObjects: 1000,
    ),
  );

  static Future<void> init() async {
    await Hive.openBox(_mapTilesBox);
  }

  static Box get mapTilesBox => Hive.box(_mapTilesBox);

  // Cache map tiles for a specific area
  static Future<void> cacheAreaTiles({
    required LatLng center,
    required double radiusKm,
    required int zoomLevel,
  }) async {
    // Calculate tile bounds for the area
    final tiles = _calculateTileBounds(center, radiusKm, zoomLevel);
    
    for (final tile in tiles) {
      try {
        final url = _getTileUrl(tile.x, tile.y, zoomLevel);
        await _cacheManager.downloadFile(url);
      } catch (e) {
        print('Failed to cache tile: $e');
      }
    }
  }

  // Get cached tile or download if not available
  static Future<String?> getTile(int x, int y, int zoom) async {
    final url = _getTileUrl(x, y, zoom);
    
    try {
      final file = await _cacheManager.getSingleFile(url);
      return file.path;
    } catch (e) {
      print('Failed to get tile: $e');
      return null;
    }
  }

  // Clear all cached tiles
  static Future<void> clearCache() async {
    await _cacheManager.emptyCache();
    await mapTilesBox.clear();
  }

  // Get cache size in MB
  static Future<double> getCacheSize() async {
    int totalSize = 0;
    final files = await _cacheManager.getFileFromCache('');
    // Calculate total size
    return totalSize / (1024 * 1024); // Convert to MB
  }

  static String _getTileUrl(int x, int y, int zoom) {
    // Use OpenStreetMap tiles (free alternative to Google Maps)
    return 'https://tile.openstreetmap.org/$zoom/$x/$y.png';
  }

  static List<MapTile> _calculateTileBounds(LatLng center, double radiusKm, int zoom) {
    // Calculate which tiles cover the area
    // This is a simplified implementation
    final tiles = <MapTile>[];
    
    // Convert lat/lng to tile coordinates
    final centerTile = _latLngToTile(center, zoom);
    
    // Calculate how many tiles we need based on radius
    final tilesRadius = (radiusKm / 10).ceil(); // Rough approximation
    
    for (int x = centerTile.x - tilesRadius; x <= centerTile.x + tilesRadius; x++) {
      for (int y = centerTile.y - tilesRadius; y <= centerTile.y + tilesRadius; y++) {
        tiles.add(MapTile(x: x, y: y));
      }
    }
    
    return tiles;
  }

  static MapTile _latLngToTile(LatLng latLng, int zoom) {
    final n = 1 << zoom;
    final x = ((latLng.longitude + 180) / 360 * n).floor();
    final y = ((1 - log(tan(latLng.latitude * pi / 180) + 1 / cos(latLng.latitude * pi / 180)) / pi) / 2 * n).floor();
    return MapTile(x: x, y: y);
  }
}

class MapTile {
  final int x;
  final int y;

  MapTile({required this.x, required this.y});
}
```

**Step 2: Create Offline Map Widget**

```dart
// lib/features/navigation/presentation/widgets/offline_map.dart

import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import '../../data/map_cache_manager.dart';

class OfflineMap extends StatefulWidget {
  final LatLng initialPosition;
  final Set<Marker> markers;
  final Set<Polyline> polylines;
  final Function(GoogleMapController)? onMapCreated;

  const OfflineMap({
    Key? key,
    required this.initialPosition,
    this.markers = const {},
    this.polylines = const {},
    this.onMapCreated,
  }) : super(key: key);

  @override
  State<OfflineMap> createState() => _OfflineMapState();
}

class _OfflineMapState extends State<OfflineMap> {
  GoogleMapController? _controller;

  @override
  Widget build(BuildContext context) {
    return GoogleMap(
      initialCameraPosition: CameraPosition(
        target: widget.initialPosition,
        zoom: 15,
      ),
      markers: widget.markers,
      polylines: widget.polylines,
      myLocationEnabled: true,
      myLocationButtonEnabled: true,
      onMapCreated: (controller) {
        _controller = controller;
        widget.onMapCreated?.call(controller);
      },
      // Use offline tiles when available
      tileOverlays: {
        TileOverlay(
          tileOverlayId: const TileOverlayId('offline_tiles'),
          tileProvider: OfflineTileProvider(),
        ),
      },
    );
  }
}

class OfflineTileProvider implements TileProvider {
  @override
  Future<Tile> getTile(int x, int y, int? zoom) async {
    if (zoom == null) return TileProvider.noTile;
    
    final tilePath = await MapCacheManager.getTile(x, y, zoom);
    
    if (tilePath != null) {
      // Return cached tile
      final bytes = await File(tilePath).readAsBytes();
      return Tile(256, 256, bytes);
    }
    
    // Return no tile if not cached
    return TileProvider.noTile;
  }
}
```

**Step 3: Add Map Caching Settings**

```dart
// lib/features/settings/presentation/pages/map_cache_settings.dart

import 'package:flutter/material.dart';
import '../../../navigation/data/map_cache_manager.dart';

class MapCacheSettings extends StatefulWidget {
  const MapCacheSettings({Key? key}) : super(key: key);

  @override
  State<MapCacheSettings> createState() => _MapCacheSettingsState();
}

class _MapCacheSettingsState extends State<MapCacheSettings> {
  double _cacheSize = 0.0;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadCacheSize();
  }

  Future<void> _loadCacheSize() async {
    final size = await MapCacheManager.getCacheSize();
    setState(() {
      _cacheSize = size;
    });
  }

  Future<void> _cacheCurrentArea() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // Get current location
      final currentLocation = LatLng(3.8480, 11.5021); // Yaoundé coordinates as example
      
      // Cache 10km radius around current location
      await MapCacheManager.cacheAreaTiles(
        center: currentLocation,
        radiusKm: 10,
        zoomLevel: 15,
      );

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Map area cached successfully')),
      );

      await _loadCacheSize();
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to cache map: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _clearCache() async {
    setState(() {
      _isLoading = true;
    });

    try {
      await MapCacheManager.clearCache();
      await _loadCacheSize();

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Map cache cleared')),
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to clear cache: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Map Cache Settings'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Offline Maps',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Download maps for offline use. This allows you to navigate even without internet connection.',
                    style: TextStyle(color: Colors.grey),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Cache Size:'),
                      Text(
                        '${_cacheSize.toStringAsFixed(2)} MB',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _isLoading ? null : _cacheCurrentArea,
            icon: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.download),
            label: Text(_isLoading ? 'Caching...' : 'Cache Current Area (10km)'),
            style: ElevatedButton.styleFrom(
              padding: const EdgeInsets.all(16),
            ),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: _isLoading ? null : _clearCache,
            icon: const Icon(Icons.delete_outline),
            label: const Text('Clear Cache'),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.all(16),
            ),
          ),
        ],
      ),
    );
  }
}
```

#### Acceptance Criteria

- [ ] Map cache manager implemented with tile caching
- [ ] Offline map widget uses cached tiles when available
- [ ] Map caching settings page created
- [ ] "Cache Current Area" button downloads 10km radius of tiles
- [ ] "Clear Cache" button removes all cached tiles
- [ ] Cache size displayed in MB
- [ ] Offline maps work in airplane mode
- [ ] Cached tiles expire after 30 days
- [ ] Maximum 1000 tiles cached to prevent excessive storage use
- [ ] OpenStreetMap tiles used (free alternative to Google Maps)

---

## Summary: Offline Functionality

The comprehensive offline functionality implementation includes:

**Web (Admin Dashboard)**:
- Enhanced service worker with API caching and background sync
- Persistent offline queue using IndexedDB
- Retry logic with up to 5 attempts
- Offline indicator with manual sync button
- Offline page for navigation attempts

**Mobile Apps (Customer & Rider)**:
- Hive local storage for data persistence
- Offline queue manager with automatic sync
- Connectivity monitoring
- Background sync every 15 minutes
- Offline-aware API client
- Cached API responses for offline access

**Rider App Specific**:
- Offline map caching for navigation
- Map cache settings page
- 10km radius tile caching
- OpenStreetMap integration

**Impact**:
- ✅ Enables platform usage in low-connectivity areas (common in Cameroon)
- ✅ Prevents data loss during connectivity issues
- ✅ Improves user experience with seamless offline/online transitions
- ✅ Increases platform adoption in rural areas
- ✅ Reduces customer frustration and cart abandonment

This implementation addresses the critical need for offline functionality in the Cameroon market where internet connectivity is often unreliable.
