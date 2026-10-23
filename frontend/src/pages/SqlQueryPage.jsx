import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  AlertCircle,
  CheckCircle2,
  Database,
  Clock,
  RefreshCw,
  Trash2,
  Table2,
  Code2
} from 'lucide-react';
import { api } from '../services/api';

const EXACT_18_TABLES = [
  'WARDEN',
  'WARDEN_PHONE',
  'HOSTEL',
  'ROOM_TYPE',
  'ROOM',
  'STUDENT',
  'STUDENT_PHONE',
  'MESS',
  'MESS_CONTACT',
  'MEAL',
  'STAFF',
  'STAFF_PHONE',
  'SUPPLIER',
  'SUPPLIER_PHONE',
  'INVENTORY_ITEM',
  'PROCURES',
  'PAYMENT',
  'PAYMENT_DETAIL'
];

const SQL_CATEGORIES = ['All', 'DQL (Queries)', 'DML (Modify)', 'DDL (Schema)'];

const QUICK_COMMANDS = [
  {
    category: 'DQL (Queries)',
    label: 'SELECT * FROM STUDENT',
    sql: 'SELECT * FROM STUDENT;'
  },
  {
    category: 'DQL (Queries)',
    label: 'WHERE & ORDER BY',
    sql: "SELECT StudentID, FirstName, LastName, Gender, PlanType\nFROM STUDENT\nWHERE Gender = 'Female'\nORDER BY FirstName ASC;"
  },
  {
    category: 'DQL (Queries)',
    label: 'Nested Subquery',
    sql: "SELECT StudentID, Amount, PaymentMode, Status\nFROM PAYMENT\nWHERE Amount > (SELECT AVG(Amount) FROM PAYMENT);"
  },
  {
    category: 'DQL (Queries)',
    label: 'WITH (CTE) Query',
    sql: "WITH HighRentRooms AS (\n  SELECT RoomNo, FloorNo, Type, RoomRent\n  FROM ROOM\n  WHERE RoomRent >= 4500\n)\nSELECT * FROM HighRentRooms\nORDER BY RoomRent DESC;"
  },
  {
    category: 'DQL (Queries)',
    label: '3-Table INNER JOIN',
    sql: "SELECT s.StudentID, s.FirstName || ' ' || s.LastName AS FullName,\n       r.RoomNo, r.RoomRent, h.HostelName\nFROM STUDENT s\nJOIN ROOM r ON s.RoomNo = r.RoomNo\nJOIN HOSTEL h ON s.HostelID = h.HostelID;"
  },
  {
    category: 'DQL (Queries)',
    label: 'LEFT JOIN & Aggregation',
    sql: "SELECT h.HostelName, COUNT(s.StudentID) AS TotalResidents\nFROM HOSTEL h\nLEFT JOIN STUDENT s ON h.HostelID = s.HostelID\nGROUP BY h.HostelID, h.HostelName;"
  },
  {
    category: 'DQL (Queries)',
    label: 'Payment Aggregates',
    sql: "SELECT Status, COUNT(*) AS TotalCount, SUM(Amount) AS TotalCollected, ROUND(AVG(Amount), 2) AS AvgAmount\nFROM PAYMENT\nGROUP BY Status;"
  },
  {
    category: 'DML (Modify)',
    label: 'UPDATE Record',
    sql: "UPDATE ROOM\nSET RoomRent = 5200\nWHERE RoomNo = 'R101';"
  },
  {
    category: 'DDL (Schema)',
    label: 'CREATE VIEW',
    sql: "CREATE VIEW IF NOT EXISTS VIEW_CAMPUS_SUMMARY AS\nSELECT s.StudentID, s.FirstName || ' ' || s.LastName AS FullName, h.HostelName, s.RoomNo\nFROM STUDENT s\nJOIN HOSTEL h ON s.HostelID = h.HostelID;"
  }
];

