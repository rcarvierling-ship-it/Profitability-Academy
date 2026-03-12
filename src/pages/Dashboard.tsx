import React from 'react';
import { 
  TrendingUp, 
  Zap, 
  Target, 
  Brain, 
  ArrowUpRight, 
  Lock, 
  History, 
  LineChart, 
  Trophy 
} from 'lucide-react';
import { Card, Button, Badge } from '../components/ui';
import { useApp } from '../context/AppContext';
import { academyData } from '../data/academy';
import { getTradingSession } from '../utils/session';
import type { SessionInfo } from '../utils/session';

const Dashboard: React.FC = () => {
  const { trades, academyProgress } = useApp();
  const [sessionInfo, setSessionInfo] = React.useState<SessionInfo>(getTradingSession(new Date()));

  React.useEffect(() => {
    const timer = setInterval(() => {
      setSessionInfo(getTradingSession(new Date()));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Dynamic calculations
  const winRate = trades.length > 0 
    ? (trades.filter((t: any) => t.status === 'Win').length / trades.length) * 100 
    : 0;
  
  const disciplineScore = trades.length > 0
    ? Math.round(trades.reduce((sum: number, t: any) => sum + t.executionRating, 0) / trades.length)
    : 0;

  const totalLessons = academyData.reduce((sum: number, mod) => sum + mod.lessons.length, 0);
  const academyProgressPercent = totalLessons > 0
    ? Math.round((academyProgress.completedLessons.length / totalLessons) * 100)
    : 0;

  const activePhase = academyProgressPercent < 20 ? 'Foundations' : academyProgressPercent < 50 ? 'Execution' : 'Optimization';

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome Section */}
      <section style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '8px' }}>
            Welcome back, Trader
          </h1>
          <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>
            System state: <span style={{ color: 'var(--success)' }}>Active</span> • Session: <span style={{ color: sessionInfo.color }}>{sessionInfo.session}</span>
          </p>
        </div>
        <Button variant="outline" size="sm">
          <History size={16} /> Recent Activity
        </Button>
      </section>

      {/* Primary Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(59, 130, 246, 0.1)' }}>
              <TrendingUp size={20} color="var(--primary)" />
            </div>
            <Badge color="primary">Last 20 Trades</Badge>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Win Rate</p>
          <h4 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{winRate.toFixed(1)}%</h4>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)' }}>
              <Zap size={20} color="var(--success)" />
            </div>
            <Badge color="success">Elite Level</Badge>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Discipline Score</p>
          <h4 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{disciplineScore}</h4>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.1)' }}>
              <Target size={20} color="var(--secondary)" />
            </div>
            <Badge color="neutral">Phase 1</Badge>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Active Phase</p>
          <h4 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{activePhase}</h4>
        </Card>

        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)' }}>
              <Brain size={20} color="var(--danger)" />
            </div>
            <Badge color="danger">High Priority</Badge>
          </div>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>Recent Mistake</p>
          <h4 style={{ fontSize: '1.75rem', fontWeight: 700 }}>{trades.length > 0 ? 'Review Needed' : 'No Data'}</h4>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Daily Training Engine */}
        <Card title="Daily Training Engine" subtitle="Your personalized skill development plan">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontWeight: 600 }}>Lesson: Execution Paradox</span>
                <Badge color="warning">InProgress</Badge>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '65%', height: '100%', background: 'var(--primary)' }} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Button glow style={{ flex: 1 }}>Resume Training</Button>
              <Button variant="outline" style={{ flex: 1 }}>Daily Drill</Button>
            </div>
          </div>
        </Card>

        {/* Performance Trajectory */}
        <Card title="Performance Trajectory" subtitle="Net profit vs expectation">
          <div style={{ height: '160px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ textAlign: 'center' }}>
              <LineChart size={40} color="var(--text-dim)" style={{ marginBottom: '12px', opacity: 0.5 }} />
              <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>{trades.length > 5 ? 'Chart visualization active' : 'Insufficient data for trajectory'}</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button variant="outline" size="sm">Weekly</Button>
              <Button variant="outline" size="sm">Monthly</Button>
            </div>
            <Button variant="outline" size="sm">
              Full Analytics <ArrowUpRight size={14} />
            </Button>
          </div>
        </Card>
      </div>

      {/* Development Unlocks */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <Trophy color="var(--warning)" size={24} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Development Unlocks</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          {[
            { name: 'Advanced Replay', locked: false, icon: <History size={20} /> },
            { name: 'Risk Simulator', locked: true, icon: <Target size={20} /> },
            { name: 'Mistake Heatmap', locked: true, icon: <Brain size={20} /> },
            { name: 'Discipline Engine', locked: true, icon: <Zap size={20} /> },
          ].map((unlock) => (
            <Card key={unlock.name} style={{ opacity: unlock.locked ? 0.6 : 1, textAlign: 'center', padding: '24px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '50%', 
                background: unlock.locked ? 'rgba(255,255,255,0.05)' : 'rgba(59, 130, 246, 0.1)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 16px',
                color: unlock.locked ? 'var(--text-dim)' : 'var(--primary)'
              }}>
                {unlock.locked ? <Lock size={20} /> : unlock.icon}
              </div>
              <h5 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '4px' }}>{unlock.name}</h5>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{unlock.locked ? 'LOCKED' : 'AVAILABLE'}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
