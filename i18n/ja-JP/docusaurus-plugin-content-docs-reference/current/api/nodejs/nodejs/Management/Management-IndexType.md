---
title: "IndexType | Node.js"
slug: /node/node/Management-IndexType
sidebar_label: "IndexType"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "以下の定数を提供する列挙型です。 | Node.js"
type: docx
token: SI3Td00AroRtx8xXQcUce8i2nrb
sidebar_position: 15
keywords: 
  - ベクトルデータベース チュートリアル
  - ベクトルデータベース 仕組み
  - ベクトル db comparison
  - openai ベクトル db
  - zilliz
  - zilliz cloud
  - cloud
  - IndexType
  - nodejs30
displayed_sidebar: nodeSidebar

---

# IndexType

ベクトルフィールドとスカラーフィールドでサポートされるインデックスタイプを定義します。

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

**定数:**

- **FLAT** ('FLAT')

    インデックスタイプを **FLAT** に設定します。

- **IVF_FLAT** ('IVF_FLAT')

    インデックスタイプを **IVF_FLAT** に設定します。

- **IVF_SQ8** ('IVF_SQ8')

    インデックスタイプを **IVF_SQ8** に設定します。

- **IVF_PQ** ('IVF_PQ')

    インデックスタイプを **IVF_PQ** に設定します。

- **HNSW** ('HNSW')

    インデックスタイプを **HNSW** に設定します。

- **BIN_FLAT** ('BIN_FLAT')

    インデックスタイプを **BIN_FLAT** に設定します。

- **BIN_IVF_FLAT** ('BIN_IVF_FLAT')

    インデックスタイプを **BIN_IVF_FLAT** に設定します。

- **DISKANN** ('DISKANN')

    インデックスタイプを **DISKANN** に設定します。

- **AUTOINDEX** ('AUTOINDEX')

    インデックスタイプを **AUTOINDEX** に設定します。

- **ANNOY** ('ANNOY')

    インデックスタイプを **ANNOY** に設定します。

- **SPARSE_INVERTED_INDEX** ('SPARSE_INVERTED_INDEX')

    インデックスタイプを **SPARSE_INVERTED_INDEX** に設定します。

- **SPARSE_WAND** ('SPARSE_WAND')

    インデックスタイプを **SPARSE_WAND** に設定します。

- **GPU_FLAT** ('GPU_FLAT')

    インデックスタイプを **GPU_FLAT** に設定します。

- **GPU_IVF_FLAT** ('GPU_IVF_FLAT')

    インデックスタイプを **GPU_IVF_FLAT** に設定します。

- **GPU_IVF_PQ** ('GPU_IVF_PQ')

    インデックスタイプを **GPU_IVF_PQ** に設定します。

- **GPU_IVF_SQ8** ('GPU_IVF_SQ8')

    インデックスタイプを **GPU_IVF_SQ8** に設定します。

- **GPU_BRUTE_FORCE** ('GPU_BRUTE_FORCE')

    インデックスタイプを **GPU_BRUTE_FORCE** に設定します。

- **GPU_CAGRA** ('GPU_CAGRA')

    インデックスタイプを **GPU_CAGRA** に設定します。

- **RAFT_IVF_FLAT** ('RAFT_IVF_FLAT')

    インデックスタイプを **RAFT_IVF_FLAT** に設定します。

- **RAFT_IVF_PQ** ('RAFT_IVF_PQ')

    インデックスタイプを **RAFT_IVF_PQ** に設定します。

- **ScaNN** ('SCANN')

    インデックスタイプを **ScaNN** に設定します。

- **STL_SORT** ('STL_SORT')

    インデックスタイプを **STL_SORT** に設定します。

- **TRIE** ('Trie')

    インデックスタイプを **TRIE** に設定します。

- **INVERTED** ('INVERTED')

    インデックスタイプを **INVERTED** に設定します。

- **BITMAP** ('BITMAP')

    インデックスタイプを **BITMAP** に設定します。

- **IVF_RABITQ** ('IVF_RABITQ')

    インデックスタイプを **IVF_RABITQ** に設定します。

- **MINHASH_LSH** ('MINHASH_LSH')

    インデックスタイプを **MINHASH_LSH** に設定します。

- **RTREE** ('RTREE')

    インデックスタイプを **RTREE** に設定します。

- **HNSW_SQ** ('HNSW_SQ')

    インデックスタイプを **HNSW_SQ** に設定します。これはスカラー量子化を使用する HNSW のバリアントです。

- **HNSW_PQ** ('HNSW_PQ')

    インデックスタイプを **HNSW_PQ** に設定します。これは積量子化を使用する HNSW のバリアントです。

- **HNSW_PRQ** ('HNSW_PRQ')

    インデックスタイプを **HNSW_PRQ** に設定します。これは積残差量子化を使用する HNSW のバリアントです。

- **AISAQ** ('AISAQ')

    インデックスタイプを **AISAQ** に設定します。これは PQ コードをグラフとインラインに保持する DiskANN のバリアントです。

- **NGRAM** ('NGRAM')

    インデックスタイプを **NGRAM** に設定します。これは `VARCHAR` および JSON パス用の n-gram インデックスで、`LIKE` マッチングを高速化します。

- **FMINDEX** ('FMINDEX')

    インデックスタイプを **FMINDEX** に設定します。これは `VARCHAR` 用の FM インデックスで、候補を再チェックせずに、アンカー付き `LIKE` マッチングを正確に実行します。

## 例\{#example}

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
