import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import JobNotesPhotos from "./JobNotesPhotos";
import { jobService } from "@/services/api/jobService";
import { serviceService } from "@/services/api/serviceService";
import ApperIcon from "@/components/ApperIcon";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
const JobFormModal = ({ isOpen, onClose, job = null }) => {
  const [formData, setFormData] = useState({
    clientName: "",
    phone: "",
    address: "",
    serviceType: "",
    serviceId: "",
    description: "",
    scheduledDate: "",
    price: ""
  });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [servicesLoading, setServicesLoading] = useState(false);

  // Fetch services on component mount
useEffect(() => {
    const fetchServices = async () => {
      setServicesLoading(true);
      try {
        const serviceData = await serviceService.getAll();
        const activeServices = serviceData.filter(service => service.is_active_c);
        setServices(activeServices);
      } catch (error) {
        toast.error("Failed to load services");
        console.error("Error fetching services:", error);
      } finally {
        setServicesLoading(false);
      }
    };

    if (isOpen) {
      fetchServices();
    }
  }, [isOpen]);

  useEffect(() => {
    if (job) {
setFormData({
        clientName: job.clientName || job.Name || "",
        phone: job.phone || "",
        address: job.address || "",
        serviceType: job.serviceType || "",
        serviceId: job.serviceId || "",
        description: job.description || job.services || "",
        scheduledDate: job.scheduledDate ? format(new Date(job.scheduledDate), "yyyy-MM-dd") : "",
        price: job.price || ""
      });
      
      // Find and set selected service if editing
      if (job.serviceId) {
        const service = services.find(s => s.Id === job.serviceId);
        setSelectedService(service || null);
      }
      
      // Show notes & photos tab if editing existing job
      if (job.Id) {
        setActiveTab('details');
      }
    }
  }, [job, services]);

const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'serviceType') {
      // Find the selected service
      const service = services.find(s => s.name === value);
      setSelectedService(service || null);
      
      // Calculate suggested price based on service pricing
      let suggestedPrice = "";
      if (service) {
        if (service.pricingType === 'flat') {
          suggestedPrice = service.flatRate.toString();
        } else if (service.pricingType === 'hourly' && service.estimatedDuration) {
          suggestedPrice = (service.hourlyRate * service.estimatedDuration).toString();
        }
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: value,
        serviceId: service ? service.Id : "",
        price: suggestedPrice || prev.price
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const jobData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        status: job?.status || "Scheduled"
      };

      if (job) {
        await jobService.update(job.Id, jobData);
        toast.success("Job updated successfully!");
      } else {
        await jobService.create(jobData);
        toast.success("Job created successfully!");
      }
      
      onClose();
      window.location.reload(); // Simple refresh to update data
    } catch (error) {
      toast.error("Failed to save job. Please try again.");
    } finally {
      setLoading(false);
    }
  };

// Service types are now dynamic from the services array
  const availableServices = services.map(service => service.name);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              {job ? "Edit Job" : "Create New Job"}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </Button>
          </div>
{/* Tab Navigation */}
          <div className="border-b border-slate-200 mb-6">
            <nav className="flex space-x-8">
              <button
                type="button"
                onClick={() => handleTabChange('details')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === 'details'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <ApperIcon name="FileText" size={16} />
                  Job Details
                </div>
              </button>
              {job && job.Id && (
                <button
                  type="button"
                  onClick={() => handleTabChange('notes-photos')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                    activeTab === 'notes-photos'
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <ApperIcon name="Camera" size={16} />
                    Notes & Photos
                  </div>
                </button>
              )}
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Client Name *
                  </label>
                  <Input
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleChange}
                    placeholder="Enter client name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Address *
                </label>
                <Input
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main St, City, State 12345"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
<div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Service Type *
                  </label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    required
                    disabled={servicesLoading}
                    className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-colors duration-200 disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">
                      {servicesLoading ? "Loading services..." : "Select service type"}
                    </option>
                    {availableServices.map(serviceName => (
                      <option key={serviceName} value={serviceName}>{serviceName}</option>
                    ))}
                  </select>
                  {selectedService && (
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="text-sm text-slate-600 mb-1">
                        <strong>Service Details:</strong>
                      </div>
                      <div className="text-sm text-slate-700 mb-1">
                        {selectedService.description}
                      </div>
                      <div className="text-sm text-slate-600">
                        <strong>Category:</strong> {selectedService.category} | 
                        <strong> Estimated Duration:</strong> {selectedService.estimatedDuration}h | 
                        <strong> Pricing:</strong> {selectedService.pricingType === 'flat' 
                          ? `$${selectedService.flatRate} flat rate`
                          : `$${selectedService.hourlyRate}/hour`
                        }
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Scheduled Date *
                  </label>
                  <Input
                    name="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Estimated Price
                  {selectedService && (
                    <span className="text-sm text-slate-500 ml-1">
                      (Suggested: ${selectedService.pricingType === 'flat' 
                        ? selectedService.flatRate 
                        : selectedService.hourlyRate * (selectedService.estimatedDuration || 1)
                      })
                    </span>
                  )}
                </label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder={selectedService 
                    ? (selectedService.pricingType === 'flat' 
                        ? selectedService.flatRate.toString()
                        : (selectedService.hourlyRate * (selectedService.estimatedDuration || 1)).toString()
                      )
                    : "0.00"
                  }
                />
                <div className="mt-1 text-xs text-slate-500">
                  Leave empty to use suggested pricing, or enter a custom amount to override.
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the work to be done..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border-2 border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-colors duration-200 resize-none"
                />
              </div>
<div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                  ) : (
                    <ApperIcon name={job ? "Save" : "Plus"} className="w-4 h-4" />
                  )}
                  {job ? "Update Job" : "Create Job"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}

          {/* Notes & Photos Tab */}
          {activeTab === 'notes-photos' && job && job.Id && (
            <JobNotesPhotos jobId={job.Id} onClose={onClose} />
          )}
        </div>
      </Card>
    </div>
  );
};

export default JobFormModal;