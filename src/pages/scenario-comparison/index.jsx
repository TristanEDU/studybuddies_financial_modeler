import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import ScenarioSelector from './components/ScenarioSelector';
import ComparisonMetrics from './components/ComparisonMetrics';
import SynchronizedCharts from './components/SynchronizedCharts';
import WaterfallChart from './components/WaterfallChart';
import SensitivityHeatmap from './components/SensitivityHeatmap';
import ComparisonTable from './components/ComparisonTable';
import Icon from '../../components/AppIcon';

const ScenarioComparison = () => {
  const [selectedScenarios, setSelectedScenarios] = useState(['baseline-scenario', '', '', '']);
  const [comparisonMode, setComparisonMode] = useState('absolute');
  const [timeHorizon, setTimeHorizon] = useState('12');
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownsOpen, setDropdownsOpen] = useState({});

  const availableScenarios = [
    { value: 'baseline-scenario', label: 'Baseline Scenario' },
    { value: 'optimistic-growth', label: 'Optimistic Growth' },
    { value: 'conservative-plan', label: 'Conservative Plan' },
    { value: 'stress-test', label: 'Stress Test Model' },
    { value: 'market-expansion', label: 'Market Expansion' },
    { value: 'cost-reduction', label: 'Cost Reduction Focus' }
  ];

  const handleScenarioChange = (index, value) => {
    const newScenarios = [...selectedScenarios];
    newScenarios[index] = value;
    setSelectedScenarios(newScenarios);
    
    // Simulate loading for complex calculations
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 800);
  };

  const handleComparisonModeChange = (mode) => {
    setComparisonMode(mode);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleTimeHorizonChange = (horizon) => {
    setTimeHorizon(horizon);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 600);
  };

  const closeAllDropdowns = () => {
    setDropdownsOpen({});
  };

  // Filter out empty scenarios
  const activeScenarios = selectedScenarios?.filter(scenario => scenario);

  return (
    <div className="min-h-screen bg-background">
      <Header closeAllDropdowns={closeAllDropdowns} />
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="GitCompare" size={24} color="white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Scenario Comparison</h1>
              <p className="text-muted-foreground">
                Side-by-side analysis of multiple financial models for strategic decision-making
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="Target" size={20} className="text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Active Scenarios</span>
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {activeScenarios?.length}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="Clock" size={20} className="text-success" />
                <span className="text-sm font-medium text-muted-foreground">Time Horizon</span>
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {timeHorizon} Months
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="TrendingUp" size={20} className="text-warning" />
                <span className="text-sm font-medium text-muted-foreground">Comparison Mode</span>
              </div>
              <div className="text-2xl font-bold text-foreground mt-1 capitalize">
                {comparisonMode}
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <Icon name="RefreshCw" size={20} className={isLoading ? "text-primary animate-spin" : "text-muted-foreground"} />
                <span className="text-sm font-medium text-muted-foreground">Status</span>
              </div>
              <div className="text-2xl font-bold text-foreground mt-1">
                {isLoading ? 'Calculating...' : 'Ready'}
              </div>
            </div>
          </div>
        </div>

        {/* Scenario Selection Controls */}
        <ScenarioSelector
          selectedScenarios={selectedScenarios}
          onScenarioChange={handleScenarioChange}
          availableScenarios={availableScenarios}
          comparisonMode={comparisonMode}
          onComparisonModeChange={handleComparisonModeChange}
          timeHorizon={timeHorizon}
          onTimeHorizonChange={handleTimeHorizonChange}
        />

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-lg p-6 flex items-center space-x-3">
              <Icon name="Loader2" size={24} className="animate-spin text-primary" />
              <span className="text-foreground font-medium">Recalculating scenarios...</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {/* Key Metrics Comparison */}
          <ComparisonMetrics 
            scenarios={activeScenarios}
            comparisonMode={comparisonMode}
          />

          {/* Synchronized Charts */}
          <SynchronizedCharts 
            scenarios={activeScenarios}
            timeHorizon={timeHorizon}
          />

          {/* Two Column Layout for Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Waterfall Chart */}
            <WaterfallChart scenarios={activeScenarios} />

            {/* Sensitivity Heatmap */}
            <SensitivityHeatmap />
          </div>

          {/* Detailed Comparison Table */}
          <ComparisonTable 
            scenarios={activeScenarios}
            comparisonMode={comparisonMode}
          />
        </div>

        {/* Empty State */}
        {activeScenarios?.length === 0 && (
          <div className="text-center py-16">
            <Icon name="GitCompare" size={64} className="text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No Scenarios Selected
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Select at least one scenario from the controls above to begin your comparison analysis.
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Info" size={16} />
              <span>You can compare up to 4 scenarios simultaneously</span>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ScenarioComparison;