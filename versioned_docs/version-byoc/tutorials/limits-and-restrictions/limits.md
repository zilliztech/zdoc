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

This page provides information about limits on the Zilliz Cloud platform. [Submit a request](https://support.zilliz.com/hc/en-us) to us if you need to report issues related to these limits.

## Organizations, Projects & Members{#organizations-projects-and-members}

The following table lists the limits on the maximum number of organizations and projects allowed for a single user.

<table>
   <tr>
     <th><strong>Item</strong></th>
     <th><strong>Max number</strong></th>
     <th><strong>Remarks</strong></th>
   </tr>
   <tr>
     <td>Organization member</td>
     <td>100</td>
     <td>An organization can hold up to 100 members. A user can belong to multiple organizations.</td>
   </tr>
   <tr>
     <td>Project</td>
     <td>10</td>
     <td>Each user can create 10 projects.</td>
   </tr>
   <tr>
     <td>Project Member</td>
     <td>100</td>
     <td>A project can hold up to 100 members. A user can belong to multiple projects within their organization.</td>
   </tr>
</table>

## Collections{#collections}

<table>
   <tr>
     <th><strong>Cluster Plan</strong></th>
     <th><strong>Max Number</strong></th>
     <th><strong>Remarks</strong></th>
   </tr>
   <tr>
     <td>Dedicated cluster<br/></td>
     <td>64 per CU, and &lt;= 4096</td>
     <td>You can create up to 64 collections per CU used in a dedicated cluster and no more than 4,096 collections in the cluster.</td>
   </tr>
</table>

In addition to the limits on the number of collections per cluster, Zilliz Cloud also applies limits on consumed capacity. The following table lists the limits on the general capacity of a cluster.

<table>
   <tr>
     <th><strong>Number of CUs</strong></th>
     <th><strong>General Capacity</strong></th>
   </tr>
   <tr>
     <td>1-8 CUs</td>
     <td>&lt;= 4,096</td>
   </tr>
   <tr>
     <td>12 CUs and more</td>
     <td>&lt;= 512 x Number of CUs</td>
   </tr>
</table>

The consumed capacity should be less than the general capacity available.

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
<li><p>In a cluster of <strong>32</strong> CUs or more, you can create a maximum of <strong>4,096</strong> collections with a general capacity of <strong>65,536</strong>. </p></li>
</ul>

</Admonition>

Additionally, the rate limit for creating collections is **1** collection/s per cluster.

### Partitions{#partitions}

<table>
   <tr>
     <th><strong>Cluster Type</strong></th>
     <th><strong>Max number (Per collection)</strong></th>
     <th><strong>Remarks</strong></th>
   </tr>
   <tr>
     <td>Dedicated cluster<br/></td>
     <td>4,096</td>
     <td>You can create up to 4,096 partitions per collection in a dedicated cluster.</td>
   </tr>
</table>

When calculating the consumed and general capacity, refer to the notes in [Collections](./limits#collections). Additionally, the rate limit for creating partitions is **1** partition/s per cluster.

### Fields{#fields}

<table>
   <tr>
     <th><strong>Item</strong></th>
     <th><strong>Max Number</strong></th>
     <th><strong>Remarks</strong></th>
   </tr>
   <tr>
     <td>Fields per collection</td>
     <td>64</td>
     <td>N/A</td>
   </tr>
   <tr>
     <td>Vector fields per collection</td>
     <td>1</td>
     <td>The support for multiple vector fields is coming soon.</td>
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
     <th>Insert rate limits</th>
   </tr>
   <tr>
     <td>Dedicated cluster 1 CU and 2 CUs</td>
     <td>4 MB/s</td>
   </tr>
   <tr>
     <td>Dedicated cluster 4 - 8 CUs</td>
     <td>6 MB/s</td>
   </tr>
   <tr>
     <td>Dedicated cluster 12 - 20 CUs</td>
     <td>8 MB/s</td>
   </tr>
   <tr>
     <td>Dedicated cluster &gt;= 24 CUs</td>
     <td>12 MB/s</td>
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
     <th>Insert rate limits</th>
   </tr>
   <tr>
     <td>Dedicated cluster 1 CU and 2 CUs</td>
     <td>4 MB/s</td>
   </tr>
   <tr>
     <td>Dedicated cluster 4 - 8 CUs</td>
     <td>6 MB/s</td>
   </tr>
   <tr>
     <td>Dedicated cluster 12 - 20 CUs</td>
     <td>8 MB/s</td>
   </tr>
   <tr>
     <td>Dedicated cluster &gt;= 24 CUs</td>
     <td>12 MB/s</td>
   </tr>
</table>

When upserting data, include all schema-defined fields. 

To make upserted entities immediately retrievable in searches and queries, consider changing the consistency level in the search or query requests to **Strong**. Read [Consistency Level](./consistency-level) for more.

### Index{#index}

Index types vary with field types. The following table lists the indexable field types and the corresponding index types.

<table>
   <tr>
     <th><strong>Field Type</strong></th>
     <th><strong>Index Type</strong></th>
     <th><strong>Metric Type</strong></th>
   </tr>
   <tr>
     <td>Vector Field</td>
     <td>AUTOINDEX</td>
     <td>L2, IP, and COSINE</td>
   </tr>
   <tr>
     <td>VarChar Field</td>
     <td>TRIE</td>
     <td>N/A</td>
   </tr>
   <tr>
     <td>Int8/16/32/64</td>
     <td>STL_SORT</td>
     <td>N/A</td>
   </tr>
   <tr>
     <td>Float32/64</td>
     <td>STL_SORT</td>
     <td>N/A</td>
   </tr>
</table>

### Flush{#flush}

The rate limit for flush requests is **1** req/s per cluster.

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

Each search response carries no more than 16,384 entities in return (usually known as **topK**).

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
     <th>File Type</th>
     <th>Local upload</th>
     <th>Sync from S3/GCS/Other OSS</th>
   </tr>
   <tr>
     <td>JSON</td>
     <td>1 GB</td>
     <td>1 GB</td>
   </tr>
   <tr>
     <td>Numpy<br/></td>
     <td>Not support</td>
     <td>The maximum size of the folder is 100 GB and the maximum size of each subdirectory is 15 GB</td>
   </tr>
   <tr>
     <td>Parquet</td>
     <td>Not support</td>
     <td>10GB</td>
   </tr>
</table>

For details, refer to [Prepare Source Data](./prepare-source-data).

## Backup on Console{#backup-on-console}

Zilliz Cloud provides free storage for backup snapshots for up to 30 days. 

## Restore on Console{#restore-on-console}

You can restore a snapshot in the same region as the original cluster of the snapshot. The target cluster of the restoration should use the same CU type as the original one.