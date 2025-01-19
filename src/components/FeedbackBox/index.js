import React from'react'
import BrowserOnly from '@docusaurus/BrowserOnly';
import styles from './index.module.css'

import Translate, {translate} from '@docusaurus/Translate';

export default function FeedbackBox() {
    return (
      <BrowserOnly>
      {() => {
        const hostname = window.location.hostname;
        if (hostname.includes('cloud-uat') || hostname.includes('localhost')) {
          return (<div id="feedback-box" style={{padding: '1rem 0', fontSize: '0.8rem'}}>
            <div style={{ marginBottom: '1rem' }}>
            <Translate id="feedbackBox.feedback"
              description="Feedback box text">
                Was this page helpful?
            </Translate>
          </div>
            <div style={{ display: "flex", justifyContent: "start", gap: "1rem" }}>
              <div id="thumbsUp" style={{ position: 'relative', display: 'inline-block', verticalAlign: 'middle', fontWeight: 'bold', padding: '0.5rem 1rem', color: 'rgb(107, 114, 128)', fontWeight: 400, borderRadius: '10px', maxHeight: '2rem' }}>
                <i style={{ display: 'inline-block' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>thumb_up</span>
                </i>
                <i className="fadeThumbs" style={{ position: 'absolute', top: 'calc(50% - 0.5rem)', left: 'calc(50% - 0.5rem)', transition: '.5s', opacity: '0' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>thumb_up</span>
                </i>
              </div>           
              <div id="thumbsDown" style={{ position: 'relative', display: 'inline-block', verticalAlign: 'middle', fontWeight: 'bold', padding: '0.5rem 1rem', color: 'rgb(107, 114, 128)', fontWeight: 400, borderRadius: '10px', maxHeight: '2rem' }}>
                <i style={{ display: 'inline-block' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>thumb_down</span>
                </i>
                <i className="fadeThumbs" style={{ position: 'absolute', top: 'calc(50% - 0.5rem)', left: 'calc(50% - 0.5rem)', transition: '.5s', opacity: '0' }}>
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

