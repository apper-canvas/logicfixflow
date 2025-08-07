import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Input from '@/components/atoms/Input';
import ApperIcon from '@/components/ApperIcon';
import ServiceCard from '@/components/molecules/ServiceCard';
import ServiceFormModal from '@/components/organisms/ServiceFormModal';
import QuickEstimateModal from '@/components/organisms/QuickEstimateModal';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import { 
  getServicesByCategory, 
  createService, 
  updateService, 
  deleteService, 
  searchServices 
} from '@/services/api/serviceService';

const Services = () => {
  const [servicesByCategory, setServicesByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredServices, setFilteredServices] = useState([]);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
const [editingService, setEditingService] = useState(null);
const [selectedCategory, setSelectedCategory] = useState('all');
const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false);

useEffect(() => {
loadServices();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const results = searchServices(searchQuery);
      setFilteredServices(results);
    } else {
      setFilteredServices([]);
    }
  }, [searchQuery]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = getServicesByCategory();
      setServicesByCategory(data);
    } catch (err) {
      setError(err.message);
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    setEditingService(null);
    setIsFormModalOpen(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setIsFormModalOpen(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Are you sure you want to delete this service?')) {
      return;
    }

    try {
      await deleteService(serviceId);
      toast.success('Service deleted successfully');
      loadServices();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmitService = async (serviceData) => {
    try {
      if (editingService) {
        await updateService(editingService.Id, serviceData);
        toast.success('Service updated successfully');
      } else {
        await createService(serviceData);
        toast.success('Service added successfully');
      }
      setIsFormModalOpen(false);
      loadServices();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getAllServices = () => {
    return Object.values(servicesByCategory).flat();
  };

  const getFilteredServicesByCategory = () => {
    if (searchQuery) {
      const filtered = {};
      Object.entries(servicesByCategory).forEach(([category, services]) => {
        const categoryFiltered = services.filter(service =>
          filteredServices.some(fs => fs.Id === service.Id)
        );
        if (categoryFiltered.length > 0) {
          filtered[category] = categoryFiltered;
        }
      });
      return filtered;
    }

    if (selectedCategory === 'all') {
      return servicesByCategory;
    }

    return { [selectedCategory]: servicesByCategory[selectedCategory] || [] };
  };

  const getTotalServices = () => {
    return getAllServices().length;
  };

  const categories = Object.keys(servicesByCategory);
  const displayServices = getFilteredServicesByCategory();

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadServices} />;

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-display">
              Service Catalog
            </h1>
            <p className="text-slate-600 mt-1">
              Manage your service offerings and pricing packages ({getTotalServices()} services)
            </p>
          </div>
<Button 
  onClick={() => setIsEstimateModalOpen(true)}
  variant="outline"
  className="shrink-0 mr-3"
>
  <ApperIcon name="Calculator" size={16} className="mr-2" />
  Quick Estimate
</Button>
<Button onClick={handleAddService} className="shrink-0">
  <ApperIcon name="Plus" size={16} className="mr-2" />
  Add Skill
</Button>
</div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <ApperIcon 
              name="Search" 
              size={20} 
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
            />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory('all')}
          >
            All Categories
          </Button>
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
            >
              {category} ({servicesByCategory[category]?.length || 0})
            </Button>
          ))}
        </div>
      </div>

      {searchQuery && (
        <div className="mb-6">
          <p className="text-sm text-slate-600">
            Found {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </p>
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(displayServices).map(([category, services]) => (
          <div key={category}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold text-slate-900 font-display">
                {category}
              </h2>
              <span className="bg-slate-100 text-slate-600 px-2 py-1 rounded-full text-sm">
                {services.length} service{services.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            {services.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {services.map(service => (
                  <ServiceCard
                    key={service.Id}
                    service={service}
                    onEdit={handleEditService}
                    onDelete={handleDeleteService}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <ApperIcon name="Package" size={48} className="mx-auto text-slate-400 mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No services in {category}</h3>
                <p className="text-slate-600 mb-4">Add your first service to this category to get started.</p>
                <Button onClick={handleAddService} size="sm">
                  <ApperIcon name="Plus" size={14} className="mr-2" />
                  Add Service
                </Button>
              </Card>
            )}
          </div>
        ))}

        {Object.keys(displayServices).length === 0 && (
          <Card className="p-12 text-center">
            <ApperIcon name="Search" size={64} className="mx-auto text-slate-400 mb-4" />
            <h3 className="text-xl font-medium text-slate-900 mb-2">No services found</h3>
            <p className="text-slate-600 mb-6">
              {searchQuery ? 
                `No services match "${searchQuery}". Try a different search term.` :
                'Start building your service catalog by adding your first service.'
              }
            </p>
            {!searchQuery && (
              <Button onClick={handleAddService}>
                <ApperIcon name="Plus" size={16} className="mr-2" />
                Add Your First Service
              </Button>
            )}
          </Card>
        )}
      </div>
<ServiceFormModal
  isOpen={isFormModalOpen}
  onClose={() => setIsFormModalOpen(false)}
  onSubmit={handleSubmitService}
  service={editingService}
/>

<QuickEstimateModal
  isOpen={isEstimateModalOpen}
  onClose={() => setIsEstimateModalOpen(false)}
/>
</div>
);
};

export default Services;