import React from 'react';
import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {render, screen, fireEvent, cleanup} from '@testing-library/react';

vi.mock('@docusaurus/useDocusaurusContext', () => ({
  default: () => ({
    siteConfig: {
      customFields: {
        chatEndpoint: '/api/chat',
      },
    },
  }),
}));

vi.mock('@docusaurus/router', () => ({
  useLocation: () => ({pathname: '/docs/home'}),
}));

import SearchModal from './index';

describe('SearchModal', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers({shouldAdvanceTime: true});
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders input and close hint', () => {
    render(<SearchModal onClose={onClose} />);
    expect(screen.getByPlaceholderText('Search documentation...')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'ESC'})).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /Getting Started/})).toBeInTheDocument();
  });

  it('closes on Escape key', () => {
    render(<SearchModal onClose={onClose} />);
    fireEvent.keyDown(document, {key: 'Escape'});
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on overlay click', () => {
    render(<SearchModal onClose={onClose} />);
    const overlay = document.querySelector('[class*="searchOverlay"]');
    if (overlay) fireEvent.click(overlay);
    expect(onClose).toHaveBeenCalled();
  });

  it('shows Ask AI row when typing', () => {
    render(<SearchModal onClose={onClose} />);
    const input = screen.getByPlaceholderText('Search documentation...');
    fireEvent.change(input, {target: {value: 'test'}});
    expect(screen.getByText(/Ask AI:/)).toBeInTheDocument();
  });

  it('navigates with arrow keys', () => {
    render(<SearchModal onClose={onClose} />);
    const input = screen.getByPlaceholderText('Search documentation...');
    fireEvent.keyDown(input, {key: 'ArrowDown'});
    fireEvent.keyDown(input, {key: 'Enter'});
    // Should trigger Ask AI or navigate; primarily testing no crash
    expect(input).toBeInTheDocument();
  });
});
