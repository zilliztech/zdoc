---
title: "getPartitionStatistics() | Node.js"
slug: /node/node/Partitions-getPartitionStatistics
sidebar_label: "getPartitionStatistics()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation displays the statistics collected on a specific partition. | Node.js"
type: docx
token: XDXid6aZ8oCHnVxxFpPcKAB9n0c
sidebar_position: 3
keywords: 
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - zilliz
  - zilliz cloud
  - cloud
  - getPartitionStatistics()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getPartitionStatistics()

This operation displays the statistics collected on a specific partition.

```javascript
await milvusClient.getPartitionStatistics(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getPartitionStatistics({
    db_name: string,
    collection_name: string,
    partition_name: string,
    timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing collection.

- **partition_name** (*string*) -

    **[REQUIRED]**

    The name of an existing partition.

- **timeout** (*number*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise&lt;StatisticsResponse&gt;*

This method returns a promise that resolves to a **StatisticsResponse** object.

```typescript
{
    stats: KeyValuePair[],
    data: { [x: string]: any },
    status:  ResStatus
}
```

**PARAMETERS:**

- **stats** (*KeyValuePair[]*) -
The raw statistics list returned by Milvus. Each entry has a **key** (for example, **row_count**) and a **value** as a string.

- **data** (*Record&lt;string, any&gt;*) -
A flattened, key-indexed view of **stats** for convenience. For example, `data.row_count` returns the partition row count as a string.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```java
new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
}).getPartitionStatistics({
    collection_name: 'my_collection',
    partition_name: "_default",
 });
```

