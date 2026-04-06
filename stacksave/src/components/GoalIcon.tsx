'use client';

import * as LucideIcons from 'lucide-react';

interface GoalIconProps {
  name: string;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}

export default function GoalIcon({ name, size = 20, className, style }: GoalIconProps) {
  // Try to find the icon in Lucide
  const Icon = (LucideIcons as any)[name];

  if (Icon) {
    return <Icon size={size} className={className} style={style} />;
  }

  // Fallback to rendering the name itself (likely an emoji or unknown string)
  return <span style={{ fontSize: size * 0.8, ...style }} className={className}>{name}</span>;
}
