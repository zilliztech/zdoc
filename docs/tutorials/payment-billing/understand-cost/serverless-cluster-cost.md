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
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - serverless
  - cost
  - billing
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings

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

Write costs measures the compute resources consumed by [insert, upsert, and delete operations](./insert-update-delete).

Import and bulk insert operations do **not** incur costs.

### Cost calculation\{#cost-calculation}

```bash
Vector Database Cost (Write) = vCU Unit Price x Write vCU Usage 
```

- **vCU Unit Price:** $4 per million vCUs.

- **Write vCU Usage:** Calculated based on the data size involved in write operations.

### Example\{#example}

The table below provides a quick reference chart of vCU usage and costs for writing specific amounts of data into a Serverless cluster. 

For larger datasets, simply scale the vCU usage and cost proportionately. For example, writing 10 million 768-dimensional vectors would use approximately 7.5 million vCUs and cost around $30.

<table>
   <tr>
     <th><p><strong>Data Size (*)</strong></p></th>
     <th><p><strong>Write vCU usage (million)</strong></p></th>
     <th><p><strong>Write Cost</strong></p></th>
   </tr>
   <tr>
     <td><p>1 million 128-dim vectors</p></td>
     <td><p>0.125</p></td>
     <td><p>$0.5</p></td>
   </tr>
   <tr>
     <td><p>1 million 768-dim vectors</p></td>
     <td><p>0.75</p></td>
     <td><p>$3</p></td>
   </tr>
   <tr>
     <td><p>1 million 1536-dim vectors</p></td>
     <td><p>1.5</p></td>
     <td><p>$6</p></td>
   </tr>
   <tr>
     <td><p>1 million 2560-dim vectors</p></td>
     <td><p>2.5</p></td>
     <td><p>$10</p></td>
   </tr>
</table>

**The data size in the table above excludes scalars.*

**If your schema contains multiple vector fields, the write cost increases linearly. For example, if your schema has two 128-dimensional vector fields, the vCU usage for writing 1 million entities is 0.125 × 2 = 0.25, and the write cost is approximately &#36;0.5 × 2 = &#36;1.*

For a precise calculation of the write vCU usage and cost, please refer to the following metrics:

<table>
   <tr>
     <th><p><strong>Operation</strong></p></th>
     <th><p><strong>vCU Usage</strong></p></th>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>1 KB of inserted data = 0.25 vCU</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>1 deleted entity = 1 vCU</p><p>Deleting a non-existent entity will also consume 1 vCU.</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>Calculated based on the size of the data updated and the number of entities deleted.</p><p>Deleting a non-existent entity will also consume 1 vCU.</p></td>
   </tr>
</table>

Suppose you inserted 3 GB (3,145,728 KB) of entities into a Serverless cluster and then deleted 100,000 entities.

- `Insert operation vCU usage = 3,145,728 x 0.25 = 78,643 vCUs`

- `Delete operation vCU usage = 100,000 x 1 = 100,000 vCUs`

- `Total vCU usage = 1,000 + 78,643 = 178,643 vCUs`

- `Total vector database cost (write)  = 0.178643 x 4 = $0.72`

## Vector database costs (read)\{#vector-database-costs-read}

This cost item measures the resources consumed by [search, hybrid search, and query operations](./search-query-get). 

### Cost calculation\{#cost-calculation}

```bash
Vector Database Cost (Read) = vCU Unit Price x Read vCU Usage 
```

- **vCU Unit Price:** $4 per million vCUs

- **Read vCU Usage:** Depends on the following 3 factors.

    - The number of search or query requests: The more searches or queries you conduct, the higher the vCU usage.

    - The size of the data scanned in each search or query: The more data scanned, the higher the vCU usage.

        *Tips: During each search or query, Zilliz Cloud scans the whole collection in a cluster. If you use a [partition key](./use-partition-key) as a filter during a search or query, Zilliz Cloud will only scan part of the collection that matches the specified partition key, which can lower the overall read vCU usage.*

    - The size of the data returned in each search or query: The more data returned, the higher the vCU usage. For example, returning all fields including the vector field in a search will consume much more vCUs than a search that only returns the ID field.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Each read operation will cost a minimum of 6 vCUs.</p>

    </Admonition>

### Example\{#example}

The table below provides examples of vCU usage and costs for 1 million read requests on varying amounts of data:

<table>
   <tr>
     <th><p><strong>Scan Data Size (*)</strong></p></th>
     <th><p><strong>Read vCU Usage (million)</strong></p></th>
     <th><p><strong>Read Cost</strong></p></th>
   </tr>
   <tr>
     <td><p>1 million 128-dim vectors</p></td>
     <td><p>5</p></td>
     <td><p>$20</p></td>
   </tr>
   <tr>
     <td><p>1 million 768-dim vectors</p></td>
     <td><p>15</p></td>
     <td><p>$60</p></td>
   </tr>
   <tr>
     <td><p>5 million 768-dim vectors</p></td>
     <td><p>35</p></td>
     <td><p>$140</p></td>
   </tr>
   <tr>
     <td><p>10 million 768-dim vectors</p></td>
     <td><p>55</p></td>
     <td><p>$220</p></td>
   </tr>
   <tr>
     <td><p>1 million 1536-dim vectors</p></td>
     <td><p>25</p></td>
     <td><p>$100</p></td>
   </tr>
   <tr>
     <td><p>10 million 1536-dim vectors</p></td>
     <td><p>75</p></td>
     <td><p>$300</p></td>
   </tr>
   <tr>
     <td><p>100 million 1536-dim vectors</p></td>
     <td><p>290</p></td>
     <td><p>$1160</p></td>
   </tr>
   <tr>
     <td><p>10 billion 1536-dim vectors</p></td>
     <td><p>1,495</p></td>
     <td><p>$5980</p></td>
   </tr>
   <tr>
     <td><p>1 million 2560-dim vectors</p></td>
     <td><p>30</p></td>
     <td><p>$120</p></td>
   </tr>
</table>

**The data size in the table above excludes scalars.* 

In the table above, it can be noted that when the data size grow from 1 million to 10 million and even to 100 million, the vCU usage does not increase proportionately. 

## Storage cost\{#storage-cost}

Storage costs are charged separately from vector database costs and depend on:

- Cluster region, cluster type, and project plan

- Storage usage

For details, see [Storage](./storage-cost).

