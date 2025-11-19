import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const OptimizationMatrix = ({ categories, selectedCategories, onCategorySelect }) => {
  const [viewMode, setViewMode] = useState('impact'); // 'impact', 'cost', 'difficulty'
  const [selectedBubble, setSelectedBubble] = useState(null);

  const filteredData = useMemo(() => {
    return categories?.filter(cat => selectedCategories?.includes(cat?.id))?.map(cat => ({
        ...cat,
        x: cat?.implementationDifficulty,
        y: cat?.optimizationPotential,
        z: cat?.monthlyCost,
        color: cat?.optimizationPotential > 70 ? '#10B981' : 
               cat?.optimizationPotential > 40 ? '#F59E0B' : '#EF4444'
      }));
  }, [categories, selectedCategories]);

  const getQuadrantData = () => {
    return {
      quickWins: filteredData?.filter(d => d?.y > 50 && d?.x < 50),
      majorProjects: filteredData?.filter(d => d?.y > 50 && d?.x >= 50),
      fillIns: filteredData?.filter(d => d?.y <= 50 && d?.x < 50),
      thankless: filteredData?.filter(d => d?.y <= 50 && d?.x >= 50)
    };
  };

  const quadrants = getQuadrantData();

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg">
          <h4 className="font-semibold text-foreground mb-2">{data?.name}</h4>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              Monthly Cost: <span className="font-medium text-foreground">${data?.monthlyCost?.toLocaleString()}</span>
            </p>
            <p className="text-muted-foreground">
              Optimization Potential: <span className="font-medium text-foreground">{data?.optimizationPotential}%</span>
            </p>
            <p className="text-muted-foreground">
              Implementation Difficulty: <span className="font-medium text-foreground">{data?.implementationDifficulty}%</span>
            </p>
            <p className="text-muted-foreground">
              Potential Savings: <span className="font-medium text-success">
                ${Math.round(data?.monthlyCost * (data?.optimizationPotential / 100))?.toLocaleString()}/month
              </span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const getBubbleSize = (cost) => {
    const maxCost = Math.max(...filteredData?.map(d => d?.monthlyCost));
    const minSize = 40;
    const maxSize = 120;
    return minSize + ((cost / maxCost) * (maxSize - minSize));
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Target" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Cost Optimization Matrix</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'impact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('impact')}
          >
            Impact View
          </Button>
          <Button
            variant={viewMode === 'cost' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('cost')}
          >
            Cost View
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-success/10 border border-success/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <h4 className="font-medium text-foreground">Quick Wins</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-2">High Impact, Low Effort</p>
          <p className="text-lg font-semibold text-foreground">{quadrants?.quickWins?.length} items</p>
        </div>

        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <h4 className="font-medium text-foreground">Major Projects</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-2">High Impact, High Effort</p>
          <p className="text-lg font-semibold text-foreground">{quadrants?.majorProjects?.length} items</p>
        </div>

        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <h4 className="font-medium text-foreground">Fill-ins</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Low Impact, Low Effort</p>
          <p className="text-lg font-semibold text-foreground">{quadrants?.fillIns?.length} items</p>
        </div>

        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 bg-destructive rounded-full"></div>
            <h4 className="font-medium text-foreground">Thankless Tasks</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-2">Low Impact, High Effort</p>
          <p className="text-lg font-semibold text-foreground">{quadrants?.thankless?.length} items</p>
        </div>
      </div>
      <div className="h-96 w-full chart-high-contrast">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" strokeOpacity={0.3} />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="Implementation Difficulty"
              domain={[0, 100]}
              label={{ value: 'Implementation Difficulty (%)', position: 'insideBottom', offset: -10, style: { fill: 'hsl(var(--color-foreground))' } }}
              tick={{ fill: 'hsl(var(--color-foreground))' }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="Optimization Potential"
              domain={[0, 100]}
              label={{ value: 'Optimization Potential (%)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--color-foreground))' } }}
              tick={{ fill: 'hsl(var(--color-foreground))' }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Enhanced quadrant dividers with better contrast */}
            <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="hsl(var(--color-primary))" strokeDasharray="5,5" strokeWidth={2} opacity={0.6} />
            <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="hsl(var(--color-primary))" strokeDasharray="5,5" strokeWidth={2} opacity={0.6} />
            
            <Scatter data={filteredData} fill="#8884d8">
              {filteredData?.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry?.color}
                  r={getBubbleSize(entry?.monthlyCost) / 8}
                  onClick={() => setSelectedBubble(entry)}
                  style={{ cursor: 'pointer', stroke: 'hsl(var(--color-card))', strokeWidth: 2 }}
                />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span>High Potential (&gt;70%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-warning rounded-full"></div>
            <span>Medium Potential (40-70%)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-destructive rounded-full"></div>
            <span>Low Potential (&lt;40%)</span>
          </div>
        </div>
        <span>Bubble size represents monthly cost</span>
      </div>
    </div>
  );
};

export default OptimizationMatrix;