---
title: "createPartition() | Node.js"
slug: /node/node/Partitions-createPartition
sidebar_label: "createPartition()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a partition in the target collection. | Node.js"
type: docx
token: PPLtdSbtfomgF1x5MHncKPgPnSf
sidebar_position: 1
keywords: 
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - zilliz
  - zilliz cloud
  - cloud
  - createPartition()
  - nodejs26
  - IVF
  - knn
  - Image Search
  - LLMs
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createPartition()

This operation creates a partition in the target collection.

```javascript
createPartition(data): Promise<ResStatus>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.createPartition({
    db_name: string,
    collection_name: string,
    partition_name: string,
    timeout?: number
 });
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing collection.

- **partition_name** (*string*)

    **[REQUIRED]**

    The name of the partition to create.

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

## Example\{#example}

```java
new milvusClient(MILUVS_ADDRESS).createPartition({
    collection_name: 'my_collection',
    partition_name: 'my_partition',
 });
```

