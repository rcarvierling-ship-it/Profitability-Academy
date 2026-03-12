export interface Trade {
  id: string;
  date: string;
  instrument: string;
  type: 'Long' | 'Short';
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  size: number;
  pnl: number;
  rr: number;
  status: 'Win' | 'Loss' | 'Breakeven';
  strategy: string;
  tags: string[];
  executionRating: number; // 0-100
  notes: string;
}

export const journalData: Trade[] = [];
