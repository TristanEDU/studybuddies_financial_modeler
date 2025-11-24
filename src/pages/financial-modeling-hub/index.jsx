import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { financialService } from '../../services/financialService';
import { useFinancialModel } from '../../hooks/useFinancialModel';
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
import ImportDialog from '../../components/ui/ImportDialog';
import { FileImportUtils } from '../../utils/fileImportUtils';
import PricingTierEditor from '../../components/ui/PricingTierEditor';
import { STANDARD_CATEGORY_CONFIGS, createDefaultCostStructure } from '../../config/financialDefaults';


const FinancialModelingHub = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const {
    loading,
    error,
    costs,
    setCosts,
    scenarios,
    setScenarios,
    activeScenario,
    setActiveScenario,
    pricingScenarios,
    setPricingScenarios,
    activePricing,
    setActivePricing,
    variableCostPerMember,
    setVariableCostPerMember,
    loadScenarios,
    handleCostChange,
    handleAddStandardCategory,
    handleRemoveCategory,
    calculateTotalCosts,
    persistCosts
  } = useFinancialModel(user);

  const [aiInsights, setAiInsights] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStartTime, setAnalysisStartTime] = useState(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isPricingEditorOpen, setIsPricingEditorOpen] = useState(false);



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

  const reduceMarketing20 = useCallback(() => {
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
        
        setTimeout(() => persistCosts(newCosts), 0);
        return newCosts;
      });
  }, [persistCosts, setCosts]);

  /* const addEmployee = useCallback(() => {
      setCosts(prev => {
        const newCosts = JSON.parse(JSON.stringify(prev));
        const employeeId = `employee_${Date.now()}`;
        
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
        
        setTimeout(() => persistCosts(newCosts), 0);
        return newCosts;
      });
  }, [persistCosts, setCosts]); */

  // Generate breakeven analysis data
  const generateBreakevenData = useCallback(() => {
    let totalCosts = calculateTotalCosts();
    const currentPricing = pricingScenarios?.find(p => p?.id === activePricing);
    
    // Convert pricing to monthly equivalent for calculations
    const getMonthlyPrice = (tier) => {
      if (!tier) return 49;
      const period = tier.billingPeriod || 'monthly';
      if (period === 'monthly') return tier.price;
      if (period === 'annual') return tier.price / 12;
      if (period === 'lifetime') return tier.price / 60; // Assume 5 years
      return tier.price;
    };
    
    const pricePerMember = getMonthlyPrice(currentPricing);
    
    const data = [];
    for (let members = 0; members <= 500; members += 25) {
      const revenue = members * pricePerMember;
      
      data?.push({
        members,
        revenue,
        costs: totalCosts
      });
    }

    const breakevenMembers = totalCosts > 0 ? Math.ceil(totalCosts / pricePerMember) : 0;
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
    
    // Convert pricing to monthly equivalent for calculations
    const getMonthlyPrice = (tier) => {
      if (!tier) return 49;
      const period = tier.billingPeriod || 'monthly';
      if (period === 'monthly') return tier.price;
      if (period === 'annual') return tier.price / 12;
      if (period === 'lifetime') return tier.price / 60; // Assume 5 years
      return tier.price;
    };
    
    const pricePerMember = getMonthlyPrice(currentPricing);
    const breakevenMembers = totalCosts > 0 ? Math.ceil(totalCosts / pricePerMember) : 0;
    
    // Calculate actual MRR based on pricing tiers
    let totalMRR = 0;
    let totalMembers = 0;
    pricingScenarios?.forEach(tier => {
      const monthlyPrice = getMonthlyPrice(tier);
      const members = tier?.members || 0;
      totalMRR += monthlyPrice * members;
      totalMembers += members;
    });
    
    // Calculate marketing costs for CAC
    const marketingCosts = costs?.marketing?.items ? 
      Object.values(costs.marketing.items).reduce((sum, item) => 
        sum + (parseFloat(item?.value) || 0) * (item?.count || 1), 0
      ) : 0;
    
    // Assume 10% of current members are new acquisitions per month
    const newMembersPerMonth = Math.max(Math.ceil(totalMembers * 0.1), 1);
    const calculatedCAC = newMembersPerMonth > 0 ? Math.round(marketingCosts / newMembersPerMonth) : 0;
    
    // Calculate LTV (assume 24 month average customer lifetime)
    const avgRevenuePerUser = totalMembers > 0 ? totalMRR / totalMembers : pricePerMember;
    const avgCustomerLifetimeMonths = 24;
    const calculatedLTV = Math.round(avgRevenuePerUser * avgCustomerLifetimeMonths);
    
    // Calculate LTV:CAC ratio
    const ltvCacRatio = calculatedCAC > 0 ? calculatedLTV / calculatedCAC : 0;
    
    // Calculate churn rate (assume 5% base churn, adjust based on ratio health)
    const baseChurnRate = 5.0;
    const churnRate = ltvCacRatio >= 3 ? baseChurnRate * 0.8 : ltvCacRatio >= 2 ? baseChurnRate : baseChurnRate * 1.2;
    
    // Calculate runway based on assumed cash reserves
    const assumedCashReserves = totalCosts * 18; // 18 months of current burn
    const runwayMonths = totalCosts > 0 ? Math.floor(assumedCashReserves / totalCosts) : 0;
    
    return {
      breakevenMembers,
      breakevenRevenue: breakevenMembers * pricePerMember,
      breakevenChange: -2.3,
      monthlyBurnRate: totalCosts,
      runwayMonths,
      burnRateChange: 5.2,
      profitabilityThreshold: totalCosts * 1.2,
      profitMargin: totalMRR > totalCosts ? ((totalMRR - totalCosts) / totalMRR * 100).toFixed(1) : 0,
      profitabilityChange: 1.7,
      cac: calculatedCAC,
      ltv: calculatedLTV,
      ltvCacRatio: parseFloat(ltvCacRatio.toFixed(1)),
      cacChange: -8.1,
      mrr: Math.round(totalMRR),
      mrrGrowth: totalMRR > 0 && totalMembers > 0 ? 12.4 : 0,
      mrrChange: 12.4,
      churnRate: parseFloat(churnRate.toFixed(1)),
      retentionRate: parseFloat((100 - churnRate).toFixed(1)),
      churnChange: -0.8
    };
  }, [calculateTotalCosts, pricingScenarios, activePricing, costs]);

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

    // Operations, Marketing, Technology - with quantity multiplication
    ['operations', 'marketing', 'technology']?.forEach(category => {
      let categoryTotal = 0;
      if (costs?.[category]?.items) {
        Object.entries(costs?.[category]?.items)?.forEach(([key, item]) => {
          if (key.endsWith('_quantity')) return;
          if (item?.enabled) {
            const quantityKey = `${key}_quantity`;
            const siblingQuantity = costs?.[category]?.items?.[quantityKey];
            const quantity = siblingQuantity !== undefined ? siblingQuantity : (item?._quantity || item?.quantity || item?.count || 1);
            categoryTotal += item?.value * Number(quantity);
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

    // Custom categories - with quantity multiplication
    if (costs?.customCategories) {
      Object.entries(costs?.customCategories)?.forEach(([key, category]) => {
        if (category?.enabled && category?.items) {
          let categoryTotal = 0;
          Object.entries(category?.items)?.forEach(([itemKey, item]) => {
            if (itemKey.endsWith('_quantity')) return;
            if (item?.enabled) {
              const quantityKey = `${itemKey}_quantity`;
              const siblingQuantity = category?.items?.[quantityKey];
              const quantity = siblingQuantity !== undefined ? siblingQuantity : (item?._quantity || item?.quantity || item?.count || 1);
              categoryTotal += item?.value * Number(quantity);
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
    
    // Update the active scenario with new pricing data
    setActiveScenario(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        pricingData: { activePricing: scenarioId },
        updated_at: new Date()?.toISOString()
      };
    });

    // Show feedback to user
    const currentPricing = pricingScenarios?.find(p => p?.id === scenarioId);
    if (currentPricing) {
      toast.success(`Switched to ${currentPricing?.name} - $${currentPricing?.price}/${currentPricing?.billingPeriod || 'month'}`);
    }
    
    // The useMemo hooks will automatically recalculate breakevenData and metrics
    // when activePricing changes, so no manual recalculation needed
  }, [pricingScenarios]);



  // FIXED: Enhanced toggle category with structure validation
  const handleScenarioChange = async (scenarioId) => {
    try {
      const detailedScenario = await financialService?.getScenarioWithCostData(scenarioId);
      if (detailedScenario) {
        setActiveScenario(detailedScenario);
        setCosts(detailedScenario?.costData || {});
        toast.success(`Loaded ${detailedScenario.name}`);
      }
    } catch (err) {
      toast.error('Failed to load scenario');
      console.error('Error loading scenario:', err);
    }
  };

  const handleSaveScenario = async (scenario) => {
    try {
      // Check if this is a new scenario by looking in scenarios array
      const isNewScenario = !scenario?.id || !scenarios.find(s => s.id === scenario?.id);
      
      if (activeScenario && !isNewScenario) {
        // ENHANCED: Update existing scenario with better error handling
        const updatedScenario = await financialService?.updateScenario(activeScenario?.id, {
          ...scenario,
          name: scenario?.name || activeScenario?.name,
          description: scenario?.description || activeScenario?.description,
          costData: costs,
          pricingData: { activePricing }
        });
        
        setScenarios(prev => prev?.map(s => s?.id === updatedScenario?.id ? updatedScenario : s));
        setActiveScenario(updatedScenario);
        
        toast.success('Scenario saved successfully');
      } else {
        // Create new scenario
        const newScenario = await financialService?.createScenario({
          name: scenario?.name || 'Untitled Scenario',
          description: scenario?.description || `Created on ${new Date()?.toLocaleDateString()}`,
          costData: costs,
          pricingData: { activePricing }
        });
        
        setScenarios(prev => [...prev, newScenario]);
        setActiveScenario(newScenario);
        toast.success('New scenario created successfully');
      }
    } catch (err) {
      toast.error('Failed to save scenario');
      console.error('Error saving scenario:', err);
    }
  };

  const handleLoadScenario = (scenarioId) => {
    handleScenarioChange(scenarioId);
  };

  const handleDeleteScenario = async (scenarioId) => {
    try {
      // Prevent deleting the currently active scenario
      if (scenarioId === activeScenario?.id) {
        toast.error('Cannot delete the active scenario. Please switch to another scenario first.');
        return;
      }

      // Confirm deletion
      if (!window.confirm('Are you sure you want to delete this scenario? This action cannot be undone.')) {
        return;
      }

      setLoading(true);
      await financialService?.deleteScenario(scenarioId);
      
      // Remove from scenarios list
      setScenarios(prev => prev?.filter(s => s?.id !== scenarioId));
      toast.success('Scenario deleted successfully');
    } catch (err) {
      setError('Failed to delete scenario. Please try again.');
      toast.error('Failed to delete scenario');
      console.error('Error deleting scenario:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = (format) => {
    const data = {
      scenario: activeScenario,
      costs,
      metrics: generateMetrics(),
      breakeven: generateBreakevenData(),
      exportedAt: new Date()?.toISOString()
    };
    
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `scenario_${activeScenario?.name || 'export'}_${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else if (format === 'csv') {
      const csv = FileImportUtils.generateCSVTemplate();
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `cost_template_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  const handleImportData = (importedCosts, metadata) => {
    console.log('Importing costs:', importedCosts, 'Metadata:', metadata);
    
    // Update costs state with imported data
    setCosts(importedCosts);
    
    // Show success message
    if (metadata?.rowCount) {
      alert(`Successfully imported ${metadata.rowCount} cost items using ${metadata.strategy} strategy!`);
    }
    
    // Warnings if any
    if (metadata?.warnings && metadata.warnings.length > 0) {
      console.warn('Import warnings:', metadata.warnings);
    }
  };

  const handleSavePricingTiers = (updatedTiers) => {
    setPricingScenarios(updatedTiers);
    
    // If current active pricing doesn't exist in new tiers, switch to first tier
    const activeExists = updatedTiers.some(tier => tier.id === activePricing);
    if (!activeExists && updatedTiers.length > 0) {
      setActivePricing(updatedTiers[0].id);
    }
    
    // Persist to scenario if active
    if (activeScenario?.id) {
      financialService?.updateScenario(activeScenario.id, {
        pricingData: { 
          tiers: updatedTiers,
          activePricing: activeExists ? activePricing : updatedTiers[0]?.id
        }
      }).catch(err => console.error('Failed to save pricing tiers:', err));
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

  // Calculate data but skip expensive operations during loading/error states
  // This keeps hook order consistent while avoiding performance issues
  const shouldCalculate = !authLoading && !loading && !error;
  
  const breakevenData = useMemo(() => {
    if (!shouldCalculate) return { data: [], breakeven: { members: 0, revenue: 0, costs: 0 } };
    return generateBreakevenData();
  }, [shouldCalculate, generateBreakevenData, costs]);
  
  const metrics = useMemo(() => {
    if (!shouldCalculate) return {};
    return generateMetrics();
  }, [shouldCalculate, generateMetrics, costs]);
  
  const costBreakdown = useMemo(() => {
    if (!shouldCalculate) return [];
    return generateCostBreakdown();
  }, [shouldCalculate, generateCostBreakdown, costs]);
  
  const revenueProjections = useMemo(() => {
    if (!shouldCalculate) return [];
    return generateRevenueProjections();
  }, [shouldCalculate, generateRevenueProjections, costs]);
  
  const monthlyProjections = useMemo(() => {
    if (!shouldCalculate) return [];
    return generateMonthlyProjections();
  }, [shouldCalculate, generateMonthlyProjections, costs]);

  const pricingTiers = [
    { id: 'basic', name: 'Basic', price: 29 },
    { id: 'standard', name: 'Standard', price: 49 },
    { id: 'premium', name: 'Premium', price: 99 },
    { id: 'enterprise', name: 'Enterprise', price: 199 }
  ];

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

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" />
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
              onCostChange={handleCostChange.updateItem}
              onRemoveItem={handleCostChange.removeItem}
              onAddCategory={handleCostChange.addCategory}
              onAddStandardCategory={handleAddStandardCategory}
              onRemoveCategory={handleRemoveCategory}
              standardCategories={STANDARD_CATEGORY_CONFIGS}
              openDropdown={handleOpenDropdown}
              closeAllDropdowns={closeAllDropdowns}
              currentOpenDropdown={openDropdown}
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
              onEditPricingTiers={() => setIsPricingEditorOpen(true)}
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

          {/* Scenario Controls - Full Width */}
          <div>
            <ScenarioControls
              scenarios={scenarios}
              activeScenario={activeScenario}
              onScenarioChange={handleScenarioChange}
              onSaveScenario={handleSaveScenario}
              onLoadScenario={handleLoadScenario}
              onDeleteScenario={handleDeleteScenario}
              onExportData={handleExportData}
              onImportData={handleImportData}
              onOpenImportDialog={() => setIsImportDialogOpen(true)}
            />
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
                onClick={reduceMarketing20}
                className="text-xs"
              >
                Reduce Marketing 20%
              </Button>
              
              <Button
                variant="outline"
                fullWidth
                iconName="Users"
                iconSize={14}
                // onClick={addEmployee}
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

      {/* Import Dialog */}
      <ImportDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportData}
        currentCosts={costs}
      />

      {/* Pricing Tier Editor */}
      <PricingTierEditor
        isOpen={isPricingEditorOpen}
        onClose={() => setIsPricingEditorOpen(false)}
        pricingTiers={pricingScenarios}
        onSave={handleSavePricingTiers}
      />
    </div>
  );
};

export default FinancialModelingHub;
