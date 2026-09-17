import React from 'react';
import styles from './styles.module.css';
import { useDocsUiText } from '../../i18n/uiText.ts';
import { extractEyebrow } from '@site/src/components/utils/eyebrow';

const PLAN_DESCRIPTIONS = {
  Free: 'Start for free with generous limits, no credit card required.',
  Serverless: 'Pay only for what you use, scales automatically to zero.',
  Dedicated: 'High-performance clusters with dedicated resources.',
  BYOC: 'Deploy on your own cloud infrastructure.',
};

export default function Bars({ children, eyebrow: eyebrowProp }) {
    const text = useDocsUiText();
    if (!Array.isArray(children) || children.length === 0) {
        return null;
    }

    const { eyebrow, rest } = extractEyebrow(children, eyebrowProp);

    // rest[0] = lead paragraph, rest[1] = list, rest[2] = trail paragraph
    const plans = React.Children.toArray(rest[1].props.children)
        .filter(child => typeof child !== 'string' || child.trim() !== '')
        .map(child => {
            if (!React.isValidElement(child)) return null;

            let firstChild = React.Children.toArray(child.props.children)
                .find(c => typeof c !== 'string' || c.trim() !== '');

            if (firstChild && React.isValidElement(firstChild) && firstChild.type === 'p') {
                firstChild = React.Children.toArray(firstChild.props.children)
                    .find(c => typeof c !== 'string' || c.trim() !== '');
            }

            if (!firstChild || !React.isValidElement(firstChild)) {
                return {
                    name: typeof firstChild === 'string' ? firstChild : '',
                    href: ''
                };
            }

            if (!firstChild.props) {
                return { name: '', href: '' };
            }

            const isLink = firstChild.props.href !== undefined;
            const nameValue = isLink
                ? (firstChild.props.children || '')
                : (typeof firstChild === 'string' ? firstChild : '');

            return {
                name: nameValue,
                href: isLink ? firstChild.props.href : ''
            };
        })
        .filter(Boolean);

    // The trailing paragraph is a single link ("Not sure which deployment option
    // to choose?"). It renders as a button below the cards, not as a stray line
    // of body copy.
    const helpLink = React.Children.toArray(rest[2]?.props?.children ?? [])
        .find(c => React.isValidElement(c) && c.props?.href !== undefined);
    const help = helpLink
        ? { href: helpLink.props.href, label: helpLink.props.children }
        : null;

    return (
        <div className={styles.container}>
            <h2 className={styles.sectionTitle}>{text.hero.plansTitle}</h2>
            {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
            <p className={styles.lead}>{ rest[0]?.props?.children || rest[0] }</p>
            <ul className={styles.list}>
                { plans.map((plan, index) => {
                    const description = PLAN_DESCRIPTIONS[plan.name] || '';
                    const cardContent = (
                        <>
                            <span className={styles.iconWrap}>
                                <i className={styles[`icon${plan.name}`]} />
                            </span>
                            <span className={styles.cardTitle}>{plan.name}</span>
                            {description && <span className={styles.cardDesc}>{description}</span>}
                            <span className={styles.arrow} aria-hidden="true">→</span>
                        </>
                    );

                    if (plan.href) {
                        return (
                            <li key={index} className={styles.item}>
                                <a href={plan.href} className={styles.cardLink}>
                                    {cardContent}
                                </a>
                            </li>
                        );
                    }

                    return (
                        <li key={index} className={styles.item}>
                            {cardContent}
                        </li>
                    );
                })}
            </ul>
            {help && (
                <a className={styles.helpBtn} href={help.href}>
                    {/* Question mark in a circle — the row is an offer of help,
                        so it carries the mark for one. */}
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                        <circle cx="8" cy="8" r="6.1" stroke="currentColor" strokeWidth="1.25" />
                        <path d="M6.3 6.25a1.75 1.75 0 1 1 1.75 1.9v1" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
                        <circle cx="8.05" cy="11.15" r="0.7" fill="currentColor" />
                    </svg>
                    <span>{help.label}</span>
                </a>
            )}
        </div>
    );
}
