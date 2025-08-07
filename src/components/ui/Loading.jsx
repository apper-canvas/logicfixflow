import Card from "@/components/atoms/Card";

const Loading = ({ type = "default" }) => {
  if (type === "metrics") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-slate-200 rounded-xl animate-pulse" />
              <div className="w-16 h-4 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="w-20 h-8 bg-slate-200 rounded animate-pulse mb-2" />
            <div className="w-24 h-4 bg-slate-200 rounded animate-pulse" />
          </Card>
        ))}
      </div>
    );
  }

  if (type === "jobs") {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-32 h-6 bg-slate-200 rounded animate-pulse" />
                <div className="w-20 h-6 bg-slate-200 rounded-full animate-pulse" />
              </div>
              <div className="w-6 h-6 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="w-40 h-4 bg-slate-200 rounded animate-pulse mb-4" />
            <div className="space-y-2 mb-4">
              <div className="w-56 h-4 bg-slate-200 rounded animate-pulse" />
              <div className="w-44 h-4 bg-slate-200 rounded animate-pulse" />
              <div className="w-36 h-4 bg-slate-200 rounded animate-pulse" />
            </div>
            <div className="flex justify-between items-center">
              <div className="w-20 h-8 bg-slate-200 rounded animate-pulse" />
              <div className="w-28 h-8 bg-slate-200 rounded animate-pulse" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <span className="text-slate-600 font-medium">Loading...</span>
      </div>
    </div>
  );
};

export default Loading;