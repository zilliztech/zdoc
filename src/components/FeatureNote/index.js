import React from 'react';

/**
 * FeatureNote — a cyan availability banner placed under a page title.
 *
 * Authors write plain Markdown inside it (bullet list + `[links](url)`); the
 * component supplies the flag icon, the title, and the cyan styling. Registered
 * globally in theme/MDXComponents, so no import is needed in .md/.mdx pages.
 *
 *   <FeatureNote>
 *
 *   - Available on the [Standard](/docs/pricing#standard) plan.
 *   - Supported in [AWS us-west-2](/docs/regions#aws-us-west-2).
 *
 *   </FeatureNote>
 *
 * Pass `title="…"` to override the default heading.
 */
export default function FeatureNote({title = 'Feature Availability', children}) {
  return (
    <div className="zd-feature-note">
      <div className="zd-feature-note__head">
        <span className="zd-feature-note__icon" aria-hidden="true">
          <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
            <path d="M4 2.5V13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M4 3.75H11.75V8H4" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </span>
        <span className="zd-feature-note__title">{title}</span>
      </div>
      <div className="zd-feature-note__body">{children}</div>
    </div>
  );
}
