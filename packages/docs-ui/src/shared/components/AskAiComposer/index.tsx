import React, {useRef, type CSSProperties, type ReactNode, type Ref, type RefObject} from 'react';
import {ArrowUp} from 'lucide-react';
import styles from './styles.module.css';

interface AskAiComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder: string;
  /** aria-label for the send button. */
  sendLabel: string;
  disabled?: boolean;
  /** Hint shown in the footer until the box takes focus (e.g. "⌘I"). */
  hint?: ReactNode;
  /** Positioning / page-specific classes; the skin always comes from here. */
  className?: string;
  style?: CSSProperties;
  /** Drops the blurred colour halo, keeping the 1px gradient stroke. */
  flat?: boolean;
  /** Set when the box sits in normal flow: it then positions itself, which the
      hover/focus rings need. The docked instance is position:fixed and doesn't. */
  inFlow?: boolean;
  formRef?: Ref<HTMLFormElement>;
  inputRef?: RefObject<HTMLInputElement>;
  autoFocus?: boolean;
}

/**
 * The Ask AI box: one composer used by the docked instance on doc pages and by
 * any page that wants the same control in normal flow. It owns the look and the
 * click-to-type behaviour only — the caller owns the text and what sending does,
 * so a page can wire it to whatever chat state it already has.
 */
export default function AskAiComposer({
  value,
  onChange,
  onSubmit,
  placeholder,
  sendLabel,
  disabled = false,
  hint,
  className,
  style,
  flat = false,
  inFlow = false,
  formRef,
  inputRef,
  autoFocus = false,
}: AskAiComposerProps): React.ReactElement {
  const fallbackInputRef = useRef<HTMLInputElement>(null);
  const input = inputRef ?? fallbackInputRef;

  return (
    <form
      ref={formRef}
      className={[
        styles.composer,
        inFlow ? styles.composerFlow : '',
        flat ? styles.composerFlat : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      onMouseDown={event => {
        // Whole box is the hot zone — clicking any empty area focuses the input
        // (but let the input and the send button handle their own clicks).
        const target = event.target as HTMLElement;
        if (target.closest('button') || target.tagName === 'INPUT') return;
        event.preventDefault();
        input.current?.focus();
      }}
      onSubmit={event => {
        event.preventDefault();
        onSubmit();
      }}>
      <input
        ref={input}
        type="text"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        disabled={disabled}
        autoFocus={autoFocus}
      />
      <div className={styles.footer}>
        {hint && <kbd className={styles.kbd}>{hint}</kbd>}
        <button type="submit" disabled={!value.trim() || disabled} aria-label={sendLabel}>
          <ArrowUp size={14} strokeWidth={2.4} />
        </button>
      </div>
    </form>
  );
}
