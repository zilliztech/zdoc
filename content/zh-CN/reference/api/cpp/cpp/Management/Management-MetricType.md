---
title: "MetricType | Cloud"
slug: /cpp/cpp/Management-MetricType
sidebar_label: "MetricType"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "该枚举用于指定向量比较的距离度量。创建索引时，需将 `MetricType` 值传入 `IndexDesc`；执行搜索时，则将其作为搜索请求参数传入。可用选项取决于向量字段的数据类型。 | Cloud"
type: docx
token: Fh1mdjyzRo7LanxIvHqcF9ihnLb
sidebar_position: 17
keywords: 
  - Faiss
  - 视频搜索
  - AI 幻觉
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - MetricType
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# MetricType

该枚举用于指定向量比较的距离度量。创建索引时，需将 `MetricType` 值传入 `IndexDesc`；执行搜索时，则将其作为搜索请求参数传入。可用选项取决于向量字段的数据类型。

```c++
enum class MetricType {
    INVALID = 0,   // synonym: DEFAULT
    DEFAULT = 0,
    L2 = 1,
    IP = 2,
    COSINE = 3,
    HAMMING = 101,
    JACCARD = 102,
    MHJACCARD = 103,
    BM25 = 201,
    MAX_SIM_COSINE = 301,
    MAX_SIM_IP = 302,
    MAX_SIM_L2 = 303,
    MAX_SIM_JACCARD = 401,
    MAX_SIM_HAMMING = 402,
};
```

**取值：**

*稠密浮点向量（`FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR`）：*

- **L2** (1) - 欧氏距离。值越小表示越相似。适用于未归一化的向量。

- **IP** (2) - 内积（点积）。值越大表示越相似。适用于预归一化（单位长度）向量；在此情况下，其数值等同于余弦相似度。

- **COSINE** (3) - 余弦相似度（取值范围 −1 到 1）。值越大表示越相似。当向量可能未归一化时，建议优先选用此项而非 `IP`，因为 Milvus 会在内部自动对向量进行归一化。

*二值向量（`BINARY_VECTOR`）：*

- **HAMMING** (101) - 两个向量间不同比特位的数量（XOR 后的 popcount）。值越小表示越相似。

- **JACCARD** (102) - Jaccard 距离：两个向量中仅有一个向量置位的比特位所占的比例。值越小表示越相似。推荐用于稀疏集合成员向量。

- **MHJACCARD** (103) - 适用于二值向量的修正 Hamming–Jaccard 混合距离。

*稀疏向量（`SPARSE_FLOAT_VECTOR`）：*

- **BM25** (201) - 用于全文检索的 BM25 相关性得分。仅对由 BM25 内置函数生成的稀疏向量有效。得分越高表示相关性越强。

*Struct 字段（多向量 — `STRUCT`）：*

- **MAX_SIM_COSINE** (301) - Struct 字段中所有子向量的最大余弦相似度。

- **MAX_SIM_IP** (302) - Struct 字段中所有子向量的最大内积。

- **MAX_SIM_L2** (303) - Struct 字段中所有子向量的最小 L2 距离（即最大 L2 相似度）。

- **MAX_SIM_JACCARD** (401) - Struct 字段中二值子向量的最大 Jaccard 相似度。

- **MAX_SIM_HAMMING** (402) - Struct 字段中二值子向量的最大 Hamming 相似度。

*特殊值：*

- **INVALID** / **DEFAULT** (0) - 未显式设置；服务端将根据字段数据类型自动确定度量类型。标量字段索引无需设置此值。

## 示例\{#example}

```c++
#include "milvus/MilvusClientV2.h"
#include <milvus/MilvusClientV2.h>
#include <milvus/types/MetricType.h>
using namespace milvus;

auto client = MilvusClientV2::Create();
client->Connect(ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));

// Float vector: cosine similarity (recommended for unnormalized embeddings)
IndexDesc idx_float("vec", "vec_idx", IndexType::HNSW, MetricType::COSINE);
idx_float.AddExtraParam("M", "16");
idx_float.AddExtraParam("efConstruction", "200");

// Binary vector: Hamming distance
IndexDesc idx_bin("bin_vec", "bin_idx", IndexType::BIN_FLAT, MetricType::HAMMING);

// Sparse vector: BM25 for full-text search
IndexDesc idx_sparse("sparse_vec", "sparse_idx",
                     IndexType::SPARSE_INVERTED_INDEX, MetricType::BM25);

client->CreateIndex(
    CreateIndexRequest()
        .WithCollectionName("my_collection")
        .WithSync(true)
        .AddIndex(std::move(idx_float))
        .AddIndex(std::move(idx_bin))
        .AddIndex(std::move(idx_sparse)));
```
