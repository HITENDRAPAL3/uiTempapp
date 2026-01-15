import React, { useState } from 'react';

const CategoryManager = ({ categories, onAdd, onUpdate, onDelete }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    if (editingCategory) {
      onUpdate(editingCategory.id, formData);
    } else {
      onAdd(formData);
    }
    
    resetForm();
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || '' });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingCategory(null);
    setShowForm(false);
    setError('');
  };

  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">Categories</h2>
        <button 
          className="btn btn-primary btn-sm"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Category name"
              value={formData.name}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                setError('');
              }}
            />
            {error && <span style={{ color: 'var(--accent-danger)', fontSize: '0.8rem' }}>{error}</span>}
          </div>
          <div className="form-group">
            <input
              type="text"
              className="form-input"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div className="form-actions" style={{ justifyContent: 'flex-start' }}>
            <button type="submit" className="btn btn-primary btn-sm">
              {editingCategory ? 'Update' : 'Add'} Category
            </button>
            {editingCategory && (
              <button type="button" className="btn btn-secondary btn-sm" onClick={resetForm}>
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      )}

      <div className="category-list">
        {categories.map((category, index) => (
          <div key={category.id} className="category-item">
            <div className="category-item-info">
              <div className={`summary-item-color cat-${index % 10}`}></div>
              <div>
                <div className="category-item-name">{category.name}</div>
                {category.description && (
                  <div className="category-item-desc">{category.description}</div>
                )}
              </div>
            </div>
            <div className="actions-cell">
              <button 
                className="btn btn-secondary btn-icon"
                onClick={() => handleEdit(category)}
                title="Edit"
              >
                ✏️
              </button>
              <button 
                className="btn btn-danger btn-icon"
                onClick={() => onDelete(category.id)}
                title="Delete"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManager;
