---
title: "RowData | Node.js"
slug: /node/node/Vector-RowData
sidebar_label: "RowData"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "挿入または upsert に使用する 1 行分のデータで、フィールド名をキーとするレコードです。 | Node.js"
type: origin
token: shared-Vector-RowData
keywords: 
  - 行データ
  - 挿入
  - upsert
  - zilliz
  - zilliz cloud
  - クラウド
  - nodejs30
displayed_sidebar: nodeSidebar

---

# RowData

挿入または upsert に使用する 1 行分のデータで、フィールド名をキーとするレコードです。

```typescript
export interface RowData {
  [x: string]: FieldData;
}
```

**フィールド：**

- **[field: string]** (*FieldData*) -

    フィールド名をキーとするフィールド値です。

## 例\{#example}

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