export default function SqlQueryPage({ showToast }) {
  const [sql, setSql] = useState('SELECT * FROM STUDENT;');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [schemaMap, setSchemaMap] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    loadSchema();
  }, []);

  async function loadSchema() {
    try {
      const res = await api.getSqlSchema();
      setSchemaMap(res.tables || {});
    } catch (err) {
      console.error('Error fetching schema map', err);
    }
  }

  async function handleExecuteQuery() {
    if (!sql.trim()) {
      setErrorInfo({
        message: 'Please enter a SQL command to execute',
        status: 400
      });
      return;
    }

    try {
      setExecuting(true);
      setErrorInfo(null);
      setResult(null);

      const res = await api.executeSqlQuery(sql);
      setResult(res);

      if (!res.rows && !res.data) {
        loadSchema();
      }
    } catch (err) {
      setErrorInfo({
        message: err.message || 'An error occurred during query execution',
        status: err.status || 400
      });
    } finally {
      setExecuting(false);
    }
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleExecuteQuery();
    }
  }


  const isSelectResult = result && (result.rows || result.data) && Array.isArray(result.rows || result.data);
  const resultRows = result ? (result.rows || result.data || []) : [];
  const resultCols = result ? (result.columns || (resultRows.length > 0 ? Object.keys(resultRows[0]) : [])) : [];
  const tablesList = Object.keys(schemaMap).length > 0 ? Object.keys(schemaMap) : EXACT_18_TABLES;
  const filteredCommands = activeCategory === 'All'
    ? QUICK_COMMANDS
    : QUICK_COMMANDS.filter((q) => q.category === activeCategory);

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
              <Terminal size={20} />
            </div>
            <h2 style={{ margin: 0 }}>SQL Studio</h2>
          </div>
        </div>

        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={loadSchema}>
            <RefreshCw size={13} />
            <span>Refresh Schema</span>
          </button>
        </div>
      </div>

      {/* SQL Snippets Categories Toolbar */}
      <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: 2 }}>
            SQL Categories:
          </span>
          {SQL_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '5px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  background: isActive ? 'var(--primary)' : 'var(--bg-input)',
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--primary)' : '1px solid var(--bg-card-border)',
                  boxShadow: isActive ? '0 2px 8px var(--primary-subtle)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Quick query action chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {filteredCommands.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setSql(q.sql)}
              className="btn btn-secondary btn-sm"
              style={{
                padding: '4px 10px',
                fontSize: '0.74rem',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Studio Grid: 18 Tables Explorer + SQL Editor */}
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: 18, marginBottom: 20 }}>
        {/* Left: 18 Tables Explorer */}
        <div
          className="panel"
          style={{
            padding: '14px',
            marginBottom: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '270px'
          }}
        >
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: '1px solid var(--bg-card-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Database size={14} color="var(--primary)" />
              <span>18 Database Tables</span>
            </div>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Live</span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {tablesList.map((table) => {
              const isSelected = selectedTable === table;
              const colCount = schemaMap[table]?.length;

              return (
                <button
                  key={table}
                  onClick={() => {
                    setSelectedTable(isSelected ? null : table);
                    setSql(`SELECT * FROM ${table} LIMIT 50;`);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '5px 8px',
                    borderRadius: '6px',
                    background: isSelected ? 'rgba(37, 99, 235, 0.18)' : 'transparent',
                    border: isSelected ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '0.78rem',
                    fontFamily: 'var(--font-mono)',
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
                  <span style={{ fontWeight: isSelected ? 700 : 500 }}>{table}</span>
                  {colCount !== undefined && (
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      {colCount} cols
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: SQL Editor Surface */}
        <div
          className="panel"
          style={{
            padding: '14px',
            marginBottom: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '270px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              paddingBottom: 8,
              borderBottom: '1px solid var(--bg-card-border)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              <Code2 size={14} color="var(--primary)" />
              <span>Interactive Query Studio (Neo4j AuraDB)</span>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSql('')}
                title="Clear editor"
              >
                <Trash2 size={12} />
                <span>Clear</span>
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleExecuteQuery}
                disabled={executing}
              >
                <Play size={12} />
                <span>{executing ? 'Executing...' : 'Run Query (Ctrl + Enter)'}</span>
              </button>
            </div>
          </div>

          <textarea
            className="sql-editor-box"
            style={{
              flex: 1,
              width: '100%',
              minHeight: 0,
              resize: 'none',
              background: '#070b14',
              border: '1px solid var(--bg-card-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.86rem',
              color: '#f8fafc',
              lineHeight: 1.5,
              outline: 'none'
            }}
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="SELECT * FROM STUDENT;"
            spellCheck="false"
          />
        </div>
      </div>

      {/* Query Execution Results Section (Unified Results & Status) */}
      {(result || errorInfo) && (
        <div
          className="table-container"
          style={{
            marginTop: 20,
            borderColor: errorInfo ? 'rgba(239, 68, 68, 0.35)' : 'var(--bg-card-border)'
          }}
        >
          {/* Header Area */}
          <div
            className="table-toolbar"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
              padding: '12px 18px',
              borderBottom: '1px solid var(--bg-card-border)',
              background: errorInfo ? 'rgba(239, 68, 68, 0.04)' : undefined
            }}
          >
            {/* LEFT: Title and Row Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Query Execution Results
              </h3>
              {errorInfo ? (
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(239, 68, 68, 0.14)',
                    color: '#ef4444',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  [FAILED]
                </span>
              ) : isSelectResult ? (
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(56, 189, 248, 0.14)',
                    color: '#38bdf8',
                    border: '1px solid rgba(56, 189, 248, 0.3)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  [{resultRows.length} ROW{resultRows.length === 1 ? '' : 'S'}]
                </span>
              ) : (
                <span
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(16, 185, 129, 0.14)',
                    color: '#10b981',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  [{result.changes !== undefined ? `${result.changes} ROW(S) AFFECTED` : 'SUCCESS'}]
                </span>
              )}
            </div>

            {/* RIGHT: Inline Execution Status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {errorInfo ? (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: '0.8rem',
                    color: '#ef4444',
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.25)'
                  }}
                >
                  <AlertCircle size={14} color="#ef4444" />
                  <span>Query failed</span>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: '0.8rem',
                      color: '#10b981',
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.25)'
                    }}
                  >
                    <CheckCircle2 size={14} color="#10b981" />
                    <span>Success</span>
                    <span style={{ color: 'var(--text-muted)' }}>·</span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      {isSelectResult ? `${resultRows.length} row(s)` : (result.changes !== undefined ? `${result.changes} row(s)` : 'Command OK')}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>·</span>
                    <span style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                      {result.executionTimeMs} ms
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Results Content Body */}
          {errorInfo ? (
            <div style={{ padding: '16px 20px', background: 'rgba(239, 68, 68, 0.04)' }}>
              <div style={{ color: '#fca5a5', fontFamily: 'var(--font-mono)', fontSize: '0.84rem', lineHeight: 1.5 }}>
                {errorInfo.message}
              </div>
            </div>
          ) : isSelectResult ? (
            <div className="data-table-wrapper" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
              <table className="data-table" style={{ width: 'max-content', minWidth: '100%' }}>
                <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                  <tr>
                    {resultCols.map((col) => (
                      <th key={col} style={{ whiteSpace: 'nowrap' }}>
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resultRows.length === 0 ? (
                    <tr>
                      <td colSpan={resultCols.length || 1} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                        Query returned 0 rows.
                      </td>
                    </tr>
                  ) : (
                    resultRows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {resultCols.map((col) => {
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
          ) : (
            <div style={{ padding: '24px 20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              {result.message || 'Statement executed successfully in database.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
