import React, { useState, useEffect, useMemo, useCallback } from 'react';
import './App.css';
import SearchFilter from './components/SearchFilter';
import RecordList from './components/RecordList';
import RecordDetail from './components/RecordDetail';
import Dashboard from './components/Dashboard';

function AnimatedCount({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = performance.now();
    const duration = 700;
    const from = 0;
    const animate = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplay(value);
    };
    requestAnimationFrame(animate);
  }, [value]);
  return <span className="count-up">{display}</span>;
}

function App() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cleanerFilter, setCleanerFilter] = useState('all');
  const [sortBy, setSortBy] = useState('cleaning_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);
  const [toast, setToast] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');
  const pageSize = 10;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data.json');
        if (!response.ok) {
          throw new Error('Failed to load data');
        }
        const data = await response.json();
        setRecords(data.records);
        setLoading(false);
        showToast('Data loaded successfully', 'success');
      } catch (err) {
        setError(err.message);
        setLoading(false);
        showToast('Failed to load data', 'error');
      }
    };
    loadData();
  }, []);

  const showToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const filteredRecords = useMemo(() => {
    return records.filter(record => {
      const matchesSearch = searchTerm === '' ||
        record.record_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.block_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.cleaner && record.cleaner.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (record.complaint_text && record.complaint_text.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
      const matchesCleaner = cleanerFilter === 'all' || record.cleaner === cleanerFilter;

      return matchesSearch && matchesStatus && matchesCleaner;
    });
  }, [records, searchTerm, statusFilter, cleanerFilter]);

  const sortedRecords = useMemo(() => {
    return [...filteredRecords].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'record_id':
          aVal = a.record_id;
          bVal = b.record_id;
          break;
        case 'block_id':
          aVal = a.block_id;
          bVal = b.block_id;
          break;
        case 'cleaning_date':
          aVal = a.cleaning_date || '0000-00-00';
          bVal = b.cleaning_date || '0000-00-00';
          break;
        case 'complaint_date':
          aVal = a.complaint_date || '0000-00-00';
          bVal = b.complaint_date || '0000-00-00';
          break;
        default:
          aVal = a.cleaning_date || '0000-00-00';
          bVal = b.cleaning_date || '0000-00-00';
      }
      
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
  }, [filteredRecords, sortBy, sortOrder]);

  const cleaners = useMemo(() => {
    const uniqueCleaners = [...new Set(records.map(r => r.cleaner).filter(Boolean))];
    return ['all', ...uniqueCleaners];
  }, [records]);

  const stats = useMemo(() => {
    const totalRecords = records.length;
    const pendingComplaints = records.filter(r => r.status === 'pending').length;
    const resolvedComplaints = records.filter(r => r.status === 'resolved').length;
    const cleanedRecords = records.filter(r => r.status === 'cleaned').length;
    
    const blockStats = {};
    records.forEach(r => {
      if (!blockStats[r.block_id]) {
        blockStats[r.block_id] = {
          cleanings: 0,
          complaints: 0,
          lastCleaning: null
        };
      }
      if (r.cleaning_date) {
        blockStats[r.block_id].cleanings++;
        const date = new Date(r.cleaning_date);
        if (!blockStats[r.block_id].lastCleaning || date > blockStats[r.block_id].lastCleaning) {
          blockStats[r.block_id].lastCleaning = date;
        }
      }
      if (r.complaint_text) {
        blockStats[r.block_id].complaints++;
      }
    });
    
    const blocksNeedingAttention = Object.entries(blockStats)
      .filter(([_, stats]) => stats.complaints > stats.cleanings)
      .map(([blockId]) => blockId);
    
    const cleanerStats = {};
    records.forEach(r => {
      if (!r.cleaner || r.cleaner === 'Unknown') return;
      if (!cleanerStats[r.cleaner]) {
        cleanerStats[r.cleaner] = { cleanings: 0, complaints: 0, resolved: 0, pending: 0 };
      }
      if (r.cleaning_date) cleanerStats[r.cleaner].cleanings++;
      if (r.complaint_text) cleanerStats[r.cleaner].complaints++;
      if (r.status === 'resolved') cleanerStats[r.cleaner].resolved++;
      if (r.status === 'pending') cleanerStats[r.cleaner].pending++;
    });
    
    const blockLocations = {};
    records.forEach(r => { blockLocations[r.block_id] = r.location; });
    
    const blockPriority = Object.entries(blockStats)
      .map(([blockId, data]) => {
        const daysSince = data.lastCleaning
          ? Math.floor((new Date() - data.lastCleaning) / (1000 * 60 * 60 * 24))
          : null;
        return {
          blockId,
          location: blockLocations[blockId] || 'Unknown',
          daysSinceLastCleaning: daysSince,
          totalCleanings: data.cleanings,
          totalComplaints: data.complaints
        };
      })
      .sort((a, b) => {
        if (a.daysSinceLastCleaning === null && b.daysSinceLastCleaning === null) return 0;
        if (a.daysSinceLastCleaning === null) return 1;
        if (b.daysSinceLastCleaning === null) return -1;
        return b.daysSinceLastCleaning - a.daysSinceLastCleaning;
      });
    
    return {
      totalRecords,
      pendingComplaints,
      resolvedComplaints,
      cleanedRecords,
      blocksNeedingAttention,
      cleanerStats,
      blockPriority
    };
  }, [records]);

  const totalPages = Math.ceil(sortedRecords.length / pageSize) || 1;
  const paginatedRecords = sortedRecords.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasActiveFilters = searchTerm || statusFilter !== 'all' || cleanerFilter !== 'all';

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('all');
    setCleanerFilter('all');
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    const el = document.querySelector('.main-content');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, cleanerFilter]);

  const handleRecordClick = useCallback((record) => {
    setSelectedRecord(record);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedRecord(null);
  }, []);

  const handleSort = useCallback((field) => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  }, [sortBy]);

  const handleRefresh = useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showToast('Data refreshed', 'success');
    }, 1000);
  }, [showToast]);

  const handleExport = useCallback(() => {
    const csvContent = [
      ['Record ID', 'Block ID', 'Location', 'Cleaning Date', 'Cleaner', 'Complaint', 'Complaint Date', 'Status'].join(','),
      ...filteredRecords.map(r => [
        r.record_id,
        r.block_id,
        `"${r.location}"`,
        r.cleaning_date || '',
        `"${r.cleaner || ''}"`,
        `"${r.complaint_text || ''}"`,
        r.complaint_date || '',
        r.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'toilet_records.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    showToast('Data exported successfully', 'success');
  }, [filteredRecords, showToast]);

  return (
    <div className="app">
      <header className="header">
        <div className="header-top">
          <div className="header-brand">
            <div className="logo">
              <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="8" y="10" width="8" height="12" rx="1" fill="white"/>
                <rect x="10" y="6" width="4" height="4" fill="white"/>
                <rect x="14" y="8" width="4" height="2" rx="1" fill="white"/>
                <circle cx="19" cy="7" r="1" fill="white" opacity="0.6"/>
                <circle cx="20.5" cy="5.5" r="0.75" fill="white" opacity="0.4"/>
                <circle cx="21" cy="8" r="0.5" fill="white" opacity="0.3"/>
              </svg>
            </div>
            <div className="header-titles">
              <h1>Toilet Cleaning & Complaint Register</h1>
              <p className="subtitle">Public Sanitation Management System</p>
            </div>
          </div>
          <div className="header-right">
            <div className="header-meta">
              <div className="meta-item">
                <span className="meta-label">Date</span>
                <span className="meta-value">{new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
              </div>
              <div className="meta-divider"></div>
              <div className="meta-item">
                <span className="meta-label">Records</span>
                <span className="meta-value">{stats.totalRecords}</span>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              title={theme === 'light' ? 'Dark mode' : 'Light mode'}
            >
              {theme === 'light' ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              )}
            </button>
          </div>
        </div>
        <div className="header-stats">
          <div className="header-stat">
            <span className="header-stat-value"><AnimatedCount value={stats.pendingComplaints} /></span>
            <span className="header-stat-label">Pending</span>
          </div>
          <div className="header-stat">
            <span className="header-stat-value"><AnimatedCount value={stats.resolvedComplaints} /></span>
            <span className="header-stat-label">Resolved</span>
          </div>
          <div className="header-stat">
            <span className="header-stat-value"><AnimatedCount value={stats.cleanedRecords} /></span>
            <span className="header-stat-label">Cleaned</span>
          </div>
          <div className="header-stat">
            <span className="header-stat-value"><AnimatedCount value={stats.blocksNeedingAttention.length} /></span>
            <span className="header-stat-label">Attention</span>
          </div>
        </div>
      </header>

      <main className="main-content">
        {loading && (
          <div className="skeleton-container" role="status" aria-live="polite">
            <div className="skeleton-card">
              <div className="skeleton-search"></div>
              <div className="skeleton-line w60"></div>
              <div className="skeleton-line w80"></div>
            </div>
            <div className="skeleton-card">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton-row">
                  <div className="skeleton-row-inner"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="error-state" role="alert">
            <div className="error-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4M12 16h.01"/>
              </svg>
            </div>
            <h2>Unable to Load Data</h2>
            <p>{error}</p>
            <button onClick={handleRefresh} className="retry-button">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            <Dashboard 
              stats={stats} 
              showDashboard={showDashboard} 
              onToggleDashboard={() => setShowDashboard(!showDashboard)} 
              cleanerStats={stats.cleanerStats}
              blockPriority={stats.blockPriority}
            />
            
            <SearchFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              cleanerFilter={cleanerFilter}
              onCleanerFilterChange={setCleanerFilter}
              cleaners={cleaners}
              recordCount={sortedRecords.length}
              totalCount={records.length}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              onExport={handleExport}
              onRefresh={handleRefresh}
              records={records}
              hasActiveFilters={hasActiveFilters}
              onClearFilters={handleClearFilters}
            />

            <RecordList
              records={paginatedRecords}
              onRecordClick={handleRecordClick}
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              totalRecords={sortedRecords.length}
              searchTerm={searchTerm}
            />
          </>
        )}
      </main>

      {selectedRecord && (
        <div className="detail-overlay" onClick={handleCloseDetail}>
          <div className="detail-panel" onClick={e => e.stopPropagation()}>
            <RecordDetail
              record={selectedRecord}
              records={records}
              onBack={handleCloseDetail}
            />
          </div>
        </div>
      )}
      
      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}

export default App;
