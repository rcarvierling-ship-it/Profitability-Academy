import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps & React.HTMLAttributes<HTMLDivElement>> = ({ children, title, subtitle, icon, className = '', style, ...props }) => (
  <div className={`glass-card ${className}`} style={{ padding: '24px', ...style }} {...props}>
    {(title || subtitle || icon) && (
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {icon && <div style={{ color: 'var(--primary)', display: 'flex' }}>{icon}</div>}
        <div>
          {title && <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>}
          {subtitle && <p style={{ color: 'var(--text-dim)', fontSize: '0.875rem' }}>{subtitle}</p>}
        </div>
      </div>
    )}
    {children}
  </div>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  glow = false,
  style,
  ...props 
}) => {
  const getStyles = () => {
    const base: React.CSSProperties = {
      borderRadius: 'var(--radius-md)',
      fontWeight: 600,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      ...style
    };

    const variants: Record<string, React.CSSProperties> = {
      primary: { background: 'var(--primary)', color: 'white', border: 'none' },
      secondary: { background: 'var(--bg-card-hover)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' },
      outline: { background: 'transparent', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' },
      danger: { background: 'var(--danger)', color: 'white', border: 'none' }
    };

    const sizes: Record<string, React.CSSProperties> = {
      sm: { padding: '8px 16px', fontSize: '13px' },
      md: { padding: '12px 24px', fontSize: '15px' },
      lg: { padding: '16px 32px', fontSize: '17px' }
    };

    return { ...base, ...variants[variant], ...sizes[size] };
  };

  return (
    <button 
      style={getStyles()} 
      className={glow && variant === 'primary' ? 'glow-primary' : ''}
      {...props}
    >
      {children}
    </button>
  );
};

interface BadgeProps {
  children: React.ReactNode;
  color?: 'primary' | 'success' | 'danger' | 'warning' | 'neutral';
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = 'neutral', style }) => {
  const colors: Record<string, string> = {
    primary: 'rgba(59, 130, 246, 0.1)',
    success: 'rgba(16, 185, 129, 0.1)',
    danger: 'rgba(239, 68, 68, 0.1)',
    warning: 'rgba(245, 158, 11, 0.1)',
    neutral: 'rgba(255, 255, 255, 0.05)'
  };
  
  const textColors: Record<string, string> = {
    primary: 'var(--primary)',
    success: 'var(--success)',
    danger: 'var(--danger)',
    warning: 'var(--warning)',
    neutral: 'var(--text-dim)'
  };

  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: '6px',
      fontSize: '11px',
      fontWeight: 700,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      backgroundColor: colors[color],
      color: textColors[color],
      border: `1px solid ${textColors[color]}22`,
      ...style
    }}>
      {children}
    </span>
  );
};
