# Financial Modeling Hub - Visual Architecture Diagrams

## 1. Component Hierarchy (Tree View)

```
FinancialModelingHub
├── Header
│   ├── Logo
│   ├── Navigation
│   └── User Menu
│
├── Page Header
│   ├── Title & Description
│   └── Action Buttons
│       ├── AI Analysis Button
│       ├── Refresh Data Button
│       └── Save Scenario Button
│
├── AI Analysis Modal (conditional)
│   ├── Modal Header (with close button)
│   ├── Loading State (with progress bar)
│   └── Results Display
│       ├── Key Insights Section
│       ├── Recommendations Section
│       └── Action Buttons
│
├── MetricsStrip
│   ├── Breakeven Metric Card
│   ├── Monthly Burn Rate Card
│   ├── Profitability Card
│   ├── CAC/LTV Card
│   ├── MRR Card
│   └── Churn Rate Card
│
├── CostInputPanel
│   ├── Panel Header
│   │   ├── Title & Description
│   │   └── Controls
│   │       ├── Currency Dropdown
│   │       ├── Period Dropdown
│   │       └── Add Category Button
│   │
│   ├── Category Library (optional)
│   │   └── Standard Category Cards
│   │       ├── Personnel Card
│   │       ├── Operations Card
│   │       ├── Marketing Card
│   │       └── Technology Card
│   │
│   ├── Add Category Modal (conditional)
│   │   ├── Category Name Input
│   │   ├── Category Type Select
│   │   └── Create/Cancel Buttons
│   │
│   ├── Custom Amount Modal (conditional)
│   │   ├── Amount Input
│   │   ├── Quick Amount Buttons
│   │   └── Set/Cancel Buttons
│   │
│   ├── Add Item Modal (conditional)
│   │   ├── Item Name Input
│   │   ├── Initial Cost Input
│   │   ├── Quantity Input
│   │   └── Add/Cancel Buttons
│   │
│   └── Active Categories List
│       └── Category Section (for each category)
│           ├── Category Header (expandable)
│           │   ├── Icon & Title
│           │   ├── Item Count
│           │   ├── Expand/Collapse Icon
│           │   └── Remove Category Button
│           │
│           └── Category Content (when expanded)
│               ├── Cost Items Grid
│               │   └── Cost Item Card (for each item)
│               │       ├── Item Label
│               │       ├── Quantity Controls
│               │       │   ├── Decrease Button
│               │       │   ├── Quantity Input
│               │       │   └── Increase Button
│               │       ├── Value Slider
│               │       │   ├── Slider Input
│               │       │   ├── Current Value Display
│               │       │   └── Min/Max Labels
│               │       └── Item Actions
│               │           ├── Custom Amount Button
│               │           └── Remove Item Button
│               │
│               └── Add Item Section
│                   ├── Add Custom Item Button
│                   └── Template Suggestions (optional)
│
├── ScenarioControls
│   ├── Section Header
│   │   └── New Scenario Button
│   │
│   ├── Active Scenario Info
│   │   ├── Scenario Name
│   │   ├── Scenario Description
│   │   └── Last Updated Time
│   │
│   ├── Create New Scenario Form (conditional)
│   │   ├── Scenario Name Input
│   │   └── Create/Cancel Buttons
│   │
│   ├── Scenario Selector
│   │   └── Dropdown (all scenarios)
│   │
│   ├── Scenario Actions
│   │   ├── Save Current Button
│   │   └── Reload Button
│   │
│   ├── Data Management
│   │   ├── Export Controls
│   │   │   ├── Format Select
│   │   │   └── Export Button
│   │   └── Import Controls
│   │       └── Import CSV/JSON Button
│   │
│   └── Scenario History
│       └── Recent Scenario List
│           └── Scenario Item (for each)
│               ├── Scenario Name
│               ├── Created Date
│               ├── Active Indicator
│               └── Delete Button
│
├── BreakevenChart
│   ├── Chart Header
│   │   ├── Title & Icon
│   │   └── Legend
│   │
│   ├── Breakeven Metrics Grid
│   │   ├── Breakeven Point Card
│   │   ├── Monthly Revenue Card
│   │   └── Monthly Costs Card
│   │
│   ├── Line Chart
│   │   ├── X-Axis (Members)
│   │   ├── Y-Axis (Currency)
│   │   ├── Revenue Line (green)
│   │   ├── Costs Line (red)
│   │   ├── Breakeven Reference Line
│   │   └── Tooltip (on hover)
│   │
│   └── Pricing Scenarios Section
│       ├── Section Header
│       │   └── Edit Tiers Button
│       │
│       ├── Pricing Tier Cards
│       │   └── Pricing Card (for each tier)
│       │       ├── Tier Name
│       │       ├── Price Display
│       │       ├── Billing Period
│       │       ├── Breakeven Members
│       │       ├── Selected Indicator
│       │       └── Active Bar
│       │
│       └── Pricing Impact Summary
│           ├── Current Plan
│           ├── Monthly Price
│           └── Breakeven
│
├── RevenueProjections
│   ├── Chart Header
│   ├── Projection Metrics
│   └── Revenue Chart
│
├── CostBreakdownChart
│   ├── Chart Header
│   ├── Cost Category Breakdown
│   └── Monthly Trend Chart
│
├── Quick Actions Panel
│   ├── Panel Header
│   └── Action Buttons Grid
│       ├── Test Premium Pricing
│       ├── Reduce Marketing 20%
│       ├── Add Employee
│       └── Reset Data
│
├── Financial Insights Section
│   ├── Section Header
│   └── Insights Grid
│       ├── Strengths Card
│       ├── Areas to Monitor Card
│       └── Next Steps Card
│
└── Modals & Dialogs
    ├── ImportDialog (conditional)
    │   ├── File Upload Area
    │   ├── Field Mapping
    │   └── Import Strategy Selection
    │
    └── PricingTierEditor (conditional)
        ├── Tier List Editor
        ├── Add Tier Button
        └── Save/Cancel Buttons
```

