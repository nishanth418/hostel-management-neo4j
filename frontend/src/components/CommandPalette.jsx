import React, { useState, useEffect } from 'react';
import { Search, X, LayoutDashboard, Building2, BedDouble, Users, ShieldCheck, Utensils, Coffee, UserCheck, Truck, Boxes, ShoppingBag, CreditCard, FileBarChart2, Terminal, Database, Settings } from 'lucide-react';

const SEARCH_ITEMS = [
  { id: 'dashboard', label: 'Dashboard Control Center', category: 'Overview', icon: LayoutDashboard },
  { id: 'students', label: 'Students & Residents Registry', category: 'Campus & Living', icon: Users },
  { id: 'hostels', label: 'Hostel Buildings & Blocks', category: 'Campus & Living', icon: Building2 },
  { id: 'rooms', label: 'Rooms & Floor Allocation', category: 'Campus & Living', icon: BedDouble },
  { id: 'room-types', label: 'Room Types (Single/Double/AC)', category: 'Campus & Living', icon: BedDouble },
  { id: 'wardens', label: 'Hostel Wardens & Supervisors', category: 'Campus & Living', icon: ShieldCheck },
  { id: 'mess', label: 'Dining Halls & Mess Facilities', category: 'Dining & Ops', icon: Utensils },
  { id: 'meals', label: 'Meal Menus & Daily Schedules', category: 'Dining & Ops', icon: Coffee },
  { id: 'staff', label: 'Operational Staff & Workers', category: 'Dining & Ops', icon: UserCheck },
  { id: 'suppliers', label: 'Active Suppliers & Vendors', category: 'Supply Chain', icon: Truck },
  { id: 'inventory', label: 'Inventory Items & Stock Alerts', category: 'Supply Chain', icon: Boxes },
  { id: 'procurement', label: 'Procurement Records & Orders', category: 'Supply Chain', icon: ShoppingBag },
  { id: 'payments', label: 'Student Fees & Payments', category: 'Finance', icon: CreditCard },
  { id: 'reports', label: 'Analytics Reports (13 Views)', category: 'Analytics', icon: FileBarChart2 },
  { id: 'sql-query', label: 'SQL Studio & Query Engine', category: 'Developer / DBA', icon: Terminal },
  { id: 'settings', label: 'System Settings & Theme Preferences', category: 'System', icon: Settings },
  // Direct Relational Table Views
  { id: 'table_STUDENT', label: 'Database Table: STUDENT', category: '18 Tables', icon: Database },
  { id: 'table_HOSTEL', label: 'Database Table: HOSTEL', category: '18 Tables', icon: Database },
  { id: 'table_ROOM', label: 'Database Table: ROOM', category: '18 Tables', icon: Database },
  { id: 'table_ROOM_TYPE', label: 'Database Table: ROOM_TYPE', category: '18 Tables', icon: Database },
  { id: 'table_WARDEN', label: 'Database Table: WARDEN', category: '18 Tables', icon: Database },
  { id: 'table_PAYMENT', label: 'Database Table: PAYMENT', category: '18 Tables', icon: Database },
  { id: 'table_INVENTORY_ITEM', label: 'Database Table: INVENTORY_ITEM', category: '18 Tables', icon: Database }
];

export default function CommandPalette({ isOpen, onClose, onSelect }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose(true); // toggle
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  const filtered = SEARCH_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay" onClick={onClose} style={{ alignItems: 'flex-start', paddingTop: '12vh' }}>
      <div
        className="modal-content"
        style={{ maxWidth: 560, background: 'var(--bg-modal)', borderRadius: '16px', overflow: 'hidden' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--bg-card-border)', gap: 12 }}>
          <Search size={18} color="var(--primary)" />
          <input
            type="text"
            placeholder="Type a command or module name to jump..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: '1rem',
              fontFamily: 'inherit'
            }}
          />
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '10px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No navigation commands matched "{query}"
            </div>
          ) : (
            filtered.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelect(item.id);
                    onClose();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-card-hover)';
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Icon size={16} color="var(--primary)" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.label}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.05)', padding: '2px 8px', borderRadius: '4px' }}>
                    {item.category}
                  </span>
                </button>
              );
            })
          )}
        </div>

        <div style={{ padding: '10px 20px', background: 'rgba(0, 0, 0, 0.2)', borderTop: '1px solid var(--bg-card-border)', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>Navigate with click or arrow keys</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
}
