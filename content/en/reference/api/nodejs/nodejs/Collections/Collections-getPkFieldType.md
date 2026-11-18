---
title: "getPkFieldType() | Node.js"
slug: /node/node/Collections-getPkFieldType
sidebar_label: "getPkFieldType()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the primary key field's data type for a collection. This is a convenient method that describes the collection and extracts the primary key field type. | Node.js"
type: docx
token: AKpldMJPTo6MfuxxrpicBKRInCh
sidebar_position: 27
keywords: 
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - zilliz
  - zilliz cloud
  - cloud
  - getPkFieldType()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# getPkFieldType()

This operation returns the primary key field's data type for a collection. This is a convenient method that describes the collection and extracts the primary key field type.

```javascript
await milvusClient.getPkFieldType(data: DescribeCollectionReq)
```

## Request Syntax\{#request-syntax}

```javascript
getPkFieldType({
    collection_name: string,
    db_name?: string,
    cache?: boolean,
    timeout: number
})
```

**PARAMETERS:**

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of the collection.

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **cache** (*boolean*) -

    Whether to use the cached description of the collection. Optional.

- **timeout** (*number*) -

    RPC timeout in milliseconds. Optional.

**RETURNS:**

*Promise\<keyof typeof DataType\\>*

The data type of the primary key field (e.g., `"Int64"`, `"VarChar"`). See [DataType](./Collections-DataType).


**EXCEPTIONS:**

- **Error**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const pkType = await client.getPkFieldType({
    collection_name: 'my_collection',
});
console.log(pkType); // e.g., "Int64"
```

