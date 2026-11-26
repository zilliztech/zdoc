import React, {type ReactNode} from 'react';

export interface UIProps {
  children?: ReactNode;
}

export default function UI({children}: UIProps) {
  return <strong className="zd-ui-label">{children}</strong>;
}
