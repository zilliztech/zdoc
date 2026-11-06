import React from 'react';

// Vitest-only stand-in for @docusaurus/Link: the real component needs the
// router and broken-link contexts that jsdom tests do not mount. Tag-link
// tests only assert the resolved href, so a plain anchor is enough.
export default function LinkStub({href, children, ...rest}: React.ComponentProps<'a'>) {
  return (
    <a href={href} {...rest}>
      {children}
    </a>
  );
}
