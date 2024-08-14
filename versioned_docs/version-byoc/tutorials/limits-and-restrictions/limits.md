---
slug: /limits
beta: FALSE
notebook: FALSE
type: origin
token: PuxkwMWvbiHxvTkHsVkcMZP9n5f
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - limits

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud Limits

This page provides information about limits on the Zilliz Cloud platform. [Submit a request](https://support.zilliz.com/hc/en-us) to us if you need to report issues related to these limits.

## Organizations, Projects & Members{#organizations-projects-and-members}

The following table lists the limits on the maximum number of organizations and projects allowed for a single user.

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Max number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>Organization member</p></td>
     <td><p>100</p></td>
     <td><p>An organization can hold up to 100 members. A user can belong to multiple organizations.</p></td>
   </tr>
   <tr>
     <td><p>Project</p></td>
     <td><p>10</p></td>
     <td><p>Each user can create 10 projects.</p></td>
   </tr>
   <tr>
     <td><p>Project Member</p></td>
     <td><p>100</p></td>
     <td><p>A project can hold up to 100 members. A user can belong to multiple projects within their organization.</p></td>
   </tr>
</table>

## Collections{#collections}

<table>
   <tr>
     <th><p><strong>Cluster Plan</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>Dedicated cluster</p></td>
     <td><p>64 per CU, and &lt;= 4096</p></td>
     <td><p>You can create up to 64 collections per CU used in a dedicated cluster and no more than 4,096 collections in the cluster.</p></td>
   </tr>
</table>

In addition to the limits on the number of collections per cluster, Zilliz Cloud also applies limits on consumed capacity. The following formula shows how Zilliz Cloud calculates the general capacity of a cluster. The consumed capacity should be less than the general capacity available.

```java
General Capacity = 512 x Number of CUs
```

<Admonition type="info" icon="📘" title="Notes">

<p>The following explains how Zilliz Cloud calculates the consumed capacity and general capacity of a cluster.</p>
<ul>
<li><strong>Calculating the consumed capacity in a cluster</strong></li>
</ul>
<p>For instance, let's assume that you have created <strong>50</strong> collections in a cluster; each of the first <strong>20</strong> collections has <strong>20</strong> partitions, while each of the remaining <strong>30</strong> collections has <strong>10</strong> partition. The consumed capacity of the cluster can be calculated as follows:</p>
<p><strong>20 (collections) x 20 (partitions) + 30 (collections) x 10 (partitions) = 400 + 300 = 700</strong></p>
<p>Based on the above calculation, Zilliz Cloud regards the cluster has a consumed capacity of <strong>700</strong>.</p>
<ul>
<li><strong>Calculating the general capacity of a cluster</strong></li>
</ul>
<p>The general capacity can be determined using the following formula:</p>
<p><strong>\<= 512 x Number of CUs</strong></p>
<p>For instance, </p>
<ul>
<li><p>In a cluster of <strong>2</strong> CUs, you can create a maximum of <strong>128</strong> collections with a general capacity of <strong>1,024</strong>.</p></li>
<li><p>In a cluster of <strong>12</strong> CUs, you can create a maximum of <strong>768</strong> collections with a general capacity of <strong>6,144</strong>.</p></li>
<li><p>In a cluster of <strong>32</strong> CUs or more, you can create a maximum of <strong>4,096</strong> collections with a general capacity of <strong>16,384</strong>. </p></li>
</ul>

</Admonition>

Additionally, the rate limit for creating collections is **1** collection/s per cluster.

### Partitions{#partitions}

<table>
   <tr>
     <th><p><strong>Cluster Type</strong></p></th>
     <th><p><strong>Max number (Per collection)</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>Dedicated cluster</p></td>
     <td><p>1,024</p></td>
     <td><p>You can create up to 1,024 partitions per collection in a dedicated cluster.</p></td>
   </tr>
</table>

When calculating the consumed and general capacity, refer to the notes in [Collections](./limits#collections). Additionally, the rate limit for creating partitions is **1** partition/s per cluster.

### Fields{#fields}

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>Fields per collection</p></td>
     <td><p>64</p></td>
     <td><p>N/A</p></td>
   </tr>
   <tr>
     <td><p>Vector fields per collection</p></td>
     <td><p>1</p></td>
     <td><p>The support for multiple vector fields is coming soon.</p></td>
   </tr>
</table>

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

<table>
   <tr>
     <th></th>
     <th><p>Insert rate limits</p></th>
   </tr>
   <tr>
     <td><p>Dedicated cluster 1 CU and 2 CUs</p></td>
     <td><p>4 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster 4 - 8 CUs</p></td>
     <td><p>6 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster 12 - 20 CUs</p></td>
     <td><p>8 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster &gt;= 24 CUs</p></td>
     <td><p>12 MB/s</p></td>
   </tr>
</table>

When inserting data, include all schema-defined fields. Exclude the primary key if the collection has AutoID enabled.

To make inserted entities immediately retrievable in searches and queries, consider changing the consistency level in the search or query requests to **Strong**. Read [Consistency Level](./consistency-level) for more.

### Upsert{#upsert}

Each upsert request/response should be no greater than **64** MB.

The rate limit that applies varies with the cluster types and the number of CUs in use. The following table lists the rate limits for upsert operations.

<table>
   <tr>
     <th></th>
     <th><p>Insert rate limits</p></th>
   </tr>
   <tr>
     <td><p>Dedicated cluster 1 CU and 2 CUs</p></td>
     <td><p>4 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster 4 - 8 CUs</p></td>
     <td><p>6 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster 12 - 20 CUs</p></td>
     <td><p>8 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster &gt;= 24 CUs</p></td>
     <td><p>12 MB/s</p></td>
   </tr>
</table>

When upserting data, include all schema-defined fields. 

To make upserted entities immediately retrievable in searches and queries, consider changing the consistency level in the search or query requests to **Strong**. Read [Consistency Level](./consistency-level) for more.

### Index{#index}

Index types vary with field types. The following table lists the indexable field types and the corresponding index types.

<table>
   <tr>
     <th><p><strong>Field Type</strong></p></th>
     <th><p><strong>Index Type</strong></p></th>
     <th><p><strong>Metric Type</strong></p></th>
   </tr>
   <tr>
     <td><p>Vector Field</p></td>
     <td><p>AUTOINDEX</p></td>
     <td><p>L2, IP, and COSINE</p></td>
   </tr>
   <tr>
     <td><p>VarChar Field</p></td>
     <td><p>TRIE</p></td>
     <td><p>N/A</p></td>
   </tr>
   <tr>
     <td><p>Int8/16/32/64</p></td>
     <td><p>STL_SORT</p></td>
     <td><p>N/A</p></td>
   </tr>
   <tr>
     <td><p>Float32/64</p></td>
     <td><p>STL_SORT</p></td>
     <td><p>N/A</p></td>
   </tr>
</table>

### Flush{#flush}

The rate limit for flush requests is 0.1 requests per second, imposed at the collection level for specific cluster types. This rate limit applies to:

- Serverless clusters compatible with Milvus 2.4.x or later.

- Dedicated clusters upgraded to the beta version, compatible with Milvus 2.4.x or later.

<Admonition type="info" icon="📘" title="Notes">

<p>You are not advised to perform flush operations manually. Zilliz Cloud clusters handle it gracefully for you.</p>

</Admonition>

### Load{#load}

The rate limit for load requests is **1** req/s per cluster.

<Admonition type="info" icon="📘" title="Notes">

<p>You do not need to perform the load collection for collections that are already loaded, even if new data is coming into these collections.</p>

</Admonition>

### Search{#search}

Each search request/response should be no greater than **64** MB.

Each search request carries no more than **16,384** query vectors (usually known as **nq**).

The number that each search response carries (usually known as **topK**) varies with your subscription plan:

- For Free and Serverless clusters, the **topK** is no greater than **1,024** entities in return.

- For dedicated clusters, the **topK** is no greater than **16,384** entities in return.

### Query{#query}

Each query request/response should be no greater than **64** MB.

Each query response carries no more than 16,384 entities in return (usually known as **topK**).

### Delete{#delete}

Each delete request/response should be no greater than **64** MB.

The rate limit for delete requests is **0.5** MB/s per cluster.

### Drop{#drop}

The rate limit for drop requests is **1** req/s per cluster.

### Data import{#data-import}

You can have up to **10** running or pending import jobs in a collection.

## CU Capacity{#cu-capacity}

Read [Select the Right CU](./cu-types-explained) for more.

## Data Import on Console{#data-import-on-console}

<table>
   <tr>
     <th><p>File Type</p></th>
     <th><p>Local upload</p></th>
     <th><p>Sync from S3/GCS/Other OSS</p></th>
   </tr>
   <tr>
     <td><p>JSON</p></td>
     <td><p>1 GB</p></td>
     <td><p>1 GB</p></td>
   </tr>
   <tr>
     <td><p>Numpy</p></td>
     <td><p>Not support</p></td>
     <td><p>The maximum size of the folder is 100 GB and the maximum size of each subdirectory is 15 GB</p></td>
   </tr>
   <tr>
     <td><p>Parquet</p></td>
     <td><p>Not support</p></td>
     <td><p>10GB</p></td>
   </tr>
</table>

For details, refer to [Prepare Source Data](./prepare-source-data).

## Backup on Console{#backup-on-console}

Backup snapshots can be retained for up to 30 days.

## Restore on Console{#restore-on-console}

You can restore a snapshot in the same region as the original cluster of the snapshot. The target cluster of the restoration should use the same CU type as the original one.