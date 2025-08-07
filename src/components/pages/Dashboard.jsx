import React, { useEffect, useState } from "react";
import RevenueChart from "@/components/molecules/RevenueChart";
import { jobService } from "@/services/api/jobService";
import { format, isToday } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import JobCard from "@/components/molecules/JobCard";
import MetricCard from "@/components/molecules/MetricCard";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import Card from "@/components/atoms/Card";
const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setError("");
      setLoading(true);
      const jobData = await jobService.getAll();
      setJobs(jobData);
    } catch (err) {
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      await jobService.update(jobId, { status: newStatus });
      await loadData(); // Reload data to reflect changes
    } catch (err) {
      setError("Failed to update job status. Please try again.");
    }
  };

  const calculateMetrics = () => {
    const today = new Date();
    
const todaysJobs = jobs.filter(job => 
      isToday(new Date(job.scheduledDate || job.scheduled_date_c))
    ).length;

    const pendingEstimates = jobs.filter(job => 
      job.status === "Scheduled" && !job.price
    ).length;

    const recentPayments = jobs.filter(job => 
      job.status === "Paid" && job.paidAt && 
      new Date(job.paidAt).getMonth() === today.getMonth()
    ).length;

    const monthlyEarnings = jobs
      .filter(job => job.status === "Paid" && job.price)
      .reduce((sum, job) => sum + job.price, 0);

    return {
      todaysJobs,
      pendingEstimates,
      recentPayments,
      monthlyEarnings
    };
  };

const getTodaysJobs = () => {
    return jobs.filter(job => 
      isToday(new Date(job.scheduledDate || job.scheduled_date_c))
    ).slice(0, 3);
  };

  if (loading) return <Loading type="metrics" />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const metrics = calculateMetrics();
  const todaysJobs = getTodaysJobs();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2 font-display">
          Welcome back! 👋
        </h1>
        <p className="text-slate-600">
          Here's what's happening with your business today, {format(new Date(), "EEEE, MMMM d")}
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Today's Jobs"
          value={metrics.todaysJobs}
          icon="Calendar"
          color="primary"
        />
        <MetricCard
          title="Pending Estimates"
          value={metrics.pendingEstimates}
          icon="FileText"
          color="orange"
        />
        <MetricCard
          title="Recent Payments"
          value={metrics.recentPayments}
          icon="DollarSign"
          color="green"
        />
        <MetricCard
          title="Monthly Earnings"
          value={`$${metrics.monthlyEarnings.toLocaleString()}`}
          icon="TrendingUp"
          color="slate"
trend="+12%"
        />
      </div>

      {/* Revenue Chart Section */}
      <div className="mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Revenue Trend</h3>
              <p className="text-sm text-slate-600">Last 6 months performance</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <ApperIcon name="TrendingUp" size={16} />
              <span>+12% from last period</span>
            </div>
          </div>
          <div className="h-64">
            <RevenueChart jobs={jobs} />
          </div>
        </Card>
      </div>

      {/* Today's Jobs Section */}
      {/* Today's Jobs Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            Today's Schedule
          </h2>
        </div>

        {todaysJobs.length === 0 ? (
          <Empty
            title="No jobs scheduled for today"
            description="Enjoy your free day! Use this time to catch up on estimates or plan upcoming projects."
            icon="Calendar"
          />
        ) : (
          <div className="space-y-6">
            {todaysJobs.map((job) => (
              <JobCard
                key={job.Id}
                job={job}
                onEdit={() => {}}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;