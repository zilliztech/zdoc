import React from'react'
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './index.module.css'


export default function FeedbackBox() {
    return (
      <BrowserOnly>
      {() => {
        const hostname = window.location.hostname;
        if (hostname.includes('zdoc') || hostname.includes('localhost')) {
          return (<div id="feedback-box" style={{padding: '1rem 0', fontSize: '0.8rem'}}>
            <div style={{ marginBottom: '1rem' }}>
          Was this page helpful?
          </div>
            <div style={{ display: "flex", justifyContent: "start", gap: "1rem" }}>
              <div id="thumbsUp" style={{ display: 'inline-block', verticalAlign: 'middle', fontWeight: 'bold', padding: '0.5rem 1rem', color: 'rgb(107, 114, 128)', fontWeight: 400, borderRadius: '10px', maxHeight: '2rem' }}>
                <i style={{ display: 'inline-block' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>thumb_up</span>
                </i>
              </div>
              <div id="thumbsDown" style={{ display: 'inline-block', verticalAlign: 'middle', fontWeight: 'bold', padding: '0.5rem 1rem', color: 'rgb(107, 114, 128)', fontWeight: 400, borderRadius: '10px', maxHeight: '2rem' }}>
                <i style={{ display: 'inline-block' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>thumb_down</span>
                </i>
              </div>
            </div>  
          </div>)
        } else {
          return <></>
        }}}
      </BrowserOnly>
    )
  }