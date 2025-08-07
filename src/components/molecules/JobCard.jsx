import { format } from "date-fns";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const JobCard = ({ job, onEdit, onStatusChange }) => {
  const getStatusBadgeVariant = (status) => {
    const variants = {
      "Scheduled": "scheduled",
      "In Progress": "progress",
      "Completed": "completed",
      "Paid": "paid"
    };
    return variants[status] || "default";
  };

  const getStatusActions = (status) => {
    switch (status) {
      case "Scheduled":
        return [
          { label: "Start Job", action: () => onStatusChange(job.Id, "In Progress"), icon: "Play", variant: "primary" }
        ];
      case "In Progress":
        return [
          { label: "Mark Complete", action: () => onStatusChange(job.Id, "Completed"), icon: "CheckCircle", variant: "accent" }
        ];
      case "Completed":
        return [
          { label: "Record Payment", action: () => onStatusChange(job.Id, "Paid"), icon: "DollarSign", variant: "primary" }
        ];
      default:
        return [];
    }
  };

  const actions = getStatusActions(job.status);

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-slate-900 font-display">
              {job.clientName}
            </h3>
            <Badge variant={getStatusBadgeVariant(job.status)}>
              {job.status}
            </Badge>
          </div>
          <p className="text-slate-600 font-medium">{job.serviceType}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(job)}
          className="text-slate-500 hover:text-slate-700"
        >
          <ApperIcon name="Edit2" className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-slate-600 text-sm">
          <ApperIcon name="MapPin" className="w-4 h-4 mr-2 text-slate-400" />
          {job.address}
        </div>
        <div className="flex items-center text-slate-600 text-sm">
          <ApperIcon name="Phone" className="w-4 h-4 mr-2 text-slate-400" />
          {job.phone}
        </div>
        <div className="flex items-center text-slate-600 text-sm">
          <ApperIcon name="Calendar" className="w-4 h-4 mr-2 text-slate-400" />
          {format(new Date(job.scheduledDate), "MMM d, yyyy")}
        </div>
      </div>

      {job.description && (
        <div className="mb-4">
          <p className="text-slate-700 text-sm bg-slate-50 p-3 rounded-lg">
            {job.description}
          </p>
        </div>
      )}

      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold text-slate-900 font-display">
          ${job.price?.toLocaleString() || "TBD"}
        </div>
        <div className="flex gap-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              size="sm"
              onClick={action.action}
              className="flex items-center gap-2"
            >
              <ApperIcon name={action.icon} className="w-4 h-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default JobCard;