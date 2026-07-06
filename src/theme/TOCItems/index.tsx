/**
 * TOCItems wrapper — single straight vertical rail with an active segment.
 *
 * Docusaurus' built-in TOC scroll-spy listens to the window scroll, but this
 * theme scrolls an inner container, so the built-in highlight never updates.
 * We therefore compute the active heading ourselves (last TOC heading scrolled
 * past, inside whichever element actually scrolls) and use it for BOTH the
 * active-link colour and the one-item-tall rail segment — so the black bar and
 * the black text always agree, for nested items and the last item alike.
 */
import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import TOCItemsOriginal from '@theme-original/TOCItems';
import type TOCItemsType from '@theme/TOCItems';
import type { WrapperProps } from '@docusaurus/types';
import { stripDocHeadingTag } from '@site/src/utils/docHeadingTags';

type Props = WrapperProps<typeof TOCItemsType>;

// Run before paint on the client (the built-in TOC highlight re-applies its own
// active class on every render; we must re-assert ours after that, flicker-free).
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const RAIL_X = 1.5;
const SVG_W = 24;
const TOP_OFFSET = 96; // px below the scroller top where the active item flips

interface Rail {
  path: string;
  activeY: number;
  activeH: number;
  totalH: number;
}

type TOCItemWithChildren = {
  readonly value?: string;
  readonly children?: readonly TOCItemWithChildren[];
};

function stripTagsFromTOCItems<T extends TOCItemWithChildren>(items: readonly T[] | undefined): readonly T[] | undefined {
  if (!items) return items;
  return items.map(item => ({
    ...item,
    value: typeof item.value === 'string' ? stripDocHeadingTag(item.value) : item.value,
    children: stripTagsFromTOCItems(item.children),
  })) as readonly T[];
}

function getScrollContainer(el: HTMLElement): HTMLElement | null {
  let cur: HTMLElement | null = el.parentElement;
  while (cur && cur !== document.body) {
    const { overflowY } = getComputedStyle(cur);
    if (overflowY === 'auto' || overflowY === 'scroll') return cur;
    cur = cur.parentElement;
  }
  return null;
}

function computeActiveId(wrapper: HTMLElement, scrollRoot: HTMLElement | null): string | null {
  const links = Array.from(wrapper.querySelectorAll<HTMLAnchorElement>('.table-of-contents__link'));
  const ids = links
    .map(l => l.getAttribute('href'))
    .filter((h): h is string => !!h && h.startsWith('#'))
    .map(h => h.slice(1));
  if (!ids.length) return null;

  const scrollTop = scrollRoot ? scrollRoot.scrollTop : window.scrollY;
  const clientH = scrollRoot ? scrollRoot.clientHeight : window.innerHeight;
  const scrollH = scrollRoot ? scrollRoot.scrollHeight : document.documentElement.scrollHeight;
  const refTop = scrollRoot ? scrollRoot.getBoundingClientRect().top : 0;
  const line = refTop + TOP_OFFSET;
  const maxScroll = Math.max(0, scrollH - clientH);

  const tops = ids.map(id => {
    const h = document.getElementById(id);
    return h ? h.getBoundingClientRect().top : null;
  });

  // Normal: last heading whose top has scrolled past the activation line.
  let idx = 0;
  for (let i = 0; i < ids.length; i++) {
    if (tops[i] == null) continue;
    if ((tops[i] as number) - 1 <= line) idx = i;
    else break;
  }

  // Bottom zone: trailing headings bunched near the page end can never cross the
  // line (not enough content beneath them). Within the final viewport of scroll,
  // step through those "stuck" headings proportionally so each one is reachable.
  const zoneStart = maxScroll - clientH;
  if (maxScroll > 0 && scrollTop >= zoneStart) {
    const toBottom = maxScroll - scrollTop; // px remaining to the very bottom
    let firstStuck = ids.length;
    for (let i = 0; i < ids.length; i++) {
      if (tops[i] == null) continue;
      // top at max scroll = current top − remaining scroll; still below the line ⇒ stuck
      if ((tops[i] as number) - toBottom > line) {
        firstStuck = i;
        break;
      }
    }
    if (firstStuck < ids.length) {
      const slots = ids.length - firstStuck + 1; // [last-reachable, …stuck]
      const span = maxScroll - zoneStart;
      const prog = span > 0 ? Math.min(1, Math.max(0, (scrollTop - zoneStart) / span)) : 1;
      const slot = Math.min(slots - 1, Math.floor(prog * slots));
      const cand = Math.max(0, firstStuck - 1 + slot);
      if (cand > idx) idx = Math.min(ids.length - 1, cand);
    }
  }

  return ids[idx];
}

