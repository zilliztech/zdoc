---
title: "Zilliz Cloud Limits | BYOC"
slug: /limits
sidebar_label: "Zilliz Cloud Limits"
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
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud Limits

This page provides information about limits on the Zilliz Cloud platform. You can use the OPS system that Zilliz provides to tune most of the settings mentioned on this page. You can still [contact us](https://support.zilliz.com/hc/en-us) if you need further help.

## Organizations & Projects{#organizations-and-projects}

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

## Collections{#collections}

The maximum number of collections and partitions in a Zilliz Cloud cluster varies with the number of CUs allocated to it and its compatible Milvus version. You can refer to the following descriptions and calculate the maximum number of collections and partitions in your cluster.

### Clusters compatible with Milvus v2.4.x{#clusters-compatible-with-milvus-v24x}

You can create a maximum of **256** collections or **1,024** partitions per CU, with up to **1,024** partitions allowed per collection. You can use the following formulae to calculate the upper limits for the number of collections and partitions in a cluster:

![MhA4wDlMwhhXrvbFio6cS3LNnNe](/img/MhA4wDlMwhhXrvbFio6cS3LNnNe.png)

- The total number of collections in a cluster should be less than 256 times the number of CUs in the cluster or 16,384, whichever is lower.

- The total number of partitions across all collections in a cluster should be less than 1,024 times the number of CUs allocated to the cluster or 65,536, whichever is lower.

- Both conditions must be met.

### Cluster compatible with Milvus v2.5.x{#cluster-compatible-with-milvus-v25x}

You can create a maximum of **1,024** collections or **4,096** partitions per CU, with up to **1,024** partitions allowed per collection. You can use the following formulae to calculate the upper limits for the number of collections and partitions in a cluster:

![I1aJwA2LShihxQbyG30cFm14ngf](/img/I1aJwA2LShihxQbyG30cFm14ngf.png)

- The total number of partitions across all collections in a cluster should be less than  4,096 times the number of CUs allocated to the cluster or 65,536, whichever is lower, as denoted in the following formula:

- The total number of collections in a cluster should be less than 1,024 times the number of CUs in the cluster or 16,384, whichever is lower.

- Both conditions must be met.

### Fields{#fields}

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
     <td><p>4</p></td>
   </tr>
</table>

Other limits on fields:

- Null values are not supported by any field types.

- Some fields, such as VarChar or JSON, use more memory than expected and can cause the cluster to become full.

### Dimensions{#dimensions}

The maximum number of dimensions of a vector field is **32,768**.

### Shards{#shards}

The maximum number of shards allowed depends on the cluster plan and cluster CU size.

<table>
   <tr>
     <th colspan="2"><p><strong>Cluster Plan & CU Size</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>Free</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Serverless</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td rowspan="4"><p>Dedicated</p></td>
     <td><p>1-2 CU</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td><p>4-8 CU</p></td>
     <td><p>4</p></td>
   </tr>
   <tr>
     <td><p>12-64 CU</p></td>
     <td><p>8</p></td>
   </tr>
   <tr>
     <td><blockquote>  <p>64 CU</p></blockquote></td>
     <td><p>16</p></td>
   </tr>
</table>

### Rate limit{#rate-limit}

Zilliz Cloud also imposed rate limits on collection operations, including creating, loading, releasing, and dropping collections. The following rate limit applies to collections in both Serverless and Dedicated clusters.

<table>
   <tr>
     <th></th>
     <th><p><strong>Rate Limit</strong></p></th>
   </tr>
   <tr>
     <td><p>Collection Operation  (create, load, release, drop)</p></td>
     <td><p>5 req/s per cluster</p></td>
   </tr>
</table>

## Operations{#operations}

This section focuses on the rate limit for common data operations in Zilliz Cloud clusters.

### Insert{#insert}

Each insert request/response should be no greater than **64** MB.

The rate limit that applies varies with the cluster types and the number of CUs in use. The following table lists the rate limits for insert operations.

<table>
   <tr>
     <th></th>
     <th><p>Maximum Insert Rate Limits</p></th>
   </tr>
   <tr>
     <td><p>Dedicated cluster [1 CU, 2 CUs]</p></td>
     <td><p>8 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster [4 CUs,  8 CUs]</p></td>
     <td><p>12 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster [12 CUs, 20 CUs]</p></td>
     <td><p>16 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster [24 CUs, 64 CUs)</p></td>
     <td><p>24 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster [64 CUs, 128CUs)</p></td>
     <td><p>36 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster [128 CUs, 256CUs)</p></td>
     <td><p>48 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster &gt;= 256 CUs</p></td>
     <td><p>64 MB/s</p></td>
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
     <th><p>Maximum Upsert Rate Limits</p></th>
   </tr>
   <tr>
     <td><p>Dedicated cluster [1 CU, 2 CUs]</p></td>
     <td><p>8 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster [4 CUs,  8 CUs]</p></td>
     <td><p>12 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster [12 CUs, 20 CUs]</p></td>
     <td><p>16 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster [24 CUs, 64 CUs)</p></td>
     <td><p>24 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster [64 CUs, 128CUs)</p></td>
     <td><p>36 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster [128 CUs, 256CUs)</p></td>
     <td><p>48 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster &gt;= 256 CUs</p></td>
     <td><p>64 MB/s</p></td>
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

The rate limit for load requests is **5** req/s per cluster.

<Admonition type="info" icon="📘" title="Notes">

<p>You do not need to perform the load collection for collections that are already loaded, even if new data is coming into these collections.</p>

</Admonition>

### Search{#search}

Each search request/response should be no greater than **64** MB.

The number of query vectors that each search request carries (usually known as **nq**) varies with your subscription plan:

- For Free and Serverless clusters, the **nq** is no greater than **10**.

- For Dedicated clusters, the **nq** is no greater than **16,384**.

The number that each search response carries (usually known as **topK**) varies with your subscription plan:

- For Free and Serverless clusters, the **topK** is no greater than **1,024** entities in return.

- For Dedicated clusters, the **topK** is no greater than **16,384** entities in return.

### Query{#query}

Each query request/response should be no greater than **64** MB.

Each query response carries no more than 16,384 entities in return (usually known as **topK**).

### Delete{#delete}

Each delete request/response should be no greater than **64** MB.

The rate limit for delete requests is **0.5** MB/s per cluster.

### Drop{#drop}

The rate limit for drop requests is **5** req/s per cluster.

### Data import{#data-import}

You can have up to **10** running or pending import jobs in a collection.

Zilliz Cloud also imposes limits on the files to import on the web console.

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
     <td><p>10 GB</p></td>
   </tr>
</table>

For details, refer to [Storage Options](./data-import-storage-options) and [Format Options](./data-import-format-options).

## Backup on Console{#backup-on-console}

Manually created backups are permanently retained.

The maximum retention period for automatically created backups is 30 days. 

## Restore on Console{#restore-on-console}

You can restore a snapshot in the same region as the original cluster of the snapshot. The target cluster of the restoration should use the same CU type as the original one.

## IP Access List{#ip-access-list}

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>IP Address (CIDR)</p></td>
     <td><p>20</p></td>
     <td><p>You can add up to 20 IP addresses to the allow list.</p></td>
   </tr>
</table>

## Migration{#migration}

You can migrate data from other vendors to your Zilliz Cloud cluster, and the maximum number of collections per migration varies with the subscription plan for your Zilliz Cloud cluster.

<table>
   <tr>
     <th><p>Subscription Plan of the Target Cluster</p></th>
     <th><p>Maximum Number of Collections Per Migration</p></th>
   </tr>
   <tr>
     <td><p>Free</p></td>
     <td><p>5</p></td>
   </tr>
   <tr>
     <td><p>Serverless / Dedicated</p></td>
     <td><p>10</p></td>
   </tr>
</table>

## Pipelines | NEAR DEPRECATE{#pipelines}

### Number of pipelines{#number-of-pipelines}

The following table lists the limits on different types of pipelines you can create in a project.

<table>
   <tr>
     <th><p><strong>Pipeline Type</strong></p></th>
     <th><p><strong>Max. Number (Per Project)</strong></p></th>
   </tr>
   <tr>
     <td><p>Ingestion Pipeline</p></td>
     <td><p>100</p></td>
   </tr>
   <tr>
     <td><p>Deletion Pipeline</p></td>
     <td><p>100</p></td>
   </tr>
   <tr>
     <td><p>Search Pipeline</p></td>
     <td><p>100</p></td>
   </tr>
</table>

### Ingestion{#ingestion}

The following table lists the limits on customized chunk size supported in each embedding model.

<table>
   <tr>
     <th><p><strong>Embedding Model</strong></p></th>
     <th><p><strong>Chunk Size Range (Tokens）</strong></p></th>
   </tr>
   <tr>
     <td><p>zilliz/bge-base-en-v1.5</p></td>
     <td><p>20-500</p></td>
   </tr>
   <tr>
     <td><p>zilliz/bge-base-zh-v1.5</p></td>
     <td><p>20-500</p></td>
   </tr>
   <tr>
     <td><p>voyageai/voyage-2</p></td>
     <td><p>20-3,000</p></td>
   </tr>
   <tr>
     <td><p>voyageai/voyage-code-2</p></td>
     <td><p>20-12,000</p></td>
   </tr>
   <tr>
     <td><p>voyageai/voyage-large-2</p></td>
     <td><p>20-12,000</p></td>
   </tr>
   <tr>
     <td><p>openai/text-embedding-3-small</p></td>
     <td><p>250-8,191</p></td>
   </tr>
   <tr>
     <td><p>openai/text-embedding-3-large</p></td>
     <td><p>250-8,191</p></td>
   </tr>
</table>

The following table lists the limits on metadata fields generated by a PRESERVE function in an Ingestion Pipeline.

<table>
   <tr>
     <th></th>
     <th><p><strong>Max. Number</strong></p></th>
   </tr>
   <tr>
     <td><p>Number of metadata fields</p></td>
     <td><p>50</p></td>
   </tr>
   <tr>
     <td><p>The max_length of a VARCHAR field</p></td>
     <td><p>4,000</p></td>
   </tr>
</table>

The following table lists the limits on the number of chunks that are allowed to be ingested each time.

<table>
   <tr>
     <th><p><strong>Embedding Model</strong></p></th>
     <th><p><strong>Max. Chunks/Ingestion</strong></p></th>
   </tr>
   <tr>
     <td><p>zilliz/bge-base-en-v1.5</p></td>
     <td><p>3,500</p></td>
   </tr>
   <tr>
     <td><p>voyageai/voyage-2</p></td>
     <td><p>6,000</p></td>
   </tr>
   <tr>
     <td><p>voyageai/voyage-code-2</p></td>
     <td><p>6,000</p></td>
   </tr>
   <tr>
     <td><p>openai/text-embedding-3-small</p></td>
     <td><p>6,000</p></td>
   </tr>
   <tr>
     <td><p>openai/text-embedding-large</p></td>
     <td><p>6,000</p></td>
   </tr>
   <tr>
     <td><p>zilliz/bge-base-zh-v1.5</p></td>
     <td><p>3,500</p></td>
   </tr>
</table>

### Pipeline usage{#pipeline-usage}

<table>
   <tr>
     <th></th>
     <th><p><strong>Max. Usage</strong></p></th>
   </tr>
   <tr>
     <td><p>Each organization</p></td>
     <td><p>$20/month</p></td>
   </tr>
</table>

### Token usage{#token-usage}

The following table lists the limits on token usage.

<table>
   <tr>
     <th><p><strong>Pipeline Type</strong></p></th>
     <th><p><strong>Embedding Model</strong></p></th>
     <th><p><strong>Max. Token Usage</strong></p></th>
   </tr>
   <tr>
     <td rowspan="2"><p>Ingestion Pipeline</p></td>
     <td><p>openai/text-embedding-3-small &amp; openai/text-embedding-3-large</p></td>
     <td><p>80,000,000</p></td>
   </tr>
   <tr>
     <td><p>Others</p></td>
     <td><p>100,000,000</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>Search Pipeline</p></td>
     <td><p>openai/text-embedding-3-small &amp; openai/text-embedding-3-large</p></td>
     <td><p>30,000,000</p></td>
   </tr>
   <tr>
     <td><p>Others</p></td>
     <td><p>20,000,000</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>All Pipelines in an Organization</p></td>
     <td><p>openai/text-embedding-3-small &amp; openai/text-embedding-3-large</p></td>
     <td><p>150,000,000</p></td>
   </tr>
   <tr>
     <td><p>Others</p></td>
     <td><p>200,000,000</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>For the maximum token usage of all pipelines in an organization, the token usage of a dropped pipeline is still included in the overall count.</p>

</Admonition>

