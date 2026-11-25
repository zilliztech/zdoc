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

---

# batchDescribeCollections()

This operation retrieves schema and metadata for multiple collections in a single call.

```javascript
await milvusClient.batchDescribeCollections(data: BatchDescribeCollectionReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.batchDescribeCollections({
    collection_names: string[],
    db_name?: string,
    collectionIDs?: number[],
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

<NextChannel action="exclude">

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

</NextChannel>

<NextChannel action="include">

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
An optional, caller-supplied ID for request tracking and log or trace correlation. The SDK sends it as the `client-request-id` gRPC metadata header and never generates one. Use a unique value per request, such as a UUID. A value in OpenTelemetry trace-ID form (32 lowercase hexadecimal characters) is also used by client telemetry as a trace ID.

</NextChannel>

**RETURNS:**

*Promise&lt;BatchDescribeCollectionResponse&gt;*

This method returns a promise that resolves to a **BatchDescribeCollectionResponse** object.

```javascript
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

const res = await client.batchDescribeCollections({
    collection_names: ['my_collection', 'hello_milvus'],
});
```
