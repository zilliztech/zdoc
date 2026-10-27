---
title: "Cloud Providers & Regions | Cloud"
slug: /cloud-providers-and-regions
sidebar_label: "Cloud Providers & Regions"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud is available on AWS, Google Cloud, and Microsoft Azure. Use this page to find a region and check whether it supports your deployment option and required features. | Cloud"
type: origin
token: CPLrwghdWiSvGBkdeEecGjgLnSb
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Cloud Providers & Regions

Zilliz Cloud is available on AWS, Google Cloud, and Microsoft Azure. Use this page to find a region and check whether it supports your deployment option and required features.

## Choose a cloud region\{#choose-a-cloud-region}

When choosing a region, consider the following:

- **Data residency:** Choose a region that meets your data residency and compliance requirements.

- **Application location:** Place your cluster close to the application services that access it to reduce network latency.

- **Availability:** Check that your deployment option and required features are available in the region.

- **Data transfer:** Consider the latency and costs of transferring data across regions or cloud providers.

## Supported regions\{#supported-regions}

The following tables list the supported regions for each cloud provider. Under Zilliz-Managed Cloud, availability is shown separately for always-on compute ([serving clusters](./manage-cluster)) and [on-demand compute](./on-demand-cluster). BYOC availability is listed separately. A check mark (✅) indicates availability in that region.

<Admonition type="info" title="Note">

