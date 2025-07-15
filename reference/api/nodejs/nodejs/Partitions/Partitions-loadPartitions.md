---
displayed_sidbar: nodeSidebar
title: "loadPartitions() | Node.js"
slug: /node/node/Partitions-loadPartitions
sidebar_label: "loadPartitions()"
beta: false
notebook: false
description: "This operation loads a specific set of partitions in a specified collection into memory. | Node.js"
type: docx
token: Pyh3dttWKoBqcBx8FGhcArhAnqg
sidebar_position: 6
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - loadPartitions()
  - nodejs25
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# loadPartitions()

This operation loads a specific set of partitions in a specified collection into memory.

```javascript
loadPartitions(data): Promise<ResStatus>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.loadPartitions({
    db_name: string,
    collection_name: string,
    partition_names: string[],
    replica_number?: number,
    resource_groups[]?: string[],
    timeout?: number
 });
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing collection.

- **partition_names** (string[]) -

    **[REQUIRED]**

    A list of the names of the partitions to load.

- **replica_number** (*number*) -

    The number of replicas of the partition.

- **resource_groups** (*string[]*) -

    A list of the resource groups in the partition.

- **timeout** (*number*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

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
new milvusClient(MILUVS_ADDRESS).loadPartitions({
    collection_name: 'my_collection',
    partition_names: ['my_partition'],
 });
```

