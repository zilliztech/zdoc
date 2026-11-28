import React from 'react';
import {describe, expect, it} from 'vitest';
import ICONS from './navIcons';
import {RustIcon} from '../../shared/icons/brands';
import {referenceTargetKinds} from '../../shared/navigation/referenceTargets.generated';

/** Icons the registry names differently from the reference kind. */
const KIND_ICON_ALIASES: Record<string, string> = {cli: 'terminal', restful: 'rest'};

describe('navIcons', () => {
  it('registers an icon for every reference target kind', () => {
    for (const kind of referenceTargetKinds) {
      const icon = KIND_ICON_ALIASES[kind] ?? kind;
      expect(ICONS[icon], `no navbar icon registered for reference kind ${kind}`).toBeDefined();
    }
  });

  it('renders the Rust brand icon as an SVG', () => {
    const element = RustIcon({size: 15});
    expect(element.type).toBe('svg');
    expect(element.props.viewBox).toBe('0 0 24 24');
    expect(element.props.width).toBe(15);
  });
});
