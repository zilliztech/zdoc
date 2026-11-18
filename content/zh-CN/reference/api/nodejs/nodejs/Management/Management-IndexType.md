---
title: "IndexType | Node.js"
slug: /node/node/Management-IndexType
sidebar_label: "IndexType"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "这是一个枚举，提供以下常量。| Node.js"
type: docx
token: SI3Td00AroRtx8xXQcUce8i2nrb
sidebar_position: 15
keywords: 
  - 向量 Database 教程
  - 向量 Database 如何工作
  - 向量数据库对比
  - openai 向量数据库
  - zilliz
  - zilliz cloud
  - 云
  - IndexType
  - nodejs30
displayed_sidebar: nodeSidebar

---

# IndexType

定义向量字段和标量字段支持的索引类型。

```typescript
export enum IndexType {
  // vector
  FLAT = 'FLAT',
  IVF_FLAT = 'IVF_FLAT',
  IVF_SQ8 = 'IVF_SQ8',
  IVF_PQ = 'IVF_PQ',
  HNSW = 'HNSW',
  BIN_FLAT = 'BIN_FLAT',
  BIN_IVF_FLAT = 'BIN_IVF_FLAT',
  DISKANN = 'DISKANN',
  AUTOINDEX = 'AUTOINDEX',
  ANNOY = 'ANNOY',
  SPARSE_INVERTED_INDEX = 'SPARSE_INVERTED_INDEX',
  SPARSE_WAND = 'SPARSE_WAND',
  // 2.3
  GPU_FLAT = 'GPU_FLAT',
  GPU_IVF_FLAT = 'GPU_IVF_FLAT',
  GPU_IVF_PQ = 'GPU_IVF_PQ',
  GPU_IVF_SQ8 = 'GPU_IVF_SQ8',
  GPU_BRUTE_FORCE = 'GPU_BRUTE_FORCE',
  GPU_CAGRA = 'GPU_CAGRA',
  RAFT_IVF_FLAT = 'RAFT_IVF_FLAT',
  RAFT_IVF_PQ = 'RAFT_IVF_PQ',
  ScaNN = 'SCANN',
  // scalar
  STL_SORT = 'STL_SORT',
  TRIE = 'Trie',
  INVERTED = 'INVERTED',
  // 2.5
  BITMAP = 'BITMAP',
  // 2.6
  IVF_RABITQ = 'IVF_RABITQ',
  MINHASH_LSH = 'MINHASH_LSH',
  RTREE = 'RTREE',
  // quantized HNSW variants
  HNSW_SQ = 'HNSW_SQ',
  HNSW_PQ = 'HNSW_PQ',
  HNSW_PRQ = 'HNSW_PRQ',
  // DiskANN variant keeping PQ codes inline with the graph
  AISAQ = 'AISAQ',
  // scalar: n-gram index for VARCHAR / JSON path, accelerates LIKE
  NGRAM = 'NGRAM',
  // scalar: FM-index for VARCHAR, exact anchored LIKE with no recheck
  FMINDEX = 'FMINDEX',
}
```

**常量：**

- **FLAT** ('FLAT')

    将索引类型设置为 **FLAT**。

- **IVF_FLAT** ('IVF_FLAT')

    将索引类型设置为 **IVF_FLAT**。

- **IVF_SQ8** ('IVF_SQ8')

    将索引类型设置为 **IVF_SQ8**。

- **IVF_PQ** ('IVF_PQ')

    将索引类型设置为 **IVF_PQ**。

- **HNSW** ('HNSW')

    将索引类型设置为 **HNSW**。

- **BIN_FLAT** ('BIN_FLAT')

    将索引类型设置为 **BIN_FLAT**。

- **BIN_IVF_FLAT** ('BIN_IVF_FLAT')

    将索引类型设置为 **BIN_IVF_FLAT**。

- **DISKANN** ('DISKANN')

    将索引类型设置为 **DISKANN**。

- **AUTOINDEX** ('AUTOINDEX')

    将索引类型设置为 **AUTOINDEX**。

- **ANNOY** ('ANNOY')

    将索引类型设置为 **ANNOY**。

- **SPARSE_INVERTED_INDEX** ('SPARSE_INVERTED_INDEX')

    将索引类型设置为 **SPARSE_INVERTED_INDEX**。

- **SPARSE_WAND** ('SPARSE_WAND')

    将索引类型设置为 **SPARSE_WAND**。

- **GPU_FLAT** ('GPU_FLAT')

    将索引类型设置为 **GPU_FLAT**。

- **GPU_IVF_FLAT** ('GPU_IVF_FLAT')

    将索引类型设置为 **GPU_IVF_FLAT**。

- **GPU_IVF_PQ** ('GPU_IVF_PQ')

    将索引类型设置为 **GPU_IVF_PQ**。

- **GPU_IVF_SQ8** ('GPU_IVF_SQ8')

    将索引类型设置为 **GPU_IVF_SQ8**。

- **GPU_BRUTE_FORCE** ('GPU_BRUTE_FORCE')

    将索引类型设置为 **GPU_BRUTE_FORCE**。

- **GPU_CAGRA** ('GPU_CAGRA')

    将索引类型设置为 **GPU_CAGRA**。

- **RAFT_IVF_FLAT** ('RAFT_IVF_FLAT')

    将索引类型设置为 **RAFT_IVF_FLAT**。

- **RAFT_IVF_PQ** ('RAFT_IVF_PQ')

    将索引类型设置为 **RAFT_IVF_PQ**。

- **ScaNN** ('SCANN')

    将索引类型设置为 **ScaNN**。

- **STL_SORT** ('STL_SORT')

    将索引类型设置为 **STL_SORT**。

- **TRIE** ('Trie')

    将索引类型设置为 **TRIE**。

- **INVERTED** ('INVERTED')

    将索引类型设置为 **INVERTED**。

- **BITMAP** ('BITMAP')

    将索引类型设置为 **BITMAP**。

- **IVF_RABITQ** ('IVF_RABITQ')

    将索引类型设置为 **IVF_RABITQ**。

- **MINHASH_LSH** ('MINHASH_LSH')

    将索引类型设置为 **MINHASH_LSH**。

- **RTREE** ('RTREE')

    将索引类型设置为 **RTREE**。

- **HNSW_SQ** ('HNSW_SQ')

    将索引类型设置为 **HNSW_SQ**，这是采用标量量化的 HNSW 变体。

- **HNSW_PQ** ('HNSW_PQ')

    将索引类型设置为 **HNSW_PQ**，这是采用乘积量化的 HNSW 变体。

- **HNSW_PRQ** ('HNSW_PRQ')

    将索引类型设置为 **HNSW_PRQ**，这是采用乘积残差量化的 HNSW 变体。

- **AISAQ** ('AISAQ')

    将索引类型设置为 **AISAQ**，这是一种使 PQ 编码与图保持内联的 DiskANN 变体。

- **NGRAM** ('NGRAM')

    将索引类型设置为 **NGRAM**，这是一种用于 `VARCHAR` 和 JSON 路径的 n-gram 索引，可加速 `LIKE` 匹配。

- **FMINDEX** ('FMINDEX')

    将索引类型设置为 **FMINDEX**，这是一种用于 `VARCHAR` 的 FM-index，可执行精确的锚定 `LIKE` 匹配，且无需重新检查。

## 示例\{#example}

```javascript
import { MilvusClient, IndexType, MetricType } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});

await milvusClient.createIndex({
    collection_name: 'my_collection',
    field_name: 'vector',
    index_type: IndexType.HNSW,
    metric_type: MetricType.COSINE,
});
```
