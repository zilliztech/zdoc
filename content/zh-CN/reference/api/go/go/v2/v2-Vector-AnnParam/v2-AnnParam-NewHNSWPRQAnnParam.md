---
title: "NewHNSWPRQAnnParam | Go | v2"
slug: /go/go/v2-AnnParam-NewHNSWPRQAnnParam
sidebar_label: "NewHNSWPRQAnnParam"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会为 HNSWPRQ 索引创建搜索参数配置，用于调整乘积残差量化 HNSW 图的搜索时行为。 | Go | v2"
type: docx
token: Q0fhdp89yoorcSxu0nxct5unnWe
sidebar_position: 13
keywords: 
  - 语义搜索
  - 异常检测
  - 句子转换器
  - 推荐系统
  - Zilliz
  - Zilliz Cloud
  - 云
  - NewHNSWPRQAnnParam
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewHNSWPRQAnnParam

此操作会为 HNSW_PRQ 索引创建搜索参数配置，用于调整乘积残差量化 HNSW 图的搜索时行为。

```go
func NewHNSWPRQAnnParam(ef int) *hnswQuantAnnParam
```

## 请求语法\{#request-syntax}

使用给定的搜索力度 ef 创建量化 HNSW 搜索参数配置。

```go
NewHNSWPRQAnnParam(ef int) *hnswQuantAnnParam
```

**参数：**

- **ef** （*int*） -

    **[必需]**

**构建器方法：**

- `WithRefineK(refineK float64) *hnswQuantAnnParam`

    此方法设置应用于量化候选距离的细化因子。

- `WithSeedEf(seedEf int) *hnswQuantAnnParam`

    此方法设置用于预热图搜索的种子搜索力度。

- `Params() map[string]any`

    此方法以 map 形式返回当前搜索参数。

**返回类型：**

&ast;*hnswQuantAnnParam*

**返回：**

返回量化 HNSW 的搜索参数配置。

**参数：**

- **annParam** （&ast;*hnswQuantAnnParam*） -

    量化 HNSW 的搜索参数配置。通过 WithAnnParam() 将其传递给搜索或混合搜索选项。

**异常处理：**

- **error**

    校验、请求构造或 RPC 失败。请检查返回的错误以获取失败详情。

## 示例\{#example}

演示 NewHNSWPRQAnnParam 的用法。

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
	WithAnnParam(index.NewHNSWPRQAnnParam(64)))
if err != nil {
	// handle error
}
```
