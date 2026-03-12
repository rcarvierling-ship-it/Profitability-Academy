import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { TradingChart } from '../../components/ui/TradingChart';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  TrendingUp, 
  TrendingDown, 
  History,
  AlertCircle,
  Settings2,
  ChevronDown
} from 'lucide-react';

interface SimulatedBar {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface SimulatedTrade {
  id: string;
  type: 'Long' | 'Short';
  entry: number;
  exit: number;
  pnl: number;
  time: string;
  ticker: string;
}

const TICKERS = [
  { id: 'NQ', name: 'Nasdaq 100', baseValue: 18200, volatility: 0.15, pointValue: 20 },
  { id: 'ES', name: 'S&P 500', baseValue: 5120, volatility: 0.08, pointValue: 50 },
  { id: 'GC', name: 'Gold', baseValue: 2150, volatility: 0.05, pointValue: 100 },
  { id: 'BTC', name: 'Bitcoin', baseValue: 68000, volatility: 0.45, pointValue: 1 },
];

const TIMEFRAMES = ['1m', '5m', '15m'];

const ExecutionSimulator: React.FC = () => {
  const resetHub = () => {
    window.location.reload();
  };

  const centerOnPrice = () => {
    // This is handled by chart autoScale typically, but we can trigger a re-render
    setChartData([...chartData]);
  };
  // Simulator State
  const [isPlaying, setIsPlaying] = useState(false);
  const [ticker, setTicker] = useState(TICKERS[0]);
  const [timeframe, setTimeframe] = useState('1m');
  const [balance, setBalance] = useState(100000);
  const [sessionTrades, setSessionTrades] = useState<SimulatedTrade[]>([]);
  
  // Active Position State
  const [position, setPosition] = useState<'Long' | 'Short' | null>(null);
  const [entryPrice, setEntryPrice] = useState<number | null>(null);
  const [contracts, setContracts] = useState(2);
  const [slPrice, setSlPrice] = useState<number | null>(null);
  const [tpPrice, setTpPrice] = useState<number | null>(null);
  const [currentPnl, setCurrentPnl] = useState(0);

  // Price Engine State
  const [regime, setRegime] = useState<'Trend' | 'Chop'>('Chop');
  const [trendDirection, setTrendDirection] = useState<1 | -1>(1);
  const [chartData, setChartData] = useState<SimulatedBar[]>([]);

  const chartDataRef = useRef<SimulatedBar[]>([]);
  chartDataRef.current = chartData;

  // Initialize Data
  useEffect(() => {
    const initialData: SimulatedBar[] = [];
    let lastClose = ticker.baseValue;
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 0; i < 150; i++) {
      const vol = ticker.baseValue * ticker.volatility * 0.001;
      const open = lastClose;
      const high = open + Math.random() * vol;
      const low = open - Math.random() * vol;
      const close = low + Math.random() * (high - low);
      
      initialData.push({
        time: now - (150 - i) * 60,
        open,
        high,
        low,
        close
      });
      lastClose = close;
    }
    setChartData(initialData);
  }, [ticker]);

  const lastBar = useMemo(() => chartData[chartData.length - 1], [chartData]);

  // Handle Level Changes from Chart Dragging
  const handleLevelChange = (type: 'SL' | 'TP', newPrice: number) => {
    if (type === 'SL') setSlPrice(newPrice);
    else setTpPrice(newPrice);
  };

  // Handle Simulation Loop
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        const currentData = chartDataRef.current;
        const lastTick = currentData[currentData.length - 1];
        
        // Dynamic Regime Logic
        if (Math.random() < 0.03) {
          setRegime(r => r === 'Trend' ? 'Chop' : 'Trend');
          if (Math.random() < 0.5) setTrendDirection(d => d === 1 ? -1 : 1);
        }

        const volBase = ticker.baseValue * ticker.volatility * 0.001;
        const volatility = regime === 'Trend' ? volBase * 2 : volBase;
        const bias = regime === 'Trend' ? trendDirection * (volBase * 0.5) : 0;
        
        const open = lastTick.close;
        const high = open + Math.random() * volatility + Math.max(0, bias);
        const low = open - Math.random() * volatility + Math.min(0, bias);
        const close = low + Math.random() * (high - low);

        let newTime = Math.floor(Date.now() / 1000);
        if (newTime <= lastTick.time) {
          newTime = lastTick.time + 1;
        }

        const newPoint: SimulatedBar = {
          time: newTime,
          open,
          high,
          low,
          close
        };

        setChartData(prev => [...prev.slice(1), newPoint]);

