---
title: "RefreshExternalCollectionJobInfo | Node.js"
slug: /node/node/Collections-RefreshExternalCollectionJobInfo
sidebar_label: "RefreshExternalCollectionJobInfo"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、外部コレクションのリフレッシュ操作によって返されるジョブ情報について説明します。 | Node.js"
type: origin
token: shared-Collections-RefreshExternalCollectionJobInfo
keywords: 
  - 外部コレクション
  - リフレッシュジョブ
  - zilliz
  - zilliz cloud
  - クラウド
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RefreshExternalCollectionJobInfo

外部コレクションのリフレッシュジョブに関する情報です。

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

**フィールド:**

<NextChannel action="exclude">

- **job_id** (*string*) -

    リフレッシュジョブの識別子です。

- **collection_name** (*string*) -

    リフレッシュ対象の外部コレクションの名前です。

- **state** (*RefreshExternalCollectionState | keyof typeof RefreshExternalCollectionState*) -

    リフレッシュジョブの状態です。

- **progress** (*string*) -

    リフレッシュの進行状況です。

- **reason** (*string*) -

    リフレッシュが失敗した場合の失敗理由です。

- **external_source** (*string*) -

    コレクションの外部データソースです。

- **start_time** (*string*) -

    リフレッシュジョブの開始時刻です。

- **end_time** (*string*) -

    リフレッシュジョブの終了時刻です。

</NextChannel>

<NextChannel action="include">

- **job_id** (*string*) -

    リフレッシュジョブの識別子です。

- **collection_name** (*string*) -

    リフレッシュ対象の外部コレクションの名前です。

- **state** (*RefreshExternalCollectionState | keyof typeof RefreshExternalCollectionState*) -

    リフレッシュジョブの状態です。使用可能な値は **RefreshPending**、**RefreshInProgress**、**RefreshCompleted**、および **RefreshFailed** です。リフレッシュジョブは **RefreshInProgress** から **RefreshCompleted** または **RefreshFailed** に遷移します。

- **progress** (*string*) -

    リフレッシュの進行状況です。

- **reason** (*string*) -

    リフレッシュが失敗した場合の失敗理由です。

- **external_source** (*string*) -

    コレクションの外部データソースです。

- **start_time** (*string*) -

    リフレッシュジョブの開始時刻です。

- **end_time** (*string*) -

    リフレッシュジョブの終了時刻です。

</NextChannel>

## 例\{#example}

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
