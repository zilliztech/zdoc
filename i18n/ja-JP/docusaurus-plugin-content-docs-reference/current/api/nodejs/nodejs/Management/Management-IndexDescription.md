---
title: "IndexDescription | Node.js"
slug: /node/node/Management-IndexDescription
sidebar_label: "IndexDescription"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "インデックス記述操作で返される、コレクション上の 1 つのインデックスを表します。 | Node.js"
type: origin
token: shared-Management-IndexDescription
keywords: 
  - インデックス記述
  - インデックス
  - zilliz
  - zilliz cloud
  - クラウド
  - nodejs30
displayed_sidebar: nodeSidebar

---

# IndexDescription

インデックス記述操作で返される、コレクション上の 1 つのインデックスを表します。

```typescript
export interface IndexDescription {
  index_name: string;
  indexID: number;
  params: KeyValuePair[];
  field_name: string;
  indexed_rows: string;
  total_rows: string;
  state: string;
  index_state_fail_reason: string;
  pending_index_rows: string;
}
```

**フィールド：**

- **index_name** (*string*) -

    インデックス名です。

- **indexID** (*number*) -

    インデックス ID です。

- **params** (*KeyValuePair[]*) -

    インデックスパラメーターをキーと値のペアで表します。

- **field_name** (*string*) -

    インデックスの構築対象となるフィールドです。

- **indexed_rows** (*string*) -

    これまでにインデックス化された行数です。

- **total_rows** (*string*) -

    インデックス化する行の総数です。

- **state** (*string*) -

    インデックスの構築状態です。

- **index_state_fail_reason** (*string*) -

    インデックスの構築に失敗したときの失敗理由です。

- **pending_index_rows** (*string*) -

    インデックス構築待ちの行数です。

## 例\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.describeIndex({
    collection_name: 'my_collection',
});

console.log(res.index_descriptions); // IndexDescription[]
```