        // Position PnL & Auto-Exits
        if (position && entryPrice) {
          const price = close;
          const diff = position === 'Long' ? price - entryPrice : entryPrice - price;
          const pnlVal = diff * contracts * ticker.pointValue;
          setCurrentPnl(pnlVal);

          // SL/TP Check
          if (slPrice) {
            if ((position === 'Long' && price <= slPrice) || 
                (position === 'Short' && price >= slPrice)) {
              closePosition(price);
              return;
            }
          }
          if (tpPrice) {
            if ((position === 'Long' && price >= tpPrice) || 
                (position === 'Short' && price <= tpPrice)) {
              closePosition(price);
              return;
            }
          }
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, position, entryPrice, slPrice, tpPrice, contracts, regime, trendDirection, ticker]);

  const handleTrade = (type: 'Long' | 'Short') => {
    if (position) return;
    const price = lastBar.close;
    setPosition(type);
    setEntryPrice(price);
    
    // Auto-set initial SL/TP and Entry
    const slOffset = ticker.baseValue * 0.005; // 0.5% risk
    const tpOffset = slOffset * 2; // 2:1 RR
    
    setSlPrice(type === 'Long' ? price - slOffset : price + slOffset);
    setTpPrice(type === 'Long' ? price + tpOffset : price - tpOffset);
  };

  const closePosition = (exitPrice = lastBar.close) => {
    if (!position || !entryPrice) return;

    const diff = position === 'Long' ? exitPrice - entryPrice : entryPrice - exitPrice;
    const finalPnl = diff * contracts * ticker.pointValue;

    const newTrade: SimulatedTrade = {
      id: Math.random().toString(36).substr(2, 9),
      type: position,
      entry: entryPrice,
      exit: exitPrice,
      pnl: finalPnl,
      time: new Date().toLocaleTimeString(),
      ticker: ticker.id
    };

    setSessionTrades(prev => [newTrade, ...prev]);
    setBalance(prev => prev + finalPnl);
    setPosition(null);
    setEntryPrice(null);
    setSlPrice(null);
    setTpPrice(null);
    setCurrentPnl(0);
  };

  const sessionAccuracy = useMemo(() => {
    if (sessionTrades.length === 0) return 0;
    const wins = sessionTrades.filter(t => t.pnl > 0).length;
    return Math.round((wins / sessionTrades.length) * 100);
  }, [sessionTrades]);

  const totalSessionPnl = sessionTrades.reduce((sum, t) => sum + t.pnl, 0);

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header with Tools */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Execution Sim</h1>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
              <select 
                value={ticker.id} 
                onChange={(e) => setTicker(TICKERS.find(t => t.id === e.target.value) || TICKERS[0])}
                style={{
                  appearance: 'none',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '6px 32px 6px 12px',
                  color: 'white',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {TICKERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
            </div>

            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '2px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  style={{
                    padding: '4px 10px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    borderRadius: '6px',
                    background: timeframe === tf ? 'var(--primary)' : 'transparent',
                    color: timeframe === tf ? 'white' : 'var(--text-dim)',
                    transition: '0.2s'
                  }}
                >
                  {tf}
                </button>
              ))}
            </div>
            
            <Badge color={isPlaying ? 'success' : 'neutral'}>
              {isPlaying ? 'ACTIVE' : 'PAUSED'}
            </Badge>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="outline" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            {isPlaying ? 'Pause' : 'Resume Engine'}
          </Button>
          <Button variant="outline" onClick={centerOnPrice}>
             <Settings2 size={18} /> Fit View
          </Button>
          <Button variant="outline" onClick={resetHub}>
            <RotateCcw size={18} /> Reset Hub
          </Button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
        {/* Main Chart Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ position: 'relative' }}>
             <TradingChart 
                data={chartData} 
                slPrice={slPrice}
                tpPrice={tpPrice}
                entryPrice={entryPrice}
                onLevelChange={handleLevelChange}
             />
             
             {/* Dynamic Overlay Info */}
             <div style={{
               position: 'absolute',
               top: '20px',
               left: '20px',
               pointerEvents: 'none',
               display: 'flex',
               flexDirection: 'column',
               gap: '4px'
             }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 900, color: 'white' }}>{ticker.id}</span>
                  <span style={{ color: 'var(--success)', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                    {lastBar?.close.toFixed(2)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '4px' }}>
                      REGIME: {regime}
                   </span>
                </div>
             </div>
          </div>

          {/* Active Orders / Position Status */}
          {position && entryPrice ? (
            <Card style={{ padding: '24px', borderLeft: `6px solid ${position === 'Long' ? 'var(--primary)' : 'var(--danger)'}`, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Position</p>
                  <p style={{ fontWeight: 800, color: position === 'Long' ? 'var(--primary)' : 'var(--danger)', fontSize: '1.1rem' }}>
                    {position} {contracts}x {ticker.id}
                  </p>
                </div>
                <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Entry / SL / TP</p>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>
                      {entryPrice.toFixed(1)} 
                      <span style={{ opacity: 0.3, margin: '0 8px' }}>|</span> 
                      <span style={{ color: 'var(--danger)' }}>{slPrice ? slPrice.toFixed(1) : '---'}</span> 
                      <span style={{ opacity: 0.3, margin: '0 8px' }}>|</span> 
                      <span style={{ color: 'var(--success)' }}>{tpPrice ? tpPrice.toFixed(1) : '---'}</span>
                    </p>
                </div>
                <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '4px' }}>Unrealized PnL</p>
                    <p style={{ fontWeight: 900, color: currentPnl >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: '1.25rem' }}>
                      ${currentPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                   <Button variant="danger" glow size="lg" onClick={() => closePosition()}>EXIT NOW</Button>
                </div>
              </div>
            </Card>
          ) : (
            <div style={{ 
              padding: '24px', 
              textAlign: 'center', 
              border: '1px dashed var(--border-subtle)', 
              borderRadius: '16px',
              background: 'rgba(255,255,255,0.01)',
              color: 'var(--text-dim)'
            }}>
               <p style={{ fontSize: '0.9rem' }}>Ready to trade {ticker.name}. Hover over the chart and drag lines to adjust risk.</p>
            </div>
          )}

          {/* Session History */}
          <Card 
            title="Session Performance" 
            icon={<History size={18} />} 
            style={{ flex: 1 }}
          >
             <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
                {sessionTrades.length === 0 ? (
                  <div style={{ padding: '30px', textAlign: 'center', opacity: 0.3 }}>
                    <p>No trade history for this session</p>
                  </div>
                ) : (
                  sessionTrades.map(trade => (
                    <div key={trade.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)' }}>
                       <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ 
                            width: '36px', 
                            height: '36px', 
                            borderRadius: '10px', 
                            background: trade.type === 'Long' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                             {trade.type === 'Long' ? <TrendingUp size={18} color="var(--primary)" /> : <TrendingDown size={18} color="var(--danger)" />}
                          </div>
                          <div>
                            <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>{trade.ticker} {trade.type}</p>
                            <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>{trade.time} • Entry: {trade.entry.toFixed(1)}</p>
                          </div>
                       </div>
                       <div style={{ textAlign: 'right' }}>
                          <p style={{ fontWeight: 900, fontSize: '1.1rem', color: trade.pnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                            {trade.pnl >= 0 ? '+' : '-'}${Math.abs(trade.pnl).toLocaleString()}
                          </p>
                       </div>
                    </div>
                  ))
                )}
             </div>
          </Card>
        </div>

        {/* Sidebar Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
           <Card title="Account Pulse">
             <div style={{ marginBottom: '20px' }}>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Current Balance</p>
                <h3 style={{ fontSize: '2rem', fontWeight: 900 }}>${balance.toLocaleString()}</h3>
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}>
                   <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Accuracy</p>
                   <p style={{ fontWeight: 800, fontSize: '1.1rem' }}>{sessionAccuracy}%</p>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '12px' }}>
                   <p style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Session Net</p>
                   <p style={{ fontWeight: 800, fontSize: '1.1rem', color: totalSessionPnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                     {totalSessionPnl >= 0 ? '+' : ''}{totalSessionPnl.toLocaleString()}
                   </p>
                </div>
             </div>
           </Card>

           <Card title="Order Management" icon={<Settings2 size={16} />}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Button 
                      variant="primary" 
                      style={{ height: '80px', flexDirection: 'column', borderRadius: '16px' }}
                      onClick={() => handleTrade('Long')}
                      disabled={!!position}
                      glow={!position}
                    >
                      <TrendingUp size={24} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>BUY</span>
                    </Button>
                    <Button 
                      variant="danger" 
                      style={{ height: '80px', flexDirection: 'column', borderRadius: '16px' }}
                      onClick={() => handleTrade('Short')}
                      disabled={!!position}
                      glow={!position}
                    >
                      <TrendingDown size={24} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>SELL</span>
                    </Button>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Size (Contracts)</label>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--primary)' }}>{contracts}</span>
                       </div>
                       <input 
                         type="range" min="1" max="20" 
                         value={contracts} onChange={(e) => setContracts(Number(e.target.value))}
                         style={{ accentColor: 'var(--primary)' }}
                       />
                    </div>
                    
                    <div style={{ 
                      padding: '16px', 
                      borderRadius: '12px', 
                      background: 'rgba(59, 130, 246, 0.05)', 
                      border: '1px solid rgba(59, 130, 246, 0.1)' 
                    }}>
                       <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <AlertCircle size={16} color="var(--primary)" style={{ marginTop: '2px' }} />
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
                             <strong>Chart Controls Active:</strong> Drag the Red (SL) and Green (TP) lines on the chart to adjust your risk in real-time.
                          </p>
                       </div>
                    </div>
                 </div>
              </div>
           </Card>

           <Card style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, transparent 100%)' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                 <div style={{ padding: '10px', borderRadius: '10px', background: 'var(--success)', color: 'white' }}>
                    <TrendingUp size={20} />
                 </div>
                 <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Edge Detector</h5>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '4px' }}>
                      Current volatility and price action suggest a high-probability reversal zone.
                    </p>
                 </div>
              </div>
           </Card>
        </div>
      </div>
      
      <style>{`
        select:focus { outline: none; border-color: var(--primary); }
        input[type=range] { width: 100%; height: 6px; border-radius: 3px; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default ExecutionSimulator;
