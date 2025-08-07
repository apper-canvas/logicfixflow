import { format } from 'date-fns';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';

const ReviewCard = ({ review, showJobDetails = true }) => {
  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <ApperIcon
        key={star}
        name="Star"
        size={16}
        className={`${
          star <= rating
            ? 'text-yellow-400 fill-current'
            : 'text-slate-300'
        }`}
      />
    ));
  };

  const getRatingColor = (rating) => {
    if (rating >= 5) return 'bg-green-100 text-green-800';
    if (rating >= 4) return 'bg-blue-100 text-blue-800';
    if (rating >= 3) return 'bg-yellow-100 text-yellow-800';
    if (rating >= 2) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-white hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            {renderStars(review.rating)}
          </div>
          <Badge 
            variant="secondary" 
            className={`text-xs font-medium ${getRatingColor(review.rating)}`}
          >
            {review.rating}/5
          </Badge>
        </div>
        
        <div className="text-xs text-slate-500">
          {format(new Date(review.createdAt), 'MMM d, yyyy')}
        </div>
      </div>

      {showJobDetails && review.jobDescription && (
        <div className="mb-3 p-3 bg-white rounded border border-slate-200">
          <div className="flex items-center space-x-2 mb-1">
            <ApperIcon name="Briefcase" size={14} className="text-slate-400" />
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Job Review
            </span>
          </div>
          <p className="text-sm text-slate-700 line-clamp-2">
            {review.jobDescription}
          </p>
        </div>
      )}

      <div className="mb-3">
        <p className="text-slate-800 leading-relaxed">
          {review.comment}
        </p>
      </div>

      {review.updatedAt !== review.createdAt && (
        <div className="flex items-center space-x-1 text-xs text-slate-500">
          <ApperIcon name="Edit3" size={12} />
          <span>Edited {format(new Date(review.updatedAt), 'MMM d, yyyy')}</span>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;