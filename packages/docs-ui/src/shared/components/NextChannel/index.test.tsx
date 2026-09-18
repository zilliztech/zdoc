import React from 'react';
import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {renderToString} from 'react-dom/server';

import NextChannel from './index';

type EnvState = {RELEASE_CHANNEL?: unknown} | undefined;

function withEnv(env: EnvState, run: () => void) {
  const original = (window as {__ZDOC_ENV__?: EnvState}).__ZDOC_ENV__;
  (window as {__ZDOC_ENV__?: EnvState}).__ZDOC_ENV__ = env;
  try {
    run();
  } finally {
    (window as {__ZDOC_ENV__?: EnvState}).__ZDOC_ENV__ = original;
  }
}

describe('NextChannel', () => {
  it('shows include blocks only after mount on a next deployment', () => {
    withEnv({RELEASE_CHANNEL: 'next'}, () => {
      render(<NextChannel action="include">staged content</NextChannel>);
      expect(screen.getByText('staged content')).toBeDefined();
    });
  });

  it('hides include blocks on a current deployment and fails closed without an injected channel', () => {
    withEnv({RELEASE_CHANNEL: 'current'}, () => {
      const {container} = render(<NextChannel action="include">staged content</NextChannel>);
      expect(container.textContent).toBe('');
    });
    withEnv(undefined, () => {
      const {container} = render(<NextChannel action="include">staged content</NextChannel>);
      expect(container.textContent).toBe('');
    });
  });

  it('hides exclude blocks on next and keeps them on current', () => {
    withEnv({RELEASE_CHANNEL: 'next'}, () => {
      const {container} = render(<NextChannel action="exclude">replaced content</NextChannel>);
      expect(container.textContent).toBe('');
    });
    withEnv({RELEASE_CHANNEL: 'current'}, () => {
      render(<NextChannel action="exclude">replaced content</NextChannel>);
      expect(screen.getByText('replaced content')).toBeDefined();
    });
  });

  it('defaults to include when the action attribute is omitted', () => {
    withEnv({RELEASE_CHANNEL: 'next'}, () => {
      render(<NextChannel>defaulted content</NextChannel>);
      expect(screen.getByText('defaulted content')).toBeDefined();
    });
    withEnv({RELEASE_CHANNEL: 'current'}, () => {
      const {container} = render(<NextChannel>defaulted content</NextChannel>);
      expect(container.textContent).toBe('');
    });
  });

  it('prerenders as the CURRENT view regardless of the injected channel, matching hydration', () => {
    withEnv({RELEASE_CHANNEL: 'next'}, () => {
      const html = renderToString(
        <>
          <NextChannel action="include">staged content</NextChannel>
          <NextChannel action="exclude">replaced content</NextChannel>
        </>,
      );
      expect(html).not.toContain('staged content');
      expect(html).toContain('replaced content');
    });
  });
});
