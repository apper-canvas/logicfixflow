import Empty from "@/components/ui/Empty";

const Calendar = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-display">
          Schedule Calendar
        </h1>
        <p className="text-slate-600 mt-1">
          View and manage your job schedule in calendar format
        </p>
      </div>

      <Empty
        title="Calendar View Coming Soon"
        description="This section will provide a visual calendar view of your scheduled jobs, making it easy to plan your workweek. Stay tuned for this feature!"
        icon="Calendar"
        actionLabel="View Jobs Instead"
        onAction={() => window.location.href = "/jobs"}
      />
    </div>
  );
};

export default Calendar;