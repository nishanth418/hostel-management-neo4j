import React from 'react';
import {
  LayoutDashboard,
  Building2,
  BedDouble,
  Users,
  ShieldCheck,
  Utensils,
  Coffee,
  UserCheck,
  Truck,
  Boxes,
  ShoppingBag,
  CreditCard,
  FileBarChart2,
  Terminal,
  Database,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Table2,
  X,
  Layers
} from 'lucide-react';

export const NAVIGATION_SECTIONS = [
  {
    title: 'OVERVIEW',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'sql-query', label: 'SQL Studio', icon: Terminal }
    ]
  },
  {
    title: 'CAMPUS & LIVING',
    items: [
      { id: 'hostels', label: 'Hostels', icon: Building2 },
      { id: 'rooms', label: 'Rooms', icon: BedDouble },
      { id: 'room-types', label: 'Room Types', icon: Layers },
      { id: 'students', label: 'Residents', icon: Users },
      { id: 'wardens', label: 'Wardens', icon: ShieldCheck }
    ]
  },
  {
    title: 'DINING & OPERATIONS',
    items: [
      { id: 'mess', label: 'Mess Facilities', icon: Utensils },
      { id: 'meals', label: 'Meal Menus', icon: Coffee },
      { id: 'staff', label: 'Staff Members', icon: UserCheck }
    ]
  },
  {
    title: 'SUPPLY CHAIN',
    items: [
      { id: 'suppliers', label: 'Suppliers', icon: Truck },
      { id: 'inventory', label: 'Inventory Items', icon: Boxes },
      { id: 'procurement', label: 'Procurements', icon: ShoppingBag }
    ]
  },
  {
    title: 'FINANCE',
    items: [
      { id: 'payments', label: 'Fee Payments', icon: CreditCard }
    ]
  },
  {
    title: 'ANALYTICS & QUERY',
    items: [
      { id: 'reports', label: 'Reports', icon: FileBarChart2 }
    ]
  },
  {
    title: 'DATABASE',
    items: [
      { id: 'table_STUDENT', label: 'Database Studio', icon: Database, matchPrefix: 'table_' }
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'logout', label: 'Logout', icon: LogOut, isAction: true }
    ]
  }
];

export default function Sidebar({
  activeTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  healthInfo,
  onLogout
}) {
  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 49
          }}
        />
      )}

      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)',
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--bg-sidebar-border)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          transition: 'width var(--transition-normal), transform var(--transition-normal)',
          transform: mobileOpen ? 'translateX(0)' : undefined
        }}
        className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            height: 'var(--header-height)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            padding: collapsed ? '0' : '0 16px',
            borderBottom: '1px solid var(--bg-sidebar-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, overflow: 'hidden' }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 0 15px rgba(37, 99, 235, 0.45)',
                flexShrink: 0
              }}
            >
              <Building2 size={20} />
            </div>

            {!collapsed && (
              <div style={{ overflow: 'hidden', minWidth: 0, paddingRight: 6 }}>
                <h2
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.82rem',
                    fontWeight: 800,
                    letterSpacing: '0.02em',
                    lineHeight: 1.2,
                    margin: 0,
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                  title="HOSTEL MANAGEMENT"
                >
                  HOSTEL <span style={{ color: 'var(--primary)' }}>MANAGEMENT</span>
                </h2>
                <div
                  style={{
                    fontSize: '0.66rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: 2
                  }}
                  title="Hostel & Mess"
                >
                  Hostel & Mess
                </div>
              </div>
            )}
          </div>

          {/* Mobile close button */}
          {mobileOpen && (
            <button
              onClick={onCloseMobile}
              style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
            >
              <X size={20} />
            </button>
          )}

          {/* Desktop collapse toggle */}
          {!mobileOpen && (
            <button
              onClick={onToggleCollapse}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--bg-card-border)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                width: 26,
                height: 26,
                display: collapsed ? 'none' : 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)'
              }}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Navigation Sections */}
        <nav
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: collapsed ? '16px 8px' : '16px 14px',
            display: 'flex',
            flexDirection: 'column',
            gap: 16
          }}
        >
          {NAVIGATION_SECTIONS.map((sec, secIdx) => (
            <div key={secIdx} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {!collapsed && (
                <div
                  style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.08em',
                    color: 'var(--text-muted)',
                    padding: '4px 10px',
                    textTransform: 'uppercase'
                  }}
                >
                  {sec.title}
                </div>
              )}

              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = item.matchPrefix
                  ? activeTab.startsWith(item.matchPrefix) || activeTab === item.id
                  : activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.isAction && item.id === 'logout') {
                        if (onLogout) onLogout();
                      } else {
                        onSelectTab(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }
                    }}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      width: '100%',
                      padding: collapsed ? '10px 0' : '9px 12px',
                      justifyContent: collapsed ? 'center' : 'flex-start',
                      borderRadius: '8px',
                      background: isActive
                        ? 'linear-gradient(90deg, rgba(37, 99, 235, 0.22) 0%, rgba(37, 99, 235, 0.08) 100%)'
                        : 'transparent',
                      border: isActive
                        ? '1px solid rgba(59, 130, 246, 0.4)'
                        : '1px solid transparent',
                      borderLeft: isActive
                        ? '3px solid var(--primary)'
                        : '1px solid transparent',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <Icon
                      size={18}
                      color={isActive ? 'var(--primary)' : 'currentColor'}
                      style={{ flexShrink: 0 }}
                    />
                    {!collapsed && (
                      <span
                        style={{
                          fontFamily: 'var(--font-heading)',
                          fontSize: '0.86rem',
                          fontWeight: isActive ? 700 : 500,
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.label}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Database Status Footer Card */}
        <div
          style={{
            padding: collapsed ? '12px 6px' : '14px',
            borderTop: '1px solid var(--bg-sidebar-border)'
          }}
        >
          {collapsed ? (
            <button
              onClick={onToggleCollapse}
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                padding: '8px 0',
                background: 'rgba(56, 189, 248, 0.1)',
                border: '1px solid rgba(56, 189, 248, 0.2)',
                borderRadius: '8px',
                color: 'var(--primary)',
                cursor: 'pointer'
              }}
              title="Expand Sidebar"
            >
              <ChevronRight size={18} />
            </button>
          ) : (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--bg-card-border)',
                borderRadius: '10px',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '6px',
                  background: 'rgba(16, 185, 129, 0.14)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10b981',
                  flexShrink: 0
                }}
              >
                <Database size={16} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                  Neo4j AuraDB
                </div>
                <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>
                  18 / 18 Tables Online
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
