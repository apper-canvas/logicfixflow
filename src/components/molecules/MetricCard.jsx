import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";

const MetricCard = ({ title, value, icon, trend, color = "primary" }) => {
  const colorClasses = {
    primary: "bg-gradient-to-br from-primary-500 to-primary-600 text-white",
    orange: "bg-gradient-to-br from-orange-500 to-orange-600 text-white",
    green: "bg-gradient-to-br from-green-500 to-green-600 text-white",
    slate: "bg-gradient-to-br from-slate-600 to-slate-700 text-white"
  };

  return (
    <Card className="p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]} shadow-lg`}>
          <ApperIcon name={icon} className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center text-green-600 text-sm font-medium">
            <ApperIcon name="TrendingUp" className="w-4 h-4 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <div>
        <div className="text-3xl font-bold text-slate-900 mb-1 font-display">
          {value}
        </div>
        <div className="text-slate-600 text-sm font-medium">
          {title}
        </div>
      </div>
      <div className={`absolute -bottom-4 -right-4 w-24 h-24 ${colorClasses[color]} opacity-10 rounded-full`} />
    </Card>
  );
};

export default MetricCard;