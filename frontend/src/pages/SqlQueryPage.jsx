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
  Network
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
  { type: 'ALLOCATED_TO', source: 'Student', target: 'Room', query: 'MATCH (s:Student)-[:ALLOCATED_TO]->(r:Room)\nRETURN s, r;' },
  { type: 'RESIDES_IN', source: 'Student', target: 'Hostel', query: 'MATCH (s:Student)-[:RESIDES_IN]->(h:Hostel)\nRETURN s, h;' },
  { type: 'ENROLLED_IN', source: 'Student', target: 'Mess', query: 'MATCH (s:Student)-[:ENROLLED_IN]->(m:Mess)\nRETURN s, m;' },
  { type: 'MENTORED_BY', source: 'Student', target: 'Student', query: 'MATCH (s:Student)-[:MENTORED_BY]->(mentor:Student)\nRETURN s, mentor;' },
  { type: 'MANAGED_BY', source: 'Hostel', target: 'Warden', query: 'MATCH (h:Hostel)-[:MANAGED_BY]->(w:Warden)\nRETURN h, w;' },
  { type: 'LOCATED_IN', source: 'Room', target: 'Hostel', query: 'MATCH (r:Room)-[:LOCATED_IN]->(h:Hostel)\nRETURN r, h;' },
  { type: 'OF_TYPE', source: 'Room', target: 'RoomType', query: 'MATCH (r:Room)-[:OF_TYPE]->(rt:RoomType)\nRETURN r, rt;' },
  { type: 'SERVED_IN', source: 'Meal', target: 'Mess', query: 'MATCH (ml:Meal)-[:SERVED_IN]->(m:Mess)\nRETURN ml, m;' },
  { type: 'ASSIGNED_TO', source: 'Staff', target: 'Mess', query: 'MATCH (st:Staff)-[:ASSIGNED_TO]->(m:Mess)\nRETURN st, m;' },
  { type: 'PLACED_ORDER', source: 'Mess', target: 'Procurement', query: 'MATCH (m:Mess)-[:PLACED_ORDER]->(p:Procurement)\nRETURN m, p;' },
  { type: 'SUPPLIED_BY', source: 'Procurement', target: 'Supplier', query: 'MATCH (p:Procurement)-[:SUPPLIED_BY]->(sup:Supplier)\nRETURN p, sup;' },
  { type: 'INCLUDES_ITEM', source: 'Procurement', target: 'InventoryItem', query: 'MATCH (p:Procurement)-[:INCLUDES_ITEM]->(i:InventoryItem)\nRETURN p, i;' },
  { type: 'PAID_BY', source: 'Payment', target: 'Student', query: 'MATCH (p:Payment)-[:PAID_BY]->(s:Student)\nRETURN p, s;' },
  { type: 'HAS_DETAIL', source: 'Payment', target: 'PaymentDetail', query: 'MATCH (p:Payment)-[:HAS_DETAIL]->(pd:PaymentDetail)\nRETURN p, pd;' }
];

const TABLE_TO_LABEL_MAP = {
  STUDENT: { label: 'Student', alias: 's' },
  HOSTEL: { label: 'Hostel', alias: 'h' },
  ROOM_TYPE: { label: 'RoomType', alias: 'rt' },
  ROOM: { label: 'Room', alias: 'r' },
  WARDEN: { label: 'Warden', alias: 'w' },
  MESS: { label: 'Mess', alias: 'm' },
  MEAL: { label: 'Meal', alias: 'ml' },
  STAFF: { label: 'Staff', alias: 'st' },
  SUPPLIER: { label: 'Supplier', alias: 'sup' },
  INVENTORY_ITEM: { label: 'InventoryItem', alias: 'i' },
  PROCUREMENT: { label: 'Procurement', alias: 'p' },
  PROCURES: { label: 'Procurement', alias: 'p' },
  PAYMENT: { label: 'Payment', alias: 'pay' },
  PAYMENT_DETAIL: { label: 'PaymentDetail', alias: 'pd' },
  STUDENT_PHONE: { label: 'Student', alias: 's' },
  WARDEN_PHONE: { label: 'Warden', alias: 'w' },
  STAFF_PHONE: { label: 'Staff', alias: 'st' },
  SUPPLIER_PHONE: { label: 'Supplier', alias: 'sup' },
  MESS_CONTACT: { label: 'Mess', alias: 'm' }
};

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
  'SQL (MySQL)',
  'MATCH',
  'Relationships',
  'Aggregation',
  'Create / Update',
  'Delete'
];

