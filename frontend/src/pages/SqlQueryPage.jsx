import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Play,
  AlertCircle,
  CheckCircle2,
  Database,
  RefreshCw,
  Trash2,
  Code2,
  Network,
  ChevronDown,
  ChevronRight,
  Copy,
  Check,
  Table2,
  Layers,
  ShieldAlert
} from 'lucide-react';
import { api } from '../services/api';

const EXACT_18_TABLES = [
  'STUDENT',
  'HOSTEL',
  'ROOM',
  'ROOM_TYPE',
  'WARDEN',
  'MESS',
  'MEAL',
  'STAFF',
  'SUPPLIER',
  'INVENTORY_ITEM',
  'PROCURES',
  'PAYMENT',
  'PAYMENT_DETAIL',
  'STUDENT_PHONE',
  'WARDEN_PHONE',
  'STAFF_PHONE',
  'SUPPLIER_PHONE',
  'MESS_CONTACT'
];

const GRAPH_NODES = [
  { label: 'Student', alias: 's', key: 'studentId', query: 'SELECT * FROM Student;' },
  { label: 'Hostel', alias: 'h', key: 'hostelId', query: 'SELECT * FROM Hostel;' },
  { label: 'Room', alias: 'r', key: 'roomNo', query: 'SELECT * FROM Room;' },
  { label: 'RoomType', alias: 'rt', key: 'typeId', query: 'SELECT * FROM RoomType;' },
  { label: 'Warden', alias: 'w', key: 'wardenId', query: 'SELECT * FROM Warden;' },
  { label: 'Mess', alias: 'm', key: 'messId', query: 'SELECT * FROM Mess;' },
  { label: 'Meal', alias: 'ml', key: 'mealId', query: 'SELECT * FROM Meal;' },
  { label: 'Staff', alias: 'st', key: 'staffId', query: 'SELECT * FROM Staff;' },
  { label: 'Supplier', alias: 'sup', key: 'supplierId', query: 'SELECT * FROM Supplier;' },
  { label: 'InventoryItem', alias: 'i', key: 'itemId', query: 'SELECT * FROM InventoryItem;' },
  { label: 'Procurement', alias: 'p', key: 'procureId', query: 'SELECT * FROM Procurement;' },
  { label: 'Payment', alias: 'pay', key: 'paymentId', query: 'SELECT * FROM Payment;' },
  { label: 'PaymentDetail', alias: 'pd', key: 'id', query: 'SELECT * FROM PaymentDetail;' }
];

