import React from 'react';

// Vitest-only stand-in for @theme-init/Heading: the real theme-classic Heading
// drags in the Docusaurus alias graph (@theme/Heading types, theme-common,
// broken-link collection) that only exists inside a site build. Heading wrapper
// tests assert the wrapper's own tag-split decisions, so a transparent heading
// tag is enough.
export default function HeadingInitStub({
  as: Tag,
  children,
  id,
}: {
  as: React.ElementType;
  children?: React.ReactNode;
  id?: string;
}) {
  return <Tag id={id}>{children}</Tag>;
}
