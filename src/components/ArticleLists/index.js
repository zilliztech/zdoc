import React, {useState, useEffect} from 'react';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';

import styles from './index.module.css';

function SectionHeader ({title, slug, description}) {
    const src = require(`@site/static/icons/${slug}.svg`).default;

    return (
        <div className={styles.titleContainer}>
            <div className={styles.title}>
                <div className={styles.titleIcon}>
                    <img src={src} alt={slug} />
                </div>
                <div className={styles.titleText}>
                    <span>{title}</span>
                    <span>{description}</span>
                </div>
            </div>
        </div>              
    )
}

function GroupHeader ({title, Icon, articles}) {
    const max_length = Math.max(...(articles.map((props) => props.title.length)))
    let style = ''
    if (max_length <= 35) {
        style = '1fr 1fr 1fr'
    } else if (max_length > 35 && max_length < 45) {
        style = '1fr 1fr'
    } else {
        style = '1fr'
    }

    return (
        <div className={styles.articleGroup}>
            { Icon && title && <div className={styles.articleGroupTitle}>
                <div className={styles.articleGroupIcon}>
                    <Icon />
                </div>
                <div className={styles.articleGroupText}>
                    <span>{title}</span>
                </div>    
            </div>}
            <div className={styles.articleGroupBody} style={{ gridTemplateColumns: style }}>
                {articles.map((props, idx) => (
                    <Article key={idx} {...props} />
                ))}
            </div>
        </div>
    )
}

function Article ({title, slug, colab, github, tag}) {
    const ColabIcon = require('@site/static/icons/colab-icon.svg').default;
    const GithubIcon = require('@site/static/icons/github-icon.svg').default;
    return (
        <div className={styles.article}>
            <div className={styles.articleText}>
                <div>
                    {slug ? <Link to={`/docs/${slug}`}>{title}</Link> : <span>{title}</span> }
                </div>
            </div>
            <sup className={styles.articleTag} style={{ display: tag ? 'inherit' : 'none'}}>
                <div>BETA</div>
            </sup>             
            <div className={styles.articleIcon} style={{ display: colab ? 'inherit' : 'none'}}>
                <ColabIcon />
            </div>
            <div className={styles.articleIcon} style={{ display: github ? 'inherit' : 'none'}}>
                <GithubIcon />
            </div>
        </div>        
    )
}

export default function ArticleLists() {
    const { blocks } = usePluginData('landing-page');
    const pages = blocks.filter((block) => block.title !== 'FAQs' && block.title !== 'Release Notes')
    // const pages = [{
    //     title: 'Getting Started',
    //     slug: "quick-start",
    //     description: 'Quickly start using Zilliz Cloud.',
    //     groups: [{
    //         articles: [{
    //             title: 'Quick Start',
    //             slug: "quick-start-1",
    //             colab: true,
    //             github: true,
    //             tag: true,
    //         }, {
    //             title: 'Register with Zilliz Cloud',
    //             slug: "register-with-zilliz-cloud",
    //             colab: true,
    //             github: true,
    //             tag: false,
    //         }, {
    //             title: 'Free Trials',
    //             slug: "free-trials",
    //             colab: true,
    //             github: true,
    //             tag: false,
    //         }, {
    //             title: 'Install SDKs',
    //             slug: "install-sdks",
    //             colab: true,
    //             github: true,
    //             tag: false,
    //         }, {
    //             title: 'Example Datasets',
    //             slug: "example-datasets",
    //             colab: true,
    //             github: true,
    //             tag: false,
    //         }]
    //     }]
    // }, {
    //     title: 'Cluster',
    //     slug: "cluster",
    //     description: 'Get started with Zilliz Cloud.',
    //     groups: [{
    //         articles: [{
    //             title: "Create Cluster",
    //             slug: "create-cluster",
    //             colab: false,
    //             github: false,
    //             tag: false
    //         },{
    //             title: "Connect to Cluster",
    //             slug: "connect-to-cluster",
    //             colab: false,
    //             github: false,
    //             tag: false
    //         },
    //         {
    //             title: "Manage Cluster",
    //             slug: "manage-cluster",
    //             colab: false,
    //             github: false,
    //             tag: false
    //         }]
    //     }]
    // }]

    return (
        <div className={styles.sections}>
            {pages.map((props, idx) => (
                props.groups.length > 0 && props.groups.filter(props => props.articles.length > 0).length > 0 &&
                <div className={styles.sectionContainer}>
                    <SectionHeader key={idx} title={props.title} slug={props.slug} description={props.description} />
                    <div className={styles.bodyContainer}>
                        <div className={styles.articleGroups}>
                            {props.groups.map((props, idx) => (
                                <GroupHeader key={idx} {...props} />                               
                            ))}
                        </div>
                    </div>
                </div>    
            ))}
        </div>
    )
}