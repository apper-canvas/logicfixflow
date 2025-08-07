import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';

const ServiceCard = ({ service, onEdit, onDelete }) => {
  const formatPrice = (service) => {
    if (service.pricingType === 'hourly') {
      return `$${service.hourlyRate}/hour`;
    } else {
      return `$${service.flatRate} flat rate`;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      'Plumbing': 'bg-blue-100 text-blue-800',
      'Electrical': 'bg-yellow-100 text-yellow-800',
      'Carpentry': 'bg-orange-100 text-orange-800',
      'Painting': 'bg-purple-100 text-purple-800',
      'General Repair': 'bg-green-100 text-green-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900">{service.name}</h3>
            <Badge className={`text-xs ${getCategoryColor(service.category)}`}>
              {service.category}
            </Badge>
          </div>
          <p className="text-slate-600 text-sm mb-2">{service.description}</p>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span className="font-medium text-primary-600">{formatPrice(service)}</span>
            <span className="flex items-center gap-1">
              <ApperIcon name="Clock" size={14} />
              {service.estimatedDuration}h est.
            </span>
          </div>
        </div>
        <div className="flex gap-1 ml-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(service)}
            className="h-8 w-8 p-0"
          >
            <ApperIcon name="Edit2" size={14} />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(service.Id)}
            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <ApperIcon name="Trash2" size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ServiceCard;