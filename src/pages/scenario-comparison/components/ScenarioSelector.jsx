import React from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';


const ScenarioSelector = ({ 
  selectedScenarios, 
  onScenarioChange, 
  availableScenarios, 
  comparisonMode, 
  onComparisonModeChange,
  timeHorizon,
  onTimeHorizonChange 
}) => {
  const comparisonModeOptions = [
    { value: 'absolute', label: 'Absolute Values' },
    { value: 'percentage', label: 'Percentage Variance' }
  ];

  const timeHorizonOptions = [
    { value: '3', label: '3 Months' },
    { value: '6', label: '6 Months' },
    { value: '12', label: '12 Months' },
    { value: '24', label: '24 Months' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 flex-1">
            {[1, 2, 3, 4]?.map((index) => (
              <div key={index} className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Scenario {index}
                </label>
                <Select
                  options={availableScenarios}
                  value={selectedScenarios?.[index - 1] || ''}
                  onChange={(value) => onScenarioChange(index - 1, value)}
                  placeholder={`Select scenario ${index}`}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 lg:w-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Comparison Mode
            </label>
            <Select
              options={comparisonModeOptions}
              value={comparisonMode}
              onChange={onComparisonModeChange}
              className="w-full sm:w-48"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Time Horizon
            </label>
            <Select
              options={timeHorizonOptions}
              value={timeHorizon}
              onChange={onTimeHorizonChange}
              className="w-full sm:w-32"
            />
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
              className="w-full sm:w-auto"
            >
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioSelector;