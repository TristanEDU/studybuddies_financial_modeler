import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const WaterfallChart = ({ scenarios }) => {
  const mockWaterfallData = [
    { name: 'Starting Revenue', value: 0, cumulative: 0, type: 'start' },
    { name: 'Membership Revenue', value: 180000, cumulative: 180000, type: 'positive' },
    { name: 'Course Sales', value: 95000, cumulative: 275000, type: 'positive' },
    { name: 'Premium Features', value: 45000, cumulative: 320000, type: 'positive' },
    { name: 'Employee Costs', value: -125000, cumulative: 195000, type: 'negative' },
    { name: 'Marketing Spend', value: -65000, cumulative: 130000, type: 'negative' },
    { name: 'Infrastructure', value: -28000, cumulative: 102000, type: 'negative' },
    { name: 'Operations', value: -22000, cumulative: 80000, type: 'negative' },
    { name: 'Net Profit', value: 80000, cumulative: 80000, type: 'end' }
  ];

  const getBarColor = (type) => {
    switch (type) {
      case 'positive': return '#10B981';
      case 'negative': return '#EF4444';
      case 'start': return '#6B7280';
      case 'end': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-sm text-muted-foreground">
            Value: <span className="font-semibold">${data?.value?.toLocaleString()}</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Cumulative: <span className="font-semibold">${data?.cumulative?.toLocaleString()}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Cost Structure Waterfall</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded"></div>
            <span className="text-muted-foreground">Revenue</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-destructive rounded"></div>
            <span className="text-muted-foreground">Costs</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-primary rounded"></div>
            <span className="text-muted-foreground">Net Result</span>
          </div>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={mockWaterfallData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `$${(value / 1000)?.toFixed(0)}K`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {mockWaterfallData?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry?.type)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-lg font-semibold text-success">$320K</div>
          <div className="text-muted-foreground">Total Revenue</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-destructive">$240K</div>
          <div className="text-muted-foreground">Total Costs</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-primary">$80K</div>
          <div className="text-muted-foreground">Net Profit</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-foreground">25%</div>
          <div className="text-muted-foreground">Profit Margin</div>
        </div>
      </div>
    </div>
  );
};

export default WaterfallChart;