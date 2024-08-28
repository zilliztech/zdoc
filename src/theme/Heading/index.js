import React, { useState } from 'react';
import Link from '@docusaurus/Link'
import Heading from '@theme-original/Heading';
import {useDoc} from '@docusaurus/theme-common/internal';
import styles from './styles.module.css';

const BetaTagComponent = (children, tag) => (
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
                backgroundColor: tag === 'PUBLIC' ? '#175fff' : '#7F47FF',
              }}>
              { `${tag.toUpperCase().slice(0,1)}${tag.toUpperCase().slice(1).toLowerCase()} Preview` }
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
  const colab_prefix = "https://colab.research.google.com/github/zilliztech/zdoc-demos/blob/master/python/";
  const github_prefix = "https://github.com/codespaces/new?template_repository=zilliztech/zdoc-demos";
  const prefix = caption === 'colab' ? colab_prefix : github_prefix;

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
    return ( notebook &&
      <Link to={prefix + notebook} style={{ color: "#000000"}}>
        <OpenInButtonComponent caption={caption} icon={icon} />
      </Link> || 
      <Link to={prefix} style={{ color: "#000000"}}>
        <OpenInButtonComponent caption={caption} icon={icon} />
      </Link>
    )
  }
} 

export default function HeadingWrapper(props) {
  try {
    const { frontMatter } = useDoc();
    const { beta, notebook, tags } = frontMatter;

    if (props.as === 'h1' && beta) {
      props = {
        as: "h1",
        id: props.id,
        children: BetaTagComponent(props.children, beta)
      }
    }
  
    const Colab = require('@site/static/icons/colab-icon.svg').default;
    const Github = require('@site/static/icons/github-icon.svg').default;
  
    return (
      <>
        { tags.length > 0 && <span style={{ fontWeight: '400', color: 'rgb(18, 17, 66)'  }}>{tags[0]}</span> }
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