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
  { label: 'Student', alias: 's', key: 'studentId', query: 'MATCH (s:Student)\nRETURN s;' },
  { label: 'Hostel', alias: 'h', key: 'hostelId', query: 'MATCH (h:Hostel)\nRETURN h;' },
  { label: 'Room', alias: 'r', key: 'roomNo', query: 'MATCH (r:Room)\nRETURN r;' },
  { label: 'RoomType', alias: 'rt', key: 'typeId', query: 'MATCH (rt:RoomType)\nRETURN rt;' },
  { label: 'Warden', alias: 'w', key: 'wardenId', query: 'MATCH (w:Warden)\nRETURN w;' },
  { label: 'Mess', alias: 'm', key: 'messId', query: 'MATCH (m:Mess)\nRETURN m;' },
  { label: 'Meal', alias: 'ml', key: 'mealId', query: 'MATCH (ml:Meal)\nRETURN ml;' },
  { label: 'Staff', alias: 'st', key: 'staffId', query: 'MATCH (st:Staff)\nRETURN st;' },
  { label: 'Supplier', alias: 'sup', key: 'supplierId', query: 'MATCH (sup:Supplier)\nRETURN sup;' },
  { label: 'InventoryItem', alias: 'i', key: 'itemId', query: 'MATCH (i:InventoryItem)\nRETURN i;' },
  { label: 'Procurement', alias: 'p', key: 'procureId', query: 'MATCH (p:Procurement)\nRETURN p;' },
  { label: 'Payment', alias: 'pay', key: 'paymentId', query: 'MATCH (pay:Payment)\nRETURN pay;' },
  { label: 'PaymentDetail', alias: 'pd', key: 'id', query: 'MATCH (pd:PaymentDetail)\nRETURN pd;' }
];

const GRAPH_RELATIONSHIPS = [
  {
    type: 'ALLOCATED_TO',
    source: 'Student',
    target: 'Room',
    desc: 'Student assigned to bed/room',
    query: 'MATCH (s:Student)-[:ALLOCATED_TO]->(r:Room)\nRETURN s, r;'
  },
  {
    type: 'RESIDES_IN',
    source: 'Student',
    target: 'Hostel',
    desc: 'Resident assigned to hostel tower',
    query: 'MATCH (s:Student)-[:RESIDES_IN]->(h:Hostel)\nRETURN s, h;'
  },
  {
    type: 'ENROLLED_IN',
    source: 'Student',
    target: 'Mess',
    desc: 'Student dining subscription',
    query: 'MATCH (s:Student)-[:ENROLLED_IN]->(m:Mess)\nRETURN s, m;'
  },
  {
    type: 'MENTORED_BY',
    source: 'Student',
    target: 'Student',
    desc: 'Senior student mentor guidance',
    query: 'MATCH (s:Student)-[:MENTORED_BY]->(mentor:Student)\nRETURN s, mentor;'
  },
  {
    type: 'MANAGED_BY',
    source: 'Hostel',
    target: 'Warden',
    desc: 'Hostel block supervised by Warden',
    query: 'MATCH (h:Hostel)-[:MANAGED_BY]->(w:Warden)\nRETURN h, w;'
  },
  {
    type: 'LOCATED_IN',
    source: 'Room',
    target: 'Hostel',
    desc: 'Room situated inside hostel building',
    query: 'MATCH (r:Room)-[:LOCATED_IN]->(h:Hostel)\nRETURN r, h;'
  },
  {
    type: 'OF_TYPE',
    source: 'Room',
    target: 'RoomType',
    desc: 'Room categorized by amenities',
    query: 'MATCH (r:Room)-[:OF_TYPE]->(rt:RoomType)\nRETURN r, rt;'
  },
  {
    type: 'SERVED_IN',
    source: 'Meal',
    target: 'Mess',
    desc: 'Meal served at dining facility',
    query: 'MATCH (ml:Meal)-[:SERVED_IN]->(m:Mess)\nRETURN ml, m;'
  },
  {
    type: 'ASSIGNED_TO',
    source: 'Staff',
    target: 'Mess',
    desc: 'Workforce assigned to dining facility',
    query: 'MATCH (st:Staff)-[:ASSIGNED_TO]->(m:Mess)\nRETURN st, m;'
  },
  {
    type: 'PLACED_ORDER',
    source: 'Mess',
    target: 'Procurement',
    desc: 'Mess purchasing provision stock',
    query: 'MATCH (m:Mess)-[:PLACED_ORDER]->(p:Procurement)\nRETURN m, p;'
  },
  {
    type: 'SUPPLIED_BY',
    source: 'Procurement',
    target: 'Supplier',
    desc: 'Vendor fulfilling supply order',
    query: 'MATCH (p:Procurement)-[:SUPPLIED_BY]->(sup:Supplier)\nRETURN p, sup;'
  },
  {
    type: 'INCLUDES_ITEM',
    source: 'Procurement',
    target: 'InventoryItem',
    desc: 'Stock item included in procurement',
    query: 'MATCH (p:Procurement)-[:INCLUDES_ITEM]->(i:InventoryItem)\nRETURN p, i;'
  },
  {
    type: 'PAID_BY',
    source: 'Payment',
    target: 'Student',
    desc: 'Fee transaction billed to resident',
    query: 'MATCH (p:Payment)-[:PAID_BY]->(s:Student)\nRETURN p, s;'
  },
  {
    type: 'HAS_DETAIL',
    source: 'Payment',
    target: 'PaymentDetail',
    desc: 'Fee sub-ledger billing breakdown',
    query: 'MATCH (p:Payment)-[:HAS_DETAIL]->(pd:PaymentDetail)\nRETURN p, pd;'
  }
];

