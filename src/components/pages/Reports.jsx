import Empty from "@/components/ui/Empty";

const Reports = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-display">
          Business Reports
        </h1>
        <p className="text-slate-600 mt-1">
          Track your financial performance and business analytics
        </p>
      </div>

      <Empty
        title="Reporting & Analytics Coming Soon"
        description="This section will provide detailed financial reports, earning trends, and business insights to help you grow your handyman business. Stay tuned for this feature!"
        icon="BarChart3"
        actionLabel="View Dashboard Instead"
        onAction={() => window.location.href = "/"}
      />
    </div>
  );
};

export default Reports;