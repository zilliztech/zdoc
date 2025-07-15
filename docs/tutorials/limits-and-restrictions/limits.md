---
title: "Zilliz Cloud Limits | Cloud"
slug: /limits
sidebar_label: "Zilliz Cloud Limits"
beta: FALSE
notebook: FALSE
description: "This page provides information about limits on the Zilliz Cloud platform. Submit a request to us if you need to report issues related to these limits. | Cloud"
type: origin
token: PuxkwMWvbiHxvTkHsVkcMZP9n5f
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - milvus
  - limits
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - what is milvus

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud Limits

This page provides information about limits on the Zilliz Cloud platform. [Submit a request](https://support.zilliz.com/hc/en-us) to us if you need to report issues related to these limits.

## Organizations & Projects{#organizations-and-projects}

The following table lists the limits on the maximum number of orgsanizations and projects allowed for a single user.

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>Organization</p></td>
     <td><p>1</p></td>
     <td><p>Zilliz Cloud automatically creates 1 organization upon successful account registration. If you need more organizations, please <a href="http://support.zilliz.com">create a support ticket</a>. A user can join multiple organizations.</p></td>
   </tr>
   <tr>
     <td><p>Project</p></td>
     <td><p>100</p></td>
     <td><p>Each user can create up to 100 projects in 1 organization.</p></td>
   </tr>
</table>

## Users & Roles{#users-and-roles}

The following table lists the limits on the maximum number of users allowed in Zilliz Cloud.

<table>
   <tr>
     <th><p><strong>Item</strong></p></th>
     <th><p><strong>Max Number</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>Organization User</p></td>
     <td><p>100</p></td>
     <td><p>An organization can have up to 100 organization users in total.</p></td>
   </tr>
   <tr>
     <td><p>Cluster User</p></td>
     <td><p>100</p></td>
     <td><p>A cluster can have up to 100 users in total.</p></td>
   </tr>
   <tr>
     <td><p>Cluster Custom Role</p></td>
     <td><p>20</p></td>
     <td><p>A cluster can have up to 20 custom roles in total. <a href="http://support.zilliz.com">Contact us</a> to remove this limit.</p></td>
   </tr>
</table>

## API Keys{#api-keys}

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

## Clusters{#clusters}

### Number of clusters{#number-of-clusters}

The maximum number of clusters varies with your payment method and subscription plan.

- **Without a valid payment method**

    <table>
       <tr>
         <th><p><strong>Cluster Plan</strong></p></th>
         <th><p><strong>Max number</strong></p></th>
         <th><p><strong>Remarks</strong></p></th>
       </tr>
       <tr>
         <td><p>Free</p></td>
         <td><p>1</p></td>
         <td><p>Only 1 cluster is available for the Free cluster plan. You can drop an existing cluster and replace it with a new one if required.</p></td>
       </tr>
       <tr>
         <td><p>Serverless/Dedicated (Standard)/Dedicated (Enterprise)</p></td>
         <td><p>1</p></td>
         <td><p>You can only created 1 paid cluster in the free trial. If you would like additional clusters, please add a payment method.</p></td>
       </tr>
    </table>

- **With a valid payment method**

    <table>
       <tr>
         <th><p><strong>Cluster Plan</strong></p></th>
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
         <td><p>N/A</p></td>
         <td><p>N/A</p></td>
       </tr>
       <tr>
         <td><p>Dedicated (Standard)/Dedicated (Enterprise)</p></td>
         <td><p>Total CU size &lt; 320</p></td>
         <td><p>The maximum number of clusters in an organization depends on the total amount of cluster CUs. The accumulated number of CUs for all Dedicated clusters in an organization should not exceed 320.</p></td>
       </tr>
    </table>

### CUs{#cus}

A CU is the basic unit of compute resources used for parallel processing of data, and different CU types comprise varying combinations of CPU, memory, and storage. The concept of CU only applies to Dedicated clusters.

<table>
   <tr>
     <th><p><strong>Cluster Plan</strong></p></th>
     <th><p><strong>Limits</strong></p></th>
     <th><p><strong>Remarks</strong></p></th>
   </tr>
   <tr>
     <td><p>Dedicated (Standard)</p></td>
     <td><p>CU size x Replica Count &lt;=32</p></td>
     <td><p>On the console, you can create up to 32 CUs for a single cluster. </p><p>However, the limit is CU size x Replica Count &lt;=32 if replicas are added.</p></td>
   </tr>
   <tr>
     <td><p>Dedicated (Enterprise)</p></td>
     <td><p>CU size x Replica Count &lt;=256</p></td>
     <td><p>On the console, you can create up to 256 CUs for a single cluster.</p><p>However, the limit is CU size x Replica Count &lt;=256 if replicas are added.</p></td>
   </tr>
</table>

You are welcome to [contact us](https://support.zilliz.com/hc/en-us) 

- If your Dedicated (Standard)clusters require more than 32 CUs

- If your Dedicated (Enterprise) clusters require more than 256 CUs

### vCUs{#vcus}

A virtual compute unit (vCU) is used to measure the resources consumed by read operations (such as search and query) and write operations (such as insert, upsert, and delete). The concept of vCU only applies to Free and Serverless clusters.

<table>
   <tr>
     <th><p><strong>Cluster Plan</strong></p></th>
     <th><p><strong>Limits</strong></p></th>
   </tr>
   <tr>
     <td><p>Free</p></td>
     <td><p>2.5 million vCUs per month</p></td>
   </tr>
   <tr>
     <td><p>Serverless</p></td>
     <td><p>N/A</p></td>
   </tr>
</table>

### Capacity{#capacity}

The following table lists the limits on the capacity of each type of cluster plan.

<table>
   <tr>
     <th><p><strong>Cluster Plan</strong></p></th>
     <th><p><strong>Limits</strong></p></th>
   </tr>
   <tr>
     <td><p>Free</p></td>
     <td><p>5 GB per cluster (equivalent to 1 million 768-dim vectors per cluster)</p></td>
   </tr>
   <tr>
     <td><p>Serverless</p></td>
     <td><p>100 million 768-dim vectors per partition</p></td>
   </tr>
   <tr>
     <td><p>Dedicated (per CU)</p></td>
     <td><p>Dedicated clusters in Zilliz Cloud have no capacity limits. Below is a quick reference for the capacities of Dedicated clusters with various CU types. For larger capacities, simply scale your Dedicated cluster. For details, refer to <a href="./scale-cluster">Scale Cluster</a>.</p><ul><li><p>Performance-optimized CU: 1.5 million 768-dim vectors per CU</p></li><li><p>Capacity-optimized CU: 5 million 768-dim vectors per CU</p></li><li><p>Extended-capacity CU: 20 million 768-dim vectors per CU</p></li></ul></td>
   </tr>
</table>

## Replicas{#replicas}

To add replicas, the cluster needs to have **8 CUs or more**. The following limit applies as well.

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
     <td><p>Replica count x CU size</p></td>
     <td><p>&lt;= 256</p></td>
     <td><p>The cluster CU size x Replica count should not exceed 256.</p></td>
   </tr>
</table>

## Databases{#databases}

- Databases can only be created in Dedicated clusters.

- Each Dedicated cluster can have up to 1024 databases.

- Default database cannot be dropped.

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

- The total number of collections in a cluster should be less than 1,024 times the number of CUs in the cluster or 16,384, whichever is lower.

- The total number of partitions across all collections in a cluster should be less than  4,096 times the number of CUs allocated to the cluster or 65,536, whichever is lower.

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
     <td><p>Collection Operation </p><p>(create, load, release, drop)</p></td>
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
     <td><p>Free cluster</p></td>
     <td><p>2 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Serverless cluster</p></td>
     <td><p>10 MB/s</p></td>
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
     <td><p>Free cluster</p></td>
     <td><p>2 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Serverless cluster</p></td>
     <td><p>10 MB/s</p></td>
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
     <td><p>Free: 512 MB</p><p>Serverless &amp; Dedicated: 1 TB</p></td>
   </tr>
   <tr>
     <td><p>Numpy</p></td>
     <td><p>Not support</p></td>
     <td><p>Free: 512 MB</p><p>Serverless &amp; Dedicated: The maximum size of the folder is 1 TB and the maximum size of each subdirectory is 10 GB</p></td>
   </tr>
   <tr>
     <td><p>Parquet</p></td>
     <td><p>Not support</p></td>
     <td><p>Free: 512 MB</p><p>Serverless &amp; Dedicated: 1 TB</p></td>
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
     <td><p>&#36;20/month</p></td>
   </tr>
</table>

