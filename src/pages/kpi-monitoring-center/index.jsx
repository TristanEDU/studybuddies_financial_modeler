import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import KPICard from './components/KPICard';
import AlertPanel from './components/AlertPanel';
import TrendChart from './components/TrendChart';
import PerformanceTable from './components/PerformanceTable';
import GlobalControls from './components/GlobalControls';

const KPIMonitoringCenter = () => {
  const [selectedDateRange, setSelectedDateRange] = useState('30d');
  const [refreshInterval, setRefreshInterval] = useState('5');
  const [openDropdown, setOpenDropdown] = useState(null);

  const closeAllDropdowns = () => {
    setOpenDropdown(null);
  };

  // Mock KPI data
  const kpiData = [
    {
      title: "Customer Acquisition Cost",
      value: "$127",
      unit: "CAC",
      trend: "down",
      trendValue: "-8.2%",
      status: "good",
      sparklineData: [145, 132, 128, 135, 127, 125, 127],
      threshold: "$150"
    },
    {
      title: "Customer Lifetime Value",
      value: "$2,340",
      unit: "LTV",
      trend: "up",
      trendValue: "+12.5%",
      status: "good",
      sparklineData: [2100, 2150, 2200, 2280, 2320, 2340, 2340],
      threshold: "$2,000"
    },
    {
      title: "Monthly Recurring Revenue",
      value: "$48,750",
      unit: "MRR",
      trend: "up",
      trendValue: "+15.3%",
      status: "good",
      sparklineData: [42000, 43500, 45000, 46200, 47800, 48200, 48750],
      threshold: "$45,000"
    },
    {
      title: "Cash Runway",
      value: "14.2",
      unit: "months",
      trend: "down",
      trendValue: "-0.8",
      status: "warning",
      sparklineData: [16.5, 15.8, 15.2, 14.9, 14.5, 14.3, 14.2],
      threshold: "12 months"
    }
  ];

  // Mock alerts data
  const alertsData = [
    {
      id: 1,
      title: "Cash Runway Below Target",
      message: "Current runway of 14.2 months is approaching the 12-month threshold. Consider cost optimization or funding strategies.",
      severity: "warning",
      timestamp: "2 minutes ago"
    },
    {
      id: 2,
      title: "CAC Optimization Success",
      message: "Customer acquisition cost decreased by 8.2% this month, exceeding the 5% reduction target.",
      severity: "info",
      timestamp: "15 minutes ago"
    },
    {
      id: 3,
      title: "MRR Growth Milestone",
      message: "Monthly recurring revenue has exceeded $48K for the first time, representing 15.3% month-over-month growth.",
      severity: "info",
      timestamp: "1 hour ago"
    },
    {
      id: 4,
      title: "Churn Rate Spike Detected",
      message: "Customer churn rate increased to 4.2% this week, above the 3.5% threshold. Immediate attention required.",
      severity: "critical",
      timestamp: "3 hours ago"
    }
  ];

  // Mock trend chart data
  const trendData = [
    { date: "Oct 1", cac: 145, ltv: 2100, mrr: 42000, runway: 16.5 },
    { date: "Oct 8", cac: 132, ltv: 2150, mrr: 43500, runway: 15.8 },
    { date: "Oct 15", cac: 128, ltv: 2200, mrr: 45000, runway: 15.2 },
    { date: "Oct 22", cac: 135, ltv: 2280, mrr: 46200, runway: 14.9 },
    { date: "Oct 29", cac: 127, ltv: 2320, mrr: 47800, runway: 14.5 },
    { date: "Nov 5", cac: 125, ltv: 2340, mrr: 48200, runway: 14.3 },
    { date: "Nov 12", cac: 127, ltv: 2340, mrr: 48750, runway: 14.2 }
  ];

  const chartMetrics = [
    { key: 'cac', name: 'Customer Acquisition Cost' },
    { key: 'ltv', name: 'Customer Lifetime Value' },
    { key: 'mrr', name: 'Monthly Recurring Revenue' },
    { key: 'runway', name: 'Cash Runway (months)' }
  ];

  // Mock performance table data
  const performanceData = [
    {
      month: "November 2024",
      revenue: 48750,
      customers: 324,
      cac: 127,
      ltv: 2340,
      mrr: 48750,
      variance: 15.3
    },
    {
      month: "October 2024",
      revenue: 42300,
      customers: 298,
      cac: 135,
      ltv: 2280,
      mrr: 42300,
      variance: 8.7
    },
    {
      month: "September 2024",
      revenue: 38900,
      customers: 275,
      cac: 142,
      ltv: 2150,
      mrr: 38900,
      variance: 12.1
    },
    {
      month: "August 2024",
      revenue: 34700,
      customers: 251,
      cac: 148,
      ltv: 2050,
      mrr: 34700,
      variance: 6.4
    },
    {
      month: "July 2024",
      revenue: 32600,
      customers: 234,
      cac: 155,
      ltv: 1980,
      mrr: 32600,
      variance: 4.2
    },
    {
      month: "June 2024",
      revenue: 31300,
      customers: 218,
      cac: 162,
      ltv: 1920,
      mrr: 31300,
      variance: -2.1
    }
  ];

  const handleDateRangeChange = (range) => {
    setSelectedDateRange(range);
    console.log('Date range changed to:', range);
  };

  const handleRefreshIntervalChange = (interval) => {
    setRefreshInterval(interval);
    console.log('Refresh interval changed to:', interval);
  };

  const handleThresholdUpdate = (thresholds) => {
    console.log('Thresholds updated:', thresholds);
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>KPI Monitoring Center - StudyBuddies Financial Modeler</title>
        <meta name="description" content="Real-time financial performance tracking with alerts and trend analysis for executive decision-making" />
      </Helmet>
      <Header closeAllDropdowns={closeAllDropdowns} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Controls */}
        <GlobalControls
          onDateRangeChange={handleDateRangeChange}
          onRefreshIntervalChange={handleRefreshIntervalChange}
          onThresholdUpdate={handleThresholdUpdate}
        />

        {/* Primary KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {kpiData?.map((kpi, index) => (
            <KPICard
              key={index}
              title={kpi?.title}
              value={kpi?.value}
              unit={kpi?.unit}
              trend={kpi?.trend}
              trendValue={kpi?.trendValue}
              status={kpi?.status}
              sparklineData={kpi?.sparklineData}
              threshold={kpi?.threshold}
            />
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-16 gap-6 mb-8">
          {/* Trend Chart */}
          <div className="xl:col-span-12">
            <TrendChart
              data={trendData}
              metrics={chartMetrics}
            />
          </div>

          {/* Alert Panel */}
          <div className="xl:col-span-4">
            <AlertPanel alerts={alertsData} />
          </div>
        </div>

        {/* Performance Summary Table */}
        <div className="mb-8">
          <PerformanceTable data={performanceData} />
        </div>

        {/* Additional Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Key Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">LTV:CAC Ratio Improvement</p>
                  <p className="text-sm text-muted-foreground">Current ratio of 18.4:1 exceeds industry benchmark of 15:1, indicating strong unit economics.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Cash Management Alert</p>
                  <p className="text-sm text-muted-foreground">Runway trending downward. Consider revenue acceleration or cost optimization strategies.</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-foreground">Growth Momentum</p>
                  <p className="text-sm text-muted-foreground">MRR growth rate of 15.3% positions company for strong Q4 performance.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card rounded-lg border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recommended Actions</h3>
            <div className="space-y-4">
              <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm font-medium text-green-800 dark:text-green-400">Optimize Marketing Spend</p>
                <p className="text-sm text-green-700 dark:text-green-300">CAC reduction trend suggests marketing efficiency gains. Consider reallocating budget to high-performing channels.</p>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-400">Monitor Churn Closely</p>
                <p className="text-sm text-amber-700 dark:text-amber-300">Recent churn spike requires immediate attention. Implement retention campaigns and customer success initiatives.</p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-400">Prepare Funding Strategy</p>
                <p className="text-sm text-blue-700 dark:text-blue-300">With 14.2 months runway, begin fundraising preparations or explore revenue acceleration opportunities.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KPIMonitoringCenter;