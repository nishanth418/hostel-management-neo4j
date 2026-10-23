import React, { useState, useEffect } from 'react';
import {
  Table2,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Key,
  Link2,
  AlertCircle,
  Database,
  ChevronRight,
  Layers
} from 'lucide-react';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
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

export default function DatabaseTableView({ tableName, showToast }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  // Form data for add / edit
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadTableData();
  }, [tableName, refreshKey]);

  async function loadTableData() {
    try {
      setLoading(true);
      const res = await api.getTableInfo(tableName, searchTerm);
      setData(res);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }

  function handleSearchSubmit(e) {
    if (e) e.preventDefault();
    loadTableData();
  }

  function handleOpenAddModal() {
    const initial = {};
    if (data?.columns) {
      data.columns.forEach((col) => {
        initial[col.name] = '';
      });
    }
    setFormData(initial);
    setIsAddModalOpen(true);
  }

  function handleOpenEditModal(row) {
    setEditingRow(row);
    const formVals = {};
    if (data?.columns) {
      data.columns.forEach((col) => {
        formVals[col.name] = row[col.name] !== null && row[col.name] !== undefined ? String(row[col.name]) : '';
      });
    }
    setFormData(formVals);
  }

  async function handleSaveNewRow(e) {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {};
      for (const [key, val] of Object.entries(formData)) {
        if (val !== '') {
          const colDef = data?.columns.find((c) => c.name === key);
          if (colDef && (colDef.type.includes('INT') || colDef.type.includes('REAL') || colDef.type.includes('NUM'))) {
            payload[key] = Number(val);
          } else {
            payload[key] = val;
          }
        }
      }

      await api.insertTableRow(tableName, payload);
      showToast(`Record inserted into ${tableName} successfully`, 'success');
      setIsAddModalOpen(false);
      loadTableData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveEditRow(e) {
    e.preventDefault();
    if (!editingRow || !data?.primaryKeys) return;

    try {
      setSaving(true);
      const keyCriteria = {};
      data.primaryKeys.forEach((pk) => {
        keyCriteria[pk] = editingRow[pk];
      });

      const values = {};
      for (const [key, val] of Object.entries(formData)) {
        const colDef = data?.columns.find((c) => c.name === key);
        if (val === '') {
          values[key] = null;
        } else if (colDef && (colDef.type.includes('INT') || colDef.type.includes('REAL') || colDef.type.includes('NUM'))) {
          values[key] = Number(val);
        } else {
          values[key] = val;
        }
      }

      await api.updateTableRow(tableName, keyCriteria, values);
      showToast(`Record in ${tableName} updated successfully`, 'success');
      setEditingRow(null);
      loadTableData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || !data?.primaryKeys) return;

    try {
      setSaving(true);
      const keyCriteria = {};
      data.primaryKeys.forEach((pk) => {
        keyCriteria[pk] = deleteTarget[pk];
      });

      await api.deleteTableRow(tableName, keyCriteria);
      showToast(`Record deleted from ${tableName} successfully`, 'success');
      setDeleteTarget(null);
      loadTableData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  }

  const columns = data?.columns || [];
  const rows = data?.data || [];

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
              <Database size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h2>Database Studio: {tableName}</h2>
                <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)' }}>
                  RELATIONAL TABLE
                </span>
              </div>
              <p>
                Direct schema inspector with Primary Key / Foreign Key constraints across{' '}
                <strong>{columns.length} columns</strong> and <strong>{data?.totalRows || 0} active rows</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="page-actions">
          <button className="btn btn-secondary" onClick={() => setRefreshKey((k) => k + 1)}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={16} />
            <span>Insert Record</span>
          </button>
        </div>
      </div>

      <div className="table-container">
        {/* Toolbar */}
        <div className="table-toolbar">
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div className="search-input-wrapper">
              <Search size={14} />
              <input
                type="text"
                className="search-input"
                placeholder={`Search records in ${tableName}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-secondary btn-sm">
              Search
            </button>
            {searchTerm && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setSearchTerm('');
                  setRefreshKey((k) => k + 1);
                }}
              >
                Clear
              </button>
            )}
          </form>

          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Showing <strong>{rows.length}</strong> record(s)
          </span>
        </div>

        {/* Data Table */}
        <div className="data-table-wrapper" style={{ maxHeight: '68vh', overflowY: 'auto' }}>
          <table className="data-table" style={{ width: 'max-content', minWidth: '100%' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                {columns.map((col) => (
                  <th key={col.name} style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
                        {col.name}
                      </span>
                      {col.keyBadge && (
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 800,
                            color: col.keyBadge === 'PK' ? '#fbbf24' : '#38bdf8'
                          }}
                        >
                          ({col.keyBadge})
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      <span>{col.type}</span>
                      {col.fkRef && (
                        <span style={{ color: '#38bdf8' }} title={`References ${col.fkRef.table}`}>
                          → {col.fkRef.table}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
                <th style={{ textAlign: 'right', position: 'sticky', right: 0, background: 'var(--bg-table-header)', zIndex: 11 }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
                    <div className="spin-animation" style={{ display: 'inline-block', marginBottom: 8 }}>
                      <Database size={24} color="var(--primary)" />
                    </div>
                    <p>Loading table records from Neo4j AuraDB...</p>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} style={{ textAlign: 'center', padding: '50px 0', color: 'var(--text-muted)' }}>
                    No records found in table <strong>{tableName}</strong>.
                  </td>
                </tr>
              ) : (
                rows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {columns.map((col) => {
                      const val = row[col.name];
                      const isNull = val === null || val === undefined;

                      return (
                        <td
                          key={col.name}
                          style={{
                            whiteSpace: 'nowrap',
                            fontFamily: col.isPk || col.isFk || typeof val === 'number' ? 'var(--font-mono)' : 'inherit',
                            color: col.isPk ? 'var(--text-primary)' : col.isFk ? '#38bdf8' : typeof val === 'number' ? '#34d399' : 'var(--text-secondary)'
                          }}
                        >
                          {isNull ? (
                            <span style={{ color: '#f87171', fontStyle: 'italic', fontSize: '0.74rem' }}>NULL</span>
                          ) : (
                            String(val)
                          )}
                        </td>
                      );
                    })}

                    <td style={{ textAlign: 'right', position: 'sticky', right: 0, background: 'var(--bg-card)', zIndex: 9 }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-secondary btn-icon btn-sm"
                          onClick={() => handleOpenEditModal(row)}
                          title="Edit row"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn btn-danger btn-icon btn-sm"
                          onClick={() => setDeleteTarget(row)}
                          title="Delete row"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insert Record Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Insert Record into ${tableName}`}
        maxWidth="620px"
      >
        <form onSubmit={handleSaveNewRow}>
          <div className="form-grid">
            {columns.map((col) => (
              <div key={col.name} className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{col.name}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                    {col.type} {col.keyBadge ? `(${col.keyBadge})` : ''}
                  </span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Enter ${col.name}`}
                  value={formData[col.name] || ''}
                  onChange={(e) => setFormData({ ...formData, [col.name]: e.target.value })}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--bg-card-border)' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Inserting...' : 'Insert Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Record Modal */}
      {editingRow && (
        <Modal
          isOpen={true}
          onClose={() => setEditingRow(null)}
          title={`Edit Record in ${tableName}`}
          maxWidth="620px"
        >
          <form onSubmit={handleSaveEditRow}>
            <div className="form-grid">
              {columns.map((col) => {
                const isPk = col.isPk;
                return (
                  <div key={col.name} className="form-group">
                    <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{col.name}</span>
                      <span style={{ color: isPk ? '#fbbf24' : 'var(--text-muted)', fontSize: '0.72rem', fontFamily: 'var(--font-mono)' }}>
                        {col.type} {col.keyBadge ? `(${col.keyBadge})` : ''}
                      </span>
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      disabled={isPk}
                      style={isPk ? { opacity: 0.6, cursor: 'not-allowed', background: 'var(--bg-input)' } : {}}
                      value={formData[col.name] !== undefined ? formData[col.name] : ''}
                      onChange={(e) => setFormData({ ...formData, [col.name]: e.target.value })}
                    />
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24, paddingTop: 16, borderTop: '1px solid var(--bg-card-border)' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditingRow(null)} disabled={saving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={`Delete Record from ${tableName}`}
        message="Are you sure you want to permanently delete this row? Relational foreign key constraints will protect dependent records."
        confirmText="Delete Record"
        isLoading={saving}
      />
    </div>
  );
}
