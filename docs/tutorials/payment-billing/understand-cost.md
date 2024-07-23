---
slug: /understand-cost
beta: FALSE
notebook: FALSE
type: origin
token: Pt17wz7kZiNRiHkpzo9c0POqnmg
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - cost
  - understand

---

import Admonition from '@theme/Admonition';


# Understand Cost

This page explains the cost of using Zilliz Cloud regarding the type of cluster you are using.

## Dedicated clusters{#dedicated-clusters}

Unlike a serverless cluster, a dedicated cluster offers enhanced performance with customizable workload management and advanced configuration options. 

Zilliz Cloud uses CU to measure the resources consumed by dedicated clusters. Additionally, you will also be charged for the data storage used.

### CU costs{#cu-costs}

A CU is the basic unit of resources used for parallel data processing. Zilliz Cloud offers two types of CUs, each consisting of different combinations of CPU, memory, and storage. For guidance on selecting the appropriate CU type, refer to [Select the Right CU](./cu-types-explained).

Zilliz Cloud calculates the CU costs based on your subscription plan, CU size, and the running time of your cluster.

### Storage{#storage}

A dedicated cluster stores both raw data, including the scalar and vector fields, and index files. These index files are generated to optimize search performance. The pricing terms for data storage in a serverless cluster differ from those in a dedicated cluster. 

For more details, refer to the [Pricing Plan](https://zilliz.com/pricing).

## Serverless clusters{#serverless-clusters}

A Serverless cluster is structured as a pay-as-you-go service. It is lightweight enough to meet your needs in highly elastic scenarios. 

When calculating the cost of a serverless cluster, Zilliz Cloud uses **vCU** to measure the resources consumed by read and write operations. **A million vCUs cost $4**. Additionally, you will also be charged for the data storage used.

For more details, refer to the [Pricing Plan](https://zilliz.com/pricing).

### Read costs{#read-costs}

Read costs measure the resources consumed by [search and query operations](./search-query-get). Zilliz Cloud calculates these costs based on the size of data scanned when processing a request. Costs remain low if only a small size of data is scanned. The size of the read results also impacts the consumption of vCUs.

To reduce your read costs, it is advisable to [use a partition key](./use-partition-key) to decrease the size of data scanned for each read request. When you include a partition key as a filter in a search or query request, Zilliz Cloud calculates the costs based on the size of data matching the specified partition key.

### Write costs{#write-costs}

Write costs measure the resources consumed by [insert, upsert, and delete operations](./insert-update-delete). The following table lists how Zilliz Cloud calculates the consumption of vCUs for each of these operations.

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>Consumption of vCUs</strong></p></th>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>Calculated based on the size of the data inserted</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>Calculated based on the size of the data updated and the number of entities affected</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>Calculated based on the number of deleted entities</p></td>
   </tr>
</table>

Regarding data size, Zilliz Cloud considers several factors including the number of rows, the dimensions in the vector field, the number of scalar fields, and their respective data types.

### Storage{#storage}

A serverless cluster stores both raw data, including the scalar and vector fields, and index files. These index files are generated to optimize search performance. The pricing terms for data storage in a serverless cluster differ from those in a dedicated cluster. 

For more details, refer to the [Pricing Plan](https://zilliz.com/pricing).

## Value-added services{#value-added-services}

Zilliz Cloud also provides value-added services, such as data backup and migration.

### Backup costs{#backup-costs}

Your backups are billed by the gigabyte-month (GB-month) on Zilliz Cloud. The GB-month is a measure of how many gigabytes of storage that you have used for your backups. It is also a measure of how long Zilliz Cloud holds your backups. A GB-month is one GB of storage for a month. You only pay for what you use. 

Using an AWS-hosted cluster as an example, a 20 GB backup saved on Zilliz Cloud for 45 days will incur **$0.025 x 20 x 1.5 = $0.75**. 

For more details, refer to the [Pricing Plan](https://zilliz.com/pricing).

Restoring a snapshot does not incur any charges.

### Migration costs{#migration-costs}

Zilliz Cloud allows you to migrate data from various sources and between your Zilliz Cloud clusters.

Only migrations between dedicated clusters incur charges based on the size of the data migrated. If the source and target clusters are located in different cloud regions, additional fees will apply.

Using the migration between two AWS-hosted dedicated clusters as an example, migrating the data of 20 GB between these clusters incur **$0.025 x 20 = $0.5**.

Migrations from Milvus, ElasticSearch, as well as free and serverless clusters do not incur any charges.

For more details, refer to the [Pricing Plan](https://zilliz.com/pricing).

### Pipelines costs{#pipelines-costs}

The in-built Pipelines of Zilliz Cloud allows you to streamline embedding, vector ingestion, search and reranking in one API service. Pipelines costs are determined by the type of model and its actual usage. For more details, refer to [Pipelines Pricing](https://zilliz.com/pricing).

