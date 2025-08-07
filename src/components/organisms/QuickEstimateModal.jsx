import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import ApperIcon from '@/components/ApperIcon';
import { getServicesByCategory } from '@/services/api/serviceService';
import { create as createJob, printEstimate, emailEstimate } from '@/services/api/jobService';

const QuickEstimateModal = ({ isOpen, onClose }) => {
  const [servicesByCategory, setServicesByCategory] = useState({});
  const [selectedServices, setSelectedServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [converting, setConverting] = useState(false);
const [printing, setPrinting] = useState(false);
  const [emailing, setEmailing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadServices();
    }
  }, [isOpen]);

  const loadServices = async () => {
    try {
      setLoading(true);
      const services = await getServicesByCategory();
      setServicesByCategory(services);
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceToggle = (service) => {
    setSelectedServices(prev => {
      const existing = prev.find(s => s.Id === service.Id);
      if (existing) {
        return prev.filter(s => s.Id !== service.Id);
      } else {
        return [...prev, { ...service, quantity: 1 }];
      }
    });
  };

  const handleQuantityChange = (serviceId, quantity) => {
    const numQuantity = Math.max(1, parseInt(quantity) || 1);
    setSelectedServices(prev =>
      prev.map(s => s.Id === serviceId ? { ...s, quantity: numQuantity } : s)
    );
  };

  const calculateEstimate = () => {
    return selectedServices.reduce((total, service) => {
      const baseRate = service.pricingType === 'hourly' 
        ? service.hourlyRate * service.estimatedDuration 
        : service.flatRate;
      return total + (baseRate * service.quantity);
    }, 0);
  };

  const handleConvertToJob = async () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    try {
      setConverting(true);
      
      const estimate = calculateEstimate();
      const serviceNames = selectedServices.map(s => 
        `${s.name} (${s.quantity}x)`
      ).join(', ');

      const jobData = {
        title: `Estimate: ${serviceNames}`,
        description: `Quick estimate for selected services:\n${selectedServices.map(s => 
          `• ${s.name} - Qty: ${s.quantity} - ${s.pricingType === 'hourly' 
            ? `$${s.hourlyRate}/hr × ${s.estimatedDuration}hrs` 
            : `$${s.flatRate} flat rate`} = $${(s.pricingType === 'hourly' 
              ? s.hourlyRate * s.estimatedDuration 
              : s.flatRate) * s.quantity}`
        ).join('\n')}\n\nEstimated Total: $${estimate.toFixed(2)}`,
        clientId: null,
        estimatedCost: estimate,
        scheduledDate: new Date().toISOString().split('T')[0],
        estimatedDuration: selectedServices.reduce((total, s) => 
          total + (s.estimatedDuration * s.quantity), 0
        ),
        priority: 'Medium',
        status: 'Scheduled',
        services: selectedServices.map(s => ({
          serviceId: s.Id,
          serviceName: s.name,
          quantity: s.quantity,
          rate: s.pricingType === 'hourly' ? s.hourlyRate : s.flatRate,
          pricingType: s.pricingType,
          estimatedDuration: s.estimatedDuration
        }))
      };

      await createJob(jobData);
      toast.success('Job created successfully from estimate!');
      setSelectedServices([]);
      onClose();
    } catch (error) {
      toast.error('Failed to create job from estimate');
} finally {
      setConverting(false);
    }
  };

  const handlePrintEstimate = async () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    try {
      setPrinting(true);
      const estimate = calculateEstimate();
      const totalDuration = selectedServices.reduce((total, s) => 
        total + (s.estimatedDuration * s.quantity), 0
      );

      await printEstimate({
        selectedServices,
        estimate,
        totalDuration
      });
      
      toast.success('Estimate sent to printer');
    } catch (error) {
      toast.error('Failed to print estimate');
    } finally {
      setPrinting(false);
    }
  };

  const handleEmailEstimate = async () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    try {
      setEmailing(true);
      const estimate = calculateEstimate();
      const totalDuration = selectedServices.reduce((total, s) => 
        total + (s.estimatedDuration * s.quantity), 0
      );

      await emailEstimate({
        selectedServices,
        estimate,
        totalDuration
      });
      
      toast.success('Email client opened with estimate');
    } catch (error) {
      toast.error('Failed to open email client');
    } finally {
      setEmailing(false);
    }
  };

  if (!isOpen) return null;

  const estimate = calculateEstimate();
  const totalDuration = selectedServices.reduce((total, s) => 
    total + (s.estimatedDuration * s.quantity), 0
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Quick Estimate Generator</h2>
          <Button
            variant="ghost"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ApperIcon name="X" size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Select Services</h3>
                
                {Object.entries(servicesByCategory).map(([category, services]) => (
                  services.length > 0 && (
                    <div key={category} className="space-y-3">
                      <h4 className="font-medium text-gray-700 border-b border-gray-200 pb-2">
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {services.map(service => {
                          const isSelected = selectedServices.some(s => s.Id === service.Id);
                          const selectedService = selectedServices.find(s => s.Id === service.Id);
                          
                          return (
                            <div
                              key={service.Id}
                              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                isSelected 
                                  ? 'border-primary-500 bg-primary-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                              onClick={() => handleServiceToggle(service)}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h5 className="font-medium text-gray-900">{service.name}</h5>
                                <div className="flex items-center">
                                  {service.pricingType === 'hourly' ? (
                                    <span className="text-sm text-gray-600">
                                      ${service.hourlyRate}/hr
                                    </span>
                                  ) : (
                                    <span className="text-sm text-gray-600">
                                      ${service.flatRate}
                                    </span>
                                  )}
                                  <div className={`ml-2 w-4 h-4 rounded border-2 ${
                                    isSelected 
                                      ? 'bg-primary-500 border-primary-500' 
                                      : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <ApperIcon name="Check" size={12} className="text-white" />
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                              <p className="text-xs text-gray-500">
                                Est. {service.estimatedDuration}hrs
                              </p>
                              
                              {isSelected && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <div className="flex items-center space-x-2">
                                    <label className="text-sm font-medium text-gray-700">Qty:</label>
                                    <Input
                                      type="number"
                                      min="1"
                                      value={selectedService?.quantity || 1}
                                      onChange={(e) => handleQuantityChange(service.Id, e.target.value)}
                                      className="w-20 text-center"
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )
                ))}
              </div>

              <div className="lg:col-span-1">
                <Card className="p-6 sticky top-0">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Estimate Summary</h3>
                  
                  {selectedServices.length === 0 ? (
                    <p className="text-gray-500 text-sm">No services selected</p>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        {selectedServices.map(service => {
                          const serviceTotal = service.pricingType === 'hourly'
                            ? service.hourlyRate * service.estimatedDuration * service.quantity
                            : service.flatRate * service.quantity;
                          
                          return (
                            <div key={service.Id} className="flex justify-between text-sm">
                              <span className="text-gray-600">
                                {service.name} ({service.quantity}x)
                              </span>
                              <span className="font-medium">${serviceTotal.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4 space-y-2">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Labor Cost:</span>
                          <span>${estimate.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Est. Duration:</span>
                          <span>{totalDuration.toFixed(1)}hrs</span>
                        </div>
                        <div className="flex justify-between text-lg font-semibold text-gray-900 border-t border-gray-200 pt-2">
                          <span>Suggested Total:</span>
                          <span>${(estimate * 1.15).toFixed(2)}</span>
                        </div>
                        <p className="text-xs text-gray-500">
                          *Includes 15% markup for materials/overhead
                        </p>
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''} selected
          </div>
          
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
<div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handlePrintEstimate}
                disabled={selectedServices.length === 0 || printing}
                variant="outline"
                className="flex-1 sm:flex-initial"
              >
                {printing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Printing...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Printer" size={16} className="mr-2" />
                    Print
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleEmailEstimate}
                disabled={selectedServices.length === 0 || emailing}
                variant="outline"
                className="flex-1 sm:flex-initial"
              >
                {emailing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Opening...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Mail" size={16} className="mr-2" />
                    Email
                  </>
                )}
              </Button>
            </div>
            
            <Button
              onClick={handleConvertToJob}
              disabled={selectedServices.length === 0 || converting}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {converting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Converting...
                </>
              ) : (
                <>
                  <ApperIcon name="Plus" size={16} className="mr-2" />
                  Convert to Job
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickEstimateModal;