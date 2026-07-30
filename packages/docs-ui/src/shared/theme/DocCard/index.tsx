import React, {type ReactNode} from 'react';
import Link from '@docusaurus/Link';
import {
  useDocById,
  findFirstSidebarItemLink,
} from '@docusaurus/plugin-content-docs/client';
import {usePluralForm} from '@docusaurus/theme-common';
import {translate} from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import type {Props} from '@theme/DocCard';
import type {
  PropSidebarItemCategory,
  PropSidebarItemLink,
} from '@docusaurus/plugin-content-docs';

import styles from './styles.module.css';

function useCategoryItemsPlural() {
  const {selectMessage} = usePluralForm();
  return (count: number) =>
    selectMessage(
      count,
      translate(
        {
          message: '1 item|{count} items',
          id: 'theme.docs.DocCard.categoryDescription.plurals',
        },
        {count},
      ),
    );
}

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

function SectionItem({
  href,
  title,
  description,
  headingLevel = 2,
  className,
}: {
  href: string;
  title: string;
  description?: string;
  headingLevel?: HeadingLevel;
  className?: string;
}): ReactNode {
  return (
    <article className={`${styles.sectionItem} ${className ?? ''}`}>
      <Heading as={`h${headingLevel}`} className={styles.sectionTitle}>
        <Link href={href}>{title}</Link>
      </Heading>
      {description && (
        <p className={styles.sectionDescription}>{description}</p>
      )}
    </article>
  );
}

function CardCategory({
  item,
  headingLevel,
}: {
  item: PropSidebarItemCategory;
  headingLevel?: HeadingLevel;
}): ReactNode {
  const href = findFirstSidebarItemLink(item);
  const categoryItemsPlural = useCategoryItemsPlural();

  if (!href) {
    return null;
  }

  return (
    <SectionItem
      className={item.className}
      href={href}
      title={item.label}
      description={item.description ?? categoryItemsPlural(item.items.length)}
      headingLevel={headingLevel}
    />
  );
}

function CardLink({
  item,
  headingLevel,
}: {
  item: PropSidebarItemLink;
  headingLevel?: HeadingLevel;
}): ReactNode {
  const doc = useDocById(item.docId ?? undefined);
  return (
    <SectionItem
      className={item.className}
      href={item.href}
      title={item.label}
      description={item.description ?? doc?.description}
      headingLevel={headingLevel}
    />
  );
}

export default function DocCard({
  item,
  headingLevel,
}: Props & {headingLevel?: HeadingLevel}): ReactNode {
  switch (item.type) {
    case 'link':
      return <CardLink item={item} headingLevel={headingLevel} />;
    case 'category':
      return <CardCategory item={item} headingLevel={headingLevel} />;
    case 'html':
      return null;
    default:
      throw new Error(`unknown item type ${JSON.stringify(item)}`);
  }
}
