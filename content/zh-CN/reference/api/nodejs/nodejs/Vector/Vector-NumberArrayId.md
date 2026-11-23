---
title: "NumberArrayId | Node.js"
slug: /node/node/Vector-NumberArrayId
sidebar_label: "NumberArrayId"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "以数字形式给出的主键 ID 列表。 | Node.js"
type: origin
token: shared-Vector-NumberArrayId
keywords: 
  - 数字数组 ID
  - 主键
  - ID 列表
  - zilliz
  - zilliz cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# NumberArrayId

以数字形式给出的主键 ID 列表。

```typescript
export interface NumberArrayId {
  int_id: NumberArray;
}
```

**字段：**

- **int_id**（*NumberArray*）-

    数值主键值。

## 示例\{#example}

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
