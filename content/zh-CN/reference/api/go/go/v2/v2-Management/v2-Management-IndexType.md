---
title: "IndexType | Go | v2"
slug: /go/go/v2-Management-IndexType
sidebar_label: "IndexType"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "IndexType 实例会枚举向量字段和标量字段支持的索引算法。 | Go | v2"
type: docx
token: EJ5EdgllloCp0vxdwN0c2Kw1nyC
sidebar_position: 15
keywords: 
  - 异常检测
  - 句子转换器
  - 推荐系统
  - 信息检索
  - Zilliz
  - Zilliz Cloud
  - 云
  - IndexType
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# IndexType

IndexType 实例会枚举向量字段和标量字段支持的索引算法。

```go
type IndexType string
```

**取值：**

- **Flat** = "FLAT"

    Flat（暴力）索引。结果精确，但处理大型数据集时速度较慢。

- **BinFlat** = "BIN_FLAT"

    用于二进制向量的 Flat 索引。

- **IvfFlat** = "IVF_FLAT"

    采用 flat 量化的 IVF。在 accuracy/speed 之间平衡良好。

- **BinIvfFlat** = "BIN_IVF_FLAT"

    用于二进制向量的 IVF-Flat。

- **IvfPQ** = "IVF_PQ"

    采用乘积量化的 IVF。内存效率高。

- **IvfSQ8** = "IVF_SQ8"

    采用 8 位标量量化的 IVF。

- **IvfRabitQ** = "IVF_RABITQ"

    采用 RaBitQ 量化的 IVF。

- **HNSW** = "HNSW"

    分层可导航小世界图。召回率高，搜索速度快。

- **HNSWSQ** = "HNSW_SQ"

    采用标量量化以降低内存用量的 HNSW。

- **HNSWPQ** = "HNSW_PQ"

    采用乘积量化以降低内存用量的 HNSW。

- **HNSWPRQ** = "HNSW_PRQ"

    采用乘积残差量化以降低内存用量的 HNSW。

- **IvfHNSW** = "IVF_HNSW"

    结合 IVF 和 HNSW 的索引。

- **AUTOINDEX** = "AUTOINDEX"

    自动选择最佳索引类型。

- **DISKANN** = "DISKANN"

    适用于大规模数据集的基于磁盘的 ANN 索引。

- **AISAQ** = "AISAQ"

    DiskANN 的一种变体，将 PQ 编码与图内联，以减少每次跳转的随机读取。

- **SCANN** = "SCANN"

    ScaNN（可扩展最近邻）索引。

- **MinHashLSH** = "MINHASH_LSH"

    用于集合相似度的 MinHash LSH 索引。

- **SparseInverted** = "SPARSE_INVERTED_INDEX"

    用于稀疏向量的倒排索引。

- **SparseWAND** = "SPARSE_WAND"

    用于稀疏向量搜索的 WAND 算法。

- **GPUIvfFlat** = "GPU_IVF_FLAT"

    GPU 加速的 IVF-Flat 索引。

- **GPUIvfPQ** = "GPU_IVF_PQ"

    GPU 加速的 IVF-PQ 索引。

- **GPUCagra** = "GPU_CAGRA"

    GPU 加速的 CAGRA 图索引。

- **GPUBruteForce** = "GPU_BRUTE_FORCE"

    GPU 加速的暴力索引。

- **Trie** = "Trie"

    用于字符串字段的 Trie 索引。

- **Sorted** = "STL_SORT"

    用于标量字段的有序索引。

- **Inverted** = "INVERTED"

    用于标量字段的倒排索引。

- **NGRAM** = "NGRAM"

    用于 VARCHAR 字段的 N-gram 索引，可加速子串运算符（LIKE prefix / infix / suffix 及正则匹配）。

- **FMINDEX** = "FMINDEX"

    用于 VARCHAR 字段的 FM-index，可精确处理带锚定的 LIKE（prefix / infix / suffix），无需重新检查候选结果。

- **BITMAP** = "BITMAP"

    用于低基数标量字段的位图索引。

- **RTREE** = "RTREE"

    用于空间数据的 R-tree 索引。

## 示例\{#example}

演示 IndexType 的用法。

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/index"
	"github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    // handle error
}

defer cli.Close(ctx)

// Create an HNSW index on a float vector field
hnswIndex := index.NewHNSWIndex(entity.L2, 16, 200)
_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection", "embedding", hnswIndex))
if err != nil {
    // handle error
}

// Create an IVF_FLAT index
ivfIndex := index.NewIvfFlatIndex(entity.L2, 128)
_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection", "embedding2", ivfIndex))
if err != nil {
    // handle error
}
```
