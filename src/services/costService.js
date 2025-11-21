import { supabase } from "../lib/supabase";

export const costService = {
	// Create or update cost categories for a scenario
	async saveCostCategories(scenarioId, costData) {
		try {
			const {
				data: { user },
			} = await supabase?.auth?.getUser();
			if (!user) throw new Error("Not authenticated");

			// Fetch existing categories to update enabled status
			const { data: existingCategories } = await supabase
				.from("cost_categories")
				.select("id, category_type, category_name, enabled")
				.eq("scenario_id", scenarioId)
				.eq("user_id", user.id);

			// Fetch existing cost items to update instead of deleting
			let existingItems = [];
			if (existingCategories && existingCategories.length > 0) {
				const categoryIds = existingCategories.map((cat) => cat.id);
				const { data: items } = await supabase
					.from("cost_items")
					.select("id, category_id, item_name, value, metadata")
					.in("category_id", categoryIds);
				existingItems = items || [];
			} // Determine which categories are enabled based on costData
			const enabledCategories = new Set();
			for (const [categoryKey, categoryData] of Object.entries(costData)) {
				if (categoryKey === "customCategories") {
					for (const [customKey, customCategory] of Object.entries(
						categoryData
					)) {
						if (customCategory) {
							enabledCategories.add(`custom_${customCategory.name}`);
						}
					}
				} else if (categoryKey === "personnel" && categoryData) {
					enabledCategories.add("personnel");
				} else if (categoryData && categoryData?.items) {
					enabledCategories.add(categoryKey);
				}
			}

			// Update enabled status for all standard categories
			const standardCategories = [
				"personnel",
				"operations",
				"marketing",
				"technology",
			];
			for (const categoryKey of standardCategories) {
				const categoryType = this.getCategoryType(categoryKey);
				const categoryName = this.getCategoryDisplayName(categoryKey);
				const isEnabled = enabledCategories.has(categoryKey);

				// Check if category exists
				const existing = existingCategories?.find(
					(cat) =>
						cat.category_type === categoryType &&
						cat.category_name === categoryName
				);

				if (existing) {
					// Update enabled status
					await supabase
						.from("cost_categories")
						.update({ enabled: isEnabled, settings: { enabled: isEnabled } })
						.eq("id", existing.id);
				} else {
					// Create new category with enabled status
					await this.createCostCategory(
						scenarioId,
						user.id,
						categoryName,
						categoryType,
						isEnabled
					);
				}
			}

			// Get updated list of all categories (with enabled status)
			const { data: allCategories } = await supabase
				.from("cost_categories")
				.select("id, category_type, category_name, enabled")
				.eq("scenario_id", scenarioId)
				.eq("user_id", user.id);

			const results = {
				categories: allCategories || [],
				items: [],
			};

			// Only create cost_items for ENABLED categories
			for (const [categoryKey, categoryData] of Object.entries(costData)) {
				if (categoryKey === "customCategories") {
					// Handle custom categories
					for (const [customKey, customCategory] of Object.entries(
						categoryData
					)) {
						if (customCategory && customCategory?.items) {
							// Find the category in the database
							const categoryRecord = allCategories?.find(
								(cat) =>
									cat.category_type === "custom" &&
									cat.category_name === customCategory.name
							);

							if (!categoryRecord) {
								// Create if it doesn't exist
								const categoryResult = await this.createCostCategory(
									scenarioId,
									user.id,
									customCategory.name,
									"custom",
									true
								);
								results.categories.push(categoryResult);
								categoryRecord = categoryResult;
							}

							// Create cost items only if enabled
							if (categoryRecord.enabled) {
								for (const [itemKey, item] of Object.entries(
									customCategory.items
								)) {
									if (
										item &&
										item?.value !== undefined &&
										item?.value !== null
									) {
										const itemResult = await this.upsertCostItem(
											categoryRecord.id,
											user.id,
											item?.label || itemKey,
											item?.value,
											{
												...item,
												itemKey: itemKey,
											},
											existingItems
										);
										results.items.push(itemResult);
									}
								}
							}
						}
					}
				} else if (categoryKey === "personnel" && categoryData) {
					// Handle personnel category
					const categoryRecord = allCategories?.find(
						(cat) => cat.category_type === "personnel"
					);

					// Create items only if enabled
					if (categoryRecord?.enabled) {
						// Handle employees
						if (categoryData?.employees?.roles) {
							for (const [roleKey, role] of Object.entries(
								categoryData.employees.roles
							)) {
								// DEBUG: Log what we're processing
								console.log(`[SAVE_PERSONNEL] Processing role:`, roleKey, role);

								// Skip if role is completely missing or not an object
								if (!role || typeof role !== "object") {
									console.warn(
										`[SAVE_PERSONNEL] Skipping ${roleKey} - not an object:`,
										role
									);
									continue;
								}

								// Accept both 'value' (from frontend) and 'salary' (legacy)
								const roleValue = role?.value ?? role?.salary;

								// Only skip if BOTH value and salary are missing/null/undefined
								if (roleValue === undefined || roleValue === null) {
									console.warn(
										`[SAVE_PERSONNEL] Skipping ${roleKey} - no value or salary:`,
										role
									);
									continue;
								}

								const itemResult = await this.upsertCostItem(
									categoryRecord.id,
									user.id,
									role?.name || role?.title || roleKey,
									roleValue,
									{
										count: role?.count || 1,
										hours: role?.hours || 160,
										benefits: role?.benefits || 0,
										type: "personnel",
										label: role?.name || role?.title || roleKey,
										itemKey: roleKey,
									},
									existingItems
								);
								console.log(`[SAVE_PERSONNEL] Saved item:`, itemResult);
								results.items.push(itemResult);
							}
						}

						// Handle contractors
						if (
							categoryData?.contractors?.enabled &&
							categoryData?.contractors?.types
						) {
							for (const [contractorKey, contractor] of Object.entries(
								categoryData.contractors.types
							)) {
								// Accept both 'value' (from frontend) and 'rate' (legacy)
								const contractorRate = contractor?.value ?? contractor?.rate;
								if (
									contractor &&
									contractorRate !== undefined &&
									contractorRate !== null
								) {
									const itemResult = await this.upsertCostItem(
										categoryRecord.id,
										user.id,
										contractor?.name || contractor?.title || contractorKey,
										contractorRate,
										{
											count: contractor?.count || 1,
											hours: contractor?.hours || 160,
											type: "contractor",
											label:
												contractor?.name || contractor?.title || contractorKey,
											itemKey: contractorKey,
										},
										existingItems
									);
									results.items.push(itemResult);
								}
							}
						}
					}
				} else if (categoryData && categoryData?.items) {
					// Handle standard categories (operations, marketing, technology)
					const categoryType = this.getCategoryType(categoryKey);
					const categoryRecord = allCategories?.find(
						(cat) => cat.category_type === categoryType
					);

					// Create items only if enabled
					if (categoryRecord?.enabled) {
						// Create cost items for this category
						for (const [itemKey, item] of Object.entries(categoryData.items)) {
							if (
								item &&
								item?.value !== undefined &&
								item?.value !== null &&
								item !== null
							) {
								const itemResult = await this.upsertCostItem(
									categoryRecord.id,
									user.id,
									item?.label || itemKey,
									item?.value,
									{
										...item,
										itemKey: itemKey,
									},
									existingItems
								);
								results.items.push(itemResult);
							}
						}
					}
				}
			}

			// Clean up items that exist in database but not in current data
			const processedItemIds = results.items.map((item) => item.id);
			const itemsToDelete = existingItems.filter(
				(item) => !processedItemIds.includes(item.id)
			);

			if (itemsToDelete.length > 0) {
				const idsToDelete = itemsToDelete.map((item) => item.id);
				await supabase.from("cost_items").delete().in("id", idsToDelete);
			}

			return results;
		} catch (error) {
			console.error("Error saving cost categories:", error);
			throw error;
		}
	},

	// ADDED: New method to remove a specific cost item
	async removeCostItem(scenarioId, categoryKey, itemKey) {
		try {
			const {
				data: { user },
			} = await supabase?.auth?.getUser();
			if (!user) throw new Error("Not authenticated");

			// Determine if this is a custom category
			const isCustomCategory = categoryKey.startsWith("customCategories.");
			let categoryName, categoryType;

			if (isCustomCategory) {
				// Extract the custom category name from the key
				const customKey = categoryKey.replace("customCategories.", "");
				// Try to find the category by type first
				const { data: categories } = await supabase
					.from("cost_categories")
					.select("id, category_name")
					.eq("scenario_id", scenarioId)
					.eq("user_id", user.id)
					.eq("category_type", "custom");

				// Find matching category by sanitized key
				const matchingCategory = categories?.find(
					(cat) => this.sanitizeItemKey(cat.category_name) === customKey
				);

				if (matchingCategory) {
					// Delete the specific cost item
					const { error } = await supabase
						.from("cost_items")
						.delete()
						.eq("category_id", matchingCategory.id)
						.eq("user_id", user.id)
						.ilike("item_name", itemKey);

					if (error) throw error;
					return true;
				}
			} else {
				// Standard category
				categoryName = this.getCategoryDisplayName(categoryKey);
				categoryType = this.getCategoryType(categoryKey);

				const { data: category } = await supabase
					.from("cost_categories")
					.select("id")
					.eq("scenario_id", scenarioId)
					.eq("user_id", user.id)
					.eq("category_name", categoryName)
					.eq("category_type", categoryType)
					.single();

				if (category) {
					// Delete the specific cost item
					const { error } = await supabase
						.from("cost_items")
						.delete()
						.eq("category_id", category.id)
						.eq("user_id", user.id)
						.ilike("item_name", itemKey);

					if (error) throw error;
				}
			}

			return true;
		} catch (error) {
			console.error("Error removing cost item:", error);
			throw error;
		}
	},

	// Create a cost category
	async createCostCategory(
		scenarioId,
		userId,
		categoryName,
		categoryType,
		enabled = true
	) {
		try {
			const { data, error } = await supabase
				?.from("cost_categories")
				?.insert({
					user_id: userId,
					scenario_id: scenarioId,
					category_name: categoryName,
					category_type: categoryType,
					enabled: enabled,
					settings: { enabled: enabled },
				})
				?.select()
				?.single();

			if (error) throw error;

			return {
				id: data?.id,
				userId: data?.user_id,
				scenarioId: data?.scenario_id,
				categoryName: data?.category_name,
				categoryType: data?.category_type,
				enabled: data?.enabled,
				settings: data?.settings,
				createdAt: data?.created_at,
			};
		} catch (error) {
			console.error("Error creating cost category:", error);
			throw error;
		}
	},

	// Create or update a cost item (upsert logic)
	async upsertCostItem(
		categoryId,
		userId,
		itemName,
		value,
		metadata = {},
		existingItems = []
	) {
		try {
			// Find existing item by itemKey in metadata
			const itemKey = metadata?.itemKey;
			const existingItem = existingItems.find(
				(item) =>
					item.category_id === categoryId &&
					item?.metadata?.itemKey === itemKey &&
					itemKey != null // Checks for both null AND undefined
			);

			if (existingItem) {
				// Update existing item - MERGE metadata to preserve existing fields
				const { data, error } = await supabase
					?.from("cost_items")
					?.update({
						item_name: itemName,
						value: parseFloat(value),
						min_value: metadata?.minValue
							? parseFloat(metadata?.minValue)
							: null,
						max_value: metadata?.maxValue
							? parseFloat(metadata?.maxValue)
							: null,
						step_value: metadata?.step ? parseFloat(metadata?.step) : null,
						enabled: metadata?.enabled !== undefined ? metadata?.enabled : true,
						metadata: {
							// Preserve existing metadata and only override what's passed
							...(existingItem?.metadata || {}),
							...metadata,
							// Only use defaults if value is explicitly undefined
							count:
								metadata?.count !== undefined
									? metadata?.count
									: existingItem?.metadata?.count || 1,
							hours:
								metadata?.hours !== undefined
									? metadata?.hours
									: existingItem?.metadata?.hours || 160,
							benefits:
								metadata?.benefits !== undefined
									? metadata?.benefits
									: existingItem?.metadata?.benefits || 0,
							type: metadata?.type || existingItem?.metadata?.type || "fixed",
							label:
								metadata?.label || existingItem?.metadata?.label || itemName,
							itemKey:
								metadata?.itemKey !== undefined
									? metadata?.itemKey
									: existingItem?.metadata?.itemKey,
						},
					})
					?.eq("id", existingItem.id)
					?.select()
					?.single();

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
					createdAt: data?.created_at,
				};
			} else {
				// Create new item
				const { data, error } = await supabase
					?.from("cost_items")
					?.insert({
						category_id: categoryId,
						user_id: userId,
						item_name: itemName,
						value: parseFloat(value),
						min_value: metadata?.minValue
							? parseFloat(metadata?.minValue)
							: null,
						max_value: metadata?.maxValue
							? parseFloat(metadata?.maxValue)
							: null,
						step_value: metadata?.step ? parseFloat(metadata?.step) : null,
						enabled: metadata?.enabled !== undefined ? metadata?.enabled : true,
						metadata: {
							count: metadata?.count || 1,
							hours: metadata?.hours || 160,
							benefits: metadata?.benefits || 0,
							type: metadata?.type || "fixed",
							label: metadata?.label || itemName,
							itemKey: metadata?.itemKey || null,
						},
					})
					?.select()
					?.single();

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
					createdAt: data?.created_at,
				};
			}
		} catch (error) {
			console.error("Error upserting cost item:", error);
			throw error;
		}
	},

	// Create a cost item
	async createCostItem(categoryId, userId, itemName, value, metadata = {}) {
		try {
			const { data, error } = await supabase
				?.from("cost_items")
				?.insert({
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
						type: metadata?.type || "fixed",
						label: metadata?.label || itemName,
						itemKey: metadata?.itemKey || null,
					},
				})
				?.select()
				?.single();

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
				createdAt: data?.created_at,
			};
		} catch (error) {
			console.error("Error creating cost item:", error);
			throw error;
		}
	},

	// Get cost categories and items for a scenario
	async getCostDataForScenario(scenarioId) {
		try {
			const {
				data: { user },
			} = await supabase?.auth?.getUser();
			if (!user) throw new Error("Not authenticated");

			const { data: categories, error: catError } = await supabase
				?.from("cost_categories")
				?.select(
					`
          *,
          cost_items (*)
        `
				)
				?.eq("scenario_id", scenarioId)
				?.eq("user_id", user?.id);

			if (catError) throw catError;

			// Convert database format back to component format
			const costData = {
				personnel: {
					employees: { roles: {} },
					contractors: { enabled: false, types: {} },
				},
				operations: { items: {} },
				marketing: { items: {} },
				technology: { items: {} },
				customCategories: {},
			};

			categories?.forEach((category) => {
				const categoryKey = this.getCategoryKey(
					category?.category_name,
					category?.category_type
				);

				if (category?.category_type === "custom") {
					costData.customCategories[categoryKey] = {
						name: category?.category_name,
						type: category?.category_type,
						enabled: category?.enabled,
						items: {},
					};

					category?.cost_items?.forEach((item) => {
						const itemKey =
							item?.metadata?.itemKey || this.sanitizeItemKey(item.item_name);
						costData.customCategories[categoryKey].items[itemKey] = {
							label: item?.item_name,
							value: parseFloat(item?.value),
							minValue: item?.min_value ? parseFloat(item?.min_value) : 0,
							maxValue: item?.max_value ? parseFloat(item?.max_value) : 100000,
							step: item?.step_value ? parseFloat(item?.step_value) : 100,
							enabled: item?.enabled,
							count: item?.metadata?.count || 1,
							hours: item?.metadata?.hours || 160,
							benefits: item?.metadata?.benefits || 0,
							type: item?.metadata?.type || "fixed",
						};
					});
				} else {
					const standardCategory = this.getStandardCategoryKey(
						category?.category_type
					);
					if (standardCategory && costData?.[standardCategory]) {
						// Special handling for personnel category
						if (standardCategory === "personnel") {
							category?.cost_items?.forEach((item) => {
								const itemKey = this.sanitizeItemKey(item.item_name);
								const itemType = item?.metadata?.type;

								// Determine if it's a contractor or employee role
								if (itemType === "contractor") {
									// Use stored itemKey from metadata if available, otherwise sanitize
									const storedKey = item?.metadata?.itemKey || itemKey;
									costData.personnel.contractors.enabled = true;
									costData.personnel.contractors.types[storedKey] = {
										name: item?.item_name,
										value: parseFloat(item?.value),
										minValue: item?.min_value ? parseFloat(item?.min_value) : 0,
										maxValue: item?.max_value
											? parseFloat(item?.max_value)
											: 100000,
										step: item?.step_value ? parseFloat(item?.step_value) : 100,
										enabled: item?.enabled,
										count: item?.metadata?.count || 1,
										hours: item?.metadata?.hours || 160,
									};
								} else {
									// Default to personnel role - use stored itemKey from metadata
									const storedKey = item?.metadata?.itemKey || itemKey;
									costData.personnel.employees.roles[storedKey] = {
										name: item?.item_name,
										value: parseFloat(item?.value),
										minValue: item?.min_value ? parseFloat(item?.min_value) : 0,
										maxValue: item?.max_value
											? parseFloat(item?.max_value)
											: 15000,
										step: item?.step_value ? parseFloat(item?.step_value) : 500,
										enabled: item?.enabled,
										count: item?.metadata?.count || 1,
										hours: item?.metadata?.hours || 160,
										benefits: item?.metadata?.benefits || 0,
									};
								}
							});
						} else {
							// Standard categories (operations, marketing, technology)
							category?.cost_items?.forEach((item) => {
								const itemKey =
									item?.metadata?.itemKey ||
									this.sanitizeItemKey(item.item_name);
								costData[standardCategory].items[itemKey] = {
									label: item?.item_name,
									value: parseFloat(item?.value),
									minValue: item?.min_value ? parseFloat(item?.min_value) : 0,
									maxValue: item?.max_value
										? parseFloat(item?.max_value)
										: 100000,
									step: item?.step_value ? parseFloat(item?.step_value) : 100,
									enabled: item?.enabled,
									count: item?.metadata?.count || 1,
									hours: item?.metadata?.hours || 160,
									benefits: item?.metadata?.benefits || 0,
									type: item?.metadata?.type || "fixed",
								};
							});
						}
					}
				}
			});

			return costData;
		} catch (error) {
			console.error("Error getting cost data:", error);
			throw error;
		}
	},

	// Helper methods
	getCategoryType(categoryKey) {
		const categoryMap = {
			personnel: "personnel",
			operations: "operations",
			marketing: "marketing",
			technology: "technology",
		};
		return categoryMap?.[categoryKey] || "custom";
	},

	getCategoryDisplayName(categoryKey) {
		const nameMap = {
			personnel: "Personnel Costs",
			operations: "Operations & Facilities",
			marketing: "Marketing & Sales",
			technology: "Technology & Infrastructure",
		};
		return nameMap?.[categoryKey] || categoryKey;
	},

	getCategoryKey(categoryName, categoryType) {
		if (categoryType === "custom") {
			return this.sanitizeItemKey(categoryName);
		}

		const keyMap = {
			"Personnel Costs": "personnel",
			"Operations & Facilities": "operations",
			"Marketing & Sales": "marketing",
			"Technology & Infrastructure": "technology",
		};
		return keyMap?.[categoryName] || categoryType;
	},

	getStandardCategoryKey(categoryType) {
		const typeMap = {
			personnel: "personnel",
			operations: "operations",
			marketing: "marketing",
			technology: "technology",
		};
		return typeMap?.[categoryType];
	},

	sanitizeItemKey(itemName) {
		return itemName
			?.toLowerCase()
			?.replace(/[^a-z0-9]/g, "-")
			?.replace(/-+/g, "-")
			?.replace(/^-|-$/g, "");
	},
};
