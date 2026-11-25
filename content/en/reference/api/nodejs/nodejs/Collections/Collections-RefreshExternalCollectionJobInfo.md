---
title: "RefreshExternalCollectionJobInfo | Node.js"
slug: /node/node/Collections-RefreshExternalCollectionJobInfo
sidebar_label: "RefreshExternalCollectionJobInfo"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation describes the job information returned by external collection refresh operations. | Node.js"
type: origin
token: shared-Collections-RefreshExternalCollectionJobInfo
keywords: 
  - external collection
  - refresh job
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RefreshExternalCollectionJobInfo

Information of an external collection refresh job.

```typescript
export interface RefreshExternalCollectionJobInfo {
  job_id: string;
  collection_name: string;
  state:
    | RefreshExternalCollectionState
    | keyof typeof RefreshExternalCollectionState;
  progress: string;
  reason: string;
  external_source: string;
  start_time: string;
  end_time: string;
}
```

**FIELDS:**

<NextChannel action="exclude">

- **job_id** (*string*) -

    The refresh job identifier.

- **collection_name** (*string*) -

    The name of the external collection being refreshed.

- **state** (*RefreshExternalCollectionState | keyof typeof RefreshExternalCollectionState*) -

    The refresh job state.

- **progress** (*string*) -

    The refresh progress.

- **reason** (*string*) -

    The failure reason when the refresh failed.

- **external_source** (*string*) -

    The external data source of the collection.

- **start_time** (*string*) -

    The start time of the refresh job.

- **end_time** (*string*) -

    The end time of the refresh job.

</NextChannel>

<NextChannel action="include">

- **job_id** (*string*) -

    The refresh job identifier.

- **collection_name** (*string*) -

    The name of the external collection being refreshed.

- **state** (*RefreshExternalCollectionState | keyof typeof RefreshExternalCollectionState*) -

    The refresh job state. Possible values are **RefreshPending**, **RefreshInProgress**, **RefreshCompleted**, and **RefreshFailed**. A refresh job transitions from **RefreshInProgress** to **RefreshCompleted** or **RefreshFailed**.

- **progress** (*string*) -

    The refresh progress.

- **reason** (*string*) -

    The failure reason when the refresh failed.

- **external_source** (*string*) -

    The external data source of the collection.

- **start_time** (*string*) -

    The start time of the refresh job.

- **end_time** (*string*) -

    The end time of the refresh job.

</NextChannel>

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.listRefreshExternalCollectionJobs({
    collection_name: 'my_external_collection',
});

console.log(res.jobs); // RefreshExternalCollectionJobInfo[]
```