const GRAPH_RELATIONSHIPS = [
  {
    type: 'ALLOCATED_TO',
    source: 'Student',
    target: 'Room',
    desc: 'Student assigned to bed/room',
    query: 'SELECT s.firstName, s.lastName, r.roomNo, r.type FROM Student s JOIN Room r ON s.roomNo = r.roomNo;'
  },
  {
    type: 'RESIDES_IN',
    source: 'Student',
    target: 'Hostel',
    desc: 'Resident assigned to hostel tower',
    query: 'SELECT s.firstName, s.lastName, h.name AS hostel FROM Student s JOIN Hostel h ON s.hostelId = h.hostelId;'
  },
  {
    type: 'ENROLLED_IN',
    source: 'Student',
    target: 'Mess',
    desc: 'Student dining subscription',
    query: 'SELECT s.firstName, s.lastName, m.name AS messName FROM Student s JOIN Mess m ON s.messId = m.messId;'
  },
  {
    type: 'MENTORED_BY',
    source: 'Student',
    target: 'Student',
    desc: 'Senior student mentor guidance',
    query: 'SELECT s1.firstName AS mentee, s2.firstName AS mentor FROM Student s1 JOIN Student s2 ON s1.mentorStudentId = s2.studentId;'
  },
  {
    type: 'MANAGED_BY',
    source: 'Hostel',
    target: 'Warden',
    desc: 'Hostel block supervised by Warden',
    query: 'SELECT h.name AS hostel, w.name AS warden, w.email FROM Hostel h JOIN Warden w ON h.wardenId = w.wardenId;'
  },
  {
    type: 'LOCATED_IN',
    source: 'Room',
    target: 'Hostel',
    desc: 'Room situated inside hostel building',
    query: 'SELECT r.roomNo, r.floorNo, h.name AS hostel FROM Room r JOIN Hostel h ON r.hostelId = h.hostelId;'
  },
  {
    type: 'OF_TYPE',
    source: 'Room',
    target: 'RoomType',
    desc: 'Room categorized by amenities',
    query: 'SELECT r.roomNo, rt.typeName, rt.acType, r.roomRent FROM Room r JOIN RoomType rt ON r.type = rt.typeName;'
  },
  {
    type: 'SERVED_IN',
    source: 'Meal',
    target: 'Mess',
    desc: 'Meal served at dining facility',
    query: 'SELECT ml.name AS meal, ml.cost, m.name AS mess FROM Meal ml JOIN Mess m ON ml.messId = m.messId;'
  },
  {
    type: 'ASSIGNED_TO',
    source: 'Staff',
    target: 'Mess',
    desc: 'Workforce assigned to dining facility',
    query: 'SELECT st.name AS staffName, st.role, m.name AS messName FROM Staff st JOIN Mess m ON st.messId = m.messId;'
  },
  {
    type: 'PLACED_ORDER',
    source: 'Mess',
    target: 'Procurement',
    desc: 'Mess purchasing provision stock',
    query: 'SELECT m.name AS mess, p.quantity, p.itemId FROM Mess m JOIN Procurement p ON m.messId = p.messId;'
  },
  {
    type: 'SUPPLIED_BY',
    source: 'Procurement',
    target: 'Supplier',
    desc: 'Vendor fulfilling supply order',
    query: 'SELECT p.procureId, p.quantity, sup.name AS supplier FROM Procurement p JOIN Supplier sup ON p.supplierId = sup.supplierId;'
  },
  {
    type: 'INCLUDES_ITEM',
    source: 'Procurement',
    target: 'InventoryItem',
    desc: 'Stock item included in procurement',
    query: 'SELECT p.procureId, i.name AS itemName, i.unit, p.quantity FROM Procurement p JOIN InventoryItem i ON p.itemId = i.itemId;'
  },
  {
    type: 'PAID_BY',
    source: 'Payment',
    target: 'Student',
    desc: 'Fee transaction billed to resident',
    query: 'SELECT p.paymentId, p.amount, p.status, s.firstName, s.lastName FROM Payment p JOIN Student s ON p.studentId = s.studentId;'
  },
  {
    type: 'HAS_DETAIL',
    source: 'Payment',
    target: 'PaymentDetail',
    desc: 'Fee sub-ledger billing breakdown',
    query: 'SELECT p.paymentId, pd.month, pd.year, pd.messCharges, pd.otherCharges FROM Payment p JOIN PaymentDetail pd ON p.paymentId = pd.paymentId;'
  }
];

const SQL_CATEGORIES = [
  'All',
  'Basic SELECT',
  'Filtering (WHERE)',
  'Joins & Relations',
  'Aggregations',
  'INSERT',
  'UPDATE',
  'DELETE'
];

