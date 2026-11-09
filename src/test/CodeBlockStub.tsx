import React from 'react';

// Vitest-only stand-in for @theme/CodeBlock: the real component needs the
// Docusaurus theme alias graph that only exists inside a site build. RestSpecs
// render tests assert the parameter tree, so the code itself only has to show.
export default function CodeBlockStub(props: {children?: React.ReactNode; title?: string; className?: string}) {
  const {children, title, className} = props;
  return (
    <pre data-testid="code-block" data-title={title} className={className}>
      {children}
    </pre>
  );
}
