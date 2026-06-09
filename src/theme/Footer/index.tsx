import React, {type ReactNode} from 'react';
import {useLocation} from '@docusaurus/router';
import Footer from '@theme-original/Footer';

function isDocsPath(pathname: string): boolean {
  return pathname.startsWith('/docs') || pathname.startsWith('/reference');
}

export default function FooterWrapper(): ReactNode {
  const {pathname} = useLocation();

  if (isDocsPath(pathname)) {
    return null;
  }

  return <Footer />;
}
