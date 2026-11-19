---
title: "ConsistencyLevelEnum | Node.js"
slug: /node/node/Collections-ConsistencyLevelEnum
sidebar_label: "ConsistencyLevelEnum"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation describes the consistency levels supported by the target collection. | Node.js"
type: origin
token: shared-Collections-ConsistencyLevelEnum
keywords: 
  - consistency level
  - bounded
  - session
  - eventually
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# ConsistencyLevelEnum

Defines the consistency guarantee applied to reads and queries.

```typescript
export enum ConsistencyLevelEnum {
  Strong = 0,
  Session = 1, // default in PyMilvus
  Bounded = 2,
  Eventually = 3,
  Customized = 4, // Users pass their own `guarantee_timestamp`. Deprecated
}
```

**Constants:**

- **Strong** (0)

    Strongest guarantee: reads see all data committed before the request starts.

- **Session** (1)

    Read-your-writes consistency via a per-session timestamp (the default in PyMilvus).

- **Bounded** (2)

    Reads tolerate staleness within a bounded time window.

- **Eventually** (3)

    Weakest guarantee: replicas converge eventually; lowest latency.

- **Customized** (4)

    The caller passes its own guarantee timestamp. Deprecated.

## Example\{#example}

```javascript
import { MilvusClient, ConsistencyLevelEnum, DataType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

await milvusClient.createCollection({
    collection_name: 'my_collection',
    consistency_level: ConsistencyLevelEnum.Strong,
    fields: [
        { name: 'id', data_type: DataType.Int64, is_primary_key: true, autoID: true },
        { name: 'vector', data_type: DataType.FloatVector, type_params: { dim: 8 } },
    ],
});
```

