import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsBar = ({ categories, selectedCategories }) => {
  const filteredCategories = categories?.filter(cat => selectedCategories?.includes(cat?.id));
  
  const totalMonthlyCost = filteredCategories?.reduce((sum, cat) => sum + cat?.monthlyCost, 0);
  
  const potentialSavings = filteredCategories?.reduce((sum, cat) => {
    return sum + (cat?.monthlyCost * (cat?.optimizationPotential / 100));
  }, 0);
  
  const avgOptimizationPotential = filteredCategories?.length > 0 
    ? filteredCategories?.reduce((sum, cat) => sum + cat?.optimizationPotential, 0) / filteredCategories?.length
    : 0;
    
  const roiProjection = potentialSavings > 0 ? (potentialSavings * 12) / (totalMonthlyCost * 0.1) : 0;
  
  const quickWinsCount = filteredCategories?.filter(cat => 
    cat?.optimizationPotential > 50 && cat?.implementationDifficulty < 50
  )?.length;

  const metrics = [
    {
      id: 'total-cost',
      label: 'Total Monthly Costs',
      value: `$${totalMonthlyCost?.toLocaleString()}`,
      change: '-2.3%',
      changeType: 'positive',
      icon: 'DollarSign',
      description: 'Current monthly expenses'
    },
    {
      id: 'potential-savings',
      label: 'Potential Savings',
      value: `$${Math.round(potentialSavings)?.toLocaleString()}`,
      change: '+15.7%',
      changeType: 'positive',
      icon: 'TrendingDown',
      description: 'Identified optimization opportunities'
    },
    {
      id: 'optimization-score',
      label: 'Optimization Score',
      value: `${Math.round(avgOptimizationPotential)}%`,
      change: '+8.2%',
      changeType: 'positive',
      icon: 'Target',
      description: 'Average optimization potential'
    },
    {
      id: 'roi-projection',
      label: 'ROI Projection',
      value: `${Math.round(roiProjection)}%`,
      change: '+12.4%',
      changeType: 'positive',
      icon: 'TrendingUp',
      description: 'Projected return on investment'
    },
    {
      id: 'quick-wins',
      label: 'Quick Wins',
      value: quickWinsCount?.toString(),
      change: '+3',
      changeType: 'positive',
      icon: 'Zap',
      description: 'High impact, low effort opportunities'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {metrics?.map((metric) => (
        <div key={metric?.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              metric?.id === 'total-cost' ? 'bg-primary/10' :
              metric?.id === 'potential-savings' ? 'bg-success/10' :
              metric?.id === 'optimization-score' ? 'bg-warning/10' :
              metric?.id === 'roi-projection'? 'bg-accent/10' : 'bg-secondary/10'
            }`}>
              <Icon 
                name={metric?.icon} 
                size={20} 
                className={
                  metric?.id === 'total-cost' ? 'text-primary' :
                  metric?.id === 'potential-savings' ? 'text-success' :
                  metric?.id === 'optimization-score' ? 'text-warning' :
                  metric?.id === 'roi-projection'? 'text-accent' : 'text-secondary'
                }
              />
            </div>
            <div className={`flex items-center space-x-1 text-xs font-medium ${
              metric?.changeType === 'positive' ? 'text-success' : 'text-destructive'
            }`}>
              <Icon 
                name={metric?.changeType === 'positive' ? 'ArrowUp' : 'ArrowDown'} 
                size={12} 
              />
              <span>{metric?.change}</span>
            </div>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-2xl font-bold text-foreground">{metric?.value}</h3>
            <p className="text-sm font-medium text-foreground">{metric?.label}</p>
            <p className="text-xs text-muted-foreground">{metric?.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MetricsBar;