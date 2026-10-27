import React from 'react';
import {useCloudDataModel} from '../../cloud-data/useCloudData';
import {renderFragmentToJsx} from '../../cloud-data/renderReact';

// One availability matrix. Registered globally in MDXComponents:
//
//   <CloudFeatures matrix="compute-types" />
//   <CloudFeatures matrix="deployment-options" />
//   <CloudFeatures matrix="features" />
//
// `compute-types` and `deployment-options` are derived from the cloud-regions
// endpoint; `features` comes from cloud-features.
export default function CloudFeatures({matrix}: {matrix: 'compute-types' | 'deployment-options' | 'features'}) {
  const model = useCloudDataModel();
  return renderFragmentToJsx(model, {section: matrix});
}
