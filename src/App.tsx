import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/theme.css';

import AppShell from './components/layout/AppShell';
import Dashboard from './pages/Dashboard';
import Academy from './pages/Academy/Academy';
import Strategies from './pages/Strategies';
import SetupDetector from './pages/SetupDetector';
import Journal from './pages/Journal/Journal';
import ExecutionSimulator from './pages/Simulator/ExecutionSimulator';
import LessonView from './pages/Academy/LessonView';
import Landing from './pages/Landing';
import { useAuth } from './context/AuthContext';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Placeholder pages for now
const PagePlaceholder = ({ title }: { title: string }) => (
  <div className="animate-fade-in">
    <h1 className="gradient-text" style={{ fontSize: '2rem', marginBottom: '1rem' }}>{title}</h1>
    <div className="glass-card" style={{ padding: '2rem', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-muted)' }}>{title} content coming soon...</p>
    </div>
  </div>
);

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Login Route */}
        <Route path="/login" element={<Landing />} />

        {/* Protected App Routes */}
        <Route path="/*" element={
          <ProtectedRoute>
            <AppShell>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="academy" element={<Academy />} />
                <Route path="lesson/:id" element={<LessonView />} />
                <Route path="strategies" element={<Strategies />} />
                <Route path="strategy/:id" element={<PagePlaceholder title="Strategy Details" />} />
                <Route path="replay" element={<ExecutionSimulator />} />
                <Route path="journal" element={<Journal />} />
                <Route path="trade/:id" element={<PagePlaceholder title="Trade Detail" />} />
                <Route path="journal/replay/:id" element={<PagePlaceholder title="Journal Replay" />} />
                <Route path="journal/flashcards" element={<PagePlaceholder title="Journal Flashcards" />} />
                <Route path="backtesting" element={<PagePlaceholder title="Backtesting" />} />
                <Route path="risk" element={<PagePlaceholder title="Risk Management" />} />
                <Route path="psychology" element={<PagePlaceholder title="Psychology" />} />
                <Route path="training" element={<PagePlaceholder title="Training" />} />
                <Route path="setup-detector" element={<SetupDetector />} />
                <Route path="pro" element={<PagePlaceholder title="Pro Mode" />} />
                <Route path="no-trade" element={<PagePlaceholder title="No-Trade Mode" />} />
                <Route path="compounding" element={<PagePlaceholder title="Compounding" />} />
                <Route path="timeline" element={<PagePlaceholder title="Timeline" />} />
                <Route path="daily-engine" element={<PagePlaceholder title="Daily Engine" />} />
                <Route path="discipline-engine" element={<PagePlaceholder title="Discipline Engine" />} />
                <Route path="weekly-review" element={<PagePlaceholder title="Weekly Review" />} />
                <Route path="monthly-review" element={<PagePlaceholder title="Monthly Review" />} />
                <Route path="analytics" element={<PagePlaceholder title="Analytics" />} />
                <Route path="settings" element={<PagePlaceholder title="Settings" />} />
                
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppShell>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