const QUICK_COMMANDS = [
  // SQL (MySQL Compatibility)
  {
    category: 'SQL (MySQL)',
    label: 'SELECT * FROM STUDENT',
    cypher: 'SELECT * FROM STUDENT;'
  },
  {
    category: 'SQL (MySQL)',
    label: 'SELECT * FROM HOSTEL',
    cypher: 'SELECT * FROM HOSTEL;'
  },
  {
    category: 'SQL (MySQL)',
    label: 'SELECT * FROM ROOM',
    cypher: 'SELECT * FROM ROOM;'
  },
  {
    category: 'SQL (MySQL)',
    label: 'SELECT * FROM WARDEN',
    cypher: 'SELECT * FROM WARDEN;'
  },
  {
    category: 'SQL (MySQL)',
    label: 'SELECT * FROM MESS',
    cypher: 'SELECT * FROM MESS;'
  },
  {
    category: 'SQL (MySQL)',
    label: 'SELECT * FROM PAYMENT',
    cypher: 'SELECT * FROM PAYMENT;'
  },

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
    cypher: 'MATCH (p:Procurement)-[:SUPPLIED_BY]->(s:Supplier)\nRETURN p, s;'
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
    const entityId = val._id !== undefined ? val._id : val.__id;

    // Filter out internal metadata keys
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
        {/* Node/Relationship Header Badge */}
        {(labels || relType || entityId !== undefined) && (
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
            {entityId !== undefined && (
              <span style={{ fontSize: '0.65rem', color: '#64748b', marginLeft: 'auto' }}>
                id:{String(entityId)}
              </span>
            )}
          </div>
        )}

        {/* Properties list */}
        {displayKeys.map((k) => {
          const propVal = val[k];
          return (
            <div key={k} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start', margin: '2px 0' }}>
              <span style={{ color: '#94a3b8', fontWeight: 600, flexShrink: 0 }}>{k}:</span>
              <span
                style={{
                  color: typeof propVal === 'number' ? '#10b981' : typeof propVal === 'boolean' ? '#38bdf8' : Array.isArray(propVal) ? '#38bdf8' : propVal === null ? '#f87171' : '#f1f5f9',
                  wordBreak: 'break-word'
                }}
              >
                {propVal === null ? (
                  <span style={{ fontStyle: 'italic', fontSize: '0.72rem' }}>null</span>
                ) : Array.isArray(propVal) ? (
                  `[${propVal.map((item) => (typeof item === 'string' ? `"${item}"` : String(item))).join(', ')}]`
                ) : typeof propVal === 'object' ? (
                  JSON.stringify(propVal)
                ) : (
                  String(propVal)
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return String(val);
}

function processResultRecords(result) {
  if (!result) return { columns: [], rows: [] };
  const rawRows = result.rows || result.data || [];
  if (!Array.isArray(rawRows) || rawRows.length === 0) {
    return { columns: result.columns || [], rows: [] };
  }

  const rawCols = result.columns && result.columns.length > 0 ? result.columns : Object.keys(rawRows[0]);

  // If a single column was returned and its values are objects (e.g. Node), expand properties into normal columns
  if (rawCols.length === 1) {
    const singleCol = rawCols[0];
    const isObjectColumn = rawRows.every(
      (r) => r && typeof r[singleCol] === 'object' && r[singleCol] !== null && !Array.isArray(r[singleCol])
    );

    if (isObjectColumn) {
      const propKeys = [];
      rawRows.forEach((r) => {
        const obj = r[singleCol] || {};
        Object.keys(obj).forEach((k) => {
          if (!k.startsWith('_') && !k.startsWith('__') && !propKeys.includes(k)) {
            propKeys.push(k);
          }
        });
      });

      const unwrapped = rawRows.map((r) => {
        const obj = r[singleCol] || {};
        const row = {};
        propKeys.forEach((k) => {
          row[k] = obj[k] !== undefined ? obj[k] : null;
        });
        return row;
      });

      return { columns: propKeys, rows: unwrapped };
    }
  }

  return { columns: rawCols, rows: rawRows };
}

export default function SqlQueryPage({ showToast }) {
  const [cypher, setCypher] = useState('MATCH (s:Student)\nRETURN s;');
  const [executing, setExecuting] = useState(false);
  const [result, setResult] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [schemaMap, setSchemaMap] = useState({});
  const [selectedItem, setSelectedItem] = useState('Student');
  const [activeCategory, setActiveCategory] = useState('All');
  const [schemaTab, setSchemaTab] = useState('nodes'); // 'nodes' | 'relationships' | 'tables'

  useEffect(() => {
    loadSchema();
  }, []);

  async function loadSchema() {
    try {
      const res = await api.getGraphSchema();
      setSchemaMap(res.tables || {});
    } catch (err) {
      console.error('Error fetching schema map', err);
    }
  }

  async function handleExecuteQuery() {
    if (!cypher.trim()) {
      setErrorInfo({
        message: 'Please enter a Cypher query to execute',
        status: 400
      });
      return;
    }

    try {
      setExecuting(true);
      setErrorInfo(null);
      setResult(null);

      const res = await api.executeCypherQuery(cypher);
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
            <h2 style={{ margin: 0 }}>Cypher Studio</h2>
          </div>
        </div>

        <div className="page-actions">
          <button className="btn btn-secondary btn-sm" onClick={loadSchema}>
            <RefreshCw size={13} />
            <span>Refresh Schema</span>
          </button>
        </div>
      </div>

      {/* Cypher Snippets Categories Toolbar */}
      <div style={{ marginBottom: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', marginRight: 2 }}>
            Cypher Categories:
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

        {/* Quick Cypher Action Chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {filteredCommands.map((q, idx) => (
            <button
              key={idx}
              onClick={() => setCypher(q.cypher)}
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
      <div style={{ display: 'grid', gridTemplateColumns: '270px 1fr', gap: 18, marginBottom: 20 }}>
        {/* Left: Graph Schema & Entity Explorer */}
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
              <Network size={14} color="var(--primary)" />
              <span>Graph Schema</span>
            </div>
            <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>AuraDB</span>
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
              Rels ({GRAPH_RELATIONSHIPS.length})
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
                      setCypher(node.query);
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
                      setCypher(rel.query);
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
                      const cypherQuery = TABLE_CYPHER_MAP[table] || (TABLE_TO_LABEL_MAP[table] ? `MATCH (${TABLE_TO_LABEL_MAP[table].alias}:${TABLE_TO_LABEL_MAP[table].label})\nRETURN ${TABLE_TO_LABEL_MAP[table].alias};` : `MATCH (n:${table})\nRETURN n;`);
                      setCypher(cypherQuery);
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
              <span>Interactive Cypher Studio (Neo4j AuraDB)</span>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCypher('')}
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
            value={cypher}
            onChange={(e) => setCypher(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="MATCH (s:Student)&#10;RETURN s;"
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
                  {result.query && result.originalQuery && result.query.trim().toLowerCase() !== result.originalQuery.trim().toLowerCase() && (
                    <>
                      <span style={{ color: 'var(--text-muted)' }}>·</span>
                      <span style={{ color: '#a855f7', fontFamily: 'var(--font-mono)', fontSize: '0.74rem' }}>
                        Executed: {result.query}
                      </span>
                    </>
                  )}
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
              {result.message || 'Cypher statement executed successfully in Neo4j database.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