## 2. State Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTIONS                             │
└─────────────────────────────────────────────────────────────────┘
         │                    │                    │
         │                    │                    │
    Cost Change        Pricing Change      Scenario Switch
         │                    │                    │
         ↓                    ↓                    ↓
┌────────────────┐   ┌────────────────┐   ┌────────────────┐
│ handleCostChange│   │handlePricing   │   │handleScenario  │
│                 │   │ScenarioChange  │   │Change          │
└────────────────┘   └────────────────┘   └────────────────┘
         │                    │                    │
         ↓                    ↓                    ↓
┌────────────────┐   ┌────────────────┐   ┌────────────────┐
│  setCosts()     │   │setActivePricing│   │Load from DB    │
│  (immediate)    │   │  (immediate)   │   │  (async)       │
└────────────────┘   └────────────────┘   └────────────────┘
         │                    │                    │
         ↓                    │                    ↓
┌────────────────┐           │            ┌────────────────┐
│ persistCosts()  │           │            │setCosts()      │
│ (1s debounce)  │←──────────┘            │setActiveScenario│
└────────────────┘                        └────────────────┘
         │                                          │
         ↓                                          │
┌────────────────┐                                │
│ financialService│                                │
│.updateScenario()│                                │
└────────────────┘                                │
         │                                          │
         ↓                                          │
┌────────────────────────────────────────────────┐│
│            SUPABASE DATABASE                    ││
│                                                 ││
│  ┌──────────────────────┐                      ││
│  │financial_scenarios   │                      ││
│  │  - cost_data (JSONB) │                      ││
│  │  - pricing_data      │                      ││
│  └──────────────────────┘                      ││
│           │                                     ││
│           ↓                                     ││
│  ┌──────────────────────┐                      ││
│  │ cost_categories      │                      ││
│  └──────────────────────┘                      ││
│           │                                     ││
│           ↓                                     ││
│  ┌──────────────────────┐                      ││
│  │ cost_items           │                      ││
│  └──────────────────────┘                      ││
└────────────────────────────────────────────────┘│
                                                   │
         ┌─────────────────────────────────────────┘
         │
         ↓
┌────────────────┐
│ [MISSING]      │
│ User Feedback  │
│ - Toast        │
│ - Save Status  │
└────────────────┘
```

## 3. Data Persistence Flow (Detailed)

```
USER EDITS COST VALUE
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ 1. handleCostChange(category, field, value)            │
│    - Validates input                                   │
│    - Parses JSON to deep clone costs object            │
│    - Navigates nested structure                        │
│    - Sets new value                                    │
│    - Calls setCosts(newCosts)                          │
└────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ 2. React State Update                                  │
│    - costs state updated                               │
│    - Component re-renders                              │
│    - UI shows new value immediately                    │
└────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ 3. persistCosts(newCosts) called                       │
│    - Checks if activeScenario.id exists                │
│    - Clears existing timeout timer                     │
│    - Sets new 1-second timeout                         │
└────────────────────────────────────────────────────────┘
         │
         │ ... 1000ms delay ...
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ 4. Timeout Callback Executes                           │
│    - Calls financialService.updateScenario()           │
│    - Passes activeScenario.id                          │
│    - Passes updated cost data                          │
└────────────────────────────────────────────────────────┘
         │
         ↓
