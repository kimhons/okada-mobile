# Promotional Campaigns Page - i18n Completion Guide

**File**: `client/src/pages/promotional-campaigns.tsx`  
**Lines**: 762  
**Translations Available**: 118 (59 EN + 59 FR)  
**Estimated Time**: 20-30 minutes

---

## 📋 Step-by-Step Implementation

### Step 1: Add Imports

**Location**: After the lucide-react import (around line 45)

**Add these two lines**:
```typescript
import { useTranslation } from "react-i18next";
import { useI18nLoader } from "@/hooks/useI18nLoader";
```

**Full context**:
```typescript
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Megaphone,
  TrendingUp,
  DollarSign,
  Target,
  Play,
  Pause,
} from "lucide-react";
import { useTranslation } from "react-i18next";  // ADD THIS
import { useI18nLoader } from "@/hooks/useI18nLoader";  // ADD THIS

export default function PromotionalCampaigns() {
```

---

### Step 2: Initialize i18n Hooks

**Location**: Inside the component, right after the function declaration (line 47)

**Add these two lines**:
```typescript
const { t } = useTranslation("campaigns");
useI18nLoader(["campaigns"]);
```

**Full context**:
```typescript
export default function PromotionalCampaigns() {
  const { t } = useTranslation("campaigns");  // ADD THIS
  useI18nLoader(["campaigns"]);  // ADD THIS

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  // ... rest of component
```

---

### Step 3: Replace Hardcoded Strings

Use **Find & Replace** in your IDE with these replacements:

#### Page Header
| Find | Replace |
|------|---------|
| `"Promotional Campaigns"` | `t("title")` |
| `"Schedule and manage marketing campaigns"` | `t("subtitle")` |
| `"Create Campaign"` | `t("actions.create")` |

#### Stats Cards
| Find | Replace |
|------|---------|
| `"Total Campaigns"` | `t("stats.totalCampaigns")` |
| `"Active"` | `t("stats.active")` |
| `"Total Budget"` | `t("stats.totalBudget")` |
| `"Total Spent"` | `t("stats.totalSpent")` |
| `"Conversions"` | `t("stats.conversions")` |
| `"% of budget"` | `t("stats.ofBudget")` |

#### Filter Section
| Find | Replace |
|------|---------|
| `"Search campaigns..."` | `t("filters.searchPlaceholder")` |
| `"Filter by status"` | `t("filters.filterByStatus")` |
| `"All Status"` | `t("filters.allStatus")` |
| `"Draft"` | `t("filters.draft")` |
| `"Scheduled"` | `t("filters.scheduled")` |
| `"Paused"` | `t("filters.paused")` |
| `"Completed"` | `t("filters.completed")` |
| `"Cancelled"` | `t("filters.cancelled")` |
| `"Filter by type"` | `t("filters.filterByType")` |
| `"All Types"` | `t("filters.allTypes")` |
| `"Discount"` (in type filter) | `t("filters.discount")` |
| `"Free Delivery"` (in type filter) | `t("filters.freeDelivery")` |
| `"Cashback"` (in type filter) | `t("filters.cashback")` |
| `"Bundle"` (in type filter) | `t("filters.bundle")` |

#### Table Headers
| Find | Replace |
|------|---------|
| `"Campaign Name"` (table header) | `t("table.campaignName")` |
| `"Type"` (table header) | `t("table.type")` |
| `"Target Audience"` (table header) | `t("table.targetAudience")` |
| `"Budget"` (table header) | `t("table.budget")` |
| `"Spent"` (table header) | `t("table.spent")` |
| `"Status"` (table header) | `t("table.status")` |
| `"Actions"` (table header) | `t("table.actions")` |

#### Dialog Titles & Descriptions
| Find | Replace |
|------|---------|
| `"Create New Campaign"` | `t("dialog.createTitle")` |
| `"Edit Campaign"` | `t("dialog.editTitle")` |
| `"Delete Campaign"` | `t("dialog.deleteTitle")` |
| `"Fill in the details to create a new promotional campaign"` | `t("dialog.createDescription")` |
| `"Update the campaign details below"` | `t("dialog.editDescription")` |
| `"Are you sure you want to delete this campaign? This action cannot be undone."` | `t("dialog.deleteDescription")` |

#### Form Labels
| Find | Replace |
|------|---------|
| `"Campaign Name"` (form label) | `t("form.campaignName")` |
| `"Description"` | `t("form.description")` |
| `"Campaign Type"` | `t("form.campaignType")` |
| `"Target Audience"` (form label) | `t("form.targetAudience")` |
| `"Budget (in cents)"` | `t("form.budget")` |
| `"Start Date"` | `t("form.startDate")` |
| `"End Date"` | `t("form.endDate")` |
| `"Campaign Status"` | `t("form.status")` |

#### Form Placeholders
| Find | Replace |
|------|---------|
| `"e.g., Summer Sale 2024"` | `t("form.namePlaceholder")` |
| `"Describe the campaign objectives and details..."` | `t("form.descriptionPlaceholder")` |
| `"e.g., 100000 (for 1000 FCFA)"` | `t("form.budgetPlaceholder")` |

#### Buttons
| Find | Replace |
|------|---------|
| `"Cancel"` | `t("actions.cancel")` |
| `"Create"` (button text) | `t("actions.create")` |
| `"Update"` | `t("actions.update")` |
| `"Delete"` | `t("actions.delete")` |
| `"Edit"` | `t("actions.edit")` |

