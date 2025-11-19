import { supabase } from '../lib/supabase';

export const costService = {
  // Create or update cost categories for a scenario
  async saveCostCategories(scenarioId, costData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // FIXED: Only delete items for this specific scenario, not all user items
      await supabase?.from('cost_items')?.delete()?.in('category_id', 
        supabase?.from('cost_categories')?.select('id')?.eq('scenario_id', scenarioId)?.eq('user_id', user?.id)
      );
      await supabase?.from('cost_categories')?.delete()?.eq('scenario_id', scenarioId)?.eq('user_id', user?.id);

      const results = {
        categories: [],
        items: []
      };

      // Process each cost category
      for (const [categoryKey, categoryData] of Object.entries(costData)) {
        if (categoryKey === 'customCategories') {
          // Handle custom categories
          for (const [customKey, customCategory] of Object.entries(categoryData)) {
            if (customCategory && customCategory?.items) {
              const categoryResult = await this.createCostCategory(scenarioId, user?.id, customCategory?.name, 'custom', customCategory?.enabled);
              results?.categories?.push(categoryResult);

              // Create cost items for this category
              for (const [itemKey, item] of Object.entries(customCategory?.items)) {
                if (item && item?.value !== undefined && item?.value !== null) {
                  const itemResult = await this.createCostItem(categoryResult?.id, user?.id, item?.label || itemKey, item?.value, item);
                  results?.items?.push(itemResult);
                }
              }
            }
          }
        } else {
          // Handle standard categories (personnel, operations, marketing, technology)
          if (categoryData && categoryData?.items) {
            const categoryType = this.getCategoryType(categoryKey);
            const categoryResult = await this.createCostCategory(scenarioId, user?.id, this.getCategoryDisplayName(categoryKey), categoryType, true);
            results?.categories?.push(categoryResult);

            // Create cost items for this category
            for (const [itemKey, item] of Object.entries(categoryData?.items)) {
              if (item && item?.value !== undefined && item?.value !== null && item !== null) {
                const itemResult = await this.createCostItem(categoryResult?.id, user?.id, item?.label || itemKey, item?.value, item);
                results?.items?.push(itemResult);
              }
            }
          }
        }
      }

      return results;
    } catch (error) {
      console.error('Error saving cost categories:', error);
      throw error;
    }
  },

  // ADDED: New method to remove a specific cost item
  async removeCostItem(scenarioId, categoryKey, itemKey) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get the category
      const categoryName = this.getCategoryDisplayName(categoryKey);
      const categoryType = this.getCategoryType(categoryKey);
      
      const { data: category } = await supabase?.from('cost_categories')
        ?.select('id')
        ?.eq('scenario_id', scenarioId)
        ?.eq('user_id', user?.id)
        ?.eq('category_name', categoryName)
        ?.eq('category_type', categoryType)
        ?.single();

      if (category) {
        // Delete the specific cost item
        const { error } = await supabase?.from('cost_items')
          ?.delete()
          ?.eq('category_id', category?.id)
          ?.eq('user_id', user?.id)
          ?.eq('item_name', itemKey);

        if (error) throw error;
      }

      return true;
    } catch (error) {
      console.error('Error removing cost item:', error);
      throw error;
    }
  },

  // Create a cost category
  async createCostCategory(scenarioId, userId, categoryName, categoryType, enabled = true) {
    try {
      const { data, error } = await supabase?.from('cost_categories')?.insert({
        user_id: userId,
        scenario_id: scenarioId,
        category_name: categoryName,
        category_type: categoryType,
        enabled: enabled,
        settings: { enabled: enabled }
      })?.select()?.single();

      if (error) throw error;

      return {
        id: data?.id,
        userId: data?.user_id,
        scenarioId: data?.scenario_id,
        categoryName: data?.category_name,
        categoryType: data?.category_type,
        enabled: data?.enabled,
        settings: data?.settings,
        createdAt: data?.created_at
      };
    } catch (error) {
      console.error('Error creating cost category:', error);
      throw error;
    }
  },

  // Create a cost item
  async createCostItem(categoryId, userId, itemName, value, metadata = {}) {
    try {
      const { data, error } = await supabase?.from('cost_items')?.insert({
        category_id: categoryId,
        user_id: userId,
        item_name: itemName,
        value: parseFloat(value),
        min_value: metadata?.minValue ? parseFloat(metadata?.minValue) : null,
        max_value: metadata?.maxValue ? parseFloat(metadata?.maxValue) : null,
        step_value: metadata?.step ? parseFloat(metadata?.step) : null,
        enabled: metadata?.enabled !== undefined ? metadata?.enabled : true,
        metadata: {
          count: metadata?.count || 1,
          hours: metadata?.hours || 160,
          benefits: metadata?.benefits || 0,
          type: metadata?.type || 'fixed',
          label: metadata?.label || itemName
        }
      })?.select()?.single();

      if (error) throw error;

      return {
        id: data?.id,
        categoryId: data?.category_id,
        userId: data?.user_id,
        itemName: data?.item_name,
        value: parseFloat(data?.value),
        minValue: data?.min_value ? parseFloat(data?.min_value) : null,
        maxValue: data?.max_value ? parseFloat(data?.max_value) : null,
        stepValue: data?.step_value ? parseFloat(data?.step_value) : null,
        enabled: data?.enabled,
        metadata: data?.metadata,
        createdAt: data?.created_at
      };
    } catch (error) {
      console.error('Error creating cost item:', error);
      throw error;
    }
  },

  // Get cost categories and items for a scenario
  async getCostDataForScenario(scenarioId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: categories, error: catError } = await supabase?.from('cost_categories')?.select(`
          *,
          cost_items (*)
        `)?.eq('scenario_id', scenarioId)?.eq('user_id', user?.id);

      if (catError) throw catError;

      // Convert database format back to component format
      const costData = {
        personnel: { items: {} },
        operations: { items: {} },
        marketing: { items: {} },
        technology: { items: {} },
        customCategories: {}
      };

      categories?.forEach(category => {
        const categoryKey = this.getCategoryKey(category?.category_name, category?.category_type);
        
        if (category?.category_type === 'custom') {
          costData.customCategories[categoryKey] = {
            name: category?.category_name,
            type: category?.category_type,
            enabled: category?.enabled,
            items: {}
          };
          
          category?.cost_items?.forEach(item => {
            costData.customCategories[categoryKey].items[this.sanitizeItemKey(item.item_name)] = {
              label: item?.item_name,
              value: parseFloat(item?.value),
              minValue: item?.min_value ? parseFloat(item?.min_value) : 0,
              maxValue: item?.max_value ? parseFloat(item?.max_value) : 100000,
              step: item?.step_value ? parseFloat(item?.step_value) : 100,
              enabled: item?.enabled,
              count: item?.metadata?.count || 1,
              hours: item?.metadata?.hours || 160,
              benefits: item?.metadata?.benefits || 0,
              type: item?.metadata?.type || 'fixed'
            };
          });
        } else {
          const standardCategory = this.getStandardCategoryKey(category?.category_type);
          if (standardCategory && costData?.[standardCategory]) {
            category?.cost_items?.forEach(item => {
              costData[standardCategory].items[this.sanitizeItemKey(item.item_name)] = {
                label: item?.item_name,
                value: parseFloat(item?.value),
                minValue: item?.min_value ? parseFloat(item?.min_value) : 0,
                maxValue: item?.max_value ? parseFloat(item?.max_value) : 100000,
                step: item?.step_value ? parseFloat(item?.step_value) : 100,
                enabled: item?.enabled,
                count: item?.metadata?.count || 1,
                hours: item?.metadata?.hours || 160,
                benefits: item?.metadata?.benefits || 0,
                type: item?.metadata?.type || 'fixed'
              };
            });
          }
        }
      });

      return costData;
    } catch (error) {
      console.error('Error getting cost data:', error);
      throw error;
    }
  },

  // Helper methods
  getCategoryType(categoryKey) {
    const categoryMap = {
      personnel: 'personnel',
      operations: 'operations',
      marketing: 'marketing',
      technology: 'technology'
    };
    return categoryMap?.[categoryKey] || 'custom';
  },

  getCategoryDisplayName(categoryKey) {
    const nameMap = {
      personnel: 'Personnel Costs',
      operations: 'Operations & Facilities',
      marketing: 'Marketing & Sales',
      technology: 'Technology & Infrastructure'
    };
    return nameMap?.[categoryKey] || categoryKey;
  },

  getCategoryKey(categoryName, categoryType) {
    if (categoryType === 'custom') {
      return this.sanitizeItemKey(categoryName);
    }
    
    const keyMap = {
      'Personnel Costs': 'personnel',
      'Operations & Facilities': 'operations',
      'Marketing & Sales': 'marketing',
      'Technology & Infrastructure': 'technology'
    };
    return keyMap?.[categoryName] || categoryType;
  },

  getStandardCategoryKey(categoryType) {
    const typeMap = {
      personnel: 'personnel',
      operations: 'operations',
      marketing: 'marketing',
      technology: 'technology'
    };
    return typeMap?.[categoryType];
  },

  sanitizeItemKey(itemName) {
    return itemName?.toLowerCase()?.replace(/[^a-z0-9]/g, '-')?.replace(/-+/g, '-')?.replace(/^-|-$/g, '');
  }
};