import React from 'react';

/**
 * Detects a leading blockquote child (> EYEBROW TEXT) and returns the eyebrow
 * string plus the remaining children with the blockquote removed.
 * Falls back to the `eyebrow` prop if no blockquote is found.
 *
 * Usage in home.md:
 *   <Bars>
 *   > GET STARTED
 *   ...content...
 *   </Bars>
 */
export function extractEyebrow(children, eyebrowProp) {
  const arr = React.Children.toArray(children)
    .filter(c => typeof c !== 'string' || c.trim() !== '');

  if (arr[0] && React.isValidElement(arr[0]) && arr[0].type === 'blockquote') {
    const inner = React.Children.toArray(arr[0].props.children)
      .filter(c => typeof c !== 'string' || c.trim() !== '');
    const p = inner[0];
    const text = React.isValidElement(p) && p.type === 'p' && typeof p.props.children === 'string'
      ? p.props.children
      : '';
    return { eyebrow: text || eyebrowProp || null, rest: arr.slice(1) };
  }

  return { eyebrow: eyebrowProp || null, rest: arr };
}
