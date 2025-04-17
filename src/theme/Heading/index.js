import React, { useState } from 'react';
import Link from '@docusaurus/Link'
import Heading from '@theme-original/Heading';
import { useDoc } from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

const BetaTag = (tag) => {
  var tag_caption = "";
  var tag_color = "";

  switch (true) {
    case tag === 'PUBLIC':
      tag_caption = "Public Preview";
      tag_color = "#175fff";
      break;
    case tag === 'PRIVATE':
      tag_caption = "Private Preview";
      tag_color = "#7F47FF";
      break;
    case tag === 'CONTACT SALES':
      tag_caption = "Contact Sales to Enable This Feature";
      tag_color = "#FF7F47";
      break;
    case tag === 'BYOC':
      tag_caption = "Contact Sales to Enable BYOC";
      tag_color = "#FF7F47";
      break;
    case tag === 'NEAR DEPRECATE':
      tag_caption = "About to Deprecate";
      tag_color = "#FF7F47";
      break;
    case tag?.startsWith('Milvus'):
      tag_caption = 'Compatible with ' + tag;
      tag_color = "rgb(0, 179, 255)"
      break;
    default:
      tag_caption = "";
      tag_color = "";
      break;
  }

  return {
    tag_caption,
    tag_color
  }
}

const BetaTagComponent = (children, tag, linkable, destination_url) => {

  const { tag_caption, tag_color } = BetaTag(tag);

  return (
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
          { !linkable && (<span
              style={{
                fontSize: '1rem',
                color: '#ffffff',
                fontWeight: 'normal',
                marginLeft: '0.5rem',
                marginBottom: '0.5rem',
                padding: '2px 12px 2px 12px',
                borderRadius: '100px',
                backgroundColor: tag_color,
              }}>
              { tag_caption }
          </span> ) }
          { linkable && (
            <Link to={destination_url} style={{ textDecoration: 'none' }}>
              <span
                  style={{
                    fontSize: '1rem',
                    color: '#ffffff',
                    fontWeight: 'normal',
                    marginLeft: '0.5rem',
                    marginBottom: '0.5rem',
                    padding: '2px 12px 2px 12px',
                    borderRadius: '100px',
                    backgroundColor: tag_color,
                  }}>
                  { tag_caption }
              </span>
            </Link> )}       
        </div>    

    </span>
  );
}

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

function Banner({ message, backgroundColor = '#f0f0f0', textColor = '#333', onClose }) {
  const [isVisible, setIsVisible] = React.useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose(); // TODO: Call the onClose callback if provided 
    }
  };

  if (!isVisible) {
    return null; // Don't render the banner if it's closed
  }

  return (
    <div
      className={styles.banner}
      style={{ backgroundColor, color: textColor }}
    >
      <div className={styles.bannerContent}>
        {message}
        {onClose && ( // Conditionally render the close button
          <button className={styles.bannerCloseButton} onClick={handleClose}>
            &times; {/* Use an "X" symbol */}
          </button>
        )}
      </div>
    </div>
  );
}

export default function HeadingWrapper(props) {
  try {
    const { frontMatter, metadata } = useDoc();
    const { beta, notebook, tags, slug } = frontMatter;
    var tag = metadata.title.endsWith('BYOC') ? 'BYOC' : beta;
    const { siteConfig } = useDocusaurusContext();

    if (props.as === 'h1' && tag) {
      const linkable = tag === 'CONTACT SALES' || tag === 'BYOC'
      const destination_url = 'https://zilliz.com/contact-sales'

      props = {
        as: "h1",
        id: props.id,
        children: tag ? BetaTagComponent(props.children, tag, linkable, destination_url) : props.children
      }
    }

    if (props.as.match(/h[2-6]/) && props.children.includes('|')) {
      const [title, tag] = props.children.split('|') 
      const linkable = tag?.trim() === 'CONTACT SALES'
      const destination_url = 'https://zilliz.com/contact-sales'

      props = {
        as: props.as,
        id: props.id,
        children: tag ? BetaTagComponent(title.trim(), tag?.trim(), linkable, destination_url) : title.trim()
      }
    }
  
    const Colab = require('@site/static/icons/colab-icon.svg').default;
    const Github = require('@site/static/icons/github-icon.svg').default;
  
    return (
      <>
        {
          props.as === 'h1' && siteConfig.baseUrl === '/ja-JP/' && slug !== '/home' && (
            <Banner 
              message="[説明] このページは機械翻訳された日本語版です。内容に誤りがございましたら、報告していただけると助かります。"
              backgroundColor="rgb(255, 248, 230)"/>
          )
        }

        { tags?.length > 0 && <span style={{ fontWeight: '400', color: 'rgb(18, 17, 66)'  }}>{tags[0]}</span> }
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
    // console.error(error);
    return (
      <>
        <Heading {...props} />
      </>
    )
  }
}