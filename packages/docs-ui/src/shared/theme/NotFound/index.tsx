import React from 'react';
import Layout from '@theme/Layout';
import {PageMetadata} from '@docusaurus/theme-common';
import NotFoundContent from '@theme/NotFound/Content';

export default function NotFound(): React.ReactElement {
  return (
    <>
      <PageMetadata title="Page Not Found" />
      <Layout>
        <NotFoundContent />
      </Layout>
    </>
  );
}
