import type {ReferenceTarget} from './docsRoute';

export type DocsSite = 'en' | 'zh-CN';

export type ReferenceNavigationTarget = Readonly<{
  kind: ReferenceTarget;
  label: string;
  landingHref: string;
  hrefPrefixes: readonly string[];
}>;

export type ManualReferenceNavigation = Readonly<{
  clientLibrariesLabel: string;
  toolsLabel: string;
  installSdksLabel: string;
  installSdksHref: string;
  toolsHref: string;
  targets: readonly ReferenceNavigationTarget[];
  entryRedirects: Readonly<Record<string, string>>;
}>;

function target(
  kind: ReferenceTarget,
  label: string,
  landingHref: string,
  hrefPrefixes: readonly string[] = [landingHref],
): ReferenceNavigationTarget {
  return Object.freeze({kind, label, landingHref, hrefPrefixes: Object.freeze([...hrefPrefixes])});
}

function navigation(
  clientLibrariesLabel: string,
  toolsLabel: string,
  installSdksLabel: string,
  labels: readonly string[],
): ManualReferenceNavigation {
  return Object.freeze({
    clientLibrariesLabel,
    toolsLabel,
    installSdksLabel,
    installSdksHref: '/docs/install-sdks',
    toolsHref: '/docs/agents-and-prompts',
    targets: Object.freeze([
      target('python', labels[0], '/reference/python'),
      target('java', labels[1], '/reference/java'),
      target('go', labels[2], '/reference/go'),
      target('nodejs', labels[3], '/reference/nodejs', ['/reference/nodejs', '/reference/node']),
      target('restful', labels[4], '/reference/restful'),
      target('cli', labels[5], '/reference/cli'),
    ]),
    entryRedirects: Object.freeze({
      '/reference/cli/overview': '/reference/cli/cli/overview',
    }),
  });
}

const englishNavigation = navigation('Client Libraries', 'Tools', 'Install SDKs', [
  'Python',
  'Java',
  'Go',
  'Node.js',
  'RESTful API',
  'CLI',
]);

const chineseNavigation = navigation('客户端参考', '工具', '安装 SDK', [
  'Python SDK',
  'Java SDK',
  'Go SDK',
  'Node.js SDK',
  'RESTful API',
  'Zilliz CLI',
]);

export function getManualReferenceNavigation(site: DocsSite): ManualReferenceNavigation {
  return site === 'zh-CN' ? chineseNavigation : englishNavigation;
}
