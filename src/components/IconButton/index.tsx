import React, {type MouseEventHandler, type ReactNode} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

interface IconButtonProps {
  className?: string;
  children?: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  title?: string;
  'aria-label'?: string;
  /** Visual size: 'sm' = 36×36px, 'md' = 44×44px. Default: 'md' */
  size?: 'sm' | 'md';
  /** 'ghost' = no border; 'outlined' = 1px gray border. Default: 'ghost' */
  variant?: 'ghost' | 'outlined';
  /** When true, hover color is the brand primary instead of gray. Default: false */
  activePrimary?: boolean;
}

export default function IconButton({
  size = 'md',
  variant = 'ghost',
  activePrimary = false,
  className,
  children,
  ...props
}: IconButtonProps): React.ReactElement {
  return (
    <button
      type="button"
      className={clsx(
        styles.iconBtn,
        size === 'sm' ? styles.sizeSm : styles.sizeMd,
        variant === 'outlined' && styles.outlined,
        activePrimary && styles.activePrimary,
        className,
      )}
      {...props}>
      {children}
    </button>
  );
}
