import React from 'react';
import { Card, Button, Badge } from '../components/ui';
import { useApp } from '../context/AppContext';
import { 
  BarChart2, 
  Filter,
  Plus,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Strategies: React.FC = () => {
  const navigate = useNavigate();
  const { strategies } = useApp();

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Header */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Strategy Library</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>
            Documenting and refining your edge in the markets.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline"><Filter size={18} /> Filter</Button>
          <Button 
            glow 
            onClick={() => navigate('/strategy/new')}
          >
            <Plus size={18} /> New Strategy
          </Button>
        </div>
      </section>

      {/* Strategies Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', 
        gap: '24px' 
      }}>
        {strategies.length === 0 ? (
          <Card style={{ 
            gridColumn: '1 / -1', 
            padding: '60px 20px', 
            textAlign: 'center', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            gap: '24px',
            border: '2px dashed var(--border-subtle)',
            background: 'transparent'
          }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '24px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={40} color="var(--primary)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '12px' }}>No Strategies Defined</h3>
              <p style={{ color: 'var(--text-dim)', maxWidth: '460px', margin: '0 auto', lineHeight: '1.6' }}>
                Your strategy library is the foundation of your trading consistency. 
                Define your first edge to start tracking performance and rules.
              </p>
            </div>
            <Button glow onClick={() => navigate('/strategy/new')}>
              Build Your First Strategy
            </Button>
          </Card>
        ) : (
          <>
            {strategies.map((strategy) => (
              <Card 
                key={strategy.id} 
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/strategy/${strategy.id}`)}
              >
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Badge color="primary">{strategy.type}</Badge>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
                      <BarChart2 size={16} />
                      <span style={{ fontSize: '0.85rem' }}>{strategy.tradesLogged} Trades</span>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>{strategy.name}</h3>
                    <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: '1.6', height: '4.8em', overflow: 'hidden' }}>
                      {strategy.description}
                    </p>
                  </div>

                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: '1fr 1fr', 
                    gap: '12px',
                    padding: '16px',
                    background: 'rgba(255,255,255,0.02)',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Win Rate</p>
                      <p style={{ fontWeight: 700, color: 'var(--success)' }}>{strategy.winRate}</p>
                    </div>
                    <div>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Avg RR</p>
                      <p style={{ fontWeight: 700 }}>{strategy.rr}</p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {strategy.tags.map(tag => (
                      <span key={tag} style={{ 
                        fontSize: '10px', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        background: 'rgba(255,255,255,0.05)',
                        color: 'var(--text-dim)',
                        border: '1px solid var(--border-subtle)'
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--border-subtle)',
                    marginTop: 'auto'
                  }}>
                    <Badge color="neutral">{strategy.difficulty}</Badge>
                    <ChevronRight size={18} color="var(--text-dim)" />
                  </div>
                </div>
              </Card>
            ))}

            <Card 
              style={{ 
                border: '2px dashed var(--border-subtle)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                cursor: 'pointer',
                background: 'transparent',
                transition: 'all 0.2s',
                minHeight: '300px'
              }} 
              className="add-strategy-hover"
              onClick={() => navigate('/strategy/new')}
            >
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                background: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}>
                <Plus size={24} />
              </div>
              <span style={{ fontWeight: 600, color: 'var(--text-dim)' }}>Add New Strategy</span>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Strategies;
