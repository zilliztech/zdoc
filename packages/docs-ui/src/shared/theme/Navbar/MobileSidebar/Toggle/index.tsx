import React, {type ReactNode} from 'react';
import {useNavbarMobileSidebar} from '@docusaurus/theme-common/internal';
import {translate} from '@docusaurus/Translate';

export default function MobileSidebarToggle(): ReactNode {
  const {toggle, shown} = useNavbarMobileSidebar();
  return (
    <button
      onClick={toggle}
      aria-label={translate({
        id: 'theme.docs.sidebar.toggleSidebarButtonAriaLabel',
        message: 'Toggle navigation bar',
        description:
          'The ARIA label for hamburger menu button of mobile navigation',
      })}
      aria-expanded={shown}
      className="navbar__toggle clean-btn zd-burger"
      data-open={shown ? 'true' : 'false'}
      type="button">
      {/* Two bars that morph into an X when the menu is open */}
      <span className="zd-burger-box" aria-hidden="true">
        <span className="zd-burger-bar" />
        <span className="zd-burger-bar" />
      </span>
    </button>
  );
}
