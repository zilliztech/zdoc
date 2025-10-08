import React, { useEffect, useRef } from 'react';
import { useLocation } from '@docusaurus/router';
import DocSidebar from '@theme-original/DocSidebar';

export default function DocSidebarWrapper(props) {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  useEffect(() => {
    // Function to scroll the active item into the center of the sidebar
    const scrollActiveItemIntoView = () => {
      // Clear any existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Delay to ensure the DOM is fully rendered and sidebar is ready
      scrollTimeoutRef.current = setTimeout(() => {
        // Find the correct sidebar scroll container
        const sidebarContainer = sidebarRef.current?.querySelector('.menu__list') ||
                               sidebarRef.current?.querySelector('.menu') ||
                               document.querySelector('.theme-doc-sidebar-container .menu__list');

        if (!sidebarContainer) {
          console.log('Sidebar container not found');
          return;
        }

        // Find the active menu link with multiple fallback selectors
        const activeLink = sidebarContainer.querySelector('.menu__link--active');

        if (!activeLink) {
          console.log('Active link not found in sidebar');
          return;
        }

        // Calculate the target scroll position to center the active item
        const containerRect = sidebarContainer.getBoundingClientRect();
        const linkRect = activeLink.getBoundingClientRect();

        // Calculate how far to scroll to center the item
        const relativeTop = linkRect.top - containerRect.top;
        const centerOffset = (containerRect.height / 2) - (linkRect.height / 2);
        const targetScrollTop = sidebarContainer.scrollTop + relativeTop - centerOffset;

        // Ensure we don't scroll beyond boundaries
        const maxScrollTop = sidebarContainer.scrollHeight - sidebarContainer.clientHeight;
        const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));

        // Smooth scroll to the target position
        sidebarContainer.scrollTo({
          top: finalScrollTop,
          behavior: 'smooth'
        });

        console.log('Scrolled to active item:', {
          activeText: activeLink.textContent,
          targetScrollTop,
          containerHeight: containerRect.height,
          linkHeight: linkRect.height
        });
      }, 300); // Increased delay for better reliability
    };

    // Initial scroll when component mounts or location changes
    scrollActiveItemIntoView();

    // Set up a more targeted observer for sidebar content changes
    const observer = new MutationObserver((mutations) => {
      // Only react to relevant changes in the sidebar
      const hasRelevantChanges = mutations.some(mutation => {
        const target = mutation.target;
        return target.closest('.theme-doc-sidebar-container, .menu, .menu__list') ||
               target.classList?.contains('menu__link--active') ||
               target.classList?.contains('menu__link');
      });

      if (hasRelevantChanges) {
        scrollActiveItemIntoView();
      }
    });

    // Wait for sidebar to be available before observing
    const setupObserver = () => {
      const sidebarElement = sidebarRef.current || document.querySelector('.theme-doc-sidebar-container');
      if (sidebarElement) {
        observer.observe(sidebarElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class']
        });
      }
    };

    // Small delay to ensure sidebar is rendered
    setTimeout(setupObserver, 100);

    // Listen for window resize events
    const handleResize = () => scrollActiveItemIntoView();
    window.addEventListener('resize', handleResize);

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [location.pathname]); // Re-run when the route changes

  return <DocSidebar {...props} ref={sidebarRef} />;
}