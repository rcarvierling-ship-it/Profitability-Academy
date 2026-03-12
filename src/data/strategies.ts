export interface Strategy {
  id: string;
  name: string;
  type: string;
  description: string;
  winRate: string;
  rr: string;
  difficulty: 'Low' | 'Medium' | 'High';
  tags: string[];
  tradesLogged: number;
}

export const strategiesData: Strategy[] = [];
