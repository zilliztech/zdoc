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

function GroupHeader (props) {
    let style = ''
    if (props.groups) {
        const max_length = Math.max(...(props.groups.map((props) => props.title.length)))

        if (max_length <= 35) {
            style = '1fr 1fr 1fr'
        } else if (max_length > 35 && max_length < 45) {
            style = '1fr 1fr'
        } else {
            style = '1fr'
        }
    }

    const Icon = require(`@site/static/icons/1F4D1.svg`).default;
    
    return (
        <div className={styles.articleGroup}>
            <div className={styles.articleGroupTitle}>
                <div className={styles.articleGroupIcon}>
                    <Icon />
                </div>
                <div className={styles.articleGroupText}>
                    <span>{props.title}</span>
                </div>    
            </div> 
            <div className={styles.articleGroupBody} style={{ gridTemplateColumns: style }}>
                {props.groups.map((props, idx) => (
                    <Article key={`group-${idx}`} {...props} />
                ))}
            </div>
        </div>
    )
}

function Articles (props) {
    let style = ''
    const max_length = Math.max(...(props.groups.map((props) => props.title.length)))

    if (max_length <= 35) {
        style = '1fr 1fr 1fr'
    } else if (max_length > 35 && max_length < 45) {
        style = '1fr 1fr'
    } else {
        style = '1fr'
    }

    return (
        <div className={styles.articleGroup}>
            <div className={styles.articleGroupBody} style={{ gridTemplateColumns: style }}>
                {props.groups.map((props, idx) => (!props.groups &&
                    <Article key={`article-${idx}`} {...props} />
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
    console.log(pages)

    return (
        <div className={styles.sections}>
            {pages.map((props, idx) => (
                props.groups.length > 0 &&
                <div key={`section-container-${idx}`} className={styles.sectionContainer}>
                    <SectionHeader key={`section-${idx}`} title={props.title} slug={props.slug} description={props.description} />
                    <div className={styles.bodyContainer}>
                        <div className={styles.articleGroups}>
                            {props.groups.map((props, idx) => ( props.groups &&
                                    <GroupHeader key={`group-${idx}`} {...props} />
                                )
                            )}
                            {!props.groups.groups && <Articles key={`articles-${idx}`} {...props}></Articles>}
                        </div>
                    </div>
                </div>    
            ))}
        </div>
    )
}