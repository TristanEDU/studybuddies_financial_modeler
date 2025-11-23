import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PerformanceTable = ({ data }) => {
  const [sortField, setSortField] = useState('month');
  const [sortDirection, setSortDirection] = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = [...data]?.sort((a, b) => {
    const aValue = a?.[sortField];
    const bValue = b?.[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(value);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value?.toFixed(1)}%`;
  };

  const getVarianceColor = (value) => {
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  const columns = [
    { key: 'month', label: 'Month', sortable: true },
    { key: 'revenue', label: 'Revenue', sortable: true, format: formatCurrency },
    { key: 'customers', label: 'Customers', sortable: true },
    { key: 'cac', label: 'CAC', sortable: true, format: formatCurrency },
    { key: 'ltv', label: 'LTV', sortable: true, format: formatCurrency },
    { key: 'mrr', label: 'MRR', sortable: true, format: formatCurrency },
    { key: 'variance', label: 'Variance', sortable: true, format: formatPercentage }
  ];

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Monthly Performance Summary</h3>
          <div className="flex items-center space-x-2">
            <button className="flex items-center space-x-1 px-3 py-1 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted">
              <Icon name="Download" size={14} />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-1 px-3 py-1 text-sm text-muted-foreground hover:text-foreground border border-border rounded-md hover:bg-muted">
              <Icon name="Filter" size={14} />
              <span>Filter</span>
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {columns?.map((column) => (
                <th
                  key={column?.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider ${
                    column?.sortable ? 'cursor-pointer hover:bg-muted' : ''
                  }`}
                  onClick={() => column?.sortable && handleSort(column?.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column?.label}</span>
                    {column?.sortable && (
                      <Icon 
                        name={
                          sortField === column?.key 
                            ? sortDirection === 'asc' ? 'ChevronUp' : 'ChevronDown' :'ChevronsUpDown'
                        } 
                        size={12} 
                        className="text-muted-foreground"
                      />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {sortedData?.map((row, index) => (
              <tr key={index} className="hover:bg-muted/30">
                {columns?.map((column) => (
                  <td key={column?.key} className="px-6 py-4 whitespace-nowrap text-sm">
                    {column?.key === 'variance' ? (
                      <span className={`font-medium ${getVarianceColor(row?.[column?.key])}`}>
                        {column?.format ? column?.format(row?.[column?.key]) : row?.[column?.key]}
                      </span>
                    ) : (
                      <span className="text-foreground">
                        {column?.format ? column?.format(row?.[column?.key]) : row?.[column?.key]}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Showing {sortedData?.length} months of data</span>
          <div className="flex items-center space-x-4">
            <span>Last updated: {new Date()?.toLocaleString()}</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span>Live data</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTable;