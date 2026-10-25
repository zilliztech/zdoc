---
title: "NewHNSWPQIndex | Go | v2"
slug: /go/go/v2-Index-NewHNSWPQIndex
sidebar_label: "NewHNSWPQIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建一个带有乘积量化（HNSWPQ）的 HNSW 索引配置，在 HNSW 图的基础上使用乘积量化压缩向量。 | Go | v2"
type: docx
token: CSCNdLVEGoURMaxD9iXcw11onhE
sidebar_position: 29
keywords: 
  - Chroma 向量 Database
  - NLP 搜索
  - LLM 幻觉
  - 多模态搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - NewHNSWPQIndex
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# NewHNSWPQIndex

此操作会创建一个带有乘积量化（HNSW_PQ）的 HNSW 索引配置，在 HNSW 图的基础上使用乘积量化压缩向量。

```go
func NewHNSWPQIndex(metricType MetricType, m int, efConstruction int, pqM int, nbits int) *hnswPQIndex
```

## 请求语法\{#request-syntax}

使用图参数 m 和 efConstruction 以及乘积量化参数 pqM 和 nbits 创建 HNSW_PQ 索引配置。

```go
NewHNSWPQIndex(metricType MetricType, m int, efConstruction int, pqM int, nbits int) *hnswPQIndex
```

**参数：**

- **metricType**（[MetricType](./v2-Management-MetricType)） -

    **[必需]**

- **m**（*int*） -

    **[必需]**

- **efConstruction**（*int*） -

    **[必需]**

- **pqM**（*int*） -

    **[必需]**

- **nbits**（*int*） -

    **[必需]**

**构建器方法：**

- `WithRefineType(refineType string) *hnswPQIndex`

    此方法设置应用于量化距离的细化策略。

**返回类型：**

&ast;*hnswPQIndex*

**返回：**

返回 HNSW_PQ 索引配置实例。

**参数：**

- **index**（&ast;*hnswPQIndex*） -

    HNSW_PQ 索引配置实例。通过 index 选项将其传递给 CreateIndex()。

**错误处理：**

- **error**

    校验、请求构建或 RPC 失败。请检查返回的错误以获取失败详情。

## 示例\{#example}

演示 NewHNSWPQIndex 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/index"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewHNSWPQIndex(entity.MetricTypeL2, 16, 200, 8, 8)))
if err != nil {
	// handle error
}
```
