---
title: "createSnapshot() | Node.js"
slug: /node/node/Snapshot-createSnapshot
sidebar_label: "createSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a snapshot for a collection. A snapshot captures the current state of a collection and its data. | Node.js"
type: docx
token: NeUFdr0OXo90RExodnccqc3OnYU
sidebar_position: 1
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - createSnapshot()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# createSnapshot()

This operation creates a snapshot for a collection. A snapshot captures the current state of a collection and its data.

```javascript
await milvusClient.createSnapshot(data: CreateSnapshotReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.createSnapshot({
    collection_name: string,
    snapshot_name: string,
    description?: string,
    compaction_protection_seconds?: number | string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

<NextChannel action="exclude">

- **collection_name** (*string*) -
**[REQUIRED]**
The name of the collection to snapshot.

- **snapshot_name** (*string*) -
**[REQUIRED]**
The name of the snapshot.

- **description** (*string*) -
Optional snapshot description.

- **compaction_protection_seconds** (*number | string*) -
Duration to protect referenced segments from compaction. Optional.

- **db_name** (*string*) -
The name of the database. Optional.

- **timeout** (*number*) -
An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -
A trace ID for request tracking. Optional.

</NextChannel>

<NextChannel action="include">

- **collection_name** (*string*) -
**[REQUIRED]**
The name of the collection to snapshot.

- **snapshot_name** (*string*) -
**[REQUIRED]**
The name of the snapshot.

- **description** (*string*) -
Optional snapshot description.

- **compaction_protection_seconds** (*number | string*) -
Duration to protect referenced segments from compaction. Optional.

- **db_name** (*string*) -
The name of the database. Optional.

- **timeout** (*number*) -
An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -
An optional, caller-supplied ID for request tracking and log or trace correlation. The SDK sends it as the `client-request-id` gRPC metadata header and never generates one. Use a unique value per request, such as a UUID. A value in OpenTelemetry trace-ID form (32 lowercase hexadecimal characters) is also used by client telemetry as a trace ID.

</NextChannel>

**RETURNS:**

*Promise&lt;ResStatus&gt;*

This method returns a promise that resolves to a **ResStatus** object.

**EXCEPTIONS:**

- **Error**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await client.createSnapshot({
    collection_name: 'my_collection',
    snapshot_name: 'snapshot_2024_01',
    description: 'Monthly backup',
});
```
