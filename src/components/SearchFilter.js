import React, { useState, useRef, useEffect } from 'react';

function SearchFilter({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  cleanerFilter,
  onCleanerFilterChange,
  cleaners,
  recordCount,
  totalCount,
  sortBy,
  sortOrder,
  onSort,
  onExport,
  onRefresh,
  records,
  hasActiveFilters,
  onClearFilters
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const searchRef = useRef(null);
  const suggestionsRef = useRef(null);

  const getStatusCounts = () => {
    const counts = { pending: 0, resolved: 0, cleaned: 0 };
    records.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++; });
    return counts;
  };
  const statusCounts = getStatusCounts();

  const statusChips = [
    { key: 'pending', label: 'Pending', count: statusCounts.pending },
    { key: 'resolved', label: 'Resolved', count: statusCounts.resolved },
    { key: 'cleaned', label: 'Cleaned', count: statusCounts.cleaned },
  ];

  const getSuggestions = (term) => {
    if (!term || term.length < 2) return [];
    const lowerTerm = term.toLowerCase();
    const suggestions = [];

    records.forEach(record => {
      if (record.record_id.toLowerCase().includes(lowerTerm)) {
        suggestions.push({ type: 'Record ID', value: record.record_id, id: record.record_id });
      }
      if (record.block_id.toLowerCase().includes(lowerTerm)) {
        suggestions.push({ type: 'Block ID', value: record.block_id, id: record.block_id });
      }
      if (record.location.toLowerCase().includes(lowerTerm)) {
        suggestions.push({ type: 'Location', value: record.location, id: record.location });
      }
      if (record.cleaner && record.cleaner.toLowerCase().includes(lowerTerm)) {
        suggestions.push({ type: 'Cleaner', value: record.cleaner, id: record.cleaner });
      }
      if (record.complaint_text && record.complaint_text.toLowerCase().includes(lowerTerm)) {
        suggestions.push({ type: 'Complaint', value: record.complaint_text, id: record.complaint_text });
      }
    });

    const unique = [];
    const seen = new Set();
    suggestions.forEach(s => {
      const key = `${s.type}-${s.value}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(s);
      }
    });

    return unique.slice(0, 8);
  };

  const suggestions = getSuggestions(searchTerm);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
      e.preventDefault();
      onSearchChange(suggestions[selectedSuggestion].value);
      setShowSuggestions(false);
      setSelectedSuggestion(-1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (value) => {
    onSearchChange(value);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Record ID': return 'type-record';
      case 'Block ID': return 'type-block';
      case 'Location': return 'type-location';
      case 'Cleaner': return 'type-cleaner';
      case 'Complaint': return 'type-complaint';
      default: return '';
    }
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? ' \u2191' : ' \u2193';
  };

  return (
    <div className="search-filter-container">
      <div className="search-box" ref={searchRef}>
        <span className="search-icon" aria-hidden="true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>
        </span>
        <label htmlFor="search-input" className="sr-only">Search records</label>
        <input
          id="search-input"
          type="text"
          placeholder="Search by ID, block, location, cleaner..."
          value={searchTerm}
          onChange={(e) => {
            onSearchChange(e.target.value);
            setShowSuggestions(true);
            setSelectedSuggestion(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          className="search-input"
          aria-label="Search records"
          aria-autocomplete="list"
          aria-controls="suggestions-list"
        />
        {searchTerm && (
          <button
            onClick={() => {
              onSearchChange('');
              setShowSuggestions(false);
            }}
            className="clear-search"
            aria-label="Clear search"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <ul className="suggestions-list" id="suggestions-list" ref={suggestionsRef}>
            {suggestions.map((suggestion, index) => (
              <li
                key={`${suggestion.type}-${suggestion.value}`}
                className={`suggestion-item ${index === selectedSuggestion ? 'selected' : ''}`}
                onClick={() => handleSuggestionClick(suggestion.value)}
                onMouseEnter={() => setSelectedSuggestion(index)}
              >
                <span className={`suggestion-type ${getTypeColor(suggestion.type)}`}>
                  {suggestion.type}
                </span>
                <span className="suggestion-value">{suggestion.value}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Status</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Statuses</option>
            <option value="cleaned">Cleaned</option>
            <option value="pending">Pending</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="cleaner-filter">Cleaner</label>
          <select
            id="cleaner-filter"
            value={cleanerFilter}
            onChange={(e) => onCleanerFilterChange(e.target.value)}
            className="filter-select"
          >
            {cleaners.map(cleaner => (
              <option key={cleaner} value={cleaner}>
                {cleaner === 'all' ? 'All Cleaners' : cleaner}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label htmlFor="sort-filter">Sort By{getSortIcon(sortBy)}</label>
          <select
            id="sort-filter"
            value={sortBy}
            onChange={(e) => onSort(e.target.value)}
            className="filter-select"
          >
            <option value="cleaning_date">Cleaning Date</option>
            <option value="complaint_date">Complaint Date</option>
            <option value="record_id">Record ID</option>
            <option value="block_id">Block ID</option>
          </select>
        </div>
      </div>

      <div className="filter-chips">
        <button
          className={`filter-chip ${statusFilter === 'all' && cleanerFilter === 'all' ? 'active' : ''}`}
          onClick={() => { onStatusFilterChange('all'); onCleanerFilterChange('all'); }}
        >
          All
        </button>
        {statusChips.map(chip => (
          <button
            key={chip.key}
            className={`filter-chip ${chip.key} ${statusFilter === chip.key ? 'active' : ''}`}
            onClick={() => onStatusFilterChange(statusFilter === chip.key ? 'all' : chip.key)}
          >
            {chip.label}
            <span className="chip-count">{chip.count}</span>
          </button>
        ))}
      </div>

      <div className="filter-actions">
        <div className="record-count" aria-live="polite">
          <span className="count-number">{recordCount}</span>
          <span className="count-text">
            {recordCount === 1 ? 'record' : 'records'}
            {recordCount !== totalCount && (
              <span className="total-count"> of {totalCount}</span>
            )}
          </span>
        </div>
        
        <div className="action-buttons">
          {hasActiveFilters && (
            <button onClick={onClearFilters} className="action-btn clear-filters-btn" title="Clear all filters">
              Clear Filters
            </button>
          )}
          <button onClick={onRefresh} className="action-btn refresh-btn" title="Refresh data">
            Refresh
          </button>
          <button onClick={onExport} className="action-btn export-btn" title="Export to CSV">
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchFilter;
