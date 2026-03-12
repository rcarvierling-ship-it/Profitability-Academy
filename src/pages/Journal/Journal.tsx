import React from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Filter, 
  Target,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Journal: React.FC = () => {
  const navigate = useNavigate();
  const { trades } = useApp();

  // Calculate real metrics
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const winRate = trades.length > 0 
    ? (trades.filter(t => t.status === 'Win').length / trades.length) * 100 
    : 0;
  const avgExecution = trades.length > 0
    ? trades.reduce((sum, t) => sum + t.executionRating, 0) / trades.length
    : 0;

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Journal Header */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '12px' }}>Elite Journal</h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>
            Documenting the process. Scoring the execution. Refining the edge.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline"><Filter size={18} /> Filters</Button>
          <Button glow onClick={() => navigate('/replay')}>
            <Plus size={18} /> Log New Trade
          </Button>
        </div>
      </section>

      {/* Quick Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)' }}>
              <DollarSign size={20} color="var(--primary)" />
            </div>
            <Badge color={totalPnl >= 0 ? 'success' : 'danger'}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString()}
            </Badge>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Net Realized P&L</p>
          <h4 style={{ fontSize: '1.75rem', fontWeight: 700 }}>${totalPnl.toLocaleString()}</h4>
        </Card>

        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)' }}>
              <TrendingUp size={20} color="var(--success)" />
            </div>
            <Badge color="primary">Active Edge</Badge>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Avg. Win Rate</p>
          <h4 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{winRate.toFixed(1)}%</h4>
        </Card>

        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.1)' }}>
              <Target size={20} color="var(--danger)" />
            </div>
            <Badge color="warning">{avgExecution.toFixed(0)}% Execution</Badge>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Discipline Score</p>
          <h4 style={{ fontSize: '1.75rem', fontWeight: 700 }}>Grade: {avgExecution > 90 ? 'A' : avgExecution > 80 ? 'B' : 'C'}</h4>
        </Card>
      </div>

      {/* Trade Log Table / Empty State */}
      <Card title="Trade History" subtitle="Recent performance and execution logs" style={{ padding: '0' }}>
        {trades.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ClipboardList size={32} color="var(--text-dim)" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '8px' }}>Your journal is empty</h3>
              <p style={{ color: 'var(--text-dim)', maxWidth: '400px' }}>
                Start tracking your performance by logging your first trade from the execution simulator or manual entry.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/replay')}>Go to Simulator</Button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                  <th style={{ padding: '20px' }}>TRADE & DATE</th>
                  <th style={{ padding: '20px' }}>TYPE</th>
                  <th style={{ padding: '20px' }}>PnL & RR</th>
                  <th style={{ padding: '20px' }}>STRATEGY</th>
                  <th style={{ padding: '20px' }}>RATING</th>
                  <th style={{ padding: '20px' }}></th>
                </tr>
              </thead>
              <tbody>
                {trades.map((trade) => (
                  <tr 
                    key={trade.id} 
                    style={{ borderBottom: '1px solid var(--border-subtle)', cursor: 'pointer' }}
                    onClick={() => navigate(`/trade/${trade.id}`)}
                    className="table-row-hover"
                  >
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: 600, fontSize: '1rem' }}>{trade.instrument}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          <Calendar size={12} /> {trade.date}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <Badge color={trade.type === 'Long' ? 'primary' : 'danger'}>{trade.type}</Badge>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <span style={{ fontWeight: 700, color: trade.pnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toLocaleString()}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>RR {trade.rr}</span>
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{trade.strategy}</span>
                        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                          {trade.tags.slice(0, 2).map((tag: string) => (
                            <span key={tag} style={{ fontSize: '9px', padding: '1px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-dim)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '20px' }}>
                      <div style={{ width: '60px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', marginBottom: '4px' }}>
                        <div style={{ width: `${trade.executionRating}%`, height: '100%', background: trade.executionRating > 85 ? 'var(--success)' : 'var(--warning)', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{trade.executionRating}%</span>
                    </td>
                    <td style={{ padding: '20px', textAlign: 'right' }}>
                      <ChevronRight size={18} color="var(--text-dim)" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Journal;
