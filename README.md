# 📊 StudyBuddies Financial Modeler

> **Enterprise-grade financial modeling and analysis platform for startups, small businesses, and financial analysts.**

A sophisticated React-based financial modeling application that enables real-time scenario planning, AI-powered cost optimization, multi-scenario comparison, and comprehensive KPI monitoring. Built with React 18, Vite, Supabase, and OpenAI integration.

[![React](https://img.shields.io/badge/React-18.2.0-blue?logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.21-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.83.0-3ECF8E?logo=supabase)](https://supabase.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4.6-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Usage Guide](#-usage-guide)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Development](#-development)
- [Deployment](#-deployment)
- [Security](#-security)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

### What is StudyBuddies Financial Modeler?

StudyBuddies Financial Modeler is a comprehensive financial planning and analysis platform designed to help businesses make data-driven strategic decisions. The application provides real-time financial scenario modeling, cost optimization analysis, KPI monitoring, and multi-scenario comparison capabilities, all enhanced with AI-powered insights through OpenAI's GPT-4 integration.

### Who is it for?

- **💼 Startup Founders & CEOs** - Understand runway, breakeven points, and funding requirements
- **📈 Financial Analysts & CFOs** - Detailed scenario modeling and strategic planning
- **🏢 Small Business Owners** - Optimize cost structure for profitability
- **💰 Financial Consultants** - Model client scenarios with professional tools
- **🎯 Investment Analysts** - Evaluate financial viability of portfolio companies

### Key Value Propositions

✨ **Comprehensive Financial Modeling** - Build detailed models with granular cost control  
🎯 **Real-Time Breakeven Analysis** - Instant visibility into profitability thresholds  
🤖 **AI-Powered Insights** - GPT-4 recommendations for cost optimization  
📊 **Multi-Scenario Comparison** - Compare up to 4 scenarios simultaneously  
🔬 **Cost Optimization Lab** - Matrix-based analysis for quick wins  
📡 **KPI Monitoring Dashboard** - Track CAC, LTV, MRR, churn, and burn rate  
🔐 **Secure Multi-User Platform** - Row-level security ensures data isolation  
💾 **Persistent Auto-Save** - Debounced auto-save to Supabase  
🎨 **Dark Mode Support** - Full theme system with system preference detection  
📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

---

## ✨ Key Features

### 1. 📊 Financial Modeling Hub

The core dashboard for building and managing comprehensive financial scenarios.

**Capabilities:**

- **Dynamic Cost Categories** - Personnel, Operations, Marketing, Technology, and Custom categories
- **Granular Cost Control** - Item-level inputs with quantity multipliers
- **Real-Time Calculations** - Instant breakeven analysis and metric updates
- **Revenue Projections** - 12-month forecasting across multiple pricing tiers
- **Interactive Charts** - Beautiful visualizations powered by Recharts
- **Quick Actions** - One-click operations like "Reduce Marketing 20%" or "Add Employee"
- **Scenario Management** - Save, load, create, and export multiple scenarios
- **Auto-Save** - Debounced persistence prevents data loss

**Key Metrics Tracked:**

- Breakeven Point (members & revenue)
- Monthly Burn Rate & Cash Runway
- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV) & LTV:CAC Ratio
- Monthly Recurring Revenue (MRR)
- Churn & Retention Rates

### 2. 🔄 Scenario Comparison

Side-by-side comparison of up to 4 financial scenarios to evaluate strategic alternatives.

**Capabilities:**

- **Multi-Scenario Selection** - Compare 2-4 scenarios simultaneously
- **Comparison Modes** - Absolute ($) or percentage (%) variance analysis
- **Synchronized Charts** - Linked visualizations with coordinated zoom/pan
- **Waterfall Analysis** - Variance breakdown by revenue, costs, and efficiency
- **Sensitivity Heatmap** - Identify high-impact variables
- **Sortable Metrics Table** - Detailed comparison with export functionality
- **Time Horizon Control** - 6, 12, or 24-month projections

### 3. 🔬 Cost Optimization Lab

Interactive priority matrix for identifying cost reduction opportunities.

**Capabilities:**

- **2x2 Optimization Matrix** - Impact vs. Effort visualization
- **Quadrant Analysis** - Quick Wins, Major Projects, Fill-ins, Thankless Tasks
- **Bubble Chart** - Size represents monthly cost amount
- **Category Filtering** - Filter by personnel, operations, marketing, technology
- **Priority Scoring** - Weighted algorithm for optimization recommendations
- **Recommendations Panel** - AI-powered cost reduction suggestions
- **Sensitivity Analysis** - Parameter impact analysis for high-leverage targets

### 4. 📡 KPI Monitoring Center

Real-time dashboard for tracking critical financial and operational metrics.

**Capabilities:**

- **KPI Cards** - Current values with trend indicators and sparklines
- **Alert System** - Threshold-based notifications for critical changes
- **Trend Charts** - Multi-metric time series with zoom and pan
- **Performance Table** - Historical data with variance analysis
- **Global Controls** - Date range, refresh interval, threshold configuration
- **Status Indicators** - Visual cues for good/warning/critical states

**Monitored KPIs:**

- Customer Acquisition Cost (CAC)
- Customer Lifetime Value (LTV)
- Monthly Recurring Revenue (MRR)
- Cash Runway (months)
- Churn Rate & Retention Rate
- Burn Rate

### 5. 🤖 AI-Powered Financial Analysis

GPT-4 integration for intelligent insights and recommendations.

**Capabilities:**

- **Comprehensive Financial Analysis** - AI evaluation of entire financial model
- **Cost Optimization Suggestions** - Targeted recommendations with savings estimates
- **Risk Assessment** - Identification of financial risks and vulnerabilities
- **Strategic Recommendations** - Prioritized action items with impact estimates
- **Secure Implementation** - API key protected via Supabase Edge Functions
- **Graceful Fallbacks** - User-friendly error handling

### 6. 🔐 Authentication & Security

Complete user authentication and profile management powered by Supabase Auth.

**Capabilities:**

- **Email/Password Authentication** - Secure login and registration
- **User Profiles** - Extended profile data with company information
- **Protected Routes** - Authentication-gated access to all features
- **Row-Level Security** - PostgreSQL RLS ensures data isolation
- **Session Management** - JWT tokens with auto-refresh
- **Auto-Profile Creation** - PostgreSQL trigger creates user profiles on signup

### 7. 🎨 Dark Mode & Theming

Full theme support with system preference detection.

**Capabilities:**

- **Three Theme Modes** - Light, Dark, and System (auto-detect)
- **LocalStorage Persistence** - Remembers user preference
- **CSS Custom Properties** - Consistent theming across all components
- **Smooth Transitions** - Animated theme switching
- **Component-Aware** - All UI components support both themes

---

## 🛠️ Tech Stack

### Frontend

| Technology                   | Version | Purpose                               |
| ---------------------------- | ------- | ------------------------------------- |
| **React**                    | 18.2.0  | UI framework with concurrent features |
| **Vite**                     | 5.4.21  | Build tool with instant HMR           |
| **React Router**             | 6.0.2   | Client-side routing                   |
| **TailwindCSS**              | 3.4.6   | Utility-first CSS framework           |
| **Recharts**                 | 2.15.2  | Data visualization library            |
| **D3.js**                    | 7.9.0   | Advanced visualizations               |
| **Framer Motion**            | 10.16.4 | Animation library                     |
| **React Hook Form**          | 7.55.0  | Form validation                       |
| **Lucide React**             | 0.484.0 | Icon library (1000+ icons)            |
| **Class Variance Authority** | -       | Type-safe variant styling             |

### Backend & Services

| Technology                  | Version | Purpose                                                   |
| --------------------------- | ------- | --------------------------------------------------------- |
| **Supabase**                | 2.83.0  | Backend-as-a-Service (PostgreSQL + Auth + Edge Functions) |
| **Supabase Auth**           | -       | Email/password authentication with JWT                    |
| **PostgreSQL**              | 15      | Relational database with JSONB support                    |
| **Supabase Edge Functions** | -       | Deno-based serverless compute                             |
| **OpenAI API**              | 6.9.1   | GPT-4 integration for AI insights                         |

### Development Tools

| Technology       | Purpose                         |
| ---------------- | ------------------------------- |
| **ESLint**       | Code linting                    |
| **PostCSS**      | CSS processing                  |
| **Autoprefixer** | CSS vendor prefixing            |
| **dotenv**       | Environment variable management |

### Key Libraries

- **axios** - HTTP client for API requests
- **date-fns** - Modern date utilities
- **clsx + tailwind-merge** - Intelligent className merging
- **@radix-ui/react-slot** - Polymorphic component composition

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** v14.x or higher (v18+ recommended)
- **npm** or **yarn** package manager
- **Supabase Account** - [Create free account](https://supabase.com)
- **OpenAI Account** (Optional) - [Get API key](https://platform.openai.com/api-keys)
- **Git** for version control

### Installation

#### Step 1: Clone the Repository

```bash
git clone https://github.com/TristanEDU/studybuddies_financial_modeler.git
cd studybuddies_financial_modeler
```

#### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

#### Step 3: Set Up Supabase

1. **Create a Supabase Project:**

   - Go to [https://supabase.com](https://supabase.com)
   - Click "New Project"
   - Note your **Project URL** and **Anon Key**

2. **Run Database Migration:**

```bash
# Login to Supabase CLI
npx supabase login

# Link to your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Push migration to create database schema
npx supabase db push
```

**Find Your Project Reference:**

- Supabase Dashboard → Settings → General → **Reference ID**

#### Step 4: Configure Environment Variables

Create a `.env` file in the project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**How to Get Credentials:**

1. Supabase Dashboard → Settings → API
2. Copy "Project URL" → `VITE_SUPABASE_URL`
3. Copy "anon public" key → `VITE_SUPABASE_ANON_KEY`

⚠️ **Security Note:** Never commit `.env` to version control. It's already in `.gitignore`.

#### Step 5: Deploy OpenAI Proxy Edge Function (Optional)

To enable AI-powered insights:

```bash
# Deploy the Edge Function
npx supabase functions deploy openai-proxy

# Set your OpenAI API key as a secret
npx supabase secrets set OPENAI_API_KEY=sk-your-openai-key-here
```

**Get OpenAI API Key:**

- [OpenAI Platform](https://platform.openai.com/api-keys) → Create new secret key

#### Step 6: Start Development Server

```bash
npm start
# or
npm run dev
```

The application will open at **http://localhost:4028**

### Quick Start Guide

1. **Sign Up** - Navigate to `/signup` and create an account
2. **Default Scenario** - A default financial scenario is auto-created
3. **Add Costs** - Open cost categories and add your expenses
4. **Set Pricing** - Choose your pricing tier (Basic/Standard/Premium/Enterprise)
5. **View Metrics** - See real-time breakeven analysis and KPIs
6. **Get AI Insights** - Click "AI Analysis" for recommendations (requires OpenAI setup)
7. **Save Scenario** - Your changes auto-save every second

---

## 📚 Usage Guide

### Creating Your First Financial Model

1. **Sign in** to the application
2. Navigate to **Financial Modeling Hub** (default page)
3. **Activate Cost Categories:**
   - Click on Personnel, Operations, Marketing, or Technology
   - Toggle individual cost items on/off
   - Adjust values using sliders or direct input
   - Set quantities for items that need them
4. **Select Pricing Tier:**
   - Choose from Basic ($29), Standard ($49), Premium ($99), or Enterprise ($199)
5. **View Real-Time Metrics:**
   - Breakeven Point shows members and revenue needed
   - Cash Runway shows months until cash runs out
   - CAC, LTV, and other KPIs update automatically
6. **Use Quick Actions:**
   - "Reduce Marketing 20%" - Instantly cuts marketing costs
   - "Add Employee" - Adds a new employee role
7. **Save as Scenario:**
   - Click "Save Scenario" in Scenario Controls
   - Give it a descriptive name (e.g., "Conservative Q1 2025")

### Comparing Multiple Scenarios

1. Create 2-4 different scenarios (e.g., Optimistic, Realistic, Conservative)
2. Navigate to **Scenario Comparison** page
3. Select scenarios in the dropdown selectors
4. Choose comparison mode (Absolute $ or Percentage %)
5. Set time horizon (6, 12, or 24 months)
6. Analyze:
   - **Comparison Metrics** - Side-by-side KPI cards
   - **Synchronized Charts** - Visual trend comparison
   - **Waterfall Chart** - Variance breakdown
   - **Comparison Table** - Detailed metric comparison

### Using the Cost Optimization Lab

1. Navigate to **Cost Optimization Lab**
2. View the **Optimization Matrix:**
   - Upper-left quadrant = **Quick Wins** (high impact, low effort)
   - Upper-right quadrant = **Major Projects** (high impact, high effort)
   - Lower-left quadrant = **Fill-ins** (low impact, low effort)
   - Lower-right quadrant = **Thankless Tasks** (low impact, high effort)
3. Filter by category using **Category Filters**
4. Click bubbles for detailed cost breakdowns
5. Review **Recommendations Panel** for AI suggestions
6. Export data for further analysis

### Monitoring KPIs

1. Navigate to **KPI Monitoring Center**
2. Configure **Global Controls:**
   - Date range (7 days, 30 days, 90 days, 1 year)
   - Refresh interval (manual, 5min, 15min, 1hr)
3. Review **KPI Cards** for current metrics
4. Check **Alert Panel** for threshold breaches
5. Analyze **Trend Charts** for patterns
6. Export **Performance Table** data

### Getting AI Insights

1. In **Financial Modeling Hub**, click **"AI Analysis"** button
2. Wait for GPT-4 analysis (typically 5-10 seconds)
3. Review structured insights:
   - **Key Insights** - Main observations about your financial model
   - **Recommendations** - Prioritized action items
   - **Risk Assessment** - Identified financial risks
   - **Optimization Opportunities** - Cost reduction suggestions
4. Export or save insights for reference

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (React SPA)                      │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐   │
│  │  Pages      │  │  Components │  │   Contexts       │   │
│  │  - Hub      │  │  - UI Kit   │  │   - AuthContext  │   │
│  │  - Compare  │  │  - Charts   │  │   - ThemeContext │   │
│  │  - Lab      │  │  - Forms    │  │                  │   │
│  │  - KPI      │  └─────────────┘  └──────────────────┘   │
│  └─────────────┘                                            │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Service Layer                           │   │
│  │  - financialService  - costService                  │   │
│  │  - aiAnalysisService - authService                  │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Supabase Backend                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ PostgreSQL   │  │ Supabase Auth│  │  Edge Functions  │  │
│  │ - RLS        │  │ - JWT Tokens │  │  - openai-proxy  │  │
│  │ - JSONB      │  │ - Sessions   │  │                  │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  OpenAI API  │
                  │  (GPT-4)     │
                  └──────────────┘
```

### Key Design Patterns

#### 1. **Service Layer Pattern**

Separates business logic from UI components. All API calls and data transformations happen in service modules:

- `financialService.js` - Scenario CRUD operations
- `costService.js` - Cost category and item management
- `aiAnalysisService.js` - AI-powered insights
- `authService.js` - Authentication utilities

#### 2. **Context API for Global State**

- `AuthContext` - Manages authentication state and user profile
- `ThemeContext` - Handles dark/light theme switching

#### 3. **Debounced Persistence**

Auto-save with 1-second debounce prevents excessive database writes:

```javascript
const persistCosts = useCallback(
	async (updatedCosts) => {
		clearTimeout(persistTimerRef.current);
		persistTimerRef.current = setTimeout(async () => {
			await financialService.updateScenario(scenarioId, {
				costData: updatedCosts,
			});
		}, 1000);
	},
	[scenarioId]
);
```

#### 4. **Protected Routes**

All main pages check authentication status:

```javascript
useEffect(() => {
	if (!authLoading && !isAuthenticated) {
		navigate("/signin");
	}
}, [isAuthenticated, authLoading, navigate]);
```

#### 5. **Component Variant System**

Uses Class Variance Authority (CVA) for type-safe styling:

```javascript
const buttonVariants = cva("base-classes", {
	variants: {
		variant: { default: "...", primary: "..." },
		size: { sm: "...", default: "..." },
	},
});
```

### Data Flow

**Cost Update Flow:**

1. User changes input → `handleCostChange()`
2. Validation → `ValidationUtils`
3. State update → `setCosts()`
4. Debounced persistence → `persistCosts()`
5. Service layer → `financialService.updateScenario()`
6. Supabase update → JSONB + normalized tables
7. UI reflects changes

**Scenario Load Flow:**

1. User login → `loadScenarios()`
2. Fetch from Supabase → `financialService.getScenarios()`
3. Load first scenario → `getScenarioWithCostData()`
4. Merge JSONB + table data
5. Validate structure
6. Render UI

---

## 🗄️ Database Schema

### Core Tables

#### `user_profiles`

Extended user information linked to Supabase Auth.

| Column         | Type           | Description                |
| -------------- | -------------- | -------------------------- |
| `id`           | UUID (PK)      | References auth.users(id)  |
| `email`        | TEXT (UNIQUE)  | User email address         |
| `full_name`    | TEXT           | User's full name           |
| `avatar_url`   | TEXT           | Profile picture URL        |
| `role`         | user_role ENUM | 'admin', 'user', 'premium' |
| `company_name` | TEXT           | Company affiliation        |
| `created_at`   | TIMESTAMPTZ    | Account creation timestamp |
| `updated_at`   | TIMESTAMPTZ    | Last update timestamp      |

**RLS Policy:** Users can only read/write their own profile.

#### `financial_scenarios`

Main scenario storage with flexible cost structure.

| Column         | Type            | Description                      |
| -------------- | --------------- | -------------------------------- |
| `id`           | UUID (PK)       | Unique scenario identifier       |
| `user_id`      | UUID (FK)       | Owner reference                  |
| `name`         | TEXT            | Scenario name                    |
| `description`  | TEXT            | Detailed description             |
| `status`       | scenario_status | 'active', 'archived', 'template' |
| `is_template`  | BOOLEAN         | Template flag                    |
| `cost_data`    | JSONB           | Flexible cost structure          |
| `pricing_data` | JSONB           | Pricing configurations           |
| `created_at`   | TIMESTAMPTZ     | Creation timestamp               |
| `updated_at`   | TIMESTAMPTZ     | Last update timestamp            |

**RLS Policy:** Users can only access their own scenarios.

#### `cost_categories`

Normalized cost category definitions.

| Column          | Type               | Description                                                    |
| --------------- | ------------------ | -------------------------------------------------------------- |
| `id`            | UUID (PK)          | Category identifier                                            |
| `user_id`       | UUID (FK)          | Owner reference                                                |
| `scenario_id`   | UUID (FK)          | Parent scenario                                                |
| `category_name` | TEXT               | Category name                                                  |
| `category_type` | cost_category_type | 'personnel', 'operations', 'marketing', 'technology', 'custom' |
| `enabled`       | BOOLEAN            | Active status                                                  |
| `settings`      | JSONB              | Category-specific settings                                     |
| `created_at`    | TIMESTAMPTZ        | Creation timestamp                                             |

**Cascade:** Deleted when scenario is deleted.

#### `cost_items`

Individual cost line items.

| Column        | Type          | Description                  |
| ------------- | ------------- | ---------------------------- |
| `id`          | UUID (PK)     | Item identifier              |
| `category_id` | UUID (FK)     | Parent category              |
| `user_id`     | UUID (FK)     | Owner reference              |
| `item_name`   | TEXT          | Item name                    |
| `value`       | DECIMAL(12,2) | Cost value                   |
| `min_value`   | DECIMAL       | Minimum value for slider     |
| `max_value`   | DECIMAL       | Maximum value for slider     |
| `step_value`  | DECIMAL       | Step increment               |
| `enabled`     | BOOLEAN       | Active status                |
| `metadata`    | JSONB         | count, hours, benefits, type |
| `created_at`  | TIMESTAMPTZ   | Creation timestamp           |

**Cascade:** Deleted when category is deleted.

#### `financial_metrics`

Saved metric snapshots for historical analysis.

| Column             | Type          | Description                       |
| ------------------ | ------------- | --------------------------------- |
| `id`               | UUID (PK)     | Metric identifier                 |
| `user_id`          | UUID (FK)     | Owner reference                   |
| `scenario_id`      | UUID (FK)     | Related scenario                  |
| `metric_type`      | TEXT          | Metric type (CAC, LTV, MRR, etc.) |
| `metric_value`     | DECIMAL(15,2) | Calculated value                  |
| `calculation_date` | TIMESTAMPTZ   | When calculated                   |
| `metadata`         | JSONB         | Additional context                |

### Data Structure

**Cost Data JSONB Structure:**

```json
{
	"personnel": {
		"employees": {
			"roles": {
				"role_id": {
					"title": "Software Engineer",
					"salary": 120000,
					"count": 5,
					"benefits": 0.3,
					"enabled": true
				}
			}
		},
		"contractors": {
			"enabled": true,
			"types": {
				"contractor_id": {
					"title": "Freelance Designer",
					"rate": 100,
					"hours": 20,
					"enabled": true
				}
			}
		}
	},
	"operations": {
		"items": {
			"item_id": {
				"label": "Office Rent",
				"value": 5000,
				"quantity": 1,
				"enabled": true
			}
		}
	},
	"marketing": { "items": {} },
	"technology": { "items": {} },
	"customCategories": {
		"category_id": {
			"name": "Legal & Compliance",
			"type": "custom",
			"enabled": true,
			"items": {}
		}
	}
}
```

---

## 💻 Development

### Project Structure

```
studybuddies_financial_modeler/
├── public/                    # Static assets
│   ├── assets/images/         # Image files
│   ├── manifest.json          # PWA manifest
│   └── robots.txt             # SEO crawler instructions
├── src/
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # UI primitives (Button, Input, Select, etc.)
│   │   ├── auth/              # Auth screens (SignIn, SignUp, Profile)
│   │   ├── AppIcon.jsx        # Icon wrapper
│   │   ├── AppImage.jsx       # Image component
│   │   ├── ErrorBoundary.jsx  # Error handling
│   │   └── ScrollToTop.jsx    # Route scroll behavior
│   ├── contexts/              # React Context providers
│   │   ├── AuthContext.jsx    # Authentication state
│   │   └── ThemeContext.jsx   # Theme management
│   ├── lib/                   # Third-party configs
│   │   └── supabase.js        # Supabase client
│   ├── pages/                 # Page components (one per route)
│   │   ├── financial-modeling-hub/
│   │   │   ├── index.jsx      # Main dashboard
│   │   │   └── components/    # Page-specific components
│   │   ├── scenario-comparison/
│   │   ├── cost-optimization-lab/
│   │   ├── kpi-monitoring-center/
│   │   └── NotFound.jsx
│   ├── services/              # Business logic & API calls
│   │   ├── financialService.js
│   │   ├── costService.js
│   │   ├── aiAnalysisService.js
│   │   └── authService.js
│   ├── styles/                # Global styles
│   │   ├── index.css          # Base styles
│   │   └── tailwind.css       # Tailwind imports
│   ├── utils/                 # Helper functions
│   │   ├── cn.js              # className utility
│   │   └── openaiClient.js    # DEPRECATED
│   ├── App.jsx                # App shell with providers
│   ├── Routes.jsx             # Route definitions
│   └── index.jsx              # React root render
├── supabase/                  # Supabase configuration
│   ├── functions/             # Edge Functions
│   │   ├── openai-proxy/      # OpenAI API proxy
│   │   └── _shared/           # Shared utilities
│   └── migrations/            # Database migrations
├── .env                       # Environment variables (git-ignored)
├── .env.example               # Example env file
├── index.html                 # HTML entry point
├── package.json               # Dependencies & scripts
├── tailwind.config.js         # Tailwind configuration
├── vite.config.mjs            # Vite build configuration
├── jsconfig.json              # JavaScript config
└── README.md                  # This file
```

### Available Scripts

```bash
# Development
npm start                      # Start dev server on http://localhost:4028
npm run dev                    # Alias for npm start

# Production Build
npm run build                  # Build for production → /build directory
npm run serve                  # Preview production build locally

# Database Management
npx supabase login             # Login to Supabase CLI
npx supabase link --project-ref <ref>  # Link to project
npx supabase db push           # Push migrations to remote
npx supabase db pull           # Pull schema from remote
npx supabase gen types typescript  # Generate TypeScript types

# Edge Functions
npx supabase functions deploy openai-proxy  # Deploy OpenAI proxy
npx supabase functions logs openai-proxy    # View function logs
npx supabase secrets set OPENAI_API_KEY=sk-...  # Set secrets
```

### Adding New Features

#### Create a New Page

1. **Create page directory:**

```bash
mkdir -p src/pages/new-feature
touch src/pages/new-feature/index.jsx
```

2. **Add route in `Routes.jsx`:**

```javascript
import NewFeature from "./pages/new-feature";

// In route definitions:
<Route path="/new-feature" element={<NewFeature />} />;
```

3. **Add navigation in `Header.jsx`:**

```javascript
const navigationItems = [
	// ...
	{ name: "New Feature", href: "/new-feature", icon: "Star" },
];
```

#### Create a New UI Component

1. **Create component file:**

```bash
touch src/components/ui/NewComponent.jsx
```

2. **Implement with CVA pattern:**

```javascript
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";

const componentVariants = cva("base-classes", {
	variants: {
		variant: { default: "...", primary: "..." },
		size: { sm: "...", default: "..." },
	},
	defaultVariants: { variant: "default", size: "default" },
});

export const NewComponent = ({ variant, size, className, ...props }) => {
	return (
		<div className={cn(componentVariants({ variant, size }), className)}>
			{props.children}
		</div>
	);
};
```

#### Add a New Cost Category

1. **Update `STANDARD_CATEGORY_CONFIGS` in `financial-modeling-hub/index.jsx`:**

```javascript
export const STANDARD_CATEGORY_CONFIGS = {
	newCategory: {
		key: "newCategory",
		label: "New Category",
		title: "New Category Title",
		description: "Category description",
		iconName: "Package",
		defaultItems: [
			{ value: "items.item1", label: "Item 1", defaultValue: 1000 },
		],
		createInitialData: () => ({ items: {} }),
	},
};
```

2. **Update cost calculation in `calculateTotalCosts()`**

3. **Add to database enum (optional):**

```sql
ALTER TYPE cost_category_type ADD VALUE 'new_category';
```

### Development Best Practices

✅ **Use optional chaining** (`?.`) for nested property access  
✅ **Implement error boundaries** for feature sections  
✅ **Use useCallback/useMemo** for performance optimization  
✅ **Debounce expensive operations** (database writes, API calls)  
✅ **Handle loading and error states** in all async operations  
✅ **Test with both dark and light themes**  
✅ **Ensure mobile responsiveness** with Tailwind breakpoints  
✅ **Follow existing patterns** (CVA for variants, service layer for logic)  
✅ **Add PropTypes or TypeScript types** for components  
✅ **Write descriptive commit messages**

### Debugging Tips

**Supabase Connection Issues:**

```javascript
// Browser console
console.log(await supabase.auth.getUser());
console.log(await supabase.from("financial_scenarios").select("*"));
```

**View RLS Policies:**

```sql
-- Supabase SQL Editor
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

**Test Edge Functions Locally:**

```bash
npx supabase functions serve openai-proxy

curl -i --location --request POST 'http://localhost:54321/functions/v1/openai-proxy' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"messages":[{"role":"user","content":"Hello"}]}'
```

---

## 🚀 Deployment

### Production Deployment (Recommended: Vercel)

#### Option 1: Vercel (Zero-Config)

1. **Push to GitHub:**

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. **Deploy to Vercel:**

   - Go to [https://vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
   - Click "Deploy"

3. **Configure Custom Domain** (Optional):
   - Vercel Dashboard → Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

#### Option 2: Netlify

1. **Build Settings:**

   - Build command: `npm run build`
   - Publish directory: `build`

2. **Environment Variables:**

   - Site Settings → Build & Deploy → Environment
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

3. **Deploy:**
   - Connect GitHub repository
   - Trigger deployment

#### Option 3: Traditional Hosting (VPS, cPanel)

1. **Build locally:**

```bash
npm run build
```

2. **Upload `/build` directory** to your web server

3. **Configure web server** (nginx example):

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/studybuddies/build;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### Supabase Production Configuration

1. **Enable Production Mode** in Supabase Dashboard
2. **Configure Custom Domain** for Supabase project (optional)
3. **Set up Backups** (automatic on Pro plan)
4. **Enable Database Metrics** monitoring
5. **Configure Email Templates** for auth emails

### Edge Function Deployment

```bash
# Deploy OpenAI proxy to production
npx supabase functions deploy openai-proxy

# Set production secrets
npx supabase secrets set OPENAI_API_KEY=sk-prod-key-here

# Verify deployment
curl https://your-project.supabase.co/functions/v1/openai-proxy \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"test"}]}'
```

### Environment Variables (Production)

**Required:**

```bash
VITE_SUPABASE_URL=https://your-production-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

**Server-Side (Supabase Secrets):**

```bash
OPENAI_API_KEY=sk-your-production-key  # Set via npx supabase secrets set
```

### Post-Deployment Checklist

- [ ] Verify environment variables are set correctly
- [ ] Test user registration and login
- [ ] Create a test scenario and verify auto-save
- [ ] Test AI analysis feature
- [ ] Verify dark/light theme switching
- [ ] Test on mobile devices
- [ ] Check browser console for errors
- [ ] Monitor Supabase logs for issues
- [ ] Set up error tracking (Sentry recommended)
- [ ] Configure analytics (optional)

---

## 🔐 Security

### Security Features

#### 1. **Row-Level Security (RLS)**

All database tables have RLS enabled. Users can only access their own data:

```sql
-- Example RLS policy
CREATE POLICY "Users can only view own scenarios"
ON financial_scenarios FOR SELECT
USING (auth.uid() = user_id);
```

#### 2. **API Key Protection**

- ✅ OpenAI API key **never exposed** to browser
- ✅ Stored securely in Supabase Edge Function environment
- ✅ Accessed only by server-side code

#### 3. **Authentication Security**

- Password hashing via bcrypt (handled by Supabase)
- JWT tokens with automatic expiration
- Session auto-refresh
- Secure cookie storage

#### 4. **Input Validation**

- Client-side validation in forms
- Server-side validation in Edge Functions
- SQL injection prevented by Supabase parameterized queries
- XSS prevention via React's default escaping

#### 5. **CORS Configuration**

- Properly configured CORS headers in Edge Functions
- Production domain whitelisting recommended

#### 6. **HTTPS Enforcement**

- All Supabase connections use HTTPS
- Vercel/Netlify enforce HTTPS by default

### Security Best Practices

⚠️ **Never commit `.env` to version control**  
⚠️ **Rotate API keys regularly**  
⚠️ **Use strong passwords** for database and admin accounts  
⚠️ **Monitor Supabase logs** for suspicious activity  
⚠️ **Keep dependencies updated** (`npm audit` regularly)  
⚠️ **Enable 2FA** on Supabase and OpenAI accounts  
⚠️ **Use environment-specific keys** (dev vs. production)  
⚠️ **Implement rate limiting** for expensive operations  
⚠️ **Regular security audits** of RLS policies

### Reporting Security Issues

If you discover a security vulnerability, please email **security@yourdomain.com** instead of using the public issue tracker.

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: "Access token not provided" when deploying Edge Function

**Solution:**

```bash
# Option 1: Set environment variable
export SUPABASE_ACCESS_TOKEN=your-token-here
npx supabase functions deploy openai-proxy

# Option 2: Login interactively
npx supabase login
npx supabase functions deploy openai-proxy
```

#### Issue: "Cannot find module 'supabase'" or import errors

**Solution:**

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Issue: "Row-level security policy violated"

**Solution:**

- Ensure you're logged in
- Check that RLS policies are correctly applied
- Verify `user_id` matches `auth.uid()`

**Debug in SQL Editor:**

```sql
SELECT auth.uid();  -- Should return your user ID
SELECT * FROM financial_scenarios WHERE user_id = auth.uid();
```

#### Issue: AI Analysis returns 404 error

**Solution:**
Edge function not deployed. Deploy it:

```bash
npx supabase functions deploy openai-proxy
npx supabase secrets set OPENAI_API_KEY=sk-your-key
```

#### Issue: Auto-save not working

**Solution:**

- Check browser console for errors
- Verify Supabase connection: `console.log(await supabase.auth.getUser())`
- Ensure scenario has a valid ID (not temporary)
- Check network tab for failed requests

#### Issue: Dark mode not switching

**Solution:**

- Clear localStorage: `localStorage.clear()`
- Refresh page
- Check ThemeContext is properly wrapping App

#### Issue: Charts not rendering

**Solution:**

- Ensure data structure is valid
- Check browser console for Recharts errors
- Verify `window` is defined (SSR issues)

### Getting Help

- **Documentation**: See `DEPLOYMENT.md` for detailed deployment guide
- **GitHub Issues**: [Report bugs or request features](https://github.com/TristanEDU/studybuddies_financial_modeler/issues)
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Vite Docs**: [https://vitejs.dev](https://vitejs.dev)

---

## 🗺️ Roadmap

### Planned Features

#### Q1 2025

- [ ] **Excel/CSV Import** - Import existing financial models
- [ ] **PDF Export** - Generate professional reports
- [ ] **Team Collaboration** - Share scenarios with team members
- [ ] **Commenting System** - Add notes and discussions to scenarios
- [ ] **Enhanced Mobile UI** - Improved touch interactions

#### Q2 2025

- [ ] **Advanced Charts** - Funnel, Sankey, Network diagrams
- [ ] **Custom Formulas** - User-defined calculations
- [ ] **Webhooks** - Trigger actions on metric changes
- [ ] **API Access** - RESTful API for integrations
- [ ] **Slack/Teams Integration** - Push alerts to team channels

#### Q3 2025

- [ ] **Machine Learning Forecasting** - Predictive revenue modeling
- [ ] **Benchmark Data** - Industry comparison data
- [ ] **Audit Log** - Detailed change tracking
- [ ] **Version History** - Scenario versioning and rollback
- [ ] **Multi-Currency Support** - Global pricing tiers

#### Future

- [ ] **White-Label Solution** - Customizable branding
- [ ] **Enterprise SSO** - SAML/OAuth integration
- [ ] **Advanced Permissions** - Role-based access control
- [ ] **Real-Time Collaboration** - Google Docs-style editing
- [ ] **Mobile Apps** - Native iOS/Android apps

### Completed Features ✅

- ✅ Financial Modeling Hub
- ✅ Scenario Comparison
- ✅ Cost Optimization Lab
- ✅ KPI Monitoring Center
- ✅ AI-Powered Insights
- ✅ Dark Mode Support
- ✅ Debounced Auto-Save
- ✅ Row-Level Security
- ✅ OpenAI Integration via Edge Functions

---

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

1. **🐛 Report Bugs** - Use GitHub Issues to report bugs with detailed reproduction steps
2. **💡 Suggest Features** - Open an issue to discuss new feature ideas
3. **📖 Improve Documentation** - Fix typos, add examples, clarify instructions
4. **🔧 Submit Pull Requests** - Fix bugs or implement new features

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following existing code patterns
4. **Test thoroughly** - ensure no regressions
5. **Commit with descriptive messages:**
   ```bash
   git commit -m "feat: add export to PDF functionality"
   ```
6. **Push to your fork:**
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** with detailed description

### Code Style

- Follow existing patterns and conventions
- Use meaningful variable and function names
- Add comments for complex logic
- Ensure code is formatted consistently
- Test with both dark and light themes
- Ensure mobile responsiveness

### Commit Message Convention

```
feat: add new feature
fix: bug fix
docs: documentation changes
style: code formatting
refactor: code restructuring
test: add tests
chore: maintenance tasks
```

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 StudyBuddies Financial Modeler

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

### Technologies

This project is built with incredible open-source technologies:

- **[React](https://reactjs.org/)** - UI framework
- **[Vite](https://vitejs.dev/)** - Build tool
- **[Supabase](https://supabase.com/)** - Backend platform
- **[TailwindCSS](https://tailwindcss.com/)** - CSS framework
- **[Recharts](https://recharts.org/)** - Charting library
- **[OpenAI](https://openai.com/)** - AI insights
- **[Lucide](https://lucide.dev/)** - Icons

### Inspiration

Special thanks to the financial modeling and SaaS communities for inspiration and best practices.

---

## 📞 Contact & Support

- **GitHub**: [@TristanEDU](https://github.com/TristanEDU)
- **Project Repository**: [studybuddies_financial_modeler](https://github.com/TristanEDU/studybuddies_financial_modeler)
- **Issues**: [Report a bug](https://github.com/TristanEDU/studybuddies_financial_modeler/issues)

---

<div align="center">

**Built with ❤️ for financial analysts, startups, and data-driven decision makers**

[Get Started](#-getting-started) • [Features](#-key-features) • [Documentation](#-table-of-contents) • [Contribute](#-contributing)

</div>
