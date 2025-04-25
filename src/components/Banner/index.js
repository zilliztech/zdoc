import React, { useState, useRef, useCallback } from 'react';
import {
    InkeepModalSearchAndChat,
} from "@inkeep/cxkit-react";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

export default function Banner({ bannerText, bannerLinkText }) {
    const [isOpen, setIsOpen] = useState(false);
    const { siteConfig } = useDocusaurusContext();

    const inkeepModalSearchAndChatProps = siteConfig.themeConfig.inkeepConfig;

    const handleOpenChange = useCallback((isOpen) => {
        setIsOpen(isOpen);
    }, []);

    inkeepModalSearchAndChatProps.modalSettings = {
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

            <InkeepModalSearchAndChat {...inkeepModalSearchAndChatProps} />
        </div>
    )
}