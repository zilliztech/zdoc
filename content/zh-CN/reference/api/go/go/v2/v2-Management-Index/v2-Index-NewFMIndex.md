---
title: "NewFMIndex | Go | v2"
slug: /go/go/v2-Index-NewFMIndex
sidebar_label: "NewFMIndex"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建 FM-index 配置，用于对大型文本 Collection 执行全文搜索。 | Go | v2"
type: docx
token: Ssc4diNLwoorWTxbH6ecs2ZenAd
sidebar_position: 28
keywords: 
  - Milvus 开源
  - Milvus 如何工作
  - Zilliz 向量 Database
  - Zilliz Database
  - zilliz
  - zilliz cloud
  - 云
  - NewFMIndex
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# NewFMIndex

此操作会创建 FM-index 配置，用于对大型文本 Collection 执行全文搜索。

```go
func NewFMIndex() *FMIndex
```

## 请求语法\{#request-syntax}

创建 FM-index 配置。

```go
NewFMIndex() *FMIndex
```

**构建器方法：**

- `WithIndexName(name string) *FMIndex`

    用于设置索引名称。

- `WithSaSampleRate(rate int) *FMIndex`

    用于设置后缀数组的采样率。

- `WithBlockBytes(blockBytes int) *FMIndex`

    用于设置块大小（以字节为单位）。

**返回类型：**

&ast;*FMIndex*

**返回：**

返回 FM-index 配置实例。

**参数：**

- **index** （&ast;*FMIndex*） -

    FM-index 配置实例。通过索引选项将其传递给 CreateIndex()。

**错误处理：**

- **error**

    验证、请求构造或 RPC 失败。请检查返回的错误以了解失败详情。

## 示例\{#example}

演示 NewFMIndex 的用法。

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

task, err := cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("books", "embedding", index.NewFMIndex()))
if err != nil {
	// handle error
}
```
