---
slug: /limits
beta: FALSE
notebook: FALSE
token: PuxkwMWvbiHxvTkHsVkcMZP9n5f
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Zilliz Cloud Limits

This page provides information about limits on the Zilliz Cloud platform as well as clusters. [Submit a request](https://support.zilliz.com/hc/en-us) to us if you need to report issues related to these limits.

## Organizations, Projects & Members{#organizations-projects-and-members}

The following table lists the limits on the maximum number of organizations and projects allowed for a single user.

|  **Item**                                      |  **Max number **                             |  **Remarks**                                                                                             |
| ---------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
|   |  <br/>  |  <br/>                    |
|  Organization member                           |  100                                         |  An organization can hold up to 100 members. A user can belong to multiple organizations.                |
|  Project                                       |  10                                          |  Each user can create 10 projects.                                                                       |
|  Project Member                                |  100                                         |  A project can hold up to 100 members. A user can belong to multiple projects within their organization. |

## Collections{#collections}

|  **Cluster Type**                                    |  **Max Number**                              |  **Remarks**                                                                                                               |
| ---------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
|   |  <br/>  |                                                |
|  Dedicated cluster<br/>                           |  64 per CU, and <= 4096                      |  You can create up to 64 collections per CU used in a dedicated cluster and no more than 4,096 collections in the cluster. |

In addition to the limits on the number of collections per cluster, Zilliz Cloud also applies limits on consumed capacity. The following table lists the limits on the general capacity of a cluster.

|  **Number of CUs** |  **General Capacity**            |
| ------------------ | -------------------------------- |
|  1-8 CUs           |  <= 4,096                        |
|  12+ CUs           |  Min(512 x Number of CUs, 65536) |

The consumed capacity should be less than the general capacity available.

<Admonition type="info" icon="📘" title="Notes">

The following explains how Zilliz Cloud calculates the consumed capacity and general capacity of a cluster.

- **Calculating the consumed capacity in a cluster**

    For instance, let's assume that you have created **50** collections in a cluster; each of the first **20** collections has **2** partitions and **4** shards, while each of the remaining **30** collections has **1** partition and **12** shards. The consumed capacity of the cluster can be calculated as follows:

    **20 (collections) x 2 (partitions) x 4 (shards) + 30 (collections) x 1 (partitions) x 12 (shards) = 160 + 360 = 520**

    Based on the above calculation, Zilliz Cloud regards the cluster has a consumed capacity of **520**.

- **Calculating the general capacity of a cluster**

    The general capacity can be determined using the following formula:

    **Min(512 x Number of CUs, 65536)**

    For instance, 

    - In a cluster of **2** CUs, you can create a maximum of **128** collections with a general capacity of **1,024**.

    - In a cluster of **12** CUs, you can create a maximum of **768** collections with a general capacity of **6,144**.

    - In a cluster of **32** CUs or more, you can create a maximum of **4,096** collections with a general capacity of **65,536**.

</Admonition>

Additionally, the rate limit for creating collections is **1 **collection/s per cluster.

### Partitions{#partitions}

|  **Cluster Type**                                    |  **Max number (Per collection)**              |  **Remarks**                                                                                                 |
| ---------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
|   |  <br/>  |   |
|  Dedicated cluster<br/>                           |  4,096                                        |  You can create up to 4,096 partitions per collection in a dedicated cluster.                                |

When calculating the consumed and general capacity, refer to the notes in [Collections](./limits#collections). Additionally, the rate limit for creating partitions is **1** partition/s per cluster.

### Shards{#shards}

When creating a collection, you can create up to **16** shards for the collection. If not specified, a collection has a shard by default.

You are advised to keep the default settings for the shard number when creating collections, especially for clusters using no more than **24** CUs.

When calculating the consumed and general capacity, refer to the notes in [Collections](./limits#collections). 

### Fields{#fields}

|  **Item**                     |  **Max Number** |  **Remarks**                                            |
| ----------------------------- | --------------- | ------------------------------------------------------- |
|  Fields per collection        |  64             |                                                         |
|  Vector fields per collection |  1              |  The support for multiple vector fields is coming soon. |

Other limits on fields:

- Null values are not supported by any field types.

- Some fields, such as VarChar or JSON, use more memory than expected and can cause the cluster to become full.

### Dimensions{#dimensions}

The maximum number of dimensions of a vector field is **32,768**.

## Operations{#operations}

This section focuses on the rate limit for common data operations in Zilliz Cloud clusters.

### Insert{#insert}

Each insert request/response should be no greater than **64** MB.

The rate limit that applies varies with the cluster types and the number of CUs in use. The following table lists the rate limits for insert operations.

|                                                      |  Insert rate limits                               |
| ---------------------------------------------------- | ------------------------------------------------- |
|   |  <br/>  |
|  Dedicated cluster 1 CU and 2 CUs                    |  4 MB/s                                           |
|  Dedicated cluster 4 - 8 CUs                         |  6 MB/s                                           |
|  Dedicated cluster 12 - 20 CUs                       |  8 MB/s                                           |
|  Dedicated cluster >= 24 CUs                         |  12 MB/s                                          |

When inserting data, include all schema-defined fields. Exclude the primary key if the collection has AutoID enabled.

To make inserted entities immediately retrievable in searches and queries, consider changing the consistency level in the search or query requests to **Strong**. Read [Consistency Level](./consistency-level) for more.

### Upsert{#upsert}

Each upsert request/response should be no greater than **64** MB.

The rate limit that applies varies with the cluster types and the number of CUs in use. The following table lists the rate limits for upsert operations.

|                                                      |  Insert rate limits                      |
| ---------------------------------------------------- | ---------------------------------------- |
|  Dedicated cluster 1 CU and 2 CUs                    |  4 MB/s                                  |
|  Dedicated cluster 4 - 8 CUs                         |  6 MB/s                                  |
|  Dedicated cluster 12 - 20 CUs                       |  8 MB/s                                  |
|  Dedicated cluster >= 24 CUs                         |  12 MB/s                                 |

When upserting data, include all schema-defined fields. Exclude the primary key if the collection has AutoID enabled.

To make upserted entities immediately retrievable in searches and queries, consider changing the consistency level in the search or query requests to **Strong**. Read [Consistency Level](./consistency-level) for more.

### Index{#index}

Index types vary with field types. The following table lists the indexable field types and the corresponding index types.

|  **Field Type** |  **Index Type** |  **Metric Type**    |
| --------------- | --------------- | ------------------- |
|  Vector Field   |  AUTOINDEX      |  L2, IP, and COSINE |
|  VarChar Field  |  TRIE           |  N/A                |
|  Int8/16/32/64  |  STL_SORT       |  N/A                |
|  Float32/64     |  STL_SORT       |  N/A                |

### Flush{#flush}

The rate limit for flush requests is **1** req/s per cluster.

<Admonition type="info" icon="📘" title="Notes">

You are not advised to perform flush operations manually. Zilliz Cloud clusters handle it gracefully for you.

</Admonition>

### Load{#load}

The rate limit for load requests is **1** req/s per cluster.

<Admonition type="info" icon="📘" title="Notes">

You do not need to perform the load collection for collections that are already loaded, even if new data is coming into these collections.

</Admonition>

### Search{#search}

Each search request/response should be no greater than **64** MB.

Each search request carries no more than** 16,384** query vectors (usually known as **nq**).

Each search response carries no more than 16,384 entities in return (usually known as **topK**).

### Query{#query}

Each query request/response should be no greater than **64** MB.

Each query response carries no more than 16,384 entities in return (usually known as **topK**).

### Delete{#delete}

Each delete request/response should be no greater than **64** MB.

The rate limit for delete requests is **0.5** MB/s per cluster.

### Drop{#drop}

The rate limit for drop requests is **1** req/s per cluster.

## CU Capacity{#cu-capacity}

Read [Select the Right CU](./cu-types-explained) for more.

## Data Import on Console{#data-import-on-console}

|  File Type      |  Local upload |  Sync from S3/GCS/Other OSS                                                                  |
| --------------- | ------------- | -------------------------------------------------------------------------------------------- |
|  JSON           |  1 GB         |  1 GB                                                                                        |
|  Numpy<br/>  |  Not support  |  The maximum size of the folder is 100 GB and the maximum size of each subdirectory is 15 GB |
|  Parquet        |  Not support  |  10GB                                                                                        |

For details, refer to [Prepare Source Data](./prepare-source-data).

## Backup on Console{#backup-on-console}

Zilliz Cloud provides free storage for backup snapshots for up to 30 days. 

## Restore on Console{#restore-on-console}

You can restore a snapshot in the same region as the original cluster of the snapshot. The target cluster of the restoration should use the same CU type as the original one.