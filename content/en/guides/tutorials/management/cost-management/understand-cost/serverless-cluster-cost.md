---
title: "Serverless Cluster Cost | Cloud"
slug: /serverless-cluster-cost
sidebar_label: "Serverless Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Serverless clusters in Zilliz Cloud use a pay-per-operation model, where you are mainly charged for the resources consumed by your read and write operations. This ensures you only pay for the actual workload processed, without the need to provision fixed capacity in advance. | Cloud"
type: origin
token: Uk0Nw1ZdbiOEBtkAOKacLTf8nGe
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Serverless Cluster Cost

Serverless clusters in Zilliz Cloud use a pay-per-operation model, where you are mainly charged for the resources consumed by your read and write operations. This ensures you only pay for the actual workload processed, without the need to provision fixed capacity in advance.

The total cost of a Serverless cluster is the sum of the following components:

- Vector database costs for both [read](./serverless-cluster-cost#vector-database-costs-read) and [write](./serverless-cluster-cost#vector-database-costs-write) operations

- [Storage costs](./serverless-cluster-cost#storage-cost)

In addition to the two primary billing items above, the following optional add-on charges may apply:

- [Data transfer cost](./data-transfer-cost)

- [Audit log cost](./audit-log-cost)

## Vector database costs (write)\{#vector-database-costs-write}

Write costs measure the compute resources consumed by [insert](./insert-entities), [upsert](./upsert-entities), and [delete](./delete-entities) operations.

Import and bulk insert operations do **not** incur costs.

### Cost calculation\{#cost-calculation}

```bash
Vector Database Cost (Write) = vCU Unit Price x Write vCU Usage 
```

- **vCU Unit Price:** &#36;4 per million vCUs.

- **Write vCU Usage:** Calculated based on the data size involved in write operations.

### Example\{#example}

The table below provides a quick reference chart of vCU usage and costs for writing specific amounts of data into a Serverless cluster. 

For larger datasets, simply scale the vCU usage and cost proportionately. For example, writing 10 million 768-dimensional vectors would use approximately 7.5 million vCUs and cost around &#36;30.

| **Data Size (&ast;)** | **Write vCU usage (million)** | **Write Cost** |
| --- | --- | --- |
| 1 million 128-dim vectors | 0.125 | &#36;0.5 |
| 1 million 768-dim vectors | 0.75 | &#36;3 |
| 1 million 1536-dim vectors | 1.5 | &#36;6 |
| 1 million 2560-dim vectors | 2.5 | &#36;10 |

*&ast;The data size in the table above excludes scalars.*

*&ast;If your schema contains multiple vector fields, the write cost increases linearly. For example, if your schema has two 128-dimensional vector fields, the vCU usage for writing 1 million entities is 0.125 × 2 = 0.25, and the write cost is approximately &#36;0.5 × 2 = &#36;1.*

For a precise calculation of the write vCU usage and cost, please refer to the following metrics:

| **Operation** | **vCU Usage** |
| --- | --- |
| Insert | 1 KB of inserted data = 0.25 vCU |
| Delete | 1 vCU per entity. When deleting by primary key, each primary key in the request costs 1 vCU, even if no entity with that key exists. When deleting by filter expression, only the entities that match are counted. |
| Upsert | Calculated based on the size of the data updated and the number of entities deleted.<br/>Deleting a non-existent entity will also consume 1 vCU.<br/>Upsert vCU usage = data KB x 0.25 + 1 vCU per upserted entity (whether or not the primary key already exists). For example, upserting 1 million 128-dim vectors uses about 0.125 + 1 = 1.125 million vCUs (&#36;4.50), compared with 0.125 million vCUs (&#36;0.50) to insert them. A partial upsert (partial_update) is still charged 1 vCU per entity. |

*&ast;Data size is the size of the write request after the SDK or RESTful API encodes it, where 1 KB = 1,024 bytes. Usage is calculated per request and rounded up to the next whole vCU, so every write request costs at least 1 vCU. Batching rows into larger requests avoids this rounding overhead. RESTful API requests are charged the same as SDK (gRPC) requests for the same data, even though the JSON body is larger.*

Suppose you inserted 3 GB (3,145,728 KB) of entities into a Serverless cluster and then deleted 100,000 entities.

- `Insert operation vCU usage = 3,145,728 x 0.25 = 786,432 vCUs`

- `Delete operation vCU usage = 100,000 x 1 = 100,000 vCUs`

- `Total vCU usage = 100,000 + 786,432 = 886,432 vCUs`

- `Total vector database cost (write)  = 0.886432 x 4 = $3.55`

## Vector database costs (read)\{#vector-database-costs-read}

This cost item measures the resources consumed by [search](./single-vector-search), [hybrid search](./hybrid-search), and [query](./get-and-scalar-query) operations. 

### Cost calculation\{#cost-calculation}

```bash
Vector Database Cost (Read) = vCU Unit Price x Read vCU Usage 
```

- **vCU Unit Price:** &#36;4 per million vCUs

- **Read vCU Usage:** Depends on the following 3 factors.

    - The number of search or query requests: The more searches or queries you conduct, the higher the vCU usage.

    - The size of the data scanned in each search or query: The more data scanned, the higher the vCU usage.

        *Tips: During each search or query, Zilliz Cloud scans the whole collection in a cluster. If you use a [partition key](./use-partition-key) as a filter during a search or query, Zilliz Cloud will only scan part of the collection that matches the specified partition key, which can lower the overall read vCU usage.*

    - The size of the data returned in each search or query: The more data returned, the higher the vCU usage. For example, returning all fields including the vector field in a search will consume much more vCUs than a search that only returns the ID field.

    <Admonition type="info" title="Notes">

    Each read operation will cost a minimum of 6 vCUs.

    </Admonition>

### Example\{#example}

The table below provides examples of vCU usage and costs for 1 million read requests on varying amounts of data:

| **Scan Data Size (&ast;)** | **Read vCU Usage (million)** | **Read Cost** |
| --- | --- | --- |
| 1 million 128-dim vectors | 5 | &#36;20 |
| 1 million 768-dim vectors | 15 | &#36;60 |
| 5 million 768-dim vectors | 35 | &#36;140 |
| 10 million 768-dim vectors | 55 | &#36;220 |
| 1 million 1536-dim vectors | 25 | &#36;100 |
| 10 million 1536-dim vectors | 75 | &#36;300 |
| 100 million 1536-dim vectors | 290 | &#36;1160 |
| 10 billion 1536-dim vectors | 1,495 | &#36;5980 |
| 1 million 2560-dim vectors | 30 | &#36;120 |

*&ast;The data size in the table above excludes scalars.* 

In the table above, it can be noted that when the data size grow from 1 million to 10 million and even to 100 million, the vCU usage does not increase proportionately. 

## Storage cost\{#storage-cost}

Storage costs are charged separately from vector database costs and depend on:

- Cluster region, cluster type, and project plan

- Storage usage

For details, see [Storage](./storage-cost).

