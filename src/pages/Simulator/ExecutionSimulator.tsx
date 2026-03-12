import React, { useState, useEffect, useMemo } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { TradingChart } from '../../components/ui/TradingChart';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  History,
  AlertCircle
} from 'lucide-react';

interface SimulatedTrade {
  id: string;
  type: 'Long' | 'Short';
  entry: number;
  exit: number;
  pnl: number;
  time: string;
}

const ExecutionSimulator: React.FC = () => {
  // Simulator State
  const [isPlaying, setIsPlaying] = useState(false);
  const [balance, setBalance] = useState(100000);
  const [sessionTrades, setSessionTrades] = useState<SimulatedTrade[]>([]);
  
  // Active Position State
  const [position, setPosition] = useState<'Long' | 'Short' | null>(null);
  const [entryPrice, setEntryPrice] = useState<number | null>(null);
  const [contracts, setContracts] = useState(2);
  const [sl, setSl] = useState(20); // ticks/points
  const [tp, setTp] = useState(40); // ticks/points
  const [currentPnl, setCurrentPnl] = useState(0);

  // Price Engine State
  const [simTime, setSimTime] = useState(0);
  const [regime, setRegime] = useState<'Trend' | 'Chop'>('Chop');
  const [trendDirection, setTrendDirection] = useState<1 | -1>(1);
  
  const [chartData, setChartData] = useState(() => 
    Array.from({ length: 100 }, (_, i) => ({
      time: new Date(Date.now() - (100 - i) * 60000).toISOString().split('.')[0] + 'Z',
      value: 18200 + Math.random() * 50
    }))
  );

  const lastPrice = useMemo(() => chartData[chartData.length - 1].value, [chartData]);

  // Handle Simulation Loop
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setSimTime(prev => prev + 1);
        
        // Dynamic Regime Logic
        if (Math.random() < 0.05) {
          setRegime(r => r === 'Trend' ? 'Chop' : 'Trend');
          if (Math.random() < 0.5) setTrendDirection(d => d === 1 ? -1 : 1);
        }

        const volatility = regime === 'Trend' ? 12 : 6;
        const bias = regime === 'Trend' ? trendDirection * 2 : 0;
        const change = (Math.random() - 0.5) * volatility + bias;
        const newValue = lastPrice + change;

        const newPoint = {
          time: new Date(Date.now() + simTime * 1000).toISOString().split('.')[0] + 'Z',
          value: newValue
        };

        setChartData(prev => [...prev.slice(1), newPoint]);

        // Position PnL & Auto-Exits
        if (position && entryPrice) {
          const diff = position === 'Long' ? newValue - entryPrice : entryPrice - newValue;
          const pointValue = 20; // NQ point value approx
          const pnlVal = diff * contracts * pointValue;
          setCurrentPnl(pnlVal);

          // SL/TP Check
          if (newValue <= entryPrice - sl && position === 'Long' || 
              newValue >= entryPrice + sl && position === 'Short') {
            closePosition(newValue);
          } else if (newValue >= entryPrice + tp && position === 'Long' || 
                     newValue <= entryPrice - tp && position === 'Short') {
            closePosition(newValue);
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, lastPrice, position, entryPrice, sl, tp, contracts, regime, trendDirection]);

  const handleTrade = (type: 'Long' | 'Short') => {
    if (position) return;
    setPosition(type);
    setEntryPrice(lastPrice);
  };

  const closePosition = (exitPrice = lastPrice) => {
    if (!position || !entryPrice) return;

    const diff = position === 'Long' ? exitPrice - entryPrice : entryPrice - exitPrice;
    const pointValue = 20;
    const finalPnl = diff * contracts * pointValue;

    const newTrade: SimulatedTrade = {
      id: Math.random().toString(36).substr(2, 9),
      type: position,
      entry: entryPrice,
      exit: exitPrice,
      pnl: finalPnl,
      time: new Date().toLocaleTimeString()
    };

    setSessionTrades(prev => [newTrade, ...prev]);
    setBalance(prev => prev + finalPnl);
    setPosition(null);
    setEntryPrice(null);
    setCurrentPnl(0);
  };

  const sessionAccuracy = useMemo(() => {
    if (sessionTrades.length === 0) return 0;
    const wins = sessionTrades.filter(t => t.pnl > 0).length;
    return Math.round((wins / sessionTrades.length) * 100);
  }, [sessionTrades]);

  const totalSessionPnl = sessionTrades.reduce((sum, t) => sum + t.pnl, 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div>
            <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Execution Sim</h1>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Badge color={isPlaying ? 'success' : 'neutral'}>
                {isPlaying ? 'ENGINE ACTIVE' : 'ENGINE PAUSED'}
              </Badge>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                Regime: <span style={{ color: 'var(--primary)' }}>{regime}</span>
              </span>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            {isPlaying ? 'Pause' : 'Resume'}
          </Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RotateCcw size={18} /> Reset Hub
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
        {/* Main Chart Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card style={{ padding: '0', overflow: 'hidden', height: '500px' }}>
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(255,255,255,0.01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontWeight: 800, fontSize: '1.2rem', letterSpacing: '0.05em' }}>NQ 100</span>
                <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)' }} />
                <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--text-dim)' }}>
                  {lastPrice.toFixed(2)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', animation: 'pulse 2s infinite' }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)' }}>LIVE DATA</span>
                 </div>
              </div>
            </div>
            <div style={{ padding: '20px', height: 'calc(100% - 60px)' }}>
              <TradingChart data={chartData} />
            </div>
          </Card>

          {/* Active Orders / Position Status */}
          {position && entryPrice ? (
            <Card style={{ padding: '24px', borderLeft: `4px solid ${position === 'Long' ? 'var(--primary)' : 'var(--danger)'}`, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Position</p>
                  <p style={{ fontWeight: 800, color: position === 'Long' ? 'var(--primary)' : 'var(--danger)', fontSize: '1.1rem' }}>
                    {position} {contracts}x
                  </p>
                </div>
                <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Avg Entry</p>
                    <p style={{ fontWeight: 700 }}>{entryPrice.toFixed(2)}</p>
                </div>
                <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Unrealized PnL</p>
                    <p style={{ fontWeight: 800, color: currentPnl >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: '1.1rem' }}>
                      ${currentPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                   <Button variant="danger" glow onClick={() => closePosition()}>EXIT POSITION</Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card style={{ padding: '24px', textAlign: 'center', border: '1px dashed var(--border-subtle)', background: 'transparent' }}>
               <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No active positions. Monitoring for high-probability setups...</p>
            </Card>
          )}

          {/* Session History */}
          <Card title="Session History" subtitle="Results from current execution cycle">
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sessionTrades.length === 0 ? (
                  <div style={{ padding: '40px', textAlign: 'center', opacity: 0.5 }}>
                    <History size={32} style={{ marginBottom: '12px' }} />
                    <p>No trades executed this session</p>
                  </div>
                ) : (
                  sessionTrades.map(trade => (
                    <div key={trade.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                       <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                          <div style={{ width: '4px', height: '24px', borderRadius: '2px', background: trade.type === 'Long' ? 'var(--primary)' : 'var(--danger)' }} />
                          <div>
                            <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{trade.type} @ {trade.entry.toFixed(1)}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{trade.time}</p>
                          </div>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 800, color: trade.pnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toLocaleString()}
                          </p>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           <Card title="Account Pulse">
             <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Sim Balance</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: 900 }}>${balance.toLocaleString()}</h3>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                   <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Accuracy</p>
                   <p style={{ fontWeight: 700 }}>{sessionAccuracy}%</p>
                </div>
                <div>
                   <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Session PnL</p>
                   <p style={{ fontWeight: 700, color: totalSessionPnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                     {totalSessionPnl >= 0 ? '+' : ''}{totalSessionPnl.toLocaleString()}
                   </p>
                </div>
             </div>
           </Card>

           <Card title="Execution">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <Button 
                      variant="primary" 
                      style={{ height: '70px', flexDirection: 'column' }}
                      onClick={() => handleTrade('Long')}
                      disabled={!!position}
                      glow={!position}
                    >
                      <TrendingUp size={20} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>LONG</span>
                    </Button>
                    <Button 
                      variant="danger" 
                      style={{ height: '70px', flexDirection: 'column' }}
                      onClick={() => handleTrade('Short')}
                      disabled={!!position}
                      glow={!position}
                    >
                      <TrendingDown size={20} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>SHORT</span>
                    </Button>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Stop Loss (Pts)</label>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{sl}</span>
                       </div>
                       <input 
                         type="range" min="5" max="100" step="5" 
                         value={sl} onChange={(e) => setSl(Number(e.target.value))}
                         style={{ accentColor: 'var(--danger)' }}
                       />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Take Profit (Pts)</label>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{tp}</span>
                       </div>
                       <input 
                         type="range" min="10" max="200" step="10" 
                         value={tp} onChange={(e) => setTp(Number(e.target.value))}
                         style={{ accentColor: 'var(--success)' }}
                       />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <label style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Contracts</label>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>{contracts}</span>
                       </div>
                       <input 
                         type="range" min="1" max="10" 
                         value={contracts} onChange={(e) => setContracts(Number(e.target.value))}
                       />
                    </div>
                 </div>
              </div>
           </Card>

           <Card style={{ border: '1px solid var(--primary)', background: 'rgba(59, 130, 246, 0.05)' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                 <AlertCircle size={20} color="var(--primary)" />
                 <div>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: 700 }}>Trading Edge</h5>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                      Simulation environment is optimized for NQ. One point = $20. Play with different risk-reward profiles to see equity curve impact.
                    </p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ExecutionSimulator;