If your required region is not listed, [submit a region request](https://zilliz.com/all-regions#region-request). 

To deploy Zilliz Cloud in your own cloud environment (BYOC), [contact sales](https://zilliz.com/contact-sales).

</Admonition>

### AWS\{#aws}

<table>
   <tr>
     <th rowspan="3"><p><strong>Continent</strong></p></th>
     <th rowspan="3"><p><strong>Region</strong></p></th>
     <th rowspan="3"><p><strong>Location</strong></p></th>
     <th colspan="3"><p><strong>Zilliz-Managed Cloud</strong></p></th>
     <th rowspan="3"><p><strong>BYOC</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p><strong>Always-on compute (serving clusters)</strong></p></td>
     <td rowspan="2"><p><strong>On-demand compute</strong></p></td>
   </tr>
   <tr>
     <td><p><strong>Free & Serverless</strong></p></td>
     <td><p><strong>Dedicated</strong></p></td>
   </tr>
   <tr>
     <td rowspan="4"><p>North America</p></td>
     <td><p>us-west-2</p></td>
     <td><p>Oregon, USA</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>us-east-1</p></td>
     <td><p>N. Virginia, USA</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>us-east-2</p></td>
     <td><p>Ohio, USA</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>ca-central-1</p></td>
     <td><p>Canada (Central)</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>Europe</p></td>
     <td><p>eu-central-1</p></td>
     <td><p>Frankfurt, Germany</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>eu-west-1</p></td>
     <td><p>Ireland</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>eu-west-2</p></td>
     <td><p>London, United Kingdom</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="5"><p>Asia</p></td>
     <td><p>ap-northeast-1</p></td>
     <td><p>Tokyo, Japan</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-1</p></td>
     <td><p>Singapore</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>ap-northeast-2</p></td>
     <td><p>Seoul, South Korea</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>ap-east-1</p></td>
     <td><p>Hong Kong SAR</p></td>
     <td><p>Not available</p></td>
     <td><p>Not available</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-7</p></td>
     <td><p>Thailand</p></td>
     <td><p>Not available</p></td>
     <td><p>Not available</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Oceania</p></td>
     <td><p>ap-southeast-2</p></td>
     <td><p>Sydney, Australia</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

### Google Cloud\{#google-cloud}

<table>
   <tr>
     <th rowspan="3"><p><strong>Continent</strong></p></th>
     <th rowspan="3"><p><strong>Region</strong></p></th>
     <th rowspan="3"><p><strong>Location</strong></p></th>
     <th colspan="3"><p><strong>Zilliz-Managed Cloud</strong></p></th>
     <th rowspan="3"><p><strong>BYOC</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p><strong>Always-on compute (serving clusters)</strong></p></td>
     <td rowspan="2"><p><strong>On-demand compute</strong></p></td>
   </tr>
   <tr>
     <td><p><strong>Free & Serverless</strong></p></td>
     <td><p><strong>Dedicated</strong></p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>North America</p></td>
     <td><p>us-west1</p></td>
     <td><p>Oregon, USA</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>us-east4</p></td>
     <td><p>Virginia, USA</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>us-central1</p></td>
     <td><p>Iowa, USA</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>Europe</p></td>
     <td><p>europe-west3</p></td>
     <td><p>Frankfurt, Germany</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>europe-west4</p></td>
     <td><p>Eemshaven, Netherlands</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>europe-west9</p></td>
     <td><p>Paris, France</p></td>
     <td><p>Not available</p></td>
     <td><p>Not available</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>Asia</p></td>
     <td><p>asia-southeast1</p></td>
     <td><p>Singapore</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>asia-northeast1</p></td>
     <td><p>Tokyo, Japan</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

### Microsoft Azure\{#microsoft-azure}

<table>
   <tr>
     <th rowspan="3"><p><strong>Continent</strong></p></th>
     <th rowspan="3"><p><strong>Region</strong></p></th>
     <th rowspan="3"><p><strong>Location</strong></p></th>
     <th colspan="3"><p><strong>Zilliz-Managed Cloud</strong></p></th>
     <th rowspan="3"><p><strong>BYOC</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p><strong>Always-on compute (serving clusters)</strong></p></td>
     <td rowspan="2"><p><strong>On-demand compute</strong></p></td>
   </tr>
   <tr>
     <td><p><strong>Free & Serverless</strong></p></td>
     <td><p><strong>Dedicated</strong></p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>North America</p></td>
     <td><p>East US</p></td>
     <td><p>Virginia, USA</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>East US 2</p></td>
     <td><p>Virginia, USA</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Central US</p></td>
     <td><p>Iowa, USA</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>Europe</p></td>
     <td><p>Germany West Central</p></td>
     <td><p>Frankfurt, Germany</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>North Europe</p></td>
     <td><p>Ireland</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>Asia</p></td>
     <td><p>Central India</p></td>
     <td><p>Pune, India</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
     <td><p>✅</p></td>
   </tr>
   <tr>
     <td><p>Japan East</p></td>
     <td><p>Tokyo and Saitama, Japan</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
     <td><p>Not available</p></td>
     <td><p>✅</p></td>
   </tr>
</table>

## Feature availability by region\{#feature-availability-by-region}

The following table shows feature availability across cloud providers and regions.

<table>
   <tr>
     <th><p><strong>Feature</strong></p></th>
     <th><p><strong>AWS</strong></p></th>
     <th><p><strong>Google Cloud</strong></p></th>
     <th><p><strong>Microsoft Azure</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./managed-volume">Managed Volume</a></p></td>
     <td><p>✅ All listed regions</p></td>
     <td><p>✅ All listed regions</p></td>
     <td><p>Not available</p></td>
   </tr>
   <tr>
     <td><p><a href="./external-volume">External Volume</a></p></td>
     <td><p>✅ All listed regions</p></td>
     <td><p>✅ All listed regions</p></td>
     <td><p>✅ All listed regions</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-external-collections-console">External collection</a></p></td>
     <td><p>✅ All listed regions</p></td>
     <td><p>✅ All listed regions</p></td>
     <td><p>✅ Available on <a href="https://support.zilliz.com/">request</a> in all listed regions.</p></td>
   </tr>
   <tr>
     <td><p><a href="./global-cluster-explained">Global cluster</a></p></td>
     <td><p>✅ All listed regions</p></td>
     <td><p>Available on <a href="https://support.zilliz.com/">request</a> in:</p><ul><li><p><code>us-central1</code></p></li><li><p><code>us-east4</code></p></li></ul></td>
     <td><p>Not available</p></td>
   </tr>
   <tr>
     <td><p><a href="./backup-to-other-regions">Cross-region backup</a></p></td>
     <td><p>✅ All listed regions</p></td>
     <td><p>✅ All listed regions</p></td>
     <td><p>Not available</p></td>
   </tr>
   <tr>
     <td><p><a href="./cmek">CMEK</a></p></td>
     <td><p>✅ All listed regions</p></td>
     <td><p>✅ All listed regions</p></td>
     <td><p>Not available</p></td>
   </tr>
   <tr>
     <td><p><a href="/docs/spark-batch-jobs">Spark Batch Jobs</a></p></td>
     <td><p>✅ Available on <a href="https://support.zilliz.com/">request</a> in all listed regions.</p></td>
     <td><p>Not available</p></td>
     <td><p>Not available</p></td>
   </tr>
   <tr>
     <td><p><a href="/docs/zero-downtime-migration">Zero downtime migration</a></p></td>
     <td><p>✅ All listed regions</p></td>
     <td><p>✅ All listed regions</p></td>
     <td><p>✅ All listed regions</p></td>
   </tr>
</table>

<Admonition type="info" title="Note">

Regional availability does not guarantee availability for every deployment option or project plan. See each feature’s documentation for configuration and version requirements, and [Deployment and Plan Comparison](./select-zilliz-cloud-service-plans) for plan availability.

</Admonition>

