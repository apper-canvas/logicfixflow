import Empty from "@/components/ui/Empty";

const Services = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-display">
          Service Catalog
        </h1>
        <p className="text-slate-600 mt-1">
          Manage your service offerings and pricing packages
        </p>
      </div>

      <Empty
        title="Service Catalog Coming Soon"
        description="This section will help you create service packages, set pricing, and manage your service offerings. Stay tuned for this feature!"
        icon="Settings"
        actionLabel="View Jobs Instead"
        onAction={() => window.location.href = "/jobs"}
      />
    </div>
  );
};

export default Services;