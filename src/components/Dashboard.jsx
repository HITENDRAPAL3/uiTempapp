import React from 'react';

const Dashboard = ({ totalExpenses, expenseCount, categoryCount, monthlyData }) => {
  const currentMonth = monthlyData && monthlyData.length > 0 ? monthlyData[0] : null;
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  return (
    <div className="dashboard-grid">
      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Total Expenses</div>
            <div className="card-value accent">{formatCurrency(totalExpenses)}</div>
          </div>
          <div className="card-icon cyan">💰</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">This Month</div>
            <div className="card-value">
              {currentMonth ? formatCurrency(currentMonth.totalAmount) : '$0.00'}
            </div>
          </div>
          <div className="card-icon purple">📅</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Transactions</div>
            <div className="card-value">{expenseCount}</div>
          </div>
          <div className="card-icon green">📊</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Categories</div>
            <div className="card-value">{categoryCount}</div>
          </div>
          <div className="card-icon yellow">🏷️</div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
