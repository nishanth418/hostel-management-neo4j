import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { buildHostelCampusEnvironment } from '../components/Campus3DEnvironment';

export default function LoginPage({ onLoginSuccess, healthInfo, onBackToIntro }) {
  const containerRef = useRef(null);
  const [email, setEmail] = useState('admin@univ.edu');
  const [password, setPassword] = useState('CampusAdmin2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Authentication Submission (Preserving existing logic)
  async function handleLogin(e) {
    if (e) e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide your username or email');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setLoading(true);

      let health = healthInfo;
      if (!health) {
        health = await api.getHealth().catch(() => null);
      }

      const userSession = {
        name: email.includes('admin') ? 'Campus Administrator' : 'Warden / Staff Official',
        email: email.trim(),
        role: email.includes('admin') ? 'Super Admin' : 'Warden',
        loginTime: new Date().toISOString(),
        engine: health?.engine || 'Neo4j AuraDB'
      };

      if (rememberMe) {
        localStorage.setItem('nexus_auth_user', JSON.stringify(userSession));
      } else {
        sessionStorage.setItem('nexus_auth_user', JSON.stringify(userSession));
      }

      setSuccess(true);
      setTimeout(() => {
        onLoginSuccess(userSession);
      }, 500);
    } catch (err) {
      setError(err.message || 'Authentication error. Please verify backend connectivity.');
    } finally {
      setLoading(false);
    }
  }

  function handleQuickRole(roleEmail) {
    setEmail(roleEmail);
    setPassword('CampusAdmin2026!');
    setError(null);
  }

  // 3D Campus Architectural Background (Sunset / Golden Hour Framing of Hostel Entrance)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // 1. Scene Setup
    const scene = new THREE.Scene();

    // 2. Camera: Angled Close View Framing the Main Hostel Entrance & Campus Quad
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(-2.0, 2.3, 8.8);
    const lookTarget = new THREE.Vector3(0.4, 1.7, 0);
    camera.lookAt(lookTarget);

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.appendChild(renderer.domElement);

    // 4. Build University Hostel Campus Environment
    const env = buildHostelCampusEnvironment(scene);

    // 5. Mouse Parallax Tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const handleMouseMove = (e) => {
      mouse.targetX = (e.clientX / width - 0.5) * 2;
      mouse.targetY = -(e.clientY / height - 0.5) * 2;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Window Resize Handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // 6. Animation Render Loop
    let reqId;
    const animate = () => {
      reqId = requestAnimationFrame(animate);

      const timeSec = performance.now() * 0.001;

      // Update trees swaying, window lights, and floating dust motes
      env.update(timeSec);

      // Smooth mouse parallax damping
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      // Gentle ambient breathing
      const ambX = Math.sin(timeSec * 0.3) * 0.18;
      const ambY = Math.cos(timeSec * 0.22) * 0.08;

      camera.position.x = -2.0 + mouse.x * 0.25 + ambX;
      camera.position.y = 2.3 + mouse.y * 0.15 + ambY;
      camera.lookAt(lookTarget);

      renderer.render(scene, camera);
    };

    animate();

    // Resource Cleanup
    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      env.dispose();
    };
  }, []);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#1e3a8a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={containerRef}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          inset: 0
        }}
      />

      {/* Cinematic Soft Vignette Overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at center, rgba(15, 23, 42, 0.2) 30%, rgba(15, 23, 42, 0.65) 100%)'
        }}
      />

      {/* Small Minimalist Glassmorphic Login Panel Over 3D Campus */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: 390,
          margin: '0 20px',
          background: 'rgba(15, 23, 42, 0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.18)',
          borderRadius: '16px',
          padding: '28px 24px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.5), 0 0 30px rgba(56, 189, 248, 0.12)',
          color: '#ffffff'
        }}
      >
        {/* Header: HOSTEL MANAGEMENT / HOSTEL & MESS / Welcome Back */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(37, 99, 235, 0.35)',
              border: '1px solid rgba(255, 255, 255, 0.35)',
              marginBottom: 10
            }}
          >
            <Building2 size={24} color="#ffffff" />
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.25rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              margin: '0 0 3px 0',
              color: '#ffffff'
            }}
          >
            HOSTEL <span style={{ color: '#38bdf8' }}>MANAGEMENT</span>
          </h1>

          <p
            style={{
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '0.12em',
              color: '#cbd5e1',
              margin: 0,
              textTransform: 'uppercase'
            }}
          >
            HOSTEL & MESS
          </p>

          <div style={{ marginTop: 14 }}>
            <h2
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: '#f8fafc',
                margin: 0
              }}
            >
              Welcome Back
            </h2>
          </div>
        </div>

        {/* Error Callout */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(239, 68, 68, 0.18)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#fca5a5',
              fontSize: '0.8rem',
              marginBottom: 14,
              lineHeight: 1.4
            }}
          >
            {error}
          </div>
        )}

        {/* Form Inputs: Simple, Clean & Focused */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Username / Email */}
          <div>
            <label
              htmlFor="login-email"
              style={{
                display: 'block',
                fontSize: '0.76rem',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: 6
              }}
            >
              Username / Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="login-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@univ.edu"
                className="input-field"
                style={{
                  width: '100%',
                  paddingLeft: 40,
                  height: 40,
                  fontSize: '0.86rem',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                disabled={loading || success}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="login-password"
              style={{
                display: 'block',
                fontSize: '0.76rem',
                fontWeight: 600,
                color: '#cbd5e1',
                marginBottom: 6
              }}
            >
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={16}
                color="#94a3b8"
                style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
              />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="input-field"
                style={{
                  width: '100%',
                  paddingLeft: 40,
                  paddingRight: 40,
                  height: 40,
                  fontSize: '0.86rem',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid rgba(255, 255, 255, 0.16)',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
                disabled={loading || success}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: 4
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Remember Session */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '0.76rem', color: '#cbd5e1' }}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={{ accentColor: '#38bdf8' }}
              />
              <span>Remember session</span>
            </label>
          </div>

          {/* Submit Button: LOGIN */}
          <button
            type="submit"
            disabled={loading || success}
            className="btn btn-primary"
            style={{
              height: 42,
              fontSize: '0.90rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 4,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb, #38bdf8)',
              boxShadow: '0 6px 20px rgba(37, 99, 235, 0.35)',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : success ? (
              <>
                <CheckCircle2 size={16} color="#ffffff" />
                <span>Access Granted</span>
              </>
            ) : (
              <>
                <span>LOGIN</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Quick Role Fillers (Super Admin / Warden presets) */}
        <div style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              onClick={() => handleQuickRole('admin@univ.edu')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '6px',
                background: email === 'admin@univ.edu' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                border: email === 'admin@univ.edu' ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                color: email === 'admin@univ.edu' ? '#38bdf8' : '#cbd5e1',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickRole('rajesh.k@univ.edu')}
              style={{
                flex: 1,
                padding: '6px 8px',
                borderRadius: '6px',
                background: email === 'rajesh.k@univ.edu' ? 'rgba(56, 189, 248, 0.18)' : 'rgba(255, 255, 255, 0.05)',
                border: email === 'rajesh.k@univ.edu' ? '1px solid rgba(56, 189, 248, 0.5)' : '1px solid rgba(255, 255, 255, 0.1)',
                color: email === 'rajesh.k@univ.edu' ? '#38bdf8' : '#cbd5e1',
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Warden
            </button>
          </div>
        </div>

        {/* Return to 3D Intro Option */}
        {onBackToIntro && (
          <div style={{ textAlign: 'center', marginTop: 14 }}>
            <button
              type="button"
              onClick={onBackToIntro}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '0.72rem',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#38bdf8'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#94a3b8'; }}
            >
              ← Return to 3D Intro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
