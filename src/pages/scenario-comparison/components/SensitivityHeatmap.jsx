import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const SensitivityHeatmap = () => {
  const [selectedMetric, setSelectedMetric] = useState('profit');

  const mockHeatmapData = {
    profit: [
      { price: 29, members: 500, value: 12500, color: 'bg-red-500' },
      { price: 29, members: 1000, value: 25000, color: 'bg-orange-400' },
      { price: 29, members: 1500, value: 37500, color: 'bg-yellow-400' },
      { price: 29, members: 2000, value: 50000, color: 'bg-green-400' },
      { price: 29, members: 2500, value: 62500, color: 'bg-green-500' },
      { price: 39, members: 500, value: 17500, color: 'bg-orange-400' },
      { price: 39, members: 1000, value: 35000, color: 'bg-yellow-400' },
      { price: 39, members: 1500, value: 52500, color: 'bg-green-400' },
      { price: 39, members: 2000, value: 70000, color: 'bg-green-500' },
      { price: 39, members: 2500, value: 87500, color: 'bg-green-600' },
      { price: 49, members: 500, value: 22500, color: 'bg-yellow-400' },
      { price: 49, members: 1000, value: 45000, color: 'bg-green-400' },
      { price: 49, members: 1500, value: 67500, color: 'bg-green-500' },
      { price: 49, members: 2000, value: 90000, color: 'bg-green-600' },
      { price: 49, members: 2500, value: 112500, color: 'bg-green-700' },
      { price: 59, members: 500, value: 27500, color: 'bg-green-400' },
      { price: 59, members: 1000, value: 55000, color: 'bg-green-500' },
      { price: 59, members: 1500, value: 82500, color: 'bg-green-600' },
      { price: 59, members: 2000, value: 110000, color: 'bg-green-700' },
      { price: 59, members: 2500, value: 137500, color: 'bg-green-800' }
    ]
  };

  const pricePoints = [29, 39, 49, 59];
  const memberCounts = [500, 1000, 1500, 2000, 2500];

  const getHeatmapValue = (price, members) => {
    const data = mockHeatmapData?.[selectedMetric]?.find(
      item => item?.price === price && item?.members === members
    );
    return data || { value: 0, color: 'bg-gray-200' };
  };

  const formatValue = (value) => {
    if (selectedMetric === 'profit') {
      return `$${(value / 1000)?.toFixed(0)}K`;
    }
    return value?.toLocaleString();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-4 sm:mb-0">
          Sensitivity Analysis Heatmap
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Metric:</span>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e?.target?.value)}
            className="px-3 py-1 border border-border rounded-md text-sm bg-background"
          >
            <option value="profit">Monthly Profit</option>
            <option value="revenue">Revenue</option>
            <option value="roi">ROI %</option>
          </select>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-full">
          {/* Header */}
          <div className="grid grid-cols-6 gap-2 mb-2">
            <div className="text-sm font-medium text-muted-foreground text-center">
              Price / Members
            </div>
            {memberCounts?.map(count => (
              <div key={count} className="text-sm font-medium text-muted-foreground text-center">
                {count?.toLocaleString()}
              </div>
            ))}
          </div>

          {/* Heatmap Grid */}
          {pricePoints?.map(price => (
            <div key={price} className="grid grid-cols-6 gap-2 mb-2">
              <div className="text-sm font-medium text-foreground text-center py-3">
                ${price}
              </div>
              {memberCounts?.map(members => {
                const cellData = getHeatmapValue(price, members);
                return (
                  <div
                    key={`${price}-${members}`}
                    className={`${cellData?.color} rounded-lg p-3 text-center cursor-pointer hover:opacity-80 transition-opacity`}
                    title={`Price: $${price}, Members: ${members?.toLocaleString()}, Value: ${formatValue(cellData?.value)}`}
                  >
                    <div className="text-sm font-semibold text-white">
                      {formatValue(cellData?.value)}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      {/* Legend */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
          <span className="text-sm text-muted-foreground">Profitability:</span>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-xs text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span className="text-xs text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-xs text-muted-foreground">High</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-800 rounded"></div>
            <span className="text-xs text-muted-foreground">Optimal</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Icon name="Info" size={16} />
          <span>Click cells for detailed analysis</span>
        </div>
      </div>
    </div>
  );
};

export default SensitivityHeatmap;