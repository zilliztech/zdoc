---
slug: /cloud-providers-and-regions
beta: FALSE
notebook: FALSE
type: origin
token: CPLrwghdWiSvGBkdeEecGjgLnSb
sidebar_position: 7

---

import Admonition from '@theme/Admonition';


# Cloud Providers & Regions

Zilliz Cloud is a cloud-based service that offers vector database clusters on public clouds. With our service, you can easily create and manage your own vector database clusters on the public cloud platform of your choice.

Zilliz Cloud provides clusters across various regions on Amazon Web Services (AWS), Google Cloud Platform (GCP), and Microsoft Azure. To request a new region, feel free to [contact us](https://zilliz.com/cloud-region-request?).

## AWS{#aws}

Zilliz Cloud supports deploying dedicated clusters on AWS.

<table>
   <tr>
     <th><strong>AWS Region</strong></th>
     <th><strong>Location</strong></th>
     <th><strong>Free Cluster</strong></th>
     <th><strong>Serverless Cluster</strong></th>
     <th><strong>Dedicated Cluster (Standard)</strong></th>
     <th><strong>Dedicated Cluster (Enterprise)</strong></th>
   </tr>
   <tr>
     <td>us-east-1</td>
     <td>N. Virginia, USA</td>
     <td>No</td>
     <td>No</td>
     <td>Yes</td>
     <td>Yes</td>
   </tr>
   <tr>
     <td>us-east-2</td>
     <td>Ohio, USA</td>
     <td>No</td>
     <td>No</td>
     <td>Yes</td>
     <td>Yes</td>
   </tr>
   <tr>
     <td>us-west-2</td>
     <td>Oregon, USA</td>
     <td>No</td>
     <td>No</td>
     <td>Yes</td>
     <td>Yes</td>
   </tr>
   <tr>
     <td>ap-southeast-2</td>
     <td>Singapore</td>
     <td>No</td>
     <td>No</td>
     <td>Yes</td>
     <td>Yes</td>
   </tr>
   <tr>
     <td>eu-central-1</td>
     <td>Frankfurt</td>
     <td>No</td>
     <td>No</td>
     <td>Yes</td>
     <td>Yes</td>
   </tr>
</table>

For more information on cluster types, see [Select Cluster Plans](./select-zilliz-cloud-service-plans).

## GCP{#gcp}

Free, serverless, and dedicated clusters can be deployed on GCP.

<table>
   <tr>
     <th><strong>GCP Region</strong></th>
     <th><strong>Location</strong></th>
     <th><strong>Free Cluster</strong></th>
     <th><strong>Serverless Cluster</strong></th>
     <th><strong>Dedicated Cluster (Standard)</strong></th>
     <th><strong>Dedicated Cluster (Enterprise)</strong></th>
   </tr>
   <tr>
     <td>us-west1</td>
     <td>Oregon, USA</td>
     <td>Yes</td>
     <td>Yes</td>
     <td>Yes</td>
     <td>Yes</td>
   </tr>
   <tr>
     <td>us-east4</td>
     <td>Virginia, USA</td>
     <td>No</td>
     <td>No</td>
     <td>Yes</td>
     <td>Yes</td>
   </tr>
   <tr>
     <td>europe-west3</td>
     <td>Frankfurt, Germany</td>
     <td>No</td>
     <td>No</td>
     <td>Yes</td>
     <td>Yes</td>
   </tr>
   <tr>
     <td>asia-southeast1</td>
     <td>Singapore</td>
     <td>No</td>
     <td>No</td>
     <td>Yes</td>
     <td>Yes</td>
   </tr>
</table>

For more information on cluster types, see [Select Cluster Plans](./select-zilliz-cloud-service-plans).

## Microsoft Azure{#microsoft-azure}

Zilliz Cloud supports deploying dedicated clusters on Microsoft Azure.

<table>
   <tr>
     <th><strong>Azure Region</strong></th>
     <th><strong>Location</strong></th>
     <th><strong>Free Cluster</strong></th>
     <th><strong>Serverless Cluster</strong></th>
     <th><strong>Dedicated Cluster (Standard)</strong></th>
     <th><strong>Dedicated Cluster (Enterprise)</strong></th>
   </tr>
   <tr>
     <td>East US</td>
     <td>Virginia, USA</td>
     <td>No</td>
     <td>No</td>
     <td>Yes</td>
     <td>Yes</td>
   </tr>
   <tr>
     <td>Germany West Central</td>
     <td>Frankfurt, Germany</td>
     <td>No</td>
     <td>No</td>
     <td>Yes</td>
     <td>Yes</td>
   </tr>
</table>

For more information on cluster plans, see [Select the Right Cluster Plan](./select-zilliz-cloud-service-plans).

Currently, all clusters running on Microsoft Azure support Beta version features, such as the [cosine metric type](./search-metrics-explained#cosine-similarity), [range search](./single-vector-search#range-search), [advanced expressions](./get-and-scalar-query#use-advanced-operators), and [upsert operations](./insert-update-delete#upsert-entities).

## Related topics{#related-topics}

- [Select the Right Cluster Plan](./select-zilliz-cloud-service-plans)

- [Select the Right CU](./cu-types-explained)

- [Pricing Calculator](./pricing-calculator)

