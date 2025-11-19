import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const RevenueProjections = ({ projectionData, pricingTiers, membershipGrowth }) => {
  const [selectedTier, setSelectedTier] = useState('all');
  const [viewType, setViewType] = useState('line'); // 'line' or 'area'
  const [timeframe, setTimeframe] = useState('12'); // '6' or '12' months

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US')?.format(value);
  };

  const tierOptions = [
    { value: 'all', label: 'All Tiers' },
    ...pricingTiers?.map(tier => ({
      value: tier?.id,
      label: tier?.name
    }))
  ];

  const timeframeOptions = [
    { value: '6', label: '6 Months' },
    { value: '12', label: '12 Months' },
    { value: '24', label: '24 Months' }
  ];

  const filteredData = projectionData?.slice(0, parseInt(timeframe));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1">
            {payload?.map((entry, index) => (
              <p key={index} className="text-sm">
                <span style={{ color: entry?.color }}>{entry?.name}: </span>
                <span className="font-medium">
                  {entry?.name?.includes('Members') ? formatNumber(entry?.value) : formatCurrency(entry?.value)}
                </span>
              </p>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  const calculateGrowthRate = (current, previous) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous * 100)?.toFixed(1);
  };

  const currentMonth = filteredData?.[filteredData?.length - 1];
  const previousMonth = filteredData?.[filteredData?.length - 2];
  const mrrGrowth = previousMonth ? calculateGrowthRate(currentMonth?.mrr, previousMonth?.mrr) : 0;

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="TrendingUp" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Revenue Projections</h3>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select
            options={tierOptions}
            value={selectedTier}
            onChange={setSelectedTier}
            className="w-32"
          />
          <Select
            options={timeframeOptions}
            value={timeframe}
            onChange={setTimeframe}
            className="w-32"
          />
          <Button
            variant={viewType === 'line' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('line')}
            iconName="TrendingUp"
            iconSize={14}
          >
            Line
          </Button>
          <Button
            variant={viewType === 'area' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewType('area')}
            iconName="AreaChart"
            iconSize={14}
          >
            Area
          </Button>
        </div>
      </div>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="DollarSign" size={16} className="text-success" />
            <span className="text-sm font-medium text-muted-foreground">Current MRR</span>
          </div>
          <div className="text-2xl font-bold text-success">
            {formatCurrency(currentMonth?.mrr || 0)}
          </div>
          <div className="text-sm text-muted-foreground">
            {mrrGrowth > 0 ? '+' : ''}{mrrGrowth}% from last month
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Users" size={16} className="text-primary" />
            <span className="text-sm font-medium text-muted-foreground">Total Members</span>
          </div>
          <div className="text-2xl font-bold text-primary">
            {formatNumber(currentMonth?.totalMembers || 0)}
          </div>
          <div className="text-sm text-muted-foreground">
            Across all tiers
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Calculator" size={16} className="text-accent" />
            <span className="text-sm font-medium text-muted-foreground">ARPU</span>
          </div>
          <div className="text-2xl font-bold text-accent">
            {formatCurrency(currentMonth?.arpu || 0)}
          </div>
          <div className="text-sm text-muted-foreground">
            Average Revenue Per User
          </div>
        </div>

        <div className="bg-muted rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Target" size={16} className="text-warning" />
            <span className="text-sm font-medium text-muted-foreground">Annual Run Rate</span>
          </div>
          <div className="text-2xl font-bold text-warning">
            {formatCurrency((currentMonth?.mrr || 0) * 12)}
          </div>
          <div className="text-sm text-muted-foreground">
            Based on current MRR
          </div>
        </div>
      </div>
      {/* Chart */}
      <div className="h-80 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          {viewType === 'line' ? (
            <LineChart data={filteredData}>
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
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Line
                type="monotone"
                dataKey="mrr"
                stroke="var(--color-success)"
                strokeWidth={3}
                dot={{ fill: 'var(--color-success)', strokeWidth: 2, r: 4 }}
                name="Monthly Recurring Revenue"
              />
              <Line
                type="monotone"
                dataKey="totalRevenue"
                stroke="var(--color-primary)"
                strokeWidth={3}
                dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                name="Total Revenue"
              />
            </LineChart>
          ) : (
            <AreaChart data={filteredData}>
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
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              
              <Area
                type="monotone"
                dataKey="mrr"
                stackId="1"
                stroke="var(--color-success)"
                fill="var(--color-success)"
                fillOpacity={0.6}
                name="Monthly Recurring Revenue"
              />
              <Area
                type="monotone"
                dataKey="oneTimeRevenue"
                stackId="1"
                stroke="var(--color-accent)"
                fill="var(--color-accent)"
                fillOpacity={0.6}
                name="One-time Revenue"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
      {/* Pricing Tier Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Revenue by Pricing Tier</h4>
          <div className="space-y-3">
            {pricingTiers?.map((tier, index) => {
              const tierRevenue = currentMonth?.[`tier${tier?.id}Revenue`] || 0;
              const tierMembers = currentMonth?.[`tier${tier?.id}Members`] || 0;
              const percentage = currentMonth?.mrr ? (tierRevenue / currentMonth?.mrr * 100)?.toFixed(1) : 0;
              
              return (
                <div key={tier?.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      index === 0 ? 'bg-primary' :
                      index === 1 ? 'bg-success' :
                      index === 2 ? 'bg-warning': 'bg-accent'
                    }`}></div>
                    <div>
                      <div className="font-medium text-foreground">{tier?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatNumber(tierMembers)} members • {formatCurrency(tier?.price)}/mo
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-foreground">{formatCurrency(tierRevenue)}</div>
                    <div className="text-sm text-muted-foreground">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-foreground mb-4">Growth Projections</h4>
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="TrendingUp" size={16} className="text-primary" />
                <span className="text-sm font-medium text-primary">Optimistic Scenario</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {formatCurrency((currentMonth?.mrr || 0) * 1.5)} MRR
              </div>
              <div className="text-sm text-muted-foreground">
                50% growth in 6 months
              </div>
            </div>

            <div className="bg-success/5 border border-success/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Target" size={16} className="text-success" />
                <span className="text-sm font-medium text-success">Realistic Scenario</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {formatCurrency((currentMonth?.mrr || 0) * 1.25)} MRR
              </div>
              <div className="text-sm text-muted-foreground">
                25% growth in 6 months
              </div>
            </div>

            <div className="bg-warning/5 border border-warning/20 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="AlertTriangle" size={16} className="text-warning" />
                <span className="text-sm font-medium text-warning">Conservative Scenario</span>
              </div>
              <div className="text-lg font-bold text-foreground">
                {formatCurrency((currentMonth?.mrr || 0) * 1.1)} MRR
              </div>
              <div className="text-sm text-muted-foreground">
                10% growth in 6 months
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueProjections;