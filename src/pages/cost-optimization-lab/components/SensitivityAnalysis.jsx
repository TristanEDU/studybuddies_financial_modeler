import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import Icon from '../../../components/AppIcon';


const SensitivityAnalysis = ({ categories, selectedCategories }) => {
  const [selectedParameter, setSelectedParameter] = useState('monthlyCost');
  const [variationRange, setVariationRange] = useState(20); // ±20%

  const parameters = [
    { id: 'monthlyCost', label: 'Monthly Cost', icon: 'DollarSign', unit: '$' },
    { id: 'optimizationPotential', label: 'Optimization Potential', icon: 'Target', unit: '%' },
    { id: 'implementationDifficulty', label: 'Implementation Difficulty', icon: 'AlertTriangle', unit: '%' }
  ];

  const generateSensitivityData = () => {
    const filteredCategories = categories?.filter(cat => selectedCategories?.includes(cat?.id));
    if (filteredCategories?.length === 0) return [];

    const baseValue = filteredCategories?.reduce((sum, cat) => sum + cat?.[selectedParameter], 0) / filteredCategories?.length;
    const data = [];

    // Generate data points from -variationRange% to +variationRange%
    for (let i = -variationRange; i <= variationRange; i += 2) {
      const variation = i / 100;
      const adjustedValue = baseValue * (1 + variation);
      
      // Calculate impact on total cost and savings
      const totalCost = filteredCategories?.reduce((sum, cat) => {
        if (selectedParameter === 'monthlyCost') {
          return sum + (cat?.monthlyCost * (1 + variation));
        }
        return sum + cat?.monthlyCost;
      }, 0);

      const totalSavings = filteredCategories?.reduce((sum, cat) => {
        let optimizationPotential = cat?.optimizationPotential;
        if (selectedParameter === 'optimizationPotential') {
          optimizationPotential = Math.max(0, Math.min(100, cat?.optimizationPotential * (1 + variation)));
        }
        return sum + (cat?.monthlyCost * (optimizationPotential / 100));
      }, 0);

      const roi = totalSavings > 0 ? (totalSavings * 12) / (totalCost * 0.1) : 0;

      data?.push({
        variation: i,
        adjustedValue: Math.round(adjustedValue),
        totalCost: Math.round(totalCost),
        totalSavings: Math.round(totalSavings),
        roi: Math.round(roi),
        netBenefit: Math.round(totalSavings - (totalCost * 0.05)) // Assuming 5% implementation cost
      });
    }

    return data;
  };

  const sensitivityData = generateSensitivityData();
  const currentParameter = parameters?.find(p => p?.id === selectedParameter);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <h4 className="font-semibold text-foreground mb-2">
            {label > 0 ? '+' : ''}{label}% Variation
          </h4>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              Adjusted {currentParameter?.label}: 
              <span className="font-medium text-foreground ml-1">
                {currentParameter?.unit}{data?.adjustedValue?.toLocaleString()}
              </span>
            </p>
            <p className="text-muted-foreground">
              Total Cost: <span className="font-medium text-foreground">${data?.totalCost?.toLocaleString()}</span>
            </p>
            <p className="text-muted-foreground">
              Total Savings: <span className="font-medium text-success">${data?.totalSavings?.toLocaleString()}</span>
            </p>
            <p className="text-muted-foreground">
              ROI: <span className="font-medium text-foreground">{data?.roi}%</span>
            </p>
            <p className="text-muted-foreground">
              Net Benefit: <span className={`font-medium ${data?.netBenefit > 0 ? 'text-success' : 'text-destructive'}`}>
                ${data?.netBenefit?.toLocaleString()}
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getElasticityScore = () => {
    if (sensitivityData?.length < 2) return 0;
    
    const basePoint = sensitivityData?.find(d => d?.variation === 0);
    const positivePoint = sensitivityData?.find(d => d?.variation === 10);
    
    if (!basePoint || !positivePoint) return 0;
    
    const costChange = (positivePoint?.totalCost - basePoint?.totalCost) / basePoint?.totalCost;
    const savingsChange = (positivePoint?.totalSavings - basePoint?.totalSavings) / basePoint?.totalSavings;
    
    return Math.abs(savingsChange / costChange) || 0;
  };

  const elasticityScore = getElasticityScore();

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Activity" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Sensitivity Analysis</h3>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Range:</span>
          <select
            value={variationRange}
            onChange={(e) => setVariationRange(Number(e?.target?.value))}
            className="px-4 py-2 border-2 border-border rounded-lg text-sm bg-card text-foreground focus:ring-2 focus:ring-primary focus:border-primary transition-all"
          >
            <option value={10}>±10%</option>
            <option value={20}>±20%</option>
            <option value={30}>±30%</option>
            <option value={50}>±50%</option>
          </select>
        </div>
      </div>
      {/* Parameter Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {parameters?.map((param) => (
          <button
            key={param?.id}
            onClick={() => setSelectedParameter(param?.id)}
            className={`p-4 rounded-lg border transition-all ${
              selectedParameter === param?.id
                ? 'border-primary bg-primary/5 text-primary' :'border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center space-x-3">
              <Icon name={param?.icon} size={20} />
              <div className="text-left">
                <h4 className="font-medium">{param?.label}</h4>
                <p className="text-sm opacity-75">Analyze {param?.label?.toLowerCase()} sensitivity</p>
              </div>
            </div>
          </button>
        ))}
      </div>
      {/* Elasticity Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="TrendingUp" size={16} className="text-primary" />
            <span className="text-sm font-medium text-foreground">Elasticity Score</span>
          </div>
          <p className="text-xl font-bold text-foreground">{elasticityScore?.toFixed(2)}</p>
          <p className="text-xs text-muted-foreground">
            {elasticityScore > 1 ? 'High sensitivity' : 'Low sensitivity'}
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Target" size={16} className="text-success" />
            <span className="text-sm font-medium text-foreground">Optimal Point</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {sensitivityData?.length > 0 
              ? `${sensitivityData?.reduce((max, d) => d?.netBenefit > max?.netBenefit ? d : max, sensitivityData?.[0])?.variation}%`
              : '0%'
            }
          </p>
          <p className="text-xs text-muted-foreground">Maximum net benefit</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="AlertTriangle" size={16} className="text-warning" />
            <span className="text-sm font-medium text-foreground">Risk Level</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {elasticityScore > 2 ? 'High' : elasticityScore > 1 ? 'Medium' : 'Low'}
          </p>
          <p className="text-xs text-muted-foreground">Parameter sensitivity risk</p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Shield" size={16} className="text-accent" />
            <span className="text-sm font-medium text-foreground">Stability</span>
          </div>
          <p className="text-xl font-bold text-foreground">
            {elasticityScore < 0.5 ? 'Stable' : elasticityScore < 1.5 ? 'Moderate' : 'Volatile'}
          </p>
          <p className="text-xs text-muted-foreground">Cost structure stability</p>
        </div>
      </div>
      {/* Sensitivity Chart */}
      <div className="h-80 w-full chart-high-contrast">
        {sensitivityData?.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sensitivityData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" strokeOpacity={0.4} />
              <XAxis 
                dataKey="variation" 
                label={{ value: `${currentParameter?.label} Variation (%)`, position: 'insideBottom', offset: -10, style: { fill: 'hsl(var(--color-foreground))' } }}
                tick={{ fill: 'hsl(var(--color-foreground))' }}
              />
              <YAxis 
                label={{ value: 'Net Benefit ($)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--color-foreground))' } }}
                tick={{ fill: 'hsl(var(--color-foreground))' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine x={0} stroke="hsl(var(--color-destructive))" strokeDasharray="5,5" strokeWidth={2} />
              <ReferenceLine y={0} stroke="hsl(var(--color-muted-foreground))" strokeDasharray="2,2" strokeWidth={1} />
              
              <Line 
                type="monotone" 
                dataKey="netBenefit" 
                stroke="hsl(var(--color-primary))" 
                strokeWidth={4}
                dot={{ fill: 'hsl(var(--color-primary))', strokeWidth: 3, r: 6, stroke: 'hsl(var(--color-card))' }}
                activeDot={{ r: 8, stroke: 'hsl(var(--color-primary))', strokeWidth: 3, fill: 'hsl(var(--color-card))' }}
              />
              <Line 
                type="monotone" 
                dataKey="totalSavings" 
                stroke="hsl(var(--color-success))" 
                strokeWidth={3}
                strokeDasharray="5,5"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Icon name="Activity" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">No Data Available</h4>
              <p className="text-muted-foreground">
                Select cost categories to perform sensitivity analysis.
              </p>
            </div>
          </div>
        )}
      </div>
      {/* Analysis Insights */}
      {sensitivityData?.length > 0 && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <Icon name="Lightbulb" size={16} className="text-primary" />
            <h4 className="font-medium text-foreground">Analysis Insights</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Sensitivity Level:</strong> 
                {elasticityScore > 2 
                  ? ' High - Small changes have large impacts on outcomes'
                  : elasticityScore > 1 
                  ? 'Moderate - Changes have proportional impacts' :' Low - Changes have minimal impact on outcomes'
                }
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">
                <strong className="text-foreground">Recommendation:</strong> 
                {elasticityScore > 2 
                  ? ' Exercise caution when making adjustments'
                  : elasticityScore > 1 
                  ? ' Monitor changes carefully for optimal results'
                  : ' Safe to make moderate adjustments'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensitivityAnalysis;