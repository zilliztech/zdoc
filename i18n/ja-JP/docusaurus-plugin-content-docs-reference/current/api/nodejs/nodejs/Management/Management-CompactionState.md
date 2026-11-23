---
title: "CompactionState | Node.js"
slug: /node/node/Management-CompactionState
sidebar_label: "CompactionState"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Compaction タスクの状態を表します。 | Node.js"
type: origin
token: shared-Management-CompactionState
keywords: 
  - Compaction 状態
  - Compaction
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# CompactionState

Compaction タスクの状態を表します。

```typescript
export enum CompactionState {
  UndefiedState = 0,
  Executing = 1,
  Completed = 2,
}
```

**定数：**

- **UndefiedState**（0）

    Compaction 状態は未定義です（綴りは SDK ソースのままです）。

- **Executing**（1）

    Compaction タスクは現在実行中です。

- **Completed**（2）

    Compaction タスクは完了しました。

## 例\{#example}

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

