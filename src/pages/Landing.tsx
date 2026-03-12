import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, Button } from '../components/ui';
import { Lock, ArrowRight } from 'lucide-react';

const Landing: React.FC = () => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(pin)) {
      navigate('/dashboard');
    } else {
      setError(true);
      setPin('');
      setTimeout(() => {
        setError(false);
        inputRef.current?.focus();
      }, 500);
    }
  };

  return (
    <div 
      onClick={() => inputRef.current?.focus()}
      style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #111827 0%, #000000 100%)',
        overflow: 'hidden',
        position: 'relative',
        cursor: 'text'
      }}
    >
      {/* Background Decor */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%)',
        zIndex: 0,
        pointerEvents: 'none'
      }} />

      <div className={`animate-fade-in ${error ? 'animate-shake' : ''}`} style={{ zIndex: 1, width: '100%', maxWidth: '400px', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ 
            width: '100px', 
            height: '100px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px',
          }}>
            <img 
              src="/logo.png" 
              alt="Tradex Logo" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))'
              }} 
            />
          </div>
          <h1 className="gradient-text" style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-0.05em', marginBottom: '8px' }}>
            Tradex
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1rem', letterSpacing: '0.05em' }}>PRIVATE ACCESS ONLY</p>
        </div>

        <Card 
          style={{ padding: '32px', border: error ? '1px solid var(--danger)' : '1px solid var(--border-subtle)', cursor: 'default' }}
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div 
              style={{ textAlign: 'center', cursor: 'pointer' }}
              onClick={() => inputRef.current?.focus()}
            >
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem', marginBottom: '20px' }}>Enter Security PIN</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    background: pin.length > i ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    boxShadow: pin.length > i ? '0 0 10px var(--primary-glow)' : 'none',
                    transition: 'all 0.2s'
                  }} />
                ))}
              </div>
            </div>

            <input
              ref={inputRef}
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setPin(val.slice(0, 4));
                if (val.length === 4) {
                  // Small delay to show the last dot filled before login
                  setTimeout(() => {
                    if (val === '5106') login('5106') && navigate('/dashboard');
                  }, 100);
                }
              }}
              autoFocus
              style={{
                position: 'absolute',
                opacity: 0,
                width: '1px',
                height: '1px',
                pointerEvents: 'none'
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Button 
                type="submit" 
                glow 
                style={{ width: '100%', height: '56px', fontSize: '1.1rem' }}
                disabled={pin.length < 4}
              >
                Unlock Operating System <ArrowRight size={18} style={{ marginLeft: '8px' }} />
              </Button>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Lock size={12} /> Encrypted Session
              </p>
            </div>
          </form>
        </Card>

        {error && (
          <p className="animate-fade-in" style={{ color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center', marginTop: '16px', fontWeight: 600 }}>
            ACCESS DENIED. INVALID CREDENTIALS.
          </p>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Landing;
