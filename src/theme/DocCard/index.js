import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {
  findFirstSidebarItemLink,
  useDocById
} from '@docusaurus/theme-common/internal';
import {usePluralForm} from '@docusaurus/theme-common';
import isInternalUrl from '@docusaurus/isInternalUrl';
import {translate} from '@docusaurus/Translate';
import Heading from '@theme/Heading';
import styles from './styles.module.css';
// function useCategoryItemsPlural() {
//   const {selectMessage} = usePluralForm();
//   return (count) =>
//     selectMessage(
//       count,
//       translate(
//         {
//           message: '1 item|{count} items',
//           id: 'theme.docs.DocCard.categoryDescription.plurals',
//           description:
//             'The default description for a category card in the generated index about how many items this category includes',
//         },
//         {count},
//       ),
//     );
// }

function findCategoryDocId(item, level=0) {
  var docId;
  if (item.type === 'category') {
    level -= 1;
    if (item.items[0].type === 'link') {
      docId = item.items[0].docId.split('/').slice(0, level).join('/') + '/' + item.items[0].docId.split('/').slice(0, level).pop();
    } else {
      docId = findCategoryDocId(item.items[0], level);
    }
  }

  return docId;
}


function CardContainer({href, children}) {
  return (
    <Link
      href={href}
      className={clsx('card padding--lg', styles.cardContainer)}>
      {children}
    </Link>
  );
}
function CardLayout({href, icon, title, description}) {
  if (description && description.includes('|')) {
    description = description.split('|')[0];
  }

  return (
    <CardContainer href={href}>
      <h2 className={clsx('text--truncate', styles.cardTitle)} title={title}>
        {title} <span className="tooltip">[READ MORE]</span>
      </h2>
      {description && (
        <p
          className={clsx('text--truncate', styles.cardDescription)}
          title={description}>
          {description}
        </p>
      )}
    </CardContainer>
  );
}
function CardCategory({item}) {
  const href = findFirstSidebarItemLink(item);
  // const categoryItemsPlural = useCategoryItemsPlural();
  // Unexpected: categories that don't have a link have been filtered upfront
  if (!href) {
    return null;
  }

  var docId = findCategoryDocId(item);

  return (
    <CardLayout
      href={href}
      icon="🗃️"
      title={item.label}
      //description={item.description ?? categoryItemsPlural(item.items.length)}
      description={ item.description ?? useDocById(docId ?? undefined) ?.description }
    />
  );
}
function CardLink({item}) {
  const icon = isInternalUrl(item.href) ? '📄️' : '🔗';
  const doc = useDocById(item.docId ?? undefined);
  return (
    <CardLayout
      href={item.href}
      icon={icon}
      title={item.label}
      description={item.description ?? doc?.description}
    />
  );
}
export default function DocCard({item}) {
  switch (item.type) {
    case 'link':
      return <CardLink item={item} />;
    case 'category':
      return <CardCategory item={item} />;
    default:
      throw new Error(`unknown item type ${JSON.stringify(item)}`);
  }
}
