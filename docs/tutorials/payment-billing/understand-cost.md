---
title: "Understand Cost | Cloud"
slug: /understand-cost
sidebar_label: "Understand Cost"
beta: FALSE
notebook: FALSE
description: "This page offers guidelines for estimating the costs of using Zilliz Cloud. To obtain a precise cost estimate, we encourage you to utilize the free trial. | Cloud"
type: origin
token: Pt17wz7kZiNRiHkpzo9c0POqnmg
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cost
  - understand
  - Vector retrieval
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus

---

import Admonition from '@theme/Admonition';


# Understand Cost

This page offers guidelines for estimating the costs of using Zilliz Cloud. To obtain a precise cost estimate, we encourage you to utilize the [free trial](./free-trials). 

For a detailed breakdown and interpretation of your invoices, please refer to  [Invoices](./view-invoice).

Zilliz Cloud charges on the organization level. If you have multiple clusters in an organization, you will be billed for each Dedicated and Serverless cluster based on usage, plus additional costs like backup and pipelines costs.

## Dedicated clusters{#dedicated-clusters}

A Dedicated cluster provides dedicated resources and environment and offers enhanced performance with customizable workload management. 

Dedicated clusters are billed based on CU usage. Its total cost is **the sum of CU cost and storage cost**. Storage costs typically account for only about 2% of the total cost. For a precise estimate, please use the [calculator](https://zilliz.com/pricing#calculator). This section focuses primarily on the CU cost of a Dedicated cluster.

#### Cost Calculation{#cost-calculation}

```plaintext
CU Cost = CU Unit Price x CU Number x Cluster Runtime
```

Note: Cluster runtime refers to the duration of the cluster. If the cluster is in certain statuses, such as "Creating," "Suspending," "Resuming," or "Suspended," the time spent in these statuses will not incur CU charges.

#### Example{#example}

Suppose your cluster configuration is as follows:

- **Plan:** Dedicated (Enterprise)

- **Cloud Provider & Region:** AWS us-east-1 (Virginia)

- **CU Type:** Performance-optimized CU

- **CU Size:** 8 CU

- **Replica Count:** 2

- **Cluster** **Runtime:** 720 hours (1 month).

With the plan, cloud provider and region, and the CU type information, you can find on the [Pricing Page](https://zilliz.com/pricing) that the CU Unit Price is $0.248/hour.

![find-cu-unit-price](/img/find-cu-unit-price.png)

According to the CU size and replica count information, you can see that CU number is 8 CU x 2 Replica = 16.

The total CU cost of the example Dedicated cluster is $0.248 x 16 x 720 = $2856.96.

## Serverless clusters{#serverless-clusters}

A Serverless cluster operates on a pay-as-you-go model, making it ideal for workloads with high elasticity.

The total cost of a Serverless cluster includes **write costs**, **read costs**, and **storage costs**. The unit price of storage in Serverless cluster is $0.300/GB per month and the storage costs typically accounts for only about 2% of the total. For precise cost estimation, use the [calculator](https://zilliz.com/pricing#calculator).

### Write cost{#write-cost}

Write costs measure the compute resources consumed by [insert, upsert, and delete operations](./insert-update-delete).

Import and bulk insert operations will not incur write costs.

#### Cost Calculation{#cost-calculation}

```bash
Write Cost = vCU Unit Price x Write vCU Usage 
```

- **vCU Unit Price:** $4 per million vCUs

- **Write vCU Usage:** Calculated based on the data size involved in write operations

#### Example{#example}

The table below provides examples of vCU usage and costs for writing specific amounts of data into a Serverless cluster. 

<table>
   <tr>
     <th><p><strong>Data Size (*)</strong></p></th>
     <th><p><strong>Write vCU usage (million)</strong></p></th>
     <th><p><strong>Write Cost</strong></p></th>
   </tr>
   <tr>
     <td><p>1 million 128-dim vectors</p></td>
     <td><p>0.125</p></td>
     <td><p>$0.5</p></td>
   </tr>
   <tr>
     <td><p>1 million 768-dim vectors</p></td>
     <td><p>0.75</p></td>
     <td><p>$3</p></td>
   </tr>
   <tr>
     <td><p>1 million 1536-dim vectors</p></td>
     <td><p>1.5</p></td>
     <td><p>$6</p></td>
   </tr>
   <tr>
     <td><p>1 million 2560-dim vectors</p></td>
     <td><p>2.5</p></td>
     <td><p>$10</p></td>
   </tr>
</table>

**The data size in the table above excludes scalars. If you need to include scalar fields in your data, we recommend taking use of the Free Trial for cost estimation.*

To estimate costs for larger datasets, simply scale the vCU usage and cost according to the amount of data. For example, writing 10 million 768-dimensional vectors would use approximately 7.5 million vCUs and cost around $30.

For a precise calculation of the write vCU usage and cost, please refer to the following metrics:

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>vCU Usage</strong></p></th>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>1 KB of inserted data = 0.25 vCU</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>1 deleted entity = 1 vCU</p><p>Deleting a non-existent entity will also consume 1 vCU.</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>Calculated based on the size of the data updated and the number of entities deleted.</p><p>Deleting a non-existent entity will also consume 1 vCU.</p></td>
   </tr>
</table>

Suppose you inserted 3 GB (3,145,728 KB) of entities into a Serverless cluster and then deleted 100,000 entities.

- Insert operation vCU usage = 3,145,728 x 0.25 = 78,643 vCUs

- Delete operation vCU usage = 100,000 x 1 = 100,000 vCUs

- Total vCU usage = 1,000 + 78,643 = 178,643 vCUs

- Total write cost = 0.178643 x 4 = $0.72

### Read cost{#read-cost}

Read costs measure the resources consumed by [search, hybrid search, and query operations](./search-query-get). 

#### Cost Calculation{#cost-calculation}

```bash
Read Cost = vCU Unit Price x Read vCU Usage 
```

- **vCU Unit Price:** $4 per million vCUs

- **Read vCU Usage:** Depends on the size of the data scanned and the data returned. During each search or query, Zilliz Cloud scans the whole collection in a cluster. If you use a [partition key](./use-partition-key) as a filter during a search or query, Zilliz Cloud will only scan part of the collection that matches the specified partition key, which can lower the overall read vCU usage.

    <Admonition type="info" icon="📘" title="Notes">

    <ol>
    <li><p>The vCU usage does not grow proportionately with the data size scanned.</p></li>
    <li><p>Each read operation will cost a minimum of 6 vCUs.</p></li>
    </ol>

    </Admonition>

#### Example{#example}

The table below provides examples of vCU usage and costs for 1 million read requests on varying amounts of data:

<table>
   <tr>
     <th><p><strong>Scan Data Size (*)</strong></p></th>
     <th><p><strong>Read vCU Usage (million)</strong></p></th>
     <th><p><strong>Read Cost</strong></p></th>
   </tr>
   <tr>
     <td><p>1 million 128-dim vectors</p></td>
     <td><p>5</p></td>
     <td><p>$20</p></td>
   </tr>
   <tr>
     <td><p>1 million 768-dim vectors</p></td>
     <td><p>15</p></td>
     <td><p>$60</p></td>
   </tr>
   <tr>
     <td><p>5 million 768-dim vectors</p></td>
     <td><p>35</p></td>
     <td><p>$140</p></td>
   </tr>
   <tr>
     <td><p>10 million 768-dim vectors</p></td>
     <td><p>55</p></td>
     <td><p>$220</p></td>
   </tr>
   <tr>
     <td><p>1 million 1536-dim vectors</p></td>
     <td><p>25</p></td>
     <td><p>$100</p></td>
   </tr>
   <tr>
     <td><p>10 million 1536-dim vectors</p></td>
     <td><p>75</p></td>
     <td><p>$300</p></td>
   </tr>
   <tr>
     <td><p>100 million 1536-dim vectors</p></td>
     <td><p>290</p></td>
     <td><p>$1160</p></td>
   </tr>
   <tr>
     <td><p>10 billion 1536-dim vectors</p></td>
     <td><p>1,495</p></td>
     <td><p>$5980</p></td>
   </tr>
   <tr>
     <td><p>1 million 2560-dim vectors</p></td>
     <td><p>30</p></td>
     <td><p>$120</p></td>
   </tr>
</table>

**The data size in the table above excludes scalars. If you need to include scalar fields in your data, we recommend taking use of the Free Trial for cost estimation.*

In the table above, it can be noted that when the data size grow from 1 million to 10 million and even to 100 million, the vCU usage does not increase proportionately. Therefore, we encourage you to take advantage of the [Free Trial](./free-trials) to test and estimate the actual costs of using a Serverless cluster under your specific workload requirements.

## Value-added services{#value-added-services}

Zilliz Cloud also provides value-added services such as data backup and Pipelines .

### Backup cost{#backup-cost}

A backup is a copy of your Zilliz Cloud cluster or collection that you can use for recovery in case your data is corrupted or lost. 

Creating backups incur charges while restoring a backup file does not incur any charges.

#### Cost Calculation{#cost-calculation}

```plaintext
Backup Cost = Backup Unit Price x Backup File Size x Backup Rentention Period
```

- **Backup Unit Price (per month):** Varies across cloud providers. Refer to the [Pricing Page](https://zilliz.com/pricing) for details.

- **Backup File Size (GB):** The total size of your backup files.

- **Backup Retention Period (month):** Indicates for how long a backup file is retained.

<Admonition type="info" icon="📘" title="Notes">

<p>Backups are charged daily. Files retained for less than one day are rounded up and charged as one day.</p>

</Admonition>

#### Example{#example}

Using an AWS-hosted cluster as an example, a 20 GB backup saved on Zilliz Cloud for 45 days (1.5 month) will incur **$0.025 x 20 x 1.5 = $0.75**. 

### Pipelines cost{#pipelines-cost}

The in-built Pipelines of Zilliz Cloud allows you to streamline embedding, vector ingestion, search and reranking in one API service. Pipelines costs are determined by the type of model and its actual usage. For more details, refer to [Pipelines Pricing](https://zilliz.com/pricing).