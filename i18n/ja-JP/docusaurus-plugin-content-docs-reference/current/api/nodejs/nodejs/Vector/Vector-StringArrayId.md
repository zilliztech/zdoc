---
title: "StringArrayId | Node.js"
slug: /node/node/Vector-StringArrayId
sidebar_label: "StringArrayId"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "文字列として指定された主キー ID のリストです。 | Node.js"
type: origin
token: shared-Vector-StringArrayId
keywords: 
  - 文字列配列 ID
  - 主キー
  - ID リスト
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - nodejs30
displayed_sidebar: nodeSidebar

---

# StringArrayId

文字列として指定された主キー ID のリストです。

```typescript
export interface StringArrayId {
  str_id: StringArray;
}
```

**フィールド：**

- **str_id**（*StringArray*）-

    文字列型の主キー値です。

## 例\{#example}

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
