import React from 'react';

const SummaryChart = ({ categorySummary, monthlySummary }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatShortCurrency = (amount) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    }
    if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
    return `₹${Math.round(amount)}`;
  };

  const maxMonthlyAmount = monthlySummary && monthlySummary.length > 0
    ? Math.max(...monthlySummary.map(m => m.totalAmount))
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Monthly Trend */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">Monthly Trend</h2>
        </div>
        
        {monthlySummary && monthlySummary.length > 0 ? (
          <div className="chart-bars">
            {[...monthlySummary].reverse().slice(-6).map((month, index) => {
              const heightPercent = maxMonthlyAmount > 0 
                ? (month.totalAmount / maxMonthlyAmount) * 100 
                : 0;
              return (
                <div key={index} className="chart-bar-container">
                  <div className="chart-bar-wrapper">
                    <div className="chart-bar-value">{formatShortCurrency(month.totalAmount)}</div>
                    <div 
                      className="chart-bar" 
                      style={{ height: `${Math.max(heightPercent, 5)}%` }}
                      title={`${month.monthName}: ${formatCurrency(month.totalAmount)}`}
                    ></div>
                  </div>
                  <div className="chart-bar-label">
                    {month.monthName.substring(0, 3)}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-text">No monthly data available</div>
          </div>
        )}
      </div>

      {/* Category Breakdown */}
      <div className="section">
        <div className="section-header">
          <h2 className="section-title">By Category</h2>
        </div>
        
        {categorySummary && categorySummary.length > 0 ? (
          <div className="summary-list">
            {categorySummary.map((item, index) => (
              <div key={item.categoryId} className="summary-item">
                <div className="summary-item-info">
                  <div className={`summary-item-color cat-${index % 10}`}></div>
                  <div>
                    <div className="summary-item-name">{item.categoryName}</div>
                    <div className="summary-item-count">{item.expenseCount} expense(s)</div>
                  </div>
                </div>
                <div>
                  <span className="summary-item-amount">{formatCurrency(item.totalAmount)}</span>
                  <span className="summary-item-percent">({item.percentage?.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-text">No category data available</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryChart;