function buildRail(wrapper: HTMLElement, activeId: string | null): Rail | null {
  const links = wrapper.querySelectorAll<HTMLElement>('.table-of-contents__link');
  if (!links.length) return null;

  const box = wrapper.getBoundingClientRect();
  const first = links[0].getBoundingClientRect();
  const last = links[links.length - 1].getBoundingClientRect();

  // Active segment is ~1/3 shorter than the item, vertically centred — so the
  // top/bottom of the active bar sit one "inset" (1/6 item height) inside the
  // item. Trim the gray rail by that same inset at both ends so its top lines
  // up exactly with where an active segment would start (and bottom likewise).
  const firstInset = first.height / 6;
  const lastInset = last.height / 6;
  const grayTop = (first.top - box.top) + firstInset;
  const grayBottom = (last.top - box.top) + last.height - lastInset;
  const path = `M ${RAIL_X} ${grayTop} L ${RAIL_X} ${grayBottom}`;

  let activeY = -1;
  let activeH = 0;
  links.forEach(link => {
    const r = link.getBoundingClientRect();
    const id = link.getAttribute('href')?.slice(1) ?? '';
    if (id && id === activeId) {
      const segH = r.height * (2 / 3);
      activeY = (r.top - box.top) + (r.height - segH) / 2;
      activeH = segH;
    }
  });

  return { path, activeY, activeH, totalH: box.height };
}

