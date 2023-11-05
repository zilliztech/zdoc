import React from 'react';
import Link from '@docusaurus/Link'
import Heading from '@theme-original/Heading';
import useFrontMatter from '@theme/useFrontMatter';

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

const OpenInButtonComponent = (props) => (
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
        <span style={{ display: 'inline-block'}}>OPEN IN {props.caption.toUpperCase()}</span>
        {props.icon}
      </div>
  </div>
)

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
              <Link to={"https://colab.research.google.com/github/zilliztech/zdoc-demos/blob/master/python/" + notebook} style={{ color: "#000000"}}>
                <OpenInButtonComponent caption="colab" icon={<Colab />} />
              </Link>
              <Link to="https://codespaces.new/zilliztech/zdoc-demos" style={{ color: "#000000"}}>
                <OpenInButtonComponent caption="github codespaces" icon={<Github />} />
              </Link>
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
