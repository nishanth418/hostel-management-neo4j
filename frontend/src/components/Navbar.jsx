import React from 'react';
import {
  Menu,
  RefreshCw,
  Database,
  Moon,
  Sun,
  Play,
  User,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

const TAB_TITLES = {
  dashboard: 'Dashboard Control Center',
  students: 'Residents & Student Registry',
  hostels: 'Hostel Buildings & Blocks',
  rooms: 'Rooms & Floor Allocation',
  'room-types': 'Room Types & Configurations',
  wardens: 'Hostel Wardens & Supervisors',
  mess: 'Mess Dining Facilities',
  meals: 'Meal Schedules & Menus',
  staff: 'Operational Staff & Workers',
  suppliers: 'Suppliers & Vendors',
  inventory: 'Inventory & Stock Management',
  procurement: 'Procurement Records',
  payments: 'Student Fee Payments',
  reports: 'Analytical Reports (13 Views)',
  'sql-query': 'SQL Studio & Query Console',
  settings: 'System & Theme Settings',
  privacy: 'Privacy Policy',
  terms: 'Terms of Service'
};

export default function Navbar({
  activeTab,
  onToggleMobile,
  onRefresh,
  isRefreshing,
  healthInfo,
  onOpenSearch,
  currentTheme,
  onToggleTheme,
  onReplayIntro,
  currentUser
}) {
  const isTable = activeTab.startsWith('table_');
  const tableName = isTable ? activeTab.replace('table_', '') : null;
  const currentTitle = isTable ? `Relational Table: ${tableName}` : (TAB_TITLES[activeTab] || 'Management Workspace');

  return (
    <header className="top-header">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={onToggleMobile}
          className="btn btn-secondary btn-icon"
          id="mobile-menu-btn"
          aria-label="Toggle mobile menu"
          style={{ display: 'none' }}
        >
          <Menu size={18} />
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <span>Hostel & Mess</span>
            <ChevronRight size={12} />
            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{currentTitle}</span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              fontWeight: 800,
              margin: '2px 0 0 0',
              color: 'var(--text-primary)'
            }}
          >
            {currentTitle}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

        {/* Database Health Status Indicator */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 12px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '999px',
            fontSize: '0.74rem',
            color: '#10b981',
            fontWeight: 700
          }}
          title={`Connected to ${healthInfo?.engine || 'Neo4j AuraDB'}. 18 tables verified.`}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }}
          />
          <span className="db-status-text">{healthInfo?.engine || 'Neo4j AuraDB'} Online (18 Tables)</span>
        </div>

        {/* Replay 3D Intro Button */}
        <button
          onClick={onReplayIntro}
          className="btn btn-secondary btn-icon btn-sm"
          title="Replay 3D Intro Experience"
        >
          <Play size={14} color="#38bdf8" />
        </button>

        {/* Theme Toggle Button */}
        <button
          onClick={() => onToggleTheme(currentTheme === 'dark' ? 'light' : 'dark')}
          className="btn btn-secondary btn-icon btn-sm"
          title={currentTheme === 'dark' ? 'Switch to Daylight Clean theme' : 'Switch to Midnight Dark theme'}
        >
          {currentTheme === 'dark' ? <Sun size={15} color="#f59e0b" /> : <Moon size={15} color="#38bdf8" />}
        </button>

        {/* Refresh Action */}
        <button
          onClick={onRefresh}
          className="btn btn-secondary btn-sm"
          disabled={isRefreshing}
          title="Refresh current data from database"
        >
          <RefreshCw size={13} className={isRefreshing ? 'spin-animation' : ''} />
          <span className="refresh-label">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </button>

        {/* User Profile Avatar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            paddingLeft: 8,
            borderLeft: '1px solid var(--bg-card-border)'
          }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontSize: '0.8rem',
              fontWeight: 700
            }}
          >
            {currentUser?.name ? currentUser.name.charAt(0) : 'A'}
          </div>
          <div className="user-profile-info" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {currentUser?.name || 'Administrator'}
            </span>
            <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
              {currentUser?.role || 'Super Admin'}
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          #mobile-menu-btn {
            display: inline-flex !important;
          }
        }
        @media (max-width: 820px) {
          .user-profile-info, .db-status-text {
            display: none !important;
          }
        }
        @media (max-width: 640px) {
          .refresh-label {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