┌────────────────────────────────────────────────────────┐
│ 5. financialService.updateScenario()                   │
│    - Gets authenticated user                           │
│    - Validates cost data structure                     │
│    - Updates financial_scenarios table (JSONB)         │
│    - Calls costService.saveCostCategories()            │
└────────────────────────────────────────────────────────┘
         │
         ├─────────────────────────────────────┐
         │                                     │
         ↓                                     ↓
┌──────────────────┐              ┌──────────────────────┐
│ 6a. Update JSONB │              │ 6b. Update Tables    │
│                  │              │                      │
│ UPDATE           │              │ DELETE FROM          │
│ financial_       │              │ cost_categories      │
│ scenarios        │              │ WHERE scenario_id    │
│ SET cost_data =  │              │                      │
│ $validated_data  │              │ DELETE FROM          │
│ WHERE id = $id   │              │ cost_items           │
│                  │              │ WHERE category_id IN │
│                  │              │                      │
│                  │              │ INSERT INTO          │
│                  │              │ cost_categories      │
│                  │              │                      │
│                  │              │ INSERT INTO          │
│                  │              │ cost_items           │
└──────────────────┘              └──────────────────────┘
         │                                     │
         └─────────────────┬───────────────────┘
                           │
                           ↓
                ┌────────────────────┐
                │ 7. Database Updated│
                │                    │
                │ COMMIT;            │
                │                    │
                │ [SUCCESS or ERROR] │
                └────────────────────┘
                           │
                           ↓
                ┌────────────────────┐
                │ 8. [MISSING]       │
                │                    │
                │ User Feedback:     │
                │ - No toast         │
                │ - No save icon     │
                │ - No timestamp     │
                │ - No error message │
                └────────────────────┘

PROBLEMS WITH THIS FLOW:
1. Debounce can lose intermediate changes
2. Scenario switch mid-save = data corruption
3. No user visibility into save status
4. Silent failures in database operations
5. Inefficient delete + re-insert pattern
6. No transaction wrapping both updates
```

## 4. Bug Reproduction Paths

### Bug #1: Pricing Doesn't Update Graph

```
Step 1: User loads page
    ↓
    costs loaded, pricingScenarios loaded, activePricing = 'standard'
    ↓
Step 2: generateBreakevenData() runs
    ↓
    Uses activePricing = 'standard', calculates data for $49/month
    ↓
Step 3: breakevenData passed to BreakevenChart as prop
    ↓
    Chart renders with standard pricing data
    ↓
Step 4: User clicks "Premium" pricing card
    ↓
    onPricingChange('premium') called
    ↓
Step 5: handlePricingScenarioChange('premium')
    ↓
    setActivePricing('premium')  ← State updated
    ↓
Step 6: Component re-renders
    ↓
    generateBreakevenData() runs AGAIN
    ↓
    Uses activePricing = 'premium', calculates data for $99/month
    ↓
    BUT... BreakevenChart doesn't re-render because it's memoized
    ↓
    OR... reference to data prop didn't change
    ↓
RESULT: Chart shows old data, pricing selector shows 'premium' selected

WHY IT FAILS:
- React doesn't detect that breakevenData needs recalculation
- No useMemo with proper dependencies
- BreakevenChart receives same data reference
```

### Bug #2: Scenario Save Doesn't Work

```
Step 1: User clicks "New Scenario" button
    ↓
Step 2: Enters name "Q4 2025 Projections"
    ↓
Step 3: Clicks "Create" button
    ↓
Step 4: handleCreateScenario() in ScenarioControls
    ↓
    Creates object: {
      id: 'scenario_1700000000000',  ← Temporary ID
      name: 'Q4 2025 Projections',
      createdAt: '2025-11-20T...',
      data: { ...currentScenarioData }
    }
    ↓
Step 5: onSaveScenario(newScenario) called
    ↓
Step 6: handleSaveScenario() in FinancialModelingHub
    ↓
    const isNewScenario = scenario?.id?.startsWith('scenario_')
    ↓
    isNewScenario = TRUE  ✓ (Correct!)
    ↓
Step 7: financialService.createScenario() called
    ↓
    Supabase creates record, returns UUID: '550e8400-e29b-41d4-...'
    ↓
Step 8: Scenario added to scenarios array with real UUID
    ↓
Step 9: User edits costs
    ↓
Step 10: User clicks "Save Scenario" button again
    ↓
Step 11: handleSaveScenario(activeScenario)
    ↓
    activeScenario.id = '550e8400-e29b-41d4-...' (UUID)
    ↓
    const isNewScenario = scenario?.id?.startsWith('scenario_')
    ↓
    isNewScenario = FALSE  ✗ (BUG!)
    ↓
    Tries to UPDATE instead of CREATE
    ↓
    BUT scenario might not exist in DB yet
    ↓
RESULT: Save fails or updates wrong scenario

