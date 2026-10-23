---
title: "IndexType | Cloud"
slug: /cpp/cpp/Management-IndexType
sidebar_label: "IndexType"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此枚举用于选择索引算法。调用 `CreateIndex()` 时，请向 `IndexDesc` 传递一个 `IndexType` 值。有效选项取决于字段的数据类型。 | Cloud"
type: docx
token: WiGbdKAIsoACkixKYHqcVz41npf
sidebar_position: 14
keywords: 
  - 向量 Database 教程
  - 向量 Database 如何工作
  - 向量 Database 对比
  - openai 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - IndexType
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# IndexType

此枚举用于选择索引算法。调用 `CreateIndex()` 时，请向 `IndexDesc` 传递一个 `IndexType` 值。有效选项取决于字段的数据类型。

```c++
enum class IndexType {
    INVALID = 0,
    // Dense float — CPU
    FLAT = 1, IVF_FLAT = 2, IVF_SQ8 = 3, IVF_PQ = 4,
    HNSW = 5, DISKANN = 6, AUTOINDEX = 7, SCANN = 8,
    HNSW_SQ = 9, HNSW_PQ = 10, HNSW_PRQ = 11, IVF_RABITQ = 12,
    // Dense float — GPU
    GPU_IVF_FLAT = 201, GPU_IVF_PQ = 202,
    GPU_BRUTE_FORCE = 203, GPU_CAGRA = 204,
    // Binary vectors
    BIN_FLAT = 1001, BIN_IVF_FLAT = 1002, MINHASH_LSH = 1003,
    // Scalar fields
    TRIE = 1101, STL_SORT = 1102, INVERTED = 1103,
    BITMAP = 1104, NGRAM = 1105, FMINDEX = 1106,
    // Sparse vectors
    SPARSE_INVERTED_INDEX = 1201, SPARSE_WAND = 1202,
};
```

**值：**

*稠密浮点向量 — CPU（`FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR`）：*

- **FLAT** (1) - 暴力精确搜索。召回率为 100%；无需训练。最适合小型数据集（少于 100 万个向量）。

- **IVF_FLAT** (2) - 倒排文件索引。将向量聚类到 `nlist` 个桶中，并搜索最近的 `nprobe` 个桶。额外参数：`nlist`（必需）。

- **IVF_SQ8** (3) - 采用标量量化（int8）的 IVF。与 `IVF_FLAT` 相比内存占用更小，但召回率会略有下降。额外参数：`nlist`（必需）。

- **IVF_PQ** (4) - 采用乘积量化的 IVF。压缩率最高。额外参数：`nlist`、`m`、`nbits`。

- **HNSW** (5) - 分层可导航小世界图。对于内存数据集，在速度和召回率之间实现了最佳平衡。额外参数：`M`（必需）、`efConstruction`（必需）。

- **DISKANN** (6) - 基于磁盘的 ANN 索引，适用于过大而无法放入 RAM 的数据集。内存占用低，且召回率良好。

- **AUTOINDEX** (7) - Milvus 会为数据自动选择最佳的索引类型和参数。推荐用于快速开始。

- **SCANN** (8) - ScaNN（可扩展最近邻）算法。召回率高，速度也颇具竞争力。

- **HNSW_SQ** (9) - 采用标量量化的 HNSW。与 `HNSW` 相比可减少内存占用，且召回率损失极小。

- **HNSW_PQ** (10) - 采用乘积量化的 HNSW。可进一步减少内存占用，但会带来一定的召回率损失。

- **HNSW_PRQ** (11) - 采用乘积残差量化的 HNSW。在 HNSW 的各量化变体中召回率最佳。

- **IVF_RABITQ** (12) - 采用 RaBitQ 二值量化的 IVF。内存占用极低；召回率具有竞争力。

*稠密浮点向量 — GPU：*

- **GPU_IVF_FLAT** (201) - 由 GPU 加速的 `IVF_FLAT`。需要配备 CUDA 的 NVIDIA GPU。

- **GPU_IVF_PQ** (202) - 由 GPU 加速的 `IVF_PQ`。在 GPU 上内存占用最低。

- **GPU_BRUTE_FORCE** (203) - GPU 精确暴力搜索。召回率为 100%；是在 GPU 上进行小批量查询时最快的选项。

- **GPU_CAGRA** (204) - 基于图的 GPU CAGRA 索引。在 GPU 上查询吞吐量最高；最适合大规模 GPU 工作负载。

*二值向量（`BINARY_VECTOR`）：*

- **BIN_FLAT** (1001) - 二值向量的暴力精确搜索。

- **BIN_IVF_FLAT** (1002) - 用于二值向量的 IVF 精确搜索。额外参数：`nlist`。

- **MINHASH_LSH** (1003) - 基于 MinHash 的 LSH 索引。专为二值向量上的 Jaccard 相似度设计。

*标量字段（INT*、FLOAT、DOUBLE、VARCHAR、BOOL、ARRAY）：&ast;

- **TRIE** (1101) - 前缀树索引。**仅适用于 VARCHAR。** 支持前缀过滤；对于字符串等值查询和前缀查询速度最快。

- **STL_SORT** (1102) - 排序数组索引。**仅适用于数值标量字段。** 最适合低基数数值字段的范围查询。

- **INVERTED** (1103) - 倒排索引。支持除 JSON 外的所有标量类型。是类型覆盖范围最广的通用标量索引。

- **BITMAP** (1104) - 位图索引。支持除 JSON、FLOAT 和 DOUBLE 外的所有标量类型。最适合低基数字段（例如状态码、类布尔整数）。

- **NGRAM** (1105) - N-gram 索引。**仅适用于 VARCHAR 或 JSON 路径。** 支持快速的中缀搜索（`LIKE '%keyword%'`）以及分词文本搜索。

- **FMINDEX** (1106) - 用于在 `TEXT` 和 `VARCHAR` 字段上进行全文搜索的 FM（频率矩阵）索引。

*稀疏向量（`SPARSE_FLOAT_VECTOR`）：*

- **SPARSE_INVERTED_INDEX** (1201) - 用于稀疏浮点向量的倒排索引。召回率最高；是稀疏向量的推荐默认选项。

- **SPARSE_WAND** (1202) - 用于稀疏向量的弱 AND（WAND）算法。对于大型结果集，它的速度比 `SPARSE_INVERTED_INDEX` 更快，但会带来少量召回率损失。

*内部：*

- **INVALID** (0) - 未初始化；请勿直接使用。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
#include <milvus/types/IndexType.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

// HNSW for float vector (most common choice)
IndexDesc idx_hnsw("vec", "vec_idx", IndexType::HNSW, MetricType::COSINE);
idx_hnsw.AddExtraParam("M", "16");
idx_hnsw.AddExtraParam("efConstruction", "200");

// INVERTED for a VARCHAR scalar field
IndexDesc idx_inv("name", "name_idx", IndexType::INVERTED);

// SPARSE_INVERTED_INDEX for full-text search
IndexDesc idx_sparse("sparse_vec", "sparse_idx",
                     IndexType::SPARSE_INVERTED_INDEX, MetricType::BM25);

client->CreateIndex(
    CreateIndexRequest()
        .WithCollectionName("my_collection")
        .WithSync(true)
        .AddIndex(std::move(idx_hnsw))
        .AddIndex(std::move(idx_inv))
        .AddIndex(std::move(idx_sparse)));
```
