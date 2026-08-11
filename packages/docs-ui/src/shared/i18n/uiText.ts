import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export type DocsUiSite = 'en' | 'zh-CN';

export interface DocsUiText {
  common: {
    copy: string;
    copied: string;
    copyCode: string;
    copyCommand: string;
  };
  breadcrumbs: {
    ariaLabel: string;
    docsHome: string;
    releases: string;
    byoc: string;
    apiAndSdk: string;
    managedCloud: string;
    contactSales: string;
  };
  sidebar: {
    label: string;
    expand: string;
    section: string;
    numberedSection: (index: number) => string;
    documentationSections: string;
    documentationPages: string;
    releaseNotes: string;
    backTo: (label: string) => string;
  };
  navbar: {
    docs: string;
    search: string;
    moreActions: string;
    support: string;
    logIn: string;
    signUpFree: string;
  };
  chat: {
    title: string;
    clearConversation: string;
    close: string;
    thinking: string;
    searching: string;
    today: string;
    previousSevenDays: string;
    older: string;
    newChat: string;
    searchChats: string;
    noHistory: string;
    deleteChat: string;
    removeContext: string;
    placeholder: string;
    messageLabel: string;
    send: string;
    sendQuestion: string;
    sources: string;
    helpful: string;
    notHelpful: string;
    bottom: string;
    stop: string;
    stopResponse: string;
    panelLabel: string;
    askAi: string;
    askAiAboutCode: string;
    codeSnippet: string;
    defaultHistoryTitle: string;
    requestFailed: (status: number) => string;
    unexpectedError: (message: string) => string;
    confidence: Record<'high' | 'medium' | 'low', string>;
    suggestions: {
      default: readonly string[];
      python: readonly string[];
      reference: readonly string[];
      byoc: readonly string[];
      docs: readonly string[];
    };
  };
  search: {
    placeholder: string;
    askAi: (query: string) => string;
    searching: string;
    noResults: (query: string) => string;
    popularPages: string;
    recent: string;
    clearAll: string;
    removeRecent: (query: string) => string;
    close: string;
    sections: Record<string, string>;
    popular: ReadonlyArray<{title: string; url: string; section: string}>;
  };
  notFound: {
    pageTitle: string;
    heading: string;
    assistantSubtitle: string;
    fallbackSubtitle: string;
    backToDocs: string;
    thinking: string;
    suggestions: readonly string[];
  };
  copyPage: {
    copyPage: string;
    copyPageAsMarkdown: string;
    moreOptions: string;
    options: string;
    copying: string;
    copied: string;
    failed: string;
    viewSource: string;
    viewSourceDescription: string;
    openInChatGPT: string;
    openInClaude: string;
    askAboutPage: string;
    connectCursor: string;
    installCursorMcp: string;
    sourceNotFound: string;
    copyFailed: string;
    sourceUnavailable: string;
  };
  toc: {onThisPage: string};
  image: {preview: string; closePreview: string};
  docMeta: {versionInformation: string; minimumSdkVersion: string};
  hero: {
    forHumans: string;
    forAgents: string;
    copyJson: string;
    goTo: (label: string) => string;
  };
  featureNote: {regionAvailability: string; planAvailability: string};
}

