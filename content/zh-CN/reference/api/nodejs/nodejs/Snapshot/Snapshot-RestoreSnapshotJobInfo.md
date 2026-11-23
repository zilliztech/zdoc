---
title: "RestoreSnapshotJobInfo | Node.js"
slug: /node/node/Snapshot-RestoreSnapshotJobInfo
sidebar_label: "RestoreSnapshotJobInfo"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "描述快照恢复作业的信息。 | Node.js"
type: origin
token: shared-Snapshot-RestoreSnapshotJobInfo
keywords: 
  - 快照恢复
  - 恢复作业
  - 快照
  - zilliz
  - zilliz cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RestoreSnapshotJobInfo

快照恢复作业的信息。

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

**字段：**

- **job_id** (*string*) -

    恢复作业的标识符。

- **snapshot_name** (*string*) -

    正在恢复的快照的名称。

- **db_name** (*string*) -

    快照所属 Database 的名称。

- **collection_name** (*string*) -

    正在恢复的 Collection 的名称。

- **state** (*RestoreSnapshotState | keyof typeof RestoreSnapshotState*) -

    恢复作业的状态。

- **progress** (*number*) -

    恢复进度的百分比。

- **reason** (*string*) -

    恢复失败时的失败原因。

- **start_time** (*string*) -

    恢复作业的开始时间。

- **time_cost** (*string*) -

    恢复作业的耗时。

## 示例\{#example}

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
