import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ScenarioControls = ({ 
  scenarios, 
  activeScenario, 
  onScenarioChange, 
  onSaveScenario, 
  onLoadScenario,
  onDeleteScenario,
  onExportData,
  onImportData,
  onOpenImportDialog
}) => {
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newScenarioName, setNewScenarioName] = useState('');
  const [exportFormat, setExportFormat] = useState('pdf');

  const scenarioOptions = scenarios?.map(scenario => ({
    value: scenario?.id,
    label: scenario?.name,
    description: scenario?.description
  }));

  const exportOptions = [
    { value: 'pdf', label: 'PDF Report' },
    { value: 'excel', label: 'Excel Workbook' },
    { value: 'csv', label: 'CSV Data' },
    { value: 'json', label: 'JSON Data' }
  ];

  const handleCreateScenario = () => {
    if (newScenarioName?.trim()) {
      const newScenario = {
        id: `scenario_${Date.now()}`,
        name: newScenarioName?.trim(),
        description: `Created on ${new Date()?.toLocaleDateString()}`,
        createdAt: new Date()?.toISOString(),
        data: { ...activeScenario?.data } // Copy current scenario data
      };
      
      onSaveScenario(newScenario);
      setNewScenarioName('');
      setIsCreatingNew(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event?.target?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e?.target?.result);
          onImportData(data);
        } catch (error) {
          console.error('Error parsing uploaded file:', error);
          alert('Error parsing file. Please ensure it\'s a valid JSON format.');
        }
      };
      reader?.readAsText(file);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Icon name="Settings2" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Scenario Management</h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreatingNew(!isCreatingNew)}
            iconName="Plus"
            iconSize={14}
          >
            New Scenario
          </Button>
        </div>
      </div>
      {/* Active Scenario Info */}
      <div className="bg-muted/50 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-foreground">Current Scenario</h4>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Icon name="Clock" size={14} />
            <span>Last updated: {new Date(activeScenario.updatedAt)?.toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="text-lg font-semibold text-primary">{activeScenario?.name}</div>
        <div className="text-sm text-muted-foreground">{activeScenario?.description}</div>
      </div>
      {/* Create New Scenario */}
      {isCreatingNew && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-foreground mb-3">Create New Scenario</h4>
          <div className="space-y-3">
            <Input
              label="Scenario Name"
              value={newScenarioName}
              onChange={(e) => setNewScenarioName(e?.target?.value)}
              placeholder="Enter scenario name"
            />
            <div className="flex items-center space-x-2">
              <Button
                variant="default"
                size="sm"
                onClick={handleCreateScenario}
                disabled={!newScenarioName?.trim()}
                iconName="Save"
                iconSize={14}
              >
                Create
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsCreatingNew(false);
                  setNewScenarioName('');
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Scenario Selector */}
      <div className="space-y-4 mb-6">
        <Select
          label="Load Scenario"
          options={scenarioOptions}
          value={activeScenario?.id}
          onChange={onScenarioChange}
          placeholder="Select a scenario to load"
        />
      </div>
      {/* Scenario Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Button
          variant="outline"
          onClick={() => onSaveScenario(activeScenario)}
          iconName="Save"
          iconSize={16}
        >
          Save Current
        </Button>
        
        <Button
          variant="outline"
          onClick={() => onLoadScenario(activeScenario?.id)}
          iconName="RefreshCw"
          iconSize={16}
        >
          Reload
        </Button>
      </div>
      {/* Import/Export Section */}
      <div className="border-t border-border pt-6">
        <h4 className="font-medium text-foreground mb-4">Data Management</h4>
        
        <div className="space-y-4">
          {/* Export Controls */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Export Data</label>
            <div className="flex items-center space-x-2">
              <Select
                options={exportOptions}
                value={exportFormat}
                onChange={setExportFormat}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={() => onExportData(exportFormat)}
                iconName="Download"
                iconSize={16}
              >
                Export
              </Button>
            </div>
          </div>

          {/* Import Controls */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Import Data</label>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                fullWidth
                onClick={onOpenImportDialog}
                iconName="Upload"
                iconSize={16}
              >
                Import CSV/JSON
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Import cost data from CSV or JSON files with field mapping support
            </p>
          </div>
        </div>
      </div>
      {/* Scenario History */}
      <div className="border-t border-border pt-6 mt-6">
        <h4 className="font-medium text-foreground mb-4">Recent Scenarios</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {scenarios?.slice(0, 5)?.map((scenario) => (
            <div
              key={scenario?.id}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                scenario?.id === activeScenario?.id
                  ? 'bg-primary/10 border border-primary/20' :'bg-muted/50 hover:bg-muted'
              }`}
              onClick={() => onScenarioChange(scenario?.id)}
            >
              <div className="flex-1">
                <div className="font-medium text-foreground">{scenario?.name}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(scenario.createdAt)?.toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {scenario?.id === activeScenario?.id && (
                  <Icon name="Check" size={16} className="text-primary" />
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onDeleteScenario?.(scenario?.id);
                  }}
                >
                  <Icon name="Trash2" size={14} className="text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Quick Actions */}
      <div className="border-t border-border pt-6 mt-6">
        <h4 className="font-medium text-foreground mb-4">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Reset to default scenario
              const defaultScenario = scenarios?.find(s => s?.name === 'Baseline');
              if (defaultScenario) onScenarioChange(defaultScenario?.id);
            }}
            iconName="RotateCcw"
            iconSize={14}
          >
            Reset to Default
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Duplicate current scenario
              const duplicatedScenario = {
                ...activeScenario,
                id: `scenario_${Date.now()}`,
                name: `${activeScenario?.name} (Copy)`,
                createdAt: new Date()?.toISOString()
              };
              onSaveScenario(duplicatedScenario);
            }}
            iconName="Copy"
            iconSize={14}
          >
            Duplicate
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScenarioControls;