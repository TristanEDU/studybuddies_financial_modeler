import React from 'react';
import Icon from '../../../components/AppIcon';

const ComparisonMetrics = ({ scenarios, comparisonMode }) => {
  const mockMetrics = {
    'baseline-scenario': {
      breakeven: 8.5,
      investment: 125000,
      roi: 24.5,
      revenue12m: 480000,
      costs12m: 362000
    },
    'optimistic-growth': {
      breakeven: 6.2,
      investment: 145000,
      roi: 38.7,
      revenue12m: 720000,
      costs12m: 425000
    },
    'conservative-plan': {
      breakeven: 12.3,
      investment: 95000,
      roi: 18.2,
      revenue12m: 320000,
      costs12m: 285000
    },
    'stress-test': {
      breakeven: 15.8,
      investment: 180000,
      roi: 8.4,
      revenue12m: 280000,
      costs12m: 310000
    }
  };

  const getVariance = (baseValue, compareValue) => {
    if (!baseValue || !compareValue) return 0;
    return comparisonMode === 'percentage' 
      ? ((compareValue - baseValue) / baseValue * 100)
      : (compareValue - baseValue);
  };

  const formatVariance = (variance, isPercentage = false) => {
    const prefix = variance > 0 ? '+' : '';
    const suffix = comparisonMode === 'percentage' ? '%' : (isPercentage ? '%' : '');
    return `${prefix}${variance?.toFixed(1)}${suffix}`;
  };

  const getVarianceColor = (variance) => {
    if (variance > 0) return 'text-success';
    if (variance < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const activeScenarios = scenarios?.filter(s => s);
  const baseScenario = activeScenarios?.[0];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {[
        { 
          key: 'breakeven', 
          label: 'Breakeven (Months)', 
          icon: 'Target',
          format: (val) => `${val} mo`
        },
        { 
          key: 'investment', 
          label: 'Total Investment', 
          icon: 'DollarSign',
          format: (val) => `$${(val / 1000)?.toFixed(0)}K`
        },
        { 
          key: 'roi', 
          label: 'Projected ROI', 
          icon: 'TrendingUp',
          format: (val) => `${val}%`
        },
        { 
          key: 'revenue12m', 
          label: '12M Revenue', 
          icon: 'BarChart3',
          format: (val) => `$${(val / 1000)?.toFixed(0)}K`
        }
      ]?.map((metric) => (
        <div key={metric?.key} className="bg-card border border-border rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={metric?.icon} size={16} className="text-primary" />
              </div>
              <h3 className="text-sm font-medium text-foreground">{metric?.label}</h3>
            </div>
          </div>

          <div className="space-y-2">
            {activeScenarios?.map((scenario, index) => {
              const value = mockMetrics?.[scenario]?.[metric?.key] || 0;
              const baseValue = mockMetrics?.[baseScenario]?.[metric?.key] || 0;
              const variance = index === 0 ? 0 : getVariance(baseValue, value);

              return (
                <div key={scenario} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-orange-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="text-xs text-muted-foreground">
                      Scenario {index + 1}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-foreground">
                      {metric?.format(value)}
                    </div>
                    {index > 0 && (
                      <div className={`text-xs ${getVarianceColor(variance)}`}>
                        {formatVariance(variance)}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ComparisonMetrics;