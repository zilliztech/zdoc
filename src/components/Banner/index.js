import React, { useState, useRef, useCallback } from 'react';
import {
    InkeepModalChat,
} from "@inkeep/cxkit-react";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { inkeepSettings } from '../../../config/inkeep.config';
import styles from './styles.module.css';

export default function Banner({ bannerText, bannerLinkText }) {
    const [isOpen, setIsOpen] = useState(false);
    const { siteConfig } = useDocusaurusContext();

    const handleOpenChange = useCallback((isOpen) => {
        setIsOpen(isOpen);
    }, []);

    const config = inkeepSettings;

    config.baseSettings.apiKey = siteConfig.plugins.find(plugin => {
        return plugin[0] === '@inkeep/cxkit-docusaurus';
    })[1].SearchBar.baseSettings.apiKey;

    config.modalSettings = {
        isOpen,
        onOpenChange: handleOpenChange,
    };

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