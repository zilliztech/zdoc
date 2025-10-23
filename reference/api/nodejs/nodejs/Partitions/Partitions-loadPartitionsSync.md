---
title: "loadPartitionsSync() | Node.js"
slug: /node/node/Partitions-loadPartitionsSync
sidebar_label: "loadPartitionsSync()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation loads the data of specific partitions into memory. This is the synchronous function that helps to ensure that the specified partitions have been loaded. | Node.js"
type: docx
token: VGofdSRi0o6EagxNkokc9Iinndf
sidebar_position: 7
keywords: 
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - zilliz
  - zilliz cloud
  - cloud
  - loadPartitionsSync()
  - nodejs25
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# loadPartitionsSync()

This operation loads the data of specific partitions into memory. This is the synchronous function that helps to ensure that the specified partitions have been loaded.

```javascript
loadPartitionsSync(data): Promise<ResStatus>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.loadPartitionsSync({ 
    db_name: string,
    collection_name: string,
    refresh?: boolean,
    replica_number?: number,
    resource_groups?: string[],
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **&#91;REQUIRED&#93;**

    The name of an existing collection.

- **partition_names** (string&#91;&#93;) -

    **&#91;REQUIRED&#93;**

    A list of the names of the partitions to load.

- **replica_number** (*number*) -

    The number of replicas of the partition.

- **resource_groups** (*string&#91;&#93;*) -

    A list of the resource groups in the partition.

- **timeout** (*number*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\&lt;ResStatus&gt;*

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
new milvusClient(MILUVS_ADDRESS).loadPartitionsSync({
    collection_name: 'my_collection',
    partition_names: ['my_partition'],
 });
```

