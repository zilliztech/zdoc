import React from 'react';
import clsx from 'clsx';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {isActiveSidebarItem} from '@docusaurus/plugin-content-docs/client';
import Link from '@docusaurus/Link';
import isInternalUrl from '@docusaurus/isInternalUrl';
import IconExternalLink from '@theme/Icon/ExternalLink';
import styles from './styles.module.css';

const Badge = ({ label }) => {
  let color = "#000000";

  switch (label.toUpperCase()) {
      case "GET":
          color = "#0d8d67";
          break;
      case "POST":
          color = "#026aca";
          break;
      case "PUT":
          color = "#604aa2";
          break;
      case "DELETE":
          color = "#b91926";
          break;
      default:
          color = "#000000";
  }  

  return (
    <div style={{display: "inline-block", background: color, fontSize: "0.6em", borderRadius: "10px", color: "#ffffff", padding: "0.3em 1em", height: "100%", verticalAlign: "middle", marginRight: "0.5em"}}>
      <span>{label.toUpperCase()}</span>
    </div>
  )
}

const Badges = ({ labels }) => {
  return (
    <>
      {labels.map((label, index) => (
        <Badge key={index} label={label} />
      ))}
    </>
  )
}

export default function DocSidebarItemLink({
  item,
  onItemClick,
  activePath,
  level,
  index,
  ...props
}) {
  const {href, label, className, autoAddBaseUrl, customProps} = item;
  const isActive = isActiveSidebarItem(item, activePath);
  const isInternalLink = isInternalUrl(href);
  const badges = customProps?.badges ? customProps.badges : [];

  return (
    <li
      className={clsx(
        ThemeClassNames.docs.docSidebarItemLink,
        ThemeClassNames.docs.docSidebarItemLinkLevel(level),
        'menu__list-item',
        className,
      )}
      key={label}>
      <Link
        className={clsx(
          'menu__link',
          !isInternalLink && styles.menuExternalLink,
          {
            'menu__link--active': isActive,
          },
        )}
        autoAddBaseUrl={autoAddBaseUrl}
        aria-current={isActive ? 'page' : undefined}
        to={href}
        {...(isInternalLink && {
          onClick: onItemClick ? () => onItemClick(item) : undefined,
        })}
        {...props}>
        {badges.length > 0 && <Badges labels={badges} />} {label}
        {!isInternalLink && <IconExternalLink />}
      </Link>
    </li>
  );
}
