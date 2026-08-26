import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {toDocusaurusSidebar} from '../runtime.ts';

// Compatibility shim for tooling that still imports the former root loader.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const generated = require('../../../../../generated/en/sidebars/guides.sidebar');

type GuidesNode = {label?: string; items?: GuidesNode[]; type?: string; href?: string};

const items = toDocusaurusSidebar(generated.default ?? generated) as unknown as GuidesNode[];

const RELEASE_NOTES_HREF = '/docs/changelogs';

// Turn the collapsible "Release notes" category under "Get Started" into a
// plain internal link to the changelogs landing page. Clicking it drills into
// the dedicated `releasesSidebar` instead of expanding an inline category.
function transformReleaseNotes(nodes: GuidesNode[]): GuidesNode[] {
  return nodes.map(node => {
    if (node.label !== 'Get Started' || !Array.isArray(node.items)) return node;
    return {
      ...node,
      items: node.items.map(child =>
        child.label === 'Release notes'
          ? {type: 'link', label: child.label, href: RELEASE_NOTES_HREF}
          : child,
      ),
    };
  });
}

// Release notes docs declare `displayed_sidebar: releasesSidebar`, so this
// sidebar must hold only the release-notes list. Reusing the full guides tree
// here is what made release-notes pages render the entire nav (including the
// primary rail) in the secondary column.
function releaseNotesSidebar(nodes: GuidesNode[]): GuidesNode[] {
  const getStarted = nodes.find(node => node.label === 'Get Started');
  const releaseNotes = getStarted?.items?.find(node => node.label === 'Release notes');
  return releaseNotes?.items ?? [];
}

const navItems = transformReleaseNotes(items);

const sidebars = {
  default: navItems,
  tutorialSidebar: navItems,
  releasesSidebar: releaseNotesSidebar(items),
} as unknown as SidebarsConfig;

export default sidebars;
