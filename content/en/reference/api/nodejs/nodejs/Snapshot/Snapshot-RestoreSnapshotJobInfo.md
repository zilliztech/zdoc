---
title: "RestoreSnapshotJobInfo | Node.js"
slug: /node/node/Snapshot-RestoreSnapshotJobInfo
sidebar_label: "RestoreSnapshotJobInfo"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Describes the information of a snapshot restore job. | Node.js"
type: origin
token: shared-Snapshot-RestoreSnapshotJobInfo
keywords: 
  - snapshot restore
  - restore job
  - snapshot
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RestoreSnapshotJobInfo

Information of a snapshot restore job.

```typescript
export interface RestoreSnapshotJobInfo {
  job_id: string;
  snapshot_name: string;
  db_name: string;
  collection_name: string;
  state: RestoreSnapshotState | keyof typeof RestoreSnapshotState;
  progress: number;
  reason: string;
  start_time: string;
  time_cost: string;
}
```

**FIELDS:**

- **job_id** (*string*) -

    The restore job identifier.

- **snapshot_name** (*string*) -

    The name of the snapshot being restored.

- **db_name** (*string*) -

    The name of the database the snapshot belongs to.

- **collection_name** (*string*) -

    The name of the collection being restored.

- **state** (*RestoreSnapshotState | keyof typeof RestoreSnapshotState*) -

    The restore job state.

- **progress** (*number*) -

    The restore progress percentage.

- **reason** (*string*) -

    The failure reason when the restore failed.

- **start_time** (*string*) -

    The start time of the restore job.

- **time_cost** (*string*) -

    The elapsed time of the restore job.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.listRestoreSnapshotJobs({
    collection_name: 'restored_collection',
});

console.log(res.jobs); // RestoreSnapshotJobInfo[]
```