const TABLE_CYPHER_MAP = {
  STUDENT: 'MATCH (s:Student)\nRETURN s;',
  HOSTEL: 'MATCH (h:Hostel)\nRETURN h;',
  ROOM: 'MATCH (r:Room)\nRETURN r;',
  ROOM_TYPE: 'MATCH (rt:RoomType)\nRETURN rt;',
  WARDEN: 'MATCH (w:Warden)\nRETURN w;',
  MESS: 'MATCH (m:Mess)\nRETURN m;',
  MEAL: 'MATCH (ml:Meal)\nRETURN ml;',
  STAFF: 'MATCH (st:Staff)\nRETURN st;',
  SUPPLIER: 'MATCH (sup:Supplier)\nRETURN sup;',
  INVENTORY_ITEM: 'MATCH (i:InventoryItem)\nRETURN i;',
  PROCUREMENT: 'MATCH (p:Procurement)\nRETURN p;',
  PROCURES: 'MATCH (p:Procurement)\nRETURN p;',
  PAYMENT: 'MATCH (pay:Payment)\nRETURN pay;',
  PAYMENT_DETAIL: 'MATCH (pd:PaymentDetail)\nRETURN pd;',
  STUDENT_PHONE: 'MATCH (s:Student)\nUNWIND s.phones AS phone\nRETURN s.studentId AS studentId, phone;',
  WARDEN_PHONE: 'MATCH (w:Warden)\nUNWIND w.phones AS phone\nRETURN w.wardenId AS wardenId, phone;',
  STAFF_PHONE: 'MATCH (st:Staff)\nUNWIND st.phones AS phone\nRETURN st.staffId AS staffId, phone;',
  SUPPLIER_PHONE: 'MATCH (sup:Supplier)\nUNWIND sup.phones AS phone\nRETURN sup.supplierId AS supplierId, phone;',
  MESS_CONTACT: 'MATCH (m:Mess)\nUNWIND m.contacts AS contact\nRETURN m.messId AS messId, contact;'
};

const CYPHER_CATEGORIES = [
  'All',
  'MATCH',
  'Relationships',
  'Aggregation',
  'Create / Update',
  'Delete'
];