const QUICK_COMMANDS = [
  // Basic SELECT
  {
    category: 'Basic SELECT',
    label: 'SELECT * FROM Student',
    sql: 'SELECT * FROM Student;'
  },
  {
    category: 'Basic SELECT',
    label: 'SELECT * FROM Hostel',
    sql: 'SELECT * FROM Hostel;'
  },
  {
    category: 'Basic SELECT',
    label: 'SELECT * FROM Room',
    sql: 'SELECT * FROM Room;'
  },
  {
    category: 'Basic SELECT',
    label: 'SELECT * FROM Warden',
    sql: 'SELECT * FROM Warden;'
  },
  {
    category: 'Basic SELECT',
    label: 'SELECT * FROM Mess',
    sql: 'SELECT * FROM Mess;'
  },
  {
    category: 'Basic SELECT',
    label: 'SELECT * FROM Payment',
    sql: 'SELECT * FROM Payment;'
  },
  {
    category: 'Basic SELECT',
    label: 'SELECT * FROM STUDENT_PHONE',
    sql: 'SELECT * FROM STUDENT_PHONE;'
  },

  // Filtering (WHERE)
  {
    category: 'Filtering (WHERE)',
    label: 'Male Students',
    sql: "SELECT firstName, lastName, roomNo FROM Student WHERE gender = 'Male';"
  },
  {
    category: 'Filtering (WHERE)',
    label: 'Budget Rooms (Rent <= 8000)',
    sql: 'SELECT roomNo, floorNo, type, roomRent FROM Room WHERE roomRent <= 8000 ORDER BY roomRent ASC;'
  },
  {
    category: 'Filtering (WHERE)',
    label: 'Rent Between 5k and 10k',
    sql: 'SELECT roomNo, floorNo, type, roomRent FROM Room WHERE roomRent BETWEEN 5000 AND 10000;'
  },
  {
    category: 'Filtering (WHERE)',
    label: 'Student Name LIKE "Rah%"',
    sql: "SELECT studentId, firstName, lastName, email FROM Student WHERE firstName LIKE 'Rah%';"
  },
  {
    category: 'Filtering (WHERE)',
    label: 'Null Email Checks',
    sql: 'SELECT studentId, firstName, lastName, email FROM Student WHERE email IS NOT NULL;'
  },

  // Joins & Relations
  {
    category: 'Joins & Relations',
    label: 'Student & Room (INNER JOIN)',
    sql: 'SELECT s.firstName, r.roomNo FROM Student s JOIN Room r ON s.roomNo = r.roomNo;'
  },
  {
    category: 'Joins & Relations',
    label: 'Student & Hostel Allocation',
    sql: 'SELECT s.firstName, s.lastName, h.name AS hostel FROM Student s JOIN Hostel h ON s.hostelId = h.hostelId;'
  },
  {
    category: 'Joins & Relations',
    label: 'Hostel & Wardens',
    sql: 'SELECT h.name AS hostel, w.name AS warden, w.email FROM Hostel h JOIN Warden w ON h.wardenId = w.wardenId;'
  },
  {
    category: 'Joins & Relations',
    label: 'Student & Mess Subscription',
    sql: 'SELECT s.firstName, s.lastName, m.name AS messName FROM Student s JOIN Mess m ON s.messId = m.messId;'
  },
  {
    category: 'Joins & Relations',
    label: 'Student Left Join Room',
    sql: 'SELECT s.firstName, s.studentId, r.roomNo, r.type FROM Student s LEFT JOIN Room r ON s.roomNo = r.roomNo;'
  },
  {
    category: 'Joins & Relations',
    label: 'Multi-Join: Student + Room + Hostel',
    sql: 'SELECT s.firstName, s.lastName, r.roomNo, h.name AS hostel FROM Student s JOIN Room r ON s.roomNo = r.roomNo JOIN Hostel h ON r.hostelId = h.hostelId;'
  },

  // Aggregations
  {
    category: 'Aggregations',
    label: 'Count Students by Gender',
    sql: 'SELECT gender, COUNT(*) AS total FROM Student GROUP BY gender;'
  },
  {
    category: 'Aggregations',
    label: 'Payments Total by Status',
    sql: 'SELECT status, COUNT(*) AS count, SUM(amount) AS totalAmount, ROUND(AVG(amount), 2) AS avgAmount FROM Payment GROUP BY status;'
  },
  {
    category: 'Aggregations',
    label: 'Average Rent by Room Type',
    sql: 'SELECT r.type, COUNT(*) AS roomCount, AVG(r.roomRent) AS avgRent FROM Room r GROUP BY r.type ORDER BY avgRent DESC;'
  },

  // INSERT
  {
    category: 'INSERT',
    label: 'INSERT Student Record',
    sql: "INSERT INTO Student (studentId, firstName, lastName, gender) VALUES ('S1099', 'Arun', 'Kumar', 'Male');"
  },

  // UPDATE
  {
    category: 'UPDATE',
    label: 'UPDATE Student Plan',
    sql: "UPDATE Student SET gender = 'Male' WHERE studentId = 'S1002';"
  },

  // DELETE
  {
    category: 'DELETE',
    label: 'DELETE Student by ID',
    sql: "DELETE FROM Student WHERE studentId = 'S1099';"
  }
];

