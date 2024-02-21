import React from 'react';
import Desktop from '@theme-original/DocItem/TOC/Desktop';

export default function DesktopWrapper(props) {
  return (
    <>
      <div className="table-of-contents table-of-contents__left-border" style={{ paddingBottom: '0' }}>
        <span style={{ fontSize: '0.9rem', marginLeft: '8px', marginBottom: '0', fontWeight: '600' }}>On this page</span>
      </div>
      <Desktop {...props} />
    </>
  );
}
