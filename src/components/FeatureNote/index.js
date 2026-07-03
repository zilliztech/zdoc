import React from 'react';

/**
 * FeatureNote — an availability banner placed under a page title.
 *
 * Authors write plain Markdown inside it (bullet list + `[links](url)`); the
 * component supplies the icon, linked title, and styling. Registered globally in
 * theme/MDXComponents, so no import is needed in .md/.mdx pages.
 *
 *   <FeatureNote>
 *
 *   - Available on the [Standard](/docs/pricing#standard) plan.
 *   - Supported in [AWS us-west-2](/docs/regions#aws-us-west-2).
 *
 *   </FeatureNote>
 *
 * Pass `title="…"` to override the default heading, `titleHref="…"` to render
 * the heading as a clickable text link, and `variant="plan" | "region"` for tone.
 */
function FeatureNoteIcon({variant}) {
  if (variant === 'region' || variant === 'globe') {
    return (
      <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5.75" stroke="currentColor" strokeWidth="1.45" />
        <path d="M2.5 8H13.5" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
        <path d="M8 2.25C9.6 3.8 10.4 5.72 10.4 8C10.4 10.28 9.6 12.2 8 13.75" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
        <path d="M8 2.25C6.4 3.8 5.6 5.72 5.6 8C5.6 10.28 6.4 12.2 8 13.75" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg width="17" height="17" viewBox="0 0 16 16" fill="none">
      <path d="M4 2.5V13.5" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
      <path d="M4 3.75H11.75V8H4" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export default function FeatureNote({title = 'Feature Availability', titleHref, variant = 'plan', icon, children}) {
  // `icon` overrides which glyph is shown independently of the colour `variant`
  // (e.g. region/cyan style with the flag icon). Defaults to the variant.
  const iconVariant = icon || variant;
  const titleNode = titleHref ? (
    <a className="zd-feature-note__titleLink" href={titleHref}>
      {title}
    </a>
  ) : (
    <span className="zd-feature-note__titleText">{title}</span>
  );

  return (
    <div className={`zd-feature-note zd-feature-note--${variant}`}>
      <div className="zd-feature-note__head">
        <span className="zd-feature-note__icon" aria-hidden="true">
          <FeatureNoteIcon variant={iconVariant} />
        </span>
        {titleNode}
      </div>
      <div className="zd-feature-note__body">{children}</div>
    </div>
  );
}
