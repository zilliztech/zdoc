---
title: "RowData | Node.js"
slug: /node/node/Vector-RowData
sidebar_label: "RowData"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "用于插入或 upsert 的一行数据，以字段名作为键。 | Node.js"
type: origin
token: shared-Vector-RowData
keywords: 
  - 行数据
  - 插入
  - upsert
  - zilliz
  - zilliz cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RowData

用于插入或 upsert 的一行数据：以字段名作为键的记录。

```typescript
export interface RowData {
  [x: string]: FieldData;
}
```

**字段：**

- **[field: string]**（*FieldData*）-

    以字段名作为键的字段值。

## 示例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.insert({
    collection_name: 'my_collection',
    data: [
        { id: 1, vector: [0.1, 0.2, 0.3, 0.4], text: 'Hello' },
        { id: 2, vector: [0.5, 0.6, 0.7, 0.8], text: 'World' },
    ],
});
```
