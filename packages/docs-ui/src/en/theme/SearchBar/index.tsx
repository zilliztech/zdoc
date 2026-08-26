import React from 'react';

// Replaces the @theme/SearchBar contributed by @inkeep/cxkit-docusaurus for the
// English build. The cxkit SearchBar statically imports InkeepSearchBar from
// @inkeep/cxkit-react, which would otherwise pull the entire Inkeep widget
// library into the main bundle via Docusaurus' NavbarItem ComponentTypes
// registry (SearchNavbarItem -> @theme/SearchBar).
//
// The docs UI renders its own search entry points in the Navbar and loads the
// Inkeep modal on demand (see LazyInkeepModal), so this placeholder is never
// rendered by the production navigation shell. The Chinese build does not apply
// this override — it lets @easyops-cn/docusaurus-search-local provide its own
// local SearchBar.
export default function SearchBar(): null {
  return null;
}
