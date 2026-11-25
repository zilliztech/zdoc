---
title: "listSnapshots() | Node.js"
slug: /node/node/Snapshot-listSnapshots
sidebar_label: "listSnapshots()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all snapshots for a collection. | Node.js"
type: docx
token: VjhTds7NPoyPjBxk4PNc5pe0nw6
sidebar_position: 6
keywords: 
  - AI Hallucination
  - AI Agent
  - semantic search
  - Anomaly Detection
  - zilliz
  - zilliz cloud
  - cloud
  - listSnapshots()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listSnapshots()

This operation lists all snapshots for a collection.

```javascript
await milvusClient.listSnapshots(data: ListSnapshotsReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.listSnapshots({
    collection_name: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

<NextChannel action="exclude">

- **collection_name** (*string*) -
**[REQUIRED]**
The name of the collection.

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
The name of the collection.

- **db_name** (*string*) -
The name of the database. Optional.

- **timeout** (*number*) -
An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -
An optional, caller-supplied ID for request tracking and log or trace correlation. The SDK sends it as the `client-request-id` gRPC metadata header and never generates one. Use a unique value per request, such as a UUID. A value in OpenTelemetry trace-ID form (32 lowercase hexadecimal characters) is also used by client telemetry as a trace ID.

</NextChannel>

**RETURNS:**

*Promise&lt;ListSnapshotsResponse&gt;*

This method returns a promise that resolves to a **ListSnapshotsResponse** object.

<NextChannel action="exclude">

```javascript
{
    snapshots: string[],
    status:  ResStatus
}
```

</NextChannel>

<NextChannel action="include">

```javascript
{
    snapshots: string[],
    snapshot_summaries?: SnapshotSummary[],
    status:  ResStatus
}
```

</NextChannel>

**PARAMETERS:**

<NextChannel action="exclude">

- **snapshots** (*string[]*) -
A list of snapshot names that currently exist for the requested collection.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

</NextChannel>

<NextChannel action="include">

- **snapshots** (*string[]*) -
A list of snapshot names that currently exist for the requested collection.

- **snapshot_summaries** (*SnapshotSummary[]*) -
Optional. Summaries of the snapshots. Each entry has the following members:

    - **name** (*string*) -

        The snapshot name.

    - **create_ts** (*string*) -

        The creation timestamp of the snapshot.

    - **description** (*string*) -

        The snapshot description.

    - **create_utc_ts** (*string*) -

        The creation time of the snapshot as Unix milliseconds.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

</NextChannel>

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

const res = await client.listSnapshots({
    collection_name: 'my_collection',
});
```
