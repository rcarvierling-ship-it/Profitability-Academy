import React, { useState } from 'react';
import { Card, Button, Badge } from '../components/ui';
import { TradingChart } from '../components/ui/TradingChart';
import { 
  Trophy, 
  Target, 
  XCircle, 
  CheckCircle2, 
  ChevronRight,
  Brain
} from 'lucide-react';

const mockChartData = [
  { time: '2023-01-01', value: 10 },
  { time: '2023-01-02', value: 12 },
  { time: '2023-01-03', value: 11 },
  { time: '2023-01-04', value: 15 },
  { time: '2023-01-05', value: 14 },
  { time: '2023-01-06', value: 18 },
  { time: '2023-01-07', value: 17 },
  { time: '2023-01-08', value: 20 },
];

const SetupDetector: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const options = [
    { id: 'a-plus', label: 'A+ Setup', color: 'success' },
    { id: 'a', label: 'A Setup', color: 'primary' },
    { id: 'b', label: 'B Setup', color: 'warning' },
    { id: 'no-trade', label: 'No Trade', color: 'danger' },
  ];

  const handleSelect = (id: string) => {
    setSelectedOption(id);
    setShowResult(true);
    if (id === 'a-plus') setScore(score + 10);
  };

  const nextStep = () => {
    setCurrentStep(currentStep + 1);
    setShowResult(false);
    setSelectedOption(null);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="gradient-text" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Setup Detector</h1>
          <p style={{ color: 'var(--text-dim)' }}>Train your eyes to see the pattern, or the patience to wait.</p>
        </div>
        <Card style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Trophy size={20} color="var(--warning)" />
          <div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Accuracy Score</p>
            <p style={{ fontWeight: 700 }}>{score} pts</p>
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* Chart View */}
        <Card style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Analyzing Market Context...</h3>
            <Badge color="neutral">NQ 15M</Badge>
          </div>
          <div style={{ padding: '20px', height: '340px' }}>
            <TradingChart data={mockChartData} />
          </div>
          <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <Badge color="neutral">PDH Sweep</Badge>
              <Badge color="neutral">MSS Confirmed</Badge>
              <Badge color="neutral">Premium Range</Badge>
            </div>
          </div>
        </Card>

        {/* Interaction Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <Card title="Classification" subtitle="Select the setup quality based on confluences">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
              {options.map((opt) => (
                <Button 
                  key={opt.id}
                  variant={selectedOption === opt.id ? 'primary' : 'outline'}
                  onClick={() => !showResult && handleSelect(opt.id)}
                  style={{ height: '60px', opacity: showResult && selectedOption !== opt.id ? 0.5 : 1 }}
                >
                  {opt.label}
                </Button>
              ))}
            </div>

            {showResult && (
              <div className="animate-fade-in" style={{ 
                padding: '20px', 
                borderRadius: '12px', 
                background: selectedOption === 'a-plus' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                border: selectedOption === 'a-plus' ? '1px solid var(--success)' : '1px solid var(--danger)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {selectedOption === 'a-plus' ? (
                    <CheckCircle2 color="var(--success)" size={24} />
                  ) : (
                    <XCircle color="var(--danger)" size={24} />
                  )}
                  <h4 style={{ fontWeight: 600 }}>
                    {selectedOption === 'a-plus' ? 'Correct Analysis!' : 'Incorrect Identification'}
                  </h4>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', opacity: 0.8 }}>
                  {selectedOption === 'a-plus' 
                    ? 'Perfect. You identified the liquidity sweep followed by a clear displacement and MSS. This is a textbook A+ setup.' 
                    : 'Watch closer. While there was a sweep, price failed to show displacement. This would have been a trap.'}
                </p>
                <Button variant="outline" size="sm" onClick={nextStep} style={{ marginTop: '12px' }}>
                  Next Challenge <ChevronRight size={14} />
                </Button>
              </div>
            )}
          </Card>

          <Card title="Trainer Insights" subtitle="Pattern recognition analytics">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Brain size={16} color="var(--primary)" />
                  <span style={{ fontSize: '0.875rem' }}>Patience Rating</span>
                </div>
                <span style={{ fontWeight: 700 }}>92%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '92%', height: '100%', background: 'var(--primary)' }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Target size={16} color="var(--success)" />
                  <span style={{ fontSize: '0.875rem' }}>Precision Rate</span>
                </div>
                <span style={{ fontWeight: 700 }}>78%</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '78%', height: '100%', background: 'var(--success)' }} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SetupDetector;
