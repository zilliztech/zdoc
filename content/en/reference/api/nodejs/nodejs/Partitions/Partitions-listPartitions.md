---
title: "listPartitions() | Node.js"
slug: /node/node/Partitions-listPartitions
sidebar_label: "listPartitions()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists the partitions in a specified collection. | Node.js"
type: docx
token: IvnLd6nXooRR6NxM9jdcDxCHnhh
sidebar_position: 5
keywords: 
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - zilliz
  - zilliz cloud
  - cloud
  - listPartitions()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listPartitions()

This operation lists the partitions in a specified collection.

```javascript
await milvusClient.listPartitions(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.listPartitions({
    db_name: string,
    collection_name: string,
    timeout?: number,
    type?: ShowPartitionsType
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing collection.

- **timeout** (*number*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

- **type** (*ShowPartitionsType*) - 

    Determines whether to list all partitions or only the loaded ones. A **ShowPartitionsType** has the following values:

    - **All** = 0

        Indicates that all partitions are to be listed.

    - **Loaded** = 1

        Indicates that only the loaded partitions are to be listed.

**RETURNS** *Promise&lt;ShowPartitionsResponse&gt;*

This method returns a promise that resolves to a **ShowPartitionsResponse** object.

```typescript
{
    partition_names: string[],
    partitionIDs: number[],
    data: PartitionData[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **partition_names** (*string[]*) -
A list of partition names defined on the collection.

- **partitionIDs** (*number[]*) -
The internal identifiers of the partitions, in the same order as **partition_names**.

- **data** (*PartitionData[]*) -
A flattened, per-partition view that bundles the name, identifier, creation timestamp, and load percentage.

    - **name** (*string*) -

        The partition name.

    - **id** (*string*) -

        The partition identifier.

    - **timestamp** (*string*) -

        The creation timestamp of the partition.

    - **loadedPercentage** (*string*) -

        The percentage of the partition that is currently loaded into memory.

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
}).listPartitions({
    collection_name: 'my_collection',
 });
```

