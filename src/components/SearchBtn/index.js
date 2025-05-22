import { useState, useCallback } from 'react';
import {
    InkeepModalSearch,
} from "@inkeep/cxkit-react";
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { inkeepSettings } from '../../../config/inkeep.config';
import styles from './styles.module.css';

export default function SearchBtn(props) {
    const [isOpen, setIsOpen] = useState(false);
    const { siteConfig } = useDocusaurusContext();

    const handleOpenChange = useCallback((isOpen) => {
        setIsOpen(isOpen);
    }, []);

    const config = inkeepSettings;

    config.baseSettings.apiKey = siteConfig.plugins.find(plugin => {
        return plugin[0] === '@inkeep/cxkit-docusaurus';
    })[1].ChatButton.baseSettings.apiKey;

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