function formatCellValue(val) {
  if (val === null || val === undefined) {
    return <span style={{ color: '#f87171', fontStyle: 'italic', fontSize: '0.75rem', fontWeight: 600 }}>NULL</span>;
  }
  if (typeof val === 'boolean') {
    return (
      <span style={{ color: val ? '#10b981' : '#ef4444', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
        {String(val)}
      </span>
    );
  }
  if (typeof val === 'number') {
    return <span style={{ color: '#10b981', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{val}</span>;
  }
  if (Array.isArray(val)) {
    if (val.length === 0) {
      return <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>[]</span>;
    }
    const allPrimitives = val.every((item) => typeof item !== 'object' || item === null);
    if (allPrimitives) {
      return (
        <span style={{ fontFamily: 'var(--font-mono)', color: '#38bdf8' }}>
          [{val.map((item) => (item === null ? 'null' : typeof item === 'string' ? `"${item}"` : String(item))).join(', ')}]
        </span>
      );
    }
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {val.map((item, idx) => (
          <div key={idx} style={{ padding: '2px 0' }}>
            {formatCellValue(item)}
          </div>
        ))}
      </div>
    );
  }
  if (typeof val === 'object') {
    const labels = val._labels || val.__labels;
    const relType = val._relType || val.__relType;
    const displayKeys = Object.keys(val).filter((k) => !k.startsWith('_') && !k.startsWith('__'));

    if (displayKeys.length === 0 && !labels && !relType) {
      return <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>&#123;&#125;</span>;
    }

    return (
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.75rem',
          color: '#e2e8f0',
          background: 'rgba(15, 23, 42, 0.75)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '6px',
          padding: '8px 10px',
          minWidth: '220px',
          maxWidth: '460px',
          lineHeight: 1.5,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.25)'
        }}
      >
        {(labels || relType) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 6,
              paddingBottom: 4,
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            {labels && Array.isArray(labels) && labels.map((lbl) => (
              <span
                key={lbl}
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#38bdf8',
                  background: 'rgba(56, 189, 248, 0.15)',
                  border: '1px solid rgba(56, 189, 248, 0.35)',
                  borderRadius: '4px',
                  padding: '1px 5px'
                }}
              >
                :{lbl}
              </span>
            ))}
            {relType && (
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  color: '#a855f7',
                  background: 'rgba(168, 85, 247, 0.15)',
                  border: '1px solid rgba(168, 85, 247, 0.35)',
                  borderRadius: '4px',
                  padding: '1px 5px'
                }}
              >
                [:{relType}]
              </span>
            )}
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '3px 8px' }}>
          {displayKeys.slice(0, 8).map((k) => (
            <React.Fragment key={k}>
              <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{k}:</span>
              <span style={{ color: '#f8fafc', wordBreak: 'break-all', fontSize: '0.72rem' }}>
                {val[k] === null ? 'null' : String(val[k])}
              </span>
            </React.Fragment>
          ))}
          {displayKeys.length > 8 && (
            <span style={{ gridColumn: 'span 2', color: '#64748b', fontSize: '0.68rem', fontStyle: 'italic' }}>
              +{displayKeys.length - 8} more properties...
            </span>
          )}
        </div>
      </div>
    );
  }
  return String(val);
}

