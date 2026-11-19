---
title: "listRefreshExternalCollectionJobs() | Node.js"
slug: /node/node/Collections-listRefreshExternalCollectionJobs
sidebar_label: "listRefreshExternalCollectionJobs()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists all refresh jobs for external collections. You can filter by collection name and database name. | Node.js"
type: docx
token: AG5zdQCpXoy11MxWgD0ciYBRnJb
sidebar_position: 30
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - listRefreshExternalCollectionJobs()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# listRefreshExternalCollectionJobs()

This operation lists all refresh jobs for external collections. You can filter by collection name and database name.

```javascript
await milvusClient.listRefreshExternalCollectionJobs(data?: ListRefreshExternalCollectionJobsReq)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.listRefreshExternalCollectionJobs({
    collection_name?: string,
    db_name?: string,
    timeout?: number,
    client_request_id?: string,
})
```

**PARAMETERS:**

- **collection_name** (*string*) -
Optional filter by collection name.

- **db_name** (*string*) -
Optional filter by database name.

- **timeout** (*number*) -
An optional duration of time in milliseconds to allow for the RPC. If it is set to undefined, the client keeps waiting until the server responds or an error occurs. Default is undefined.

- **client_request_id** (*string*) -
A trace ID for request tracking. Optional.

**RETURNS:**

*Promise&lt;ListRefreshExternalCollectionJobsResponse&gt;*

This method returns a promise that resolves to a **ListRefreshExternalCollectionJobsResponse** object.

```javascript
{
    jobs: RefreshExternalCollectionJobInfo[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **jobs** (*[RefreshExternalCollectionJobInfo](./Collections-RefreshExternalCollectionJobInfo)[]*) -

A list of refresh jobs that match the requested database and collection filters. For the full [RefreshExternalCollectionJobInfo](./Collections-RefreshExternalCollectionJobInfo) field reference, refer to the `getRefreshExternalCollectionProgress()` doc.

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

const res = await client.listRefreshExternalCollectionJobs({
    collection_name: 'my_external_collection',
});
```
