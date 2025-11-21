import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Icon from '../../../components/AppIcon';

const SynchronizedCharts = ({ scenarios, timeHorizon }) => {
  const [activeChart, setActiveChart] = useState('revenue');

  const generateMockData = (scenarioKey, months) => {
    const baseValues = {
      'baseline-scenario': { revenue: 40000, costs: 30000, profit: 10000 },
      'optimistic-growth': { revenue: 60000, costs: 35000, profit: 25000 },
      'conservative-plan': { revenue: 26000, costs: 24000, profit: 2000 },
      'stress-test': { revenue: 23000, costs: 26000, profit: -3000 }
    };

    const base = baseValues?.[scenarioKey] || baseValues?.['baseline-scenario'];
    
    return Array.from({ length: parseInt(months) }, (_, i) => {
      const month = i + 1;
      const growthFactor = scenarioKey === 'optimistic-growth' ? 1.08 : 
                          scenarioKey === 'conservative-plan' ? 1.03 :
                          scenarioKey === 'stress-test' ? 0.98 : 1.05;
      
      const revenue = base?.revenue * Math.pow(growthFactor, month);
      const costs = base?.costs * Math.pow(1.02, month);
      const profit = revenue - costs;

      return {
        month: `M${month}`,
        revenue: Math.round(revenue),
        costs: Math.round(costs),
        profit: Math.round(profit),
        cumRevenue: Math.round(revenue * month * 0.85),
        cumCosts: Math.round(costs * month * 0.9),
        cumProfit: Math.round(profit * month * 0.8)
      };
    });
  };

  const chartTypes = [
    { key: 'revenue', label: 'Revenue Projections', icon: 'TrendingUp' },
    { key: 'costs', label: 'Cost Analysis', icon: 'TrendingDown' },
    { key: 'profit', label: 'Profitability', icon: 'DollarSign' },
    { key: 'cumulative', label: 'Cumulative View', icon: 'BarChart3' }
  ];

  const scenarioColors = {
    'baseline-scenario': '#3B82F6',
    'optimistic-growth': '#10B981',
    'conservative-plan': '#F59E0B',
    'stress-test': '#EF4444'
  };

  const activeScenarios = scenarios?.filter(s => s);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.color }}
              ></div>
              <span className="text-muted-foreground">{entry?.name}:</span>
              <span className="font-semibold text-foreground">
                ${entry?.value?.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    // Generate data for ALL active scenarios and merge them
    const mergedData = [];
    
    if (activeScenarios?.length > 0) {
      const maxMonths = parseInt(timeHorizon);
      
      for (let i = 0; i < maxMonths; i++) {
        const monthData = { month: `M${i + 1}` };
        
        activeScenarios.forEach((scenario, scenarioIndex) => {
          const scenarioData = generateMockData(scenario, timeHorizon);
          const monthInfo = scenarioData[i];
          
          if (monthInfo) {
            // Add data for each scenario with unique keys
            monthData[`revenue_${scenarioIndex}`] = monthInfo.revenue;
            monthData[`costs_${scenarioIndex}`] = monthInfo.costs;
            monthData[`profit_${scenarioIndex}`] = monthInfo.profit;
            monthData[`cumRevenue_${scenarioIndex}`] = monthInfo.cumRevenue;
            monthData[`cumCosts_${scenarioIndex}`] = monthInfo.cumCosts;
            monthData[`cumProfit_${scenarioIndex}`] = monthInfo.cumProfit;
          }
        });
        
        mergedData.push(monthData);
      }
    }

    if (activeChart === 'cumulative') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={mergedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000)?.toFixed(0)}K`} />
            <Tooltip content={<CustomTooltip />} />
            {activeScenarios?.map((scenario, index) => (
              <Bar
                key={scenario}
                dataKey={`cumRevenue_${index}`}
                fill={scenarioColors?.[scenario]}
                name={`Scenario ${index + 1}`}
                radius={[4, 4, 0, 0]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={mergedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000)?.toFixed(0)}K`} />
          <Tooltip content={<CustomTooltip />} />
          {activeScenarios?.map((scenario, index) => (
            <Line
              key={scenario}
              type="monotone"
              dataKey={`${activeChart}_${index}`}
              stroke={scenarioColors?.[scenario]}
              strokeWidth={3}
              dot={{ r: 4 }}
              name={`Scenario ${index + 1}`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 lg:mb-0">
          Synchronized Financial Projections
        </h3>
        
        <div className="flex flex-wrap gap-2">
          {chartTypes?.map((chart) => (
            <button
              key={chart?.key}
              onClick={() => setActiveChart(chart?.key)}
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${activeChart === chart?.key
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }
              `}
            >
              <Icon name={chart?.icon} size={16} />
              <span>{chart?.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="h-80 mb-4">
        {renderChart()}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-border">
        {activeScenarios?.map((scenario, index) => (
          <div key={scenario} className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: scenarioColors?.[scenario] }}
            ></div>
            <span className="text-sm text-muted-foreground">
              Scenario {index + 1}
            </span>
          </div>
        ))}
      </div>
      {activeScenarios?.length === 0 && (
        <div className="h-80 flex items-center justify-center">
          <div className="text-center">
            <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No Data to Display</h4>
            <p className="text-muted-foreground">
              Select scenarios to view synchronized charts and projections.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SynchronizedCharts;