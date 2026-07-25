import React from 'react';

function getCleanerColor(index) {
  const colors = ['#10b981', '#06b6d4', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
  return colors[index % colors.length];
}

function Dashboard({ stats, showDashboard, onToggleDashboard, cleanerStats, blockPriority }) {
  if (!showDashboard) {
    return (
      <div className="dashboard-toggle">
        <button onClick={onToggleDashboard} className="toggle-dashboard-btn">
          <svg className="toggle-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="3" width="7" height="4" rx="1"/>
            <rect x="14" y="10" width="7" height="11" rx="1"/>
            <rect x="3" y="13" width="7" height="8" rx="1"/>
          </svg>
          Show Dashboard
        </button>
      </div>
    );
  }

  const maxCleanings = Math.max(...Object.values(cleanerStats || {}).map(c => c.cleanings), 1);

  const statusBreakdown = [
    { label: 'Cleaned', value: stats.cleanedRecords, color: '#10b981' },
    { label: 'Pending', value: stats.pendingComplaints, color: '#f59e0b' },
    { label: 'Resolved', value: stats.resolvedComplaints, color: '#06b6d4' }
  ];
  const maxStatus = Math.max(...statusBreakdown.map(s => s.value), 1);

  const cleanerEntries = Object.entries(cleanerStats || {});

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Dashboard Overview</h2>
        <button onClick={onToggleDashboard} className="close-dashboard" aria-label="Close dashboard">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <div className="dashboard-stats">
        <div className="dash-stat-card">
          <div className="dash-stat-icon blue">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
              <path d="M9 14l2 2 4-4"/>
            </svg>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{stats.totalRecords}</span>
            <span className="dash-stat-label">Total Records</span>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon orange">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 8v4M12 16h.01"/>
            </svg>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{stats.pendingComplaints}</span>
            <span className="dash-stat-label">Pending Complaints</span>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon green">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <path d="M22 4L12 14.01l-3-3"/>
            </svg>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{stats.resolvedComplaints}</span>
            <span className="dash-stat-label">Resolved</span>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="dash-stat-icon purple">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
          </div>
          <div className="dash-stat-info">
            <span className="dash-stat-value">{stats.cleanedRecords}</span>
            <span className="dash-stat-label">Cleaned</span>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-card">
          <h3>Status Distribution</h3>
          <div className="bar-chart">
            {statusBreakdown.map(item => (
              <div key={item.label} className="bar-row">
                <span className="bar-label">{item.label}</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ width: `${(item.value / maxStatus) * 100}%`, background: item.color }}
                  />
                </div>
                <span className="bar-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {cleanerEntries.length > 0 && (
          <div className="chart-card">
            <h3>Cleaner Performance</h3>
            <div className="bar-chart">
              {cleanerEntries.map(([name, data], index) => {
                const total = data.cleanings + data.complaints;
                const cleanPct = total > 0 ? (data.cleanings / total) * 100 : 0;
                return (
                  <div key={name} className="bar-row cleaner-row">
                    <span className="bar-label">{name}</span>
                    <div className="bar-track">
                      <div
                        className="bar-fill"
                        style={{ width: `${(data.cleanings / maxCleanings) * 100}%`, background: getCleanerColor(index) }}
                      />
                    </div>
                    <span className="bar-value">{data.cleanings} cleanings</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="cleaning-priority">
        <h3>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          Cleaning Priority — Blocks by Days Since Last Cleaning
        </h3>
        <div className="priority-table">
          <div className="priority-header">
            <span>Block</span>
            <span>Location</span>
            <span>Last Cleaning</span>
            <span>Days Since</span>
            <span>Complaints</span>
          </div>
          {blockPriority.slice(0, 10).map(item => {
            const days = item.daysSinceLastCleaning;
            const urgency = days === null ? 'critical' : days > 14 ? 'critical' : days > 7 ? 'warning' : 'ok';
            return (
              <div key={item.blockId} className={`priority-row ${urgency}`}>
                <span className="priority-block">{item.blockId}</span>
                <span className="priority-location">{item.location}</span>
                <span className="priority-date">{item.daysSinceLastCleaning !== null ? new Date(Date.now() - item.daysSinceLastCleaning * 86400000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'Never'}</span>
                <span className="priority-days">
                  {days !== null ? `${days}d` : 'N/A'}
                </span>
                <span className="priority-complaints">{item.totalComplaints}</span>
              </div>
            );
          })}
        </div>
      </div>

      {stats.blocksNeedingAttention.length > 0 && (
        <div className="attention-blocks">
          <h3>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
              <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              <path d="M12 9v4M12 17h.01"/>
            </svg>
            Blocks Needing Attention
          </h3>
          <div className="attention-list">
            {stats.blocksNeedingAttention.map(blockId => (
              <span key={blockId} className="attention-tag">
                {blockId}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
