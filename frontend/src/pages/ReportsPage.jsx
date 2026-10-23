import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Code,
  Copy,
  Check,
  Search,
  Clock,
  Layers,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';

const REPORTS = [
  { key: 'student-room-hostel', title: '1. Student + Room + Hostel', category: 'Occupancy' },
  { key: 'student-phones', title: '2. Student + Student Phone', category: 'Contact Registry' },
  { key: 'hostel-warden', title: '3. Hostel + Warden', category: 'Supervision' },
  { key: 'room-type-hostel', title: '4. Room + Room Type + Hostel', category: 'Architecture' },
  { key: 'mess-meal', title: '5. Mess + Meal Schedule', category: 'Dining' },
  { key: 'mess-staff', title: '6. Mess + Staff Deployment', category: 'Operations' },
  { key: 'supplier-inventory', title: '7. Supplier + Inventory', category: 'Supply Chain' },
  { key: 'procurement-supplier-inventory', title: '8. Procurement Ledger Breakdown', category: 'Supply Chain' },
  { key: 'student-payment', title: '9. Student + Fee Transactions', category: 'Finance' },
  { key: 'hostel-occupancy', title: '10. Overall Hostel Occupancy Rate', category: 'Analytics' },
  { key: 'available-rooms', title: '11. Vacant & Available Rooms', category: 'Occupancy' },
  { key: 'student-payment-summary', title: '12. Student Total Fee Summary', category: 'Finance' },
  { key: 'inventory-procurement-summary', title: '13. Inventory & Procurement Aggregate', category: 'Supply Chain' }
];

export default function ReportsPage({ showToast }) {
  const [selectedKey, setSelectedKey] = useState('student-room-hostel');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReport(selectedKey);
  }, [selectedKey]);

  async function loadReport(key) {
    try {
      setLoading(true);
      const res = await api.getReportData(key);
      setReportData(res);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }


  function copySql() {
    if (!reportData?.sql) return;
    navigator.clipboard.writeText(reportData.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    showToast('SQL query copied to clipboard', 'info');
  }

  const rows = reportData?.data || [];
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  const currentReportObj = REPORTS.find((r) => r.key === selectedKey) || REPORTS[0];

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div className="page-header-title">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <FileBarChart2 size={20} />
            </div>
            <div>
              <h2>Institutional Analytical Reports</h2>
              <p>13 complex relational views across multi-table joins, room rents, occupancy, and inventory flows</p>
            </div>
          </div>
        </div>

        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setShowSql(!showSql)}>
            <Code size={15} />
            <span>{showSql ? 'Hide SQL Query' : 'Inspect SQL Query'}</span>
          </button>
        </div>
      </div>

      {/* SQL Inspection Drawer */}
      {showSql && reportData?.sql && (
        <div
          className="panel"
          style={{
            marginBottom: 24,
            background: '#070b14',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '12px',
            padding: '16px 20px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              UNDERLYING CYPHER / GRAPH QUERY (NEO4J AURADB)
            </span>
            <button
              onClick={copySql}
              className="btn btn-secondary btn-sm"
              style={{ padding: '3px 10px', fontSize: '0.75rem' }}
            >
              {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy Cypher'}</span>
            </button>
          </div>
          <pre
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.84rem',
              color: '#f8fafc',
              lineHeight: 1.6,
              overflowX: 'auto',
              margin: 0
            }}
          >
            {reportData.sql}
          </pre>
        </div>
      )}

      {/* Main Grid: Report Selector + Table Results */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* Left: 13 Reports Navigator List */}
        <div className="panel" style={{ padding: '14px', height: 'fit-content' }}>
          <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--bg-card-border)' }}>
            13 Relational Reports
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {REPORTS.map((r) => {
              const isSelected = selectedKey === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setSelectedKey(r.key)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: isSelected ? 'rgba(37, 99, 235, 0.18)' : 'transparent',
                    border: isSelected ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-heading)',
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.title}
                  </span>
                  <ChevronRight size={14} color={isSelected ? 'var(--primary)' : 'transparent'} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Report Data Table */}
        <div className="table-container">
          <div className="table-toolbar">
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {currentReportObj.title}
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Category: <strong>{currentReportObj.category}</strong>
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="badge badge-success">{rows.length} Record(s)</span>
              {reportData?.executionTimeMs !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#38bdf8', fontSize: '0.76rem', fontFamily: 'var(--font-mono)' }}>
                  <Clock size={12} />
                  <span>{reportData.executionTimeMs} ms</span>
                </div>
              )}
            </div>
          </div>

          <div className="data-table-wrapper" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
            <table className="data-table" style={{ width: 'max-content', minWidth: '100%' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  {columns.map((col) => (
                    <th key={col} style={{ whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length || 1} style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
                      <div className="spin-animation" style={{ display: 'inline-block', marginBottom: 8 }}>
                        <FileBarChart2 size={24} color="var(--primary)" />
                      </div>
                      <p>Computing query results from Neo4j AuraDB...</p>
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length || 1} style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
                      No data returned for this view.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, rIdx) => (
                    <tr key={rIdx}>
                      {columns.map((col) => {
                        const val = row[col];
                        const isNum = typeof val === 'number';
                        return (
                          <td
                            key={col}
                            style={{
                              whiteSpace: 'nowrap',
                              fontFamily: isNum || col.toLowerCase().includes('id') ? 'var(--font-mono)' : 'inherit',
                              color: isNum ? '#10b981' : 'var(--text-primary)'
                            }}
                          >
                            {val === null || val === undefined ? (
                              <span style={{ color: '#f87171', fontStyle: 'italic', fontSize: '0.75rem' }}>NULL</span>
                            ) : (
                              String(val)
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
