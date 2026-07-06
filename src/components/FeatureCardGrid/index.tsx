import React, {type ReactNode} from 'react';
import {
  AlertTriangle,
  Archive,
  BadgeCheck,
  Scale,
  Sparkles,
  Workflow,
} from 'lucide-react';
import styles from './styles.module.css';

const ICONS = {
  AlertTriangle,
  Archive,
  BadgeCheck,
  Scale,
  Sparkles,
  Workflow,
};

type IconName = keyof typeof ICONS;

export function FeatureCard({
  icon = 'Sparkles',
  title,
  children,
}: {
  icon?: IconName;
  title: string;
  children: ReactNode;
}): ReactNode {
  const Icon = ICONS[icon] ?? Sparkles;

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <span className={styles.icon} aria-hidden="true">
          <Icon size={17} strokeWidth={1.9} />
        </span>
        <h3 className={styles.title}>{title}</h3>
      </div>
      <div className={styles.body}>{children}</div>
    </article>
  );
}

export default function FeatureCardGrid({
  columns = 3,
  children,
}: {
  columns?: number;
  children: ReactNode;
}): ReactNode {
  const safeColumns = Math.min(4, Math.max(1, Number(columns) || 3));

  return (
    <div
      className={styles.grid}
      style={{'--feature-card-columns': safeColumns} as React.CSSProperties}>
      {children}
    </div>
  );
}
