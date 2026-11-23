---
title: "CompactionState | Node.js"
slug: /node/node/Management-CompactionState
sidebar_label: "CompactionState"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "表示 Compaction 任务的状态。 | Node.js"
type: origin
token: shared-Management-CompactionState
keywords: 
  - Compaction 状态
  - Compaction
  - zilliz
  - zilliz cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# CompactionState

表示 Compaction 任务的状态。

```typescript
export enum CompactionState {
  UndefiedState = 0,
  Executing = 1,
  Completed = 2,
}
```

**常量：**

- **UndefiedState** (0)

    Compaction 状态未定义（拼写与 SDK 源代码一致）。

- **Executing** (1)

    Compaction 任务当前正在运行。

- **Completed** (2)

    Compaction 任务已完成。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.getCompactionState({
    compactionID: 'your_compaction_id',
});

console.log(res.state); // CompactionState
```
