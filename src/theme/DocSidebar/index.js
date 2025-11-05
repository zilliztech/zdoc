import React, { useEffect, useRef } from 'react';
import { useLocation } from '@docusaurus/router';
import DocSidebar from '@theme-original/DocSidebar';

export default function DocSidebarWrapper(props) {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const timeoutRef = useRef(null);

  useEffect(() => {
    const scrollActiveItemIntoView = () => {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Wait for DOM to be ready, with optimized delays
      const isReferenceDoc = location.pathname.startsWith('/reference');
      const delay = isReferenceDoc ? 1500 : 800;

      timeoutRef.current = setTimeout(() => {
        // Find all links with active class
        const allActiveLinks = document.querySelectorAll('.menu__link--active');
        console.log(`Found ${allActiveLinks.length} active links total`);

        // For reference docs, we want the deepest active link (the actual page)
        // For tutorial docs, we also want the deepest active link
        let actualActiveLink = null;

        if (allActiveLinks.length > 0) {
          // Find the deepest nested active link
          allActiveLinks.forEach(link => {
            // Check if this link has a more specific href or is deeper in the DOM
            if (!actualActiveLink ||
                (link.href && link.href.length > actualActiveLink.href?.length) ||
                link.closest('li')?.querySelector('.menu__list') === null) { // It's a leaf node
              actualActiveLink = link;
            }
          });

          // If still multiple, prefer the one that matches current pathname more closely
          if (allActiveLinks.length > 1) {
            allActiveLinks.forEach(link => {
              if (link.href && link.href.includes(location.pathname)) {
                actualActiveLink = link;
              }
            });
          }
        }

        const activeLink = actualActiveLink || allActiveLinks[0];

        if (!activeLink) {
          console.log(`Active link not found for ${location.pathname}`);
          console.log('Available menu links:', document.querySelectorAll('.menu__link').length);
          return;
        }

        console.log(`Found actual active link (${isReferenceDoc ? 'reference' : 'tutorial'}):`, {
          text: activeLink.textContent.trim(),
          href: activeLink.href,
          tagName: activeLink.tagName,
          className: activeLink.className,
          parentClass: activeLink.parentElement?.className
        });

        // Navigate the sidebar hierarchy based on sidebar type
        let scrollContainer;
        let startElement;

        if (isReferenceDoc) {
          // Reference sidebar: Start from category-level-2 items and navigate down
          startElement = activeLink.closest('li.theme-doc-sidebar-item-category-level-2') ||
                        activeLink.closest('.theme-doc-sidebar-item-category-level-2') ||
                        activeLink.closest('li').parentElement;

          scrollContainer = startElement?.closest('ul.menu__list') ||
                           activeLink.closest('ul.menu__list') ||
                           document.querySelector('ul.menu__list');

          console.log('Reference doc - starting from category-level-2');
        } else {
          // Tutorial sidebar: Start from the top menu and navigate down
          startElement = document.querySelector('.theme-doc-sidebar-container') ||
                        document.querySelector('.menu__list') ||
                        activeLink.closest('.theme-doc-sidebar-container');

          scrollContainer = startElement?.closest('.menu__list') ||
                           activeLink.closest('.menu__list') ||
                           document.querySelector('.menu__list');

          console.log('Tutorial doc - starting from top menu');
        }

        if (!scrollContainer) {
          console.log('No scroll container found, trying fallback');
          scrollContainer = activeLink.closest('div') || document.body;
        }

        console.log('Using scroll container:', {
          startElement: startElement ? {
            tagName: startElement.tagName,
            className: startElement.className
          } : 'Not found',
          scrollContainer: {
            tagName: scrollContainer.tagName,
            className: scrollContainer.className,
            scrollTop: scrollContainer.scrollTop,
            scrollHeight: scrollContainer.scrollHeight,
            clientHeight: scrollContainer.clientHeight,
            isScrollable: scrollContainer.scrollHeight > scrollContainer.clientHeight
          }
        });

        // Calculate position relative to container
        const containerRect = scrollContainer.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();
        const relativeTop = linkRect.top - containerRect.top;
        const targetScrollTop = scrollContainer.scrollTop + relativeTop - (containerRect.height / 2) + (linkRect.height / 2);

        console.log('Scroll calculation:', {
          relativeTop,
          targetScrollTop,
          currentScrollTop: scrollContainer.scrollTop,
          containerHeight: containerRect.height,
          linkHeight: linkRect.height
        });

        // Apply scroll with multiple methods
        try {
          // Method 1: Direct scrollIntoView
          activeLink.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          console.log('Applied scrollIntoView');
        } catch (e) {
          console.log('scrollIntoView failed:', e);
        }

        // Method 2: Manual scroll calculation (backup)
        setTimeout(() => {
          const finalScrollTop = Math.max(0, targetScrollTop);
          console.log('Applying manual scroll to:', finalScrollTop);

          try {
            scrollContainer.scrollTo({
              top: finalScrollTop,
              behavior: 'smooth'
            });
          } catch (e) {
            console.log('scrollTo failed, using scrollTop assignment');
            scrollContainer.scrollTop = finalScrollTop;
          }
        }, 100);

        // Method 3: Force direct assignment (last resort)
        setTimeout(() => {
          if (scrollContainer.scrollTop !== Math.max(0, targetScrollTop)) {
            console.log('Forcing direct scrollTop assignment');
            scrollContainer.scrollTop = Math.max(0, targetScrollTop);
          }
        }, 500);

      }, delay);
    };

    // Scroll when component mounts or route changes
    scrollActiveItemIntoView();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location.pathname]); // Only depend on pathname for clean re-runs

  return <DocSidebar {...props} ref={sidebarRef} />;
}