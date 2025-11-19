import React from 'react';
import Icon from '../../../components/AppIcon';

const AlertPanel = ({ alerts }) => {
  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return 'AlertTriangle';
      case 'warning':
        return 'AlertCircle';
      case 'info':
        return 'Info';
      default:
        return 'Bell';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800';
      case 'info':
        return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      default:
        return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="Bell" size={20} className="text-foreground" />
        <h3 className="text-lg font-semibold text-foreground">Active Alerts</h3>
        <span className="bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-300 text-xs font-medium px-2 py-1 rounded-full">
          {alerts?.filter(alert => alert?.severity === 'critical')?.length} Critical
        </span>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {alerts?.map((alert) => (
          <div key={alert?.id} className={`border rounded-lg p-3 ${getSeverityColor(alert?.severity)}`}>
            <div className="flex items-start space-x-3">
              <Icon name={getSeverityIcon(alert?.severity)} size={16} className="mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium mb-1">{alert?.title}</h4>
                <p className="text-xs opacity-90">{alert?.message}</p>
                <span className="text-xs opacity-70 mt-2 block">{alert?.timestamp}</span>
              </div>
              <button className="text-muted-foreground hover:text-foreground">
                <Icon name="X" size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Last updated: 2 min ago</span>
          <button className="text-primary hover:text-primary/80 font-medium">View All</button>
        </div>
      </div>
    </div>
  );
};

export default AlertPanel;