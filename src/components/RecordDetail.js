import React, { useMemo } from 'react';

function RecordDetail({ record, records, onBack }) {
  const blockRecords = useMemo(() => {
    return records.filter(r => r.block_id === record.block_id);
  }, [records, record.block_id]);

  const derivedStats = useMemo(() => {
    const totalCleanings = blockRecords.filter(r => r.cleaning_date).length;
    const totalComplaints = blockRecords.filter(r => r.complaint_text).length;
    const pendingComplaints = blockRecords.filter(r => r.status === 'pending').length;
    const resolvedComplaints = blockRecords.filter(r => r.status === 'resolved').length;

    const cleaningDates = blockRecords
      .filter(r => r.cleaning_date)
      .map(r => new Date(r.cleaning_date))
      .sort((a, b) => a - b);

    const lastCleaning = cleaningDates.length > 0 ? cleaningDates[cleaningDates.length - 1] : null;
    const daysSinceLastCleaning = lastCleaning
      ? Math.floor((new Date() - lastCleaning) / (1000 * 60 * 60 * 24))
      : null;

    const firstCleaning = cleaningDates.length > 0 ? cleaningDates[0] : null;
    const daysSinceFirstCleaning = firstCleaning
      ? Math.floor((new Date() - firstCleaning) / (1000 * 60 * 60 * 24))
      : null;

    const avgDaysBetweenCleanings = cleaningDates.length > 1
      ? Math.round((cleaningDates[cleaningDates.length - 1] - cleaningDates[0]) / (1000 * 60 * 60 * 24) / (cleaningDates.length - 1))
      : null;

    const complaintRate = totalCleanings > 0 
      ? ((totalComplaints / totalCleanings) * 100).toFixed(1)
      : 0;

    return {
      totalCleanings,
      totalComplaints,
      pendingComplaints,
      resolvedComplaints,
      lastCleaning,
      daysSinceLastCleaning,
      daysSinceFirstCleaning,
      avgDaysBetweenCleanings,
      complaintRate
    };
  }, [blockRecords]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not recorded';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateShort = (date) => {
    if (!date) return 'N/A';
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'cleaned': return 'status-cleaned';
      case 'pending': return 'status-pending';
      case 'resolved': return 'status-resolved';
      default: return 'status-unknown';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'cleaned': return 'Cleaned';
      case 'pending': return 'Pending';
      case 'resolved': return 'Resolved';
      default: return 'Unknown';
    }
  };

  return (
    <div className="record-detail">
      <header className="detail-header">
        <div className="detail-header-top">
          <div className="detail-header-text">
            <h1>Block: {record.block_id}</h1>
            <p className="location">{record.location}</p>
          </div>
          <button onClick={onBack} className="close-detail-btn" aria-label="Close detail view">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="detail-quick-stats">
          <div className="detail-quick-stat">
            <span className="stat-val">{derivedStats.daysSinceLastCleaning ?? 'N/A'}</span>
            <span className="stat-lbl">Days Since Last</span>
          </div>
          <div className="detail-quick-stat">
            <span className="stat-val">{derivedStats.totalCleanings}</span>
            <span className="stat-lbl">Cleanings</span>
          </div>
          <div className="detail-quick-stat">
            <span className="stat-val">{derivedStats.totalComplaints}</span>
            <span className="stat-lbl">Complaints</span>
          </div>
          <div className="detail-quick-stat">
            <span className="stat-val">{derivedStats.complaintRate}%</span>
            <span className="stat-lbl">Complaint Rate</span>
          </div>
        </div>
      </header>

      <div className="detail-stats-grid">
        <div className="stat-card highlight">
          <span className="stat-value">{derivedStats.daysSinceLastCleaning ?? 'N/A'}</span>
          <span className="stat-label">Days Since Last Cleaning</span>
        </div>
        <div className="stat-card info">
          <span className="stat-value">{derivedStats.totalCleanings}</span>
          <span className="stat-label">Total Cleanings</span>
        </div>
        <div className="stat-card success">
          <span className="stat-value">{derivedStats.totalComplaints}</span>
          <span className="stat-label">Total Complaints</span>
        </div>
        <div className="stat-card warning">
          <span className="stat-value">{derivedStats.pendingComplaints}</span>
          <span className="stat-label">Pending Complaints</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{derivedStats.resolvedComplaints}</span>
          <span className="stat-label">Resolved Complaints</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">{derivedStats.avgDaysBetweenCleanings ?? 'N/A'}</span>
          <span className="stat-label">Avg Days Between</span>
        </div>
      </div>

      <div className="detail-section">
        <h2>Current Record</h2>
        <div className="record-card">
          <div className="record-field">
            <span className="field-label">Record ID</span>
            <span className="field-value">{record.record_id}</span>
          </div>
          <div className="record-field">
            <span className="field-label">Block ID</span>
            <span className="field-value">{record.block_id}</span>
          </div>
          <div className="record-field">
            <span className="field-label">Location</span>
            <span className="field-value">{record.location}</span>
          </div>
          <div className="record-field">
            <span className="field-label">Cleaning Date</span>
            <span className="field-value">{formatDate(record.cleaning_date)}</span>
          </div>
          <div className="record-field">
            <span className="field-label">Cleaner</span>
            <span className="field-value">{record.cleaner || 'Not assigned'}</span>
          </div>
          <div className="record-field">
            <span className="field-label">Complaint</span>
            <span className="field-value">{record.complaint_text || 'No complaint recorded'}</span>
          </div>
          <div className="record-field">
            <span className="field-label">Complaint Date</span>
            <span className="field-value">{formatDate(record.complaint_date)}</span>
          </div>
          <div className="record-field">
            <span className="field-label">Status</span>
            <span className={`status-badge ${getStatusBadgeClass(record.status)}`}>
              {getStatusText(record.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h2>Block History ({blockRecords.length} records)</h2>
        {blockRecords.length === 0 ? (
          <div className="empty-history">
            <p>No history available for this block.</p>
          </div>
        ) : (
          <div className="history-table">
            <div className="history-header">
              <span>Record ID</span>
              <span>Cleaning Date</span>
              <span>Cleaner</span>
              <span>Complaint</span>
              <span>Status</span>
            </div>
            {blockRecords.map(rec => (
              <div key={rec.record_id} className={`history-row ${rec.record_id === record.record_id ? 'current-record' : ''}`}>
                <span>{rec.record_id}</span>
                <span>{formatDate(rec.cleaning_date)}</span>
                <span>{rec.cleaner || '-'}</span>
                <span>{rec.complaint_text || '-'}</span>
                <span>
                  <span className={`status-badge ${getStatusBadgeClass(rec.status)}`}>
                    {getStatusText(rec.status)}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecordDetail;
