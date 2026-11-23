---
title: "StringArrayId | Node.js"
slug: /node/node/Vector-StringArrayId
sidebar_label: "StringArrayId"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "以字符串形式给出的主键 ID 列表。 | Node.js"
type: origin
token: shared-Vector-StringArrayId
keywords: 
  - 字符串数组 ID
  - 主键
  - ID 列表
  - zilliz
  - zilliz cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# StringArrayId

以字符串形式给出的主键 ID 列表。

```typescript
export interface StringArrayId {
  str_id: StringArray;
}
```

**字段：**

- **str_id**（*StringArray*）-

    字符串主键值。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.insert({
    collection_name: 'my_collection',
    data: [{ id: 'a1', vector: [0.1, 0.2, 0.3, 0.4] }],
});

console.log(res.IDs); // StringArrayId, e.g. { str_id: { data: ['a1'] } }
```

