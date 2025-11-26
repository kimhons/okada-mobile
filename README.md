# Okada Admin Dashboard

> Comprehensive admin dashboard for managing Okada motorcycle delivery platform operations in Cameroon

![Database Integrity](https://github.com/YOUR_USERNAME/okada-admin/workflows/Database%20Integrity%20Check/badge.svg)
![CI](https://github.com/YOUR_USERNAME/okada-admin/workflows/CI/badge.svg)
![Deploy to Staging](https://github.com/YOUR_USERNAME/okada-admin/workflows/Deploy%20to%20Staging/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-22.x-green.svg)

---

## 📋 Overview

Okada Admin Dashboard is a full-stack web application built for managing motorcycle delivery operations. It provides comprehensive tools for order management, rider coordination, financial tracking, and platform analytics.

**Key Features:**
- 📦 Order Management & Quality Verification
- 🏍️ Rider Management with Leaderboard & Gamification
- 💰 Financial Overview & Commission Settings
- 📊 Revenue Analytics & Reporting
- 🎁 Promotional Campaigns & Marketing
- 🛡️ User Verification & Support Tickets
- 📱 Mobile-First Rider Features (Earnings, Haptic Feedback, Offline Mode)
- 🏆 Badge & Achievement System with Social Sharing

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 22.x or higher
- **pnpm** 8.x or higher
- **MySQL** or **TiDB** database
- **Git** for version control

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/okada-admin.git
cd okada-admin

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials and API keys

# Push database schema
pnpm db:push

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Component library
- **Wouter** - Lightweight routing
- **tRPC** - End-to-end typesafe APIs
- **Recharts** - Data visualization

### Backend
- **Node.js 22** - Runtime environment
- **Express 4** - Web framework
- **tRPC 11** - API layer
- **Drizzle ORM** - Type-safe database toolkit
- **MySQL/TiDB** - Database

### DevOps
- **GitHub Actions** - CI/CD pipelines
- **ESLint** - Code linting
- **Vitest** - Unit testing
- **TypeScript** - Type safety

---

## 📁 Project Structure

```
okada-admin/
├── client/               # Frontend application
│   ├── public/          # Static assets
│   └── src/
│       ├── pages/       # Page components
│       ├── components/  # Reusable UI components
│       ├── lib/         # Utilities and tRPC client
│       └── hooks/       # Custom React hooks
├── server/              # Backend application
│   ├── _core/          # Framework plumbing (OAuth, context)
│   ├── db.ts           # Database query helpers
│   └── routers.ts      # tRPC procedures
├── drizzle/            # Database schema and migrations
├── scripts/            # Utility scripts
├── docs/               # Documentation
└── .github/workflows/  # CI/CD workflows
```

---

## 🔧 Available Scripts

```bash
# Development
pnpm dev              # Start dev server with hot reload
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm lint:fix         # Fix ESLint errors automatically
pnpm check            # TypeScript type checking
pnpm format           # Format code with Prettier

# Testing
pnpm test             # Run unit tests

# Database
pnpm db:push          # Generate and run migrations
pnpm db:check         # Check database integrity
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL=mysql://user:password@host:3306/database

# Authentication
JWT_SECRET=your_jwt_secret_here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im

# Application
VITE_APP_ID=your_app_id
VITE_APP_TITLE=Okada Admin Dashboard
VITE_APP_LOGO=/logo.svg

# Owner (Optional - for preview/seeding)
OWNER_OPEN_ID=your_open_id
OWNER_NAME=Your Name

# Built-in Services
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your_api_key

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=your_analytics_endpoint
VITE_ANALYTICS_WEBSITE_ID=your_website_id

# Google Maps (Optional)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

---

## 🤖 CI/CD

This project uses GitHub Actions for automated testing and deployment.

### Workflows

**Database Integrity Check**
- Runs on: Push, PR, daily at 2 AM UTC
- Validates: No duplicate IDs across all tables
- On failure: Creates GitHub issue automatically

**CI Pipeline**
- Runs on: Push, PR
- Jobs: Lint → Test → Build
- Artifacts: Build output for review

### Setup

1. **Configure GitHub Secret**:
   ```
   Repository → Settings → Secrets and variables → Actions → New repository secret
   
   Name: DATABASE_URL
   Value: mysql://ci_user:password@host:3306/okada_ci
   ```

2. **Push to GitHub**:
   ```bash
   git push origin main
   ```

3. **Monitor Workflows**:
   - Navigate to Actions tab
   - View workflow runs and logs
   - Check for failures

See [docs/CI-CD-SETUP.md](./docs/CI-CD-SETUP.md) for detailed instructions.

---

## 📚 Documentation

- [CI/CD Setup Guide](./docs/CI-CD-SETUP.md) - Complete CI/CD configuration
- [Database Integrity Investigation](./docs/SPRINT-10-DB-INTEGRITY.md) - DB integrity findings
- [ESLint Configuration](./docs/ESLINT.md) - Linting rules and setup
- [Workflow README](./.github/workflows/README.md) - GitHub Actions workflows

---

## 🏗️ Development Workflow

### 1. Choose Design Style
Before writing frontend code, establish design direction (color, font, shadow, art style) and update `client/src/index.css` for global theming.

### 2. Update Database Schema
```bash
# Edit schema
vim drizzle/schema.ts

# Push changes
pnpm db:push
```

### 3. Add Backend Logic
```typescript
// server/db.ts - Add query helpers
export async function getFeatureData() {
  const db = await getDb();
  return await db.select().from(table);
}

// server/routers.ts - Add tRPC procedures
feature: router({
  getData: protectedProcedure.query(() => getFeatureData()),
}),
```

### 4. Build Frontend UI
```tsx
// client/src/pages/FeaturePage.tsx
import { trpc } from '@/lib/trpc';

export default function FeaturePage() {
  const { data, isLoading } = trpc.feature.getData.useQuery();
  
  return (
    <div>
      {/* Use shadcn/ui components */}
    </div>
  );
}
```

### 5. Register Route
```tsx
// client/src/App.tsx
<Route path="/feature" component={FeaturePage} />
```

---

## 🎨 Design System

### Colors
- **Primary**: Emerald green (delivery theme)
- **Accent**: Amber (notifications, badges)
- **Neutral**: Slate (text, borders)

### Typography
- **Headings**: Inter (sans-serif)
- **Body**: System font stack
- **Monospace**: JetBrains Mono

### Components
All UI components use **shadcn/ui** for consistency:
- Button, Card, Dialog, Table, Form
- Toast, Dropdown, Select, Checkbox
- Badge, Avatar, Skeleton, Tabs

---

## 🏆 Features

### Completed (Sprint 1-9)
- ✅ Dashboard with KPI cards and recent orders
- ✅ Order management with quality verification
- ✅ Rider management with leaderboard
- ✅ User and seller management
- ✅ Product catalog with inventory tracking
- ✅ Financial overview and commission settings
- ✅ Payment transactions tracking
- ✅ Payout management for riders
- ✅ Revenue analytics with charts
- ✅ Delivery zones configuration
- ✅ Promotional campaigns
- ✅ Support tickets system
- ✅ Mobile rider earnings breakdown
- ✅ Haptic feedback integration
- ✅ Offline mode with service workers
- ✅ Gamification (badges & achievements)
- ✅ Social media badge sharing
- ✅ ESLint configuration
- ✅ CI/CD pipeline with GitHub Actions

### In Progress (Sprint 10)
- 🚧 Database integrity monitoring
- 🚧 Code quality improvements

### Planned
- 📋 User verification system
- 📋 Platform statistics dashboard
- 📋 Dispute resolution workflow
- 📋 Geo-location analytics
- 📋 Real-time notifications
- 📋 Referral program
- 📋 Loyalty rewards

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Before submitting:**
```bash
pnpm lint        # Check code quality
pnpm check       # Verify TypeScript
pnpm test        # Run tests
pnpm db:check    # Verify database integrity
```

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Manus Platform** - Authentication and infrastructure
- **shadcn/ui** - Beautiful component library
- **Tailwind CSS** - Utility-first CSS framework
- **tRPC** - End-to-end type safety

---

## 📞 Support

For issues and questions:
- 📧 Email: support@okada-admin.com
- 🐛 Issues: [GitHub Issues](https://github.com/YOUR_USERNAME/okada-admin/issues)
- 📖 Docs: [Documentation](./docs/)

---

## 🗺️ Roadmap

**Q1 2026**
- User verification system
- Platform statistics dashboard
- Enhanced analytics

**Q2 2026**
- Real-time notifications
- Mobile app (React Native)
- Advanced reporting

**Q3 2026**
- Multi-language support
- Payment gateway integration
- API for third-party integrations

---

**Made with ❤️ for Cameroon's delivery ecosystem**