export default function TOCItems(props: Props): JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [rail, setRail] = useState<Rail | null>(null);
  const [tip, setTip] = useState<{ text: string; top: number; right: number } | null>(null);
  const activeIdRef = useRef<string | null>(null);
  // When the user CLICKS a TOC item, pin it active. Trailing headings near the
  // page bottom all collapse to the same maxScroll position, so scroll-derived
  // highlighting can't tell them apart — a click must win outright. The pin is
  // released only on genuine user scroll intent (wheel / touch / arrow keys);
  // the programmatic anchor scroll a click triggers fires none of those.
  const pinnedIdRef = useRef<string | null>(null);
  const uid = useId().replace(/:/g, '');
  const cleanProps = useMemo(
    () => ({ ...props, toc: stripTagsFromTOCItems(props.toc) }),
    [props],
  );

  // Re-assert our active class after every render — the built-in highlight
  // (driven by window scroll, which never moves in this inner-scroll theme)
  // keeps resetting the active link to the first heading otherwise.
  useIsoLayoutEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const links = el.querySelectorAll<HTMLElement>('.table-of-contents__link');
    links.forEach(l => {
      const id = l.getAttribute('href')?.slice(1);
      l.classList.toggle('table-of-contents__link--active', !!id && id === activeIdRef.current);
    });
  });

  useEffect(() => {
    // Paint the active link + rail for a given id (shared by scroll + click).
    const apply = (el: HTMLElement, activeId: string | null) => {
      activeIdRef.current = activeId;
      el.querySelectorAll<HTMLElement>('.table-of-contents__link').forEach(l => {
        const id = l.getAttribute('href')?.slice(1);
        l.classList.toggle('table-of-contents__link--active', !!id && id === activeId);
      });
      const next = buildRail(el, activeId);
      if (next) setRail(next);
    };

    // Read the wrapper + scroll root FRESH each call — the TOC subtree can
    // re-mount (chat open/close, resize). Runs synchronously (a rAF throttle was
    // being perpetually cancelled by the scroll/resize churn, so it never fired).
    // A pinned id (set by a click) overrides scroll-derived highlighting.
    const update = () => {
      const el = wrapperRef.current;
      const article = document.querySelector<HTMLElement>('article');
      if (!el || !article) return;
      const scrollRoot = getScrollContainer(article);
      const activeId = pinnedIdRef.current ?? computeActiveId(el, scrollRoot);
      apply(el, activeId);
    };

    // Clicking a TOC link pins it — even if the page can't scroll far enough to
    // bring that heading to the activation line (last-items problem).
    const onClick = (e: Event) => {
      const el = wrapperRef.current;
      if (!el) return;
      const link = (e.target as HTMLElement)?.closest?.('.table-of-contents__link') as HTMLElement | null;
      if (!link || !el.contains(link)) return;
      const id = link.getAttribute('href')?.slice(1);
      if (!id) return;
      pinnedIdRef.current = id;
      apply(el, id);
    };

    // Any real scroll gesture releases the pin and hands control back to
    // scroll-spy. Programmatic anchor scrolling fires none of these.
    const releasePin = () => {
      if (pinnedIdRef.current !== null) {
        pinnedIdRef.current = null;
        update();
      }
    };
    const onKeyScroll = (e: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' ', 'Spacebar'].includes(e.key)) {
        releasePin();
      }
    };

    // Capture-phase catches whichever element actually scrolls (window or inner).
    document.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    document.addEventListener('wheel', releasePin, { passive: true, capture: true });
    document.addEventListener('touchmove', releasePin, { passive: true, capture: true });
    window.addEventListener('keydown', onKeyScroll, true);
    const wrapperEl = wrapperRef.current;
    wrapperEl?.addEventListener('click', onClick, true);

    update();
    // The TOC links / images may render after this effect — recompute a few times.
    const timers = [60, 200, 600].map(ms => setTimeout(update, ms));

    return () => {
      timers.forEach(clearTimeout);
      document.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      document.removeEventListener('wheel', releasePin, true);
      document.removeEventListener('touchmove', releasePin, true);
      window.removeEventListener('keydown', onKeyScroll, true);
      wrapperEl?.removeEventListener('click', onClick, true);
    };
  }, []);

  // Instant hover tooltip — only for items whose text is actually truncated.
  const showTip = (e: React.MouseEvent) => {
    const link = (e.target as HTMLElement).closest?.('.table-of-contents__link') as HTMLElement | null;
    if (!link || !wrapperRef.current?.contains(link)) return;
    if (link.scrollWidth > link.clientWidth + 1) {
      const r = link.getBoundingClientRect();
      setTip({ text: (link.textContent || '').trim(), top: r.top + r.height / 2, right: window.innerWidth - r.left + 8 });
    } else {
      setTip(null);
    }
  };
  const hideTip = (e: React.MouseEvent) => {
    const to = e.relatedTarget as HTMLElement | null;
    if (to && to.closest && to.closest('.table-of-contents__link')) return;
    setTip(null);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }} onMouseOver={showTip} onMouseOut={hideTip}>
      {rail && (
        <svg
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: SVG_W,
            height: rail.totalH,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          <path d={rail.path} style={{ stroke: 'var(--zd-gray-200)' }} strokeWidth="1" fill="none" strokeLinecap="round" />
          {rail.activeY >= 0 && rail.activeH > 0 && (
            <>
              <defs>
                <clipPath id={`toc-active-${uid}`}>
                  <rect
                    x={-2}
                    y={0}
                    width={SVG_W + 4}
                    height={rail.activeH}
                    style={{
                      transform: `translateY(${rail.activeY}px)`,
                      transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                </clipPath>
              </defs>
              <path
                d={rail.path}
                style={{ stroke: 'var(--zd-gray-900)' }}
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                clipPath={`url(#toc-active-${uid})`}
              />
            </>
          )}
        </svg>
      )}
      <TOCItemsOriginal {...cleanProps} />
      {tip && (
        <div
          role="tooltip"
          style={{
            position: 'fixed',
            top: tip.top,
            right: tip.right,
            transform: 'translateY(-50%)',
            maxWidth: '16rem',
            padding: '5px 9px',
            background: 'var(--zd-linear-signup-ink)',
            color: '#fff',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            lineHeight: 1.4,
            boxShadow: '0 8px 20px rgba(15, 23, 42, 0.18)',
            whiteSpace: 'normal',
            pointerEvents: 'none',
            zIndex: 1000,
          }}>
          {tip.text}
        </div>
      )}
    </div>
  );
}
