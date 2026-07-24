import React, {type ReactNode, useState, useCallback} from 'react';
import clsx from 'clsx';
import {prefersReducedMotion, ThemeClassNames} from '@docusaurus/theme-common';
import {useDocsSidebar} from '@docusaurus/plugin-content-docs/client';
import {useLocation} from '@docusaurus/router';
import DocSidebar from '@theme/DocSidebar';
import ExpandButton from '@theme/DocRoot/Layout/Sidebar/ExpandButton';
import type {Props} from '@theme/DocRoot/Layout/Sidebar';

import styles from './styles.module.css';

// Reset sidebar state when sidebar changes
// Use React key to unmount/remount the children
// See https://github.com/facebook/docusaurus/issues/3414
function ResetOnSidebarChange({children}: {children: ReactNode}) {
  const sidebar = useDocsSidebar();
  return (
    <React.Fragment key={sidebar?.name ?? 'noSidebar'}>
      {children}
    </React.Fragment>
  );
}

export default function DocRootLayoutSidebar({
  sidebar,
  hiddenSidebarContainer,
  setHiddenSidebarContainer,
  hiddenSidebar: hiddenSidebarProp,
  setHiddenSidebar: setHiddenSidebarProp,
}: Props & {
  hiddenSidebar?: boolean;
  setHiddenSidebar?: React.Dispatch<React.SetStateAction<boolean>>;
}): ReactNode {
  const {pathname} = useLocation();

  const [hiddenSidebarLocal, setHiddenSidebarLocal] = useState(false);
  const hiddenSidebar = hiddenSidebarProp ?? hiddenSidebarLocal;
  const setHiddenSidebar = setHiddenSidebarProp ?? setHiddenSidebarLocal;
  const toggleSidebar = useCallback(() => {
    if (hiddenSidebar) {
      // Expanding
      setHiddenSidebar(false);
      setHiddenSidebarContainer(false);
    } else {
      // Collapsing — no width transition, so set both immediately
      setHiddenSidebar(true);
      setHiddenSidebarContainer(true);
    }
  }, [setHiddenSidebarContainer, setHiddenSidebar, hiddenSidebar]);

  return (
    <aside
      className={clsx(
        ThemeClassNames.docs.docSidebarContainer,
        styles.docSidebarContainer,
        hiddenSidebarContainer && styles.docSidebarContainerHidden,
      )}
      onTransitionEnd={(e) => {
        if (!e.currentTarget.classList.contains(styles.docSidebarContainer!)) {
          return;
        }

        if (hiddenSidebarContainer) {
          setHiddenSidebar(true);
        }
      }}>
      <ResetOnSidebarChange>
        <div
          className={clsx(
            styles.sidebarViewport,
            hiddenSidebar && styles.sidebarViewportHidden,
          )}>
          <DocSidebar
            sidebar={sidebar}
            path={pathname}
            onCollapse={toggleSidebar}
            isHidden={hiddenSidebar}
          />
          {hiddenSidebar && <ExpandButton toggleSidebar={toggleSidebar} />}
        </div>
      </ResetOnSidebarChange>
    </aside>
  );
}
