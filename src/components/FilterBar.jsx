import React from 'react';

const FilterBar = ({ filters, setFilters, categories, onClearFilters }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Category</label>
        <select
          name="categoryId"
          value={filters.categoryId || ''}
          onChange={handleChange}
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">From Date</label>
        <input
          type="date"
          name="startDate"
          value={filters.startDate || ''}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group">
        <label className="filter-label">To Date</label>
        <input
          type="date"
          name="endDate"
          value={filters.endDate || ''}
          onChange={handleChange}
        />
      </div>

      <div className="filter-group" style={{ justifyContent: 'flex-end', display: 'flex', alignItems: 'flex-end' }}>
        <button className="btn btn-secondary btn-sm" onClick={onClearFilters}>
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
