import React, {type ReactNode, useRef, useState, useEffect} from 'react';
import clsx from 'clsx';
import {
  useDocsSidebar,
  useCurrentSidebarSiblings,
  filterDocCardListItems,
} from '@docusaurus/plugin-content-docs/client';
import type {Props} from '@theme/DocCardList';
import DocCard from '../DocCard';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

function useDetectedHeadingLevel(
  ref: React.RefObject<HTMLElement | null>,
): HeadingLevel {
  const [level, setLevel] = useState<HeadingLevel>(2);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let sibling = el.previousElementSibling;
    while (sibling) {
      const tag = sibling.tagName;
      if (/^H[1-6]$/.test(tag)) {
        const parentLevel = parseInt(tag[1], 10) as HeadingLevel;
        setLevel(Math.min(parentLevel + 1, 6) as HeadingLevel);
        return;
      }
      sibling = sibling.previousElementSibling;
    }
  }, [ref]);

  return level;
}

function DocCardListWithSidebar(props: Props) {
  const items = useCurrentSidebarSiblings();
  return <DocCardList items={items} className={props.className} />;
}

function DocCardListForCurrentSidebarCategory(props: Props) {
  const sidebar = useDocsSidebar();
  if (!sidebar) {
    return null;
  }
  return <DocCardListWithSidebar {...props} />;
}

export default function DocCardList(props: Props): ReactNode {
  const {items, className} = props;
  const sectionRef = useRef<HTMLElement>(null);
  const headingLevel = useDetectedHeadingLevel(sectionRef);

  if (!items) {
    return <DocCardListForCurrentSidebarCategory {...props} />;
  }

  const filteredItems = filterDocCardListItems(items);

  return (
    <section ref={sectionRef} className={clsx(className)}>
      {filteredItems.map((item, index) => (
        <DocCard key={index} item={item} headingLevel={headingLevel} />
      ))}
    </section>
  );
}
