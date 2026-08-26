import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {toDocusaurusSidebar} from '../runtime.ts';
import {insertToolsSidebarFragment} from './guides-layout.ts';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const generated = require('../../../../../generated/zh-CN/sidebars/guides.sidebar');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const generatedTools = require('../../../../../generated/zh-CN/sidebars/tools.sidebar');

type GuidesNode = {label?: string; items?: GuidesNode[]; type?: string; href?: string};

const baseItems = toDocusaurusSidebar(generated.default ?? generated) as unknown as GuidesNode[];
const toolsItems = toDocusaurusSidebar(generatedTools.default ?? generatedTools) as unknown as GuidesNode[];

const RELEASE_NOTES_HREF = '/docs/changelogs';

// Turn the collapsible "版本说明书" category under "从这里开始" into a plain
// internal link to the changelogs landing page, mirroring the English layout.
function transformReleaseNotes(nodes: GuidesNode[]): GuidesNode[] {
  return nodes.map(node => {
    if (node.label !== '从这里开始' || !Array.isArray(node.items)) return node;
    return {
      ...node,
      items: node.items.map(child =>
        child.label === '版本说明书'
          ? {type: 'link', label: child.label, href: RELEASE_NOTES_HREF}
          : child,
      ),
    };
  });
}

// Release notes docs declare `displayed_sidebar: releasesSidebar`, so this
// sidebar must hold only the release-notes list — not the full guides tree.
function releaseNotesSidebar(nodes: GuidesNode[]): GuidesNode[] {
  const getStarted = nodes.find(node => node.label === '从这里开始');
  const releaseNotes = getStarted?.items?.find(node => node.label === '版本说明书');
  return releaseNotes?.items ?? [];
}

const items = insertToolsSidebarFragment(transformReleaseNotes(baseItems), toolsItems);

export default {
  default: items,
  tutorialSidebar: items,
  releasesSidebar: releaseNotesSidebar(baseItems),
} as unknown as SidebarsConfig;
