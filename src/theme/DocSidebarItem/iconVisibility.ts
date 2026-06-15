import React from 'react';

// Default OFF: DocSidebarItem icons appear only where a provider explicitly opts
// in. This also covers the mobile hamburger menu, which Docusaurus renders through
// a secondary-menu portal that context providers don't reach.
const SidebarIconVisibilityContext = React.createContext(false);

export default SidebarIconVisibilityContext;
