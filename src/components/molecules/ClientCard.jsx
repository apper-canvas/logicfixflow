import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import { formatDistanceToNow } from 'date-fns';

const ClientCard = ({ client, onEdit, onDelete, onViewHistory, onAddCommunication }) => {
  const navigate = useNavigate();
  const [showActions, setShowActions] = useState(false);

  const handleCardClick = (e) => {
    if (e.target.closest('.action-button') || e.target.closest('.dropdown-menu')) {
      return;
    }
    navigate(`/clients/${client.Id}`);
  };

  const getInitials = (name) => {
    return name.split(' ').map(part => part[0]).join('').toUpperCase();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <Card 
      className="p-6 hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={handleCardClick}
    >
      {/* Header with Avatar and Actions */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold">
            {client.avatar ? (
              <img 
                src={client.avatar} 
                alt={client.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              getInitials(client.name)
            )}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 hover:text-primary-600 transition-colors">
              {client.name}
            </h3>
            <p className="text-sm text-slate-500">{client.company}</p>
          </div>
        </div>
        
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowActions(!showActions);
            }}
            className="action-button"
          >
            <ApperIcon name="MoreVertical" size={16} />
          </Button>
          
          {showActions && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowActions(false)}
              />
              <div className="dropdown-menu absolute right-0 top-8 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/clients/${client.Id}`);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <ApperIcon name="Eye" size={14} />
                  <span>View Details</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddCommunication(client);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <ApperIcon name="MessageSquare" size={14} />
                  <span>Add Communication</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(client);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                >
                  <ApperIcon name="Edit" size={14} />
                  <span>Edit Client</span>
                </button>
                <hr className="my-1" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(client);
                    setShowActions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <ApperIcon name="Trash2" size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-3">
        <Badge className={`text-xs ${getStatusColor(client.status)}`}>
          {client.status}
        </Badge>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-slate-600">
          <ApperIcon name="Mail" size={14} className="mr-2" />
          <span className="truncate">{client.email}</span>
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <ApperIcon name="Phone" size={14} className="mr-2" />
          <span>{client.phone}</span>
        </div>
        {client.address && (
          <div className="flex items-center text-sm text-slate-600">
            <ApperIcon name="MapPin" size={14} className="mr-2" />
            <span className="truncate">{client.address}</span>
          </div>
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div>
          <p className="text-xs text-slate-500">Total Jobs</p>
          <p className="font-semibold text-slate-900">{client.totalJobs}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Total Spent</p>
          <p className="font-semibold text-slate-900">{formatCurrency(client.totalSpent)}</p>
        </div>
      </div>

      {/* Last Contact */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Last Contact</span>
          <span>
            {formatDistanceToNow(new Date(client.lastContact), { addSuffix: true })}
          </span>
        </div>
      </div>
    </Card>
  );
};

export default ClientCard;