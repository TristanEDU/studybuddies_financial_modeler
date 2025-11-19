import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const CostBreakdownTable = ({ categories, selectedCategories, onCategoryUpdate }) => {
  const [editingCell, setEditingCell] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'monthlyCost', direction: 'desc' });

  const filteredCategories = categories?.filter(cat => selectedCategories?.includes(cat?.id));

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig?.key === key && sortConfig?.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedCategories = [...filteredCategories]?.sort((a, b) => {
    if (sortConfig?.direction === 'asc') {
      return a?.[sortConfig?.key] > b?.[sortConfig?.key] ? 1 : -1;
    }
    return a?.[sortConfig?.key] < b?.[sortConfig?.key] ? 1 : -1;
  });

  const startEdit = (categoryId, field, currentValue) => {
    setEditingCell(`${categoryId}-${field}`);
    setEditValue(currentValue?.toString());
  };

  const saveEdit = (categoryId, field) => {
    const numericValue = parseFloat(editValue);
    if (!isNaN(numericValue) && numericValue >= 0) {
      onCategoryUpdate(categoryId, field, numericValue);
    }
    setEditingCell(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) return 'ArrowUpDown';
    return sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  const getOptimizationColor = (potential) => {
    if (potential > 70) return 'text-success bg-success/10';
    if (potential > 40) return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  const getDifficultyColor = (difficulty) => {
    if (difficulty < 30) return 'text-success bg-success/10';
    if (difficulty < 60) return 'text-warning bg-warning/10';
    return 'text-destructive bg-destructive/10';
  };

  const totalMonthlyCost = sortedCategories?.reduce((sum, cat) => sum + cat?.monthlyCost, 0);
  const totalPotentialSavings = sortedCategories?.reduce((sum, cat) => 
    sum + (cat?.monthlyCost * (cat?.optimizationPotential / 100)), 0
  );

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="Table" size={20} className="text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Cost Breakdown Analysis</h3>
          </div>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Total Cost:</span>
              <span className="font-semibold text-foreground">${totalMonthlyCost?.toLocaleString()}/month</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-muted-foreground">Potential Savings:</span>
              <span className="font-semibold text-success">${Math.round(totalPotentialSavings)?.toLocaleString()}/month</span>
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-2 hover:text-primary"
                >
                  <span>Category</span>
                  <Icon name={getSortIcon('name')} size={14} />
                </button>
              </th>
              <th className="text-right p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('monthlyCost')}
                  className="flex items-center space-x-2 hover:text-primary ml-auto"
                >
                  <span>Monthly Cost</span>
                  <Icon name={getSortIcon('monthlyCost')} size={14} />
                </button>
              </th>
              <th className="text-center p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('optimizationPotential')}
                  className="flex items-center space-x-2 hover:text-primary mx-auto"
                >
                  <span>Optimization %</span>
                  <Icon name={getSortIcon('optimizationPotential')} size={14} />
                </button>
              </th>
              <th className="text-center p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('implementationDifficulty')}
                  className="flex items-center space-x-2 hover:text-primary mx-auto"
                >
                  <span>Difficulty %</span>
                  <Icon name={getSortIcon('implementationDifficulty')} size={14} />
                </button>
              </th>
              <th className="text-right p-4 font-medium text-foreground">Potential Savings</th>
              <th className="text-center p-4 font-medium text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedCategories?.map((category, index) => {
              const potentialSavings = Math.round(category?.monthlyCost * (category?.optimizationPotential / 100));
              
              return (
                <tr key={category?.id} className={`border-b border-border hover:bg-muted/30 ${
                  index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                }`}>
                  <td className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        category?.optimizationPotential > 70 ? 'bg-success' :
                        category?.optimizationPotential > 40 ? 'bg-warning' : 'bg-destructive'
                      }`}></div>
                      <div>
                        <p className="font-medium text-foreground">{category?.name}</p>
                        <p className="text-sm text-muted-foreground">{category?.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    {editingCell === `${category?.id}-monthlyCost` ? (
                      <div className="flex items-center justify-end space-x-2">
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e?.target?.value)}
                          className="w-24 text-right bg-card border-2 border-primary text-foreground focus:ring-2 focus:ring-primary"
                          onKeyDown={(e) => {
                            if (e?.key === 'Enter') saveEdit(category?.id, 'monthlyCost');
                            if (e?.key === 'Escape') cancelEdit();
                          }}
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => saveEdit(category?.id, 'monthlyCost')}
                        >
                          <Icon name="Check" size={14} className="text-success" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={cancelEdit}
                        >
                          <Icon name="X" size={14} className="text-destructive" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(category?.id, 'monthlyCost', category?.monthlyCost)}
                        className="font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        ${category?.monthlyCost?.toLocaleString()}
                      </button>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    {editingCell === `${category?.id}-optimizationPotential` ? (
                      <div className="flex items-center justify-center space-x-2">
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e?.target?.value)}
                          className="w-20 text-center bg-card border-2 border-primary text-foreground focus:ring-2 focus:ring-primary"
                          min="0"
                          max="100"
                          onKeyDown={(e) => {
                            if (e?.key === 'Enter') saveEdit(category?.id, 'optimizationPotential');
                            if (e?.key === 'Escape') cancelEdit();
                          }}
                          autoFocus
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => saveEdit(category?.id, 'optimizationPotential')}
                        >
                          <Icon name="Check" size={14} className="text-success" />
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => startEdit(category?.id, 'optimizationPotential', category?.optimizationPotential)}
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getOptimizationColor(category?.optimizationPotential)}`}
                      >
                        {category?.optimizationPotential}%
                      </button>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(category?.implementationDifficulty)}`}>
                      {category?.implementationDifficulty}%
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="text-right">
                      <p className="font-semibold text-success">${potentialSavings?.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">per month</p>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {}}
                        title="View details"
                      >
                        <Icon name="Eye" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {}}
                        title="Edit category"
                      >
                        <Icon name="Edit" size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {}}
                        title="Generate report"
                      >
                        <Icon name="FileText" size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {sortedCategories?.length === 0 && (
        <div className="p-8 text-center">
          <Icon name="Table" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">No Categories Selected</h4>
          <p className="text-muted-foreground">
            Select cost categories from the filters to view detailed breakdown analysis.
          </p>
        </div>
      )}
    </div>
  );
};

export default CostBreakdownTable;