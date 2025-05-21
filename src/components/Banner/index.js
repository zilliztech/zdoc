import React, { useState, useRef, useCallback } from 'react';
import {
    InkeepModalChat,
} from "@inkeep/cxkit-react";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { zodToJsonSchema } from "zod-to-json-schema";
import {
    answerConfidence,
    salesSignalType, 
    detectedSalesSignal, 
    provideAnswerConfidenceSchema 
} from '../../../config/Inkeep';
import styles from './styles.module.css';

const validSalesSignalTypes = salesSignalType.options.map(
  option => option.value
);

export default function Banner({ bannerText, bannerLinkText }) {
    const [isOpen, setIsOpen] = useState(false);
    const { siteConfig } = useDocusaurusContext();

    const handleOpenChange = useCallback((isOpen) => {
        setIsOpen(isOpen);
    }, []);

    const config = siteConfig.plugins.find(plugin => {
        return plugin[0] === '@inkeep/cxkit-docusaurus';
    })[1].SearchBar;

    config.modalSettings = {
        isOpen,
        onOpenChange: handleOpenChange,
    }

    config.aiChatSettings.getTools = () => [
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
    ];

    return (
        <div className={styles.container}>
            <div className={styles.banner}>
                <span className={styles.bannerText}>
                    { bannerText }
                </span>
                <span type="button" className={styles.bannerLink} onClick={() => setIsOpen(true)}>
                    <span>{ bannerLinkText }</span>
                    <i className={styles.zillizStar} />
                </span>
            </div> 

            <InkeepModalChat {...config} />
        </div>
    )
}