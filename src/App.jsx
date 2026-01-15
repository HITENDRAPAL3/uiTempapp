import React, { useState, useEffect, useCallback } from 'react';
import { authApi, categoryApi, expenseApi, summaryApi, exportApi, emailApi } from './api/api';
import Dashboard from './components/Dashboard';
import FilterBar from './components/FilterBar';
import ExpenseList from './components/ExpenseList';
import ExpenseForm from './components/ExpenseForm';
import CategoryManager from './components/CategoryManager';
import SummaryChart from './components/SummaryChart';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';

function App() {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(true);

  // App State
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [categorySummary, setCategorySummary] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [activeTab, setActiveTab] = useState('expenses');
  const [filters, setFilters] = useState({
    categoryId: '',
    startDate: '',
    endDate: ''
  });
  const [toast, setToast] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(storedUser));
    }
    setAuthLoading(false);
  }, []);

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Auth handlers
  const handleLogin = async (credentials) => {
    try {
      setAuthError('');
      const response = await authApi.login(credentials);
      const { token, username, email } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username, email }));

      setUser({ username, email });
      setIsAuthenticated(true);
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Invalid username or password');
    }
  };

  const handleRegister = async (userData) => {
    try {
      setAuthError('');
      const response = await authApi.register(userData);
      const { token, username, email } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({ username, email }));

      setUser({ username, email });
      setIsAuthenticated(true);
    } catch (error) {
      setAuthError(error.response?.data?.message || 'Registration failed');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      const [categoriesRes, expensesRes, totalRes, catSummaryRes, monthlyRes] = await Promise.all([
        categoryApi.getAll(),
        expenseApi.getAll(filters),
        summaryApi.getTotal(filters),
        summaryApi.getByCategory(filters),
        summaryApi.getMonthly(filters)
      ]);

      setCategories(categoriesRes.data);
      setExpenses(expensesRes.data);
      setTotalExpenses(totalRes.data.total);
      setCategorySummary(catSummaryRes.data);
      setMonthlySummary(monthlyRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [fetchData, isAuthenticated]);

  // Export handlers
  const handleExport = async (format) => {
    try {
      let response;
      let filename;

      switch (format) {
        case 'csv':
          response = await exportApi.downloadCSV(filters);
          filename = 'expenses.csv';
          break;
        case 'excel':
          response = await exportApi.downloadExcel(filters);
          filename = 'expenses.xlsx';
          break;
        case 'pdf':
          response = await exportApi.downloadPDF(filters);
          filename = 'expenses.pdf';
          break;
        default:
          return;
      }

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast(`Exported to ${format.toUpperCase()} successfully`);
    } catch (error) {
      console.error('Export error:', error);
      showToast(`Failed to export to ${format.toUpperCase()}`, 'error');
    }
  };

  // Email report handler
  const handleEmailReport = async () => {
    try {
      setSendingEmail(true);
      const response = await emailApi.sendReport(filters);
      showToast(response.data.message || 'Report sent to your email!');
    } catch (error) {
      console.error('Email error:', error);
      showToast(error.response?.data?.message || 'Failed to send email report', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  // Download HTML report handler (works when SMTP is blocked)
  const handleDownloadReport = async () => {
    try {
      setSendingEmail(true);
      const response = await emailApi.downloadReport(filters);

      const blob = new Blob([response.data], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'expense-report.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('Report downloaded! Open the HTML file in your browser.');
    } catch (error) {
      console.error('Download error:', error);
      showToast('Failed to download report', 'error');
    } finally {
      setSendingEmail(false);
    }
  };

  // Expense handlers
  const handleAddExpense = async (expenseData) => {
    try {
      await expenseApi.create(expenseData);
      showToast('Expense added successfully');
      setShowExpenseForm(false);
      fetchData();
    } catch (error) {
      console.error('Error adding expense:', error);
      showToast(error.response?.data?.message || 'Failed to add expense', 'error');
    }
  };

  const handleUpdateExpense = async (expenseData) => {
    try {
      await expenseApi.update(editingExpense.id, expenseData);
      showToast('Expense updated successfully');
      setShowExpenseForm(false);
      setEditingExpense(null);
      fetchData();
    } catch (error) {
      console.error('Error updating expense:', error);
      showToast(error.response?.data?.message || 'Failed to update expense', 'error');
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;

    try {
      await expenseApi.delete(id);
      showToast('Expense deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting expense:', error);
      showToast('Failed to delete expense', 'error');
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  // Category handlers
  const handleAddCategory = async (categoryData) => {
    try {
      await categoryApi.create(categoryData);
      showToast('Category added successfully');
      fetchData();
    } catch (error) {
      console.error('Error adding category:', error);
      showToast(error.response?.data?.message || 'Failed to add category', 'error');
    }
  };

  const handleUpdateCategory = async (id, categoryData) => {
    try {
      await categoryApi.update(id, categoryData);
      showToast('Category updated successfully');
      fetchData();
    } catch (error) {
      console.error('Error updating category:', error);
      showToast(error.response?.data?.message || 'Failed to update category', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoryApi.delete(id);
      showToast('Category deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      showToast(error.response?.data?.message || 'Cannot delete category with existing expenses', 'error');
    }
  };

  const handleClearFilters = () => {
    setFilters({ categoryId: '', startDate: '', endDate: '' });
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="auth-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // Show auth forms if not authenticated
  if (!isAuthenticated) {
    return authView === 'login' ? (
      <LoginForm
        onLogin={handleLogin}
        onSwitchToRegister={() => { setAuthView('register'); setAuthError(''); }}
        error={authError}
      />
    ) : (
      <RegisterForm
        onRegister={handleRegister}
        onSwitchToLogin={() => { setAuthView('login'); setAuthError(''); }}
        error={authError}
      />
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div>
          <h1 className="app-title">Expense Tracker</h1>
          <p className="app-subtitle">Welcome, {user?.username}</p>
        </div>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setEditingExpense(null);
              setShowExpenseForm(true);
            }}
          >
            + Add Expense
          </button>
          <button className="btn btn-secondary" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {/* Dashboard Cards */}
      <Dashboard
        totalExpenses={totalExpenses}
        expenseCount={expenses.length}
        categoryCount={categories.length}
        monthlyData={monthlySummary}
      />

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          Expenses
        </button>
        <button
          className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Categories
        </button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === 'expenses' ? (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">Recent Expenses</h2>
              <div className="export-buttons">
                <button className="btn btn-secondary btn-sm" onClick={() => handleExport('csv')}>
                  CSV
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleExport('excel')}>
                  Excel
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => handleExport('pdf')}>
                  PDF
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleEmailReport}
                  disabled={sendingEmail}
                >
                  {sendingEmail ? 'Sending...' : '📧 Email Report'}
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleDownloadReport}
                  disabled={sendingEmail}
                >
                  {sendingEmail ? 'Generating...' : '📄 HTML Report'}
                </button>
              </div>
            </div>

            <FilterBar
              filters={filters}
              setFilters={setFilters}
              categories={categories}
              onClearFilters={handleClearFilters}
            />

            <ExpenseList
              expenses={expenses}
              onEdit={handleEditExpense}
              onDelete={handleDeleteExpense}
              loading={loading}
            />
          </div>
        ) : (
          <CategoryManager
            categories={categories}
            onAdd={handleAddCategory}
            onUpdate={handleUpdateCategory}
            onDelete={handleDeleteCategory}
          />
        )}

        {/* Summary Sidebar */}
        <SummaryChart
          categorySummary={categorySummary}
          monthlySummary={monthlySummary}
        />
      </div>

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          expense={editingExpense}
          categories={categories}
          onSubmit={editingExpense ? handleUpdateExpense : handleAddExpense}
          onClose={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
          }}
        />
      )}

      {/* Toast Notifications */}
      {toast && (
        <div className="toast-container">
          <div className={`toast ${toast.type}`}>
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
