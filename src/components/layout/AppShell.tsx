import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  History, 
  LineChart, 
  Target
} from 'lucide-react';

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const mainNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Home', path: '/dashboard' },
  { icon: GraduationCap, label: 'Academy', path: '/academy' },
  { icon: History, label: 'Journal', path: '/journal' },
  { icon: Target, label: 'Simulator', path: '/replay' },
  { icon: LineChart, label: 'Strategies', path: '/strategies' },
];

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="app-layout" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      backgroundColor: 'var(--bg-dark)'
    }}>
      {/* Top Header */}
      <header style={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(10, 10, 12, 0.8)',
        backdropFilter: 'var(--glass-blur)'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px' 
        }}>
          <img 
            src="/logo.png" 
            alt="Tradex Logo" 
            style={{ 
              width: '32px', 
              height: '32px', 
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 8px var(--primary-glow))'
            }} 
          />
          <span style={{ 
            fontWeight: 800, 
            fontSize: '1.4rem',
            letterSpacing: '-0.04em',
            background: 'linear-gradient(135deg, #fff 0%, rgba(255, 255, 255, 0.8) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textTransform: 'uppercase'
          }}>
            Tradex
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ 
        flex: 1, 
        padding: '20px',
        paddingBottom: '90px', // Space for bottom nav
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%'
      }}>
        {children}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        right: '20px',
        height: '70px',
        background: 'rgba(22, 22, 26, 0.9)',
        backdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '24px',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: '0 10px',
        zIndex: 1000,
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
      }}>
        {mainNav.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                color: isActive ? 'var(--primary)' : 'var(--text-dim)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: isActive ? 'translateY(-4px)' : 'none',
              }}
            >
              <div style={{
                padding: '8px',
                borderRadius: '12px',
                background: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                transition: 'all 0.3s'
              }}>
                <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span style={{ 
                fontSize: '10px', 
                fontWeight: isActive ? 600 : 500,
                opacity: isActive ? 1 : 0.7 
              }}>
                {item.label}
              </span>
              {isActive && (
                <div style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  marginTop: '2px',
                  boxShadow: '0 0 8px var(--primary)'
                }} />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AppShell;
