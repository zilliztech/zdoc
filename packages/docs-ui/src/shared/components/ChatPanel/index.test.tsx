import React from 'react';
import {cleanup, fireEvent, render, screen} from '@testing-library/react';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';

const {state} = vi.hoisted(() => ({state: {current: {} as any}}));
vi.mock('./ChatContext', () => ({useChatContext: () => state.current}));
vi.mock('@docusaurus/router', () => ({useLocation: () => ({pathname: '/docs/home'}), useHistory: () => ({push: vi.fn()})}));
vi.mock('@docusaurus/useDocusaurusContext', () => ({default: () => ({siteConfig: {customFields: {site: 'en'}}, i18n: {currentLocale: 'en'}})}));
vi.mock('@zdoc/chat-ui', () => ({GroundedMarkdown: ({text}: {text: string}) => <p>{text}</p>, SourceTag: () => null, ConfidenceDot: () => null, isExternalUrl: () => false}));
import ChatPanel from './index';

const panel = () => <ChatPanel isExpanded={false} onToggle={() => {}} />;

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', class {observe() {} disconnect() {}});
  state.current = {
    messages: [], input: '', setInput: vi.fn(), isStreaming: false, send: vi.fn(), stop: vi.fn(),
    newChat: vi.fn(), rateFeedback: vi.fn(), chatHistory: [], activeChatId: null,
    loadChat: vi.fn(), deleteChat: vi.fn(), contextChips: [], removeContextChip: vi.fn(),
  };
});
afterEach(() => {cleanup(); vi.unstubAllGlobals();});

describe('chat composer and reading position', () => {
  it('uses a growing multiline composer in empty and conversation states', () => {
    const view = render(panel());
    let input = screen.getByRole('textbox', {name: 'Chat message'}) as HTMLTextAreaElement;
    expect(input.tagName).toBe('TEXTAREA');
    Object.defineProperty(input, 'scrollHeight', {configurable: true, value: 110});
    state.current.input = 'A long question\nwith another line';
    view.rerender(panel());
    expect(input.style.height).toBe('110px');
    fireEvent.keyDown(input, {key: 'Enter', shiftKey: true});
    fireEvent.keyDown(input, {key: 'Enter', isComposing: true});
    expect(state.current.send).not.toHaveBeenCalled();
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(state.current.send).toHaveBeenCalledWith(state.current.input);
    Object.defineProperty(input, 'scrollHeight', {value: 22});
    state.current.input = '';
    view.rerender(panel());
    expect(input.style.height).toBe('22px');
    state.current.messages = [{role: 'user', text: 'Question'}, {role: 'assistant', text: ''}];
    state.current.isStreaming = true;
    view.rerender(panel());
    input = screen.getByRole('textbox', {name: 'Chat message'}) as HTMLTextAreaElement;
    expect(input.tagName).toBe('TEXTAREA');
    fireEvent.keyDown(input, {key: 'Enter'});
    expect(state.current.send).toHaveBeenCalledTimes(1);
  });

  it('keeps the reading position during streamed updates and completion', () => {
    state.current.messages = [{role: 'user', text: 'Question'}, {role: 'assistant', text: 'Opening'}];
    state.current.isStreaming = true;
    const view = render(panel());
    const messages = screen.getByText('Question').parentElement!.parentElement!.parentElement!;
    Object.defineProperties(messages, {clientHeight: {value: 500}, scrollHeight: {value: 1500}});
    messages.scrollTop = 180;
    state.current.messages = [state.current.messages[0], {role: 'assistant', text: 'Opening\nMore content'}];
    state.current.activeChatId = 'auto-saved-chat';
    view.rerender(panel());
    expect(messages.scrollTop).toBe(180);
    expect(screen.getByRole('button', {name: /bottom/i})).toBeTruthy();
    state.current.isStreaming = false;
    view.rerender(panel());
    expect(messages.scrollTop).toBe(180);
  });
});
