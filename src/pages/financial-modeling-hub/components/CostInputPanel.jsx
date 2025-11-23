import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

import Select from '../../../components/ui/Select';

/**
 * ValidationUtils: A collection of helper functions to validate user input.
 * These ensure that the data entered for costs, names, and counts are within reasonable limits
 * and safe to use (e.g., preventing negative numbers or extremely large values).
 */
// Enhanced validation utilities
const ValidationUtils = {
  // Checks if a cost value is a valid number between 0 and 10,000,000
  validateCostValue: (value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num >= 0 && num <= 10000000;
  },
  
  // Checks if a category name is a valid string, not empty, and not too long
  validateCategoryName: (name) => {
    return name && typeof name === 'string' && name?.trim()?.length > 0 && name?.length <= 50;
  },
  
  // Checks if an employee count is a valid integer between 0 and 10,000
  validateEmployeeCount: (count) => {
    const num = parseInt(count);
    return !isNaN(num) && num >= 0 && num <= 10000;
  },
  
  // Cleans up input strings to remove potentially harmful characters like < and >
  sanitizeInput: (input) => {
    return typeof input === 'string' ? input?.trim()?.replace(/[<>]/g, '') : input;
  }
};

/**
 * resolvePath: A helper function to safely access nested properties in an object.
 * For example, if you have an object { a: { b: { c: 1 } } } and want to access 'a.b.c',
 * this function handles the traversal and returns undefined if any part of the path is missing.
 * 
 * This function is what allows us to actually access the properties of say a new cost category and item without it actually being hard coded in, giving us more dynamic ability to create custom items.
 */
const resolvePath = (source, path) => {
  if (!path || typeof path !== 'string' || path.trim() === '') {
    console.error('Path is missing or empty');
    return undefined;
  }
if (!source || typeof source !== 'object' || source === null) {
  console.error('Source is not an object');
  return undefined;
}

const keys = path.split('.');
let current = source;

for (let i =0; i < keys.length; i++) {
  const key = keys[i];
  if (!current || typeof current !== 'object') {
    console.error(`Failed to traverse path at key '${key}' in path '${keys.slice(0, i + 1).join('.')}'. current value:`, current)
    return undefined;

  }
  current = current[key];
}
return current;
};

/**
 * formatKeyLabel: Converts a technical key string (like "my_variable_name") into a readable label (like "My Variable Name").
 * It replaces underscores/hyphens with spaces and capitalizes the first letter of each word.
 */
const formatKeyLabel = (key = '') => key
  ?.replace(/[_-]/g, ' ')
  ?.replace(/\b\w/g, (letter) => letter?.toUpperCase());

/**
 * useDebouncedCallback: A custom hook that delays the execution of a function.
 * This is useful for inputs where we don't want to trigger an update on every single keystroke,
 * but rather wait until the user has stopped typing for a short moment (the delay).
 */
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

/**
 * ErrorBoundary: A component that catches errors in its children components.
 * If a crash occurs inside the wrapped components, this will display a fallback error message
 * instead of crashing the entire application.
 */
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

/**
 * CostInputPanel: The main component for managing and inputting financial costs.
 * It allows users to:
 * - View and edit cost categories (like Personnel, Marketing, etc.)
 * - Add new custom categories and items
 * - Adjust values using sliders or direct input
 * - Change currency and time period settings
 */
