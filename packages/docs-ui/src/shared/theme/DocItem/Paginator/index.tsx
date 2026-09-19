import React, {type ReactNode} from 'react';
import DocPaginator from '@theme/DocPaginator';
import ReleaseChannelPaginator from '../../../components/ReleaseChannelPaginator';

/** DocItem/Paginator override: the stock paginator wrapped in the shared
 * release-channel gate, so a CURRENT deployment never links a hidden NEXT page. */
export default function DocItemPaginator(): ReactNode {
  return <ReleaseChannelPaginator Paginator={DocPaginator} className="docusaurus-mt-lg" />;
}
