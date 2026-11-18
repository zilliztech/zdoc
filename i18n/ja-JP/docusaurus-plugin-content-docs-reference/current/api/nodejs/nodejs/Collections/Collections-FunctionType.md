---
title: "FunctionType | Node.js"
slug: /node/node/Collections-FunctionType
sidebar_label: "FunctionType"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "以下の定数を提供する列挙型です。 | Node.js"
type: docx
token: Vq2VdsWJaoufsGx5stJcTuyPnDb
sidebar_position: 17
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense ベクトル
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionType
  - nodejs30
displayed_sidebar: nodeSidebar

---

# FunctionType

生データをベクトルに変換するスキーマ関数の型を定義します。

```typescript
export enum FunctionType {
  Unknown = 0,
  BM25 = 1,
  TEXTEMBEDDING = 2,
  RERANK = 3,
  MINHASH = 4,
  MOLFINGERPRINT = 5,
}
```

**定数:**

- **Unknown** (0)

    関数タイプを **Unknown** に設定します。

- **BM25** (1)

    関数タイプを **BM25** に設定します。これは、BM25 アルゴリズムに基づくスパースベクトル関数です。

- **TEXTEMBEDDING** (2)

    関数タイプを **TEXTEMBEDDING** に設定します。これは、密ベクトルを生成するテキスト埋め込み関数です。

- **RERANK** (3)

    関数タイプを **RERANK** に設定します。これは、再ランキング関数です。

- **MINHASH** (4)

    関数タイプを **MINHASH** に設定します。これは、類似性検出用の MinHash 関数です。

- **MOLFINGERPRINT** (5)

    関数タイプを **MOLFINGERPRINT** に設定します。これは、分子フィンガープリント関数です。

## 例\{#example}

```javascript
import { MilvusClient, FunctionType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

await milvusClient.createCollection({
    collection_name: 'my_collection',
    functions: [
        {
            name: 'bm25_fn',
            type: FunctionType.BM25,
            input_field_names: ['text'],
            output_field_names: ['sparse_vector'],
            params: {},
        },
    ],
});
```
