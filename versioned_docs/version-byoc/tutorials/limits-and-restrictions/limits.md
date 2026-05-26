---
title: "Zilliz Cloud Limits | BYOC"
slug: /limits
sidebar_key: limits
sidebar_label: "Zilliz Cloud Limits"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "This page provides information about limits on the Zilliz Cloud platform. You can use the OPS system that Zilliz provides to tune most of the settings mentioned on this page. You can still contact us if you need further help. | BYOC"
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

This page provides information about limits on the Zilliz Cloud platform. You can use the OPS system that Zilliz provides to tune most of the settings mentioned on this page. You can still [contact us](https://support.zilliz.com/hc/en-us) if you need further help.

## Organizations & Projects\{#organizations-and-projects}

The following table lists the limits on the maximum number of orgsanizations and projects allowed for a single user.

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>Project</p></td>
     <td><p>100</p></td>
     <td><p>Each user can create up to 100 projects in 1 organization.</p></td>
   </tr>
</table>

## Users & Roles\{#users-and-roles}

The following table lists the limits on the maximum number of users and roles allowed in Zilliz Cloud.

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>Cluster User</p></td>
     <td><p>500</p></td>
     <td><p>A cluster can have up to 500 users in total.</p></td>
   </tr>
   <tr>
     <td><p>Cluster Custom Role</p></td>
     <td><p>500</p></td>
     <td><p>A cluster can have up to 500 custom roles in total. <a href="http://support.zilliz.com">Contact us</a> to remove this limit.</p></td>
   </tr>
</table>

## API Keys\{#api-keys}

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>API Key</p></td>
     <td><p>100</p></td>
     <td><p>Each organization can contain a maximum of 100 customized API keys for optimal resource utilization and security.</p></td>
   </tr>
</table>

## Console IP Allowlist\{#console-ip-allowlist}

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>IPs in the organization console IP allowlist</p></td>
     <td><p>100</p></td>
     <td><p>Each organization console IP allowlist can contain a maximum of 100 IPs or CIDR blocks.</p></td>
   </tr>
</table>

## Clusters\{#clusters}

### CUs\{#cus}

A CU is the basic unit of compute resources used for parallel processing of data, and different CU types comprise varying combinations of CPU, memory, and storage. The concept of CU only applies to Dedicated clusters.

<table>
   <tr>
     <th><p><strong>Project Plan & Cluster Deployment Option</strong></p></th>
     <th><p><strong>Limits</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>Dedicated serving cluster in a Standard project</p></td>
     <td><p>CU size &lt;=32</p></td>
     <td><p>On the console, you can create up to 32 CUs for a single cluster.</p></td>
   </tr>
   <tr>
     <td><p>Dedicated serving cluster in an Enterprise project</p></td>
     <td><p>CU size x Replica Count &lt;=10,240</p></td>
     <td><p>On the console, you can create up to 1,024 CUs for a single cluster.</p><p>However, the limit is CU size x Replica Count &lt;=10,240 if replicas are added.</p></td>
   </tr>
</table>

You are welcome to [contact us](https://support.zilliz.com/hc/en-us) 

- If your Dedicated clusters in a Standard project require more than 32 CUs

- If your Dedicated clusters in an Enterprise project require more than 1,024 CUs

## Replicas\{#replicas}

To add replicas, the cluster needs to have **12 CUs or more**. The following limit applies as well.

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Limits</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>Replica</p></td>
     <td><p>10</p></td>
     <td><p>You can create a maximum of 10 replicas.</p></td>
   </tr>
   <tr>
     <td><p>Query CU x Replica Count</p></td>
     <td><p>10,240</p></td>
     <td><p>The cluster replica x query CU should not exceed 10,240.</p></td>
   </tr>
</table>

## Databases\{#databases}

- Each Serving-Dedicated cluster can have up to 1024 databases.

- Default database cannot be dropped.

## Collections\{#collections}

The maximum number of collections and partitions in a Zilliz Cloud cluster varies with the number of CUs allocated to it and its compatible Milvus version. You can refer to the following descriptions and calculate the maximum number of collections and partitions in your cluster.

You can create a maximum of **1,024** collections or **4,096** partitions per CU, with up to **1,024** partitions allowed per collection. You can use the following formulae to calculate the upper limits for the number of collections and partitions in a cluster:

![I1aJwA2LShihxQbyG30cFm14ngf](https://zdoc-images.s3.us-west-2.amazonaws.com/I1aJwA2LShihxQbyG30cFm14ngf.png)

- The total number of collections in a cluster should be less than 1,024 times the number of CUs in the cluster or 16,384, whichever is lower.

- The total number of partitions across all collections in a cluster should be less than 4,096 times the number of CUs allocated to the cluster or 65,536, whichever is lower.

- Both conditions must be met.

### Fields\{#fields}

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
   </tr>
   <tr>
     <td><p>Fields per collection</p></td>
     <td><p>64</p></td>
   </tr>
   <tr>
     <td><p>Vector fields per collection</p></td>
     <td><p>10</p></td>
   </tr>
</table>

Other limits on fields:

- Some fields, such as VarChar or JSON, use more memory than expected and can cause the cluster to become full.

### Dimensions\{#dimensions}

The maximum number of dimensions of a vector field is **32,768**.

### Shards\{#shards}

The maximum number of shards allowed depends on cluster CU size.

<table>
   <tr>
     <th><p>CU Size</p></th>
     <th><p>Max Number</p></th>
   </tr>
   <tr>
     <td><p>1 - 2 CU</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td><p>4 - 8 CU</p></td>
     <td><p>4</p></td>
   </tr>
   <tr>
     <td><p>12 - 64 CU</p></td>
     <td><p>8</p></td>
   </tr>
   <tr>
     <td><p>> 64 CU</p></td>
     <td><p>16</p></td>
   </tr>
</table>

### Rate limit\{#rate-limit}

Zilliz Cloud also imposes rate limits on collection and partition data definition language (DDL) operations, including creating, loading, releasing, and dropping collections. The following rate limit applies to collections in both Serverless and Dedicated clusters.

<table>
   <tr>
     <th></th>
     <th><p><strong>Rate Limit</strong></p></th>
   </tr>
   <tr>
     <td><p>Collection DDL Operation </p><p>(create, load, release, drop)</p></td>
     <td><p>20 req/s per cluster</p></td>
   </tr>
   <tr>
     <td><p>Partition DDL Operation</p><p>(create, load, release, drop)</p></td>
     <td><p>20 req/s per cluster</p></td>
   </tr>
</table>

## Operations\{#operations}

This section focuses on the rate limit for common data operations in Zilliz Cloud clusters.

### Insert and Upsert\{#insert-and-upsert}

The rate limit for insert and upsert operations depends on the cluster deployment option and the number of CUs in use. 

<table>
   <tr>
     <th></th>
     <th><p>Maximum Insert and Upsert Rate Limits</p></th>
   </tr>
   <tr>
     <td><p>Dedicated cluster</p></td>
     <td><p>16 MB/s + 1 MB/s × CU</p><p>Up to 256 MB/s at most.</p></td>
   </tr>
</table>

Examples:

- `1 CU`: `17 MB/s`

- `8 CUs`: `24 MB/s`

- `64 CUs`: `80 MB/s`

- `240 CUs`: `256 MB/s`

- `>= 240 CUs`: `256 MB/s` maximum

In addition, the following extra limits apply:

- The write rate for a single shard must not exceed **32 MB/s**.

- When inserting data, include all schema-defined fields. Exclude the primary key if the collection has AutoID enabled.

- When upserting data, include all schema-defined fields.

- To make inserted or upserted entities immediately retrievable in searches and queries, consider changing the consistency level in the search or query requests to **Strong**. Read [Consistency Level](./consistency-level) for more.

### Index\{#index}

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

### Flush\{#flush}

The rate limit for flush requests is 0.1 requests per second, imposed at the collection level for specific cluster types. This rate limit applies to clusters compatible with Milvus v2.4.x or later.

<Admonition type="info" icon="📘" title="Notes">

<p>You are not advised to perform flush operations manually. Zilliz Cloud clusters handle it gracefully for you.</p>

</Admonition>

### Load\{#load}

The rate limit for load requests is **20** req/s per cluster.

<Admonition type="info" icon="📘" title="Notes">

<p>You do not need to perform the load collection for collections that are already loaded, even if new data is coming into these collections.</p>

</Admonition>

### Search\{#search}

Each search request/response should be no greater than **64** MB.

The number of query vectors that each search request carries (ususally known as **nq**) is no greater than **16,384**, and the nubmer that each search response carries (usually known as **topK**) is no greater than **16,384** entities in return.

### Query\{#query}

Each query request/response should be no greater than **64** MB.

Each query response carries no more than 16,384 entities in return (usually known as **topK**).

### Delete\{#delete}

Each delete request/response should be no greater than **64** MB.

The rate limit for delete requests is **0.5** MB/s per cluster.

### Drop\{#drop}

The rate limit for drop requests is **20** req/s per cluster.

### Data import\{#data-import}

You can have up to **10,000** running or pending import jobs in a collection.

Zilliz Cloud also imposes limits on the files to import on the web console.

<table>
   <tr>
     <th><p>File Type</p></th>
     <th><p>Local upload</p></th>
     <th><p>From Object Storage</p></th>
   </tr>
   <tr>
     <td><p>JSON</p></td>
     <td><p>1 GB</p></td>
     <td><p>The maximum total import size is 1 TB and the maximum size of each file is 10 GB with up to 1,000 files.</p></td>
   </tr>
   <tr>
     <td><p>Parquet</p></td>
     <td><p>1 GB</p></td>
     <td><p>The maximum total import size is 1 TB and the maximum size of each file is 10 GB with up to 1,000 files.</p></td>
   </tr>
   <tr>
     <td><p>Numpy</p></td>
     <td><p>Not support</p></td>
     <td><p>The maximum total import size is 1 TB and the maximum size of each subdirectory is 10 GB with up to 1,000 subdirectories.</p></td>
   </tr>
</table>

For details, refer to [Storage Options](./data-import-storage-options) and [Format Options](./data-import-format-options).

## Backup on Console\{#backup-on-console}

Manually created backups are permanently retained.

The maximum retention period for automatically created backups is 30 days. 

## Restore on Console\{#restore-on-console}

You can restore a backup file in the same region as the original cluster of the backup file. The target cluster of the restoration should use the same CU type as the original one.

## IP Access List\{#ip-access-list}

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>Console IP Access</p></td>
     <td><p>100</p></td>
     <td><p>You can add up to 100 IP addresses to the console IP allowlist.</p></td>
   </tr>
</table>

## Migration\{#migration}

You can migrate data from other vendors to your Zilliz Cloud cluster, and the maximum number of collections per migration varies with your Zilliz Cloud cluster. You can migrate a maximum of **10** collections each time during the migrations.

