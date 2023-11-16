import React, { useState } from 'react';
import Link from '@docusaurus/Link'
import Heading from '@theme-original/Heading';
import useFrontMatter from '@theme/useFrontMatter';
import styles from './styles.module.css';

const BetaTagComponent = (children) => (
    <span style={{ 
        display: "inline-block",
        verticalAlign: 'center',
        minHeight: '2rem',
      }}>
          {children}
        <div style={{
          display: "inline-block",
          lineHeight: '2rem',
          verticalAlign: 'top'
        }}>
          <span
              style={{
                fontSize: '1rem',
                color: '#ffffff',
                fontWeight: 'normal',
                marginLeft: '0.5rem',
                marginBottom: '0.5rem',
                padding: '2px 12px 2px 12px',
                borderRadius: '100px',
                backgroundColor: '#7F47FF',
              }}>
              BETA
          </span>        
        </div>    

    </span>


);

const OpenInButtonComponent = ({
  caption,
  icon,
}) => (
  <div style={{
    display: 'inline-block',
    fontSize: '1rem',
    fontWeight: '600',
    padding: "0.5rem 1rem 0.5rem 1rem",
    borderRadius: '8px',
    border: '1px solid #E8EAEE',
    backgroundColor: '#F6F8fA',
    cursor: 'pointer',
  }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ display: 'inline-block'}}>OPEN IN <span className={styles.vendor}>{caption.toUpperCase()}</span></span>
        {icon}
      </div>
  </div>
)

const OpenInButtonLink = ({
  caption,
  icon,
  notebook,
}) => {
  const prefix = "https://colab.research.google.com/github/zilliztech/zdoc-demos/blob/master/python/";

  if (notebook && notebook.indexOf(',') > -1) {
    notebook = notebook.includes(',') ? notebook.split(',') : notebook;
    const [expand, setExpand] = useState(false);

    return (
      <div className="navbar__item dropdown dropdown--hoverable" style={{padding: 0}}>
          <OpenInButtonComponent caption={caption + " \u25BC"} icon={icon} aria-haspopup="true" aria-expanded={expand} onClick={() => setExpand(!expand)} role="button" className="navbar__link" />
          <ul className="dropdown__menu">
              {notebook.map((item, idx) => (
                  <li key={idx}>
                      <a href={prefix+item} className="dropdown__link" target="_blank" rel="noopener noreferrer">{item}</a>
                  </li>
              ))}
          </ul>
      </div>
    )
  } else {
    return (
      <Link to={prefix + notebook} style={{ color: "#000000"}}>
        <OpenInButtonComponent caption={caption} icon={icon} />
      </Link>
    )
  }
} 

export default function HeadingWrapper(props) {
  try {
    const { beta, notebook } = useFrontMatter();

    if (props.as === 'h1' && beta) {
      props = {
        as: "h1",
        id: props.id,
        children: BetaTagComponent(props.children)
      }
    }
  
    const Colab = require('@site/static/icons/colab-icon.svg').default;
    const Github = require('@site/static/icons/github-icon.svg').default;
  
    return (
      <>
        <Heading {...props} />
  
        {
          props.as === 'h1' && notebook && (
            <div id="exec" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
              <OpenInButtonLink caption="colab" icon={<Colab />} notebook={notebook} />
              <OpenInButtonLink caption="github codespaces" icon={<Github />} />
            </div>
          )
        }
      </>
    );
  } catch (error) {
    return (
      <>
        <Heading {...props} />
      </>
    )
  }
}