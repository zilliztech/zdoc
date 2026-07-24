---
title: "batchDescribeCollections() | Node.js"
slug: /node/node/Collections-batchDescribeCollections
sidebar_label: "batchDescribeCollections()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation retrieves schema and metadata for multiple collections in a single call. | Node.js"
type: docx
token: ByKKdHVcAojjyZxKK3PciOTVnQg
sidebar_position: 23
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - batchDescribeCollections()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# batchDescribeCollections()

This operation retrieves schema and metadata for multiple collections in a single call.

```typescript
await milvusClient.batchDescribeCollections(data: BatchDescribeCollectionReq)
```

## Request Syntax\{#request-syntax}

```typescript
await milvusClient.batchDescribeCollections({
    collection_names: string[],
    db_name?: string,
    collectionIDs?: number[],
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **collection_names** (*string[]*) -
**[REQUIRED]**
The names of the collections to describe.

- **db_name** (*string*) -
The name of the database. Optional.

- **collectionIDs** (*number[]*) -
The IDs of the collections to describe. Optional.

- **timeout** (*number*) -
An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -
A trace ID for request tracking. Optional.

**RETURNS** *Promise&lt;BatchDescribeCollectionResponse&gt;*

This method returns a promise that resolves to a **BatchDescribeCollectionResponse** object.

```typescript
{
    responses: DescribeCollectionResponse[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **responses** (*DescribeCollectionResponse[]*) -
An array containing the schema and metadata for every requested collection. Entries appear in the same order as the input collection names. For the full **DescribeCollectionResponse** field reference, refer to the `describeCollection()` doc.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.batchDescribeCollections({
    collection_names: ['collection1', 'collection2'],
});
```
