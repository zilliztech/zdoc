---
title: "NewAISAQAnnParam | Go | v2"
slug: /go/go/v2-AnnParam-NewAISAQAnnParam
sidebar_label: "NewAISAQAnnParam"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建 AISAQ 搜索参数配置，用于调整 AISAQ 索引的搜索时行为。 | Go | v2"
type: docx
token: D61ndr0TSocZRbxxLnRcfXr3nVg
sidebar_position: 11
keywords: 
  - 什么是 Milvus
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - zilliz
  - zilliz cloud
  - 云
  - NewAISAQAnnParam
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# NewAISAQAnnParam

此操作会创建 AISAQ 搜索参数配置，用于调整 AISAQ 索引的搜索时行为。

```go
func NewAISAQAnnParam(searchList int) *aisaqAnnParam
```

## 请求语法\{#request-syntax}

使用给定的搜索列表长度创建 AISAQ 搜索参数配置。

```go
NewAISAQAnnParam(searchList int) *aisaqAnnParam
```

**参数：**

- **searchList** （*int*） -

    **[必需]**

**构建器方法：**

- `WithBeamwidth(beamwidth int) *aisaqAnnParam`

    设置搜索波束宽度。

- `WithPQReadPageCacheSize(bytes int) *aisaqAnnParam`

    设置用于乘积量化读取的页缓存大小。

- `WithVectorsBeamwidth(beamwidth int) *aisaqAnnParam`

    设置用于向量读取的波束宽度。

- `Params() map[string]any`

    以映射形式返回当前搜索参数。

**返回类型：**

&ast;*aisaqAnnParam*

**返回：**

返回 AISAQ 搜索参数配置。

**参数：**

- **annParam** （&ast;*aisaqAnnParam*） -

    AISAQ 搜索参数配置。通过 WithAnnParam() 将其传递给搜索或混合搜索选项。

**错误处理：**

- **error**

    验证、请求构造或 RPC 失败。请检查返回的错误以了解失败详情。

## 示例\{#example}

演示 NewAISAQAnnParam 的用法。

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
	WithAnnParam(index.NewAISAQAnnParam(64)))
if err != nil {
	// handle error
}
```
