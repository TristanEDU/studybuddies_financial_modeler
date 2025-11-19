import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { financialService } from '../../services/financialService';
import Header from '../../components/ui/Header';
import CostInputPanel from './components/CostInputPanel';
import BreakevenChart from './components/BreakevenChart';
import MetricsStrip from './components/MetricsStrip';
import CostBreakdownChart from './components/CostBreakdownChart';
import RevenueProjections from './components/RevenueProjections';
import ScenarioControls from './components/ScenarioControls';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { generateFinancialAnalysis } from '../../services/aiAnalysisService';

const personnelItems = [
  { value: 'employees.roles.ceo', label: 'CEO', defaultValue: 25000, minValue: 0, maxValue: 100000, step: 1000 },
  { value: 'employees.roles.cto', label: 'CTO', defaultValue: 20000, minValue: 0, maxValue: 80000, step: 1000 },
  { value: 'employees.roles.senior-dev', label: 'Senior Developer', defaultValue: 12000, minValue: 0, maxValue: 30000, step: 500 },
  { value: 'employees.roles.mid-dev', label: 'Mid-level Developer', defaultValue: 8000, minValue: 0, maxValue: 18000, step: 500 },
  { value: 'employees.roles.junior-dev', label: 'Junior Developer', defaultValue: 5000, minValue: 0, maxValue: 12000, step: 250 },
  { value: 'employees.roles.designer', label: 'UI/UX Designer', defaultValue: 7000, minValue: 0, maxValue: 15000, step: 500 },
  { value: 'employees.roles.product-manager', label: 'Product Manager', defaultValue: 11000, minValue: 0, maxValue: 25000, step: 500 },
  { value: 'employees.roles.qa-engineer', label: 'QA Engineer', defaultValue: 6000, minValue: 0, maxValue: 16000, step: 250 }
];

const operationsItems = [
  { value: 'items.rent', label: 'Office Rent', defaultValue: 8000, minValue: 0, maxValue: 25000, step: 500 },
  { value: 'items.utilities', label: 'Utilities', defaultValue: 1200, minValue: 0, maxValue: 5000, step: 100 },
  { value: 'items.insurance', label: 'Insurance', defaultValue: 800, minValue: 0, maxValue: 3000, step: 100 },
  { value: 'items.cleaning', label: 'Cleaning Services', defaultValue: 600, minValue: 0, maxValue: 2000, step: 100 },
  { value: 'items.security', label: 'Security', defaultValue: 1000, minValue: 0, maxValue: 3000, step: 100 },
  { value: 'items.maintenance', label: 'Maintenance', defaultValue: 800, minValue: 0, maxValue: 2500, step: 100 }
];

const marketingItems = [
  { value: 'items.digital-ads', label: 'Digital Advertising', defaultValue: 15000, minValue: 0, maxValue: 100000, step: 1000 },
  { value: 'items.content', label: 'Content Marketing', defaultValue: 5000, minValue: 0, maxValue: 25000, step: 500 },
  { value: 'items.seo', label: 'SEO Services', defaultValue: 3000, minValue: 0, maxValue: 15000, step: 500 },
  { value: 'items.social-media', label: 'Social Media Management', defaultValue: 2500, minValue: 0, maxValue: 10000, step: 250 },
  { value: 'items.events', label: 'Events & Conferences', defaultValue: 8000, minValue: 0, maxValue: 50000, step: 1000 },
  { value: 'items.pr', label: 'Public Relations', defaultValue: 4000, minValue: 0, maxValue: 15000, step: 500 }
];

const technologyItems = [
  { value: 'items.software', label: 'Software Licenses', defaultValue: 2500, minValue: 0, maxValue: 15000, step: 250 },
  { value: 'items.infrastructure', label: 'Cloud Infrastructure', defaultValue: 3500, minValue: 0, maxValue: 20000, step: 500 },
  { value: 'items.tools', label: 'Development Tools', defaultValue: 1500, minValue: 0, maxValue: 8000, step: 200 },
  { value: 'items.security', label: 'Security Tools', defaultValue: 1200, minValue: 0, maxValue: 5000, step: 200 },
  { value: 'items.analytics', label: 'Analytics & Monitoring', defaultValue: 800, minValue: 0, maxValue: 3000, step: 100 },
  { value: 'items.backup', label: 'Backup & Recovery', defaultValue: 600, minValue: 0, maxValue: 2000, step: 100 }
];

export const STANDARD_CATEGORY_CONFIGS = {
  personnel: {
    key: 'personnel',
    label: 'Personnel',
    title: 'Personnel Costs',
    description: 'Team salaries, roles, and contractors',
    iconName: 'Users',
    defaultItems: personnelItems,
    createInitialData: () => ({
      employees: { roles: {} },
      contractors: { enabled: false, types: {} }
    })
  },
  operations: {
    key: 'operations',
    label: 'Operations',
    title: 'Operations & Facilities',
    description: 'Office, facilities, and operational expenses',
    iconName: 'Building',
    defaultItems: operationsItems,
    createInitialData: () => ({ items: {} })
  },
  marketing: {
    key: 'marketing',
    label: 'Marketing',
    title: 'Marketing & Sales',
    description: 'Acquisition, content, and growth programs',
    iconName: 'Megaphone',
    defaultItems: marketingItems,
    createInitialData: () => ({ items: {} })
  },
  technology: {
    key: 'technology',
    label: 'Technology',
    title: 'Technology & Infrastructure',
    description: 'Software, infrastructure, and tooling',
    iconName: 'Server',
    defaultItems: technologyItems,
    createInitialData: () => ({ items: {} })
  }
};

