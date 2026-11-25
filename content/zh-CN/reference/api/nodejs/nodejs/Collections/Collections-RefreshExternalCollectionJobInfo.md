---
title: "RefreshExternalCollectionJobInfo | Node.js"
slug: /node/node/Collections-RefreshExternalCollectionJobInfo
sidebar_label: "RefreshExternalCollectionJobInfo"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作描述外部 Collection 刷新操作返回的作业信息。 | Node.js"
type: origin
token: shared-Collections-RefreshExternalCollectionJobInfo
keywords: 
  - 外部 Collection
  - 刷新作业
  - zilliz
  - zilliz cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RefreshExternalCollectionJobInfo

外部 Collection 刷新作业的信息。

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

**字段：**

<NextChannel action="exclude">

- **job_id** (*string*) -

    刷新作业标识符。

- **collection_name** (*string*) -

    正在刷新的外部 Collection 的名称。

- **state** (*RefreshExternalCollectionState | keyof typeof RefreshExternalCollectionState*) -

    刷新作业状态。

- **progress** (*string*) -

    刷新进度。

- **reason** (*string*) -

    刷新失败时的失败原因。

- **external_source** (*string*) -

    Collection 的外部数据源。

- **start_time** (*string*) -

    刷新作业的开始时间。

- **end_time** (*string*) -

    刷新作业的结束时间。

</NextChannel>

<NextChannel action="include">

- **job_id** (*string*) -

    刷新作业标识符。

- **collection_name** (*string*) -

    正在刷新的外部 Collection 的名称。

- **state** (*RefreshExternalCollectionState | keyof typeof RefreshExternalCollectionState*) -

    刷新作业状态。可能值为 **RefreshPending**、**RefreshInProgress**、**RefreshCompleted** 和 **RefreshFailed**。刷新作业会从 **RefreshInProgress** 变为 **RefreshCompleted** 或 **RefreshFailed**。

- **progress** (*string*) -

    刷新进度。

- **reason** (*string*) -

    刷新失败时的失败原因。

- **external_source** (*string*) -

    Collection 的外部数据源。

- **start_time** (*string*) -

    刷新作业的开始时间。

- **end_time** (*string*) -

    刷新作业的结束时间。

</NextChannel>

## 示例\{#example}

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
