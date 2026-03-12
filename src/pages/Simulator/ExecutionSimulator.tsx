import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { TradingChart } from '../../components/ui/TradingChart';
import { 
  Play, 
  Pause, 
  TrendingUp, 
  TrendingDown, 
  History,
  ChevronDown,
  Maximize2,
  Minimize2,
  Wallet,
  Activity,
  Zap
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
  // Simulator State
  const [isPlaying, setIsPlaying] = useState(false);
  const [ticker, setTicker] = useState(TICKERS[0]);
  const [timeframe, setTimeframe] = useState('1m');
  const [balance, setBalance] = useState(100000);
  const [sessionTrades, setSessionTrades] = useState<SimulatedTrade[]>([]);
  const [isImmersive, setIsImmersive] = useState(false);
  
  // Active Position State
  const [position, setPosition] = useState<'Long' | 'Short' | null>(null);
  const [entryPrice, setEntryPrice] = useState<number | null>(null);
  const [contracts, setContracts] = useState(2);
  const [slPrice, setSlPrice] = useState<number | null>(null);
  const [tpPrice, setTpPrice] = useState<number | null>(null);
  const [currentPnl, setCurrentPnl] = useState(0);

  // Momentum-Core Price Engine State
  const [regime, setRegime] = useState<'Trend' | 'Chop'>('Chop');
  const [momentum, setMomentum] = useState(0); // -1 to 1
  const [volatilityScale, setVolatilityScale] = useState(1);
  const [chartData, setChartData] = useState<SimulatedBar[]>([]);

  const chartDataRef = useRef<SimulatedBar[]>([]);
  chartDataRef.current = chartData;

  // Initialize Data
  useEffect(() => {
    const initialData: SimulatedBar[] = [];
    let lastClose = ticker.baseValue;
    const now = Math.floor(Date.now() / 1000);
    
    for (let i = 0; i < 150; i++) {
      const vol = ticker.baseValue * ticker.volatility * 0.0012;
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

  const handleLevelChange = (type: 'SL' | 'TP', newPrice: number) => {
    if (type === 'SL') setSlPrice(newPrice);
    else setTpPrice(newPrice);
  };

  // Handle Simulation Loop (Momentum-Core Upgrade)
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        const currentData = chartDataRef.current;
        const lastTick = currentData[currentData.length - 1];
        
        // 1. Regime & Momentum Evolution
        if (Math.random() < 0.04) {
          setRegime(r => r === 'Trend' ? 'Chop' : 'Trend');
          setVolatilityScale(0.8 + Math.random() * 1.5);
        }

        // Drifting Momentum logic (Simulates accumulation/distribution)
        setMomentum(prev => {
           const change = (Math.random() - 0.5) * 0.4;
           let next = prev + change;
           if (regime === 'Chop') next *= 0.5; // Zap momentum in chop
           return Math.max(-1.5, Math.min(1.5, next));
        });

        // 2. Market Physics Calculation
        // Expansion: High momentum = Fast bars. Correction: Low momentum = Drifting bars.
        const volBase = ticker.baseValue * ticker.volatility * 0.001;
        const impulse = momentum * volBase * 2.5;
        const correction = regime === 'Chop' ? (Math.random() - 0.5) * volBase : 0;
        
        const open = lastTick.close;
        const range = volBase * volatilityScale;
        const high = open + Math.random() * range + Math.max(0, impulse);
        const low = open - Math.random() * range + Math.min(0, impulse);
        const close = low + Math.random() * (high - low) + correction;

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

        // 3. Position Strategy Engine
        if (position && entryPrice) {
          const price = close;
          const diff = position === 'Long' ? price - entryPrice : entryPrice - price;
          const pnlVal = diff * contracts * ticker.pointValue;
          setCurrentPnl(pnlVal);

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
  }, [isPlaying, position, entryPrice, slPrice, tpPrice, contracts, regime, momentum, volatilityScale, ticker]);

  const handleTrade = (type: 'Long' | 'Short') => {
    if (position) return;
    const price = lastBar.close;
    setPosition(type);
    setEntryPrice(price);
    
    // Auto-set initial SL/TP and Entry (Standard 2:1 RR)
    const slOffset = ticker.baseValue * 0.004; 
    const tpOffset = slOffset * 2; 
    
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

  const totalSessionPnl = sessionTrades.reduce((sum, t) => sum + t.pnl, 0);

  // Helper for "Fit View"
  const centerOnPrice = () => {
    setChartData([...chartData]); 
  };

  const resetHub = () => {
    window.location.reload();
  };

  const containerStyles: React.CSSProperties = isImmersive ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
    background: '#0a0a0c',
    display: 'flex',
    flexDirection: 'column'
  } : {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    animation: 'fade-in 0.5s ease'
  };

  return (
    <div style={containerStyles}>
      {!isImmersive ? (
        <>
          {/* Default Layout Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '4px' }}>Execution Sim</h1>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ position: 'relative' }}>
                  <select 
                    value={ticker.id} 
                    onChange={(e) => setTicker(TICKERS.find(t => t.id === e.target.value) || TICKERS[0])}
                    className="ticker-select"
                  >
                    {TICKERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                  <ChevronDown size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', opacity: 0.5 }} />
                </div>

                <div className="timeframe-group">
                  {TIMEFRAMES.map(tf => (
                    <button
                      key={tf}
                      onClick={() => setTimeframe(tf)}
                      className={`tf-btn ${timeframe === tf ? 'active' : ''}`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
                
                <Badge color={isPlaying ? 'success' : 'neutral'}>
                  {isPlaying ? 'ENGINE ACTIVE' : 'ENGINE PAUSED'}
                </Badge>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <Button variant="primary" glow onClick={() => setIsImmersive(true)}>
                <Maximize2 size={18} /> Deep Flow
              </Button>
              <Button variant="outline" onClick={() => setIsPlaying(!isPlaying)}>
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                {isPlaying ? 'Pause' : 'Resume Engine'}
              </Button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ position: 'relative' }}>
                 <TradingChart 
                    data={chartData} 
                    slPrice={slPrice}
                    tpPrice={tpPrice}
                    entryPrice={entryPrice}
                    onLevelChange={handleLevelChange}
                    height={isImmersive ? '100vh' : 480}
                    colors={{ backgroundColor: '#0a0a0c' }}
                 />
                 <div className="chart-info-overlay">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="ticker-label">{ticker.id}</span>
                      <span className="price-label">{lastBar?.close.toFixed(2)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                       <Badge color="neutral" style={{ background: 'rgba(0,0,0,0.6)' }}>
                          REGIME: {regime}
                       </Badge>
                       <Badge color="primary" style={{ background: 'rgba(0,0,0,0.6)' }}>
                          MOMENTUM: {momentum > 0.5 ? 'STRONG' : momentum < -0.5 ? 'WEAK' : 'STABLE'}
                       </Badge>
                    </div>
                 </div>
              </div>

              {position && entryPrice ? (
                <Card style={{ padding: '24px', borderLeft: `6px solid ${position === 'Long' ? 'var(--primary)' : 'var(--danger)'}`, background: 'rgba(255,255,255,0.02)' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr 150px', gap: '20px', alignItems: 'center' }}>
                    <div>
                      <p className="stat-label">Position</p>
                      <p className="stat-value" style={{ color: position === 'Long' ? 'var(--primary)' : 'var(--danger)' }}>
                        {position} {contracts}x
                      </p>
                    </div>
                    <div>
                        <p className="stat-label">Risk Profile</p>
                        <p className="stat-value-small">
                          {entryPrice.toFixed(1)} 
                          <span className="divider">|</span> 
                          <span style={{ color: 'var(--danger)' }}>{slPrice ? slPrice.toFixed(1) : '---'}</span> 
                          <span className="divider">|</span> 
                          <span style={{ color: 'var(--success)' }}>{tpPrice ? tpPrice.toFixed(1) : '---'}</span>
                        </p>
                    </div>
                    <div>
                        <p className="stat-label">Floating PnL</p>
                        <p className="stat-value" style={{ color: currentPnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                          ${currentPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                    </div>
                    <Button variant="danger" glow onClick={() => closePosition()}>EXIT</Button>
                  </div>
                </Card>
              ) : (
                <div className="ready-placeholder">
                   <Zap size={18} style={{ opacity: 0.5 }} />
                   <p>System Ready. Engage {ticker.id} Momentum Liquidity.</p>
                </div>
              )}

              <Card title="Session Streams" icon={<History size={18} />}>
                 <div className="session-history">
                    {sessionTrades.length === 0 ? (
                      <div className="empty-history">No streams detected</div>
                    ) : (
                      sessionTrades.map(trade => (
                        <div key={trade.id} className="history-item">
                           <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                              <div className={`history-icon ${trade.type === 'Long' ? 'up' : 'down'}`}>
                                 {trade.type === 'Long' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                              </div>
                              <div>
                                <p style={{ fontWeight: 800 }}>{trade.ticker} {trade.type}</p>
                                <p style={{ fontSize: '0.7rem', opacity: 0.5 }}>{trade.time} • Entry {trade.entry.toFixed(1)}</p>
                              </div>
                           </div>
                           <p className={`history-pnl ${trade.pnl >= 0 ? 'win' : 'loss'}`}>
                             {trade.pnl >= 0 ? '+' : '-'}${Math.abs(trade.pnl).toLocaleString()}
                           </p>
                        </div>
                      ))
                    )}
                 </div>
              </Card>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
               <Card title="Account Pulse">
                 <div style={{ marginBottom: '20px' }}>
                    <p className="stat-label">Total Equity</p>
                    <h3 style={{ fontSize: '2rem', fontWeight: 900 }}>${balance.toLocaleString()}</h3>
                 </div>
                 <div className="stat-grid">
                    <div className="stat-box">
                       <p className="stat-label-tiny">Net Growth</p>
                       <p className={`stat-value-mid ${totalSessionPnl >= 0 ? 'win' : 'loss'}`}>
                         {totalSessionPnl >= 0 ? '+' : ''}{totalSessionPnl.toLocaleString()}
                       </p>
                    </div>
                    <div className="stat-box">
                       <p className="stat-label-tiny">Vol Scale</p>
                       <p className="stat-value-mid">{(volatilityScale * 100).toFixed(0)}%</p>
                    </div>
                 </div>
               </Card>

               <Card title="Execution Hub">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Button variant="primary" className="exec-btn" onClick={() => handleTrade('Long')} disabled={!!position} glow={!position}>
                          <TrendingUp size={20} /> LONG
                        </Button>
                        <Button variant="danger" className="exec-btn" onClick={() => handleTrade('Short')} disabled={!!position} glow={!position}>
                          <TrendingDown size={20} /> SHORT
                        </Button>
                     </div>
                     <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>Leverage Unit</span>
                          <span style={{ fontSize: '0.9rem', fontWeight: 800 }}>{contracts} CTR</span>
                       </div>
                       <input type="range" min="1" max="20" value={contracts} onChange={(e) => setContracts(Number(e.target.value))} className="contract-slider" />
                     </div>
                  </div>
               </Card>
               
               <div className="tool-footer">
                  <Button variant="outline" size="sm" onClick={centerOnPrice}>Fit Action</Button>
                  <Button variant="outline" size="sm" onClick={resetHub}>Reset Hub</Button>
               </div>
            </div>
          </div>
        </>
      ) : (
        /* Immersive Deep Flow Layout */
        <div style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh', overflow: 'hidden', background: '#0a0a0c', zIndex: 1000 }}>
           <TradingChart 
              data={chartData} 
              slPrice={slPrice}
              tpPrice={tpPrice}
              entryPrice={entryPrice}
              onLevelChange={handleLevelChange}
              height="100vh"
              colors={{ backgroundColor: '#0a0a0c' }}
           />

           {/* Top Left: Navigation & Context */}
           <div className="immersive-hud-tl">
              <div className="hud-pill">
                 <select value={ticker.id} onChange={(e) => setTicker(TICKERS.find(t => t.id === e.target.value) || TICKERS[0])} className="hud-select">
                    {TICKERS.map(t => <option key={t.id} value={t.id}>{t.id}</option>)}
                 </select>
                 <div className="hud-tf-group">
                    {TIMEFRAMES.map(tf => (
                      <button key={tf} onClick={() => setTimeframe(tf)} className={`hud-tf-btn ${timeframe === tf ? 'active' : ''}`}>{tf}</button>
                    ))}
                 </div>
              </div>
              <div className="hud-indicator">
                 <div className={`status-dot ${isPlaying ? 'active' : ''}`} />
                 <span>{ticker.name} <span style={{ opacity: 0.5 }}>{regime}</span></span>
              </div>
           </div>

           {/* Top Right: Performance HUD */}
           <div className="immersive-hud-tr">
              <div className="hud-stat-pill">
                 <Wallet size={14} style={{ opacity: 0.6 }} />
                 <span>${balance.toLocaleString()}</span>
              </div>
              <div className={`hud-stat-pill ${(totalSessionPnl + currentPnl) >= 0 ? 'win' : 'loss'}`}>
                 <Activity size={14} />
                 <span>{(totalSessionPnl + currentPnl) >= 0 ? '+' : ''}{(totalSessionPnl + currentPnl).toLocaleString()}</span>
              </div>
              <button onClick={() => setIsImmersive(false)} className="hud-exit-btn">
                 <Minimize2 size={16} /> Close Flow
              </button>
           </div>

           {/* Bottom Center: Execution HUD */}
           <div className="immersive-hud-bc">
              {position ? (
                <div className="hud-exec-card active">
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>UNREALIZED PNL</span>
                      <span style={{ fontSize: '1.5rem', fontWeight: 900, color: currentPnl >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        ${currentPnl.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                   </div>
                   <div className="hud-pos-info">
                      <Badge color={position === 'Long' ? 'primary' : 'danger'}>{position} {contracts}x</Badge>
                      <Button variant="danger" size="sm" glow onClick={() => closePosition()}>EXIT</Button>
                   </div>
                </div>
              ) : (
                <div className="hud-exec-card">
                   <div className="hud-order-grid">
                      <button onClick={() => handleTrade('Long')} className="hud-buy-btn">BUY</button>
                      <button onClick={() => handleTrade('Short')} className="hud-sell-btn">SELL</button>
                   </div>
                   <div className="hud-config">
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, opacity: 0.8 }}>QTY: {contracts}</span>
                      <div className="hud-engine-status">
                         <button 
                           onClick={() => setIsPlaying(!isPlaying)} 
                           style={{ background: isPlaying ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', borderRadius: '8px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                         >
                           {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                           <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>{isPlaying ? 'PAUSE' : 'RESUME'}</span>
                         </button>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      )}

      <style>{`
        .ticker-select { appearance: none; background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-radius: 8px; padding: 6px 32px 6px 12px; color: white; font-size: 0.9rem; font-weight: 600; cursor: pointer; }
        .timeframe-group { display: flex; gap: 4px; background: rgba(255,255,255,0.05); padding: 2px; borderRadius: 8px; border: 1px solid var(--border-subtle); border-radius: 8px; }
        .tf-btn { padding: 4px 10px; font-size: 0.75rem; font-weight: 700; border-radius: 6px; border: none; background: transparent; color: var(--text-dim); transition: 0.2s; cursor: pointer; }
        .tf-btn.active { background: var(--primary); color: white; }
        .chart-info-overlay { position: absolute; top: 20px; left: 20px; pointer-events: none; display: flex; flexDirection: column; gap: 4px; z-index: 10; }
        .ticker-label { font-size: 1.25rem; font-weight: 900; color: white; }
        .price-label { font-size: 1.25rem; color: var(--success); fontWeight: 700; font-family: monospace; }
        .stat-label { font-size: 0.75rem; color: var(--text-dim); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
        .stat-value { font-weight: 800; font-size: 1.1rem; }
        .stat-value-small { font-weight: 700; font-size: 0.9rem; font-family: monospace; }
        .divider { opacity: 0.3; margin: 0 8px; }
        .ready-placeholder { padding: 40px; text-align: center; border: 1px dashed var(--border-subtle); border-radius: 16px; background: rgba(255,255,255,0.01); color: var(--text-dim); display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .session-history { display: flex; flex-direction: column; gap: 10px; max-height: 240px; overflow-y: auto; padding-right: 8px; }
        .empty-history { padding: 30px; text-align: center; opacity: 0.3; }
        .history-item { display: flex; justify-content: space-between; padding: 14px; border-radius: 12px; background: rgba(255,255,255,0.02); border: 1px solid var(--border-subtle); }
        .history-icon { width: 32px; height: 32px; border-radius: 10px; display: flex; items-center: center; justify-content: center; }
        .history-icon.up { background: rgba(59, 130, 246, 0.1); color: var(--primary); }
        .history-icon.down { background: rgba(239, 68, 68, 0.1); color: var(--danger); }
        .history-pnl { font-weight: 900; font-size: 1.1rem; }
        .history-pnl.win { color: var(--success); }
        .history-pnl.loss { color: var(--danger); }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .stat-box { background: rgba(255,255,255,0.03); padding: 12px; border-radius: 12px; text-align: center; }
        .stat-label-tiny { font-size: 0.7rem; color: var(--text-dim); margin-bottom: 4px; }
        .stat-value-mid { font-weight: 800; font-size: 1.1rem; }
        .exec-btn { height: 70px; flex-direction: column; border-radius: 16px; font-weight: 800; font-size: 0.9rem; }
        .contract-slider { accent-color: var(--primary); width: 100%; height: 6px; border-radius: 3px; cursor: pointer; }
        .tool-footer { display: flex; justify-content: space-between; gap: 10px; margin-top: auto; }
        
        /* Immersive HUD Styles */
        .immersive-hud-tl { position: absolute; top: 30px; left: 30px; z-index: 200; display: flex; flex-direction: column; gap: 15px; pointer-events: none; }
        .hud-pill { background: rgba(10, 10, 12, 0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 8px; display: flex; gap: 12px; pointer-events: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .hud-select { background: transparent; border: none; color: white; font-weight: 900; font-size: 1.1rem; padding: 0 10px; cursor: pointer; outline: none; border-right: 1px solid rgba(255,255,255,0.1); }
        .hud-tf-group { display: flex; gap: 4px; }
        .hud-tf-btn { background: transparent; border: none; color: var(--text-dim); padding: 6px 12px; font-size: 0.8rem; font-weight: 800; border-radius: 8px; transition: 0.3s; cursor: pointer; }
        .hud-tf-btn.active { background: var(--primary); color: white; }
        .hud-indicator { display: flex; align-items: center; gap: 10px; background: rgba(0,0,0,0.5); padding: 10px 20px; border-radius: 99px; color: white; font-weight: 700; font-size: 0.85rem; width: fit-content; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 10px #22c55e; opacity: 0.3; transition: 0.3s; }
        .status-dot.active { opacity: 1; animation: pulse 1s infinite; }
        
        .immersive-hud-tr { position: absolute; top: 30px; right: 30px; z-index: 200; display: flex; gap: 12px; pointer-events: none; }
        .hud-stat-pill { background: rgba(10, 10, 12, 0.85); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 18px; color: white; display: flex; align-items: center; gap: 10px; font-weight: 900; font-family: monospace; pointer-events: auto; }
        .hud-stat-pill.win { background: rgba(34, 197, 94, 0.15); border-color: rgba(34, 197, 94, 0.3); color: #4ade80; }
        .hud-stat-pill.loss { background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); color: #f87171; }
        .hud-exit-btn { background: rgba(255,0,0,0.1); border: 1px solid rgba(255,0,0,0.2); border-radius: 12px; padding: 10px 15px; color: white; cursor: pointer; display: flex; align-items: center; gap: 8px; pointer-events: auto; transition: 0.3s; }
        .hud-exit-btn:hover { background: rgba(255,0,0,0.3); border-color: rgba(255,0,0,0.5); }
        
        .immersive-hud-bc { position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%); z-index: 200; pointer-events: none; }
        .hud-exec-card { background: rgba(10, 10, 12, 0.9); backdrop-filter: blur(30px); border: 1px solid rgba(255,255,255,0.15); border-radius: 20px; padding: 15px 30px; width: 440px; pointer-events: auto; box-shadow: 0 20px 50px rgba(0,0,0,0.7); display: flex; flex-direction: column; gap: 15px; }
        .hud-exec-card.active { border-color: var(--primary); box-shadow: 0 0 30px rgba(59, 130, 246, 0.2); flex-direction: row; justify-content: space-between; align-items: center; }
        .hud-order-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .hud-buy-btn { background: #3b82f6; border: none; border-radius: 12px; padding: 15px; color: white; font-weight: 900; letter-spacing: 0.1em; cursor: pointer; transition: 0.3s; }
        .hud-buy-btn:hover { background: #2563eb; transform: translateY(-2px); }
        .hud-sell-btn { background: #ef4444; border: none; border-radius: 12px; padding: 15px; color: white; font-weight: 900; letter-spacing: 0.1em; cursor: pointer; transition: 0.3s; }
        .hud-sell-btn:hover { background: #dc2626; transform: translateY(-2px); }
        .hud-config { display: flex; justify-content: space-between; align-items: center; }
        .hud-engine-status { display: flex; gap: 15px; align-items: center; color: var(--text-dim); }
        .hud-engine-status svg { cursor: pointer; transition: 0.2s; }
        .hud-engine-status svg.active { color: white; transform: scale(1.3); }
        .hud-pos-info { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; }
        
        @keyframes pulse { 
          0% { transform: scale(1); opacity: 0.5; } 
          50% { transform: scale(1.5); opacity: 1; }
          100% { transform: scale(1); opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default ExecutionSimulator;
