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
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Max number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>Organization</p></td>
     <td><p>1</p></td>
     <td><p>Each user can create only one organization.</p></td>
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

## Clusters & CUs{#clusters-and-cus}

The maximum number of clusters and CUs varies with your payment method and subscription plan.

- **Without a valid payment method**

    <table>
       <tr>
         <th><p><strong>Subscription Plan</strong></p></th>
         <th><p><strong>Max number</strong></p></th>
         <th><p><strong>Remarks</strong></p></th>
       </tr>
       <tr>
         <td><p>Free</p></td>
         <td><p>1</p></td>
         <td><p>Only 1 cluster is available for the Free cluster plan. You can drop an existing cluster and replace it with a new one if required.</p></td>
       </tr>
       <tr>
         <td><p>Serverless</p></td>
         <td><p>1</p></td>
         <td><p>The trial Serverless cluster plan offers only 1 cluster. If you would like additional clusters, please provide payment.</p></td>
       </tr>
       <tr>
         <td><p>Dedicated (Standard)</p></td>
         <td><p>1</p></td>
         <td><p>The trial Dedicated (Standard) cluster plan offers only 1 cluster. If you would like additional clusters, please provide payment.</p></td>
       </tr>
       <tr>
         <td><p>Dedicated (Enterprise)</p></td>
         <td><p>0</p></td>
         <td></td>
       </tr>
    </table>

- **With a valid payment method**

    <table>
       <tr>
         <th><p><strong>Subscription Plan</strong></p></th>
         <th><p><strong>Limits</strong></p></th>
         <th><p><strong>Remarks</strong></p></th>
       </tr>
       <tr>
         <td><p>Dedicated (Standard)</p></td>
         <td><p>32 CUs</p></td>
         <td><p>On the console, you can create up to 32 CUs for a single cluster.</p></td>
       </tr>
       <tr>
         <td><p>Dedicated (Enterprise)</p></td>
         <td><p>256 CUs</p></td>
         <td><p>On the console, you can create up to 256 CUs for a single cluster.</p></td>
       </tr>
    </table>

You are welcome to [contact us](https://support.zilliz.com/hc/en-us) 

- If one of your Dedicated (Standard)clusters needs more than 32 CUs or,

- If all your Dedicated (Enterprise) Clusters require more than 256 CUs.

## Pipelines{#pipelines}

### Number of pipelines{#number-of-pipelines}

The following table lists the limits on different types of pipelines you can create in a project.

<table>
   <tr>
     <th><p><strong>Pipeline Type</strong></p></th>
     <th><p><strong>Max. Number (Per Project)</strong></p></th>
   </tr>
   <tr>
     <td><p>Ingestion Pipeline</p></td>
     <td><p>10</p></td>
   </tr>
   <tr>
     <td><p>Deletion Pipeline</p></td>
     <td><p>10</p></td>
   </tr>
   <tr>
     <td><p>Search Pipeline</p></td>
     <td><p>10</p></td>
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

## Collections{#collections}

<table>
   <tr>
     <th><p><strong>Cluster Plan</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>Free cluster</p></td>
     <td><p>2</p></td>
     <td><p>You can create up to 2 collections.</p></td>
   </tr>
   <tr>
     <td><p>Serverless cluster</p></td>
     <td><p>10</p></td>
     <td><p>You can create up to 10 collections.</p></td>
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
     <td><p>Free cluster</p></td>
     <td><p>64</p></td>
     <td><p>You can create up to 64 partitions per collection in a free cluster.</p></td>
   </tr>
   <tr>
     <td><p>Serverless cluster</p></td>
     <td><p>64</p></td>
     <td><p>You can create up to 64 partitions per collection in a serverless cluster.</p></td>
   </tr>
   <tr>
     <td><p>Dedicated cluster</p></td>
     <td><p>4,096</p></td>
     <td><p>You can create up to 4,096 partitions per collection in a dedicated cluster.</p></td>
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
     <td><p>Free cluster</p></td>
     <td><p>2 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Serverless cluster</p></td>
     <td><p>100 MB/s</p></td>
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
     <td><p>Free cluster</p></td>
     <td><p>2 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Serverless cluster</p></td>
     <td><p>100 MB/s</p></td>
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

Zilliz Cloud provides free storage for backup snapshots for up to 30 days. 

## Restore on Console{#restore-on-console}

You can restore a snapshot in the same region as the original cluster of the snapshot. The target cluster of the restoration should use the same CU type as the original one.
