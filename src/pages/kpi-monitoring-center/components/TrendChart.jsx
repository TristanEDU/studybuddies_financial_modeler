import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';

const TrendChart = ({ data, metrics }) => {
  const [selectedMetrics, setSelectedMetrics] = useState(metrics?.map(m => m?.key));
  const [timeRange, setTimeRange] = useState('30d');

  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  const toggleMetric = (metricKey) => {
    setSelectedMetrics(prev => 
      prev?.includes(metricKey) 
        ? prev?.filter(k => k !== metricKey)
        : [...prev, metricKey]
    );
  };

  const timeRangeOptions = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' },
    { value: '1y', label: '1 Year' }
  ];

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">Performance Trends</h3>
        <div className="flex items-center space-x-4">
          {/* Time Range Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e?.target?.value)}
              className="text-sm border border-border bg-background text-foreground rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {timeRangeOptions?.map(option => (
                <option key={option?.value} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1">
            <button className="p-1 text-muted-foreground hover:text-foreground">
              <Icon name="ZoomIn" size={16} />
            </button>
            <button className="p-1 text-muted-foreground hover:text-foreground">
              <Icon name="ZoomOut" size={16} />
            </button>
          </div>
        </div>
      </div>
      {/* Chart */}
      <div className="h-80 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis 
              dataKey="date" 
              className="fill-muted-foreground"
              fontSize={12}
            />
            <YAxis 
              className="fill-muted-foreground"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                color: 'hsl(var(--foreground))'
              }}
            />
            <Legend />
            {metrics?.map((metric, index) => (
              selectedMetrics?.includes(metric?.key) && (
                <Line
                  key={metric?.key}
                  type="monotone"
                  dataKey={metric?.key}
                  stroke={colors?.[index % colors?.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={metric?.name}
                />
              )
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Metric Toggle Buttons */}
      <div className="flex flex-wrap gap-2">
        {metrics?.map((metric, index) => (
          <button
            key={metric?.key}
            onClick={() => toggleMetric(metric?.key)}
            className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedMetrics?.includes(metric?.key)
                ? 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :'bg-muted text-muted-foreground border border-border hover:bg-muted/80'
            }`}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors?.[index % colors?.length] }}
            />
            <span>{metric?.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TrendChart;