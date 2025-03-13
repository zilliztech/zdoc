---
displayed_sidbar: nodeSidebar
title: "releasePartitions() | Node.js"
slug: /node/node/Partitions-releasePartitions
sidebar_label: "releasePartitions()"
beta: false
notebook: false
description: "This operation releases the partitions in a specified collection from memory. | Node.js"
type: docx
token: Sqoed1lkwo8umixJJO1cvKIxnZc
sidebar_position: 8
keywords: 
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - releasePartitions()
  - nodejs25
  - Recommender systems
  - information retrieval
  - dimension reduction
  - hnsw algorithm
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# releasePartitions()

This operation releases the partitions in a specified collection from memory.

```javascript
releasePartitions(data): Promise<ResStatus>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.releasePartitions({
    db_name: string,
    collection_name: string,
    partition_names: string[],
    timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing collection.

- **partition_names** (*string[]*) -

    **[REQUIRED]**

    A list of the names of the partitions to release.

- **timeout** (*number*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\<ResStatus>*

This method returns a promise that resolves to a **ResStatus** object.

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    A code that indicates the operation result. It remains **0** if this operation succeeds.

- **error_code** (*string* | *number*) -

    An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

- **reason** (*string*) - 

    The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example{#example}

```java
new milvusClient(MILUVS_ADDRESS).releasePartitions({
    collection_name: 'my_collection',
    partition_names: ['my_partition'],
 });
```

