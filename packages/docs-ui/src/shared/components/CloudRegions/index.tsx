import React from 'react';
import {useCloudDataModel} from '../../cloud-data/useCloudData';
import {renderFragmentToJsx} from '../../cloud-data/renderReact';

// One cloud provider's live region table. Registered globally in
// MDXComponents; content pages carry a standalone marker line:
//
//   <CloudRegions provider="aws" />
//
// Provider keys are the stable vocabulary keys (aws | gcp | azure on the
// English site, alibaba | tencent | amazon-cn on the Chinese site), not CMS
// display names.
export default function CloudRegions({provider}: {provider: string}) {
  const model = useCloudDataModel();
  return renderFragmentToJsx(model, {section: 'regions', provider});
}
