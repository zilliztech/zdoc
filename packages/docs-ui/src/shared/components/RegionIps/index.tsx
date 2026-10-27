import React from 'react';
import {useCloudDataModel} from '../../cloud-data/useCloudData';
import {renderFragmentToJsx} from '../../cloud-data/renderReact';

// IP address tables fed by the cloud-regions `ip` field. Registered globally
// in MDXComponents:
//
//   <RegionIps scope="service" />      — the service IP row(s) (site-config
//                                        constant until CMS adds is_service_ip)
//   <RegionIps provider="aws" />       — one provider's per-region IP table
export default function RegionIps({scope, provider}: {scope?: 'service'; provider?: string}) {
  const model = useCloudDataModel();
  if (scope === 'service') {
    return renderFragmentToJsx(model, {section: 'service-ips'});
  }
  if (!provider) {
    throw new Error('[cloud-data] <RegionIps /> requires scope="service" or a provider attribute');
  }
  return renderFragmentToJsx(model, {section: 'region-ips', provider});
}
