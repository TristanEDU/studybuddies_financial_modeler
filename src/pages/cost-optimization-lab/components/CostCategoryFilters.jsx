import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const CostCategoryFilters = ({ categories, selectedCategories, onCategoryChange, onResetFilters }) => {
  const [expandedSections, setExpandedSections] = useState({
    operational: true,
    personnel: true,
    marketing: false,
    technology: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const categoryGroups = {
    operational: {
      title: 'Operational Costs',
      icon: 'Building2',
      categories: categories?.filter(cat => ['office-rent', 'utilities', 'insurance', 'legal']?.includes(cat?.id))
    },
    personnel: {
      title: 'Personnel Costs',
      icon: 'Users',
      categories: categories?.filter(cat => ['salaries', 'benefits', 'contractors', 'training']?.includes(cat?.id))
    },
    marketing: {
      title: 'Marketing & Sales',
      icon: 'Megaphone',
      categories: categories?.filter(cat => ['advertising', 'content', 'events', 'tools']?.includes(cat?.id))
    },
    technology: {
      title: 'Technology & Tools',
      icon: 'Laptop',
      categories: categories?.filter(cat => ['software', 'hosting', 'equipment', 'licenses']?.includes(cat?.id))
    }
  };

  const getTotalCostForGroup = (groupCategories) => {
    return groupCategories?.reduce((sum, cat) => sum + cat?.monthlyCost, 0);
  };

  const getSelectedCountForGroup = (groupCategories) => {
    return groupCategories?.filter(cat => selectedCategories?.includes(cat?.id))?.length;
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 h-fit">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Cost Categories</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          iconName="RotateCcw"
          iconSize={14}
        >
          Reset
        </Button>
      </div>
      <div className="space-y-4">
        {Object.entries(categoryGroups)?.map(([key, group]) => {
          const isExpanded = expandedSections?.[key];
          const totalCost = getTotalCostForGroup(group?.categories);
          const selectedCount = getSelectedCountForGroup(group?.categories);
          const totalCount = group?.categories?.length;

          return (
            <div key={key} className="border border-border rounded-lg">
              <button
                onClick={() => toggleSection(key)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Icon name={group?.icon} size={18} className="text-muted-foreground" />
                  <div className="text-left">
                    <h4 className="font-medium text-foreground">{group?.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      ${totalCost?.toLocaleString()}/month • {selectedCount}/{totalCount} selected
                    </p>
                  </div>
                </div>
                <Icon 
                  name={isExpanded ? "ChevronUp" : "ChevronDown"} 
                  size={16} 
                  className="text-muted-foreground" 
                />
              </button>
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-border">
                  {group?.categories?.map((category) => (
                    <div key={category?.id} className="flex items-center justify-between">
                      <Checkbox
                        label={category?.name}
                        description={`$${category?.monthlyCost?.toLocaleString()}/month`}
                        checked={selectedCategories?.includes(category?.id)}
                        onChange={(e) => onCategoryChange(category?.id, e?.target?.checked)}
                        size="sm"
                      />
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          category?.optimizationPotential > 70 ? 'bg-success' :
                          category?.optimizationPotential > 40 ? 'bg-warning' : 'bg-destructive'
                        }`}></div>
                        <span className="text-xs text-muted-foreground">
                          {category?.optimizationPotential}% potential
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-6 p-4 bg-muted rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Icon name="Info" size={16} className="text-primary" />
          <span className="text-sm font-medium text-foreground">Filter Summary</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {selectedCategories?.length} of {categories?.length} categories selected
        </p>
        <p className="text-sm text-muted-foreground">
          Total filtered cost: ${categories?.filter(cat => selectedCategories?.includes(cat?.id))?.reduce((sum, cat) => sum + cat?.monthlyCost, 0)?.toLocaleString()}/month
        </p>
      </div>
    </div>
  );
};

export default CostCategoryFilters;