const createDefaultCostStructure = () => ({
  customCategories: {}
});

const FinancialModelingHub = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Initialize with empty structure; user activates categories explicitly
  const [costs, setCosts] = useState(() => createDefaultCostStructure());

  const [pricingScenarios] = useState([
    { id: 'basic', name: 'Basic', price: 29, breakeven: 245 },
    { id: 'standard', name: 'Standard', price: 49, breakeven: 147 },
    { id: 'premium', name: 'Premium', price: 99, breakeven: 73 },
    { id: 'enterprise', name: 'Enterprise', price: 199, breakeven: 36 }
  ]);

  const [activePricing, setActivePricing] = useState('standard');
  const [scenarios, setScenarios] = useState([]);
  const [activeScenario, setActiveScenario] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStartTime, setAnalysisStartTime] = useState(null);

  // Global dropdown management state (Fix for bugs #2-#6)
  const [openDropdown, setOpenDropdown] = useState(null);

  // Add this block - AI Modal state declarations moved before usage
  const [showAiModal, setShowAiModal] = useState(false);

  // Global dropdown manager function (Fix for bugs #2-#6)
  const closeAllDropdowns = useCallback(() => {
    setOpenDropdown(null);
  }, []);

  // Remove duplicate openDropdown function declaration
  const handleOpenDropdown = useCallback((dropdownId) => {
    setOpenDropdown(dropdownId);
  }, []);

  // Add this block - AI Modal close handler moved before usage
  const closeAiModal = useCallback(() => {
    setShowAiModal(false);
    setIsAnalyzing(false);
    setAnalysisProgress(0);
    setAiInsights(null);
  }, []);

  // Add this block - Quick Action Operations definitions before usage
  const quickActionOperations = {
    reduceMarketing20: () => {
      setCosts(prev => {
        const newCosts = JSON.parse(JSON.stringify(prev));
        
        if (newCosts?.marketing?.items && typeof newCosts?.marketing?.items === 'object') {
          Object.keys(newCosts?.marketing?.items)?.forEach(key => {
            const item = newCosts?.marketing?.items?.[key];
            if (item && typeof item === 'object' && item?.enabled && item?.value) {
              newCosts.marketing.items[key].value = Math.round(Number(item?.value) * 0.8);
            }
          });
        }
        return newCosts;
      });
    },
    
    addEmployee: () => {
      setCosts(prev => {
        const newCosts = JSON.parse(JSON.stringify(prev));
        const employeeId = `employee_${Date.now()}`;
        
        // Ensure proper structure exists
        if (!newCosts?.personnel || typeof newCosts?.personnel !== 'object') {
          newCosts.personnel = { employees: { roles: {} }, contractors: { enabled: false, types: {} } };
        }
        if (!newCosts?.personnel?.employees || typeof newCosts?.personnel?.employees !== 'object') {
          newCosts.personnel.employees = { roles: {} };
        }
        if (!newCosts?.personnel?.employees?.roles || typeof newCosts?.personnel?.employees?.roles !== 'object') {
          newCosts.personnel.employees.roles = {};
        }
        
        newCosts.personnel.employees.roles[employeeId] = {
          name: 'New Employee',
          value: 5000,
          minValue: 0,
          maxValue: 15000,
          step: 500,
          enabled: true,
          count: 1
        };
        
        return newCosts;
      });
    },

    // ADDED: Remove item functionality
    removeItem: (categoryKey, fieldPath) => {
      setCosts(prev => {
        const newCosts = JSON.parse(JSON.stringify(prev));
        const rootCategory = categoryKey?.split('.')?.[0];
        const normalizeFullPath = () => {
          if (!categoryKey) return '';
          if (!fieldPath) return categoryKey;
          if (fieldPath?.includes('.')) {
            return [categoryKey, fieldPath].filter(Boolean).join('.');
          }
          if (rootCategory === 'personnel') {
            return `${categoryKey}.employees.roles.${fieldPath}`;
          }
          return `${categoryKey}.items.${fieldPath}`;
        };

        const deleteByPath = (path) => {
          if (!path) return;
          const keys = path?.split('.');
          let current = newCosts;
          for (let i = 0; i < keys?.length - 1; i++) {
            const key = keys[i];
            if (!current?.[key] || typeof current?.[key] !== 'object') {
              return;
            }
            current = current?.[key];
          }
          const finalKey = keys?.[keys?.length - 1];
          if (current && typeof current === 'object') {
            delete current?.[finalKey];
          }
        };

        const fullPath = normalizeFullPath();
        deleteByPath(fullPath);

        if (fullPath && rootCategory !== 'personnel') {
          deleteByPath(`${fullPath}_quantity`);
        }
        
        return newCosts;
      });
    },

    // ADDED: Add category functionality
    addCategory: (categoryName, categoryType = 'custom') => {
      const sanitizedName = categoryName?.toLowerCase()?.replace(/[^a-z0-9]/g, '_');
      
      setCosts(prev => {
        const newCosts = JSON.parse(JSON.stringify(prev));
        
        if (!newCosts?.customCategories || typeof newCosts?.customCategories !== 'object') {
          newCosts.customCategories = {};
        }
        
        newCosts.customCategories[sanitizedName] = {
          name: categoryName,
          type: categoryType,
          enabled: true,
          items: {}
        };
        
        return newCosts;
      });
    }
  };

  const handleAddStandardCategory = useCallback((categoryKey) => {
    const template = STANDARD_CATEGORY_CONFIGS?.[categoryKey];
    if (!template) return;
    
    setCosts(prev => {
      const base = prev && typeof prev === 'object' ? prev : {};
      if (base?.[categoryKey]) return base;
      const newCosts = JSON.parse(JSON.stringify(base));
      newCosts[categoryKey] = template?.createInitialData ? template.createInitialData() : { items: {} };
      if (!newCosts?.customCategories || typeof newCosts?.customCategories !== 'object') {
        newCosts.customCategories = base?.customCategories || {};
      }
      return newCosts;
    });
  }, []);

  const handleRemoveCategory = useCallback((categoryPath) => {
    if (!categoryPath) return;
    
    setCosts(prev => {
      const base = prev && typeof prev === 'object' ? prev : {};
      const newCosts = JSON.parse(JSON.stringify(base));
      const keys = categoryPath?.split('.');
      if (!keys || keys?.length === 0) {
        return prev;
      }

      let current = newCosts;
      for (let i = 0; i < keys?.length - 1; i++) {
        const key = keys[i];
        if (!current?.[key] || typeof current?.[key] !== 'object') {
          return prev;
        }
        current = current?.[key];
      }

      const finalKey = keys?.[keys?.length - 1];
      if (current && typeof current === 'object') {
        delete current[finalKey];
      }

      if (!newCosts?.customCategories || typeof newCosts?.customCategories !== 'object') {
        newCosts.customCategories = {};
      }

      return newCosts;
    });
  }, []);

  // ENHANCED: Cost calculation with proper structure handling
  const calculateTotalCosts = useCallback(() => {
    let totalCosts = 0;

    try {
      // Personnel costs - with structure validation
      if (costs?.personnel?.employees?.roles && typeof costs?.personnel?.employees?.roles === 'object') {
        Object.values(costs?.personnel?.employees?.roles)?.forEach(role => {
          if (role && typeof role === 'object' && role?.enabled && role?.value) {
            totalCosts += Number(role?.value) * Number(role?.count || 1);
          }
        });
      }

      if (costs?.personnel?.contractors?.enabled && costs?.personnel?.contractors?.types && 
          typeof costs?.personnel?.contractors?.types === 'object') {
        Object.values(costs?.personnel?.contractors?.types)?.forEach(contractor => {
          if (contractor && typeof contractor === 'object' && contractor?.enabled && contractor?.value) {
            totalCosts += Number(contractor?.value) * Number(contractor?.hours || 160);
          }
        });
      }

      // Category items - with structure validation
      ['operations', 'marketing', 'technology']?.forEach(category => {
        if (costs?.[category]?.items && typeof costs?.[category]?.items === 'object') {
          Object.values(costs?.[category]?.items)?.forEach(item => {
            if (item && typeof item === 'object' && item?.enabled && item?.value) {
              totalCosts += Number(item?.value);
            }
          });
        }
      });

      // Custom categories - with structure validation
      if (costs?.customCategories && typeof costs?.customCategories === 'object') {
        Object.values(costs?.customCategories)?.forEach(category => {
          if (category && typeof category === 'object' && category?.enabled && category?.items && 
              typeof category?.items === 'object') {
            Object.values(category?.items)?.forEach(item => {
              if (item && typeof item === 'object' && item?.enabled && item?.value) {
                totalCosts += Number(item?.value);
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('Error calculating costs:', error);
      return 0;
    }

    return totalCosts;
  }, [costs]);

  // Generate breakeven analysis data
  const generateBreakevenData = useCallback(() => {
    let totalCosts = calculateTotalCosts();
    const currentPricing = pricingScenarios?.find(p => p?.id === activePricing);
    const pricePerMember = currentPricing?.price || 49;
    
    const data = [];
    for (let members = 0; members <= 500; members += 25) {
      const revenue = members * pricePerMember;
      const variableCosts = members * 5; // $5 per member variable cost
      const totalMonthlyCosts = totalCosts + variableCosts;
      
      data?.push({
        members,
        revenue,
        costs: totalMonthlyCosts
      });
    }

    const breakevenMembers = Math.ceil(totalCosts / (pricePerMember - 5));
    const breakevenRevenue = breakevenMembers * pricePerMember;

    return {
      data,
      breakeven: {
        members: breakevenMembers,
        revenue: breakevenRevenue,
        costs: totalCosts
      }
    };
  }, [calculateTotalCosts, pricingScenarios, activePricing]);

  // Generate metrics data
  const generateMetrics = useCallback(() => {
    let totalCosts = calculateTotalCosts();
    const currentPricing = pricingScenarios?.find(p => p?.id === activePricing);
    const pricePerMember = currentPricing?.price || 49;
    const breakevenMembers = Math.ceil(totalCosts / (pricePerMember - 5));
    
    return {
      breakevenMembers,
      breakevenRevenue: breakevenMembers * pricePerMember,
      breakevenChange: -2.3,
      monthlyBurnRate: totalCosts,
      runwayMonths: 18,
      burnRateChange: 5.2,
      profitabilityThreshold: totalCosts * 1.2,
      profitMargin: 15.8,
      profitabilityChange: 1.7,
      cac: 125,
      ltv: 450,
      ltvCacRatio: 3.6,
      cacChange: -8.1,
      mrr: breakevenMembers * pricePerMember * 0.8,
      mrrGrowth: 12.4,
      mrrChange: 12.4,
      churnRate: 4.2,
      retentionRate: 95.8,
      churnChange: -0.8
    };
  }, [calculateTotalCosts, pricingScenarios, activePricing]);

  // Global event listeners for dropdown management (Fix for bugs #3-#5)
  useEffect(() => {
    const handleScroll = () => {
      closeAllDropdowns();
    };

    const handleClickOutside = (event) => {
      // Check if click is outside any dropdown
      const dropdownElements = document.querySelectorAll('[data-dropdown]');
      let clickedInsideDropdown = false;
      
      dropdownElements?.forEach(element => {
        if (element?.contains(event?.target)) {
          clickedInsideDropdown = true;
        }
      });

      if (!clickedInsideDropdown) {
        closeAllDropdowns();
      }
    };

    const handleKeyDown = (event) => {
      if (event?.key === 'Escape') {
        if (showAiModal) {
          closeAiModal();
        } else {
          closeAllDropdowns();
        }
      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll);
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeAllDropdowns, showAiModal, closeAiModal]);

  // Check authentication
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/signin');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // FIXED: Enhanced scenario loading with proper data structure validation
  const loadScenarios = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userScenarios = await financialService?.getScenarios();
      
      if (userScenarios?.length > 0) {
        setScenarios(userScenarios);
        
        // Load the first scenario with detailed cost data
        const detailedScenario = await financialService?.getScenarioWithCostData(userScenarios?.[0]?.id);
        setActiveScenario(detailedScenario);
        
        // ENHANCED: Validate and structure cost data properly
        if (detailedScenario?.costData) {
          const validatedCostData = validateAndStructureCostData(detailedScenario?.costData);
          setCosts(validatedCostData);
        }
      } else {
        // Create default scenario with properly structured data
        const defaultScenario = {
          name: 'My First Scenario',
          description: 'Default financial model to get started',
          costData: createDefaultCostStructure(),
          pricingData: { activePricing: 'standard' }
        };

        const newScenario = await financialService?.createScenario(defaultScenario);
        setScenarios([newScenario]);
        setActiveScenario(newScenario);
        setCosts(newScenario?.costData);
      }
    } catch (err) {
      setError('Failed to load financial scenarios. Please try again.');
      console.error('Error loading scenarios:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ADDED: Helper function to validate and structure cost data
  const validateAndStructureCostData = (rawCostData) => {
    if (!rawCostData || typeof rawCostData !== 'object') {
      return createDefaultCostStructure();
    }

    const structuredData = {};
    
    Object.entries(rawCostData)?.forEach(([categoryKey, categoryData]) => {
      if (!categoryData || typeof categoryData !== 'object') return;
      
      if (categoryKey === 'customCategories') {
        structuredData.customCategories = {};
        Object.entries(categoryData)?.forEach(([customKey, customValue]) => {
          if (customValue && typeof customValue === 'object') {
            structuredData.customCategories[customKey] = {
              name: customValue?.name || customKey,
              type: customValue?.type || 'custom',
              enabled: customValue?.enabled ?? true,
              items: { ...(customValue?.items || {}) }
            };
          }
        });
      } else {
        structuredData[categoryKey] = JSON.parse(JSON.stringify(categoryData));
      }
    });

    if (!structuredData?.customCategories) {
      structuredData.customCategories = {};
    }

    return structuredData;
  };

  useEffect(() => {
    if (user) {
      loadScenarios();
    }
  }, [user, loadScenarios]);

  // Enhanced AI analysis with proper progress tracking and modal management (Fix for bugs #1, #14, #15)
  const generateAIInsights = useCallback(async () => {
    setIsAnalyzing(true);
    setShowAiModal(true); // Show modal when starting analysis
    setAnalysisProgress(0);
    setAnalysisStartTime(Date.now());
    
    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const financialData = {
        costs: calculateTotalCosts(),
        metrics: generateMetrics(),
        breakeven: generateBreakevenData(),
        scenario: activeScenario?.name,
        timestamp: new Date()?.toISOString()
      };
      
      const insights = await generateFinancialAnalysis(financialData);
      setAnalysisProgress(100);
      setAiInsights(insights);
      
      // Show completion for at least 500ms, then keep modal open to show results
      setTimeout(() => {
        setIsAnalyzing(false);
        setAnalysisProgress(0);
        clearInterval(progressInterval);
      }, 500);
      
    } catch (error) {
      console.error('Failed to generate AI insights:', error);
      setError('AI analysis failed. Please try again.');
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setShowAiModal(false); // Close modal on error
      clearInterval(progressInterval);
    }
  }, [calculateTotalCosts, generateMetrics, generateBreakevenData, activeScenario]);

  // Enhanced cost breakdown for new structure  
  const generateCostBreakdown = useCallback(() => {
    const breakdown = [];

    // Personnel costs
    let personnelCost = 0;
    if (costs?.personnel?.employees?.roles) {
      Object.values(costs?.personnel?.employees?.roles)?.forEach(role => {
        if (role?.enabled) {
          personnelCost += role?.value * (role?.count || 1);
        }
      });
    }
    if (costs?.personnel?.contractors?.enabled && costs?.personnel?.contractors?.types) {
      Object.values(costs?.personnel?.contractors?.types)?.forEach(contractor => {
        if (contractor?.enabled) {
          personnelCost += contractor?.value * (contractor?.hours || 160);
        }
      });
    }
    if (personnelCost > 0) {
      breakdown?.push({ name: 'Personnel', value: personnelCost, type: 'fixed' });
    }

    // Operations, Marketing, Technology
    ['operations', 'marketing', 'technology']?.forEach(category => {
      let categoryTotal = 0;
      if (costs?.[category]?.items) {
        Object.values(costs?.[category]?.items)?.forEach(item => {
          if (item?.enabled) {
            categoryTotal += item?.value;
          }
        });
      }
      if (categoryTotal > 0) {
        breakdown?.push({ 
          name: category?.charAt(0)?.toUpperCase() + category?.slice(1), 
          value: categoryTotal, 
          type: category === 'marketing' ? 'variable' : 'fixed' 
        });
      }
    });

    // Custom categories
    if (costs?.customCategories) {
      Object.entries(costs?.customCategories)?.forEach(([key, category]) => {
        if (category?.enabled && category?.items) {
          let categoryTotal = 0;
          Object.values(category?.items)?.forEach(item => {
            if (item?.enabled) {
              categoryTotal += item?.value;
            }
          });
          if (categoryTotal > 0) {
            breakdown?.push({ 
              name: category?.name, 
              value: categoryTotal, 
              type: category?.type || 'fixed' 
            });
          }
        }
      });
    }

    return breakdown;
  }, [costs]);

  // Generate revenue projections
  const generateRevenueProjections = useCallback(() => {
    const months = [
      'Jan 2025', 'Feb 2025', 'Mar 2025', 'Apr 2025', 'May 2025', 'Jun 2025',
      'Jul 2025', 'Aug 2025', 'Sep 2025', 'Oct 2025', 'Nov 2025', 'Dec 2025'
    ];

    return months?.map((month, index) => {
      const growth = 1 + (index * 0.08); // 8% monthly growth
      const baseMembers = 150;
      const totalMembers = Math.floor(baseMembers * growth);
      
      const tier1Members = Math.floor(totalMembers * 0.4);
      const tier2Members = Math.floor(totalMembers * 0.35);
      const tier3Members = Math.floor(totalMembers * 0.20);
      const tier4Members = totalMembers - tier1Members - tier2Members - tier3Members;

      const tier1Revenue = tier1Members * 29;
      const tier2Revenue = tier2Members * 49;
      const tier3Revenue = tier3Members * 99;
      const tier4Revenue = tier4Members * 199;

      const mrr = tier1Revenue + tier2Revenue + tier3Revenue + tier4Revenue;
      const oneTimeRevenue = Math.floor(mrr * 0.1); // 10% one-time revenue
      const totalRevenue = mrr + oneTimeRevenue;
      const arpu = totalMembers > 0 ? mrr / totalMembers : 0;

      return {
        month,
        totalMembers,
        mrr,
        totalRevenue,
        oneTimeRevenue,
        arpu,
        tier1Members,
        tier2Members,
        tier3Members,
        tier4Members,
        tier1Revenue,
        tier2Revenue,
        tier3Revenue,
        tier4Revenue
      };
    });
  }, []);

  // Generate monthly cost projections
  const generateMonthlyProjections = useCallback(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const baseCost = calculateTotalCosts();
    
    return months?.map((month, index) => ({
      month,
      totalCosts: baseCost * (1 + index * 0.02) // 2% monthly increase
    }));
  }, [calculateTotalCosts]);

  // Enhanced pricing scenario handler (Fix for bug #7)
  const handlePricingScenarioChange = useCallback((scenarioId) => {
    setActivePricing(scenarioId);
    
    // Trigger recalculation of all dependent metrics
    const newMetrics = generateMetrics();
    const newBreakevenData = generateBreakevenData();
    
    // Update the active scenario with new pricing data
    if (activeScenario) {
      const updatedScenario = {
        ...activeScenario,
        pricingData: { activePricing: scenarioId },
        updated_at: new Date()?.toISOString()
      };
      setActiveScenario(updatedScenario);
    }

    // Show feedback to user
    const currentPricing = pricingScenarios?.find(p => p?.id === scenarioId);
    if (currentPricing) {
      // Brief visual feedback could be added here
      console.log(`Switched to ${currentPricing?.name} pricing: $${currentPricing?.price}/mo`);
    }
  }, [activePricing, generateMetrics, generateBreakevenData, activeScenario, pricingScenarios]);

  // FIXED: Enhanced cost change handler with proper object structure validation
  const handleCostChange = (category, field, value) => {
    const fullPath = [category, field]?.filter(Boolean)?.join('.');
    if (!fullPath) return;
    
    setCosts(prev => {
      // Deep clone to avoid mutation issues
      const newCosts = JSON.parse(JSON.stringify(prev));
      const keys = fullPath?.split('.');
      let current = newCosts;
      
      // Navigate through nested structure, creating objects as needed
      for (let i = 0; i < keys?.length - 1; i++) {
        const key = keys?.[i];
        // CRITICAL FIX: Ensure each level is an object, not boolean
        if (!current?.[key] || typeof current?.[key] !== 'object' || Array.isArray(current?.[key])) {
          current[key] = {};
        }
        current = current?.[key];
      }
      
      const finalKey = keys?.[keys?.length - 1];
      
      // Handle deletion (when value is null)
      if (value === null && current && typeof current === 'object') {
        delete current?.[finalKey];
      } else if (current && typeof current === 'object') {
        // FIXED: Only set value if current is a proper object
        current[finalKey] = value;
      }
      
      return newCosts;
    });

    // Auto-save to Supabase after changes
    if (activeScenario?.id) {
      const timeoutId = setTimeout(async () => {
        try {
          await financialService?.updateScenario(activeScenario?.id, {
            cost_data: costs,
            updated_at: new Date()?.toISOString()
          });
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  };

  // FIXED: Enhanced toggle category with structure validation
  const handleToggleCategory = (path, value) => {
    setCosts(prev => {
      const newCosts = JSON.parse(JSON.stringify(prev));
      const keys = path?.split('.');
      let current = newCosts;
      
      // Navigate and create structure as needed
      for (let i = 0; i < keys?.length - 1; i++) {
        const key = keys?.[i];
        
        // CRITICAL FIX: Ensure proper object structure
        if (!current?.[key] || typeof current?.[key] !== 'object' || Array.isArray(current?.[key])) {
          current[key] = {};
        }
        current = current?.[key];
      }
      
      const finalKey = keys?.[keys?.length - 1];
      
      // Only set if current is proper object
      if (current && typeof current === 'object') {
        current[finalKey] = value;
      }
      
      return newCosts;
    });
  };

  const handleScenarioChange = async (scenarioId) => {
    try {
      const detailedScenario = await financialService?.getScenarioWithCostData(scenarioId);
      if (detailedScenario) {
        setActiveScenario(detailedScenario);
        setCosts(detailedScenario?.costData || {});
      }
    } catch (err) {
      setError('Failed to load scenario details. Please try again.');
      console.error('Error loading scenario:', err);
    }
  };

  const handleSaveScenario = async (scenario) => {
    try {
      setLoading(true);
      if (activeScenario) {
        // ENHANCED: Save with better error handling and cost data persistence
        const updatedScenario = await financialService?.updateScenario(activeScenario?.id, {
          ...scenario,
          name: activeScenario?.name,
          description: activeScenario?.description,
          costData: costs,
          pricingData: { activePricing }
        });
        
        setScenarios(prev => prev?.map(s => s?.id === updatedScenario?.id ? updatedScenario : s));
        setActiveScenario(updatedScenario);
        
        // Show success feedback
        console.log('Scenario saved successfully with cost data');
      } else {
        const newScenario = await financialService?.createScenario({
          ...scenario,
          costData: costs,
          pricingData: { activePricing }
        });
        
        setScenarios(prev => [...prev, newScenario]);
        setActiveScenario(newScenario);
      }
    } catch (err) {
      setError('Failed to save scenario. Please try again.');
      console.error('Error saving scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadScenario = (scenarioId) => {
    handleScenarioChange(scenarioId);
  };

  const handleExportData = (format) => {
    const data = {
      scenario: activeScenario,
      costs,
      metrics: generateMetrics(),
      breakeven: generateBreakevenData(),
      exportedAt: new Date()?.toISOString()
    };
    
    console.log(`Exporting data in ${format} format:`, data);
  };

  const handleImportData = (data) => {
    if (data?.costs) {
      setCosts(data?.costs);
    }
    if (data?.scenario) {
      setActiveScenario(data?.scenario);
    }
  };

  // Update active scenario data when costs change
  useEffect(() => {
    if (activeScenario) {
      setActiveScenario(prev => ({
        ...prev,
        costData: costs,
        updated_at: new Date()?.toISOString()
      }));
    }
  }, [costs, activeScenario?.id]);

  // Show loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <Icon name="Loader2" size={20} className="animate-spin text-primary" />
          <span className="text-muted-foreground">Loading financial models...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <Icon name="AlertCircle" size={48} className="mx-auto text-destructive mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Error Loading Data</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location?.reload()}>
            <Icon name="RefreshCw" size={16} className="mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const breakevenData = generateBreakevenData();
  const metrics = generateMetrics();
  const costBreakdown = generateCostBreakdown();
  const revenueProjections = generateRevenueProjections();
  const monthlyProjections = generateMonthlyProjections();

  const pricingTiers = [
    { id: 'basic', name: 'Basic', price: 29 },
    { id: 'standard', name: 'Standard', price: 49 },
    { id: 'premium', name: 'Premium', price: 99 },
    { id: 'enterprise', name: 'Enterprise', price: 199 }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header closeAllDropdowns={closeAllDropdowns} />
      {/* Single Column Layout Container */}
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
        {/* Page Header with Enhanced AI Analysis Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight">
              Financial Modeling Hub
            </h1>
            <p className="text-muted-foreground mt-1 sm:mt-2 text-sm sm:text-base">
              Interactive financial planning and breakeven analysis
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:space-x-3">
            <Button
              variant="outline"
              iconName="Bot"
              iconSize={16}
              onClick={generateAIInsights}
              disabled={isAnalyzing}
              className="flex-1 sm:flex-none relative overflow-hidden"
            >
              {isAnalyzing ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing... {Math.round(analysisProgress)}%</span>
                </div>
              ) : (
                'AI Analysis'
              )}
              {isAnalyzing && (
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              )}
            </Button>
            <Button
              variant="outline"
              iconName="RefreshCw"
              iconSize={16}
              onClick={() => loadScenarios()}
              className="flex-1 sm:flex-none"
            >
              Refresh Data
            </Button>
            <Button
              variant="default"
              iconName="Save"
              iconSize={16}
              onClick={() => handleSaveScenario(activeScenario)}
              className="flex-1 sm:flex-none"
            >
              Save Scenario
            </Button>
          </div>
        </div>

        {/* Enhanced AI Analysis Modal (Fix for bugs #1, #14, #15) */}
        {showAiModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with click-to-close (Fix for bug #14) */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeAiModal}
            />
            
            {/* Modal Content */}
            <div className="relative bg-background border border-border rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
              {/* Modal Header with Close Button (Fix for bug #14) */}
              <div className="flex items-center justify-between p-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <Icon name="Bot" size={24} className="text-primary" />
                  <h3 className="text-xl font-semibold text-foreground">AI Financial Analysis</h3>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <div className={`w-2 h-2 rounded-full ${isAnalyzing ? 'bg-primary animate-pulse' : 'bg-success'}`}></div>
                    <span>
                      {isAnalyzing 
                        ? `Analyzing... ${analysisStartTime ? Math.round((Date.now() - analysisStartTime) / 1000) : 0}s`
                        : `Completed ${aiInsights ? `- Confidence: ${(aiInsights?.confidence * 100)?.toFixed(1)}%` : ''}`
                      }
                    </span>
                  </div>
                </div>
                
                {/* Close Button (Fix for bug #14) */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeAiModal}
                  className="h-8 w-8 hover:bg-muted"
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
              
              {/* Modal Body */}
              <div className="p-6">
                {/* Show analysis content or loading state */}
                {isAnalyzing ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <h4 className="text-lg font-semibold text-foreground mb-2">Analyzing Your Financial Model</h4>
                    <p className="text-muted-foreground mb-6">Our AI is examining your costs, revenue projections, and market conditions...</p>
                    
                    {/* Progress Bar */}
                    <div className="w-full max-w-md mx-auto bg-muted rounded-full h-3 mb-4">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-500"
                        style={{ width: `${analysisProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{Math.round(analysisProgress)}% Complete</p>
                  </div>
                ) : aiInsights ? (
                  <div className="space-y-6">
                    {/* Key Insights */}
                    <div className="bg-muted/20 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                        <Icon name="Lightbulb" size={20} className="mr-2 text-primary" />
                        Key Insights
                      </h4>
                      <ul className="space-y-3">
                        {aiInsights?.insights?.map((insight, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                            <p className="text-foreground">{insight}</p>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Recommendations */}
                    <div className="bg-muted/20 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                        <Icon name="Target" size={20} className="mr-2 text-success" />
                        Priority Recommendations
                      </h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {aiInsights?.recommendations?.map((rec, index) => (
                          <div key={index} className="bg-background border border-border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-primary uppercase">{rec?.category}</span>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                rec?.priority === 'high' ? 'bg-destructive/20 text-destructive' :
                                rec?.priority === 'medium' ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'
                              }`}>
                                {rec?.priority}
                              </span>
                            </div>
                            <h5 className="font-semibold text-foreground mb-1">{rec?.action}</h5>
                            <p className="text-sm text-muted-foreground">{rec?.impact}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-border">
                      <Button variant="outline" onClick={closeAiModal}>
                        Close
                      </Button>
                      <Button onClick={() => {
                        // Export or save functionality could go here
                        console.log('Exporting AI insights:', aiInsights);
                      }}>
                        <Icon name="Download" size={16} className="mr-2" />
                        Export Report
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Icon name="AlertCircle" size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h4 className="text-lg font-semibold text-foreground mb-2">Analysis Failed</h4>
                    <p className="text-muted-foreground mb-6">We encountered an issue while analyzing your data. Please try again.</p>
                    <div className="flex justify-center space-x-3">
                      <Button variant="outline" onClick={closeAiModal}>
                        Close
                      </Button>
                      <Button onClick={generateAIInsights}>
                        <Icon name="RefreshCw" size={16} className="mr-2" />
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics Strip */}
        <div className="mb-6 sm:mb-8">
          <MetricsStrip metrics={metrics} />
        </div>

        {/* Main Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Enhanced Cost Input Panel with proper cost item configuration (Fix for bug #16) */}
          <div>
            <CostInputPanel
              costs={costs}
              onCostChange={handleCostChange}
              onToggleCategory={handleToggleCategory}
              onRemoveItem={quickActionOperations?.removeItem}
              onAddCategory={quickActionOperations?.addCategory}
              onAddStandardCategory={handleAddStandardCategory}
              onRemoveCategory={handleRemoveCategory}
              standardCategories={STANDARD_CATEGORY_CONFIGS}
              openDropdown={handleOpenDropdown}
              closeAllDropdowns={closeAllDropdowns}
              currentOpenDropdown={openDropdown}
            />
          </div>
          
          {/* Scenario Controls - Full Width */}
          <div>
            <ScenarioControls
              scenarios={scenarios}
              activeScenario={activeScenario}
              onScenarioChange={handleScenarioChange}
              onSaveScenario={handleSaveScenario}
              onLoadScenario={handleLoadScenario}
              onExportData={handleExportData}
              onImportData={handleImportData}
            />
          </div>

          {/* Enhanced Breakeven Chart with working pricing scenarios */}
          <div>
            <BreakevenChart
              data={breakevenData?.data}
              breakeven={breakevenData?.breakeven}
              pricingScenarios={pricingScenarios}
              activePricing={activePricing}
              onPricingChange={handlePricingScenarioChange}
            />
          </div>
          
          {/* Revenue Projections - Full Width */}
          <div>
            <RevenueProjections
              projectionData={revenueProjections}
              pricingTiers={pricingTiers}
              membershipGrowth={12.4}
            />
          </div>

          {/* Cost Breakdown Chart - Full Width */}
          <div>
            <CostBreakdownChart
              costData={costBreakdown}
              monthlyProjections={monthlyProjections}
            />
          </div>

          {/* Enhanced Quick Actions Panel with proper functionality */}
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-4">
              <Icon name="Zap" size={16} className="text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Quick Actions</h4>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                variant="outline"
                fullWidth
                iconName="Calculator"
                iconSize={14}
                onClick={() => handlePricingScenarioChange('premium')}
                className="text-xs"
              >
                Test Premium Pricing
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                iconName="TrendingDown"
                iconSize={14}
                onClick={quickActionOperations?.reduceMarketing20}
                className="text-xs"
              >
                Reduce Marketing 20%
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                iconName="Users"
                iconSize={14}
                onClick={quickActionOperations?.addEmployee}
                className="text-xs"
              >
                Add Employee
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                iconName="RotateCcw"
                iconSize={14}
                onClick={() => {
                  closeAllDropdowns();
                  loadScenarios();
                }}
                className="text-xs"
              >
                Reset Data
              </Button>
            </div>
          </div>
        </div>

        {/* Financial Insights & Recommendations - Full Width */}
        <div className="mt-6 sm:mt-8 bg-card border border-border rounded-lg p-4 sm:p-6">
          <div className="flex items-center space-x-3 mb-4 sm:mb-6">
            <Icon name="Lightbulb" size={20} className="text-primary" />
            <h3 className="text-base sm:text-lg font-semibold text-foreground">Financial Insights & Recommendations</h3>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-success/5 border border-success/20 rounded-lg p-4 min-h-[140px] flex flex-col">
              <div className="flex items-center space-x-2 mb-3">
                <Icon name="CheckCircle" size={16} className="text-success flex-shrink-0" />
                <span className="font-medium text-success">Strengths</span>
              </div>
              <ul className="text-sm text-foreground space-y-2 flex-1">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-success rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Healthy LTV:CAC ratio of {metrics?.ltvCacRatio}:1
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-success rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Reasonable breakeven at {metrics?.breakevenMembers} members
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-success rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Strong retention rate of {metrics?.retentionRate}%
                </li>
              </ul>
            </div>
            
            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4 min-h-[140px] flex flex-col">
              <div className="flex items-center space-x-2 mb-3">
                <Icon name="AlertTriangle" size={16} className="text-warning flex-shrink-0" />
                <span className="font-medium text-warning">Areas to Monitor</span>
              </div>
              <ul className="text-sm text-foreground space-y-2 flex-1">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-warning rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Marketing spend efficiency
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-warning rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Personnel cost scaling
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-warning rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Churn rate optimization
                </li>
              </ul>
            </div>
            
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 min-h-[140px] flex flex-col">
              <div className="flex items-center space-x-2 mb-3">
                <Icon name="Target" size={16} className="text-primary flex-shrink-0" />
                <span className="font-medium text-primary">Next Steps</span>
              </div>
              <ul className="text-sm text-foreground space-y-2 flex-1">
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Test premium pricing scenarios
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Optimize cost structure
                </li>
                <li className="flex items-start">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2 mr-2 flex-shrink-0"></span>
                  Scale customer acquisition
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialModelingHub;