#### Toast Messages
| Find | Replace |
|------|---------|
| `"Campaign created successfully"` | `t("toast.createSuccess")` |
| `"Campaign updated successfully"` | `t("toast.updateSuccess")` |
| `"Campaign deleted successfully"` | `t("toast.deleteSuccess")` |
| `"Failed to create campaign: "` | `t("toast.createError") + ": "` |
| `"Failed to update campaign: "` | `t("toast.updateError") + ": "` |
| `"Failed to delete campaign: "` | `t("toast.deleteError") + ": "` |

#### Empty States
| Find | Replace |
|------|---------|
| `"No campaigns found"` | `t("empty.noCampaigns")` |
| `"Create your first campaign to get started"` | `t("empty.createFirst")` |

#### Helper Functions (getAudienceLabel)
| Find | Replace |
|------|---------|
| `"All Users"` (in getAudienceLabel) | `t("audience.allUsers")` |
| `"New Users"` (in getAudienceLabel) | `t("audience.newUsers")` |
| `"Active Users"` (in getAudienceLabel) | `t("audience.activeUsers")` |
| `"Inactive Users"` (in getAudienceLabel) | `t("audience.inactiveUsers")` |
| `"Specific Users"` (in getAudienceLabel) | `t("audience.specificUsers")` |

---

## 🔍 Important Notes

### Attribute Values with Quotes
When replacing in JSX attributes, be careful with quotes:

**WRONG**:
```typescript
placeholder="t("filters.searchPlaceholder")"  // ❌ Double quotes conflict
```

**CORRECT**:
```typescript
placeholder={t("filters.searchPlaceholder")}  // ✅ Use curly braces
```

### Data-Driven Content
**DO NOT** translate these (they come from the database):
- Campaign names
- Campaign descriptions
- Rider names
- User IDs
- Dates
- Numbers/amounts

### Helper Functions
The `getTypeLabel()` and `getAudienceLabel()` functions can remain as-is since they format data-driven values. However, if you want to translate the labels, update them like this:

```typescript
const getTypeLabel = (type: string) => {
  switch (type) {
    case "discount":
      return t("filters.discount");
    case "free_delivery":
      return t("filters.freeDelivery");
    case "cashback":
      return t("filters.cashback");
    case "bundle":
      return t("filters.bundle");
    default:
      return type;
  }
};
```

---

## ✅ Verification Checklist

After completing the implementation:

- [ ] Imports added (lines 46-47)
- [ ] Hooks initialized (lines 50-51)
- [ ] Page header translated
- [ ] Stats cards translated
- [ ] Filter section translated
- [ ] Table headers translated
- [ ] Dialog titles translated
- [ ] Form labels translated
- [ ] Form placeholders translated
- [ ] Buttons translated
- [ ] Toast messages translated
- [ ] Empty states translated
- [ ] Helper functions updated (optional)
- [ ] No TypeScript errors
- [ ] Dev server compiles successfully
- [ ] Language switcher works
- [ ] English text displays correctly
- [ ] French text displays correctly

---

## 🧪 Testing

### 1. Compile Check
```bash
cd /home/ubuntu/okada-admin
pnpm build
```

### 2. Dev Server Check
```bash
pnpm dev
```

### 3. Manual Testing
1. Navigate to Promotional Campaigns page
2. Switch language to French
3. Verify all text is translated
4. Switch back to English
5. Verify all text is in English

### 4. Specific Tests
- [ ] Create campaign dialog opens with translated labels
- [ ] Edit campaign dialog shows translated labels
- [ ] Delete confirmation shows translated text
- [ ] Filter dropdowns show translated options
- [ ] Stats cards show translated labels
- [ ] Toast messages appear in correct language
- [ ] Empty state message is translated

---

## 📝 Example Implementation

Here's a small example of what the completed code should look like:

**BEFORE**:
```typescript
export default function PromotionalCampaigns() {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Promotional Campaigns</h1>
            <p className="text-muted-foreground mt-1">
              Schedule and manage marketing campaigns
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Campaign
          </Button>
        </div>
```

**AFTER**:
```typescript
export default function PromotionalCampaigns() {
  const { t } = useTranslation("campaigns");
  useI18nLoader(["campaigns"]);

  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">{t("title")}</h1>
            <p className="text-muted-foreground mt-1">
              {t("subtitle")}
            </p>
          </div>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            {t("actions.create")}
          </Button>
        </div>
```

---

## 🚀 Quick Implementation Script

If you prefer, you can use this sed command to do bulk replacements:

```bash
cd /home/ubuntu/okada-admin/client/src/pages

# Replace page title
sed -i 's/"Promotional Campaigns"/t("title")/g' promotional-campaigns.tsx

# Replace create button
sed -i 's/"Create Campaign"/t("actions.create")/g' promotional-campaigns.tsx

# ... and so on for other strings
```

However, **manual replacement is recommended** to ensure proper syntax (especially with JSX attributes).

---

## 📞 Need Help?

If you encounter issues:
1. Check the syntax - make sure you're using `{t(...)}` not `"t(...)"` in JSX
2. Verify the translation key exists in the database
3. Check the browser console for i18n errors
4. Ensure the namespace `"campaigns"` is loaded

---

**Status**: Ready for Implementation  
**Last Updated**: December 15, 2025
