import React, { useEffect, useState } from "react";
import { jobService } from "@/services/api/jobService";
import Chart from "react-apexcharts";
import { endOfMonth, format, isWithinInterval, parseISO, startOfMonth, subMonths } from "date-fns";
import { clientService } from "@/services/api/clientService";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Jobs from "@/components/pages/Jobs";
import Card from "@/components/atoms/Card";

const Reports = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const loadData = async () => {
    try {
      setError('');
      setLoading(true);
      const [jobData] = await Promise.all([
        jobService.getAll()
      ]);
      setJobs(jobData);
    } catch (err) {
      setError('Failed to load report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateMetrics = () => {
    const now = new Date();
    const periods = {
      '3months': 3,
      '6months': 6,
      '12months': 12
    };
    
    const monthsBack = periods[selectedPeriod] || 6;
    const startDate = subMonths(now, monthsBack);
    
    const filteredJobs = jobs.filter(job => {
      const jobDate = parseISO(job.createdAt);
      return jobDate >= startDate;
    });

    const totalRevenue = filteredJobs
      .filter(job => job.status === 'Paid' && job.price)
      .reduce((sum, job) => sum + job.price, 0);

    const averageJobValue = filteredJobs.length > 0 
      ? totalRevenue / filteredJobs.filter(job => job.price).length 
      : 0;

    const completionRate = filteredJobs.length > 0
      ? (filteredJobs.filter(job => job.status === 'Completed' || job.status === 'Paid').length / filteredJobs.length) * 100
      : 0;

    return {
      totalRevenue,
      totalJobs: filteredJobs.length,
      averageJobValue,
      completionRate: Math.round(completionRate)
    };
  };

  const generateMonthlyRevenueData = () => {
    const now = new Date();
    const periods = {
      '3months': 3,
      '6months': 6,
      '12months': 12
    };
    
    const monthsBack = periods[selectedPeriod] || 6;
    const months = [];
    const revenue = [];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthlyRevenue = jobs
        .filter(job => {
          if (!job.paidAt || !job.price) return false;
          const paidDate = parseISO(job.paidAt);
          return isWithinInterval(paidDate, { start: monthStart, end: monthEnd });
        })
        .reduce((sum, job) => sum + job.price, 0);

      months.push(format(monthDate, 'MMM yyyy'));
      revenue.push(monthlyRevenue);
    }

    return { months, revenue };
  };

  const generateServiceTypeData = () => {
    const serviceTypes = {};
    
    jobs.filter(job => job.status === 'Paid' && job.price).forEach(job => {
      const service = job.serviceType || 'Other';
      serviceTypes[service] = (serviceTypes[service] || 0) + job.price;
    });

    return {
      labels: Object.keys(serviceTypes),
      series: Object.values(serviceTypes)
    };
  };

  const generatePaymentStatusData = () => {
    const statusCount = {};
    
    jobs.forEach(job => {
      const status = job.status || 'Unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    return {
      labels: Object.keys(statusCount),
      series: Object.values(statusCount)
    };
  };

  if (loading) return <Loading type="page" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const metrics = calculateMetrics();
  const monthlyData = generateMonthlyRevenueData();
  const serviceData = generateServiceTypeData();
  const paymentData = generatePaymentStatusData();

  const revenueChartOptions = {
    chart: {
      type: 'line',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif'
    },
    colors: ['#3b82f6'],
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    markers: {
      size: 6,
      colors: ['#3b82f6'],
      strokeWidth: 2,
      strokeColors: '#ffffff'
    },
    xaxis: {
      categories: monthlyData.months,
      labels: {
        style: { fontSize: '12px', colors: '#64748b' }
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${value.toLocaleString()}`,
        style: { fontSize: '12px', colors: '#64748b' }
      }
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 5
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toLocaleString()}`
      }
    }
  };

  const serviceChartOptions = {
    chart: {
      type: 'bar',
      toolbar: { show: false },
      fontFamily: 'Inter, sans-serif'
    },
    colors: ['#10b981'],
    plotOptions: {
      bar: {
        borderRadius: 4,
        horizontal: false
      }
    },
    xaxis: {
      categories: serviceData.labels,
      labels: {
        style: { fontSize: '12px', colors: '#64748b' }
      }
    },
    yaxis: {
      labels: {
        formatter: (value) => `$${value.toLocaleString()}`,
        style: { fontSize: '12px', colors: '#64748b' }
      }
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 5
    },
    tooltip: {
      y: {
        formatter: (value) => `$${value.toLocaleString()}`
      }
    }
  };

  const paymentChartOptions = {
    chart: {
      type: 'pie',
      fontFamily: 'Inter, sans-serif'
    },
    colors: ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'],
    labels: paymentData.labels,
    legend: {
      position: 'bottom',
      fontSize: '12px'
    },
    tooltip: {
      y: {
        formatter: (value) => `${value} jobs`
      }
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2 font-display">
              Analytics & Reports
            </h1>
            <p className="text-slate-600">
              Track your business performance and revenue trends
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="3months">Last 3 months</option>
              <option value="6months">Last 6 months</option>
              <option value="12months">Last 12 months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">
                ${metrics.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <ApperIcon name="DollarSign" size={20} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Jobs</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.totalJobs}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <ApperIcon name="Briefcase" size={20} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Avg Job Value</p>
              <p className="text-2xl font-bold text-slate-900">
                ${Math.round(metrics.averageJobValue).toLocaleString()}
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <ApperIcon name="TrendingUp" size={20} className="text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completion Rate</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.completionRate}%</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <ApperIcon name="CheckCircle" size={20} className="text-orange-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Revenue Trend</h3>
            <p className="text-sm text-slate-600">Monthly revenue over time</p>
          </div>
          <Chart
            options={revenueChartOptions}
            series={[{ name: 'Revenue', data: monthlyData.revenue }]}
            type="line"
            height={300}
          />
        </Card>

        {/* Service Type Revenue */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Revenue by Service</h3>
            <p className="text-sm text-slate-600">Total revenue breakdown by service type</p>
          </div>
          <Chart
            options={serviceChartOptions}
            series={[{ name: 'Revenue', data: serviceData.series }]}
            type="bar"
            height={300}
          />
        </Card>
      </div>

      {/* Bottom Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Job Status Distribution */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Job Status Distribution</h3>
            <p className="text-sm text-slate-600">Current status of all jobs</p>
          </div>
          <Chart
            options={paymentChartOptions}
            series={paymentData.series}
            type="pie"
            height={300}
          />
        </Card>

        {/* Performance Summary */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-1">Performance Summary</h3>
            <p className="text-sm text-slate-600">Key business insights</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <ApperIcon name="TrendingUp" size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Revenue Growth</p>
                  <p className="text-sm text-slate-600">Month over month</p>
                </div>
              </div>
              <span className="text-green-600 font-semibold">+12%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <ApperIcon name="Clock" size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Avg Response Time</p>
                  <p className="text-sm text-slate-600">Customer inquiries</p>
                </div>
              </div>
              <span className="text-blue-600 font-semibold">2.4 hrs</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-full">
                  <ApperIcon name="Users" size={16} className="text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Customer Retention</p>
                  <p className="text-sm text-slate-600">Repeat customers</p>
                </div>
              </div>
              <span className="text-purple-600 font-semibold">85%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <ApperIcon name="Star" size={16} className="text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-slate-900">Avg Rating</p>
                  <p className="text-sm text-slate-600">Customer satisfaction</p>
                </div>
              </div>
              <span className="text-orange-600 font-semibold">4.8/5</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Reports;