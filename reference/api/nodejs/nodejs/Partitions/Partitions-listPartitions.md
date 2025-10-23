---
title: "listPartitions() | Node.js"
slug: /node/node/Partitions-listPartitions
sidebar_label: "listPartitions()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists the partitions in a specified collection. | Node.js"
type: docx
token: JNPwdFI1zoleD7x9LRIc0eqcnof
sidebar_position: 5
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - listPartitions()
  - nodejs25
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listPartitions()

This operation lists the partitions in a specified collection.

```javascript
listPartitions(data): Promise<ShowPartitionsResponse>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.listPartitions({
    db_name: string,
    collection_name: string,
    timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **&#91;REQUIRED&#93;**

    The name of an existing collection.

- **timeout** (*number*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\&lt;ShowPartitionsResponse&gt;*

This method returns a promise that resolves to a **ShowPartitionsResponse** object.

```javascript
{
    created_timestamps: string | list[string],
    created_utc_timestamps: string | list[string],
    partitionIDs: number | list[number],
    partition_names: string | list[string],
    status: object
}
```

**PARAMETERS:**

- **created_timestamps** (*string* | *list&#91;string&#93;*) -

    The timestamp indicating the creation time of the partition.

- **created_utc_timestamps** (*string* | *list&#91;string&#93;*) -

    The timestamp in UTC indicating the creation time of the partition.

- **partitionIDs** (*number* | *list&#91;number&#93;*) -

    A list of the IDs of the partitions.

- **partition_names** (*string* | *list&#91;string&#93;*) -

    A list of the names of the partitions.

- **status** (*object*) -

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

    - **reason** (*string*) - 

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example{#example}

```java
new milvusClient(MILUVS_ADDRESS).listPartitions({
    collection_name: 'my_collection',
 });
```

