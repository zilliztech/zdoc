---
title: "CompactionState | Node.js"
slug: /node/node/Management-CompactionState
sidebar_label: "CompactionState"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Represents the state of a compaction task. | Node.js"
type: origin
token: shared-Management-CompactionState
keywords: 
  - compaction state
  - compaction
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# CompactionState

Represents the state of a compaction task.

```typescript
export enum CompactionState {
  UndefiedState = 0,
  Executing = 1,
  Completed = 2,
}
```

**Constants:**

- **UndefiedState** (0)

    The compaction state is undefined (spelling as in the SDK source).

- **Executing** (1)

    A compaction task is currently running.

- **Completed** (2)

    The compaction task has completed.

## Example\{#example}

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

