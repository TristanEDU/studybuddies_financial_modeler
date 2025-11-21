# Financial Modeling Hub - Quick Reference Guide

## Component Responsibilities

### FinancialModelingHub (Main Container)

- **State:** costs, scenarios, activeScenario, pricingScenarios, activePricing, aiInsights
- **Key Functions:**
  - `persistCosts()` - Auto-save with 1s debounce
  - `handleCostChange()` - Update cost values
  - `handlePricingScenarioChange()` - Switch pricing tiers
  - `handleScenarioChange()` - Load different scenario
  - `handleSaveScenario()` - Save current scenario
  - `loadScenarios()` - Load all user scenarios
  - `generateAIInsights()` - Trigger AI analysis

### CostInputPanel

- **Props:** costs, onCostChange, onRemoveItem, onAddCategory, standardCategories
- **Features:**
  - Category expansion/collapse
  - Cost sliders with quantity controls
  - Custom amount entry modal
  - Add/remove items and categories
  - Currency and period selection

### BreakevenChart

- **Props:** data, breakeven, pricingScenarios, activePricing, onPricingChange
- **Features:**
  - Visual breakeven line chart
  - Pricing tier selector
  - Breakeven metrics display
  - Revenue vs cost comparison

### ScenarioControls

- **Props:** scenarios, activeScenario, onScenarioChange, onSaveScenario
- **Features:**
  - Create new scenario
  - Load existing scenario
  - Save current scenario
  - Import/export data
  - Scenario history

## Data Flow Diagram

```
User Interaction
    ↓
Component Event Handler (onClick, onChange)
    ↓
State Update (setCosts, setActivePricing, etc.)
    ↓
Debounced Persistence (persistCosts - 1000ms)
    ↓
financialService.updateScenario()
    ↓
Supabase Database
    ↓
[MISSING] User Feedback (toast/notification)
```

## Database Tables

### financial_scenarios

- **Primary:** Stores scenario metadata and JSONB cost data
- **Columns:** id, user_id, name, description, cost_data, pricing_data
- **Indexed:** user_id, status

### cost_categories

- **Purpose:** Normalized category structure (duplicates JSONB)
- **Columns:** id, user_id, scenario_id, category_name, category_type
- **Types:** personnel, operations, marketing, technology, custom

### cost_items

- **Purpose:** Individual cost line items
- **Columns:** id, category_id, user_id, item_name, value, metadata
- **Metadata:** count, hours, benefits, type, label

## Common Tasks

### Add a New Standard Category

1. Add to `STANDARD_CATEGORY_CONFIGS` (line 57)
2. Add to `createDefaultCostStructure()` (line 99)
3. Update `calculateTotalCosts()` to include new category (line 373)

### Change Debounce Timing

- **Location:** `persistCosts()` - Line 151
- **Current:** 1000ms (1 second)
- **Recommended:** 500ms for better UX

### Add New Metric

1. Add calculation in `generateMetrics()` (line 471)
2. Add display in MetricsStrip component

### Modify Save Behavior

- **Auto-save:** `persistCosts()` - Line 142
- **Manual save:** `handleSaveScenario()` - Line 905

## Critical Issues & Fixes

### Issue #1: Pricing Changes Don't Update Graph

**Location:** handlePricingScenarioChange() - Line 835  
**Fix:** Add useMemo to breakevenData and force re-render

### Issue #2: Scenarios Don't Save Properly

**Location:** handleSaveScenario() - Line 905  
**Fix:** Check scenarios array instead of ID pattern

### Issue #3: Data Lost on Scenario Switch

**Location:** persistCosts() + handleScenarioChange()  
**Fix:** Clear timer and prompt for unsaved changes

### Issue #4: Remove Item Race Condition

**Location:** quickActionOperations.removeItem - Line 241  
**Fix:** Await database delete before state update

### Issue #5: Quantity Inconsistency

**Location:** calculateTotalCosts() - Line 373  
**Fix:** Standardize on single quantity field

## API Reference

### financialService

```javascript
// Create new scenario
await financialService.createScenario({
	name: "My Scenario",
	description: "Description",
	costData: costs,
	pricingData: { activePricing, tiers },
});

// Update existing scenario
await financialService.updateScenario(scenarioId, {
	costData: updatedCosts,
	pricingData: { activePricing },
});

// Load scenario with full cost data
const scenario = await financialService.getScenarioWithCostData(scenarioId);

// Get all scenarios
const scenarios = await financialService.getScenarios();

// Delete scenario
await financialService.deleteScenario(scenarioId);
```

### costService

```javascript
// Save cost categories and items
await costService.saveCostCategories(scenarioId, costData);

// Get cost data for scenario
const costData = await costService.getCostDataForScenario(scenarioId);

// Remove specific cost item
await costService.removeCostItem(scenarioId, categoryKey, itemKey);
```

## Testing Checklist

- [ ] Change cost value → wait 2s → refresh → value persisted
- [ ] Click pricing tier → graph updates immediately
- [ ] Edit in Scenario A → switch to B → switch back → change preserved
- [ ] Add item → remove item → refresh → item gone
- [ ] Create new scenario → save → refresh → scenario exists
- [ ] Import CSV → data loads correctly
- [ ] Generate AI insights → modal displays results
- [ ] Rapid slider changes → only final value saved

## Performance Tips

1. **Memoize expensive calculations:**

   ```javascript
   const breakevenData = useMemo(
   	() => generateBreakevenData(),
   	[costs, pricingScenarios, activePricing]
   );
   ```

2. **Debounce user inputs:**

   - Already implemented: 300ms in CostInputPanel
   - Already implemented: 1000ms in persistCosts

3. **Lazy load scenarios:**

   - Currently loads all scenarios on mount
   - Consider pagination for 50+ scenarios

4. **Cache AI results:**
   - Currently re-analyzes on every request
   - Consider caching by cost structure hash

## File Locations

```
src/
├── pages/
│   └── financial-modeling-hub/
│       ├── index.jsx (Main container - 1487 lines)
│       └── components/
│           ├── CostInputPanel.jsx (1324 lines)
│           ├── BreakevenChart.jsx (257 lines)
│           ├── ScenarioControls.jsx (292 lines)
│           ├── MetricsStrip.jsx
│           ├── RevenueProjections.jsx
│           └── CostBreakdownChart.jsx
├── services/
│   ├── financialService.js (409 lines)
│   ├── costService.js (486 lines)
│   └── aiAnalysisService.js
└── lib/
    └── supabase.js

supabase/
└── migrations/
    └── 20241119000933_financial_modeling_with_auth.sql (214 lines)
```

## Environment Variables

```bash
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_key (for AI analysis)
```

## Quick Commands

```bash
# Development
npm run dev

# Build
npm run build

# Test build locally
npm run preview

# Database migrations
npx supabase migration new migration_name
npx supabase db reset  # Reset to latest migration
```

## Support & Resources

- **Main Audit Document:** FINANCIAL_MODELING_HUB_AUDIT.md
- **Architecture Docs:** See Section 1 of audit
- **Bug Reports:** See Section 4 of audit
- **API Reference:** See Section 9 of audit