const QUICK_COMMANDS = [
  // MATCH
  {
    category: 'MATCH',
    label: 'Basic MATCH',
    cypher: 'MATCH (s:Student)\nRETURN s;'
  },
  {
    category: 'MATCH',
    label: 'Hostels & Wardens',
    cypher: 'MATCH (h:Hostel)\nRETURN h.hostelId AS hostelId, h.name AS name, h.totalFloors AS floors\nORDER BY h.hostelId ASC;'
  },
  {
    category: 'MATCH',
    label: 'Wardens & Contact',
    cypher: 'MATCH (w:Warden)\nRETURN w.wardenId AS id, w.name AS name, w.email AS email, w.phones AS phones;'
  },
  {
    category: 'MATCH',
    label: 'Mess Facilities',
    cypher: 'MATCH (m:Mess)\nRETURN m.messId AS id, m.name AS name, m.messType AS type, m.location AS location;'
  },

  // Relationships
  {
    category: 'Relationships',
    label: 'Students and rooms',
    cypher: 'MATCH (s:Student)-[:ALLOCATED_TO]->(r:Room)\nRETURN s, r;'
  },
  {
    category: 'Relationships',
    label: 'Hostel and warden',
    cypher: 'MATCH (h:Hostel)-[:MANAGED_BY]->(w:Warden)\nRETURN h, w;'
  },
  {
    category: 'Relationships',
    label: 'Students and mess',
    cypher: 'MATCH (s:Student)-[:ENROLLED_IN]->(m:Mess)\nRETURN s, m;'
  },
  {
    category: 'Relationships',
    label: 'Payments',
    cypher: 'MATCH (p:Payment)-[:PAID_BY]->(s:Student)\nRETURN p, s;'
  },
  {
    category: 'Relationships',
    label: 'Procurement',
    cypher: 'MATCH (p:Procurement)-[:SUPPLIED_BY]->(sup:Supplier)\nRETURN p, sup;'
  },
  {
    category: 'Relationships',
    label: 'Senior Mentors',
    cypher: "MATCH (junior:Student)-[:MENTORED_BY]->(senior:Student)\nRETURN junior.firstName + ' ' + junior.lastName AS mentee, senior.firstName + ' ' + senior.lastName AS mentor;"
  },

  // Aggregation
  {
    category: 'Aggregation',
    label: 'Hostel Resident Count',
    cypher: 'MATCH (s:Student)-[:RESIDES_IN]->(h:Hostel)\nRETURN h, count(s) AS student_count;'
  },
  {
    category: 'Aggregation',
    label: 'Payment Totals by Status',
    cypher: 'MATCH (p:Payment)\nRETURN p.status AS status, count(p) AS count, sum(p.amount) AS totalAmount, round(avg(p.amount), 2) AS avgAmount;'
  },
  {
    category: 'Aggregation',
    label: 'Room Rent by Type',
    cypher: 'MATCH (r:Room)-[:OF_TYPE]->(rt:RoomType)\nRETURN rt.typeName AS roomType, count(r) AS roomsCount, avg(r.roomRent) AS avgRent\nORDER BY avgRent DESC;'
  },
  {
    category: 'Aggregation',
    label: 'Staff Payroll by Mess',
    cypher: 'MATCH (st:Staff)-[:ASSIGNED_TO]->(m:Mess)\nRETURN m.name AS mess, count(st) AS staffCount, sum(st.salary) AS totalPayroll;'
  },

  // Create / Update
  {
    category: 'Create / Update',
    label: 'CREATE AuditLog Node',
    cypher: "// Create temporary test audit entry\nCREATE (a:AuditLog {logId: 'AUDIT-' + toString(timestamp()), event: 'QueryStudioTest', createdAt: datetime()})\nRETURN a;"
  },
  {
    category: 'Create / Update',
    label: 'SET Node Property',
    cypher: "// Update verification date on warden\nMATCH (w:Warden {wardenId: 'W101'})\nSET w.lastVerified = date()\nRETURN w.wardenId AS id, w.name AS name, w.lastVerified AS verifiedDate;"
  },

  // Delete
  {
    category: 'Delete',
    label: 'DELETE Test AuditLog',
    cypher: "// Clean up test audit entries\nMATCH (a:AuditLog)\nWHERE a.event = 'QueryStudioTest'\nDELETE a;"
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
  const [sqlQuery, setSqlQuery] = useState('MATCH (s:Student)\nRETURN s;');
  const [activeCategory, setActiveCategory] = useState('All');
  const [schemaTab, setSchemaTab] = useState('nodes'); // 'nodes' | 'relationships' | 'tables'
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
    if (/^\s*DELETE\s+FROM\s+[A-Za-z0-9_]+\s*;?\s*$/i.test(trimmed) || /^\s*MATCH\s*\([a-zA-Z0-9_:]+\)\s*(?:DETACH\s+)?DELETE\s+[a-zA-Z0-9_]+\s*;?\s*$/i.test(trimmed)) {
      const confirmAll = window.confirm(
        'CAUTION: You are about to run a DELETE statement without a WHERE condition, which will remove ALL matching nodes/records. Are you sure you want to proceed?'
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
          showToast(`Statement executed successfully (${resp.changes || 1} change${resp.changes === 1 ? '' : 's'})`, 'success');
        } else {
          showToast(`Query completed: ${resp.count || 0} record(s)`, 'success');
        }
      }
    } catch (err) {
      console.error('Cypher Studio Execution Error:', err);
      const msg = err.data?.message || err.data?.error || err.message || 'Execution failed';
      const errorType = err.data?.errorType || 'EXECUTION_ERROR';
      const originalQuery = err.data?.originalQuery || err.data?.sql || err.data?.cypher || trimmed;
      const generatedCypher = err.data?.generatedCypher || err.data?.cypher || null;
      setErrorInfo({
        message: msg,
        errorType,
        originalQuery,
        generatedCypher,
        status: 'FAILED'
      });
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
              <h2 style={{ margin: 0 }}>Cypher Studio</h2>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Interactive Cypher graph query interface for Neo4j AuraDB
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

      {/* Query Snippet Categories Toolbar */}
      <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: 2 }}>
            Query Categories:
          </span>
          {CYPHER_CATEGORIES.map((cat) => {
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

        {/* Quick Action Chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {filteredCommands.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setSqlQuery(q.cypher || q.query)}
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

      {/* Main Studio Grid: Graph Schema Explorer + Cypher Editor */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 18, marginBottom: 20 }}>
        {/* Left: Graph Schema Explorer */}
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
              <span>Graph Schema</span>
            </div>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>AuraDB Live</span>
          </div>

          {/* Subtabs: Nodes / Relationships / Tables */}
          <div style={{ display: 'flex', gap: 4, marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid var(--bg-card-border)' }}>
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
              Relationships ({GRAPH_RELATIONSHIPS.length})
            </button>
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
              Tables ({tablesList.length})
            </button>
          </div>

          {/* List items based on schemaTab */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
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

            {schemaTab === 'tables' && (
              tablesList.map((table) => {
                const isSelected = selectedItem === table;
                const colCount = schemaMap[table]?.length;
                return (
                  <button
                    key={table}
                    onClick={() => {
                      setSelectedItem(table);
                      setSqlQuery(TABLE_CYPHER_MAP[table] || `MATCH (n:${table})\nRETURN n;`);
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
          </div>
        </div>

        {/* Right: Cypher Editor Surface */}
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
              <span>Cypher Query Editor (Neo4j AuraDB)</span>
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
            value={sqlQuery}
            onChange={(e) => setSqlQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="// Write Cypher graph queries&#10;MATCH (s:Student)-[:ALLOCATED_TO]->(r:Room)&#10;RETURN s, r;"
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
            <div style={{ padding: '18px 22px', background: 'rgba(239, 68, 68, 0.04)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: 'rgba(239, 68, 68, 0.2)',
                    color: '#f87171',
                    border: '1px solid rgba(239, 68, 68, 0.4)',
                    fontFamily: 'var(--font-mono)'
                  }}
                >
                  {errorInfo.errorType ? errorInfo.errorType.replace(/_/g, ' ') : 'EXECUTION ERROR'}
                </span>
                <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Execution status: <strong style={{ color: '#ef4444' }}>FAILED</strong>
                </span>
              </div>

              {/* Error Message */}
              <div
                style={{
                  color: '#fca5a5',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.84rem',
                  lineHeight: 1.55,
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.08)',
                  borderRadius: '6px',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  marginBottom: 14
                }}
              >
                {errorInfo.message}
              </div>

              {/* Original SQL */}
              {errorInfo.originalQuery && (
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                    ORIGINAL SQL:
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      padding: '8px 12px',
                      background: '#070b14',
                      borderRadius: '4px',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      color: '#e2e8f0',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {errorInfo.originalQuery}
                  </pre>
                </div>
              )}

              {/* Generated Cypher (if translation succeeded before execution error) */}
              {errorInfo.generatedCypher && (
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4 }}>
                    GENERATED CYPHER (TRANSLATION SUCCEEDED):
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      padding: '8px 12px',
                      background: '#070b14',
                      borderRadius: '4px',
                      border: '1px solid rgba(56, 189, 248, 0.25)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.78rem',
                      color: '#38bdf8',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {errorInfo.generatedCypher}
                  </pre>
                </div>
              )}
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
