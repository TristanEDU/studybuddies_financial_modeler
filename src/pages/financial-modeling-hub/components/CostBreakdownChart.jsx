import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const CostBreakdownChart = ({ costData, monthlyProjections }) => {
  const [viewMode, setViewMode] = useState('pie'); // 'pie' or 'bar'
  const [timeframe, setTimeframe] = useState('current'); // 'current' or 'projected'

  const COLORS = [
    'var(--color-primary)',
    'var(--color-secondary)',
    'var(--color-accent)',
    'var(--color-warning)',
    'var(--color-destructive)',
    'var(--color-success)',
    '#8B5CF6',
    '#F59E0B'
  ];

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(value);
  };

  const calculatePercentage = (value, total) => {
    return ((value / total) * 100)?.toFixed(1);
  };

  const totalCosts = costData?.reduce((sum, item) => sum + item?.value, 0);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{data?.name}</p>
          <p className="text-primary font-semibold">{formatCurrency(data?.value)}</p>
          <p className="text-sm text-muted-foreground">
            {calculatePercentage(data?.value, totalCosts)}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload?.map((entry, index) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry?.color }}
            ></div>
            <span className="text-sm text-foreground">{entry?.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="PieChart" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Cost Structure Analysis</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'pie' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('pie')}
            iconName="PieChart"
            iconSize={14}
          >
            Pie
          </Button>
          <Button
            variant={viewMode === 'bar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('bar')}
            iconName="BarChart3"
            iconSize={14}
          >
            Bar
          </Button>
        </div>
      </div>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-muted rounded-lg p-3">
          <div className="text-sm text-muted-foreground">Total Monthly</div>
          <div className="text-xl font-bold text-foreground">{formatCurrency(totalCosts)}</div>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <div className="text-sm text-muted-foreground">Largest Category</div>
          <div className="text-lg font-semibold text-foreground">
            {costData?.reduce((max, item) => item?.value > max?.value ? item : max, costData?.[0])?.name}
          </div>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <div className="text-sm text-muted-foreground">Fixed Costs</div>
          <div className="text-lg font-semibold text-foreground">
            {formatCurrency(costData?.filter(item => item?.type === 'fixed')?.reduce((sum, item) => sum + item?.value, 0))}
          </div>
        </div>
        <div className="bg-muted rounded-lg p-3">
          <div className="text-sm text-muted-foreground">Variable Costs</div>
          <div className="text-lg font-semibold text-foreground">
            {formatCurrency(costData?.filter(item => item?.type === 'variable')?.reduce((sum, item) => sum + item?.value, 0))}
          </div>
        </div>
      </div>
      {/* Chart Area */}
      <div className="h-80 w-full">
        {viewMode === 'pie' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={costData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100)?.toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {costData?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={costData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                dataKey="name" 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="var(--color-muted-foreground)"
                fontSize={12}
                tickFormatter={formatCurrency}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {/* Detailed Breakdown */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-4">Detailed Breakdown</h4>
        <div className="space-y-3">
          {costData?.map((item, index) => (
            <div key={item?.name} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: COLORS?.[index % COLORS?.length] }}
                ></div>
                <div>
                  <div className="font-medium text-foreground">{item?.name}</div>
                  <div className="text-sm text-muted-foreground capitalize">{item?.type} cost</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold text-foreground">{formatCurrency(item?.value)}</div>
                <div className="text-sm text-muted-foreground">
                  {calculatePercentage(item?.value, totalCosts)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Monthly Projections */}
      {monthlyProjections && (
        <div className="mt-6 pt-6 border-t border-border">
          <h4 className="text-sm font-medium text-foreground mb-4">6-Month Cost Projection</h4>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyProjections}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), 'Total Costs']}
                  labelStyle={{ color: 'var(--color-foreground)' }}
                />
                <Bar 
                  dataKey="totalCosts" 
                  fill="var(--color-secondary)" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      {/* Cost Optimization Suggestions */}
      <div className="mt-6 pt-6 border-t border-border">
        <h4 className="text-sm font-medium text-foreground mb-3">Optimization Opportunities</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-success/5 border border-success/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="TrendingDown" size={16} className="text-success" />
              <span className="text-sm font-medium text-success">Cost Reduction</span>
            </div>
            <p className="text-sm text-foreground">
              Consider negotiating better rates for your largest cost categories or exploring automation opportunities.
            </p>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Zap" size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">Efficiency Gains</span>
            </div>
            <p className="text-sm text-foreground">
              Focus on converting variable costs to fixed costs through volume discounts and long-term contracts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdownChart;