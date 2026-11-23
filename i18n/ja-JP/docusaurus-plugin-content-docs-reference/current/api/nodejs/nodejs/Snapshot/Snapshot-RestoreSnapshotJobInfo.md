---
title: "RestoreSnapshotJobInfo | Node.js"
slug: /node/node/Snapshot-RestoreSnapshotJobInfo
sidebar_label: "RestoreSnapshotJobInfo"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "スナップショット復元ジョブの情報について説明します。 | Node.js"
type: origin
token: shared-Snapshot-RestoreSnapshotJobInfo
keywords: 
  - スナップショット復元
  - 復元ジョブ
  - スナップショット
  - zilliz
  - zilliz cloud
  - クラウド
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RestoreSnapshotJobInfo

スナップショット復元ジョブに関する情報です。

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

**フィールド：**

- **job_id** (*string*) -

    復元ジョブの識別子です。

- **snapshot_name** (*string*) -

    復元対象のスナップショットの名前です。

- **db_name** (*string*) -

    スナップショットが属するデータベースの名前です。

- **collection_name** (*string*) -

    復元対象のコレクションの名前です。

- **state** (*RestoreSnapshotState | keyof typeof RestoreSnapshotState*) -

    復元ジョブの状態です。

- **progress** (*number*) -

    復元の進行状況をパーセンテージで表したものです。

- **reason** (*string*) -

    復元に失敗した場合の失敗理由です。

- **start_time** (*string*) -

    復元ジョブの開始時刻です。

- **time_cost** (*string*) -

    復元ジョブの経過時間です。

## 例\{#example}

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

