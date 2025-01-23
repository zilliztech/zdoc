---
displayed_sidbar: nodeSidebar
title: "dropPartition() | Node.js"
slug: /node/node/Partitions-dropPartition
sidebar_label: "dropPartition()"
beta: false
notebook: false
description: "This operation drops a specified partition from the current collection. | Node.js"
type: docx
token: BBmsddqZEozxWyxkoADcFfzpncW
sidebar_position: 2
keywords: 
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - zilliz
  - zilliz cloud
  - cloud
  - dropPartition()
  - nodejs25
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# dropPartition()

This operation drops a specified partition from the current collection.

```javascript
dropPartition(data): Promise<ResStatus>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.dropPartition({
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

- **partition_name** (*string*)

    **[REQUIRED]**

    The name of the partition to drop.

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
new milvusClient(MILUVS_ADDRESS).dropPartition({
    collection_name: 'my_collection',
    partition_name: 'my_partition',
 });
```

