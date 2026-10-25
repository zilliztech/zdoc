---
title: "NewHNSWSQIndex | Go | v2"
slug: /go/go/v2-Index-NewHNSWSQIndex
sidebar_label: "NewHNSWSQIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建使用标量量化的 HNSW 索引配置（HNSWSQ），在 HNSW 图的基础上使用标量量化压缩向量。 | Go | v2"
type: docx
token: DF4UdECmLoD4mkxNi8scrntlnmf
sidebar_position: 31
keywords: 
  - 向量存储
  - 开源向量 Database
  - 向量索引
  - 向量 Database 开源
  - Zilliz
  - Zilliz Cloud
  - 云
  - NewHNSWSQIndex
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# NewHNSWSQIndex

此操作会创建使用标量量化的 HNSW 索引配置（HNSW_SQ），在 HNSW 图的基础上使用标量量化压缩向量。

```go
func NewHNSWSQIndex(metricType MetricType, m int, efConstruction int, sqType string) *hnswSQIndex
```

## 请求语法\{#request-syntax}

使用图参数 m 和 efConstruction 以及标量量化类型 sqType 创建 HNSW_SQ 索引配置。

```go
NewHNSWSQIndex(metricType MetricType, m int, efConstruction int, sqType string) *hnswSQIndex
```

**参数：**

- **metricType** （[MetricType](./v2-Management-MetricType)） -

    **[必需]**

- **m** （*int*） -

    **[必需]**

- **efConstruction** （*int*） -

    **[必需]**

- **sqType** （*string*） -

    **[必需]**

**构建器方法：**

- `WithRefineType(refineType string) *hnswSQIndex`

    设置应用于量化距离的细化策略。

**返回类型：**

&ast;*hnswSQIndex*

**返回：**

返回 HNSW_SQ 索引配置实例。

**参数：**

- **index** （&ast;*hnswSQIndex*） -

    HNSW_SQ 索引配置实例。通过索引选项将其传递给 CreateIndex()。

**错误处理：**

- **error**

    验证、请求构造或 RPC 失败。请检查返回的错误以了解失败详情。

## 示例\{#example}

演示 NewHNSWSQIndex 的用法。

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

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewHNSWSQIndex(entity.MetricTypeL2, 16, 200, "SQ8")))
if err != nil {
	// handle error
}
```
