import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ComparisonTable = ({ scenarios, comparisonMode }) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const mockTableData = {
    'baseline-scenario': {
      name: 'Baseline Scenario',
      breakeven: 8.5,
      investment: 125000,
      roi: 24.5,
      revenue12m: 480000,
      costs12m: 362000,
      profit12m: 118000,
      cac: 45,
      ltv: 890,
      churnRate: 5.2,
      conversionRate: 3.8,
      mrr: 28500
    },
    'optimistic-growth': {
      name: 'Optimistic Growth',
      breakeven: 6.2,
      investment: 145000,
      roi: 38.7,
      revenue12m: 720000,
      costs12m: 425000,
      profit12m: 295000,
      cac: 38,
      ltv: 1250,
      churnRate: 3.8,
      conversionRate: 5.2,
      mrr: 42000
    },
    'conservative-plan': {
      name: 'Conservative Plan',
      breakeven: 12.3,
      investment: 95000,
      roi: 18.2,
      revenue12m: 320000,
      costs12m: 285000,
      profit12m: 35000,
      cac: 52,
      ltv: 680,
      churnRate: 6.8,
      conversionRate: 2.9,
      mrr: 19500
    },
    'stress-test': {
      name: 'Stress Test Model',
      breakeven: 15.8,
      investment: 180000,
      roi: 8.4,
      revenue12m: 280000,
      costs12m: 310000,
      profit12m: -30000,
      cac: 68,
      ltv: 520,
      churnRate: 8.5,
      conversionRate: 2.1,
      mrr: 15200
    }
  };

  const tableColumns = [
    { key: 'name', label: 'Scenario Name', type: 'text' },
    { key: 'breakeven', label: 'Breakeven (Months)', type: 'number', format: (val) => `${val} mo` },
    { key: 'investment', label: 'Investment Required', type: 'currency' },
    { key: 'roi', label: 'ROI %', type: 'percentage' },
    { key: 'revenue12m', label: '12M Revenue', type: 'currency' },
    { key: 'costs12m', label: '12M Costs', type: 'currency' },
    { key: 'profit12m', label: '12M Profit', type: 'currency' },
    { key: 'cac', label: 'CAC', type: 'currency' },
    { key: 'ltv', label: 'LTV', type: 'currency' },
    { key: 'churnRate', label: 'Churn Rate %', type: 'percentage' },
    { key: 'conversionRate', label: 'Conversion %', type: 'percentage' },
    { key: 'mrr', label: 'MRR', type: 'currency' }
  ];

  const activeScenarios = scenarios?.filter(s => s);
  const baseScenario = activeScenarios?.[0];

  const getVariance = (baseValue, compareValue) => {
    if (!baseValue || !compareValue || baseValue === compareValue) return 0;
    return comparisonMode === 'percentage' 
      ? ((compareValue - baseValue) / baseValue * 100)
      : (compareValue - baseValue);
  };

  const formatValue = (value, type, format) => {
    if (format) return format(value);
    
    switch (type) {
      case 'currency':
        return `$${value?.toLocaleString()}`;
      case 'percentage':
        return `${value}%`;
      case 'number':
        return value?.toLocaleString();
      default:
        return value;
    }
  };

  const formatVariance = (variance, type) => {
    const prefix = variance > 0 ? '+' : '';
    const suffix = comparisonMode === 'percentage' ? '%' : '';
    
    if (type === 'currency' && comparisonMode === 'absolute') {
      return `${prefix}$${Math.abs(variance)?.toLocaleString()}`;
    }
    
    return `${prefix}${variance?.toFixed(1)}${suffix}`;
  };

  const getVarianceColor = (variance, isNegativeGood = false) => {
    const isPositive = variance > 0;
    if (variance === 0) return 'text-muted-foreground';
    
    if (isNegativeGood) {
      return isPositive ? 'text-destructive' : 'text-success';
    }
    return isPositive ? 'text-success' : 'text-destructive';
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig?.key !== columnKey) {
      return <Icon name="ArrowUpDown" size={14} className="text-muted-foreground" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-foreground" />
      : <Icon name="ArrowDown" size={14} className="text-foreground" />;
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">Detailed Comparison</h3>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" iconName="Filter">
            Filter
          </Button>
          <Button variant="outline" size="sm" iconName="Download">
            Export CSV
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {tableColumns?.map((column) => (
                <th
                  key={column?.key}
                  className="px-4 py-3 text-left text-sm font-medium text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => handleSort(column?.key)}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column?.label}</span>
                    {getSortIcon(column?.key)}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activeScenarios?.map((scenarioKey, scenarioIndex) => {
              const scenario = mockTableData?.[scenarioKey];
              if (!scenario) return null;

              return (
                <tr key={scenarioKey} className="hover:bg-muted/30 transition-colors">
                  {tableColumns?.map((column) => {
                    const value = scenario?.[column?.key];
                    const baseValue = mockTableData?.[baseScenario]?.[column?.key];
                    const variance = scenarioIndex === 0 ? 0 : getVariance(baseValue, value);
                    const isNegativeGood = ['breakeven', 'costs12m', 'cac', 'churnRate']?.includes(column?.key);

                    return (
                      <td key={column?.key} className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-foreground">
                            {formatValue(value, column?.type, column?.format)}
                          </div>
                          {scenarioIndex > 0 && variance !== 0 && (
                            <div className={`text-xs ${getVarianceColor(variance, isNegativeGood)}`}>
                              {formatVariance(variance, column?.type)}
                            </div>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {activeScenarios?.length === 0 && (
        <div className="p-12 text-center">
          <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No Scenarios Selected</h4>
          <p className="text-muted-foreground">
            Select scenarios above to view detailed comparison data.
          </p>
        </div>
      )}
    </div>
  );
};

export default ComparisonTable;