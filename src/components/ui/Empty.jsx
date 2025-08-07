import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No items found", 
  description = "There are no items to display at the moment.", 
  actionLabel,
  onAction,
  icon = "Package"
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-slate-100 p-6 rounded-full mb-6">
        <ApperIcon name={icon} className="w-12 h-12 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2 font-display">
        {title}
      </h3>
      <p className="text-slate-600 text-center mb-8 max-w-md">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          className="flex items-center gap-2"
        >
          <ApperIcon name="Plus" className="w-4 h-4" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export default Empty;