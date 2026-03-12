import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Trade } from '../data/journal';
import type { Strategy } from '../data/strategies';

interface AcademyProgress {
  completedLessons: string[];
}

interface AppState {
  trades: Trade[];
  strategies: Strategy[];
  academyProgress: AcademyProgress;
}

interface AppContextType extends AppState {
  addTrade: (trade: Trade) => void;
  addStrategy: (strategy: Strategy) => void;
  completeLesson: (lessonId: string) => void;
  resetData: () => void;
}

const STORAGE_KEY = 'profitability_academy_data';

const initialState: AppState = {
  trades: [],
  strategies: [],
  academyProgress: { completedLessons: [] },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialState;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addTrade = (trade: Trade) => {
    setState(prev => ({ ...prev, trades: [trade, ...prev.trades] }));
  };

  const addStrategy = (strategy: Strategy) => {
    setState(prev => ({ ...prev, strategies: [strategy, ...prev.strategies] }));
  };

  const completeLesson = (lessonId: string) => {
    setState(prev => ({
      ...prev,
      academyProgress: {
        ...prev.academyProgress,
        completedLessons: prev.academyProgress.completedLessons.includes(lessonId)
          ? prev.academyProgress.completedLessons
          : [...prev.academyProgress.completedLessons, lessonId],
      },
    }));
  };

  const resetData = () => {
    setState(initialState);
  };

  return (
    <AppContext.Provider value={{ ...state, addTrade, addStrategy, completeLesson, resetData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
