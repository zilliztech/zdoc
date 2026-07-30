---
title: "Zilliz Cloud Limits | Cloud"
slug: /limits
sidebar_label: "Zilliz Cloud Limits"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page provides information about limits on the Zilliz Cloud platform. Submit a request to us if you need to report issues related to these limits. | Cloud"
type: origin
token: PuxkwMWvbiHxvTkHsVkcMZP9n5f
sidebar_position: 18
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud Limits

This page provides information about limits on the Zilliz Cloud platform. [Submit a request](https://support.zilliz.com/hc/en-us) to us if you need to report issues related to these limits.

## Organizations & Projects\{#organizations-and-projects}

The following table lists the limits on the maximum number of orgsanizations and projects allowed for a single user.

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| Organization | 1 | Zilliz Cloud automatically creates 1 organization upon successful account registration. If you need more organizations, please [create a support ticket](http://support.zilliz.com). A user can join multiple organizations. |
| Project | 100 | Each user can create up to 100 projects in 1 organization. |

## Users & Roles\{#users-and-roles}

The following table lists the limits on the maximum number of users and roles allowed in Zilliz Cloud.

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| Organization User | 100 | An organization can have up to 100 organization users in total. |
| Cluster User | 500 | A cluster can have up to 500 users in total. |
| Cluster Custom Role | 500 | A cluster can have up to 500 custom roles in total. [Contact us](http://support.zilliz.com) to remove this limit. |

## API Keys\{#api-keys}

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| API Key | 100 | Each organization can contain a maximum of 100 customized API keys for optimal resource utilization and security. |

## Console IP Allowlist\{#console-ip-allowlist}

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| IPs in the organization console IP allowlist | 100 | Each organization console IP allowlist can contain a maximum of 100 IPs or CIDR blocks. |

## Volumes\{#volumes}

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| Managed volume | 100 | Each organization can contain a maximum of 100 managed volumes. |
| External volume | 100 | Each organization can contain a maximum of 100 external volumes. |

## Clusters\{#clusters}

### Number of clusters\{#number-of-clusters}

The maximum number of clusters varies with your payment method and deployment option.

- **Without a valid payment method**

    | **Cluster Deployment Option** | **Max Number** | **Remarks** |
    | --- | --- | --- |
    | Free | 1 | Only 1 Free cluster is allowed in each organization. You can drop an existing Free cluster and replace it with a new one if required. |
    | Serverless/Dedicated | 1 | You can only created 1 Serverless/Dedicated cluster during the free trial. If you would like additional clusters, please add a payment method. |

- **With a valid payment method**

    | **Cluster Deployment Option** | **Max Number** | **Remarks** |
    | --- | --- | --- |
    | Serving - Free | 1 | Only 1 Free cluster is allowed in each organization. You can drop an existing Free cluster and replace it with a new one if required. |
    | Serving - Serverless | 100 | You can only create up to 100 Serverless clusters in each project. |
    | Serving - Dedicated | 100 | You can only create up to 100 Dedicated clusters in each project. |
    | On-demand | 20 | You can only create up to 20 on-demand clusters in each project. |

### CUs\{#cus}

A CU is the basic unit of compute resources used for parallel processing of data, and different CU types comprise varying combinations of CPU, memory, and storage. The concept of CU only applies to Dedicated clusters.

| **Project Plan & Cluster Deployment Option** | **Limits** | **Remarks** |
| --- | --- | --- |
| Dedicated serving cluster in a Standard project | CU size &lt;=32 | On the console, you can create up to 32 CUs for a single cluster. |
| Dedicated serving cluster in an Enterprise project | CU size x Replica Count &lt;=204,800 | On the console, you can create up to 2,048 CUs for a single cluster.<br/>However, the limit is CU size x Replica Count &lt;=204,800 if replicas are added. |
| On-demand cluster in an Enterprise project | 8&lt;= CU size &lt;= 256 | On the console, a single on-demand cluster supports 8 to 256 CUs.<br/>Every 8 CU enables searches across up to 3 TB of data. |

You are welcome to [contact us](https://support.zilliz.com/hc/en-us) 

- If your Dedicated clusters in a Standard project require more than 32 CUs

- If your Dedicated clusters in an Enterprise project require more than 1,024 CUs

### vCUs\{#vcus}

A virtual compute unit (vCU) is used to measure the resources consumed by read operations (such as search and query) and write operations (such as insert, upsert, and delete). The concept of vCU only applies to Free and Serverless clusters.

| **Cluster Plan** | **Limits** |
| --- | --- |
| Free | 2.5 million vCUs per month |
| Serverless | N/A |

### Capacity\{#capacity}

The following table lists the limits on the capacity of each type of cluster plan.

| **Cluster Plan** | **Limits** |
| --- | --- |
| Free | 5 GB per cluster (equivalent to 1 million 768-dim vectors per cluster) |
| Serverless | Serverless clusters in Zilliz Cloud have no capacity limits. |
| Dedicated (per CU) | Dedicated clusters in Zilliz Cloud have no capacity limits. |

<Admonition type="info" icon="📘" title="Notes">

The upper limits for dedicated cluster capacity depend on the CU type and size used. If your cluster's capacity is not enough, consider adjusting the CU type and size. For details, see [Plan Cluster Scaling](./plan-cluster-scaling).

</Admonition>

## Replicas\{#replicas}

To add replicas, the cluster must have **at least 8 CUs**. The following limit applies as well.

| **Item** | **Limits** | **Remarks** |
| --- | --- | --- |
| Replica | 100 | You can create a maximum of 100 replicas. |
| Query CU x Replica Count | 204,800 | The cluster replica x query CU should not exceed 204,800. |

<Admonition type="info" icon="📘" title="Notes">

For certain clusters compatible with earlier Milvus releases, you may need at least 12 CUs to add replicas. 

To add replicas for clusters with fewer query CUs, [contact us](https://support.zilliz.com/hc/en-us).

</Admonition>

## Databases\{#databases}

- Each Serving-Dedicated cluster can have up to 1024 databases.

- You can create up to 64 on-demand compute databases per project per region.

- Default database cannot be dropped.

## Collections\{#collections}

The maximum number of collections and partitions in a Zilliz Cloud cluster varies with the number of CUs allocated to it and its compatible Milvus version. You can refer to the following descriptions and calculate the maximum number of collections and partitions in your cluster.

You can create a maximum of **1,024** collections or **4,096** partitions per CU, with up to **1,024** partitions allowed per collection. You can use the following formulae to calculate the upper limits for the number of collections and partitions in a cluster:

![I1aJwA2LShihxQbyG30cFm14ngf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/I1aJwA2LShihxQbyG30cFm14ngf.png)

- The total number of collections in a cluster should be less than 1,024 times the number of CUs in the cluster or 16,384, whichever is lower.

- The total number of partitions across all collections in a cluster should be less than 4,096 times the number of CUs allocated to the cluster or 65,536, whichever is lower.

- Both conditions must be met.

<Admonition type="info" icon="📘" title="Notes">

For **Free** and **Serverless** clusters, the following limits apply instead:

- A **Free** cluster allows a maximum of **5** collections, while

- A **Serverless** cluster supports up to **100** collections.

</Admonition>

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
     <td><ul><li><p>Free & Serverless: 4</p></li><li><p>Dedicated: 10</p></li></ul></td>
   </tr>
</table>

Other limits on fields:

- Some fields, such as VarChar or JSON, use more memory than expected and can cause the cluster to become full.

### Dimensions\{#dimensions}

The maximum number of dimensions of a vector field is **32,768**.

### Shards\{#shards}

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

|  | **Rate Limit** |
| --- | --- |
| Collection DDL Operation<br/>(create, load, release, drop) | 20 req/s per cluster |
| Partition DDL Operation<br/>(create, load, release, drop) | 20 req/s per cluster |

## Operations\{#operations}

This section focuses on the rate limit for common data operations in Zilliz Cloud clusters.

### Insert and Upsert\{#insert-and-upsert}

The rate limit for insert and upsert operations depends on the cluster deployment option and the number of CUs in use. 

|  | Maximum Insert and Upsert Rate Limits |
| --- | --- |
| Free cluster | 2 MB/s |
| Serverless cluster | 10 MB/s |
| Dedicated cluster | 16 MB/s + 1 MB/s × CU<br/>Up to 256 MB/s at most. |

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

| **Field Type** | **Index Type** | **Metric Type** |
| --- | --- | --- |
| Vector Field | AUTOINDEX | L2, IP, and COSINE |
| VarChar Field | TRIE | N/A |
| Int8/16/32/64 | STL_SORT | N/A |
| Float32/64 | STL_SORT | N/A |

### Flush\{#flush}

The rate limit for flush requests is 0.1 requests per second, imposed at the collection level for specific cluster types. This rate limit applies to:

- Serverless clusters compatible with Milvus v2.4.x or later.

- Dedicated clusters upgraded to the beta version, compatible with Milvus v2.4.x or later.

<Admonition type="info" icon="📘" title="Notes">

You are not advised to perform flush operations manually. Zilliz Cloud clusters handle it gracefully for you.

</Admonition>

### Load\{#load}

The rate limit for load requests is **20** req/s per cluster.

<Admonition type="info" icon="📘" title="Notes">

You do not need to perform the load collection for collections that are already loaded, even if new data is coming into these collections.

</Admonition>

### Search\{#search}

Each search request/response should be no greater than **64** MB.

The number of query vectors that each search request carries (usually known as **nq**) varies with your subscription plan:

- For Free and Serverless clusters, the **nq** is no greater than **10**.

- For Dedicated clusters, the **nq** is no greater than **16,384**.

The number that each search response carries (usually known as **topK**) varies with your subscription plan:

- For Free and Serverless clusters, the **topK** is no greater than **1,024** entities in return.

- For Dedicated clusters, the **topK** is no greater than **16,384** entities in return.

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

| File Type | Local upload | From Object Storage |
| --- | --- | --- |
| JSON | 1 GB | **Free**: Each import request can import up to 1 GB of data, with a maximum of 1 GB per file, and no more than 1,000 files per import.<br/>**Serverless & Dedicated**: The maximum total import size is 1 TB and the maximum size of each file is 10 GB with up to 1,000 files. |
| Parquet | 1 GB | **Free**: Each import request can import up to 1 GB of data, with a maximum of 1 GB per file, and no more than 1,000 files per import.<br/>**Serverless & Dedicated**: The maximum total import size is 1 TB and the maximum size of each file is 10 GB with up to 1,000 files. |
| Numpy | Not support | **Free**: Each import request can import up to 1 GB of data, with a maximum of 1 GB per subdirectory, and no more than 1,000 subdirectories per import.<br/>**Serverless & Dedicated**: The maximum total import size is 1 TB and the maximum size of each subdirectory is 10 GB with up to 1,000 subdirectories. |

For details, refer to [Storage Options](./data-import-storage-options) and [Format Options](./data-import-format-options).

## Backup on Console\{#backup-on-console}

Manually created backups are permanently retained.

The maximum retention period for automatically created backups is 30 days. 

## Restore on Console\{#restore-on-console}

You can restore a backup file in the same region as the original cluster of the backup file. The target cluster of the restoration should use the same CU type as the original one.

## IP Access List\{#ip-access-list}

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| Console IP Access | 100 | You can add up to 100 IP addresses to the console IP allowlist. |
| Cluster IP Access | 100 | You can add up to 100 IP addresses to the cluster IP allowlist. |

## Migration\{#migration}

You can migrate data from other vendors to your Zilliz Cloud cluster, and the maximum number of collections per migration varies with the subscription plan for your Zilliz Cloud cluster.

| Subscription Plan of the Target Cluster | Maximum Number of Collections Per Migration |
| --- | --- |
| Free | 5 |
| Serverless / Dedicated | 10 |

## Private Endpoints\{#private-endpoints}

| **Item** | **Max Number** | **Remarks** |
| --- | --- | --- |
| Private Endpoint | 10 | You can create up to 10 private endpoints per project. |



import DocCardList from '@theme/DocCardList';

<DocCardList />