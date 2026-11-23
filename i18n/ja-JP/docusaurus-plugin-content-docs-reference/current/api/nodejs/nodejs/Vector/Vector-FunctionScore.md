---
title: "FunctionScore | Node.js"
slug: /node/node/Vector-FunctionScore
sidebar_label: "FunctionScore"
beta: PUBLIC
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "検索用の関数スコア再ランキング構成について説明します。 | Node.js"
type: origin
token: shared-Vector-FunctionScore
keywords: 
  - 関数スコア
  - 再ランキング
  - 検索
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# FunctionScore

検索用の関数スコア再ランキング構成について説明します。

```typescript
export interface FunctionScore {
  functions: FunctionObject[];
  params: keyValueObj;
}

```

**フィールド：**

- **functions** (*FunctionObject[]*) -

    検索結果に適用される関数です。[FunctionObject](./Collections-FunctionObject) を参照してください。

- **params** (*keyValueObj*) -

    関数スコア再ランキング用の追加パラメーターです。

## 例\{#example}

```javascript
import { MilvusClient, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.search({
    collection_name: 'my_collection',
    vector: [0.1, 0.2, 0.3, 0.4],
    limit: 5,
    rerank: {
        functions: [
            {
                name: 'bounded_linear',
                type: FunctionType.RERANK,
                input_field_names: ['vector'],
                output_field_names: ['vector'],
                params: { boost: 2.0, bound: 10.0 },
            },
        ],
        params: {},
    },
});
```
