---
title: "ConsistencyLevelEnum | Node.js"
slug: /node/node/Collections-ConsistencyLevelEnum
sidebar_label: "ConsistencyLevelEnum"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、対象コレクションでサポートされる整合性レベルについて説明します。 | Node.js"
type: origin
token: shared-Collections-ConsistencyLevelEnum
keywords: 
  - 整合性レベル
  - Bounded
  - Session
  - Eventually
  - zilliz
  - zilliz cloud
  - クラウド
  - nodejs30
displayed_sidebar: nodeSidebar

---

# ConsistencyLevelEnum

読み取りとクエリに適用される整合性保証を定義します。

```typescript
export enum ConsistencyLevelEnum {
  Strong = 0,
  Session = 1, // default in PyMilvus
  Bounded = 2,
  Eventually = 3,
  Customized = 4, // Users pass their own `guarantee_timestamp`. Deprecated
}
```

**定数：**

- **Strong**（0）

    最も強い保証です。読み取りでは、リクエストの開始前にコミットされたすべてのデータを参照できます。

- **Session**（1）

    セッションごとのタイムスタンプによって read-your-writes 整合性を実現します（PyMilvus ではこれがデフォルトです）。

- **Bounded**（2）

    読み取りでは、制限された時間枠内でのデータの古さを許容します。

- **Eventually**（3）

    最も弱い保証です。レプリカは最終的に収束し、レイテンシーが最も低くなります。

- **Customized**（4）

    呼び出し元が独自の保証タイムスタンプを渡します。非推奨です。

## 例\{#example}

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
