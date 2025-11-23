import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const GlobalControls = ({ onDateRangeChange, onRefreshIntervalChange, onThresholdUpdate }) => {
  const [dateRange, setDateRange] = useState('30d');
  const [refreshInterval, setRefreshInterval] = useState('5');
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' },
    { value: 'custom', label: 'Custom range' }
  ];

  const refreshOptions = [
    { value: '1', label: '1 minute' },
    { value: '5', label: '5 minutes' },
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: 'manual', label: 'Manual only' }
  ];

  const handleDateRangeChange = (value) => {
    setDateRange(value);
    onDateRangeChange?.(value);
  };

  const handleRefreshChange = (value) => {
    setRefreshInterval(value);
    onRefreshIntervalChange?.(value);
  };

  const handleManualRefresh = () => {
    setLastUpdate(new Date());
    // Trigger data refresh
  };

  const toggleLiveMode = () => {
    setIsLiveMode(!isLiveMode);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-16 gap-4 items-center">
        {/* Date Range Picker */}
        <div className="lg:col-span-4">
          <Select
            label="Date Range"
            options={dateRangeOptions}
            value={dateRange}
            onChange={handleDateRangeChange}
            className="w-full"
          />
        </div>

        {/* Refresh Controls */}
        <div className="lg:col-span-4">
          <Select
            label="Auto Refresh"
            options={refreshOptions}
            value={refreshInterval}
            onChange={handleRefreshChange}
            className="w-full"
          />
        </div>

        {/* Live Mode Toggle */}
        <div className="lg:col-span-3 flex items-center space-x-3">
          <label className="text-sm font-medium text-foreground">Live Mode</label>
          <button
            onClick={toggleLiveMode}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isLiveMode ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isLiveMode ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Manual Refresh & Status */}
        <div className="lg:col-span-5 flex items-center justify-end space-x-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className={`w-2 h-2 rounded-full ${isLiveMode ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span>Updated: {lastUpdate?.toLocaleTimeString()}</span>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            iconName="RefreshCw"
            iconPosition="left"
          >
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            iconName="Settings"
            iconPosition="left"
          >
            Configure
          </Button>
        </div>
      </div>
      {/* Quick Filters */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Quick Filters:</span>
            <div className="flex items-center space-x-2">
              {['All Metrics', 'Critical Only', 'Revenue Focus', 'Customer Focus']?.map((filter) => (
                <button
                  key={filter}
                  className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              iconName="Download"
              iconPosition="left"
            >
              Export Dashboard
            </Button>
            <Button
              variant="ghost"
              size="sm"
              iconName="Share"
              iconPosition="left"
            >
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlobalControls;