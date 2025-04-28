import React, { useState, useRef, useCallback } from 'react';
import {
    InkeepModalChat,
} from "@inkeep/cxkit-react";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

export default function Banner({ bannerText, bannerLinkText }) {
    const [isOpen, setIsOpen] = useState(false);
    const { siteConfig } = useDocusaurusContext();

    const { apiKey, integrationId, organizationId} = siteConfig.themeConfig.inkeepConfig.baseSettings;

    const handleOpenChange = useCallback((isOpen) => {
        setIsOpen(isOpen);
    }, []);

    const config = {
        baseSettings: {
            apiKey,
            integrationId,
            organizationId,
            organizationDisplayName: 'Zilliz Cloud',
            primaryBrandColor: '#175fff'
        },
        aiChatSettings: {
            aiAssistantName: 'Zilliz',
            chatSubjectName: 'Zilliz Cloud',
            placeholder: 'How do I get started?',
            introMessage: "Hi!\nI'm an AI assistan,t trained on documentation, help articles, and other content.\nAsk me anything about",
            isShareButtonVisible: true,
            isCopyChatButtonVisible: true,
            exampleQuestions: [
                "How do I create and connect to a cluster in Zilliz Cloud?",
                "How can I optimize vector search performance for large datasets?",
                "What are the differences between Serverless and Dedicated clusters?"
            ]
        }
    }

    config.modalSettings = {
        isOpen,
        onOpenChange: handleOpenChange,
    }

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