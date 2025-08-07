import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import ClientFormModal from '@/components/organisms/ClientFormModal';
import CommunicationModal from '@/components/organisms/CommunicationModal';
import { 
  getClientById, 
  updateClient, 
  deleteClient,
  getCommunicationsByClientId,
  addCommunication
} from '@/services/api/clientService';
import { formatDistanceToNow, format } from 'date-fns';

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [client, setClient] = useState(null);
  const [communications, setCommunications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCommunicationModal, setShowCommunicationModal] = useState(false);

  useEffect(() => {
    loadClientData();
  }, [id]);

  const loadClientData = async () => {
    try {
      setIsLoading(true);
      
      const clientData = getClientById(id);
      if (!clientData) {
        setError('Client not found');
        return;
      }
      
      const commData = getCommunicationsByClientId(id);
      
      setClient(clientData);
      setCommunications(commData);
      setError(null);
    } catch (err) {
      setError('Failed to load client data');
      console.error('Error loading client:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClient = async (clientData) => {
    updateClient(client.Id, clientData);
    await loadClientData();
  };

  const handleDeleteClient = async () => {
    if (window.confirm(`Are you sure you want to delete ${client.name}? This action cannot be undone.`)) {
      const success = deleteClient(client.Id);
      if (success) {
        navigate('/clients');
      }
    }
  };

  const handleAddCommunication = async (communicationData) => {
    addCommunication(communicationData);
    await loadClientData();
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

  const getCommunicationIcon = (type) => {
    switch (type) {
      case 'email': return 'Mail';
      case 'phone': return 'Phone';
      case 'meeting': return 'Calendar';
      case 'text': return 'MessageSquare';
      default: return 'MessageCircle';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !client) {
    return (
      <Error 
        message={error || 'Client not found'} 
        onRetry={loadClientData}
        actionLabel="Back to Clients"
        onAction={() => navigate('/clients')}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/clients')}
          >
            <ApperIcon name="ArrowLeft" size={16} className="mr-2" />
            Back to Clients
          </Button>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowCommunicationModal(true)}
          >
            <ApperIcon name="MessageSquare" size={16} className="mr-2" />
            Log Communication
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowEditModal(true)}
          >
            <ApperIcon name="Edit" size={16} className="mr-2" />
            Edit Client
          </Button>
          <Button
            variant="outline"
            onClick={handleDeleteClient}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <ApperIcon name="Trash2" size={16} className="mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Client Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Info */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold text-xl">
                {client.avatar ? (
                  <img 
                    src={client.avatar} 
                    alt={client.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  getInitials(client.name)
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h1 className="text-2xl font-bold text-slate-900 font-display">
                    {client.name}
                  </h1>
                  <Badge className={`text-xs ${getStatusColor(client.status)}`}>
                    {client.status}
                  </Badge>
                </div>
                <p className="text-slate-600 font-medium">{client.company}</p>
                <p className="text-sm text-slate-500 mt-1">
                  Client since {format(new Date(client.clientSince), 'MMMM yyyy')}
                </p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Contact Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <ApperIcon name="Mail" size={14} className="text-slate-400 mr-3" />
                    <span className="text-slate-600">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center text-sm">
                      <ApperIcon name="Phone" size={14} className="text-slate-400 mr-3" />
                      <span className="text-slate-600">{client.phone}</span>
                    </div>
                  )}
                  {client.address && (
                    <div className="flex items-start text-sm">
                      <ApperIcon name="MapPin" size={14} className="text-slate-400 mr-3 mt-0.5" />
                      <span className="text-slate-600">{client.address}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm">
                    <ApperIcon name="MessageCircle" size={14} className="text-slate-400 mr-3" />
                    <span className="text-slate-600 capitalize">
                      Prefers {client.preferredContact} communication
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Account Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Jobs:</span>
                    <span className="font-medium">{client.totalJobs}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Total Spent:</span>
                    <span className="font-medium">{formatCurrency(client.totalSpent)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Last Contact:</span>
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(client.lastContact), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {client.notes && (
              <div>
                <h3 className="font-semibold text-slate-900 mb-2">Notes</h3>
                <p className="text-slate-600 text-sm bg-slate-50 rounded-lg p-3">
                  {client.notes}
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="space-y-4">
          <Card className="p-4">
            <div className="text-center">
              <ApperIcon name="Calendar" size={24} className="text-primary-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Client Since</p>
              <p className="font-semibold text-slate-900">
                {format(new Date(client.clientSince), 'MMM d, yyyy')}
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <ApperIcon name="Clock" size={24} className="text-orange-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Last Contact</p>
              <p className="font-semibold text-slate-900">
                {formatDistanceToNow(new Date(client.lastContact), { addSuffix: true })}
              </p>
            </div>
          </Card>

          <Card className="p-4">
            <div className="text-center">
              <ApperIcon name="TrendingUp" size={24} className="text-green-500 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Avg per Job</p>
              <p className="font-semibold text-slate-900">
                {client.totalJobs > 0 
                  ? formatCurrency(client.totalSpent / client.totalJobs)
                  : formatCurrency(0)
                }
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Communication History */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900 font-display">
            Communication History
          </h2>
          <Button
            size="sm"
            onClick={() => setShowCommunicationModal(true)}
          >
            <ApperIcon name="Plus" size={14} className="mr-2" />
            Add Communication
          </Button>
        </div>

        {communications.length === 0 ? (
          <Empty
            title="No Communications Yet"
            description="Start tracking your communication history with this client"
            icon="MessageSquare"
            actionLabel="Add First Communication"
            onAction={() => setShowCommunicationModal(true)}
          />
        ) : (
          <div className="space-y-4">
            {communications.map((comm) => (
              <div
                key={comm.Id}
                className="flex space-x-4 p-4 bg-slate-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    comm.direction === 'inbound' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-blue-100 text-blue-600'
                  }`}>
                    <ApperIcon 
                      name={getCommunicationIcon(comm.type)} 
                      size={14} 
                    />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-slate-900">{comm.subject}</h4>
                    <span className="text-xs text-slate-500">
                      {format(new Date(comm.date), 'MMM d, yyyy h:mm a')}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-4 mb-2 text-sm text-slate-600">
                    <span className="capitalize">{comm.type}</span>
                    <span className="capitalize">{comm.direction}</span>
                    {comm.contactPerson && (
                      <span>by {comm.contactPerson}</span>
                    )}
                  </div>
                  
                  {comm.message && (
                    <p className="text-sm text-slate-600">{comm.message}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Modals */}
      <ClientFormModal
        client={client}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleUpdateClient}
      />

      <CommunicationModal
        client={client}
        isOpen={showCommunicationModal}
        onClose={() => setShowCommunicationModal(false)}
        onSubmit={handleAddCommunication}
      />
    </div>
  );
};

export default ClientDetail;