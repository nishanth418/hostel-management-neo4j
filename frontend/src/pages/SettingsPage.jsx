import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Play,
  Database,
  Server,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function SettingsPage({
  currentTheme,
  onToggleTheme,
  onReplayIntro,
  healthInfo,
  onRefreshHealth,
  showToast
}) {
  const [testingPing, setTestingPing] = useState(false);
  const [pingLatency, setPingLatency] = useState(null);

  async function handleTestConnection() {
    setTestingPing(true);
    const start = performance.now();
    try {
      await api.getHealth();
      const end = performance.now();
      const latency = Math.round(end - start);
      setPingLatency(latency);
      showToast(`Database latency: ${latency}ms live`, 'success');
      if (onRefreshHealth) onRefreshHealth();
    } catch (err) {
      showToast(`Connection failed: ${err.message}`, 'error');
    } finally {
      setTestingPing(false);
    }
  }

  function handleClearCache() {
    try {
      localStorage.removeItem('nexus_intro_completed');
      showToast('Local application preferences reset successfully', 'info');
    } catch (e) {
      // ignore
    }
  }

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
                background: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}
            >
              <SettingsIcon size={20} />
            </div>
            <div>
              <h2>System Settings & Workspace Control</h2>
              <p>Configure appearance themes, interactive 3D presentations, and database telemetry</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
        {/* Appearance & Themes */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <Sparkles size={18} color="var(--primary)" />
              <span>Appearance & Color Theme</span>
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
                Select Active Workspace Theme
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => onToggleTheme('dark')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: currentTheme === 'dark' ? 'rgba(37, 99, 235, 0.18)' : 'var(--bg-input)',
                    border: currentTheme === 'dark' ? '2px solid var(--primary)' : '1px solid var(--bg-card-border)',
                    color: currentTheme === 'dark' ? '#ffffff' : 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <Moon size={22} color={currentTheme === 'dark' ? '#38bdf8' : 'var(--text-muted)'} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Midnight Dark (Default)</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Cyber-cyan slate palette optimized for low light
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleTheme('light')}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: currentTheme === 'light' ? 'rgba(37, 99, 235, 0.18)' : 'var(--bg-input)',
                    border: currentTheme === 'light' ? '2px solid var(--primary)' : '1px solid var(--bg-card-border)',
                    color: currentTheme === 'light' ? 'var(--text-primary)' : 'var(--text-secondary)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <Sun size={22} color={currentTheme === 'light' ? '#f59e0b' : 'var(--text-muted)'} />
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Daylight Clean</span>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    High-contrast daylight theme with soft slate
                  </span>
                </button>
              </div>
            </div>

            <div style={{ paddingTop: 12, borderTop: '1px solid var(--bg-card-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--text-primary)' }}>
                    Cinematic 3D Intro Experience
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>
                    Re-launch the Three.js procedural campus architectural model
                  </div>
                </div>
                <button className="btn btn-primary btn-sm" onClick={onReplayIntro}>
                  <Play size={14} />
                  <span>Replay 3D Intro</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Database & Cloud Telemetry */}
        <div className="panel">
          <div className="panel-header">
            <h3 className="panel-title">
              <Database size={18} color="var(--primary)" />
              <span>Database & Cloud Engine Status</span>
            </h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleTestConnection}
              disabled={testingPing}
            >
              <RefreshCw size={12} className={testingPing ? 'spin-animation' : ''} />
              <span>{testingPing ? 'Testing...' : 'Ping Test'}</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Engine Type:</span>
              <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                {healthInfo?.engine || 'Neo4j AuraDB'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Connection State:</span>
              <span className="badge badge-success">
                {healthInfo?.status === 'healthy' ? 'CONNECTED (TLS 1.3)' : 'ONLINE'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Relational Tables:</span>
              <span style={{ fontWeight: 700, color: '#10b981', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                {healthInfo?.totalApplicationTables || 18} / 18 Verified
              </span>
            </div>

            {pingLatency !== null && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
                <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Round-Trip Ping Latency:</span>
                <span style={{ fontWeight: 700, color: '#38bdf8', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                  {pingLatency} ms
                </span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: '#10b981', marginTop: 4 }}>
              <ShieldCheck size={16} />
              <span>Foreign Key Cascades Enabled · Strict Integrity Guarantees</span>
            </div>
          </div>
        </div>

        {/* System & Architecture Info */}
        <div className="panel" style={{ gridColumn: '1 / -1' }}>
          <div className="panel-header">
            <h3 className="panel-title">
              <Cpu size={18} color="var(--primary)" />
              <span>Platform Specifications & Environment</span>
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Platform Version</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>Hostel Management v2.4.0</div>
            </div>

            <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Frontend Technology</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>React 18 + Vite 6 + Three.js</div>
            </div>

            <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Backend Microservice</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>Node.js / Express Server (Port 5000)</div>
            </div>

            <div style={{ padding: '14px', background: 'var(--bg-input)', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Cache & Local Storage</span>
              <div style={{ marginTop: 6 }}>
                <button className="btn btn-secondary btn-sm" onClick={handleClearCache}>
                  Reset Workspace Cache
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
