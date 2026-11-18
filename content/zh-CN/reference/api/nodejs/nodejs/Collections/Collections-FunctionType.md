---
title: "FunctionType | Node.js"
slug: /node/node/Collections-FunctionType
sidebar_label: "FunctionType"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "这是一个提供以下常量的枚举。 | Node.js"
type: docx
token: Vq2VdsWJaoufsGx5stJcTuyPnDb
sidebar_position: 17
keywords: 
  - llm eval
  - 稀疏与稠密
  - 稠密向量
  - 分层可导航小世界
  - zilliz
  - zilliz cloud
  - 云
  - FunctionType
  - nodejs30
displayed_sidebar: nodeSidebar

---

# FunctionType

定义将原始数据转换为向量的 Schema 函数的类型。

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

**常量：**

- **Unknown** (0)

    将函数类型设置为 **Unknown**。

- **BM25** (1)

    将函数类型设置为 **BM25**，即基于 BM25 算法的稀疏向量函数。

- **TEXTEMBEDDING** (2)

    将函数类型设置为 **TEXTEMBEDDING**，即生成稠密向量的文本嵌入函数。

- **RERANK** (3)

    将函数类型设置为 **RERANK**，即重排序函数。

- **MINHASH** (4)

    将函数类型设置为 **MINHASH**，即用于相似性检测的 MinHash 函数。

- **MOLFINGERPRINT** (5)

    将函数类型设置为 **MOLFINGERPRINT**，即分子指纹函数。

## 示例\{#example}

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