const english: DocsUiText = {
  common: {
    copy: 'Copy',
    copied: 'Copied',
    copyCode: 'Copy code',
    copyCommand: 'Copy command',
  },
  breadcrumbs: {
    ariaLabel: 'Breadcrumb',
    docsHome: 'Docs Home',
    releases: 'Releases',
    byoc: 'Bring Your Own Cloud',
    apiAndSdk: 'API & SDK',
    managedCloud: 'Zilliz-Managed Cloud',
    contactSales: 'Contact Sales',
  },
  sidebar: {
    label: 'Sidebar',
    expand: 'Expand sidebar',
    section: 'Section',
    numberedSection: index => `Section ${index}`,
    documentationSections: 'Documentation sections',
    documentationPages: 'Documentation pages',
    releaseNotes: 'Release notes',
    backTo: label => `Back to ${label}`,
  },
  navbar: {
    docs: 'Docs',
    search: 'Search',
    moreActions: 'More actions',
    support: 'Support',
    logIn: 'Log In',
    signUpFree: 'Sign Up Free',
  },
  chat: {
    title: 'Ask AI',
    clearConversation: 'Clear conversation',
    close: 'Close chat',
    thinking: 'Thinking',
    searching: 'Searching',
    today: 'Today',
    previousSevenDays: 'Previous 7 days',
    older: 'Older',
    newChat: 'New Chat',
    searchChats: 'Search chats...',
    noHistory: 'No chat history yet',
    deleteChat: 'Delete chat',
    removeContext: 'Remove context',
    placeholder: 'Ask a question...',
    messageLabel: 'Chat message',
    send: 'Send',
    sendQuestion: 'Send question',
    sources: 'Sources',
    helpful: 'Helpful',
    notHelpful: 'Not helpful',
    bottom: 'Bottom',
    stop: 'Stop',
    stopResponse: 'Stop response',
    panelLabel: 'Zilliz Copilot',
    askAi: 'Ask AI',
    askAiAboutCode: 'Ask AI about this code',
    codeSnippet: 'Code snippet',
    defaultHistoryTitle: 'New chat',
    requestFailed: status => `Request failed (${status})`,
    unexpectedError: message => `Something went wrong: ${message}`,
    confidence: {
      high: 'High confidence — answer directly supported by documentation',
      medium: 'Medium confidence — partially supported by documentation',
      low: 'Low confidence — limited documentation available',
    },
    suggestions: {
      default: [
        'How do I get started with Zilliz Cloud?',
        'What are the API rate limits?',
        'Show me integration examples',
        'How to handle authentication?',
      ],
      python: [
        'Show me a PyMilvus insert example',
        'How do I search with filters?',
        'How do I create a collection with dynamic schema?',
        'What index types are available?',
      ],
      reference: [
        'Show me a code example for this API',
        'What are the required parameters?',
        'How do I handle errors?',
        'What are the rate limits for this endpoint?',
      ],
      byoc: [
        'How do I deploy BYOC on AWS?',
        'What are the networking requirements?',
        'How do I configure private endpoints?',
        'Compare BYOC vs. Serverless',
      ],
      docs: [
        'Help me design a schema for my use case',
        'What cluster size do I need?',
        'Show me a vector search example',
        'How do I optimize search performance?',
      ],
    },
  },
  search: {
    placeholder: 'Search documentation...',
    askAi: query => `Ask AI: “${query}”`,
    searching: 'Searching...',
    noResults: query => `No results found for “${query}”`,
    popularPages: 'Popular pages',
    recent: 'Recent',
    clearAll: 'Clear all',
    removeRecent: query => `Remove ${query}`,
    close: 'Close search',
    sections: {Docs: 'Docs', Reference: 'Reference', Results: 'Results'},
    popular: [
      {title: 'Getting Started', url: '/docs/create-cluster', section: 'Docs'},
      {title: 'API Reference', url: '/reference/restful', section: 'Reference'},
      {title: 'Python SDK', url: '/reference/python', section: 'Reference'},
      {title: 'Search Guide', url: '/docs/single-vector-search', section: 'Docs'},
    ],
  },
  notFound: {
    pageTitle: 'Page Not Found',
    heading: 'Page not found',
    assistantSubtitle: "I can help you find what you're looking for",
    fallbackSubtitle: "We couldn't find what you were looking for",
    backToDocs: 'Back to documentation',
    thinking: 'thinking...',
    suggestions: [
      'How do I get started with Zilliz Cloud?',
      'Search the documentation',
      'Show me the API reference',
    ],
  },
  copyPage: {
    copyPage: 'Copy page',
    copyPageAsMarkdown: 'Copy page as Markdown for LLMs',
    moreOptions: 'More copy options',
    options: 'Copy page options',
    copying: 'Copying…',
    copied: 'Copied!',
    failed: 'Failed',
    viewSource: 'View source',
    viewSourceDescription: 'Open raw Markdown in a new tab',
    openInChatGPT: 'Open in ChatGPT',
    openInClaude: 'Open in Claude',
    askAboutPage: 'Ask questions about this page',
    connectCursor: 'Connect to Cursor',
    installCursorMcp: 'Install the MCP server in Cursor',
    sourceNotFound: 'Source not found',
    copyFailed: 'Failed to copy. Please try again.',
    sourceUnavailable: 'Source view is unavailable for this page.',
  },
  toc: {onThisPage: 'On this page'},
  image: {preview: 'Image preview', closePreview: 'Close image preview'},
  docMeta: {versionInformation: 'Version information', minimumSdkVersion: 'Minimum SDK version'},
  hero: {
    forHumans: 'For humans',
    forAgents: 'For agents',
    copyJson: 'Copy JSON',
    goTo: label => `Go to ${label}`,
  },
  featureNote: {regionAvailability: 'Region availability', planAvailability: 'Plan availability'},
};

