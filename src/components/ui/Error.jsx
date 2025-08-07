import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ message = "Something went wrong", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="bg-red-100 p-4 rounded-full mb-4">
        <ApperIcon name="AlertTriangle" className="w-8 h-8 text-red-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-2">Oops! Something went wrong</h3>
      <p className="text-slate-600 text-center mb-6 max-w-md">
        {message}
      </p>
      {onRetry && (
        <Button
          onClick={onRetry}
          variant="primary"
          className="flex items-center gap-2"
        >
          <ApperIcon name="RefreshCw" className="w-4 h-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default Error;