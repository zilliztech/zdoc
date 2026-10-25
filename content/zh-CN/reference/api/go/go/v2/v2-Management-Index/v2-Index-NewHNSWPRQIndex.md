---
title: "NewHNSWPRQIndex | Go | v2"
slug: /go/go/v2-Index-NewHNSWPRQIndex
sidebar_label: "NewHNSWPRQIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作创建采用乘积残差量化（HNSWPRQ）的 HNSW 索引配置，并通过多个残差量化阶段细化压缩后的距离。 | Go | v2"
type: docx
token: NBFFdeNtcoQFP4xUj3vccXWGnJe
sidebar_position: 30
keywords: 
  - Zilliz 向量 Database
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - Zilliz
  - Zilliz 云
  - 云
  - NewHNSWPRQIndex
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# NewHNSWPRQIndex

此操作创建采用乘积残差量化（HNSW_PRQ）的 HNSW 索引配置，并通过多个残差量化阶段细化压缩后的距离。

```go
func NewHNSWPRQIndex(metricType MetricType, m int, efConstruction int, pqM int, nrq int, nbits int) *hnswPRQIndex
```

## 请求语法\{#request-syntax}

创建包含图参数 m 和 efConstruction、乘积量化参数 pqM 以及残差量化参数 nrq 和 nbits 的 HNSW_PRQ 索引配置。

```go
NewHNSWPRQIndex(metricType MetricType, m int, efConstruction int, pqM int, nrq int, nbits int) *hnswPRQIndex
```

**参数：**

- **metricType** （[MetricType](./v2-Management-MetricType)） -

    **[必需]**

- **m** （*int*） -

    **[必需]**

- **efConstruction** （*int*） -

    **[必需]**

- **pqM** （*int*） -

    **[必需]**

- **nrq** （*int*） -

    **[必需]**

- **nbits** （*int*） -

    **[必需]**

**构建器方法：**

- `WithRefineType(refineType string) *hnswPRQIndex`

    此方法设置应用于量化距离的细化策略。

**返回类型：**

&ast;*hnswPRQIndex*

**返回：**

返回 HNSW_PRQ 索引配置实例。

**参数：**

- **index** （&ast;*hnswPRQIndex*） -

    该 HNSW_PRQ 索引配置实例。通过 index 选项将其传递给 CreateIndex()。

**异常处理：**

- **error**

    校验、请求构造或 RPC 失败。请检查返回的错误以获取失败详情。

## 示例\{#example}

演示 NewHNSWPRQIndex 的用法。

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

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewHNSWPRQIndex(entity.MetricTypeL2, 16, 200, 8, 2, 8)))
if err != nil {
	// handle error
}
```
