---
title: "MetricType | Go | v2"
slug: /go/go/v2-Management-MetricType
sidebar_label: "MetricType"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "MetricType 实例枚举用于向量相似度搜索的距离度量类型。 | Go | v2"
type: docx
token: DWgIdWBkWoypMGx36Dmcf41AnGg
sidebar_position: 21
keywords: 
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - LLM 作为评判者
  - Zilliz
  - Zilliz Cloud
  - 云
  - MetricType
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# MetricType

MetricType 实例枚举用于向量相似度搜索的距离度量类型。

```go
type MetricType string
```

**取值：**

- **L2** = "L2"

    欧几里得（L2）距离。值越小表示相似度越高。

- **IP** = "IP"

    内积距离。值越大表示相似度越高。

- **COSINE** = "COSINE"

    余弦相似度。取值范围为 -1 到 1，其中 1 表示最相似。

- **HAMMING** = "HAMMING"

    二进制向量的汉明距离。

- **JACCARD** = "JACCARD"

    二进制向量的 Jaccard 距离。

- **TANIMOTO** = "TANIMOTO"

    二进制向量的 Tanimoto 距离。

- **SUBSTRUCTURE** = "SUBSTRUCTURE"

    二进制向量的子结构距离。

- **SUPERSTRUCTURE** = "SUPERSTRUCTURE"

    二进制向量的超结构距离。

- **BM25** = "BM25"

    用于全文搜索的 BM25 相关性评分。

- **MHJACCARD** = "MHJACCARD"

    MHJACCARD。

- **MaxSim** = "MAX_SIM"

    MaxSim。

- **MaxSimCosine** = "MAX_SIM_COSINE"

    MaxSimCosine。

- **MaxSimL2** = "MAX_SIM_L2"

    MaxSimL2。

- **MaxSimIP** = "MAX_SIM_IP"

    MaxSimIP。

- **MaxSimHamming** = "MAX_SIM_HAMMING"

    MaxSimHamming。

- **MaxSimJaccard** = "MAX_SIM_JACCARD"

    MaxSimJaccard。

## 示例\{#example}

演示 MetricType 的用法。

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

// Use MetricType when creating an index
// L2 (Euclidean distance) for float vectors
hnswIndex := index.NewHNSWIndex(entity.L2, 16, 200)
_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection", "embedding", hnswIndex))
if err != nil {
    // handle error
}

// IP (Inner Product) for normalized vectors
ipIndex := index.NewHNSWIndex(entity.IP, 16, 200)
_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection", "normalized_embedding", ipIndex))
if err != nil {
    // handle error
}
```
