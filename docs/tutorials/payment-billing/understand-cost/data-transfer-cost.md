---
title: "Data Transfer Cost | Cloud"
slug: /data-transfer-cost
sidebar_label: "Data Transfer"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Data transfer can be traffic coming into Zilliz Cloud, leaving Zilliz Cloud out into the internet, or in between two resources within Zilliz Cloud. Data transfer costs in Zilliz Cloud are billed based on the amount of data transferred. | Cloud"
type: origin
token: BClgwKlHaiushBkPPssclTkYnef
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - data transfer
  - cost
  - billing
  - Image Search
  - LLMs
  - Machine Learning
  - RAG

---

import Admonition from '@theme/Admonition';


# Data Transfer Cost

Data transfer can be traffic coming into Zilliz Cloud, leaving Zilliz Cloud out into the internet, or in between two resources within Zilliz Cloud. Data transfer costs in Zilliz Cloud are billed based on the amount of data transferred. 

<Admonition type="info" icon="📘" title="Notes">

<p>Each organization receives a $10 monthly data transfer discount, covering the first 100 GB.</p>

</Admonition>

The following table compares the different data transfer types.

<table>
   <tr>
     <th><p><strong>Data Transfer Type</strong></p></th>
     <th><p><strong>Description</strong></p></th>
     <th><p><strong>Common Scenarios</strong></p></th>
     <th><p><strong>Pricing</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Internet egress</strong></p></td>
     <td><p>The transfer of data from Zilliz Cloud to destinations over the public internet, such as external networks, client applications, or third-party services outside the cloud provider’s private network.</p></td>
     <td><p>Returning search or query results to a client app hosted locally or outside the cloud provider.</p></td>
     <td><p>The most expensive and the cost is determined by the source destination.</p><p>For detailed rates, see <a href="https://zilliz.com/pricing/pricing-guide">Zilliz Cloud Pricing Guide</a>.</p></td>
   </tr>
   <tr>
     <td><p><strong>Cross-region</strong></p></td>
     <td><p>The movement of data between different regions within the same cloud provider’s network, which may incur additional latency and costs compared to intra-region transfer.</p></td>
     <td><ul><li><p>Cross region backup</p></li><li><p>Data migration between Zilliz Cloud clusters deployed in different regions.</p></li></ul></td>
     <td><ul><li><p>For AWS, the cost is determined by the source continent.</p></li><li><p>For Azure and Google Cloud, the cost is determined by both the source and destination continents.</p><p>For detailed rates, see <a href="https://zilliz.com/pricing/pricing-guide">Zilliz Cloud Pricing Guide</a>.</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>Intra-region</strong></p></td>
     <td><p>The transfer of data between within the same region of a cloud provider, typically incurring lower latency and cost than cross-region transfers.</p></td>
     <td><ul><li><p>Forwarding audit logs to intra-region cloud object storage</p></li><li><p>Data migration between Zilliz Cloud clusters deployed in the same region.</p></li></ul></td>
     <td><p>Free</p></td>
   </tr>
</table>

## Sources of data transfer cost\{#sources-of-data-transfer-cost}

You will be billed for data transfer in the following scenarios:

- Operations like [search/query](./search-query-get)

- Forwarding [audit logs](./audit-logs) to cloud object storage

- [Zero downtime migration](./zero-downtime-migration) data sync

- [Offline migration](./offline-migration)

- [Cross-region backup](/docs/backup-to-other-regions)

<Admonition type="info" icon="📘" title="Note">

<p>If the data transfer occurs within the same cloud region, the cost may be $0.</p>
<p>If you use a private endpoint to conduct operations like search or query, no data transfer cost will incur.</p>

</Admonition>

## Cost calculation\{#cost-calculation}

```plaintext
Data Transfer Cost = Data Transfer Unit Price × Transferred Data Size
```

- **Data Transfer Unit Price**: Determined by cluster cloud provider and region, data transfer type (public internet, cross-region, or intra-region). For detailed rates, see [Zilliz Cloud Pricing Guide](https://zilliz.com/pricing/pricing-guide).

- **Transferred Data Size**: Measured in GB and calculated based on the size of the data sent over the network.

## Examples\{#examples}

The following are some examples to help you understand how storage costs are calculated.

### Example 1: Public internet egress\{#example-1-public-internet-egress}

Suppose your cluster is deployed in AWS us-east-1 (Virginia) and you return search results to clients via the public internet:

- **Transferred Data Size**: 500 GB over one month

- **Transfer Type**: Public Internet Egress

- **Source Continent**: North America

- **Unit Price**: $0.09/GB (based on public internet egress rate from North America)

The data transfer cost is `$0.09 × 500 = $45.00`.

### Example 2: Cross-region transfer\{#example-2-cross-region-transfer}

Suppose your cluster is deployed in GCP us-west1 (Oregon) and you need to back up this cluster to 2 different regions, GCP us-central1 (Iowa) and GCP europe-west3 (Frankfurt):

- **Backup File Size**: 20 GB

- **Transfer Type**: Cross-region Transfer

- **Source Continent**: North America

- **Destination Continent**: North America & Europe

- **Unit Price**: 

    - Data transfer from North America (GCP us-west1) to North America (GCP us-central1) is billed at the rate of **&#36;0.02/GB**.

    - Data transfer from North America (GCP us-west1) to Europ (GCP europe-west3) is billed at the rate of **&#36;0.05/GB**.

The data transfer cost is `$0.02 × 20 + $0.05 x 20 = $1.40`.

### Example 3: Intra-region transfer\{#example-3-intra-region-transfer}

Suppose you have enabled audit logging for your cluster deployed in AWS us-east-1 (Virginia) and you need to forward the audit logs of this cluster to an AWS S3 bucket created in the same cloud region. The data transfer cost in this case will be **&#36;0** because intra-region data transfer is free of charge.

