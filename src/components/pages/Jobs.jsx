import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import FilterBar from "@/components/molecules/FilterBar";
import JobCard from "@/components/molecules/JobCard";
import JobFormModal from "@/components/organisms/JobFormModal";
import JobNotesPhotos from "@/components/organisms/JobNotesPhotos";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { jobService } from "@/services/api/jobService";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [isNotesPhotosOpen, setIsNotesPhotosOpen] = useState(false);
  const [selectedJobForNotes, setSelectedJobForNotes] = useState(null);

  const loadJobs = async () => {
    try {
      setError("");
      setLoading(true);
      const jobData = await jobService.getAll();
      setJobs(jobData);
      setFilteredJobs(jobData);
    } catch (err) {
      setError("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    let filtered = jobs;

    // Apply status filter
    if (activeFilter !== "all") {
      filtered = filtered.filter(job => job.status === activeFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(job =>
        job.clientName.toLowerCase().includes(query) ||
        job.serviceType.toLowerCase().includes(query) ||
        job.address.toLowerCase().includes(query) ||
        job.phone.includes(query)
      );
    }

    setFilteredJobs(filtered);
  }, [jobs, activeFilter, searchQuery]);

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const updateData = { status: newStatus };
      
      // Add timestamps for status changes
      if (newStatus === "Completed") {
        updateData.completedAt = new Date().toISOString();
      } else if (newStatus === "Paid") {
        updateData.paidAt = new Date().toISOString();
      }

      await jobService.update(jobId, updateData);
      toast.success(`Job status updated to ${newStatus}`);
      await loadJobs();
    } catch (err) {
      toast.error("Failed to update job status");
    }
  };

  const handleEditJob = (job) => {
    setEditingJob(job);
    setIsJobFormOpen(true);
  };

  const handleCloseModal = () => {
    setIsJobFormOpen(false);
    setEditingJob(null);
    loadJobs(); // Refresh data when modal closes
  };

const handleCreateJob = () => {
    setEditingJob(null);
    setIsJobFormOpen(true);
  };

  const handleViewNotesPhotos = (job) => {
    setSelectedJobForNotes(job);
    setIsNotesPhotosOpen(true);
  };

  const handleCloseNotesPhotos = () => {
    setIsNotesPhotosOpen(false);
    setSelectedJobForNotes(null);
    loadJobs(); // Refresh data when closing notes/photos
  };

  if (loading) return <Loading type="jobs" />;
  if (error) return <Error message={error} onRetry={loadJobs} />;

  return (
    <div>
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 font-display">
              Job Management
            </h1>
            <p className="text-slate-600 mt-1">
              Track and manage all your service jobs
            </p>
          </div>
          <Button
            variant="accent"
            onClick={handleCreateJob}
            className="flex items-center gap-2"
          >
            <ApperIcon name="Plus" className="w-4 h-4" />
            Create New Job
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search jobs by client, service, or address..."
            />
          </div>
          <FilterBar
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>
      </div>

      {filteredJobs.length === 0 ? (
        searchQuery.trim() || activeFilter !== "all" ? (
          <Empty
            title="No jobs found"
            description={`No jobs match your current search criteria. Try adjusting your filters or search terms.`}
            icon="Search"
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchQuery("");
              setActiveFilter("all");
            }}
          />
        ) : (
          <Empty
            title="No jobs yet"
            description="Start by creating your first job to begin tracking your handyman services."
            icon="Briefcase"
            actionLabel="Create First Job"
            onAction={handleCreateJob}
          />
        )
      ) : (
        <div className="space-y-6">
          <div className="text-sm text-slate-600 font-medium">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </div>
          
{filteredJobs.map((job) => (
            <JobCard
              key={job.Id}
              job={job}
              onEdit={handleEditJob}
              onStatusChange={handleStatusChange}
              onViewNotesPhotos={handleViewNotesPhotos}
            />
          ))}
        </div>
      )}

{isJobFormOpen && (
        <JobFormModal
          isOpen={isJobFormOpen}
          onClose={handleCloseModal}
          job={editingJob}
        />
      )}

      {isNotesPhotosOpen && selectedJobForNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Notes & Photos
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {selectedJobForNotes.clientName} - {selectedJobForNotes.serviceType}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleCloseNotesPhotos}
                  className="p-2"
                >
                  <ApperIcon name="X" size={20} />
                </Button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <JobNotesPhotos
                jobId={selectedJobForNotes.Id}
                onClose={handleCloseNotesPhotos}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;