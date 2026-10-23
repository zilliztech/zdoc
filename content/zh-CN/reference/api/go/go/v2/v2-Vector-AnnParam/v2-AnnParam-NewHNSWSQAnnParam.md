---
title: "NewHNSWSQAnnParam | Go | v2"
slug: /go/go/v2-AnnParam-NewHNSWSQAnnParam
sidebar_label: "NewHNSWSQAnnParam"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作为 HNSWSQ 索引创建搜索参数配置，用于调整标量量化 HNSW 图的搜索时行为。 | Go | v2"
type: docx
token: EYsfdEOCqow86txk8EUcXRB6ndf
sidebar_position: 14
keywords: 
  - 深度学习
  - 知识库
  - 自然语言处理
  - AI 聊天机器人
  - Zilliz
  - Zilliz Cloud
  - 云
  - NewHNSWSQAnnParam
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewHNSWSQAnnParam

此操作为 HNSW_SQ 索引创建搜索参数配置，用于调整标量量化 HNSW 图的搜索时行为。

```go
func NewHNSWSQAnnParam(ef int) *hnswQuantAnnParam
```

## 请求语法\{#request-syntax}

使用指定的搜索工作量 ef 创建量化 HNSW 搜索参数配置。

```go
NewHNSWSQAnnParam(ef int) *hnswQuantAnnParam
```

**参数：**

- **ef** (*int*) - 

    **[必需]**

**构建器方法：**

- `WithRefineK(refineK float64) *hnswQuantAnnParam`

    设置应用于量化候选距离的细化因子。

- `WithSeedEf(seedEf int) *hnswQuantAnnParam`

    设置用于预热图搜索的种子搜索工作量。

- `Params() map[string]any`

    以 map 形式返回当前的搜索参数。

**返回类型：**

&ast;*hnswQuantAnnParam*

**返回：**

返回量化 HNSW 搜索参数配置。

**参数：**

- **annParam** (&ast;*hnswQuantAnnParam*) -

    量化 HNSW 搜索参数配置。通过 WithAnnParam() 将其传递给搜索或混合搜索选项。

**错误处理：**

- **error**

    验证、请求构造或 RPC 失败。请检查返回的错误以获取失败详情。

## 示例\{#example}

演示 NewHNSWSQAnnParam 的用法。

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
	WithAnnParam(index.NewHNSWSQAnnParam(64)))
if err != nil {
	// handle error
}
```
