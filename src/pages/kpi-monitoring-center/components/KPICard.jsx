import React from 'react';
import Icon from '../../../components/AppIcon';

const KPICard = ({ title, value, unit, trend, trendValue, status, sparklineData, threshold }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800';
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return 'TrendingUp';
    if (trend === 'down') return 'TrendingDown';
    return 'Minus';
  };

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 dark:text-green-400';
    if (trend === 'down') return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  return (
    <div className={`bg-card rounded-lg border-2 p-6 ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">{title}</h3>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-bold text-foreground">{value}</span>
            <span className="text-sm text-muted-foreground">{unit}</span>
          </div>
        </div>
        <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
          <Icon name={getTrendIcon()} size={16} />
          <span className="text-sm font-medium">{trendValue}</span>
        </div>
      </div>
      {/* Sparkline Visualization */}
      <div className="mb-3">
        <div className="flex items-end space-x-1 h-8">
          {sparklineData?.map((point, index) => (
            <div
              key={index}
              className="bg-blue-200 dark:bg-blue-800 rounded-sm flex-1"
              style={{ height: `${(point / Math.max(...sparklineData)) * 100}%` }}
            />
          ))}
        </div>
      </div>
      {/* Threshold Information */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Threshold: {threshold}</span>
        <div className={`w-2 h-2 rounded-full ${
          status === 'good' ? 'bg-green-500' : 
          status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
        }`} />
      </div>
    </div>
  );
};

export default KPICard;