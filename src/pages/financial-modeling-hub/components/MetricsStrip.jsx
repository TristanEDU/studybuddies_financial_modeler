import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsStrip = ({ metrics }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(value);
  };

  const formatPercentage = (value) => {
    return `${value?.toFixed(1)}%`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'positive':
        return 'text-success';
      case 'negative':
        return 'text-destructive';
      case 'warning':
        return 'text-warning';
      default:
        return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'positive':
        return 'TrendingUp';
      case 'negative':
        return 'TrendingDown';
      case 'warning':
        return 'AlertTriangle';
      default:
        return 'Minus';
    }
  };

  const metricCards = [
    {
      id: 'breakeven',
      title: 'Breakeven Point',
      value: `${metrics?.breakevenMembers} members`,
      subtitle: formatCurrency(metrics?.breakevenRevenue),
      icon: 'Target',
      status: metrics?.breakevenMembers <= 100 ? 'positive' : metrics?.breakevenMembers <= 200 ? 'warning' : 'negative',
      change: metrics?.breakevenChange
    },
    {
      id: 'burnRate',
      title: 'Monthly Burn Rate',
      value: formatCurrency(metrics?.monthlyBurnRate),
      subtitle: `${metrics?.runwayMonths} months runway`,
      icon: 'Flame',
      status: metrics?.monthlyBurnRate <= 50000 ? 'positive' : metrics?.monthlyBurnRate <= 100000 ? 'warning' : 'negative',
      change: metrics?.burnRateChange
    },
    {
      id: 'profitability',
      title: 'Profitability Threshold',
      value: formatCurrency(metrics?.profitabilityThreshold),
      subtitle: `${metrics?.profitMargin}% margin`,
      icon: 'DollarSign',
      status: metrics?.profitMargin >= 20 ? 'positive' : metrics?.profitMargin >= 10 ? 'warning' : 'negative',
      change: metrics?.profitabilityChange
    },
    {
      id: 'cac',
      title: 'Customer Acquisition Cost',
      value: formatCurrency(metrics?.cac),
      subtitle: `LTV: ${formatCurrency(metrics?.ltv)}`,
      icon: 'Users',
      status: metrics?.ltvCacRatio >= 3 ? 'positive' : metrics?.ltvCacRatio >= 2 ? 'warning' : 'negative',
      change: metrics?.cacChange
    },
    {
      id: 'mrr',
      title: 'Monthly Recurring Revenue',
      value: formatCurrency(metrics?.mrr),
      subtitle: `${metrics?.mrrGrowth}% growth`,
      icon: 'Repeat',
      status: metrics?.mrrGrowth >= 10 ? 'positive' : metrics?.mrrGrowth >= 5 ? 'warning' : 'negative',
      change: metrics?.mrrChange
    },
    {
      id: 'churn',
      title: 'Churn Rate',
      value: formatPercentage(metrics?.churnRate),
      subtitle: `${metrics?.retentionRate}% retention`,
      icon: 'UserMinus',
      status: metrics?.churnRate <= 5 ? 'positive' : metrics?.churnRate <= 10 ? 'warning' : 'negative',
      change: metrics?.churnChange
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
        <h3 className="text-base sm:text-lg font-semibold text-foreground">Key Financial Metrics</h3>
        <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
          <Icon name="Clock" size={16} className="flex-shrink-0" />
          <span>Updated {new Date()?.toLocaleTimeString()}</span>
        </div>
      </div>
      
      {/* Responsive Grid with Consistent Heights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {metricCards?.map((metric) => (
          <div
            key={metric?.id}
            className="bg-muted/50 rounded-lg p-3 sm:p-4 hover:bg-muted/70 transition-colors min-h-[160px] flex flex-col"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg flex-shrink-0 ${
                metric?.status === 'positive' ? 'bg-success/10' :
                metric?.status === 'warning' ? 'bg-warning/10' :
                metric?.status === 'negative'? 'bg-destructive/10' : 'bg-muted'
              }`}>
                <Icon 
                  name={metric?.icon} 
                  size={16} 
                  className={
                    metric?.status === 'positive' ? 'text-success' :
                    metric?.status === 'warning' ? 'text-warning' :
                    metric?.status === 'negative'? 'text-destructive' : 'text-muted-foreground'
                  }
                />
              </div>
              
              {metric?.change && (
                <div className={`flex items-center space-x-1 flex-shrink-0 ${getStatusColor(metric?.change > 0 ? 'positive' : 'negative')}`}>
                  <Icon 
                    name={getStatusIcon(metric?.change > 0 ? 'positive' : 'negative')} 
                    size={12} 
                  />
                  <span className="text-xs font-medium">
                    {Math.abs(metric?.change)?.toFixed(1)}%
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-1 flex-1">
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide line-clamp-2">
                {metric?.title}
              </h4>
              <div className="text-base sm:text-lg font-bold text-foreground line-clamp-1">
                {metric?.value}
              </div>
              <div className="text-xs text-muted-foreground line-clamp-2">
                {metric?.subtitle}
              </div>
            </div>

            {/* Status Indicator */}
            <div className="mt-3 pt-3 border-t border-border">
              <div className={`flex items-center space-x-2 text-xs ${getStatusColor(metric?.status)}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  metric?.status === 'positive' ? 'bg-success' :
                  metric?.status === 'warning' ? 'bg-warning' :
                  metric?.status === 'negative'? 'bg-destructive' : 'bg-muted-foreground'
                }`}></div>
                <span className="font-medium">
                  {metric?.status === 'positive' ? 'Healthy' :
                   metric?.status === 'warning' ? 'Monitor' :
                   metric?.status === 'negative'? 'Critical' : 'Neutral'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary Insights with Improved Layout */}
      <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-border">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 sm:p-4 min-h-[100px] flex flex-col">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Lightbulb" size={16} className="text-primary flex-shrink-0" />
              <span className="text-sm font-medium text-primary">Key Insight</span>
            </div>
            <p className="text-sm text-foreground flex-1 leading-relaxed">
              {metrics?.breakevenMembers <= 100 
                ? "Your breakeven point is achievable with focused customer acquisition." :"Consider optimizing costs or increasing pricing to improve breakeven metrics."
              }
            </p>
          </div>

          <div className="bg-warning/5 border border-warning/20 rounded-lg p-3 sm:p-4 min-h-[100px] flex flex-col">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="AlertCircle" size={16} className="text-warning flex-shrink-0" />
              <span className="text-sm font-medium text-warning">Recommendation</span>
            </div>
            <p className="text-sm text-foreground flex-1 leading-relaxed">
              {metrics?.ltvCacRatio < 3
                ? "Focus on improving customer lifetime value or reducing acquisition costs."
                : "Your LTV:CAC ratio is healthy. Consider scaling marketing efforts."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsStrip;