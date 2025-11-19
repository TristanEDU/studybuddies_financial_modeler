import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import Icon from '../../../components/AppIcon';

const BreakevenChart = ({ data, breakeven, pricingScenarios, activePricing, onPricingChange }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(value);
  };

  const formatTooltip = (value, name, props) => {
    if (name === 'revenue' || name === 'costs') {
      return [formatCurrency(value), name === 'revenue' ? 'Revenue' : 'Total Costs'];
    }
    return [value, name];
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const revenue = payload?.find(p => p?.dataKey === 'revenue')?.value || 0;
      const costs = payload?.find(p => p?.dataKey === 'costs')?.value || 0;
      const profit = revenue - costs;
      
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="font-medium text-foreground mb-2">{`Members: ${label}`}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-success">Revenue: </span>
              <span className="font-medium">{formatCurrency(revenue)}</span>
            </p>
            <p className="text-sm">
              <span className="text-destructive">Costs: </span>
              <span className="font-medium">{formatCurrency(costs)}</span>
            </p>
            <p className="text-sm border-t border-border pt-1">
              <span className={profit >= 0 ? "text-success" : "text-destructive"}>
                Profit: 
              </span>
              <span className="font-medium ml-1">{formatCurrency(profit)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="TrendingUp" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Breakeven Analysis</h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-sm text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-destructive rounded-full"></div>
            <span className="text-sm text-muted-foreground">Costs</span>
          </div>
        </div>
      </div>
      {/* Breakeven Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Target" size={16} className="text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Breakeven Point</span>
          </div>
          <div className="text-2xl font-bold text-foreground">
            {breakeven?.members} members
          </div>
          <div className="text-sm text-muted-foreground">
            {formatCurrency(breakeven?.revenue)} revenue
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="DollarSign" size={16} className="text-success" />
            <span className="text-sm font-medium text-muted-foreground">Monthly Revenue</span>
          </div>
          <div className="text-2xl font-bold text-success">
            {formatCurrency(breakeven?.revenue)}
          </div>
          <div className="text-sm text-muted-foreground">
            At breakeven point
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="TrendingDown" size={16} className="text-destructive" />
            <span className="text-sm font-medium text-muted-foreground">Monthly Costs</span>
          </div>
          <div className="text-2xl font-bold text-destructive">
            {formatCurrency(breakeven?.costs)}
          </div>
          <div className="text-sm text-muted-foreground">
            Fixed + Variable
          </div>
        </div>
      </div>
      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="members" 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-muted-foreground)"
              fontSize={12}
              tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Breakeven reference line */}
            <ReferenceLine 
              x={breakeven?.members} 
              stroke="var(--color-primary)" 
              strokeDasharray="5 5"
              label={{ value: "Breakeven", position: "top" }}
            />
            
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="var(--color-success)"
              strokeWidth={3}
              dot={{ fill: 'var(--color-success)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'var(--color-success)', strokeWidth: 2 }}
              name="Revenue"
            />
            <Line
              type="monotone"
              dataKey="costs"
              stroke="var(--color-destructive)"
              strokeWidth={3}
              dot={{ fill: 'var(--color-destructive)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: 'var(--color-destructive)', strokeWidth: 2 }}
              name="Total Costs"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Enhanced Pricing Scenarios with working onClick handlers (Fix for bug #7) */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Pricing Scenarios</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {pricingScenarios?.map((scenario) => (
            <div
              key={scenario?.id}
              onClick={() => onPricingChange?.(scenario?.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md ${
                activePricing === scenario?.id
                  ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">{scenario?.name}</span>
                {activePricing === scenario?.id && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Check" size={14} className="text-primary" />
                    <span className="text-xs text-primary font-medium">Selected</span>
                  </div>
                )}
              </div>
              <div className="text-lg font-bold text-primary mb-1">
                {formatCurrency(scenario?.price)}/mo
              </div>
              <div className="text-xs text-muted-foreground">
                Breakeven: {scenario?.breakeven} members
              </div>
              
              {/* Visual feedback for active state */}
              {activePricing === scenario?.id && (
                <div className="mt-2 h-1 bg-primary rounded-full"></div>
              )}
            </div>
          ))}
        </div>
        
        {/* Pricing Impact Summary */}
        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="TrendingUp" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Pricing Impact</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current Plan:</span>
              <span className="ml-2 font-medium text-foreground">
                {pricingScenarios?.find(p => p?.id === activePricing)?.name || 'Standard'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Monthly Price:</span>
              <span className="ml-2 font-medium text-primary">
                {formatCurrency(pricingScenarios?.find(p => p?.id === activePricing)?.price || 49)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Breakeven:</span>
              <span className="ml-2 font-medium text-foreground">
                {breakeven?.members} members
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreakevenChart;