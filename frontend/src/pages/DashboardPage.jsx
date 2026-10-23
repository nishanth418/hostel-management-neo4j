import React, { useEffect, useState } from 'react';
import {
  Users,
  Building2,
  BedDouble,
  AlertCircle,
  UserCheck,
  Truck,
  Boxes,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Database,
  Table2,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  FileBarChart2,
  Terminal,
  Plus
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { api } from '../services/api';

const TABLE_GROUPS = [
  {
    title: 'WARDEN MANAGEMENT',
    accent: '#818cf8',
    tables: ['WARDEN', 'WARDEN_PHONE']
  },
  {
    title: 'HOSTEL & STUDENT REPOSITORY',
    accent: '#38bdf8',
    tables: ['HOSTEL', 'ROOM_TYPE', 'ROOM', 'STUDENT', 'STUDENT_PHONE']
  },
  {
    title: 'MESS & DINING',
    accent: '#34d399',
    tables: ['MESS', 'MESS_CONTACT', 'MEAL']
  },
  {
    title: 'STAFF OPERATIONS',
    accent: '#fbbf24',
    tables: ['STAFF', 'STAFF_PHONE']
  },
  {
    title: 'SUPPLIER & INVENTORY',
    accent: '#fb7185',
    tables: ['SUPPLIER', 'SUPPLIER_PHONE', 'INVENTORY_ITEM', 'PROCURES']
  },
  {
    title: 'FINANCIAL LEDGER',
    accent: '#c084fc',
    tables: ['PAYMENT', 'PAYMENT_DETAIL']
  }
];

export default function DashboardPage({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDashboardStats();
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard statistics from backend');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div className="spin-animation" style={{ display: 'inline-block', marginBottom: 16 }}>
          <TrendingUp size={36} color="var(--primary)" />
        </div>
        <h3 style={{ color: 'var(--text-primary)', marginBottom: 6 }}>Syncing Live Database Telemetry...</h3>
        <p style={{ fontSize: '0.9rem' }}>Querying active metrics from database engine</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel" style={{ borderLeft: '4px solid #ef4444' }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <AlertCircle color="#ef4444" size={28} />
          <div>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>Backend Connection Error</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: 4 }}>{error}</p>
          </div>
        </div>
        <button className="btn btn-secondary btn-sm" style={{ marginTop: 16 }} onClick={fetchStats}>
          Retry Connection
        </button>
      </div>
    );
  }

  const s = data?.summary || {};
  const occupancyNum = Number(s.occupancyRate || 100);

  return (
    <div>
      {/* Top Banner / Welcome Callout */}
      <div
        className="panel"
        style={{
          marginBottom: 28,
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.16) 0%, rgba(6, 182, 212, 0.08) 100%)',
          borderColor: 'rgba(56, 189, 248, 0.25)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 16
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#38bdf8', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <Sparkles size={14} />
            <span>Campus Overview Active</span>
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800, marginTop: 4, color: 'var(--text-primary)' }}>
            Operations & Housing Dashboard
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', marginTop: 2 }}>
            Real-time analytics across all 5 hostel blocks, 18 relational tables, and residential wards.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-primary" onClick={() => onNavigate('students')}>
            <Plus size={16} />
            <span>Register Resident</span>
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('reports')}>
            <FileBarChart2 size={16} />
            <span>View Reports</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="stat-grid">
        <StatCard
          title="Total Residents"
          value={s.totalStudents || 0}
          subtext="Active campus hostellers"
          icon={Users}
          color="#3b82f6"
          trend="+12% this semester"
        />
        <StatCard
          title="Hostel Buildings"
          value={s.totalHostels || 0}
          subtext="North & South Campuses"
          icon={Building2}
          color="#06b6d4"
        />
        <StatCard
          title="Total Rooms"
          value={s.totalRooms || 0}
          subtext={`${s.occupiedRooms || 0} Occupied (${s.occupancyRate || 100}%)`}
          icon={BedDouble}
          color="#10b981"
          trend={`${s.occupancyRate || 100}% Occupancy`}
        />
        <StatCard
          title="Fee Collections"
          value={`₹${(s.totalPaymentsAmount || 0).toLocaleString()}`}
          subtext={`${s.totalPaymentsCount || 0} transactions registered`}
          icon={CreditCard}
          color="#10b981"
        />
        <StatCard
          title="Active Staff"
          value={s.totalStaff || 0}
          subtext="Dining, maintenance & security"
          icon={UserCheck}
          color="#f59e0b"
        />
        <StatCard
          title="Inventory Items"
          value={s.totalInventoryItems || 0}
          subtext="Provisions, linen, electricals"
          icon={Boxes}
          color="#a855f7"
        />
        <StatCard
          title="Suppliers"
          value={s.totalSuppliers || 0}
          subtext="Active vendor contracts"
          icon={Truck}
          color="#ec4899"
        />
      </div>

      {/* Occupancy & Quick Action Center */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 24, marginBottom: 28 }}>
        {/* Occupancy Bar Visualizer */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <BedDouble size={18} color="var(--primary)" />
              <span>Campus Occupancy Rate</span>
            </h3>
            <span className="badge badge-success">{s.occupancyRate || 100}% Filled</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-secondary)' }}>Allotted vs Total Capacity</span>
                <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {s.occupiedRooms || 0} of {s.totalRooms || 0} Rooms Allocated
                </span>
              </div>
              <div style={{ width: '100%', height: 10, background: 'var(--bg-input)', borderRadius: 999, overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    width: `${occupancyNum}%`,
                    background: 'linear-gradient(90deg, #3b82f6, #10b981)',
                    borderRadius: 999
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, paddingTop: 10, borderTop: '1px solid var(--bg-card-border)' }}>
              <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Available</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginTop: 2 }}>
                  {Math.max(0, (s.totalRooms || 0) - (s.occupiedRooms || 0))}
                </div>
              </div>

              <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Occupied</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981', marginTop: 2 }}>
                  {s.occupiedRooms || 0}
                </div>
              </div>

              <div style={{ padding: '10px', background: 'var(--bg-input)', borderRadius: '8px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Buildings</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f59e0b', marginTop: 2 }}>
                  {s.totalHostels || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Launchpad */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <Sparkles size={18} color="var(--primary)" />
              <span>Campus Quick Launchpad</span>
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <button
              onClick={() => onNavigate('rooms')}
              className="btn btn-secondary"
              style={{ padding: '14px', justifyContent: 'flex-start', textAlign: 'left', borderRadius: '10px' }}
            >
              <BedDouble size={18} color="#38bdf8" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>Rooms & Floors</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Manage allocations</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('payments')}
              className="btn btn-secondary"
              style={{ padding: '14px', justifyContent: 'flex-start', textAlign: 'left', borderRadius: '10px' }}
            >
              <CreditCard size={18} color="#10b981" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>Collect Fee</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Record transaction</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('sql-query')}
              className="btn btn-secondary"
              style={{ padding: '14px', justifyContent: 'flex-start', textAlign: 'left', borderRadius: '10px' }}
            >
              <Terminal size={18} color="#a855f7" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>SQL Studio</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Interactive queries</div>
              </div>
            </button>

            <button
              onClick={() => onNavigate('inventory')}
              className="btn btn-secondary"
              style={{ padding: '14px', justifyContent: 'flex-start', textAlign: 'left', borderRadius: '10px' }}
            >
              <Boxes size={18} color="#f59e0b" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>Inventory</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Stock tracking</div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="table-container" style={{ marginBottom: 28 }}>
        <div className="table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CreditCard size={18} color="var(--primary)" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Recent Fee Transactions
            </h3>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('payments')}>
            <span>All Payment Records</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Txn ID</th>
                <th>Student</th>
                <th>Room & Hostel</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentPayments?.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                    No recent transaction logs found.
                  </td>
                </tr>
              ) : (
                data?.recentPayments?.map((p) => (
                  <tr key={p.payment_id}>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {p.transaction_id}
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {p.student_name}
                    </td>
                    <td>
                      {p.room_number ? `${p.room_number} (${p.hostel_name})` : '-'}
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)' }}>
                      ₹{p.total_amount?.toLocaleString()}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.84rem' }}>{p.payment_method}</span>
                    </td>
                    <td>
                      <span className={`badge ${p.payment_status === 'Paid' ? 'badge-success' : 'badge-warning'}`}>
                        {p.payment_status}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {p.payment_date}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 18 Relational Database Tables Explorer */}
      <div className="panel">
        <div className="panel-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Database size={20} color="var(--primary)" />
            <h3 className="panel-title">Relational Tables Explorer (18 Live Database Tables)</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Direct Neo4j AuraDB schema with 18 table views
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {TABLE_GROUPS.map((group) => (
            <div
              key={group.title}
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--bg-card-border)',
                borderRadius: 'var(--radius-sm)',
                padding: '16px'
              }}
            >
              <div
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: group.accent,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>{group.title}</span>
                <span className="badge" style={{ background: `${group.accent}15`, color: group.accent, border: `1px solid ${group.accent}30` }}>
                  {group.tables.length} tables
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {group.tables.map((table) => (
                  <button
                    key={table}
                    onClick={() => onNavigate(`table_${table}`)}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--bg-card-border)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.8rem',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = group.accent;
                      e.currentTarget.style.color = 'var(--text-primary)';
                      e.currentTarget.style.background = 'var(--bg-card-hover)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--bg-card-border)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                      e.currentTarget.style.background = 'var(--bg-card)';
                    }}
                  >
                    <Table2 size={13} color={group.accent} />
                    <span>{table}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
