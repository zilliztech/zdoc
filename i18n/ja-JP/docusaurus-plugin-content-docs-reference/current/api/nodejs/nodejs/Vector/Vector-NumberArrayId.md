---
title: "NumberArrayId | Node.js"
slug: /node/node/Vector-NumberArrayId
sidebar_label: "NumberArrayId"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "数値で指定された主キー ID リスト。 | Node.js"
type: origin
token: shared-Vector-NumberArrayId
keywords: 
  - 数値配列 ID
  - 主キー
  - ID リスト
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# NumberArrayId

数値で指定された主キー ID のリストです。

```typescript
export interface NumberArrayId {
  int_id: NumberArray;
}
```

**フィールド:**

- **int_id** (*NumberArray*) -

    数値の主キー値です。

## 例\{#example}

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
