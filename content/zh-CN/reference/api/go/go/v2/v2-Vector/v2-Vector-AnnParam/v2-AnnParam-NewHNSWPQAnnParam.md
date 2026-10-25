---
title: "NewHNSWPQAnnParam | Go | v2"
slug: /go/go/v2-AnnParam-NewHNSWPQAnnParam
sidebar_label: "NewHNSWPQAnnParam"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建一个由 HNSW 量化索引系列（HNSWSQ、HNSWPQ 和 HNSWPRQ）共享的搜索参数配置，用于调整量化 HNSW 索引在搜索时的行为。NewHNSWPRQAnnParam() 和 NewHNSWSQAnnParam() 返回相同类型的配置，并具有相同的构建器方法。 | Go | v2"
type: docx
token: Fq1YdfEGFof2dixygELcgaomnrb
sidebar_position: 12
keywords: 
  - 机器学习
  - RAG
  - NLP
  - 神经网络
  - Zilliz
  - Zilliz Cloud
  - 云
  - NewHNSWPQAnnParam
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# NewHNSWPQAnnParam

此操作会创建一个由 HNSW 量化索引系列（HNSW_SQ、HNSW_PQ 和 HNSW_PRQ）共享的搜索参数配置，用于调整量化 HNSW 索引在搜索时的行为。NewHNSWPRQAnnParam() 和 NewHNSWSQAnnParam() 返回相同类型的配置，并具有相同的构建器方法。

```go
func NewHNSWPQAnnParam(ef int) *hnswQuantAnnParam
```

## 请求语法\{#request-syntax}

使用给定的搜索力度 ef 创建量化 HNSW 搜索参数配置。

```go
NewHNSWPQAnnParam(ef int) *hnswQuantAnnParam
```

**参数：**

- **ef**（*int*） -

    **[必需]**

**构建器方法：**

- `WithRefineK(refineK float64) *hnswQuantAnnParam`

    此方法设置应用于量化候选距离的细化系数。

- `WithSeedEf(seedEf int) *hnswQuantAnnParam`

    此方法设置用于预热图搜索的种子搜索力度。

- `Params() map[string]any`

    此方法以 map 形式返回当前搜索参数。

**返回类型：**

&ast;*hnswQuantAnnParam*

**返回：**

返回量化 HNSW 搜索参数配置。

**参数：**

- **annParam**（&ast;*hnswQuantAnnParam*） -

    量化 HNSW 搜索参数配置。请通过 WithAnnParam() 将其传递给搜索或混合搜索选项。

**错误处理：**

- **error**

    校验、请求构建或 RPC 失败。请检查返回的错误以获取失败详情。

## 示例\{#example}

演示 NewHNSWPQAnnParam 的用法。

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

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption("books", 10, vectors).
	WithAnnParam(index.NewHNSWPQAnnParam(64)))
if err != nil {
	// handle error
}
```
