import React, {useRef, useEffect, useState, type ReactNode} from 'react';
import Tabs from '@theme-init/Tabs';
import type TabsType from '@theme/Tabs';
import type {WrapperProps} from '@docusaurus/types';
import styles from './styles.module.css';

type Props = WrapperProps<typeof TabsType>;

type Indicator = {left: number; width: number; top: number};

// Wraps the stock Tabs to add a single underline that SLIDES to the active tab
// (instead of the underline snapping per-tab). The active tab's static underline
// is removed in custom.css; this indicator replaces it.
export default function TabsWrapper(props: Props): ReactNode {
  const ref = useRef<HTMLDivElement>(null);
  const [indicator, setIndicator] = useState<Indicator | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    // A continuous rAF loop is the most robust way to track the active tab — it
    // doesn't matter HOW the switch happens (click, keyboard, groupId sync,
    // deferred re-render). Query from `root` (the stable wrapper) every frame so
    // we always read the LIVE active tab, even if Docusaurus replaces tab nodes.
    // We only push state when the measured box changes, so re-renders are rare;
    // the CSS transition animates the slide.
    let rafId = 0;
    let last = '';
    const tick = () => {
      const active = root.querySelector<HTMLElement>('.tabs__item--active');
      if (active) {
        const rootBox = root.getBoundingClientRect();
        const tabBox = active.getBoundingClientRect();
        if (tabBox.width > 0) {
          // Inset the underline so it's shorter than the full tab box.
          const inset = 10;
          const left = tabBox.left - rootBox.left + inset;
          const width = Math.max(8, tabBox.width - inset * 2);
          const top = tabBox.bottom - rootBox.top - 2;
          const key = `${Math.round(left)}|${Math.round(width)}|${Math.round(top)}`;
          if (key !== last) {
            last = key;
            setIndicator({left, width, top});
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    <div className={styles.tabsSlide} ref={ref}>
      <Tabs {...props} />
      {indicator && (
        <span
          className={styles.tabIndicator}
          aria-hidden="true"
          style={{left: indicator.left, width: indicator.width, top: indicator.top}}
        />
      )}
    </div>
  );
}