function processResultRecords(resultData) {
  if (!resultData) return { columns: [], rows: [] };

  if (Array.isArray(resultData.columns) && Array.isArray(resultData.rows)) {
    return {
      columns: resultData.columns,
      rows: resultData.rows
    };
  }

  const rawRows = resultData.rows || resultData.data || [];
  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    return { columns: [], rows: [] };
  }

  const first = rawRows[0];
  const keys = Object.keys(first);
  return { columns: keys, rows: rawRows };
}

export default function SqlQueryPage({ showToast }) {
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM Student;');
  const [activeCategory, setActiveCategory] = useState('All');
  const [schemaTab, setSchemaTab] = useState('tables'); // 'tables' | 'nodes' | 'relationships'
  const [selectedItem, setSelectedItem] = useState('Student');
  const [schemaMap, setSchemaMap] = useState({});
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [showCypherPanel, setShowCypherPanel] = useState(true);
  const [copiedCypher, setCopiedCypher] = useState(false);

  useEffect(() => {
    loadSchema();
  }, []);

  const loadSchema = async () => {
    try {
      const data = await api.getSqlSchema();
      if (data && data.tables) {
        setSchemaMap(data.tables);
      }
    } catch (err) {
      console.warn('Failed to fetch schema metadata:', err.message);
    }
  };

  const handleExecuteQuery = async () => {
    const trimmed = (sqlQuery || '').trim();
    if (!trimmed) {
      if (showToast) showToast('Query cannot be empty.', 'warning');
      return;
    }

    // Safety guard against unintentional broad DELETE
    if (/^\s*DELETE\s+FROM\s+[A-Za-z0-9_]+\s*;?\s*$/i.test(trimmed)) {
      const confirmAll = window.confirm(
        'CAUTION: You are about to run a DELETE statement without a WHERE condition, which will remove ALL records from the table. Are you sure you want to proceed?'
      );
      if (!confirmAll) return;
    }

    setExecuting(true);
    setErrorInfo(null);
    setResult(null);

    try {
      const resp = await api.executeSqlQuery(trimmed);
      setResult(resp);
      setShowCypherPanel(true);
      if (showToast) {
        if (resp.type === 'WRITE') {
          showToast(`SQL executed successfully (${resp.changes || 1} change${resp.changes === 1 ? '' : 's'})`, 'success');
        } else {
          showToast(`Query completed: ${resp.count || 0} record(s)`, 'success');
        }
      }
    } catch (err) {
      console.error('SQL Studio Execution Error:', err);
      const msg = err.data?.message || err.data?.error || err.message || 'Execution failed';
      setErrorInfo({ message: msg });
      if (showToast) showToast(`Query Error: ${msg}`, 'error');
    } finally {
      setExecuting(false);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleExecuteQuery();
    }
  };

  const handleCopyCypher = () => {
    if (!result?.generatedCypher && !result?.cypher) return;
    const text = result.generatedCypher || result.cypher;
    navigator.clipboard.writeText(text);
    setCopiedCypher(true);
    setTimeout(() => setCopiedCypher(false), 2000);
  };

  const { columns: resultCols, rows: resultRows } = processResultRecords(result);
  const isSelectResult = result && Array.isArray(resultRows) && (resultRows.length > 0 || (resultCols && resultCols.length > 0));
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
            <div>
              <h2 style={{ margin: 0 }}>SQL Studio</h2>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Write standard SQL queries with real-time translation & execution against Neo4j AuraDB
              </p>
            </div>
          </div>
        </div>

        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={loadSchema}>
            <RefreshCw size={13} />
            <span>Refresh Schema</span>
          </button>
        </div>
      </div>

      {/* SQL Snippet Categories Toolbar */}
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

        {/* Quick SQL Action Chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {filteredCommands.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setSqlQuery(q.sql)}
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

      {/* Main Studio Grid: SQL Schema Explorer + SQL Editor */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 18, marginBottom: 20 }}>
        {/* Left: SQL Schema & Relational Explorer */}
        <div
          className="panel"
          style={{
            padding: '14px',
            marginBottom: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '280px'
          }}
        >
          {/* Header & Live Badge */}
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-secondary)',
              marginBottom: 8,
              paddingBottom: 6,
              borderBottom: '1px solid var(--bg-card-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Database size={14} color="var(--primary)" />
              <span>SQL Schema</span>
            </div>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>AuraDB Live</span>
          </div>

          {/* Subtabs: Tables / Nodes / Relationships */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--bg-card-border)' }}>
            <button
              type="button"
              onClick={() => setSchemaTab('tables')}
              style={{
                flex: 1,
                padding: '3px 6px',
                fontSize: '0.70rem',
                fontWeight: schemaTab === 'tables' ? 700 : 500,
                borderRadius: '4px',
                background: schemaTab === 'tables' ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                color: schemaTab === 'tables' ? '#38bdf8' : 'var(--text-muted)',
                border: schemaTab === 'tables' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              SQL Tables ({tablesList.length})
            </button>
            <button
              type="button"
              onClick={() => setSchemaTab('nodes')}
              style={{
                flex: 1,
                padding: '3px 6px',
                fontSize: '0.70rem',
                fontWeight: schemaTab === 'nodes' ? 700 : 500,
                borderRadius: '4px',
                background: schemaTab === 'nodes' ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                color: schemaTab === 'nodes' ? '#38bdf8' : 'var(--text-muted)',
                border: schemaTab === 'nodes' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              Nodes ({GRAPH_NODES.length})
            </button>
            <button
              type="button"
              onClick={() => setSchemaTab('relationships')}
              style={{
                flex: 1,
                padding: '3px 6px',
                fontSize: '0.70rem',
                fontWeight: schemaTab === 'relationships' ? 700 : 500,
                borderRadius: '4px',
                background: schemaTab === 'relationships' ? 'rgba(37, 99, 235, 0.2)' : 'transparent',
                color: schemaTab === 'relationships' ? '#38bdf8' : 'var(--text-muted)',
                border: schemaTab === 'relationships' ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                cursor: 'pointer'
              }}
            >
              Joins ({GRAPH_RELATIONSHIPS.length})
            </button>
          </div>

          {/* List items based on schemaTab */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {schemaTab === 'tables' && (
              tablesList.map((table) => {
                const isSelected = selectedItem === table;
                const colCount = schemaMap[table]?.length;
                return (
                  <button
                    key={table}
                    onClick={() => {
                      setSelectedItem(table);
                      setSqlQuery(`SELECT * FROM ${table};`);
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
                  >
                    <span style={{ fontWeight: isSelected ? 700 : 500 }}>{table}</span>
                    {colCount !== undefined && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        {colCount} cols
                      </span>
                    )}
                  </button>
                );
              })
            )}

            {schemaTab === 'nodes' && (
              GRAPH_NODES.map((node) => {
                const isSelected = selectedItem === node.label;
                return (
                  <button
                    key={node.label}
                    onClick={() => {
                      setSelectedItem(node.label);
                      setSqlQuery(node.query);
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
                  >
                    <span style={{ fontWeight: isSelected ? 700 : 500 }}>:{node.label}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      id: {node.key}
                    </span>
                  </button>
                );
              })
            )}

            {schemaTab === 'relationships' && (
              GRAPH_RELATIONSHIPS.map((rel) => {
                const isSelected = selectedItem === rel.type;
                return (
                  <button
                    key={rel.type}
                    onClick={() => {
                      setSelectedItem(rel.type);
                      setSqlQuery(rel.query);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      background: isSelected ? 'rgba(37, 99, 235, 0.18)' : 'transparent',
                      border: isSelected ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      fontSize: '0.75rem',
                      fontFamily: 'var(--font-mono)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease'
                    }}
                    title={rel.desc}
                  >
                    <span style={{ fontWeight: isSelected ? 700 : 500, color: '#38bdf8' }}>
                      [:{rel.type}]
                    </span>
                    <span style={{ fontSize: '0.66rem', color: 'var(--text-muted)' }}>
                      {rel.source}➔{rel.target}
                    </span>
                  </button>
                );
              })
            )}
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
            height: '280px'
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
              <span>SQL Query Editor (Neo4j AuraDB)</span>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSqlQuery('')}
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
                <span>{executing ? 'Translating & Executing...' : 'Run Query (Ctrl + Enter)'}</span>
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
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="-- Write standard SQL queries&#10;SELECT s.firstName, r.roomNo&#10;FROM Student s&#10;JOIN Room r ON s.roomNo = r.roomNo&#10;WHERE s.gender = 'Male';"
            spellCheck="false"
          />
        </div>
      </div>

      {/* Collapsible "Generated Cypher" Transparency Section */}
      {result && (result.generatedCypher || result.cypher) && (
        <div
          className="panel"
          style={{
            marginBottom: 20,
            padding: '12px 16px',
            background: 'rgba(15, 23, 42, 0.65)',
            borderColor: 'rgba(56, 189, 248, 0.25)'
          }}
        >
          <div
            onClick={() => setShowCypherPanel(!showCypherPanel)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {showCypherPanel ? <ChevronDown size={16} color="#38bdf8" /> : <ChevronRight size={16} color="#38bdf8" />}
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Generated Cypher
              </span>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: 'rgba(56, 189, 248, 0.15)',
                  color: '#38bdf8',
                  border: '1px solid rgba(56, 189, 248, 0.3)'
                }}
              >
                Auto-Translated & Parameterized
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                {result.executionTimeMs} ms
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyCypher();
                }}
                style={{ padding: '3px 8px', fontSize: '0.70rem' }}
                title="Copy generated Cypher to clipboard"
              >
                {copiedCypher ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                <span>{copiedCypher ? 'Copied' : 'Copy Cypher'}</span>
              </button>
            </div>
          </div>

          {showCypherPanel && (
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <pre
                style={{
                  margin: 0,
                  padding: '10px 12px',
                  background: '#070b14',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.80rem',
                  color: '#38bdf8',
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.45
                }}
              >
                {result.generatedCypher || result.cypher}
              </pre>

              {result.params && Object.keys(result.params).length > 0 && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.72rem' }}>
                  <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Parameters:</span>
                  <code style={{ color: '#a855f7', fontFamily: 'var(--font-mono)' }}>
                    {JSON.stringify(result.params)}
                  </code>
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
                  [{resultRows.length} RECORD{resultRows.length === 1 ? '' : 'S'}]
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
                  [{result.changes !== undefined ? `${result.changes} CHANGE(S)` : 'SUCCESS'}]
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
                    {isSelectResult ? `${resultRows.length} record(s)` : (result.changes !== undefined ? `${result.changes} change(s)` : 'Command OK')}
                  </span>
                  <span style={{ color: 'var(--text-muted)' }}>·</span>
                  <span style={{ color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                    {result.executionTimeMs} ms
                  </span>
                </div>
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
                        Query returned 0 records.
                      </td>
                    </tr>
                  ) : (
                    resultRows.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {resultCols.map((col) => {
                          const val = row[col];
                          return (
                            <td
                              key={col}
                              style={{
                                verticalAlign: 'top',
                                whiteSpace: typeof val === 'object' && val !== null ? 'normal' : 'nowrap'
                              }}
                            >
                              {formatCellValue(val)}
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
              {result.message || 'SQL statement executed successfully in Neo4j database.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
