import React from 'react';
import Layout from '@theme/Layout';
import {PageMetadata} from '@docusaurus/theme-common';
import NotFoundContent from '@theme/NotFound/Content';
import {useDocsUiText} from '../../i18n/uiText';

export default function NotFound(): React.ReactElement {
  const text = useDocsUiText();

  // Topbar/footer removal lives in NotFound/Content: a miss under /docs never
  // reaches this wrapper (the docs plugin renders the Content itself), so the
  // body class has to be set from the component both paths share.

  return (
    <>
      <PageMetadata title={text.notFound.pageTitle} />
      <Layout noFooter>
        <NotFoundContent />
      </Layout>
    </>
  );
}
