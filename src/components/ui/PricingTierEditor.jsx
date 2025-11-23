import { useState } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';

/**
 * Pricing Tier Editor Component
 * Allows users to add, edit, and remove pricing tiers
 */
export function PricingTierEditor({ isOpen, onClose, pricingTiers, onSave }) {
  const [tiers, setTiers] = useState(pricingTiers || []);
  const [editingId, setEditingId] = useState(null);

  const handleAddTier = () => {
    const newTier = {
      id: `tier_${Date.now()}`,
      name: 'New Tier',
      price: 0,
      billingPeriod: 'monthly', // monthly, annual, lifetime
      isNew: true
    };
    setTiers([...tiers, newTier]);
    setEditingId(newTier.id);
  };

  const handleUpdateTier = (id, field, value) => {
    setTiers(tiers.map(tier => 
      tier.id === id 
        ? { ...tier, [field]: field === 'price' ? parseFloat(value) || 0 : value }
        : tier
    ));
  };

  const handleDeleteTier = (id) => {
    if (tiers.length <= 1) {
      alert('You must have at least one pricing tier');
      return;
    }
    setTiers(tiers.filter(tier => tier.id !== id));
  };

  const handleSave = () => {
    // Validate tiers
    const invalidTiers = tiers.filter(tier => 
      !tier.name?.trim() || tier.price <= 0
    );

    if (invalidTiers.length > 0) {
      alert('All tiers must have a name and a price greater than 0');
      return;
    }

    // Check for duplicate names
    const names = tiers.map(t => t.name.toLowerCase());
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      alert('Each tier must have a unique name');
      return;
    }

    onSave(tiers);
    onClose();
  };

  const handleCancel = () => {
    setTiers(pricingTiers || []);
    setEditingId(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Icon name="DollarSign" size={20} className="text-primary" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Manage Pricing Tiers
              </h2>
            </div>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Define your pricing tiers to model different revenue scenarios. Each tier should have a unique name and monthly price.
            </p>
          </div>

          {/* Tiers List */}
          <div className="space-y-3">
            {tiers.map((tier, index) => (
              <div
                key={tier.id}
                className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-start gap-4">
                  {/* Tier Number */}
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                      {index + 1}
                    </span>
                  </div>

                  {/* Tier Fields */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Tier Name
                      </label>
                      <Input
                        value={tier.name}
                        onChange={(e) => handleUpdateTier(tier.id, 'name', e.target.value)}
                        placeholder="e.g., Basic, Pro, Enterprise"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Price ($)
                      </label>
                      <Input
                        type="number"
                        value={tier.price}
                        onChange={(e) => handleUpdateTier(tier.id, 'price', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="1"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Billing Period
                      </label>
                      <select
                        value={tier.billingPeriod || 'monthly'}
                        onChange={(e) => handleUpdateTier(tier.id, 'billingPeriod', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="monthly">Monthly</option>
                        <option value="annual">Annual</option>
                        <option value="lifetime">Lifetime</option>
                      </select>
                    </div>
                  </div>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteTier(tier.id)}
                    className="flex-shrink-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                    title="Delete tier"
                  >
                    <Icon name="Trash2" size={18} />
                  </button>
                </div>

                {/* Calculated Metrics */}
                {tier.price > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {tier.billingPeriod === 'monthly' && (
                        <>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Annual Price:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              ${(tier.price * 12).toLocaleString()}/year
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Per User/Day:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              ${(tier.price / 30).toFixed(2)}/day
                            </span>
                          </div>
                        </>
                      )}
                      {tier.billingPeriod === 'annual' && (
                        <>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Monthly Equiv:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              ${(tier.price / 12).toFixed(2)}/month
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Per User/Day:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              ${(tier.price / 365).toFixed(2)}/day
                            </span>
                          </div>
                        </>
                      )}
                      {tier.billingPeriod === 'lifetime' && (
                        <>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">One-time Payment</span>
                          </div>
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Assumed 5yr Value:</span>
                            <span className="ml-2 font-medium text-gray-900 dark:text-white">
                              ${(tier.price / 60).toFixed(2)}/month
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Tier Button */}
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={handleAddTier}
              iconName="Plus"
              iconSize={16}
              fullWidth
            >
              Add Pricing Tier
            </Button>
          </div>

          {/* Tips */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex">
              <Icon name="Lightbulb" size={16} className="text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-medium mb-1">Pricing Tips:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Order tiers from lowest to highest price</li>
                  <li>Use clear, memorable names (Basic, Pro, Enterprise)</li>
                  <li>Consider 2-4x price differences between tiers</li>
                  <li>Annual pricing typically offers 15-20% discount vs monthly</li>
                  <li>Lifetime pricing should be 3-5x annual price</li>
                  <li>Test different scenarios to find optimal pricing</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {tiers.length} {tiers.length === 1 ? 'tier' : 'tiers'}
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Tiers
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingTierEditor;
