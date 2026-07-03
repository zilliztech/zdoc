import { defineConfig } from "@inkeep/cxkit-docusaurus";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
    answerConfidence, 
    salesSignalType,
    detectedSalesSignal, 
    supportSignalType,
    detectedSupportSignal,
    provideAnswerConfidenceSchema 
} from './Inkeep';

const validSalesSignalTypes = salesSignalType.options.map(
  option => option.value
);

const validSupportSignalTypes = supportSignalType.options.map(
  option => option.value
);

function getRuntimeInkeepApiKey() {
  return typeof window !== 'undefined' ? window.__ZDOC_ENV__?.INKEEP_API_KEY : undefined;
}

function getRuntimeInkeepIntegrationId() {
  return typeof window !== 'undefined' ? window.__ZDOC_ENV__?.INKEEP_INTEGRATION_ID : undefined;
}

function getRuntimeInkeepOrganizationId() {
  return typeof window !== 'undefined' ? window.__ZDOC_ENV__?.INKEEP_ORGANIZATION_ID : undefined;
}

export const inkeepSettings ={
  baseSettings: {
    apiKey: getRuntimeInkeepApiKey(),
    integrationId: getRuntimeInkeepIntegrationId(),
    organizationId: getRuntimeInkeepOrganizationId(),
    aiApiBaseUrl: "/inkeep",
    primaryBrandColor: "#175fff",
    organizationDisplayName: "Zilliz",
    theme: {
      styles: [
        {
          key: 'custom-styles',
          type: 'link',
          value: "/css/inkeep-overrides.css"
        }
      ]
    },
    transformSource: (source, type) => {
        const tabs = source.tabs || [];
        const url = source.url || '';
        const breadcrumbs = Array.isArray(source.breadcrumbs)
          ? source.breadcrumbs.join(' ')
          : String(source.breadcrumbs || '');
        const title = String(source.title || '');

        if (type === 'searchResultItem') {
            if (url.includes('/docs/byoc')) {
                tabs.push('BYOC')
            } else if (url.includes('/docs')) {
                tabs.push('Guides')
            } else if (breadcrumbs.includes('Reference')) {
                tabs.push('Reference')
            } else if (url.startsWith('https://support.zilliz.com')) {
                tabs.push('Support')
            } else if (breadcrumbs.includes('Partners')) {
                tabs.push('Partners')
            } else if (breadcrumbs.includes('Event')) {
                tabs.push('Event')
            } else if (breadcrumbs.includes('Glossary')) {
                tabs.push('Glossary')
            } 
                
            return {
                ...source,
                tabs,
                title: `${title.split('Contact')[0].split(' | ')[0]}`
            }
        }

        return source;
    }            
  },
  aiChatSettings: {
    toolbarButtonLabels: {
      getHelp: "Get Help",
      clear: "Clear",
      stop: "Stop"
    },
    aiAssistantName: "AI Assistant",
    chatSubjectName: "Zilliz Cloud",
    introMessage: "Hi, I'm the Zilliz Cloud AI Assistant.\nTrained on our technical docs, help articles, and best practices.\nWhat can we help with today?",
    getHelpOptions: [
      {
        name: "Contact Support",
        action: {
          type: "open_link",
          url: "https://support.zilliz.com/hc/en-us",
        },
        icon: {
          builtIn: "IoHelpBuoyOutline"
        },
        isPinnedToToolbar: true
      },
      {
        name: "Contact Sales",
        action: {
          type: "open_link",
          url: "https://zilliz.com/contact-sales?contact_sales_traffic_source=websiteBot"
        },
        icon: {
          builtIn: "IOChatbubblesOutline"
        },
        isPinnedToToolbar: true
      }
    ],
    exampleQuestionsLabel: "EXAMPLE QUESTIONS",
    exampleQuestions: [
      "Create and connect to a cluster",
      "Optimize vector search performance for large datasets",
      "Serverless vs Dedicated",
      "Latest updates of Zilliz Cloud",
      "Change payment method"
    ],
    aiAssistantAvatar: "https://assets.zilliz.com/cloud_ai_assistance_avatar_d9eb0d7763.svg",
    placeholder: "How can I get started?",
    getTools: () => [
      // {
      //   type: "function",
      //   function: {
      //     name: "provideAnswerConfidence",
      //     description: "Determine how confident the AI assistant was and whether or not to escalate to humans.",
      //     parameters: zodToJsonSchema(provideAnswerConfidenceSchema),
      //   },
      //   renderMessageButtons: ({ args }) => {
      //     const confidence = args.answerConfidence;
      //     if (["not_confident", "no_sources", "other"].includes(confidence)) {
      //       return [
      //         {
      //           label: "Contact Support",
      //           action: {
      //             type: "open_link",
      //             url: "https://support.zilliz.com/hc/en-us",
      //           },
      //           icon: {
      //             builtIn: "IoHelpBuoyOutline"
      //           }
      //         }
      //       ];
      //     }
      //     return [];
      //   },
      // },
      {
        type: "function",
        function: {
          name: "detectSalesSignal",
          description: "Identify when users express interest in potentially purchasing a product.",
          parameters: zodToJsonSchema(detectedSalesSignal),
        },
        renderMessageButtons: ({ args }) => {
          if (args.type && validSalesSignalTypes.includes(args.type)) {
            return [
              {
                label: "Talk to sales",
                icon: { builtIn: "LuCalendar"},
                action: {
                  type: "open_link",
                  url: "https://zilliz.com/contact-sales?contact_sales_traffic_source=websiteBot"
                }
              }
            ];
          }
          return []
        }
      },
      {
        type: "function",
        function: {
          name: "detectSupportSignal",
          description: "Identify when users need support or assistance.",
          parameters: zodToJsonSchema(detectedSupportSignal),
        },
        renderMessageButtons: ({ args }) => {
          if (args.type && validSupportSignalTypes.includes(args.type)) {
            return [
              {
                label: "Contact Support",
                icon: { builtIn: "IoHelpBuoyOutline" },
                action: {
                  type: "open_link",
                  url: "https://support.zilliz.com/hc/en-us"
                }
              }
            ];
          }
          return []
        }
      }
    ]
  },
  searchSettings: {
    placeholder: 'Search or ask a question...',
    debounceTimeMs: 200,
    tabs: ['All', 'Guides', 'BYOC', 'Reference', 'Support', 'Partners', 'Event', 'Glossary']        
  }
};

export default defineConfig({
  SearchBar: {
    ...inkeepSettings
  },
  ChatButton: {
    ...inkeepSettings
  },
});
