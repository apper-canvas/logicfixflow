import Empty from "@/components/ui/Empty";

const Clients = () => {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-display">
          Client Management
        </h1>
        <p className="text-slate-600 mt-1">
          Manage your client contacts and service history
        </p>
      </div>

      <Empty
        title="Client Management Coming Soon"
        description="This section will help you manage client contacts, view service history, and track customer relationships. Stay tuned for this feature!"
        icon="Users"
        actionLabel="View Jobs Instead"
        onAction={() => window.location.href = "/jobs"}
      />
    </div>
  );
};

export default Clients;