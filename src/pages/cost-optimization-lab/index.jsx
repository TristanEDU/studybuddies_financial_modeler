import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import CostCategoryFilters from './components/CostCategoryFilters';
import OptimizationMatrix from './components/OptimizationMatrix';
import MetricsBar from './components/MetricsBar';
import RecommendationsPanel from './components/RecommendationsPanel';
import CostBreakdownTable from './components/CostBreakdownTable';
import SensitivityAnalysis from './components/SensitivityAnalysis';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const CostOptimizationLab = () => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeView, setActiveView] = useState('matrix'); // 'matrix', 'table', 'sensitivity'
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Mock cost categories data
  const mockCategories = [
    {
      id: 'office-rent',
      name: 'Office Rent & Utilities',
      description: 'Monthly office space rental and utility costs',
      monthlyCost: 8500,
      optimizationPotential: 75,
      implementationDifficulty: 45,
      category: 'operational'
    },
    {
      id: 'salaries',
      name: 'Employee Salaries',
      description: 'Full-time employee compensation and benefits',
      monthlyCost: 45000,
      optimizationPotential: 35,
      implementationDifficulty: 80,
      category: 'personnel'
    },
    {
      id: 'software',
      name: 'Software Subscriptions',
      description: 'SaaS tools and software licensing costs',
      monthlyCost: 3200,
      optimizationPotential: 85,
      implementationDifficulty: 25,
      category: 'technology'
    },
    {
      id: 'contractors',
      name: 'Contractor Services',
      description: 'Freelance and contract worker payments',
      monthlyCost: 12000,
      optimizationPotential: 65,
      implementationDifficulty: 40,
      category: 'personnel'
    },
    {
      id: 'marketing',
      name: 'Marketing & Advertising',
      description: 'Digital marketing campaigns and advertising spend',
      monthlyCost: 7800,
      optimizationPotential: 70,
      implementationDifficulty: 35,
      category: 'marketing'
    },
    {
      id: 'insurance',
      name: 'Business Insurance',
      description: 'General liability and business insurance premiums',
      monthlyCost: 1200,
      optimizationPotential: 45,
      implementationDifficulty: 60,
      category: 'operational'
    },
    {
      id: 'equipment',
      name: 'Equipment & Hardware',
      description: 'Computer equipment and office hardware costs',
      monthlyCost: 2500,
      optimizationPotential: 55,
      implementationDifficulty: 50,
      category: 'technology'
    },
    {
      id: 'legal',
      name: 'Legal & Professional Services',
      description: 'Legal counsel and professional service fees',
      monthlyCost: 3500,
      optimizationPotential: 40,
      implementationDifficulty: 70,
      category: 'operational'
    },
    {
      id: 'hosting',
      name: 'Cloud Hosting & Infrastructure',
      description: 'AWS, server hosting and cloud infrastructure costs',
      monthlyCost: 1800,
      optimizationPotential: 80,
      implementationDifficulty: 30,
      category: 'technology'
    },
    {
      id: 'training',
      name: 'Employee Training & Development',
      description: 'Professional development and training programs',
      monthlyCost: 2200,
      optimizationPotential: 50,
      implementationDifficulty: 45,
      category: 'personnel'
    }
  ];

  useEffect(() => {
    // Simulate data loading
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCategories(mockCategories);
      setSelectedCategories(mockCategories?.map(cat => cat?.id));
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleCategoryChange = (categoryId, isSelected) => {
    setSelectedCategories(prev => {
      if (isSelected) {
        return [...prev, categoryId];
      } else {
        return prev?.filter(id => id !== categoryId);
      }
    });
  };

  const handleResetFilters = () => {
    setSelectedCategories(categories?.map(cat => cat?.id));
  };

  const handleCategoryUpdate = (categoryId, field, value) => {
    setCategories(prev => prev?.map(cat => 
      cat?.id === categoryId ? { ...cat, [field]: value } : cat
    ));
  };

  const closeAllDropdowns = () => {
    setOpenDropdown(null);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const views = [
    { id: 'matrix', label: 'Optimization Matrix', icon: 'Target' },
    { id: 'table', label: 'Detailed Breakdown', icon: 'Table' },
    { id: 'sensitivity', label: 'Sensitivity Analysis', icon: 'Activity' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header closeAllDropdowns={closeAllDropdowns} />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <Icon name="Loader2" size={48} className="text-primary animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Loading Cost Optimization Lab</h3>
            <p className="text-muted-foreground">Analyzing cost structure and optimization opportunities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header closeAllDropdowns={closeAllDropdowns} />
      
      {/* Main Layout Container with Sidebar */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'w-16' : 'w-80'} bg-card border-r border-border transition-all duration-300 flex-shrink-0 overflow-y-auto`}>
          {/* Sidebar Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed && (
                <h2 className="text-lg font-semibold text-foreground">Filters & Controls</h2>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="p-2"
              >
                <Icon 
                  name={sidebarCollapsed ? "PanelLeftOpen" : "PanelLeftClose"} 
                  size={16} 
                />
              </Button>
            </div>
          </div>

          {/* Sidebar Content */}
          {!sidebarCollapsed && (
            <div className="p-4 space-y-6">
              {/* Cost Category Filters */}
              <div>
                <CostCategoryFilters
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onCategoryChange={handleCategoryChange}
                  onResetFilters={handleResetFilters}
                />
              </div>

              {/* Additional Controls Placeholder */}
              <div className="pt-4 border-t border-border">
                <h3 className="text-sm font-medium text-foreground mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start" iconName="RefreshCw">
                    Refresh Data
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" iconName="Settings">
                    Configure Analysis
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start" iconName="History">
                    View History
                  </Button>
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-3">Cost Optimization Lab</h1>
                <p className="text-lg text-muted-foreground">
                  Interactive analysis tools for identifying cost reduction opportunities and pricing optimization
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" iconName="Download" iconPosition="left" className="hover:scale-105 transition-transform">
                  Export Analysis
                </Button>
                <Button variant="outline" iconName="Save" iconPosition="left" className="hover:scale-105 transition-transform">
                  Save Scenario
                </Button>
                <Button iconName="Share" iconPosition="left" className="hover:scale-105 transition-transform">
                  Share Results
                </Button>
              </div>
            </div>

            {/* Metrics Overview */}
            <div className="mb-8">
              <MetricsBar categories={categories} selectedCategories={selectedCategories} />
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-1 mb-6 bg-muted rounded-lg p-1 w-fit">
              {views?.map((view) => (
                <button
                  key={view?.id}
                  onClick={() => setActiveView(view?.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeView === view?.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon name={view?.icon} size={16} />
                  <span>{view?.label}</span>
                </button>
              ))}
            </div>

            {/* Single Column Main Analysis Area */}
            <div className="mb-8">
              {/* Dynamic View Content */}
              {activeView === 'matrix' && (
                <OptimizationMatrix
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onCategorySelect={handleCategoryChange}
                />
              )}

              {activeView === 'table' && (
                <CostBreakdownTable
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onCategoryUpdate={handleCategoryUpdate}
                />
              )}

              {activeView === 'sensitivity' && (
                <SensitivityAnalysis
                  categories={categories}
                  selectedCategories={selectedCategories}
                />
              )}
            </div>

            {/* AI Recommendations Section - Moved below optimization matrix */}
            <div className="mb-8">
              <div className="bg-card rounded-lg border border-border overflow-hidden">
                <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name="Brain" size={20} className="text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-foreground">AI-Powered Recommendations</h2>
                      <p className="text-sm text-muted-foreground">
                        Intelligent cost optimization suggestions based on your data patterns
                      </p>
                    </div>
                  </div>
                  
                  {/* AI System Explanation */}
                  <div className="bg-background/50 rounded-lg p-4 border border-border/50">
                    <div className="flex items-start space-x-3">
                      <Icon name="Info" size={16} className="text-primary mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <h4 className="font-medium text-foreground mb-1">How Our AI Works</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          Our AI analyzes your cost data using algorithmic models that evaluate optimization potential, 
                          implementation difficulty, and financial impact. Recommendations prioritize high-impact/low-effort 
                          opportunities with step-by-step implementation guidance based on industry best practices.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations Panel Content */}
                <div className="p-0">
                  <RecommendationsPanel
                    categories={categories}
                    selectedCategories={selectedCategories}
                  />
                </div>
              </div>
            </div>

            {/* Additional Analysis Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Cost Correlation Heatmap Placeholder */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="Grid3x3" size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">Cost Correlation Matrix</h3>
                </div>
                <div className="text-center py-12">
                  <Icon name="Grid3x3" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-foreground mb-2">Correlation Analysis</h4>
                  <p className="text-muted-foreground">
                    Interactive heatmap showing cost interdependencies and correlation patterns between different expense categories.
                  </p>
                </div>
              </div>

              {/* What-If Scenario Modeling */}
              <div className="bg-card rounded-lg border border-border p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <Icon name="GitBranch" size={20} className="text-primary" />
                  <h3 className="text-lg font-semibold text-foreground">What-If Scenarios</h3>
                </div>
                <div className="text-center py-12">
                  <Icon name="GitBranch" size={48} className="text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium text-foreground mb-2">Scenario Modeling</h4>
                  <p className="text-muted-foreground">
                    Advanced scenario modeling with parameter adjustment capabilities for comprehensive cost optimization planning.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Items Footer */}
            <div className="bg-card rounded-lg border border-border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                    <Icon name="CheckCircle" size={20} className="text-success" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">Optimization Analysis Complete</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedCategories?.length} categories analyzed • 
                      ${Math.round(categories?.filter(cat => selectedCategories?.includes(cat?.id))?.reduce((sum, cat) => sum + (cat?.monthlyCost * (cat?.optimizationPotential / 100)), 0)
                      )?.toLocaleString()} potential monthly savings identified
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" iconName="FileText">
                    Generate Report
                  </Button>
                  <Button size="sm" iconName="ArrowRight">
                    Implement Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CostOptimizationLab;