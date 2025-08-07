import Button from "@/components/atoms/Button";

const FilterBar = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { key: "all", label: "All Jobs" },
    { key: "Scheduled", label: "Scheduled" },
    { key: "In Progress", label: "In Progress" },
    { key: "Completed", label: "Completed" },
    { key: "Paid", label: "Paid" }
  ];

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <Button
          key={filter.key}
          variant={activeFilter === filter.key ? "primary" : "secondary"}
          size="sm"
          onClick={() => onFilterChange(filter.key)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
};

export default FilterBar;