FIX: Check scenarios array instead of ID pattern
```

### Bug #3: Data Lost on Scenario Switch

```
Timeline:
T=0s    User edits cost in Scenario A (id: aaa-111)
        ↓
        handleCostChange() → setCosts() → persistCosts()
        ↓
        Timer set: execute save at T=1s
        ↓
T=0.5s  User clicks Scenario B in dropdown
        ↓
        handleScenarioChange('bbb-222')
        ↓
        Loads Scenario B data
        ↓
        setActiveScenario({ id: 'bbb-222', ... })
        ↓
        setCosts(scenarioBCostData)
        ↓
T=1.0s  Original timer from T=0s fires
        ↓
        financialService.updateScenario(
          activeScenario.id,  ← NOW 'bbb-222' instead of 'aaa-111'!
          scenarioACostData   ← But data is from Scenario A!
        )
        ↓
        Scenario B gets overwritten with Scenario A's data
        ↓
        Scenario A's changes are LOST forever

ROOT CAUSE:
- Timer captures costs state (Scenario A data)
- But uses activeScenario.id from closure
- activeScenario changes before timer fires
- Mismatch between scenario ID and cost data

FIX OPTIONS:
1. Capture scenario ID at time of change
2. Clear timer when switching scenarios
3. Prompt to save before switching
4. Use ref instead of state for scenario ID in timer
```

## 5. Recommended Architecture Improvements

```
CURRENT (Problematic):
User Action → State Update → Debounced Save → Database
                    ↓
              [No feedback]

IMPROVED (With Feedback):
User Action → Optimistic UI Update → Immediate Save Attempt
                    ↓                          ↓
              Show "Saving..."         Database Operation
                    ↓                          ↓
                    ├──────── Success ─────→ Show "Saved ✓"
                    │                          │
                    └──────── Failure ─────→ Show Error, Revert UI
                                              Offer Retry

FUTURE (Offline-First):
User Action → Local State → IndexedDB → Sync Queue
                    ↓            ↓            ↓
              Instant UI    Persisted   Background Sync
              Update        Locally      to Database
                                              ↓
                                         Update Timestamp
                                         Clear Queue
```

## 6. Component Communication Map

```
┌──────────────────────────────────────────────────────────┐
│                 FinancialModelingHub                      │
│                                                           │
│  State: costs, scenarios, activePricing, ...             │
│                                                           │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │ CostInputPanel │  │ScenarioControls│                 │
│  │                │  │                │                 │
│  │ Receives:      │  │ Receives:      │                 │
│  │  • costs       │  │  • scenarios   │                 │
│  │                │  │  • activeScen  │                 │
│  │ Sends:         │  │                │                 │
│  │  • onCostChange│  │ Sends:         │                 │
│  │  • onRemoveItem│  │  • onSave      │                 │
│  │  • onAddCat    │  │  • onLoad      │                 │
│  └────────┬───────┘  └────────┬───────┘                 │
│           │                    │                          │
│           ↓                    ↓                          │
│     handleCostChange    handleSaveScenario               │
│           │                    │                          │
│           ↓                    ↓                          │
│       setCosts          financialService                  │
│           │                    │                          │
│           ↓                    ↓                          │
│     persistCosts           Database                       │
│           │                                               │
│           ↓                                               │
│     financialService                                      │
│           │                                               │
│           ↓                                               │
│       Database                                            │
│                                                           │
│  ┌────────────────┐  ┌────────────────┐                 │
│  │BreakevenChart  │  │RevenueProj     │                 │
│  │                │  │                │                 │
│  │ Receives:      │  │ Receives:      │                 │
│  │  • data        │  │  • projData    │                 │
│  │  • breakeven   │  │  • tiers       │                 │
│  │  • pricing     │  │                │                 │
│  │                │  │ Sends:         │                 │
│  │ Sends:         │  │  (none)        │                 │
│  │  • onPriceChg  │  │                │                 │
│  └────────┬───────┘  └────────────────┘                 │
│           │                                               │
│           ↓                                               │
│  handlePricingScenarioChange                             │
│           │                                               │
│           ↓                                               │
│    setActivePricing                                      │
│           │                                               │
│           └──→ [Should trigger recalc but doesn't]      │
│                                                           │
└──────────────────────────────────────────────────────────┘

DATA FLOW DIRECTIONS:
→  Props passed down
←  Events/callbacks passed up
↕  Two-way binding (anti-pattern, not used)
```

---

**Document Version:** 1.0  
**Created:** November 20, 2025  
**Purpose:** Visual reference for development team  
**Related Docs:** FINANCIAL_MODELING_HUB_AUDIT.md, FINANCIAL_MODELING_HUB_QUICK_REF.md
