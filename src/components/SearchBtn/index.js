import React, { useState, useCallback } from 'react';
import {
    InkeepModalSearch,
} from "@inkeep/cxkit-react";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import styles from './styles.module.css';

export default function SearchBtn(props) {
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
            primaryBrandColor: '#175fff',
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
                        title: `${source.title.split('Contact')[0]}`
                    }
                }
            }

        },
        searchSettings: {
            placeholder: 'What are you looking for?',
            tabs: ['All', 'Guides', 'BYOC', 'Reference', 'Support', 'Partners', 'Event', 'Glossary']
        }
    }
    
    config.modalSettings = {
        isOpen,
        onOpenChange: handleOpenChange,
    }

    return (
        <>
            <div className={styles.searchBtn} onClick={() => setIsOpen(true)}>
                <i className={styles.searchIcon} />
            </div>
            <InkeepModalSearch {...config} />
        </>
    )
}