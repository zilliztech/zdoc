import React from 'react';
import {render, screen} from '@testing-library/react';
import {describe, expect, it} from 'vitest';

import ChannelCode from './index';

const lastRendered = {children: null as unknown, props: {} as Record<string, unknown>};

function Inner(props: {children?: React.ReactNode} & Record<string, unknown>) {
  lastRendered.children = props.children;
  lastRendered.props = props;
  return <code data-testid="theme-code">{props.children}</code>;
}

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

const FENCED_WITH_DIRECTIVES = [
  'client.setup()',
  '# next-channel-start',
  'client.serverless()',
  '# next-channel-end',
  '',
].join('\n');

describe('ChannelCode', () => {
  it('filters fenced blocks to the deployment channel and strips directive lines', () => {
    withEnv({RELEASE_CHANNEL: 'current'}, () => {
      render(<ChannelCode inner={Inner} className="language-python">{FENCED_WITH_DIRECTIVES}</ChannelCode>);
      expect(screen.getByTestId('theme-code')).toBeDefined();
      expect(lastRendered.children).toBe('client.setup()\n');
    });
    withEnv({RELEASE_CHANNEL: 'next'}, () => {
      render(<ChannelCode inner={Inner} className="language-python">{FENCED_WITH_DIRECTIVES}</ChannelCode>);
      expect(lastRendered.children).toBe('client.setup()\nclient.serverless()\n');
    });
  });

  it('fails closed to the current view without an injected channel', () => {
    withEnv(undefined, () => {
      render(<ChannelCode inner={Inner} className="language-python">{FENCED_WITH_DIRECTIVES}</ChannelCode>);
      expect(lastRendered.children).toBe('client.setup()\n');
    });
  });

  it('passes directive-free fenced code, inline code, and non-string children through untouched', () => {
    withEnv({RELEASE_CHANNEL: 'next'}, () => {
      const plain = 'plain()\nother()\n';
      render(<ChannelCode inner={Inner} className="language-python">{plain}</ChannelCode>);
      expect(lastRendered.children).toBe(plain);

      const inline = 'next-channel-start stays literal';
      render(<ChannelCode inner={Inner} className="language-text">{inline}</ChannelCode>);
      expect(lastRendered.children).toBe(inline);

      render(
        <ChannelCode inner={Inner} className="language-python">
          <span>element child</span>
        </ChannelCode>,
      );
      expect(lastRendered.props.children).toBeDefined();
    });
  });
});
