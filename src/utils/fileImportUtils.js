import Papa from "papaparse";

/**
 * File Import Utility for Cost Data
 * Supports CSV, JSON, and structured text parsing
 */

export const FileImportUtils = {
	/**
	 * Parse CSV file and extract cost data
	 * @param {File} file - The CSV file to parse
	 * @returns {Promise<Object>} Parsed data with detected structure
	 */
	async parseCSV(file) {
		return new Promise((resolve, reject) => {
			Papa.parse(file, {
				header: true,
				skipEmptyLines: true,
				dynamicTyping: true,
				transformHeader: (header) =>
					header.trim().toLowerCase().replace(/\s+/g, "_"),
				complete: (results) => {
					try {
						const parsed = this.detectCSVStructure(results.data);
						resolve({
							success: true,
							data: parsed,
							rowCount: results.data.length,
							headers: results.meta.fields,
							errors: results.errors,
						});
					} catch (error) {
						reject({
							success: false,
							error: error.message,
							parseErrors: results.errors,
						});
					}
				},
				error: (error) => {
					reject({
						success: false,
						error: error.message,
					});
				},
			});
		});
	},

	/**
	 * Detect structure from CSV data
	 * Intelligently maps columns to cost item properties
	 */
	detectCSVStructure(rows) {
		if (!rows || rows.length === 0) {
			throw new Error("CSV file is empty");
		}

		const detected = {
			categories: {},
			unmappedRows: [],
			suggestions: [],
		};

		rows.forEach((row, index) => {
			try {
				const mappedRow = this.mapRowToCostandItem(row);

				if (!mappedRow.category) {
					detected.unmappedRows.push({ row: index + 1, data: row });
					return;
				}

				// Create category if it doesn't exist
				if (!detected.categories[mappedRow.category]) {
					detected.categories[mappedRow.category] = {
						name: this.formatCategoryName(mappedRow.category),
						type: mappedRow.categoryType || "custom",
						enabled: true,
						items: {},
					};
				}

				// Add item to category
				const itemKey = this.sanitizeKey(mappedRow.name || `item_${index}`);
				detected.categories[mappedRow.category].items[itemKey] = {
					label: mappedRow.name,
					value: mappedRow.cost || 0,
					minValue: mappedRow.minValue || 0,
					maxValue: mappedRow.maxValue || mappedRow.cost * 10 || 100000,
					step:
						mappedRow.step || Math.max(100, Math.floor(mappedRow.cost / 10)),
					enabled: mappedRow.enabled !== false,
					quantity: mappedRow.quantity || 1,
					...mappedRow.metadata,
				};
			} catch (error) {
				detected.unmappedRows.push({
					row: index + 1,
					data: row,
					error: error.message,
				});
			}
		});

		return detected;
	},

	/**
	 * Map CSV row to cost item structure
	 * Supports various column naming conventions
	 */
	mapRowToCostandItem(row) {
		const mapped = {};

		// Detect category (various possible column names)
		const categoryFields = [
			"category",
			"type",
			"group",
			"section",
			"department",
		];
		for (const field of categoryFields) {
			if (row[field]) {
				mapped.category = this.sanitizeKey(row[field]);
				mapped.categoryType = this.detectCategoryType(row[field]);
				break;
			}
		}

		// Detect item name
		const nameFields = [
			"name",
			"item",
			"description",
			"label",
			"title",
			"item_name",
		];
		for (const field of nameFields) {
			if (row[field]) {
				mapped.name = row[field];
				break;
			}
		}

		// Detect cost/value (various possible column names)
		const costFields = [
			"cost",
			"value",
			"amount",
			"price",
			"monthly_cost",
			"monthly",
			"expense",
		];
		for (const field of costFields) {
			if (
				row[field] !== undefined &&
				row[field] !== null &&
				row[field] !== ""
			) {
				mapped.cost = parseFloat(row[field]) || 0;
				break;
			}
		}

		// Detect quantity
		const quantityFields = ["quantity", "qty", "count", "number", "units"];
		for (const field of quantityFields) {
			if (row[field] !== undefined && row[field] !== null) {
				mapped.quantity = parseInt(row[field]) || 1;
				break;
			}
		}

		// Detect min/max/step
		if (row.min_value !== undefined)
			mapped.minValue = parseFloat(row.min_value) || 0;
		if (row.max_value !== undefined)
			mapped.maxValue = parseFloat(row.max_value);
		if (row.step !== undefined) mapped.step = parseFloat(row.step);

		// Detect enabled status
		const enabledFields = ["enabled", "active", "status"];
		for (const field of enabledFields) {
			if (row[field] !== undefined) {
				const val = row[field];
				mapped.enabled =
					val === true ||
					val === 1 ||
					val === "true" ||
					val === "yes" ||
					val === "active";
				break;
			}
		}

		// Additional metadata
		mapped.metadata = {};
		if (row.hours !== undefined) mapped.metadata.hours = parseFloat(row.hours);
		if (row.benefits !== undefined)
			mapped.metadata.benefits = parseFloat(row.benefits);
		if (row.notes !== undefined) mapped.metadata.notes = row.notes;

		return mapped;
	},

	/**
	 * Detect category type from name
	 */
	detectCategoryType(categoryName) {
		const lower = categoryName.toLowerCase();

		if (
			lower.includes("person") ||
			lower.includes("staff") ||
			lower.includes("employee") ||
			lower.includes("hr")
		) {
			return "personnel";
		}
		if (
			lower.includes("market") ||
			lower.includes("sales") ||
			lower.includes("advertis")
		) {
			return "marketing";
		}
		if (
			lower.includes("tech") ||
			lower.includes("software") ||
			lower.includes("it") ||
			lower.includes("infrastructure")
		) {
			return "technology";
		}
		if (
			lower.includes("operation") ||
			lower.includes("office") ||
			lower.includes("facility")
		) {
			return "operations";
		}

		return "custom";
	},

	/**
	 * Parse JSON file
	 */
	async parseJSON(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();

			reader.onload = (e) => {
				try {
					const data = JSON.parse(e.target.result);
					const validated = this.validateJSONStructure(data);

					resolve({
						success: true,
						data: validated,
						format: "json",
					});
				} catch (error) {
					reject({
						success: false,
						error: `Invalid JSON: ${error.message}`,
					});
				}
			};

			reader.onerror = () => {
				reject({
					success: false,
					error: "Failed to read file",
				});
			};

			reader.readAsText(file);
		});
	},

	/**
	 * Validate and normalize JSON structure
	 */
	validateJSONStructure(data) {
		// If it's already in the correct format, return it
		if (
			data.personnel ||
			data.operations ||
			data.marketing ||
			data.technology ||
			data.customCategories
		) {
			return data;
		}

		// If it's an array of cost items, convert to structure
		if (Array.isArray(data)) {
			return this.arrayToStructure(data);
		}

		// If it's a flat object, try to convert
		if (typeof data === "object") {
			return this.objectToStructure(data);
		}

		throw new Error("Unrecognized JSON format");
	},

	/**
	 * Convert array of items to cost structure
	 */
	arrayToStructure(items) {
		const structure = { customCategories: {} };

		items.forEach((item, index) => {
			const category = item.category || item.type || "uncategorized";
			const categoryKey = this.sanitizeKey(category);

			if (!structure.customCategories[categoryKey]) {
				structure.customCategories[categoryKey] = {
					name: this.formatCategoryName(category),
					type: "custom",
					enabled: true,
					items: {},
				};
			}

			const itemKey = this.sanitizeKey(item.name || `item_${index}`);
			structure.customCategories[categoryKey].items[itemKey] = {
				label: item.name || item.label || itemKey,
				value: item.cost || item.value || 0,
				enabled: item.enabled !== false,
				quantity: item.quantity || 1,
			};
		});

		return structure;
	},

	/**
	 * Convert flat object to cost structure
	 */
	objectToStructure(obj) {
		const structure = { customCategories: {} };

		Object.entries(obj).forEach(([key, value]) => {
			if (typeof value === "object" && !Array.isArray(value)) {
				// Assume it's a category
				const categoryKey = this.sanitizeKey(key);
				structure.customCategories[categoryKey] = {
					name: this.formatCategoryName(key),
					type: "custom",
					enabled: true,
					items: value.items || {},
				};
			} else {
				// Treat as a simple cost item
				const itemKey = this.sanitizeKey(key);
				if (!structure.customCategories.general) {
					structure.customCategories.general = {
						name: "General",
						type: "custom",
						enabled: true,
						items: {},
					};
				}
				structure.customCategories.general.items[itemKey] = {
					label: this.formatCategoryName(key),
					value: parseFloat(value) || 0,
					enabled: true,
					quantity: 1,
				};
			}
		});

		return structure;
	},

	/**
	 * Auto-detect file format and parse
	 */
	async parseFile(file) {
		const extension = file.name.split(".").pop().toLowerCase();

		switch (extension) {
			case "csv":
				return await this.parseCSV(file);

			case "json":
				return await this.parseJSON(file);

			case "txt":
				// Try to parse as CSV first, then JSON
				try {
					return await this.parseCSV(file);
				} catch {
					return await this.parseJSON(file);
				}

			default:
				throw new Error(`Unsupported file format: .${extension}`);
		}
	},

	/**
	 * Sanitize key for use in object
	 */
	sanitizeKey(str) {
		return str
			.toLowerCase()
			.replace(/[^a-z0-9]/g, "_")
			.replace(/_{2,}/g, "_")
			.replace(/^_|_$/g, "");
	},

	/**
	 * Format category name for display
	 */
	formatCategoryName(str) {
		return str.replace(/[_-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
	},

	/**
	 * Validate imported data before merging
	 */
	validateImportedData(data) {
		const errors = [];
		const warnings = [];

		if (!data || typeof data !== "object") {
			errors.push("Invalid data structure");
			return { valid: false, errors, warnings };
		}

		// Check for cost categories
		const hasCategories =
			data.personnel ||
			data.operations ||
			data.marketing ||
			data.technology ||
			(data.customCategories && Object.keys(data.customCategories).length > 0);

		if (!hasCategories) {
			warnings.push("No cost categories found");
		}

		// Validate cost values
		const validateItems = (items) => {
			if (!items || typeof items !== "object") return;

			Object.entries(items).forEach(([key, item]) => {
				if (typeof item !== "object") {
					errors.push(`Invalid item structure: ${key}`);
					return;
				}

				if (item.value !== undefined && (isNaN(item.value) || item.value < 0)) {
					errors.push(`Invalid cost value for ${key}: ${item.value}`);
				}

				if (
					item.quantity !== undefined &&
					(isNaN(item.quantity) || item.quantity < 0)
				) {
					warnings.push(`Invalid quantity for ${key}: ${item.quantity}`);
				}
			});
		};

		// Validate all categories
		["personnel", "operations", "marketing", "technology"].forEach(
			(category) => {
				if (data[category]?.items) {
					validateItems(data[category].items);
				}
			}
		);

		if (data.customCategories) {
			Object.values(data.customCategories).forEach((category) => {
				if (category.items) {
					validateItems(category.items);
				}
			});
		}

		return {
			valid: errors.length === 0,
			errors,
			warnings,
		};
	},

	/**
	 * Merge imported data with existing costs
	 */
	mergeImportedData(existingCosts, importedData, strategy = "merge") {
		const existing = JSON.parse(JSON.stringify(existingCosts || {}));
		const imported = JSON.parse(JSON.stringify(importedData || {}));

		switch (strategy) {
			case "replace":
				// Replace all existing data
				return imported;

			case "merge":
				// Merge categories, imported takes precedence on conflicts
				return this.deepMerge(existing, imported);

			case "add":
				// Only add new items, don't overwrite existing
				return this.mergeAddOnly(existing, imported);

			default:
				return this.deepMerge(existing, imported);
		}
	},

	/**
	 * Deep merge two objects
	 */
	deepMerge(target, source) {
		const output = { ...target };

		Object.keys(source).forEach((key) => {
			if (
				source[key] &&
				typeof source[key] === "object" &&
				!Array.isArray(source[key])
			) {
				output[key] = this.deepMerge(target[key] || {}, source[key]);
			} else {
				output[key] = source[key];
			}
		});

		return output;
	},

	/**
	 * Merge adding only new items
	 */
	mergeAddOnly(target, source) {
		const output = { ...target };

		Object.keys(source).forEach((key) => {
			if (!output[key]) {
				output[key] = source[key];
			} else if (
				typeof source[key] === "object" &&
				!Array.isArray(source[key])
			) {
				output[key] = this.mergeAddOnly(output[key], source[key]);
			}
		});

		return output;
	},

	/**
	 * Generate sample CSV template
	 */
	generateCSVTemplate() {
		const template = [
			["category", "name", "cost", "quantity", "enabled", "notes"],
			[
				"Personnel",
				"Software Engineer",
				"8000",
				"3",
				"true",
				"Full-time employees",
			],
			["Personnel", "UI Designer", "6500", "1", "true", ""],
			[
				"Operations",
				"Office Rent",
				"5000",
				"1",
				"true",
				"Monthly office space",
			],
			["Marketing", "Digital Ads", "3000", "1", "true", "Google/Facebook ads"],
			[
				"Technology",
				"Cloud Infrastructure",
				"1200",
				"1",
				"true",
				"AWS hosting",
			],
		];

		return Papa.unparse(template);
	},

	/**
	 * Download template as CSV file
	 */
	downloadCSVTemplate() {
		const csv = this.generateCSVTemplate();
		const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
		const link = document.createElement("a");
		const url = URL.createObjectURL(blob);

		link.setAttribute("href", url);
		link.setAttribute("download", "cost_import_template.csv");
		link.style.visibility = "hidden";

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
	},
};

export default FileImportUtils;
