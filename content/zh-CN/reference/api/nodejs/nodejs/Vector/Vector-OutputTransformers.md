---
title: "OutputTransformers | Node.js"
slug: /node/node/Vector-OutputTransformers
sidebar_label: "OutputTransformers"
beta: FALSE
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "描述在返回搜索结果之前，应用于搜索结果的按数据类型转换函数。 | Node.js"
type: origin
token: shared-Vector-OutputTransformers
keywords: 
  - 输出转换器
  - 转换器
  - 搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - nodejs30
displayed_sidebar: nodeSidebar

---

# OutputTransformers

描述在返回搜索结果之前，应用于搜索结果的按数据类型转换函数。

```typescript
export type OutputTransformers = {
  [DataType.BFloat16Vector]?: (bf16bytes: Uint8Array) => BFloat16Vector;
  [DataType.Float16Vector]?: (f16: Uint8Array) => Float16Vector;
  [DataType.SparseFloatVector]?: (sparse: SparseVectorDic) => SparseFloatVector;
  [DataType.Int8Vector]?: (int8Vector: Int8Array) => Int8Vector;
};
```

**字段：**

- **[DataType.BFloat16Vector]** (*(bf16bytes: Uint8Array) => BFloat16Vector*) -

    转换 BFloat16 向量字节。

- **[DataType.Float16Vector]** (*(f16: Uint8Array) => Float16Vector*) -

    转换 Float16 向量字节。

- **[DataType.SparseFloatVector]** (*(sparse: SparseVectorDic) => SparseFloatVector*) -

    转换稀疏向量字典。

- **[DataType.Int8Vector]** (*(int8Vector: Int8Array) => Int8Vector*) -

    转换 Int8 向量数组。

## 示例\{#example}

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
