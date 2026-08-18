import React, {type ReactNode} from 'react';

// Overrides the Root wrapper contributed by @inkeep/cxkit-docusaurus, which
// statically mounts the Inkeep ChatButton (and therefore drags the entire
// @inkeep/cxkit-react component library into the main bundle).
//
// The docs UI renders its own search/ask-ai entry points in the Navbar and
// loads the Inkeep modal on demand (see LazyInkeepModal), so the plugin's
// floating ChatButton is not needed here.
//
// Keeping this wrapper as a plain passthrough preserves the Docusaurus
// contract: a stateful provider mount point that survives route changes.
export default function Root({children}: {children: ReactNode}) {
  return <>{children}</>;
}
