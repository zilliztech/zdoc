import React from 'react';
import {ThemeClassNames} from '@docusaurus/theme-common';
import {useDoc} from '@docusaurus/theme-common/internal';
import TOC from '@theme/TOC';
export default function DocItemTOCDesktop() {
  const {toc, frontMatter} = useDoc();
  toc.splice(0,0, {value: 'ON THIS PAGE', id: '', level: 2})
  return (
    <TOC
      toc={toc}
      minHeadingLevel={frontMatter.toc_min_heading_level}
      maxHeadingLevel={frontMatter.toc_max_heading_level}
      className={ThemeClassNames.docs.docTocDesktop}
    />
  );
}
