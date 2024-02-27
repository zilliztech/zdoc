---
slug: /limits
beta: FALSE
notebook: FALSE
type: origin
token: PuxkwMWvbiHxvTkHsVkcMZP9n5f
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Zilliz Cloud Limits

This page provides information about limits on the Zilliz Cloud platform as well as clusters. [Submit a request](https://support.zilliz.com/hc/en-us) to us if you need to report issues related to these limits.

## Organizations, Projects & Members{#organizations-projects-and-members}

The following table lists the limits on the maximum number of organizations and projects allowed for a single user.

|  __Item__                                      |  __Max number__                              |  __Remarks__                                                                                             |
| ---------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
|  Organization member                           |  100                                         |  An organization can hold up to 100 members. A user can belong to multiple organizations.                |
|  Project                                       |  10                                          |  Each user can create 10 projects.                                                                       |
|  Project Member                                |  100                                         |  A project can hold up to 100 members. A user can belong to multiple projects within their organization. |

## Collections{#collections}

|  __Cluster Type__                                    |  __Max Number__                              |  __Remarks__                                                                                                               |
| ---------------------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
|  Dedicated cluster<br/>                           |  64 per CU, and <= 4096                      |  You can create up to 64 collections per CU used in a dedicated cluster and no more than 4,096 collections in the cluster. |

In addition to the limits on the number of collections per cluster, Zilliz Cloud also applies limits on consumed capacity. The following table lists the limits on the general capacity of a cluster.

|  __Number of CUs__ |  __General Capacity__            |
| ------------------ | -------------------------------- |
|  1-8 CUs           |  <= 4,096                        |
|  12 CUs and more   |  Min(512 x Number of CUs, 65536) |

The consumed capacity should be less than the general capacity available.

<Admonition type="info" icon="📘" title="Notes">

<p>The following explains how Zilliz Cloud calculates the consumed capacity and general capacity of a cluster.</p>
<ul>
<li><strong>Calculating the consumed capacity in a cluster</strong></li>
</ul>
<p>For instance, let's assume that you have created <strong>50</strong> collections in a cluster; each of the first <strong>20</strong> collections has <strong>2</strong> partitions and <strong>4</strong> shards, while each of the remaining <strong>30</strong> collections has <strong>1</strong> partition and <strong>12</strong> shards. The consumed capacity of the cluster can be calculated as follows:</p>
<p><strong>20 (collections) x 2 (partitions) x 4 (shards) + 30 (collections) x 1 (partitions) x 12 (shards) = 160 + 360 = 520</strong></p>
<p>Based on the above calculation, Zilliz Cloud regards the cluster has a consumed capacity of <strong>520</strong>.</p>
<ul>
<li><strong>Calculating the general capacity of a cluster</strong></li>
</ul>
<p>The general capacity can be determined using the following formula:</p>
<p><strong>Min(512 x Number of CUs, 65536)</strong></p>
<p>For instance, </p>
<ul>
<li><p>In a cluster of <strong>2</strong> CUs, you can create a maximum of <strong>128</strong> collections with a general capacity of <strong>1,024</strong>.</p></li>
<li><p>In a cluster of <strong>12</strong> CUs, you can create a maximum of <strong>768</strong> collections with a general capacity of <strong>6,144</strong>.</p></li>
<li><p>In a cluster of <strong>32</strong> CUs or more, you can create a maximum of <strong>4,096</strong> collections with a general capacity of <strong>65,536</strong>. </p></li>
</ul>

</Admonition>

Additionally, the rate limit for creating collections is __1 __collection/s per cluster.

### Partitions{#partitions}

|  __Cluster Type__                                    |  __Max number (Per collection)__              |  __Remarks__                                                                                                 |
| ---------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
|  Dedicated cluster<br/>                           |  4,096                                        |  You can create up to 4,096 partitions per collection in a dedicated cluster.                                |

When calculating the consumed and general capacity, refer to the notes in [Collections](./limits#collections). Additionally, the rate limit for creating partitions is __1__ partition/s per cluster.

### Shards{#shards}

When creating a collection, you can create up to __8__ shards for the collection. If not specified, a collection has a shard by default.

|  __Item__        |  __Max Number__ |
| ---------------- | --------------- |
|   1-8 CUs        |  2              |
|  12 CUs and more |  8              |

You are advised to keep the default settings for the shard number when creating collections, especially for clusters using no more than __24__ CUs.

When calculating the consumed and general capacity, refer to the notes in [Collections](./limits#collections). 

### Fields{#fields}

|  __Item__                     |  __Max Number__ |  __Remarks__                                            |
| ----------------------------- | --------------- | ------------------------------------------------------- |
|  Fields per collection        |  64             |  N/A                                                    |
|  Vector fields per collection |  1              |  The support for multiple vector fields is coming soon. |

Other limits on fields:

- Null values are not supported by any field types.

- Some fields, such as VarChar or JSON, use more memory than expected and can cause the cluster to become full.

### Dimensions{#dimensions}

The maximum number of dimensions of a vector field is __32,768__.

## Operations{#operations}

This section focuses on the rate limit for common data operations in Zilliz Cloud clusters.

### Insert{#insert}

Each insert request/response should be no greater than __64__ MB.

The rate limit that applies varies with the cluster types and the number of CUs in use. The following table lists the rate limits for insert operations.

|                                                      |  Insert rate limits                               |
| ---------------------------------------------------- | ------------------------------------------------- |
|  Dedicated cluster 1 CU and 2 CUs                    |  4 MB/s                                           |
|  Dedicated cluster 4 - 8 CUs                         |  6 MB/s                                           |
|  Dedicated cluster 12 - 20 CUs                       |  8 MB/s                                           |
|  Dedicated cluster >= 24 CUs                         |  12 MB/s                                          |

When inserting data, include all schema-defined fields. Exclude the primary key if the collection has AutoID enabled.

To make inserted entities immediately retrievable in searches and queries, consider changing the consistency level in the search or query requests to __Strong__. Read [Consistency Level](./consistency-level) for more.

### Upsert{#upsert}

Each upsert request/response should be no greater than __64__ MB.

The rate limit that applies varies with the cluster types and the number of CUs in use. The following table lists the rate limits for upsert operations.

|                                                      |  Insert rate limits                      |
| ---------------------------------------------------- | ---------------------------------------- |
|  Dedicated cluster 1 CU and 2 CUs                    |  4 MB/s                                  |
|  Dedicated cluster 4 - 8 CUs                         |  6 MB/s                                  |
|  Dedicated cluster 12 - 20 CUs                       |  8 MB/s                                  |
|  Dedicated cluster >= 24 CUs                         |  12 MB/s                                 |

When upserting data, include all schema-defined fields. 

To make upserted entities immediately retrievable in searches and queries, consider changing the consistency level in the search or query requests to __Strong__. Read [Consistency Level](./consistency-level) for more.

### Index{#index}

Index types vary with field types. The following table lists the indexable field types and the corresponding index types.

|  __Field Type__ |  __Index Type__ |  __Metric Type__    |
| --------------- | --------------- | ------------------- |
|  Vector Field   |  AUTOINDEX      |  L2, IP, and COSINE |
|  VarChar Field  |  TRIE           |  N/A                |
|  Int8/16/32/64  |  STL_SORT       |  N/A                |
|  Float32/64     |  STL_SORT       |  N/A                |

### Flush{#flush}

The rate limit for flush requests is __1__ req/s per cluster.

<Admonition type="info" icon="📘" title="Notes">

<p>You are not advised to perform flush operations manually. Zilliz Cloud clusters handle it gracefully for you.</p>

</Admonition>

### Load{#load}

The rate limit for load requests is __1__ req/s per cluster.

<Admonition type="info" icon="📘" title="Notes">

<p>You do not need to perform the load collection for collections that are already loaded, even if new data is coming into these collections.</p>

</Admonition>

### Search{#search}

Each search request/response should be no greater than __64__ MB.

Each search request carries no more than__ 16,384__ query vectors (usually known as __nq__).

Each search response carries no more than 16,384 entities in return (usually known as __topK__).

### Query{#query}

Each query request/response should be no greater than __64__ MB.

Each query response carries no more than 16,384 entities in return (usually known as __topK__).

### Delete{#delete}

Each delete request/response should be no greater than __64__ MB.

The rate limit for delete requests is __0.5__ MB/s per cluster.

### Drop{#drop}

The rate limit for drop requests is __1__ req/s per cluster.

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