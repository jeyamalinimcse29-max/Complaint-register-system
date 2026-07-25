import React from 'react';

function highlightText(text, term) {
  if (!term || !text) return text;
  const lowerText = text.toLowerCase();
  const lowerTerm = term.toLowerCase();
  if (!lowerText.includes(lowerTerm)) return text;
  const idx = lowerText.indexOf(lowerTerm);
  return (
    <>
      {text.slice(0, idx)}
      <span className="highlight">{text.slice(idx, idx + term.length)}</span>
      {highlightText(text.slice(idx + term.length), term)}
    </>
  );
}

function RecordList({ records, onRecordClick, currentPage, totalPages, pageSize, onPageChange, totalRecords, searchTerm }) {
  if (records.length === 0) {
    return (
      <div className="empty-state" role="status">
        <div className="empty-icon" aria-hidden="true">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </div>
        <h2>No Records Found</h2>
        <p>Try adjusting your search or filter criteria.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
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

  const getPageNumbers = () => {
    const pages = [];
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    if (start > 1) pages.push(1);
    if (start > 2) pages.push('...');
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages - 1) pages.push('...');
    if (end < totalPages) pages.push(totalPages);
    return pages;
  };

  return (
    <div className="record-list">
      <div className="list-body">
        {records.map((record, index) => (
          <div
            key={record.record_id}
            className="record-row"
            onClick={() => onRecordClick(record)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onRecordClick(record);
              }
            }}
            aria-label={`View details for record ${record.record_id}`}
          >
            <span className="col-id">{highlightText(record.record_id, searchTerm)}</span>
            <span className="col-block">
              <span className="block-id">{highlightText(record.block_id, searchTerm)}</span>
              <span className="location">{highlightText(record.location, searchTerm)}</span>
            </span>
            <span className="col-date">{formatDate(record.cleaning_date)}</span>
            <span className="col-complaint">
              {record.complaint_text
                ? highlightText(record.complaint_text, searchTerm)
                : <span className="no-complaint">No complaint</span>
              }
            </span>
            <span className="col-status">
              <span className={`status-badge ${getStatusBadgeClass(record.status)}`}>
                {getStatusText(record.status)}
              </span>
            </span>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="page-btn nav-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(1)}
            aria-label="First page"
          >
            {'<<'}
          </button>
          <button
            className="page-btn nav-btn"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Previous page"
          >
            {'<'}
          </button>
          {getPageNumbers().map((page, idx) =>
            page === '...' ? (
              <span key={`ellipsis-${idx}`} className="page-btn" style={{ border: 'none', cursor: 'default', background: 'transparent' }}>...</span>
            ) : (
              <button
                key={page}
                className={`page-btn ${currentPage === page ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={currentPage === page ? 'page' : undefined}
              >
                {page}
              </button>
            )
          )}
          <button
            className="page-btn nav-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Next page"
          >
            {'>'}
          </button>
          <button
            className="page-btn nav-btn"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(totalPages)}
            aria-label="Last page"
          >
            {'>>'}
          </button>
        </div>
      )}
    </div>
  );
}

export default RecordList;
