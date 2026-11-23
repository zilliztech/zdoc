---
title: "NumberArrayId | Node.js"
slug: /node/node/Vector-NumberArrayId
sidebar_label: "NumberArrayId"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A primary-key ID list given as numbers. | Node.js"
type: origin
token: shared-Vector-NumberArrayId
keywords: 
  - number array id
  - primary key
  - id list
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# NumberArrayId

A primary-key ID list given as numbers.

```typescript
export interface NumberArrayId {
  int_id: NumberArray;
}
```

**FIELDS:**

- **int_id** (*NumberArray*) -

    The numeric primary key values.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.insert({
    collection_name: 'my_collection',
    data: [{ id: 1, vector: [0.1, 0.2, 0.3, 0.4] }],
});

console.log(res.IDs); // NumberArrayId, e.g. { int_id: { data: [1] } }
```

