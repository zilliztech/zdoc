import React from 'react';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/theme-common/internal';
import TOC from '@theme/TOC';

function EditThisPage() {

  const {metadata} = useDoc();

  return ( 
    <div id="edit-this-page" style={{marginTop: '3rem', marginBottom: '3rem', fontSize: '0.8rem'}}>
      <div style={{ marginBottom: '0.25rem' }}>
        <i style={{ display: 'inline-block', minHeight: '2rem', marginRight: '0.5rem' }}>
          <span className="material-symbols-outlined">edit</span>
        </i>
        <span style={{ display: 'inline-block', minHeight: '2rem', verticalAlign: 'top', fontWeight: 'bold' }}>
          <a href="#">EDIT THIS PAGE</a>
        </span>
      </div> 
      <div style={{ marginBottom: '0.25rem' }}>
        <i style={{ display: 'inline-block', minHeight: '2rem', marginRight: '0.5rem' }}>
          <span className="material-symbols-outlined">bug_report</span>
        </i>
        <span style={{ display: 'inline-block', minHeight: '2rem', verticalAlign: 'top', fontWeight: 'bold' }}>
          <a href="#">REPORT A BUG</a>
        </span>
      </div>   
      <div style={{ marginBottom: '0.25rem' }}>
        <i style={{ display: 'inline-block', minHeight: '2rem', marginRight: '0.5rem' }}>
          <span className="material-symbols-outlined">lightbulb</span>
        </i>
        <span style={{ display: 'inline-block', minHeight: '2rem', verticalAlign: 'top', fontWeight: 'bold' }}>
          <a href="#">REQUEST A CHANGE</a>
        </span>
      </div>   
    </div>
  )
}

export default function DocItemTOCDesktop() {
  const {toc, frontMatter} = useDoc();
  if (toc[0].value !== 'ON THIS PAGE') {
    toc.splice(0,0, {value: 'ON THIS PAGE', id: '', level: 2})
  }

  return (
    <>
      <EditThisPage />
      <TOC
        toc={toc}
        minHeadingLevel={frontMatter.toc_min_heading_level}
        maxHeadingLevel={frontMatter.toc_max_heading_level}
        className={ThemeClassNames.docs.docTocDesktop}
      />
    </>

  );
}
