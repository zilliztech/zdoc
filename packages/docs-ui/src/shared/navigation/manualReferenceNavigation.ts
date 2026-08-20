import {referenceTargetNavigation, type ReferenceTargetKind} from './referenceTargets.generated.ts';

export type DocsSite = 'en' | 'zh-CN';

export type ReferenceNavigationTarget = Readonly<{
  kind: ReferenceTargetKind;
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
    targets: Object.freeze(
      referenceTargetNavigation.map((entry, index) => Object.freeze({
        kind: entry.kind,
        label: labels[index],
        landingHref: entry.landingHref,
        hrefPrefixes: Object.freeze([...entry.hrefPrefixes]),
      })),
    ),
    entryRedirects: Object.freeze({
      '/reference/cli/overview': '/reference/cli/cli/overview',
    }),
  });
}

const englishNavigation = navigation('Client Libraries', 'Tools', 'Install SDKs', [
  'Python',
  'Java',
  'Node.js',
  'Go',
  'RESTful API',
  'CLI',
]);

const chineseNavigation = navigation('客户端参考', '工具', '安装 SDK', [
  'Python SDK',
  'Java SDK',
  'Node.js SDK',
  'Go SDK',
  'RESTful API',
  'Zilliz CLI',
]);

export function getManualReferenceNavigation(site: DocsSite): ManualReferenceNavigation {
  return site === 'zh-CN' ? chineseNavigation : englishNavigation;
}
