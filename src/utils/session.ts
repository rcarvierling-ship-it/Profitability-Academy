export type SessionName = 'Asian' | 'London' | 'London/NY Overlap' | 'New York' | 'NY Open' | 'Post-Market' | 'Weekend';

export interface SessionInfo {
  session: SessionName;
  isActive: boolean;
  color: string;
}

export const getTradingSession = (date: Date): SessionInfo => {
  const day = date.getDay();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // Weekend check (Saturday 00:00 to Sunday 17:00 EST roughly)
  // Simplified for local time: Friday 17:00 to Sunday 17:00
  if (day === 6 || (day === 5 && hours >= 17) || (day === 0 && hours < 17)) {
    return { session: 'Weekend', isActive: false, color: 'var(--text-dim)' };
  }

  // Session Ranges in Minutes
  // Asia: 18:00 - 02:00 (1080 - 120)
  // London: 03:00 - 11:00 (180 - 660)
  // New York: 08:00 - 17:00 (480 - 1020)
  // NY Open: 09:30 - 10:30 (570 - 630)

  // NY Open specific
  if (totalMinutes >= 570 && totalMinutes < 630) {
    return { session: 'NY Open', isActive: true, color: 'var(--success)' };
  }

  // NY Session
  if (totalMinutes >= 480 && totalMinutes < 1020) {
    // Overlap with London
    if (totalMinutes < 660) {
      return { session: 'London/NY Overlap', isActive: true, color: 'var(--primary)' };
    }
    return { session: 'New York', isActive: true, color: 'var(--primary)' };
  }

  // London Session
  if (totalMinutes >= 180 && totalMinutes < 660) {
    return { session: 'London', isActive: true, color: 'var(--secondary)' };
  }

  // Asian Session
  if (totalMinutes >= 1080 || totalMinutes < 120) {
    return { session: 'Asian', isActive: true, color: 'var(--warning)' };
  }

  return { session: 'Post-Market', isActive: true, color: 'var(--text-dim)' };
};