const chinese: DocsUiText = {
  common: {
    copy: '复制',
    copied: '已复制',
    copyCode: '复制代码',
    copyCommand: '复制命令',
  },
  breadcrumbs: {
    ariaLabel: '面包屑导航',
    docsHome: '文档首页',
    releases: '版本文档',
    byoc: 'BYOC 开发指南',
    apiAndSdk: 'API 与 SDK',
    managedCloud: 'Cloud 开发指南',
    contactSales: '联系销售',
  },
  sidebar: {
    label: '侧边栏',
    expand: '展开侧边栏',
    section: '文档栏目',
    numberedSection: index => `文档栏目 ${index}`,
    documentationSections: '文档栏目',
    documentationPages: '文档页面',
    releaseNotes: '版本说明',
    backTo: label => `返回${label}`,
  },
  navbar: {
    docs: '文档',
    search: '搜索',
    moreActions: '更多操作',
    support: '支持',
    logIn: '登录',
    signUpFree: '免费注册',
  },
  chat: {
    title: '询问 AI',
    clearConversation: '清空对话',
    close: '关闭对话',
    thinking: '思考中',
    searching: '搜索中',
    today: '今天',
    previousSevenDays: '过去 7 天',
    older: '更早',
    newChat: '新建对话',
    searchChats: '搜索历史对话...',
    noHistory: '暂无历史对话',
    deleteChat: '删除对话',
    removeContext: '移除上下文',
    placeholder: '请输入问题...',
    messageLabel: '对话消息',
    send: '发送',
    sendQuestion: '发送问题',
    sources: '参考来源',
    helpful: '有帮助',
    notHelpful: '没有帮助',
    bottom: '回到底部',
    stop: '停止',
    stopResponse: '停止生成',
    panelLabel: 'Zilliz AI 助手',
    askAi: '询问 AI',
    askAiAboutCode: '向 AI 询问这段代码',
    codeSnippet: '代码片段',
    defaultHistoryTitle: '新对话',
    requestFailed: status => `请求失败（状态码 ${status}）`,
    unexpectedError: message => `请求出错：${message}`,
    confidence: {
      high: '高置信度：回答有文档直接支持',
      medium: '中等置信度：回答有部分文档支持',
      low: '低置信度：可用文档依据有限',
    },
    suggestions: {
      default: [
        '如何开始使用 Zilliz Cloud？',
        'API 有哪些速率限制？',
        '给我一些集成示例',
        '如何处理身份验证？',
      ],
      python: [
        '给我一个 PyMilvus 数据插入示例',
        '如何使用过滤条件搜索？',
        '如何创建启用动态字段的集合？',
        '支持哪些索引类型？',
      ],
      reference: [
        '给我一个此 API 的代码示例',
        '哪些参数是必填的？',
        '如何处理错误？',
        '此接口有哪些速率限制？',
      ],
      byoc: [
        '如何在 AWS 上部署 BYOC？',
        '有哪些网络要求？',
        '如何配置私有端点？',
        '比较 BYOC 与 Serverless',
      ],
      docs: [
        '帮我为当前场景设计数据模型',
        '我需要多大规格的集群？',
        '给我一个向量搜索示例',
        '如何优化搜索性能？',
      ],
    },
  },
  search: {
    placeholder: '搜索文档...',
    askAi: query => `询问 AI：“${query}”`,
    searching: '正在搜索...',
    noResults: query => `未找到与“${query}”相关的结果`,
    popularPages: '热门页面',
    recent: '最近搜索',
    clearAll: '全部清除',
    removeRecent: query => `移除搜索记录：${query}`,
    close: '关闭搜索',
    sections: {Docs: '开发指南', Reference: 'API 与 SDK', Results: '搜索结果'},
    popular: [
      {title: '快速开始', url: '/docs/quick-start', section: '开发指南'},
      {title: 'RESTful API 参考', url: '/reference/restful', section: 'API 与 SDK'},
      {title: 'Python SDK 参考', url: '/reference/python', section: 'API 与 SDK'},
      {title: '向量搜索指南', url: '/docs/single-vector-search', section: '开发指南'},
    ],
  },
  notFound: {
    pageTitle: '找不到页面',
    heading: '找不到页面',
    assistantSubtitle: '我可以帮你查找需要的文档',
    fallbackSubtitle: '没有找到你要访问的页面',
    backToDocs: '返回文档首页',
    thinking: '思考中...',
    suggestions: [
      '如何开始使用 Zilliz Cloud？',
      '搜索文档',
      '查看 API 参考',
    ],
  },
  copyPage: {
    copyPage: '复制页面',
    copyPageAsMarkdown: '以 Markdown 格式复制页面，供大模型使用',
    moreOptions: '更多复制选项',
    options: '复制页面选项',
    copying: '正在复制…',
    copied: '已复制！',
    failed: '复制失败',
    viewSource: '查看源文件',
    viewSourceDescription: '在新标签页中打开原始 Markdown',
    openInChatGPT: '在 ChatGPT 中打开',
    openInClaude: '在 Claude 中打开',
    askAboutPage: '围绕此页面内容提问',
    connectCursor: '连接到 Cursor',
    installCursorMcp: '在 Cursor 中安装 MCP 服务',
    sourceNotFound: '未找到页面源文件',
    copyFailed: '复制失败，请重试。',
    sourceUnavailable: '此页面暂不支持查看源文件。',
  },
  toc: {onThisPage: '本页内容'},
  image: {preview: '图片预览', closePreview: '关闭图片预览'},
  docMeta: {versionInformation: '版本信息', minimumSdkVersion: '最低 SDK 版本'},
  hero: {
    forHumans: '开发者使用',
    forAgents: 'AI Agent 使用',
    copyJson: '复制 JSON',
    goTo: label => `前往${label}`,
  },
  featureNote: {regionAvailability: '区域可用性', planAvailability: '套餐可用性'},
};

export function resolveDocsUiSite(site: unknown): DocsUiSite {
  return site === 'zh-CN' ? 'zh-CN' : 'en';
}

export function getDocsUiText(site: unknown): DocsUiText {
  return resolveDocsUiSite(site) === 'zh-CN' ? chinese : english;
}

export function useDocsUiText(): DocsUiText {
  const {siteConfig} = useDocusaurusContext();
  return getDocsUiText(siteConfig.customFields?.site);
}

export function localizeChatStatus(status: string | undefined, text: DocsUiText): string | undefined {
  if (!status || resolveDocsUiSiteFromText(text) === 'en') return status;
  const normalized = status.trim().toLowerCase();
  if (/search|retriev|lookup|document/.test(normalized)) return text.chat.searching;
  if (/think|reason|analy|plan|process/.test(normalized)) return text.chat.thinking;
  return status;
}

function resolveDocsUiSiteFromText(text: DocsUiText): DocsUiSite {
  return text === chinese ? 'zh-CN' : 'en';
}

export function localizeSearchSection(section: string | undefined, text: DocsUiText): string | undefined {
  if (!section) return undefined;
  return text.search.sections[section] ?? section;
}
