---
title: "Cloud Providers & Regions | Cloud"
slug: /cloud-providers-and-regions
sidebar_label: "Cloud Providers & Regions"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud supports multiple cloud providers and regions across AWS, Google Cloud, and Microsoft Azure. | Cloud"
type: origin
token: CPLrwghdWiSvGBkdeEecGjgLnSb
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Cloud Providers & Regions

Zilliz Cloud supports multiple cloud providers and regions across AWS, Google Cloud, and Microsoft Azure. 

Region support can vary by workload type, deployment option, and feature. Use this page to choose a region before [creating projects](./manage-projects#create-a-project).

## How to choose a cloud region\{#how-to-choose-a-cloud-region}

- Choose a region close to your application or users.

- Consider data residency and compliance requirements.

- Consider latency and cross-region data transfer implications.

- Check whether your desired feature is supported in the target region.

- [Contact us](http://zilliz.com/contact-sales) if the required region or feature is unavailable.

## Supported regions\{#supported-regions}

### AWS\{#aws}

<table>
   <tr>
     <th><p><strong>Continent</strong></p></th>
     <th><p><strong>Region</strong></p></th>
     <th><p><strong>Location</strong></p></th>
   </tr>
   <tr>
     <td rowspan="4"><p>North America</p></td>
     <td><p>us-west-2</p></td>
     <td><p>Oregon, USA</p></td>
   </tr>
   <tr>
     <td><p>us-east-1</p></td>
     <td><p>N. Virginia, USA</p></td>
   </tr>
   <tr>
     <td><p>us-east-2</p></td>
     <td><p>Ohio, USA</p></td>
   </tr>
   <tr>
     <td><p>ca-central-1</p></td>
     <td><p>Canada (Central)</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>Europe</p></td>
     <td><p>eu-central-1</p></td>
     <td><p>Frankfurt, Germany</p></td>
   </tr>
   <tr>
     <td><p>eu-west-1</p></td>
     <td><p>Ireland</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>Asia</p></td>
     <td><p>ap-northeast-1</p></td>
     <td><p>Tokyo, Japan</p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-1</p></td>
     <td><p>Singapore</p></td>
   </tr>
   <tr>
     <td><p>ap-northeast-2</p></td>
     <td><p>Seoul, Korea</p></td>
   </tr>
   <tr>
     <td><p>Oceania</p></td>
     <td><p>ap-southeast-2</p></td>
     <td><p>Sydney, Australia</p></td>
   </tr>
</table>

### Google Cloud\{#google-cloud}

<table>
   <tr>
     <th><p><strong>Continent</strong></p></th>
     <th><p><strong>Region</strong></p></th>
     <th><p><strong>Location</strong></p></th>
   </tr>
   <tr>
     <td rowspan="3"><p>North America</p></td>
     <td><p>us-west1</p></td>
     <td><p>Oregon, USA</p></td>
   </tr>
   <tr>
     <td><p>us-east4</p></td>
     <td><p>Virginia, USA</p></td>
   </tr>
   <tr>
     <td><p>us-central1</p></td>
     <td><p>Iowa, USA</p></td>
   </tr>
   <tr>
     <td><p>Europe</p></td>
     <td><p>europe-west3</p></td>
     <td><p>Frankfurt, Germany</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>Asia</p></td>
     <td><p>asia-southeast1</p></td>
     <td><p>Singapore</p></td>
   </tr>
   <tr>
     <td><p>asia-northeast1</p></td>
     <td><p>Tokyo, Japan</p></td>
   </tr>
</table>

### Azure\{#azure}

<table>
   <tr>
     <th><p><strong>Continent</strong></p></th>
     <th><p><strong>Region</strong></p></th>
     <th><p><strong>Location</strong></p></th>
   </tr>
   <tr>
     <td rowspan="3"><p>North America</p></td>
     <td><p>East US</p></td>
     <td><p>Virginia, USA</p></td>
   </tr>
   <tr>
     <td><p>East US 2</p></td>
     <td><p>Virginia, USA</p></td>
   </tr>
   <tr>
     <td><p>Central US</p></td>
     <td><p>Iowa, USA</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>Europe</p></td>
     <td><p>Germany West Central</p></td>
     <td><p>Frankfurt, Germany</p></td>
   </tr>
   <tr>
     <td><p>North Europe</p></td>
     <td><p>Ireland</p></td>
   </tr>
   <tr>
     <td><p>Asia</p></td>
     <td><p>Central India</p></td>
     <td><p>Pune, India</p></td>
   </tr>
</table>

## Feature support by cloud region\{#feature-support-by-cloud-region}

### Compute type support\{#compute-type-support}

<table>
   <tr>
     <th><p><strong>Compute type</strong></p></th>
     <th><p><strong>AWS</strong></p></th>
     <th><p><strong>Google Cloud</strong></p></th>
     <th><p><strong>Microsoft Azure</strong></p></th>
   </tr>
   <tr>
     <td><p>Always-on compute (<a href="./manage-cluster">Serving cluster</a>)</p></td>
     <td><p>✅ All regions</p></td>
     <td><p>✅ All regions</p></td>
     <td><p>✅ All regions</p></td>
   </tr>
   <tr>
     <td><p><a href="./on-demand-cluster">On-demand compute</a></p></td>
     <td><p>✅ All regions</p></td>
     <td><p>❌</p></td>
     <td><p>ℹ️  Part of the regions:</p><ul><li>East US</li></ul></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Note">

[Contact us](http://zilliz.com/contact-sales) if you need on-demand compute in a region that is not listed.

</Admonition>

### Deployment option support\{#deployment-option-support}

<table>
   <tr>
     <th><p><strong>Deployment option</strong></p></th>
     <th><p><strong>AWS</strong></p></th>
     <th><p><strong>Google Cloud</strong></p></th>
     <th><p><strong>Microsoft Azure</strong></p></th>
   </tr>
   <tr>
     <td><p>SaaS (Free & Serverless)</p></td>
     <td><p>ℹ️  Part of the regions:</p><ul><li><p>eu-central-1</p></li><li><p>eu-west-1</p></li></ul></td>
     <td><p>ℹ️   Part of the regions:</p><ul><li>us-west1</li></ul></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>SaaS (Dedicated)</p></td>
     <td><p>✅ All regions</p></td>
     <td><p>✅ All regions</p></td>
     <td><p>✅ All regions</p></td>
   </tr>
   <tr>
     <td><p>BYOC</p></td>
     <td><p>✅ All regions</p><p>Plus ap-east-1 (Hong Kong SAR)</p></td>
     <td><p>✅ All regions</p></td>
     <td><p>✅ All regions</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Note">

[Contact us](http://zilliz.com/contact-sales) if you need BYOC deployment.

</Admonition>

### Feature support\{#feature-support}

<table>
   <tr>
     <th><p><strong>Feature</strong></p></th>
     <th><p><strong>AWS</strong></p></th>
     <th><p><strong>Google Cloud</strong></p></th>
     <th><p><strong>Microsoft Azure</strong></p></th>
   </tr>
   <tr>
     <td><p><a href="./managed-volume">Volume</a></p></td>
     <td><p>✅ All regions</p></td>
     <td><p>✅ All regions</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><a href="./manage-external-collections-console">External collection</a></p></td>
     <td><p>✅ All regions</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><a href="./global-cluster-explained">Global cluster</a></p></td>
     <td><p>✅ All regions</p></td>
     <td><p>ℹ️   Part of the regions:</p><ul><li><p>gcp-us-central1</p></li><li><p>gcp-us-east4</p><Admonition type="info" icon="📘" title="Note"> [Contact us](http://support.zilliz.com) if you need to use this feature in Google Cloud regions. </Admonition></li></ul></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><a href="./backup-to-other-regions">Cross-region backup </a></p></td>
     <td><p>✅ All regions</p></td>
     <td><p>✅ All regions</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p><a href="./cmek">CMEK</a></p></td>
     <td><p>✅ All regions</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Note">

Some features depend on additional configuration, project plan, or deployment mode. For details, see [Deployment and Plan Comparison](./select-zilliz-cloud-service-plans).

</Admonition>

