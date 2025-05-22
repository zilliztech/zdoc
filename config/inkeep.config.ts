import { defineConfig } from "@inkeep/cxkit-docusaurus";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
    answerConfidence, 
    salesSignalType,
    detectedSalesSignal, 
    provideAnswerConfidenceSchema 
} from './Inkeep';

const validSalesSignalTypes = salesSignalType.options.map(
  option => option.value
);

export const inkeepSettings ={
  baseSettings: {
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

        if (type === 'searchResultItem') {
            console.log('source', source)
            console.log('type', type)
            if (source.url.includes('/docs/byoc')) {
                tabs.push('BYOC')
            } else if (source.url.includes('/docs')) {
                tabs.push('Guides')
            } else if (source.breadcrumbs.includes('Reference')) {
                tabs.push('Reference')
            } else if (source.url.startsWith('https://support.zilliz.com')) {
                tabs.push('Support')
            } else if (source.breadcrumbs.includes('Partners')) {
                tabs.push('Partners')
            } else if (source.breadcrumbs.includes('Event')) {
                tabs.push('Event')
            } else if (source.breadcrumbs.includes('Glossary')) {
                tabs.push('Glossary')
            } 
                
            return {
                ...source,
                title: `${source.title.split('Contact')[0].split(' | ')[0]}`
            }
        }
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
          url: "mailto:support@zilliz.com",
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
      "How do I create and connect to a cluster in Zilliz Cloud?",
      "How can I optimize vector search performance for large datasets?",
      "What are the differences between Serverless and Dedicated clusters?"
    ],
    aiAssistantAvatar: "https://assets.zilliz.com/zilliz_star_b6717656dc.svg",
    placeholder: "How can I get started?",
    getTools: () => [
      {
        type: "function",
        function: {
          name: "provideAnswerConfidence",
          description: "Determine how confident the AI assistant was and whether or not to escalate to humans.",
          parameters: zodToJsonSchema(provideAnswerConfidenceSchema),
        },
        renderMessageButtons: ({ args }) => {
          const confidence = args.answerConfidence;
          if (["not_confident", "no_sources", "other"].includes(confidence)) {
            return [
              {
                label: "Contact Support",
                action: {
                  type: "open_link",
                  url: "mailto:support@zilliz.com",
                },
                icon: {
                  builtIn: "IoHelpBuoyOutline"
                }
              }
            ];
          }
          return [];
        },
      },
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
      }
    ]
  },
  searchSettings: {
    placeholder: 'What are you looking for?',
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