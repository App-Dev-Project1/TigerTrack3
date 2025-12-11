// src/components/DashboardView.jsx
import React from 'react';
import '../styles/AdminDashboard.css';

const DashboardView = ({ stats, recentActivity }) => {
  const { totalItems, pending, resolved } = stats || { totalItems: 0, pending: 0, resolved: 0 };
  
  // Helper to choose icon/color based on item type
  const getActivityStyle = (type) => {
    switch(type) {
      case 'lost': return { icon: '🔍', color: '#ef4444', bg: '#fef2f2', border: '#fee2e2' }; // Red
      case 'found': return { icon: '📦', color: '#f59e0b', bg: '#fffbeb', border: '#fef3c7' }; // Amber
      case 'solved': return { icon: '✅', color: '#10b981', bg: '#ecfdf5', border: '#d1fae5' }; // Green
      default: return { icon: '📝', color: '#64748b', bg: '#f8fafc', border: '#e2e8f0' };
    }
  };

  return (
    <div className="dashboard-view">
      <h1>Welcome, Admin</h1>
      <p className="dashboard-subtitle">Manage your lost and found items</p>

      {/* Stats Cards */}
      <div className="dashboard-stats-container">
        <div className="stat-card total">
          <div className="stat-icon">📦</div>
          <h3>{totalItems}</h3> 
          <p>Total Items</p>
        </div>

        <div className="stat-card pending">
          <div className="stat-icon">⏳</div>
          <h3>{pending}</h3>
          <p>Pending</p>
        </div>

        <div className="stat-card resolved">
          <div className="stat-icon">✅</div>
          <h3>{resolved}</h3>
          <p>Resolved</p>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="recent-activity-box">
        <h2>Recent Activity</h2>
        
        {(!recentActivity || recentActivity.length === 0) ? (
           <div className="no-activity">
             <p>No recent activity found.</p>
             <small>New reports will appear here automatically.</small>
           </div>
        ) : (
          <div className="activity-list">
            {recentActivity.map((activity, index) => {
              const style = getActivityStyle(activity.type);
              return (
                <div 
                  key={`${activity.type}-${activity.id}-${index}`} 
                  className="activity-item"
                  style={{ backgroundColor: style.bg, borderColor: style.border }}
                >
                  <div className="activity-icon-wrapper" style={{ color: style.color }}>
                    {style.icon}
                  </div>
                  <div className="activity-details">
                    <span className="activity-label" style={{ color: style.color }}>
                      {activity.label}
                    </span>
                    <span className="activity-name">
                      {activity.name}
                    </span>
                  </div>
                  <div className="activity-date">
                    {activity.displayDate}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        <div className="activity-footer">
          <span>Showing latest updates from system</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;