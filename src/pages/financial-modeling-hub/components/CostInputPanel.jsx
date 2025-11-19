import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

import Select from '../../../components/ui/Select';

// Enhanced validation utilities
const ValidationUtils = {
  validateCostValue: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 10000000;
  },
  
  validateCategoryName: (name) => {
    return name && typeof name === 'string' && name?.trim()?.length > 0 && name?.length <= 50;
  },
  
  validateEmployeeCount: (count) => {
    const num = parseInt(count);
    return !isNaN(num) && num >= 0 && num <= 10000;
  },
  
  sanitizeInput: (input) => {
    return typeof input === 'string' ? input?.trim()?.replace(/[<>]/g, '') : input;
  }
};

// Debounced input handler
const useDebouncedCallback = (callback, delay) => {
  const timeoutRef = useRef(null);
  
  return useCallback((...args) => {
    if (timeoutRef?.current) {
      clearTimeout(timeoutRef?.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
};

// Error boundary
const ErrorBoundary = ({ children, fallback }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    const handleError = () => setHasError(true);
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (hasError) {
    return fallback || <div className="text-red-500">Something went wrong. Please refresh.</div>;
  }
  
  return children;
};

const CostInputPanel = ({ 
  costs, 
  onCostChange, 
  onToggleCategory, 
  onRemoveItem,
  onAddCategory,
  openDropdown, 
  closeAllDropdowns, 
  currentOpenDropdown 
}) => {
  const [state, setState] = useState({
    expandedCategories: {
      personnel: true,
      operations: true,
      marketing: true,
      technology: true
    },
    currency: 'USD',
    period: 'monthly',
    showAddCategory: false,
    newCategoryName: '',
    newCategoryType: 'fixed',
    showCustomAmountModal: false,
    customAmountTarget: null,
    customAmount: '',
    showAddItemModal: false,
    selectedCategory: null,
    newItemForm: {
      name: '',
      value: 0,
      quantity: 1,
      type: 'fixed'
    },
    isLoading: false,
    errors: {}
  });

  const currencyRef = useRef();
  const periodRef = useRef();
  const containerRef = useRef();

  // Currency and period options
  const currencies = useMemo(() => [
    { value: 'USD', label: '$', name: 'US Dollar' },
    { value: 'EUR', label: '€', name: 'Euro' },
    { value: 'GBP', label: '£', name: 'British Pound' },
    { value: 'CAD', label: 'C$', name: 'Canadian Dollar' },
    { value: 'AUD', label: 'A$', name: 'Australian Dollar' },
    { value: 'JPY', label: '¥', name: 'Japanese Yen' }
  ], []);

  const periods = useMemo(() => [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' }
  ], []);

  // Employee roles with proper defaults
  const employeeRoleOptions = useMemo(() => [
    { value: 'ceo', label: 'CEO', defaultValue: 25000, minValue: 0, maxValue: 100000, step: 1000 },
    { value: 'cto', label: 'CTO', defaultValue: 20000, minValue: 0, maxValue: 80000, step: 1000 },
    { value: 'senior-dev', label: 'Senior Developer', defaultValue: 12000, minValue: 0, maxValue: 30000, step: 500 },
    { value: 'mid-dev', label: 'Mid-level Developer', defaultValue: 8000, minValue: 0, maxValue: 18000, step: 500 },
    { value: 'junior-dev', label: 'Junior Developer', defaultValue: 5000, minValue: 0, maxValue: 12000, step: 250 },
    { value: 'designer', label: 'UI/UX Designer', defaultValue: 7000, minValue: 0, maxValue: 15000, step: 500 },
    { value: 'product-manager', label: 'Product Manager', defaultValue: 11000, minValue: 0, maxValue: 25000, step: 500 },
    { value: 'qa-engineer', label: 'QA Engineer', defaultValue: 6000, minValue: 0, maxValue: 16000, step: 250 }
  ], []);

  // Debounced cost change handler
  const debouncedCostChange = useDebouncedCallback((category, field, value) => {
    if (ValidationUtils?.validateCostValue(value) || value === 0) {
      onCostChange(category, field, value);
      setState(prev => ({
        ...prev,
        errors: { ...prev?.errors, [`${category}.${field}`]: null }
      }));
    } else {
      setState(prev => ({
        ...prev,
        errors: { ...prev?.errors, [`${category}.${field}`]: 'Invalid cost value' }
      }));
    }
  }, 300);

  // Enhanced dropdown handlers
  const handleCurrencyDropdownToggle = useCallback((e) => {
    try {
      e?.stopPropagation();
      const isOpen = currentOpenDropdown === 'currency';
      if (isOpen) {
        closeAllDropdowns();
      } else {
        openDropdown('currency');
      }
    } catch (error) {
      console.error('Currency dropdown error:', error);
    }
  }, [currentOpenDropdown, closeAllDropdowns, openDropdown]);

  const handlePeriodDropdownToggle = useCallback((e) => {
    try {
      e?.stopPropagation();
      const isOpen = currentOpenDropdown === 'period';
      if (isOpen) {
        closeAllDropdowns();
      } else {
        openDropdown('period');
      }
    } catch (error) {
      console.error('Period dropdown error:', error);
    }
  }, [currentOpenDropdown, closeAllDropdowns, openDropdown]);

  const handleCurrencySelect = useCallback((currencyValue) => {
    try {
      setState(prev => ({ ...prev, currency: currencyValue }));
      closeAllDropdowns();
    } catch (error) {
      console.error('Currency selection error:', error);
    }
  }, [closeAllDropdowns]);

  const handlePeriodSelect = useCallback((periodValue) => {
    try {
      setState(prev => ({ ...prev, period: periodValue }));
      closeAllDropdowns();
    } catch (error) {
      console.error('Period selection error:', error);
    }
  }, [closeAllDropdowns]);

  // Enhanced currency formatting
  const formatCurrency = useCallback((value) => {
    try {
      const currencyData = currencies?.find(c => c?.value === state?.currency);
      const symbol = currencyData?.label || '$';
      
      if (value === 0) return `${symbol}0`;
      
      const formattedValue = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: state.currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })?.format(Math.abs(value || 0));
      
      return formattedValue?.replace(/[A-Z]{3}/, symbol);
    } catch (error) {
      console.error('Currency formatting error:', error);
      return `$${(value || 0)?.toLocaleString()}`;
    }
  }, [currencies, state?.currency]);

  // Category toggle handler
  const toggleCategory = useCallback((category, value) => {
    try {
      setState(prev => ({
        ...prev,
        expandedCategories: {
          ...prev?.expandedCategories,
          [category]: value
        }
      }));
      if (onToggleCategory) {
        onToggleCategory(category, value);
      }
    } catch (error) {
      console.error('Category toggle error:', error);
    }
  }, [onToggleCategory]);

  // Slider change handler
  const handleSliderChange = useCallback((category, field, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      debouncedCostChange(category, field, numValue);
    }
  }, [debouncedCostChange]);

  // Quantity change handler
  const handleQuantityChange = useCallback((category, field, quantity) => {
    const numQuantity = parseInt(quantity);
    if (ValidationUtils?.validateEmployeeCount(numQuantity) || numQuantity === 0) {
      const quantityField = `${field}_quantity`;
      debouncedCostChange(category, quantityField, numQuantity);
    }
  }, [debouncedCostChange]);

  // Custom amount handlers
  const handleCustomAmountClick = useCallback((category, field, currentValue) => {
    try {
      setState(prev => ({
        ...prev,
        customAmountTarget: { category, field },
        customAmount: currentValue?.toString() || '0',
        showCustomAmountModal: true
      }));
    } catch (error) {
      console.error('Custom amount modal error:', error);
    }
  }, []);

  const saveCustomAmount = useCallback(() => {
    try {
      const { customAmountTarget, customAmount } = state;
      if (customAmountTarget && customAmount !== '') {
        const amount = parseFloat(customAmount);
        if (ValidationUtils?.validateCostValue(amount) || amount === 0) {
          handleSliderChange(customAmountTarget?.category, customAmountTarget?.field, amount);
          setState(prev => ({
            ...prev,
            showCustomAmountModal: false,
            customAmountTarget: null,
            customAmount: '',
            errors: { ...prev?.errors, customAmount: null }
          }));
        } else {
          setState(prev => ({
            ...prev,
            errors: { ...prev?.errors, customAmount: 'Invalid amount entered' }
          }));
        }
      }
    } catch (error) {
      console.error('Save custom amount error:', error);
    }
  }, [state, handleSliderChange]);

  const closeCustomAmountModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      showCustomAmountModal: false,
      customAmountTarget: null,
      customAmount: '',
      errors: { ...prev?.errors, customAmount: null }
    }));
  }, []);

  // ENHANCED: Get cost value with proper type checking
  const getCostValue = useCallback((category, field) => {
    try {
      if (!costs || typeof costs !== 'object') return 0;
      
      const categoryData = costs?.[category];
      if (!categoryData || typeof categoryData !== 'object') return 0;
      
      const keys = field?.split('.');
      let current = categoryData;
      
      for (const key of keys) {
        if (!current || typeof current !== 'object' || Array.isArray(current)) {
          return 0;
        }
        current = current?.[key];
      }
      
      return Number(current) || 0;
    } catch (error) {
      console.error('Error getting cost value:', error);
      return 0;
    }
  }, [costs]);

  // ENHANCED: Get quantity value with proper validation  
  const getQuantityValue = useCallback((category, field) => {
    try {
      if (!costs || typeof costs !== 'object') return 1;
      
      const categoryData = costs?.[category];
      if (!categoryData || typeof categoryData !== 'object') return 1;
      
      const quantityField = `${field}_quantity`;
      const keys = quantityField?.split('.');
      let current = categoryData;
      
      for (const key of keys) {
        if (!current || typeof current !== 'object' || Array.isArray(current)) {
          return 1;
        }
        current = current?.[key];
      }
      
      return Number(current) || 1;
    } catch (error) {
      console.error('Error getting quantity value:', error);
      return 1;
    }
  }, [costs]);

  // ENHANCED: Slider input with proper error handling and remove functionality
  const renderSliderInput = useCallback((category, field, defaultValue, min, max, step, label, unit, disabled = false) => {
    const errorKey = `${category}.${field}`;
    const hasError = state?.errors?.[errorKey];
    const currentValue = getCostValue(category, field) || defaultValue || 0;
    const currentQuantity = getQuantityValue(category, field);
    const totalCost = currentValue * currentQuantity;
    
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">
            {label}
            <span className="text-xs text-muted-foreground ml-2">{unit}</span>
          </label>
          <div className="flex items-center space-x-2">
            {hasError && (
              <span className="text-xs text-destructive flex items-center">
                <Icon name="AlertTriangle" size={12} className="mr-1" />
                Error
              </span>
            )}
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => handleCustomAmountClick(category, field, currentValue)}
              className="text-xs text-primary hover:text-primary/80 h-6 px-2"
              disabled={disabled}
            >
              Custom Amount
            </Button>
            {/* ENHANCED: Remove button with proper confirmation */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (window.confirm(`Remove ${label}? This action cannot be undone.`)) {
                  if (onRemoveItem) {
                    onRemoveItem(category, field);
                  } else {
                    // Fallback to setting value to 0
                    debouncedCostChange(category, field, 0);
                    debouncedCostChange(category, `${field}_quantity`, 0);
                  }
                }
              }}
              className="text-xs text-destructive hover:text-destructive/80 h-6 px-2"
              disabled={disabled}
            >
              <Icon name="Trash2" size={12} />
            </Button>
          </div>
        </div>

        {/* ENHANCED: Quantity Control with better validation */}
        <div className="flex items-center space-x-2">
          <label className="text-xs font-medium text-muted-foreground min-w-[60px]">
            Quantity:
          </label>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newQuantity = Math.max(0, currentQuantity - 1);
                handleQuantityChange(category, field, newQuantity);
              }}
              disabled={disabled || currentQuantity <= 0}
              className="h-7 w-7 p-0"
            >
              <Icon name="Minus" size={12} />
            </Button>
            <input
              type="number"
              min="0"
              max="100"
              value={currentQuantity}
              onChange={(e) => {
                const newValue = parseInt(e?.target?.value) || 0;
                handleQuantityChange(category, field, newValue);
              }}
              className="w-16 h-7 px-2 text-center text-xs border border-border rounded bg-background"
              disabled={disabled}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newQuantity = currentQuantity + 1;
                handleQuantityChange(category, field, newQuantity);
              }}
              disabled={disabled}
              className="h-7 w-7 p-0"
            >
              <Icon name="Plus" size={12} />
            </Button>
            <span className="text-xs text-muted-foreground min-w-[40px]">
              {currentQuantity === 1 ? 'item' : 'items'}
            </span>
          </div>
        </div>
        
        {/* ENHANCED: Slider with better error handling */}
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min={min || 0}
            max={max || 100000}
            step={step || 100}
            value={currentValue}
            onChange={(e) => {
              const newValue = parseFloat(e?.target?.value) || 0;
              handleSliderChange(category, field, newValue);
            }}
            className={`flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer slider ${
              hasError ? 'border-destructive' : ''
            }`}
            disabled={disabled}
            aria-label={`${label} slider`}
            aria-describedby={hasError ? `${errorKey}-error` : undefined}
          />
          <div className="text-right min-w-[120px]">
            <div className="text-sm font-bold text-primary">
              {formatCurrency(currentValue)}
            </div>
            {currentQuantity > 1 && (
              <div className="text-xs text-muted-foreground">
                Total: {formatCurrency(totalCost)}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatCurrency(min || 0)}</span>
          <span>{formatCurrency(max || 100000)}</span>
        </div>
        
        {hasError && (
          <div id={`${errorKey}-error`} className="text-xs text-destructive mt-1">
            {hasError}
          </div>
        )}
      </div>
    );
  }, [state?.errors, handleCustomAmountClick, handleSliderChange, handleQuantityChange, getCostValue, getQuantityValue, formatCurrency, debouncedCostChange, onRemoveItem]);

  // Category type options
  const categoryTypeOptions = useMemo(() => [
    { value: 'fixed', label: 'Fixed Cost' },
    { value: 'variable', label: 'Variable Cost' },
    { value: 'one-time', label: 'One-time Cost' }
  ], []);

  // Helper to get expanded state
  const expandedCategories = useMemo(() => state?.expandedCategories, [state?.expandedCategories]);

  // ENHANCED: Category section with improved item counting
  const renderCategorySection = useCallback((categoryKey, iconName, title, defaultItems) => {
    const isExpanded = expandedCategories?.[categoryKey];
    
    // FIXED: Proper item counting with structure validation
    const getCategoryItemCount = () => {
      try {
        if (!costs || typeof costs !== 'object') return 0;
        
        const categoryData = costs?.[categoryKey];
        if (!categoryData || typeof categoryData !== 'object') return 0;
        
        if (categoryKey === 'personnel') {
          const rolesCount = categoryData?.employees?.roles ? Object.keys(categoryData?.employees?.roles)?.length : 0;
          const contractorsCount = categoryData?.contractors?.types ? Object.keys(categoryData?.contractors?.types)?.length : 0;
          return rolesCount + contractorsCount;
        } else if (['operations', 'marketing', 'technology']?.includes(categoryKey)) {
          return categoryData?.items ? Object.keys(categoryData?.items)?.length : 0;
        } else {
          // Custom categories
          return categoryData?.items ? Object.keys(categoryData?.items)?.length : 0;
        }
      } catch (error) {
        console.error('Error counting items:', error);
        return 0;
      }
    };

    const itemCount = getCategoryItemCount();
    
    return (
      <div key={categoryKey} className="space-y-4 mb-6">
        <button
          onClick={() => toggleCategory(categoryKey, !isExpanded)}
          className="flex items-center justify-between w-full p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg hover:from-primary/15 hover:to-primary/10 transition-all"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/20 rounded-lg">
              <Icon name={iconName} size={20} className="text-primary" />
            </div>
            <div className="text-left">
              <span className="font-semibold text-foreground text-base">{title}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {itemCount} items
              </span>
            </div>
          </div>
          <Icon 
            name={isExpanded ? "ChevronUp" : "ChevronDown"} 
            size={18} 
            className="text-muted-foreground" 
          />
        </button>
        {isExpanded && (
          <div className="space-y-4 pl-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {defaultItems?.map(item => (
                <div key={item?.value} className="bg-card border border-border rounded-lg p-4">
                  {renderSliderInput(
                    categoryKey,
                    item?.value,
                    item?.defaultValue,
                    item?.minValue,
                    item?.maxValue,
                    item?.step,
                    item?.label,
                    state?.currency
                  )}
                </div>
              ))}
            </div>
            
            {/* ENHANCED: Add Item Button */}
            <div className="bg-muted/20 border border-dashed border-border/50 rounded-lg p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setState(prev => ({
                    ...prev,
                    showAddItemModal: true,
                    selectedCategory: categoryKey,
                    newItemForm: {
                      name: '',
                      value: 0,
                      quantity: 1,
                      type: 'fixed'
                    }
                  }));
                }}
                className="w-full"
              >
                <Icon name="Plus" size={14} className="mr-2" />
                Add Custom Item
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }, [expandedCategories, toggleCategory, renderSliderInput, state?.currency, costs]);

  // ENHANCED: Add category handler with proper validation
  const handleAddCategory = useCallback(() => {
    try {
      const { newCategoryName, newCategoryType } = state;
      const sanitizedName = ValidationUtils?.sanitizeInput(newCategoryName);
      
      if (ValidationUtils?.validateCategoryName(sanitizedName)) {
        // Use the new onAddCategory prop if available
        if (onAddCategory) {
          onAddCategory(sanitizedName, newCategoryType);
        } else {
          // Fallback to onCostChange
          onCostChange('customCategories', `${sanitizedName}.name`, sanitizedName);
          onCostChange('customCategories', `${sanitizedName}.type`, newCategoryType);
          onCostChange('customCategories', `${sanitizedName}.enabled`, true);
          onCostChange('customCategories', `${sanitizedName}.items`, {});
        }
        
        setState(prev => ({
          ...prev,
          newCategoryName: '',
          newCategoryType: 'fixed',
          showAddCategory: false,
          expandedCategories: {
            ...prev?.expandedCategories,
            [sanitizedName]: true
          },
          errors: { ...prev?.errors, categoryName: null }
        }));
      } else {
        setState(prev => ({
          ...prev,
          errors: { ...prev?.errors, categoryName: 'Invalid category name' }
        }));
      }
    } catch (error) {
      console.error('Add category error:', error);
    }
  }, [state, onCostChange, onAddCategory]);

  // FIXED: Add item handler with proper nested structure using onCostChange
  const handleAddItem = useCallback(() => {
    try {
      const { selectedCategory, newItemForm } = state;
      if (selectedCategory && newItemForm?.name) {
        const sanitizedName = ValidationUtils?.sanitizeInput(newItemForm?.name);
        const itemKey = sanitizedName?.toLowerCase()?.replace(/\s+/g, '_');
        
        // CRITICAL FIX: Use onCostChange instead of setCosts
        if (selectedCategory === 'personnel') {
          // Personnel has different structure - add to roles
          onCostChange('personnel', `employees.roles.${itemKey}`, {
            name: sanitizedName,
            value: newItemForm?.value || 0,
            minValue: 0,
            maxValue: 15000,
            step: 500,
            enabled: true,
            count: newItemForm?.quantity || 1
          });
        } else if (['operations', 'marketing', 'technology']?.includes(selectedCategory)) {
          // Standard categories - add to items object
          onCostChange(selectedCategory, `items.${itemKey}`, {
            name: sanitizedName,
            value: newItemForm?.value || 0,
            minValue: 0,
            maxValue: 100000,
            step: 100,
            enabled: true,
            label: sanitizedName
          });
          // Also set quantity
          onCostChange(selectedCategory, `items.${itemKey}_quantity`, newItemForm?.quantity || 1);
        } else {
          // Custom categories - add to customCategories[category].items
          onCostChange('customCategories', `${selectedCategory}.items.${itemKey}`, {
            name: sanitizedName,
            value: newItemForm?.value || 0,
            minValue: 0,
            maxValue: 100000,
            step: 100,
            enabled: true,
            label: sanitizedName
          });
          // Also set quantity
          onCostChange('customCategories', `${selectedCategory}.items.${itemKey}_quantity`, newItemForm?.quantity || 1);
        }
        
        setState(prev => ({
          ...prev,
          showAddItemModal: false,
          selectedCategory: null,
          newItemForm: {
            name: '',
            value: 0,
            quantity: 1,
            type: 'fixed'
          },
          errors: { ...prev?.errors, addItem: null }
        }));
      }
    } catch (error) {
      console.error('Add item error:', error);
      setState(prev => ({
        ...prev,
        errors: { ...prev?.errors, addItem: 'Failed to add item. Please try again.' }
      }));
    }
  }, [state, onCostChange]);

  return (
    <ErrorBoundary fallback={<div className="text-red-500">Something went wrong. Please refresh.</div>}>
      <div ref={containerRef} className="bg-card border border-border rounded-lg p-6 relative">
        {/* Loading Overlay */}
        {state?.isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Icon name="Loader2" size={20} className="animate-spin text-primary" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          </div>
        )}

        {/* Header with controls */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Icon name="Calculator" size={20} className="text-primary" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">Cost Structure Analysis</h3>
              <p className="text-xs text-muted-foreground">
                Configure your cost structure with precise control over quantities and amounts
              </p>
            </div>
          </div>
          
          {/* Currency and Period Controls */}
          <div className="flex items-center space-x-4">
            {/* Currency Dropdown */}
            <div className="relative" ref={currencyRef} data-dropdown="currency">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCurrencyDropdownToggle}
                className="flex items-center space-x-2"
                disabled={state?.isLoading}
              >
                <span>{currencies?.find(c => c?.value === state?.currency)?.label}</span>
                <span className="text-sm">{state?.currency}</span>
                <Icon name="ChevronDown" size={14} />
              </Button>
              
              {currentOpenDropdown === 'currency' && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-background border border-border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                  {currencies?.map((curr) => (
                    <button
                      key={curr?.value}
                      onClick={() => handleCurrencySelect(curr?.value)}
                      className={`w-full flex items-center space-x-3 px-3 py-2 text-sm text-left hover:bg-muted transition-colors ${
                        state?.currency === curr?.value ? 'bg-primary/10 text-primary' : 'text-foreground'
                      }`}
                    >
                      <span className="font-medium">{curr?.label}</span>
                      <div className="flex-1">
                        <div className="font-medium">{curr?.name}</div>
                        <div className="text-xs text-muted-foreground">{curr?.value}</div>
                      </div>
                      {state?.currency === curr?.value && (
                        <Icon name="Check" size={14} className="text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Period Dropdown */}
            <div className="relative" ref={periodRef} data-dropdown="period">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePeriodDropdownToggle}
                className="flex items-center space-x-2"
                disabled={state?.isLoading}
              >
                <span>{periods?.find(p => p?.value === state?.period)?.label}</span>
                <Icon name="ChevronDown" size={14} />
              </Button>
              
              {currentOpenDropdown === 'period' && (
                <div className="absolute right-0 top-full mt-2 w-40 bg-background border border-border rounded-md shadow-lg z-50">
                  {periods?.map((per) => (
                    <button
                      key={per?.value}
                      onClick={() => handlePeriodSelect(per?.value)}
                      className={`w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors ${
                        state?.period === per?.value ? 'bg-primary/10 text-primary' : 'text-foreground'
                      }`}
                    >
                      <span className="font-medium">{per?.label}</span>
                      {state?.period === per?.value && (
                        <Icon name="Check" size={14} className="ml-auto text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add Category Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setState(prev => ({ ...prev, showAddCategory: !prev?.showAddCategory }))}
              className="flex items-center space-x-2"
              disabled={state?.isLoading}
            >
              <Icon name="FolderPlus" size={14} />
              <span className="hidden sm:inline">Add Category</span>
            </Button>
          </div>
        </div>

        {/* Error Messages */}
        {Object.keys(state?.errors)?.length > 0 && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-semibold text-destructive mb-2 flex items-center">
              <Icon name="AlertTriangle" size={16} className="mr-2" />
              Validation Errors
            </h4>
            <ul className="text-xs text-destructive space-y-1">
              {Object.entries(state?.errors)?.map(([key, error]) => (
                error && <li key={key}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Add Category Modal */}
        {state?.showAddCategory && (
          <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-6 space-y-4 mb-6">
            <h4 className="text-lg font-semibold text-foreground flex items-center">
              <Icon name="FolderPlus" size={18} className="mr-2" />
              Create New Cost Category
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <Input
                  label="Category Name"
                  value={state?.newCategoryName}
                  onChange={(e) => setState(prev => ({ 
                    ...prev, 
                    newCategoryName: ValidationUtils?.sanitizeInput(e?.target?.value),
                    errors: { ...prev?.errors, categoryName: null }
                  }))}
                  placeholder="e.g., Research & Development"
                  maxLength={50}
                  error={state?.errors?.categoryName}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  {state?.newCategoryName?.length}/50 characters
                </div>
              </div>
              <Select
                label="Category Type"
                value={state?.newCategoryType}
                onChange={(value) => setState(prev => ({ ...prev, newCategoryType: value }))}
                options={categoryTypeOptions}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setState(prev => ({ 
                  ...prev, 
                  showAddCategory: false,
                  newCategoryName: '',
                  newCategoryType: 'fixed',
                  errors: { ...prev?.errors, categoryName: null }
                }))}
                disabled={state?.isLoading}
              >
                Cancel
              </Button>
              <Button 
                size="sm" 
                onClick={handleAddCategory}
                disabled={!ValidationUtils?.validateCategoryName(state?.newCategoryName) || state?.isLoading}
              >
                <Icon name="Plus" size={14} className="mr-1" />
                Create Category
              </Button>
            </div>
          </div>
        )}

        {/* Custom Amount Modal */}
        {state?.showCustomAmountModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={closeCustomAmountModal}
            />
            
            <div className="relative bg-background border border-border rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Set Custom Amount</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={closeCustomAmountModal}
                  className="h-8 w-8"
                  disabled={state?.isLoading}
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-2">
                    Enter Custom Amount ({state?.currency})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10000000"
                    step="0.01"
                    value={state?.customAmount}
                    onChange={(e) => setState(prev => ({ 
                      ...prev, 
                      customAmount: e?.target?.value,
                      errors: { ...prev?.errors, customAmount: null }
                    }))}
                    className={`w-full px-3 py-2 border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                      state?.errors?.customAmount ? 'border-destructive' : 'border-border'
                    }`}
                    placeholder="Enter amount..."
                    autoFocus
                    disabled={state?.isLoading}
                  />
                  {state?.errors?.customAmount && (
                    <div className="text-xs text-destructive mt-1">
                      {state?.errors?.customAmount}
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground">
                  <p>• Enter any amount from $0 to $10,000,000</p>
                  <p>• You can bypass slider limitations</p>
                  <p>• Changes are applied immediately</p>
                </div>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  {[1000, 5000, 10000]?.map(amount => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setState(prev => ({ ...prev, customAmount: amount?.toString() }))}
                      className="text-xs"
                      disabled={state?.isLoading}
                    >
                      {formatCurrency(amount)}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={closeCustomAmountModal}
                  disabled={state?.isLoading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveCustomAmount}
                  disabled={
                    !state?.customAmount || 
                    !ValidationUtils?.validateCostValue(parseFloat(state?.customAmount)) || 
                    state?.isLoading
                  }
                >
                  {state?.isLoading ? (
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  ) : (
                    <Icon name="Check" size={16} className="mr-2" />
                  )}
                  Set Amount
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Modal */}
        {state?.showAddItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setState(prev => ({ ...prev, showAddItemModal: false }))}
            />
            
            <div className="relative bg-background border border-border rounded-lg shadow-xl max-w-md w-full">
              <div className="flex items-center justify-between p-6 border-b border-border">
                <h3 className="text-lg font-semibold text-foreground">Add Custom Item</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setState(prev => ({ ...prev, showAddItemModal: false }))}
                  className="h-8 w-8"
                >
                  <Icon name="X" size={16} />
                </Button>
              </div>
              
              <div className="p-6 space-y-4">
                <Input
                  label="Item Name"
                  value={state?.newItemForm?.name}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    newItemForm: { ...prev?.newItemForm, name: e?.target?.value }
                  }))}
                  placeholder="e.g., Office Supplies"
                />
                
                <Input
                  label="Initial Cost"
                  type="number"
                  min="0"
                  value={state?.newItemForm?.value}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    newItemForm: { ...prev?.newItemForm, value: parseFloat(e?.target?.value) || 0 }
                  }))}
                  placeholder="0"
                />
                
                <Input
                  label="Quantity"
                  type="number"
                  min="1"
                  value={state?.newItemForm?.quantity}
                  onChange={(e) => setState(prev => ({
                    ...prev,
                    newItemForm: { ...prev?.newItemForm, quantity: parseInt(e?.target?.value) || 1 }
                  }))}
                  placeholder="1"
                />
              </div>
              
              <div className="flex justify-end space-x-3 p-6 border-t border-border">
                <Button 
                  variant="outline" 
                  onClick={() => setState(prev => ({ ...prev, showAddItemModal: false }))}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleAddItem}
                  disabled={!state?.newItemForm?.name}
                >
                  <Icon name="Plus" size={16} className="mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Personnel Costs */}
        {renderCategorySection('personnel', 'Users', 'Personnel Costs', employeeRoleOptions)}

        {/* Operations Costs */}
        {renderCategorySection('operations', 'Building', 'Operations & Facilities', [
          { value: 'rent', label: 'Office Rent', defaultValue: 8000, minValue: 0, maxValue: 25000, step: 500 },
          { value: 'utilities', label: 'Utilities', defaultValue: 1200, minValue: 0, maxValue: 5000, step: 100 },
          { value: 'insurance', label: 'Insurance', defaultValue: 800, minValue: 0, maxValue: 3000, step: 100 },
          { value: 'cleaning', label: 'Cleaning Services', defaultValue: 600, minValue: 0, maxValue: 2000, step: 100 },
          { value: 'security', label: 'Security', defaultValue: 1000, minValue: 0, maxValue: 3000, step: 100 },
          { value: 'maintenance', label: 'Maintenance', defaultValue: 800, minValue: 0, maxValue: 2500, step: 100 }
        ])}

        {/* Marketing Costs */}
        {renderCategorySection('marketing', 'Megaphone', 'Marketing & Sales', [
          { value: 'digital-ads', label: 'Digital Advertising', defaultValue: 15000, minValue: 0, maxValue: 100000, step: 1000 },
          { value: 'content', label: 'Content Marketing', defaultValue: 5000, minValue: 0, maxValue: 25000, step: 500 },
          { value: 'seo', label: 'SEO Services', defaultValue: 3000, minValue: 0, maxValue: 15000, step: 500 },
          { value: 'social-media', label: 'Social Media Management', defaultValue: 2500, minValue: 0, maxValue: 10000, step: 250 },
          { value: 'events', label: 'Events & Conferences', defaultValue: 8000, minValue: 0, maxValue: 50000, step: 1000 },
          { value: 'pr', label: 'Public Relations', defaultValue: 4000, minValue: 0, maxValue: 15000, step: 500 }
        ])}

        {/* Technology Costs */}
        {renderCategorySection('technology', 'Server', 'Technology & Infrastructure', [
          { value: 'software', label: 'Software Licenses', defaultValue: 2500, minValue: 0, maxValue: 15000, step: 250 },
          { value: 'infrastructure', label: 'Cloud Infrastructure', defaultValue: 3500, minValue: 0, maxValue: 20000, step: 500 },
          { value: 'tools', label: 'Development Tools', defaultValue: 1500, minValue: 0, maxValue: 8000, step: 200 },
          { value: 'security', label: 'Security Tools', defaultValue: 1200, minValue: 0, maxValue: 5000, step: 200 },
          { value: 'analytics', label: 'Analytics & Monitoring', defaultValue: 800, minValue: 0, maxValue: 3000, step: 100 },
          { value: 'backup', label: 'Backup & Recovery', defaultValue: 600, minValue: 0, maxValue: 2000, step: 100 }
        ])}

        {/* ENHANCED: Custom Categories with better validation */}
        {costs && typeof costs === 'object' && Object.entries(costs)?.filter(([key]) => 
          !['personnel', 'operations', 'marketing', 'technology']?.includes(key)
        )?.map(([categoryKey, categoryData]) => {
          if (!categoryData || typeof categoryData !== 'object' || categoryKey === 'customCategories') {
            return null;
          }
          
          // Get all items (excluding quantity fields and metadata)
          const items = Object.entries(categoryData)?.filter(([key, value]) => 
              key === 'items' && value && typeof value === 'object'
            )?.flatMap(([, itemsObj]) => 
              Object.entries(itemsObj)?.map(([itemKey, itemValue]) => ({
                value: itemKey,
                label: itemKey?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l?.toUpperCase()),
                defaultValue: itemValue?.value || 0,
                minValue: itemValue?.minValue || 0,
                maxValue: itemValue?.maxValue || 100000,
                step: itemValue?.step || 100
              }))
            );

          if (items?.length === 0) return null;

          return renderCategorySection(categoryKey, 'FolderPlus', categoryKey?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l?.toUpperCase()), items);
        })}

        {/* Handle customCategories specifically */}
        {costs?.customCategories && typeof costs?.customCategories === 'object' && 
          Object.entries(costs?.customCategories)?.map(([categoryKey, categoryData]) => {
            if (!categoryData || typeof categoryData !== 'object' || !categoryData?.items) {
              return null;
            }
            
            const items = Object.entries(categoryData?.items)?.map(([itemKey, itemValue]) => ({
              value: itemKey,
              label: itemValue?.label || itemKey?.replace(/_/g, ' ')?.replace(/\b\w/g, l => l?.toUpperCase()),
              defaultValue: itemValue?.value || 0,
              minValue: itemValue?.minValue || 0,
              maxValue: itemValue?.maxValue || 100000,
              step: itemValue?.step || 100
            }));

            return renderCategorySection(categoryKey, 'FolderPlus', categoryData?.name || categoryKey, items);
          })
        }
      </div>
    </ErrorBoundary>
  );
};

export default CostInputPanel;