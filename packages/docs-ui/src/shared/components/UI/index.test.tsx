import React from 'react';
import {describe, expect, it} from 'vitest';
import {render, screen} from '@testing-library/react';
import {renderToString} from 'react-dom/server';

import UI from './index';

describe('UI', () => {
  it('renders English label inside strong.zd-ui-label', () => {
    render(<UI>Create Cluster</UI>);
    const el = screen.getByText('Create Cluster');
    expect(el.tagName).toBe('STRONG');
    expect(el).toHaveClass('zd-ui-label');
  });

  it('renders Chinese label inside strong.zd-ui-label', () => {
    render(<UI>创建集群</UI>);
    const el = screen.getByText('创建集群');
    expect(el.tagName).toBe('STRONG');
    expect(el).toHaveClass('zd-ui-label');
  });

  it('renders empty and omitted children without crashing', () => {
    const {container} = render(
      <>
        <UI />
        <UI>{''}</UI>
      </>,
    );
    const strongs = container.querySelectorAll('strong.zd-ui-label');
    expect(strongs).toHaveLength(2);
    expect(strongs[0]?.textContent).toBe('');
    expect(strongs[1]?.textContent).toBe('');
  });

  it('preserves nested ReactNode children and matches SSR output', () => {
    render(
      <UI>
        <span>
          Settings &gt; <em>API Keys</em>
        </span>
      </UI>,
    );
    const strong = screen.getByText('API Keys').closest('strong');
    expect(strong).not.toBeNull();
    expect(strong).toHaveClass('zd-ui-label');
    expect(strong?.querySelector('em')?.textContent).toBe('API Keys');

    expect(renderToString(<UI>Create Cluster</UI>)).toBe(
      '<strong class="zd-ui-label">Create Cluster</strong>',
    );
    expect(renderToString(<UI>创建集群</UI>)).toBe(
      '<strong class="zd-ui-label">创建集群</strong>',
    );
  });
});
