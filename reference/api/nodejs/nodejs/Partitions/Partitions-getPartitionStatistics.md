---
title: "getPartitionStatistics() | Node.js"
slug: /node/node/Partitions-getPartitionStatistics
sidebar_label: "getPartitionStatistics()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation displays the statistics collected on a specific partition. | Node.js"
type: docx
token: XDXid6aZ8oCHnVxxFpPcKAB9n0c
sidebar_position: 3
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - getPartitionStatistics()
  - nodejs26
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getPartitionStatistics()

This operation displays the statistics collected on a specific partition.

```javascript
getPartitionStatistics(data): Promise<StatisticsResponse>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.getPartitionStatistics({
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

**RETURNS** *Promise\<StatisticsResponse>*

This method returns a promise that resolves to a **StatisticsResponse** object.

```javascript
{
    data: string,
    stats:string,
    status: object
}
```

**PARAMETERS:**

- **data** (*string*) -

    The partition statistics.

- **stats** (*string*) -

    The number of rows in the partition.

- **status** (*object*) -

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

    - **reason** (*string*) - 

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```java
new milvusClient(MILUVS_ADDRESS).getPartitionStatistics({
    collection_name: 'my_collection',
    partition_name: "_default",
 });
```

