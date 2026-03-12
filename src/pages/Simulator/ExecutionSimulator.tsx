import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { TradingChart } from '../../components/ui/TradingChart';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert,
  Target,
  BarChart3,
  DollarSign
} from 'lucide-react';

const ExecutionSimulator: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState<'Long' | 'Short' | null>(null);
  const [entryPrice, setEntryPrice] = useState<number | null>(null);
  const [pnl, setPnl] = useState(0);
  const [simTime, setSimTime] = useState(0);
  
  // Create mock streaming data
  const [chartData, setChartData] = useState(() => 
    Array.from({ length: 50 }, (_, i) => ({
      time: `2026-03-12T00:${i.toString().padStart(2, '0')}:00Z`,
      value: 18200 + Math.random() * 50
    }))
  );

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimTime(prev => prev + 1);
        const lastValue = chartData[chartData.length - 1].value;
        const newValue = lastValue + (Math.random() - 0.48) * 10;
        
        const newPoint = {
          time: new Date(Date.now() + simTime * 1000).toISOString().split('.')[0] + 'Z',
          value: newValue
        };
        
        setChartData(prev => [...prev.slice(1), newPoint]);

        if (position && entryPrice) {
          const diff = position === 'Long' ? newValue - entryPrice : entryPrice - newValue;
          setPnl(diff * 10);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, chartData, position, entryPrice, simTime]);

  const handleTrade = (type: 'Long' | 'Short') => {
    if (position) return;
    setPosition(type);
    setEntryPrice(chartData[chartData.length - 1].value);
  };

  const closePosition = () => {
    setPosition(null);
    setEntryPrice(null);
    setPnl(0);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Execution Sim</h1>
          <Badge color="primary">Live Simulation Active</Badge>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            {isPlaying ? 'Pause' : 'Resume'}
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCcw size={18} /> Reset
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 2 }}>
          <Card style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>NQ 1M</span>
                <span style={{ color: pnl >= 0 ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                  {pnl !== 0 && `${pnl > 0 ? '+' : ''}${pnl.toFixed(2)} pts`}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Badge color="neutral">Vol: High</Badge>
                <Badge color="neutral">Session: NY</Badge>
              </div>
            </div>
            <div style={{ padding: '20px', height: '400px' }}>
              <TradingChart data={chartData} />
            </div>
          </Card>

          {position && (
            <Card style={{ border: `1px solid ${position === 'Long' ? 'var(--primary)' : 'var(--danger)'}`, background: 'rgba(59, 130, 246, 0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', background: position === 'Long' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)' }}>
                    {position === 'Long' ? <TrendingUp color="var(--primary)" /> : <TrendingDown color="var(--danger)" />}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700 }}>{position} Position Open</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Entry: {entryPrice?.toFixed(2)}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: '1.25rem', fontWeight: 700, color: pnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                    ${(pnl * 20).toLocaleString()}
                  </p>
                  <Button variant="danger" size="sm" onClick={closePosition}>Market Close</Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
          <Card title="Order Management">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Button 
                  variant="primary" 
                  style={{ height: '80px', flexDirection: 'column', gap: '4px' }}
                  onClick={() => handleTrade('Long')}
                  disabled={!!position}
                >
                  <TrendingUp size={24} />
                  <span>BUY / LONG</span>
                </Button>
                <Button 
                  variant="danger" 
                  style={{ height: '80px', flexDirection: 'column', gap: '4px' }}
                  onClick={() => handleTrade('Short')}
                  disabled={!!position}
                >
                  <TrendingDown size={24} />
                  <span>SELL / SHORT</span>
                </Button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Risk Amount</span>
                  <span style={{ fontWeight: 600 }}>$500.00 (1%)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)' }}>
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>Position Size</span>
                  <span style={{ fontWeight: 600 }}>2 Contracts</span>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Performance Data">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Target size={20} color="var(--success)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Session Accuracy</p>
                  <h5 style={{ fontWeight: 700 }}>84%</h5>
                </div>
                <BarChart3 size={16} color="var(--text-dim)" />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DollarSign size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Today's Net Sim</p>
                  <h5 style={{ fontWeight: 700 }}>+$3,120.00</h5>
                </div>
                <TrendingUp size={16} color="var(--success)" />
              </div>
            </div>
          </Card>

          <Card style={{ border: '1px solid var(--warning)', background: 'rgba(245, 158, 11, 0.05)' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <ShieldAlert color="var(--warning)" size={20} strokeWidth={2.5} />
              <div>
                <h5 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Risk Warning</h5>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                  Volatility is increasing. Consider wider stops or reduced sizing.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExecutionSimulator;
