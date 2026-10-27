import React from 'react';

// Vitest-only stand-in for @theme/Admonition: the real component drags in
// @theme/Admonition/Types and @docusaurus/theme-common, which need the full
// Docusaurus alias graph that only exists inside a site build. Cloud-data
// component tests only assert cell text, so a transparent passthrough is enough.
export default function AdmonitionStub(props: {children?: React.ReactNode; title?: string; [key: string]: unknown}) {
  const {children, title, ...rest} = props;
  return (
    <aside data-testid="admonition" data-title={title} {...rest}>
      {title ? <div>{title}</div> : null}
      {children}
    </aside>
  );
}
