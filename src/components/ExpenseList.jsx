import React from 'react';

const ExpenseList = ({ expenses, onEdit, onDelete, loading }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📭</div>
        <div className="empty-state-text">No expenses found. Add your first expense!</div>
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Category</th>
            <th>Date</th>
            <th>Amount</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map(expense => (
            <tr key={expense.id}>
              <td>{expense.description}</td>
              <td>
                <span className="category-badge">{expense.categoryName}</span>
              </td>
              <td>{formatDate(expense.date)}</td>
              <td className="amount-cell">-{formatCurrency(expense.amount)}</td>
              <td>
                <div className="actions-cell">
                  <button 
                    className="btn btn-secondary btn-icon" 
                    onClick={() => onEdit(expense)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button 
                    className="btn btn-danger btn-icon" 
                    onClick={() => onDelete(expense.id)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;