const CostInputPanel = ({ 
  costs, 
  onCostChange, 
  onRemoveItem,
  onAddCategory,
  onAddStandardCategory,
  onRemoveCategory,
  standardCategories = {},
  openDropdown, 
  closeAllDropdowns, 
  currentOpenDropdown 
}) => {
  // State management for the component
  const [state, setState] = useState({
    expandedCategories: {}, // Tracks which categories are expanded (open) in the UI
    currency: 'USD',        // Current selected currency
    period: 'monthly',      // Current selected time period (e.g., monthly, annually)
    showAddCategory: false, // Controls visibility of the "Add Category" modal
    newCategoryName: '',    // Stores input for new category name
    newCategoryType: 'fixed', // Stores input for new category type
    showCustomAmountModal: false, // Controls visibility of the custom amount input modal
    customAmountTarget: null,     // Stores which item is being edited in the custom amount modal
    customAmount: '',             // Stores the value entered in the custom amount modal
    showAddItemModal: false,      // Controls visibility of the "Add Item" modal
    selectedCategory: null,       // Stores which category a new item is being added to
    newItemForm: {                // Stores input data for a new item
      name: '',
      value: 0,
      quantity: 1,
      type: 'fixed'
    },
    isLoading: false, // Indicates if an async operation is in progress
    errors: {}        // Stores validation error messages
  });

  const currencyRef = useRef();
  const periodRef = useRef();
  const containerRef = useRef();

  // Helper to extract the root category from a path string (e.g., "personnel.employees" -> "personnel")
  const getRootCategory = useCallback((categoryPath = '') => categoryPath?.split('.')?.[0] || '', []);
  
  // Helper to retrieve data for a specific category from the costs object
  const getCategoryData = useCallback((categoryPath) => {
    if (!categoryPath) return null;
    return resolvePath(costs, categoryPath);
  }, [costs]);
  
  // Helper to check if a field belongs to a personnel role (requires special handling)
  const isPersonnelRoleField = useCallback((categoryPath, fieldPath) => {
    return getRootCategory(categoryPath) === 'personnel' && fieldPath?.startsWith('employees.roles.');
  }, [getRootCategory]);
  
  // Helper to determine the correct path for the quantity field of an item
  const getQuantityFieldPath = useCallback((categoryPath, fieldPath) => {
    if (isPersonnelRoleField(categoryPath, fieldPath)) {
      return `${fieldPath}.count`;
    }
    return `${fieldPath}_quantity`;
  }, [isPersonnelRoleField]);

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

  const standardCategoryList = useMemo(() => Object.values(standardCategories || {}), [standardCategories]);
  const activeStandardCategoryKeys = useMemo(() => (
    Object.keys(standardCategories || {})?.filter(key => costs?.[key])
  ), [standardCategories, costs]);
  const additionalCategories = useMemo(() => (
    Object.entries(costs || {})
      ?.filter(([key]) => key !== 'customCategories' && !standardCategories?.[key])
      ?.map(([key, value]) => ({ key, data: value }))
  ), [costs, standardCategories]);
  const customCategoryEntries = useMemo(() => (
    Object.entries(costs?.customCategories || {})
  ), [costs]);
  const hasActiveCategories = useMemo(() => (
    (activeStandardCategoryKeys?.length || 0) > 0 ||
    (additionalCategories?.length || 0) > 0 ||
    (customCategoryEntries?.length || 0) > 0
  ), [activeStandardCategoryKeys, additionalCategories, customCategoryEntries]);

  /**
   * debouncedCostChange: Updates the cost data after a short delay.
   * This prevents excessive updates and re-renders while the user is sliding a slider or typing.
   * It also performs validation before applying the change.
   */
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
  // Toggles the visibility of the currency selection dropdown
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

  // Toggles the visibility of the period selection dropdown
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

  // Updates the selected currency
  const handleCurrencySelect = useCallback((currencyValue) => {
    try {
      setState(prev => ({ ...prev, currency: currencyValue }));
      closeAllDropdowns();
    } catch (error) {
      console.error('Currency selection error:', error);
    }
  }, [closeAllDropdowns]);

  // Updates the selected time period
  const handlePeriodSelect = useCallback((periodValue) => {
    try {
      setState(prev => ({ ...prev, period: periodValue }));
      closeAllDropdowns();
    } catch (error) {
      console.error('Period selection error:', error);
    }
  }, [closeAllDropdowns]);

  // Enhanced currency formatting
  // Formats a number as a currency string (e.g., 1000 -> "$1,000") based on the selected currency
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
  // Expands or collapses a category section in the UI
  const toggleCategory = useCallback((category, value) => {
    try {
      setState(prev => ({
        ...prev,
        expandedCategories: {
          ...prev?.expandedCategories,
          [category]: value
        }
      }));
    } catch (error) {
      console.error('Category toggle error:', error);
    }
  }, []);

  // Toggles the modal for adding a new custom category
  const toggleCustomCategoryModal = useCallback(() => {
    setState(prev => ({
      ...prev,
      showAddCategory: !prev?.showAddCategory
    }));
  }, []);

  // Slider change handler
  // Called when a slider value changes. Converts input to number and calls the debounced updater.
  const handleSliderChange = useCallback((category, field, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      debouncedCostChange(category, field, numValue);
    }
  }, [debouncedCostChange]);

  // Quantity change handler
  // Called when the quantity of an item changes. Validates and updates the cost.
  const handleQuantityChange = useCallback((category, field, quantity) => {
    const numQuantity = parseInt(quantity);
    if (ValidationUtils?.validateEmployeeCount(numQuantity) || numQuantity === 0) {
      const quantityField = getQuantityFieldPath(category, field);
      debouncedCostChange(category, quantityField, numQuantity);
    }
  }, [debouncedCostChange, getQuantityFieldPath]);

  // Custom amount handlers
  // Opens the modal to enter a specific numeric amount manually
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

  // Saves the manually entered amount from the modal
  const saveCustomAmount = useCallback(() => {
    try {
      const { customAmountTarget, customAmount } = state;
      if (customAmountTarget && customAmount !== '') {
        const amount = parseFloat(customAmount);
        if (ValidationUtils?.validateCostValue(amount) || amount === 0) {
          // FIX: Always append .value to update the value property of the item object
          handleSliderChange(customAmountTarget?.category, `${customAmountTarget?.field}.value`, amount);
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

  // Closes the custom amount modal without saving
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
  // Retrieves the current numeric value for a specific cost item
  const getCostValue = useCallback((category, field) => {
    try {
      if (!field) return 0;
      const categoryData = getCategoryData(category);
      if (!categoryData || typeof categoryData !== 'object') return 0;
      const resolved = resolvePath(categoryData, field);
      
      // If the resolved value is an object (like a role), get its 'value' property
      if (resolved && typeof resolved === 'object' && 'value' in resolved) {
        return typeof resolved.value === 'number' ? resolved.value : Number(resolved.value) || 0;
      }
      
      // Otherwise treat it as a direct value
      return typeof resolved === 'number' ? resolved : Number(resolved) || 0;
    } catch (error) {
      console.error('Error getting cost value:', error);
      return 0;
    }
  }, [getCategoryData]);

  // ENHANCED: Get quantity value with proper validation  
  // Retrieves the current quantity count for a specific cost item
  const getQuantityValue = useCallback((category, field) => {
    try {
      if (!field) return 1;
      const categoryData = getCategoryData(category);
      if (!categoryData || typeof categoryData !== 'object') return 1;
      const quantityField = getQuantityFieldPath(category, field);
      const quantity = resolvePath(categoryData, quantityField);
      return typeof quantity === 'number' ? quantity : Number(quantity) || 1;
    } catch (error) {
      console.error('Error getting quantity value:', error);
      return 1;
    }
  }, [getCategoryData, getQuantityFieldPath]);

  // ENHANCED: Slider input with proper error handling and remove functionality
  // Renders a single cost item row with a slider, quantity controls, and action buttons
  const renderSliderInput = useCallback((category, field, defaultValue, min, max, step, label, unit, disabled = false) => {
    const errorKey = `${category}.${field}`;
    const hasError = state?.errors?.[errorKey];
    const storedValue = getCostValue(category, field);
    const currentValue = storedValue ?? defaultValue ?? 0;
    const currentQuantity = getQuantityValue(category, field);
    const totalCost = currentValue * currentQuantity;
    const isPersonnelRole = isPersonnelRoleField(category, field);
    const quantityField = getQuantityFieldPath(category, field);
    
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
                  }
                  onCostChange(category, field, null);
                  if (!isPersonnelRole) {
                    onCostChange(category, quantityField, null);
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
              // FIX: Always append .value to update the value property of the item object
              const fieldPath = `${field}.value`;
              handleSliderChange(category, fieldPath, newValue);
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
  }, [state?.errors, handleCustomAmountClick, handleSliderChange, handleQuantityChange, getCostValue, getQuantityValue, formatCurrency, onRemoveItem, onCostChange, isPersonnelRoleField, getQuantityFieldPath]);

  // Category type options
  const categoryTypeOptions = useMemo(() => [
    { value: 'fixed', label: 'Fixed Cost' },
    { value: 'variable', label: 'Variable Cost' },
    { value: 'one-time', label: 'One-time Cost' }
  ], []);

  // Helper to get expanded state
  const expandedCategories = useMemo(() => state?.expandedCategories, [state?.expandedCategories]);

  // Adds a pre-defined template item to a category
  const handleTemplateItemAdd = useCallback((categoryPath, templateItem) => {
    if (!templateItem?.value) return;
    const rootCategory = getRootCategory(categoryPath);
    const itemKey = templateItem?.value?.split('.')?.pop();
    if (!itemKey) return;

    if (rootCategory === 'personnel') {
      onCostChange('personnel', `employees.roles.${itemKey}`, {
        name: templateItem?.label,
        label: templateItem?.label,
        value: templateItem?.defaultValue || 0,
        minValue: templateItem?.minValue || 0,
        maxValue: templateItem?.maxValue || 100000,
        step: templateItem?.step || 100,
        enabled: true,
        count: 1
      });
    } else {
      onCostChange(categoryPath, `items.${itemKey}`, {
        name: templateItem?.label,
        label: templateItem?.label,
        value: templateItem?.defaultValue || 0,
        minValue: templateItem?.minValue || 0,
        maxValue: templateItem?.maxValue || 100000,
        step: templateItem?.step || 100,
        enabled: true
      });
      onCostChange(categoryPath, `items.${itemKey}_quantity`, 1);
    }
  }, [onCostChange, getRootCategory]);

  // ENHANCED: Category section with improved item counting
  // Renders a collapsible section for a cost category (e.g., "Marketing") containing all its items
  const renderCategorySection = useCallback(({
    categoryKey,
    categoryPath = categoryKey,
    iconName,
    title,
    defaultItems = [],
    onDeleteCategory
  }) => {
    const isExpanded = expandedCategories?.[categoryKey];
    const categoryData = getCategoryData(categoryPath);
    const rootCategory = getRootCategory(categoryPath);

    // Calculate the list of items to display in this category
    const derivedItems = (() => {
      try {
        if (!categoryData || typeof categoryData !== 'object') return [];
        if (rootCategory === 'personnel') {
          const roles = resolvePath(categoryData, 'employees.roles');
          if (!roles || typeof roles !== 'object') return [];
          return Object.entries(roles)?.map(([key, role]) => ({
            value: `employees.roles.${key}`,
            label: role?.label || role?.name || formatKeyLabel(key),
            defaultValue: role?.value || 0,
            minValue: role?.minValue || 0,
            maxValue: role?.maxValue || 100000,
            step: role?.step || 100
          }));
        }
        const items = categoryData?.items;
        if (!items || typeof items !== 'object') return [];
        return Object.entries(items)
          ?.filter(([key]) => !key?.endsWith('_quantity'))
          ?.map(([key, item]) => ({
            value: `items.${key}`,
            label: item?.label || item?.name || formatKeyLabel(key),
            defaultValue: item?.value || 0,
            minValue: item?.minValue || 0,
            maxValue: item?.maxValue || 100000,
            step: item?.step || 100
          }));
      } catch (error) {
        console.error('Error deriving items:', error);
        return [];
      }
    })();

    const itemsToRender = derivedItems;
    const itemCount = itemsToRender?.length || 0;
    const showTemplateSuggestions = defaultItems?.length > 0;
    
    return (
      <div key={categoryKey} className="space-y-4 mb-6">
        {/* Category Header Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => toggleCategory(categoryKey, !isExpanded)}
            className="flex items-center justify-between flex-1 p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-lg hover:from-primary/15 hover:to-primary/10 transition-all text-left"
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
          {onDeleteCategory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e?.stopPropagation();
                onDeleteCategory();
              }}
              className="h-10 w-10 text-destructive hover:text-destructive/80"
            >
              <Icon name="Trash2" size={14} />
            </Button>
          )}
        </div>
        {/* Expanded Content */}
        {isExpanded && (
          <div className="space-y-4 pl-4">
            {itemsToRender?.length === 0 && (
              <div className="bg-muted/20 border border-dashed border-border/50 rounded-lg p-4 text-sm text-muted-foreground">
                No line items yet. Use “Add Custom Item” below to start tracking this category.
              </div>
            )}
            {itemsToRender?.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {itemsToRender?.map(item => (
                  <div key={`${categoryPath}-${item?.value}`} className="bg-card border border-border rounded-lg p-4">
                    {renderSliderInput(
                      categoryPath,
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
            )}
            
            {/* ENHANCED: Add Item Button */}
            <div className="bg-muted/20 border border-dashed border-border/50 rounded-lg p-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setState(prev => ({
                    ...prev,
                    showAddItemModal: true,
                    selectedCategory: categoryPath,
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
              {showTemplateSuggestions && (
                <div className="mt-3">
                  <p className="text-xs text-muted-foreground mb-2">Quick add suggestions</p>
                  <div className="flex flex-wrap gap-2">
                    {defaultItems?.map((item) => {
                      const exists = categoryData && resolvePath(categoryData, item?.value);
                      return (
                        <Button
                          key={`${categoryKey}-template-${item?.value}`}
                          variant="outline"
                          size="xs"
                          disabled={exists}
                          onClick={() => handleTemplateItemAdd(categoryPath, item)}
                          className="text-xs"
                        >
                          {exists ? 'Added' : 'Add'} {item?.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }, [expandedCategories, toggleCategory, renderSliderInput, state?.currency, getCategoryData, getRootCategory, handleTemplateItemAdd]);

  // ENHANCED: Add category handler with proper validation
  // Creates a new custom category based on user input
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

  // Activates a standard category from the library
  const handleStandardCategoryAdd = useCallback((categoryKey) => {
    if (!onAddStandardCategory) return;
    onAddStandardCategory(categoryKey);
    setState(prev => ({
      ...prev,
      expandedCategories: { ...prev?.expandedCategories, [categoryKey]: true }
    }));
  }, [onAddStandardCategory]);

  // Removes a category and all its items
  const handleDeleteCategory = useCallback((categoryKey, categoryPath, title) => {
    if (!onRemoveCategory) return;
    const label = title || formatKeyLabel(categoryKey);
    if (window.confirm(`Remove ${label}? This will delete all items in the category.`)) {
      onRemoveCategory(categoryPath);
      setState(prev => {
        const expanded = { ...(prev?.expandedCategories || {}) };
        delete expanded[categoryKey];
        return { ...prev, expandedCategories: expanded };
      });
    }
  }, [onRemoveCategory]);

  // FIXED: Add item handler with proper nested structure using onCostChange
  // Creates a new custom item within a selected category
  const handleAddItem = useCallback(() => {
    try {
      const { selectedCategory, newItemForm } = state;
      if (selectedCategory && newItemForm?.name) {
        const sanitizedName = ValidationUtils?.sanitizeInput(newItemForm?.name);
        const itemKey = sanitizedName?.toLowerCase()?.replace(/\s+/g, '_');
        const rootCategory = getRootCategory(selectedCategory);
        
        // CRITICAL FIX: Use onCostChange instead of setCosts
        if (rootCategory === 'personnel') {
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
        } else {
          // Standard and custom categories share the same structure now
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
  }, [state, onCostChange, getRootCategory]);

  return (
    <ErrorBoundary fallback={<div className="text-red-500">Something went wrong. Please refresh.</div>}>
      <div ref={containerRef} className="bg-card border border-border rounded-lg p-6 relative">
        {/* Loading Overlay: Blocks interaction when data is processing */}
        {state?.isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-40 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <Icon name="Loader2" size={20} className="animate-spin text-primary" />
              <span className="text-sm font-medium">Processing...</span>
            </div>
          </div>
        )}

        {/* Header with controls: Title, Currency Selector, Period Selector, Add Category Button */}
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
              onClick={toggleCustomCategoryModal}
              className="flex items-center space-x-2"
              disabled={state?.isLoading}
            >
              <Icon name="FolderPlus" size={14} />
              <span className="hidden sm:inline">Add Category</span>
            </Button>
          </div>
        </div>

        {/* Category Library: Shows available standard categories that can be added */}
        {standardCategoryList?.length > 0 && (
          <div className="bg-muted/20 border border-border rounded-lg p-4 mb-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3">
                <Icon name="Layers" size={18} className="text-primary" />
                <div>
                  <h4 className="text-sm font-semibold text-foreground">Category Library</h4>
                  <p className="text-xs text-muted-foreground">
                    Activate standard categories or add your own custom structure.
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleCustomCategoryModal}
                className="w-full sm:w-auto"
              >
                <Icon name="FolderPlus" size={14} className="mr-2" />
                Add Custom Category
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
              {standardCategoryList?.map(category => {
                const isActive = Boolean(costs?.[category?.key]);
                return (
                  <div
                    key={category?.key}
                    className={`rounded-lg border p-3 flex flex-col space-y-3 ${
                      isActive ? 'border-primary/40 bg-primary/5' : 'border-dashed border-border/70'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        <Icon name={category?.iconName || 'FolderPlus'} size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{category?.title}</p>
                        <p className="text-xs text-muted-foreground">{category?.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {isActive ? 'Active' : 'Available'}
                      </span>
                      <Button
                        variant={isActive ? 'destructive' : 'outline'}
                        size="xs"
                        onClick={() => {
                          if (isActive) {
                            handleDeleteCategory(category?.key, category?.key, category?.title);
                          } else {
                            handleStandardCategoryAdd(category?.key);
                          }
                        }}
                      >
                        {isActive ? 'Remove' : 'Add'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Messages: Displays any validation errors */}
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

        {/* Add Category Modal: Popup form to create a new category */}
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

        {/* Custom Amount Modal: Popup to enter a specific numeric value */}
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

        {/* Add Item Modal: Popup form to add a new item to a category */}
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

        {!hasActiveCategories && (
          <div className="border border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground">
            No categories are active yet. Use the library above or create a custom category to get started.
          </div>
        )}

        {/* Render Active Categories: Loops through and displays all active categories */}
        {activeStandardCategoryKeys?.map(categoryKey => {
          const config = standardCategories?.[categoryKey];
          if (!config) return null;
          return renderCategorySection({
            categoryKey,
            categoryPath: categoryKey,
            iconName: config?.iconName || 'FolderPlus',
            title: config?.title || formatKeyLabel(categoryKey),
            defaultItems: config?.defaultItems || [],
            onDeleteCategory: () => handleDeleteCategory(categoryKey, categoryKey, config?.title)
          });
        })}

        {additionalCategories?.map(({ key }) => renderCategorySection({
          categoryKey: key,
          categoryPath: key,
          iconName: 'FolderPlus',
          title: formatKeyLabel(key),
          defaultItems: [],
          onDeleteCategory: () => handleDeleteCategory(key, key, formatKeyLabel(key))
        }))}

        {customCategoryEntries?.map(([categoryKey, categoryData]) => renderCategorySection({
          categoryKey,
          categoryPath: `customCategories.${categoryKey}`,
          iconName: 'FolderPlus',
          title: categoryData?.name || formatKeyLabel(categoryKey),
          defaultItems: [],
          onDeleteCategory: () => handleDeleteCategory(categoryKey, `customCategories.${categoryKey}`, categoryData?.name)
        }))}
      </div>
    </ErrorBoundary>
  );
};

export default CostInputPanel;
