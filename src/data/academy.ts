export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

export const academyData: Module[] = [
  {
    id: 'foundation',
    title: 'Trading Foundations',
    lessons: [
      { id: 'tf1', title: 'The Serious Trader Mindset', description: 'Transitioning from gambling to professional speculation.', duration: '15 min', difficulty: 'Beginner' },
      { id: 'tf2', title: 'Market Mechanics', description: 'How order flow and liquidity actually move price.', duration: '20 min', difficulty: 'Beginner' },
      { id: 'tf3', title: 'Risk Management 101', description: 'The math behind longevity and the 1% rule.', duration: '25 min', difficulty: 'Beginner' },
    ]
  },
  {
    id: 'structure',
    title: 'Market Structure & Price Action',
    lessons: [
      { id: 'ms1', title: 'BOS & CHoCH', description: 'Identifying trend continuation and reversals.', duration: '30 min', difficulty: 'Intermediate' },
      { id: 'ms2', title: 'Supply & Demand Zones', description: 'Locating high-probability areas of interest.', duration: '35 min', difficulty: 'Intermediate' },
      { id: 'ms3', title: 'Fair Value Gaps (FVG)', description: 'Understanding price imbalances and magnets.', duration: '25 min', difficulty: 'Intermediate' },
    ]
  }
];
