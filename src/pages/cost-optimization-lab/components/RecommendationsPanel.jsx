import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const RecommendationsPanel = ({ categories, selectedCategories }) => {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [expandedRecommendation, setExpandedRecommendation] = useState(null);

  const generateRecommendations = () => {
    const filteredCategories = categories?.filter(cat => selectedCategories?.includes(cat?.id));
    
    return filteredCategories?.map(cat => ({
        id: cat?.id,
        category: cat?.name,
        priority: cat?.optimizationPotential > 70 ? 'high' : cat?.optimizationPotential > 40 ? 'medium' : 'low',
        potentialSavings: Math.round(cat?.monthlyCost * (cat?.optimizationPotential / 100)),
        implementationTime: cat?.implementationDifficulty < 30 ? '1-2 weeks' : 
                           cat?.implementationDifficulty < 60 ? '1-2 months' : '3-6 months',
        difficulty: cat?.implementationDifficulty,
        recommendation: getRecommendationText(cat),
        steps: getImplementationSteps(cat),
        risks: getRisks(cat),
        monthlyCost: cat?.monthlyCost
      }))?.sort((a, b) => b?.potentialSavings - a?.potentialSavings)?.slice(0, 8);
  };

  const getRecommendationText = (category) => {
    const recommendations = {
      'office-rent': 'Consider negotiating lease terms or exploring co-working spaces to reduce fixed overhead costs.',
      'salaries': 'Implement performance-based compensation and review role redundancies for optimization.',
      'software': 'Audit software licenses and consolidate tools to eliminate redundant subscriptions.',
      'marketing': 'Focus on high-ROI channels and implement data-driven budget allocation strategies.',
      'contractors': 'Evaluate contractor vs employee cost-benefit and optimize hourly rates through negotiations.',
      'utilities': 'Implement energy-efficient solutions and negotiate better rates with service providers.',
      'insurance': 'Review coverage levels and shop for competitive rates while maintaining adequate protection.',
      'equipment': 'Consider leasing vs buying analysis and implement equipment lifecycle management.'
    };
    return recommendations?.[category?.id] || 'Analyze cost structure and identify optimization opportunities through detailed review.';
  };

  const getImplementationSteps = (category) => {
    const steps = {
      'office-rent': ['Review current lease terms', 'Research alternative locations', 'Negotiate with landlord', 'Plan relocation if needed'],
      'salaries': ['Conduct salary benchmarking', 'Review performance metrics', 'Implement new compensation structure', 'Monitor impact'],
      'software': ['Audit current subscriptions', 'Identify redundancies', 'Negotiate with vendors', 'Implement consolidated solution'],
      'marketing': ['Analyze channel performance', 'Reallocate budget to high-ROI channels', 'Implement tracking systems', 'Monitor results']
    };
    return steps?.[category?.id] || ['Analyze current state', 'Identify opportunities', 'Develop implementation plan', 'Execute and monitor'];
  };

  const getRisks = (category) => {
    const risks = {
      'office-rent': ['Disruption to operations', 'Employee satisfaction impact', 'Moving costs'],
      'salaries': ['Employee retention risk', 'Morale impact', 'Productivity concerns'],
      'software': ['Workflow disruption', 'Training requirements', 'Integration challenges'],
      'marketing': ['Revenue impact', 'Brand visibility reduction', 'Customer acquisition slowdown']
    };
    return risks?.[category?.id] || ['Implementation complexity', 'Change management challenges', 'Temporary productivity impact'];
  };

  const recommendations = generateRecommendations();
  
  const highPriorityCount = recommendations?.filter(r => r?.priority === 'high')?.length;
  const totalPotentialSavings = recommendations?.reduce((sum, r) => sum + r?.potentialSavings, 0);

  const tabs = [
    { id: 'recommendations', label: 'Recommendations', icon: 'Lightbulb', count: recommendations?.length },
    { id: 'timeline', label: 'Timeline', icon: 'Calendar', count: null },
    { id: 'impact', label: 'Impact Analysis', icon: 'BarChart3', count: null }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'medium': return 'text-warning bg-warning/10 border-warning/20';
      case 'low': return 'text-success bg-success/10 border-success/20';
      default: return 'text-muted-foreground bg-muted/10 border-border';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6 h-fit">
      <div className="flex items-center space-x-2 mb-6">
        <Icon name="Brain" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-foreground">AI Recommendations</h3>
      </div>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="AlertTriangle" size={16} className="text-destructive" />
            <span className="text-sm font-medium text-foreground">High Priority</span>
          </div>
          <p className="text-xl font-bold text-foreground">{highPriorityCount}</p>
        </div>
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-1">
            <Icon name="DollarSign" size={16} className="text-success" />
            <span className="text-sm font-medium text-foreground">Potential Savings</span>
          </div>
          <p className="text-xl font-bold text-foreground">${totalPotentialSavings?.toLocaleString()}</p>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex space-x-1 mb-4 bg-muted rounded-lg p-1">
        {tabs?.map((tab) => (
          <button
            key={tab?.id}
            onClick={() => setActiveTab(tab?.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === tab?.id
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon name={tab?.icon} size={14} />
            <span>{tab?.label}</span>
            {tab?.count && (
              <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                {tab?.count}
              </span>
            )}
          </button>
        ))}
      </div>
      {/* Content */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {activeTab === 'recommendations' && (
          <>
            {recommendations?.map((rec) => (
              <div key={rec?.id} className="border border-border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-medium text-foreground">{rec?.category}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(rec?.priority)}`}>
                        {rec?.priority?.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{rec?.recommendation}</p>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>💰 ${rec?.potentialSavings?.toLocaleString()}/month</span>
                      <span>⏱️ {rec?.implementationTime}</span>
                      <span>📊 {rec?.difficulty}% difficulty</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setExpandedRecommendation(
                      expandedRecommendation === rec?.id ? null : rec?.id
                    )}
                  >
                    <Icon 
                      name={expandedRecommendation === rec?.id ? "ChevronUp" : "ChevronDown"} 
                      size={16} 
                    />
                  </Button>
                </div>

                {expandedRecommendation === rec?.id && (
                  <div className="border-t border-border pt-3 space-y-3">
                    <div>
                      <h5 className="text-sm font-medium text-foreground mb-2">Implementation Steps:</h5>
                      <ol className="text-sm text-muted-foreground space-y-1">
                        {rec?.steps?.map((step, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <span className="text-primary font-medium">{index + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-foreground mb-2">Potential Risks:</h5>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        {rec?.risks?.map((risk, index) => (
                          <li key={index} className="flex items-start space-x-2">
                            <Icon name="AlertCircle" size={12} className="text-warning mt-0.5" />
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {activeTab === 'timeline' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Icon name="Calendar" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">Implementation Timeline</h4>
              <p className="text-muted-foreground">
                Timeline view showing recommended implementation sequence based on priority and dependencies.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Icon name="BarChart3" size={48} className="text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground mb-2">Impact Analysis</h4>
              <p className="text-muted-foreground">
                Detailed analysis of financial impact and ROI projections for each optimization opportunity.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendationsPanel;