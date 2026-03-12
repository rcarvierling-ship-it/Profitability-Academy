export interface Lesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  content: string; // Markdown or Rich Text
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
      { 
        id: 'tf1', 
        title: 'The Serious Trader Mindset', 
        description: 'Transitioning from gambling to professional speculation.', 
        duration: '15 min', 
        difficulty: 'Beginner',
        content: `
# The Serious Trader Mindset

Trading is not a game of luck; it is a game of probability and emotional control. To succeed, you must stop looking for "the perfect setup" and start looking for your **edge**.

## Key Mindset Shifts

1. **Think in Samples**: One trade means nothing. Your edge is realized over a series of 20, 50, or 100 trades.
2. **Acceptance of Loss**: A loss is simply a business expense, like rent for a store. It is unavoidable and necessary.
3. **Internal vs External**: You do not control the market. You only control your entry, your exit, and your risk.
4. **Discipline over Intelligence**: A genius without discipline will fail. A simple person with strict rules will succeed.

## The Professional especulator
A professional speculator is a risk manager first and a chart reader second. Your primary job is to protect your capital so you can play the next day.
        `
      },
      { 
        id: 'tf2', 
        title: 'Market Mechanics', 
        description: 'How order flow and liquidity actually move price.', 
        duration: '20 min', 
        difficulty: 'Beginner',
        content: `
# Market Mechanics

Price does not move randomly. It moves to find liquidity—areas where there are significant orders waiting to be filled.

## The Auction Process
The market is a continuous auction. When there's more demand than supply at a certain price level, price moves higher to find more sellers. When there's more supply, price moves lower to find more buyers.

## Liquidity: The Fuel
Liquidity is found at previous swing highs and swing lows. These are the areas where traders place their stop-loss orders. 
- **Buy Side Liquidity (BSL)**: Above high points.
- **Sell Side Liquidity (SSL)**: Below low points.

Large institutional players need to "hunt" this liquidity to fill their massive positions without causing too much slippage.
        `
      },
      { 
        id: 'tf3', 
        title: 'Risk Management 101', 
        description: 'The math behind longevity and the 1% rule.', 
        duration: '25 min', 
        difficulty: 'Beginner',
        content: `
# Risk Management 101

This is the most important lesson in the Academy. Without risk management, any trading strategy is just a slow way to go broke.

## The 1% Rule
Never risk more than **1% of your total account balance** on a single trade. If you have a $100,000 account, your maximum loss per trade should be $1,000.

## Risk/Reward Ratio (RR)
You should always aim for trades where the potential reward is significantly larger than the risk.
- **1:2 RR**: Risk $1,000 to make $2,000.
- **1:3 RR**: Risk $1,000 to make $3,000.

## The Math of Recovery
The more you lose, the harder it is to get back to breakeven.
- Loss of 10% requires a 11% gain to recover.
- Loss of 50% requires a **100% gain** to recover.
Protect your downside at all costs.
        `
      },
    ]
  },
  {
    id: 'structure',
    title: 'Market Structure & Price Action',
    lessons: [
      { 
        id: 'ms1', 
        title: 'BOS & CHoCH', 
        description: 'Identifying trend continuation and reversals.', 
        duration: '30 min', 
        difficulty: 'Intermediate',
        content: `
# BOS & CHoCH

Understanding market structure is the difference between trading with the trend and getting caught in a reversal.

## Break of Structure (BOS)
A BOS occurs when the market continues in its current direction by breaking a previous swing high (in an uptrend) or swing low (in a downtrend). This confirms the trend is healthy.

## Change of Character (CHoCH)
A CHoCH is the first sign of a potential trend reversal. It happens when the market fails to make a new high/low and instead breaks the *opposite* structure level.
- In an uptrend, breaking the previous higher low is a Bearish CHoCH.
- In a downtrend, breaking the previous lower high is a Bullish CHoCH.
        `
      },
      { 
        id: 'ms2', 
        title: 'Supply & Demand Zones', 
        description: 'Locating high-probability areas of interest.', 
        duration: '35 min', 
        difficulty: 'Intermediate',
        content: `
# Supply & Demand Zones

Supply and Demand zones are areas on the chart where institutional orders were likely left unfilled, leading to explosive moves.

## Demand Zones (Bullish)
An area where price aggressively pushed higher, leaving behind a "footprint" of strong buying. We look to buy when price returns to this zone.

## Supply Zones (Bearish)
An area where price aggressively pushed lower. We look for selling opportunities upon return.

## Zone Quality
1. **The Move Out**: How fast did price leave the zone? Faster is better.
2. **Fittedness**: How many times has the zone been touched? Untested (Fresh) zones are highest probability.
        `
      },
      { 
        id: 'ms3', 
        title: 'Fair Value Gaps (FVG)', 
        description: 'Understanding price imbalances and magnets.', 
        duration: '25 min', 
        difficulty: 'Intermediate',
        content: `
# Fair Value Gaps (FVG)

An FVG is an imbalance in price action that occurs when one side of the market is so dominant that it leaves a "gap" in the delivery of price.

## Identifying an FVG
It is a 3-candle pattern. The FVG is the gap between the wick of the 1st candle and the wick of the 3rd candle, where only the 2nd candle passed through.

## The Magnet Effect
The market hates imbalances. Think of an FVG as a "vacuum" or "magnet." Price will eventually return to fill (rebalance) that gap before continuing its move.
        `
      },
    ]
  },
  {
    id: 'execution',
    title: 'Advanced Execution',
    lessons: [
      { 
        id: 'ae1', 
        title: 'The Liquidity Sweep Entry', 
        description: 'Entering when everyone else is getting stopped out.', 
        duration: '40 min', 
        difficulty: 'Advanced',
        content: `
# The Liquidity Sweep Entry

The most powerful setups often happen right after a "fakeout." This is known as a liquidity sweep.

## The Setup
1. Identify a obvious swing high or low where retail traders have placed their stops.
2. Wait for price to aggressively "stop-run" or sweep those levels.
3. Look for a quick rejection (wick) and a Market Structure Shift (MSS) in the opposite direction.
4. Enter on the retest of the FVG left behind by the rejection.

This setup puts you on the right side of institutional flow.
        `
      }
    ]
  }
];
