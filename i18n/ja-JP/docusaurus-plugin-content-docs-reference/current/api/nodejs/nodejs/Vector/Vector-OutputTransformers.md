---
title: "OutputTransformers | Node.js"
slug: /node/node/Vector-OutputTransformers
sidebar_label: "OutputTransformers"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "検索結果が返される前に適用される、データ型ごとのトランスフォーマー関数について説明します。 | Node.js"
type: origin
token: shared-Vector-OutputTransformers
keywords: 
  - 出力トランスフォーマー
  - トランスフォーマー
  - 検索
  - zilliz
  - zilliz cloud
  - cloud
  - nodejs30
displayed_sidebar: nodeSidebar

---

# OutputTransformers

検索結果が返される前に適用される、データ型ごとのトランスフォーマー関数について説明します。

```typescript
export type OutputTransformers = {
  [DataType.BFloat16Vector]?: (bf16bytes: Uint8Array) => BFloat16Vector;
  [DataType.Float16Vector]?: (f16: Uint8Array) => Float16Vector;
  [DataType.SparseFloatVector]?: (sparse: SparseVectorDic) => SparseFloatVector;
  [DataType.Int8Vector]?: (int8Vector: Int8Array) => Int8Vector;
};
```

**フィールド：**

- **[DataType.BFloat16Vector]** (*(bf16bytes: Uint8Array) => BFloat16Vector*) -

    BFloat16 ベクトルのバイトを変換します。

- **[DataType.Float16Vector]** (*(f16: Uint8Array) => Float16Vector*) -

    Float16 ベクトルのバイトを変換します。

- **[DataType.SparseFloatVector]** (*(sparse: SparseVectorDic) => SparseFloatVector*) -

    スパースベクトル辞書を変換します。

- **[DataType.Int8Vector]** (*(int8Vector: Int8Array) => Int8Vector*) -

    Int8 ベクトル配列を変換します。

## 例\{#example}

```javascript
import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

const res = await milvusClient.search({
    collection_name: 'my_collection',
    vector: [0.1, 0.2, 0.3, 0.4],
    limit: 5,
    transformers: {
        [DataType.Float16Vector]: bytes => new Float32Array(bytes),
    },
});
```
