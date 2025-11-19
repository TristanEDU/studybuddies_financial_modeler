import { supabase } from '../lib/supabase';
import { costService } from './costService';

export const financialService = {
  // Create a new financial scenario
  async createScenario(scenarioData) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // ENHANCED: Validate and structure cost data before saving
      const validatedCostData = this.validateCostData(scenarioData?.costData);

      const { data, error } = await supabase?.from('financial_scenarios')?.insert({
        user_id: user?.id,
        name: scenarioData?.name || 'Untitled Scenario',
        description: scenarioData?.description || '',
        cost_data: validatedCostData,
        pricing_data: scenarioData?.pricingData || { activePricing: 'standard' },
        status: 'active',
        is_template: scenarioData?.isTemplate || false
      })?.select()?.single();

      if (error) throw error;

      // Save detailed cost structure to related tables
      if (validatedCostData && Object.keys(validatedCostData)?.length > 0) {
        try {
          await costService?.saveCostCategories(data?.id, validatedCostData);
        } catch (costError) {
          console.error('Error saving cost categories:', costError);
          // Don't fail the entire operation if cost details fail
        }
      }

      return {
        id: data?.id,
        userId: data?.user_id,
        name: data?.name,
        description: data?.description,
        costData: validatedCostData,
        pricingData: data?.pricing_data,
        status: data?.status,
        isTemplate: data?.is_template,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('Error creating scenario:', error);
      throw error;
    }
  },

  // Update an existing scenario
  async updateScenario(scenarioId, updates) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // ENHANCED: Validate cost data if provided
      const updateData = { ...updates };
      if (updateData?.costData) {
        updateData.cost_data = this.validateCostData(updateData?.costData);
        delete updateData?.costData;
      }

      const { data, error } = await supabase?.from('financial_scenarios')
        ?.update({
          ...updateData,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', scenarioId)
        ?.eq('user_id', user?.id)
        ?.select()
        ?.single();

      if (error) throw error;

      // Update cost categories if cost data was provided
      if (updates?.costData) {
        try {
          await costService?.saveCostCategories(scenarioId, updates?.costData);
        } catch (costError) {
          console.error('Error updating cost categories:', costError);
        }
      }

      return {
        id: data?.id,
        userId: data?.user_id,
        name: data?.name,
        description: data?.description,
        costData: data?.cost_data,
        pricingData: data?.pricing_data,
        status: data?.status,
        isTemplate: data?.is_template,
        createdAt: data?.created_at,
        updatedAt: data?.updated_at
      };
    } catch (error) {
      console.error('Error updating scenario:', error);
      throw error;
    }
  },

  // Get all scenarios for the current user
  async getScenarios() {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase?.from('financial_scenarios')
        ?.select('*')
        ?.eq('user_id', user?.id)
        ?.order('updated_at', { ascending: false });

      if (error) throw error;

      return data?.map(scenario => ({
        id: scenario?.id,
        userId: scenario?.user_id,
        name: scenario?.name,
        description: scenario?.description,
        costData: scenario?.cost_data,
        pricingData: scenario?.pricing_data,
        status: scenario?.status,
        isTemplate: scenario?.is_template,
        createdAt: scenario?.created_at,
        updatedAt: scenario?.updated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching scenarios:', error);
      throw error;
    }
  },

  // Get a scenario with detailed cost data from related tables
  async getScenarioWithCostData(scenarioId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: scenario, error } = await supabase?.from('financial_scenarios')
        ?.select('*')
        ?.eq('id', scenarioId)
        ?.eq('user_id', user?.id)
        ?.single();

      if (error) throw error;

      // Get detailed cost data from related tables
      let detailedCostData = scenario?.cost_data || {};
      
      try {
        const costDataFromTables = await costService?.getCostDataForScenario(scenarioId);
        if (costDataFromTables && Object.keys(costDataFromTables)?.length > 0) {
          // Merge with existing cost data, prioritizing table data
          detailedCostData = this.mergeCostData(scenario?.cost_data, costDataFromTables);
        }
      } catch (costError) {
        console.error('Error fetching detailed cost data:', costError);
        // Use the cost_data from scenario table as fallback
      }

      // ENHANCED: Validate the final cost data structure
      const validatedCostData = this.validateCostData(detailedCostData);

      return {
        id: scenario?.id,
        userId: scenario?.user_id,
        name: scenario?.name,
        description: scenario?.description,
        costData: validatedCostData,
        pricingData: scenario?.pricing_data,
        status: scenario?.status,
        isTemplate: scenario?.is_template,
        createdAt: scenario?.created_at,
        updatedAt: scenario?.updated_at
      };
    } catch (error) {
      console.error('Error fetching scenario with cost data:', error);
      throw error;
    }
  },

  // Delete a scenario
  async deleteScenario(scenarioId) {
    try {
      const { data: { user } } = await supabase?.auth?.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete related cost items and categories first
      await supabase?.from('cost_items')?.delete()?.in('category_id', 
        supabase?.from('cost_categories')?.select('id')?.eq('scenario_id', scenarioId)?.eq('user_id', user?.id)
      );
      await supabase?.from('cost_categories')?.delete()?.eq('scenario_id', scenarioId)?.eq('user_id', user?.id);

      // Delete the scenario
      const { error } = await supabase?.from('financial_scenarios')
        ?.delete()
        ?.eq('id', scenarioId)
        ?.eq('user_id', user?.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting scenario:', error);
      throw error;
    }
  },

  // ADDED: Validate and structure cost data to prevent type errors
  validateCostData(costData) {
    if (!costData || typeof costData !== 'object') {
      return this.getDefaultCostStructure();
    }

    const validated = {};

    // Validate personnel structure
    if (costData?.personnel && typeof costData?.personnel === 'object') {
      validated.personnel = {
        employees: {
          roles: this.validateObjectStructure(costData?.personnel?.employees?.roles) || {}
        },
        contractors: {
          enabled: Boolean(costData?.personnel?.contractors?.enabled),
          types: this.validateObjectStructure(costData?.personnel?.contractors?.types) || {}
        }
      };
    } else {
      validated.personnel = {
        employees: { roles: {} },
        contractors: { enabled: false, types: {} }
      };
    }

    // Validate standard categories
    ['operations', 'marketing', 'technology']?.forEach(category => {
      if (costData?.[category] && typeof costData?.[category] === 'object') {
        validated[category] = {
          items: this.validateObjectStructure(costData?.[category]?.items) || {}
        };
      } else {
        validated[category] = { items: {} };
      }
    });

    // Validate custom categories
    if (costData?.customCategories && typeof costData?.customCategories === 'object') {
      validated.customCategories = {};
      Object.entries(costData?.customCategories)?.forEach(([key, category]) => {
        if (category && typeof category === 'object') {
          validated.customCategories[key] = {
            name: category?.name || key,
            type: category?.type || 'custom',
            enabled: Boolean(category?.enabled),
            items: this.validateObjectStructure(category?.items) || {}
          };
        }
      });
    } else {
      validated.customCategories = {};
    }

    return validated;
  },

  // ADDED: Validate object structure to prevent type errors
  validateObjectStructure(obj) {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return {};
    }

    const validated = {};
    Object.entries(obj)?.forEach(([key, value]) => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        validated[key] = { ...value };
      }
    });

    return validated;
  },

  // ADDED: Get default cost structure
  getDefaultCostStructure() {
    return {
      personnel: {
        employees: { roles: {} },
        contractors: { enabled: false, types: {} }
      },
      operations: { items: {} },
      marketing: { items: {} },
      technology: { items: {} },
      customCategories: {}
    };
  },

  // ADDED: Merge cost data structures safely
  mergeCostData(scenarioCostData, tableCostData) {
    const merged = this.validateCostData(scenarioCostData);
    const tableData = this.validateCostData(tableCostData);

    // Merge personnel data
    if (tableData?.personnel?.employees?.roles) {
      Object.assign(merged?.personnel?.employees?.roles, tableData?.personnel?.employees?.roles);
    }
    if (tableData?.personnel?.contractors?.types) {
      Object.assign(merged?.personnel?.contractors?.types, tableData?.personnel?.contractors?.types);
      merged.personnel.contractors.enabled = tableData?.personnel?.contractors?.enabled;
    }

    // Merge standard category items
    ['operations', 'marketing', 'technology']?.forEach(category => {
      if (tableData?.[category]?.items) {
        Object.assign(merged?.[category]?.items, tableData?.[category]?.items);
      }
    });

    // Merge custom categories
    if (tableData?.customCategories) {
      Object.assign(merged?.customCategories, tableData?.customCategories);
    }

    return merged;
  },

  // ADDED: Remove specific cost item
  async removeCostItem(scenarioId, categoryKey, itemKey) {
    try {
      return await costService?.removeCostItem(scenarioId, categoryKey, itemKey);
    } catch (error) {
      console.error('Error removing cost item:', error);
      throw error;
    }
  }
};