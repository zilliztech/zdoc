import React from 'react';
import Layout from '@theme/Layout';
import {PageMetadata} from '@docusaurus/theme-common';
import NotFoundContent from '@theme/NotFound/Content';
import {useDocsUiText} from '../../i18n/uiText';

export default function NotFound(): React.ReactElement {
  const text = useDocsUiText();
  return (
    <>
      <PageMetadata title={text.notFound.pageTitle} />
      <Layout>
        <NotFoundContent />
      </Layout>
    </>
  );
}
