---
title: "TruncateCollection | Go | v2"
slug: /go/go/v2-Collection-TruncateCollection
sidebar_label: "TruncateCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会移除 Collection 中的所有数据，同时保留其 Schema。 | Go | v2"
type: docx
token: CNcvdxPmgo6P3nx6t1tcW4R6nXf
sidebar_position: 25
keywords: 
  - 相似性搜索
  - 多模态 RAG
  - LLM 幻觉
  - 混合搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - TruncateCollection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# TruncateCollection

此操作会移除 Collection 中的所有数据，同时保留其 Schema。

```go
func (c *Client) TruncateCollection(ctx context.Context, option TruncateCollectionOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 TruncateCollection() 的请求。

```go
option := milvusclient.NewTruncateCollectionOption(collectionName)

err := client.TruncateCollection(ctx, option)
```

**参数：**

- **name** (*string*) -

    **[必需]**

    要创建的 Collection 的名称。

**构建器方法：**

- `NewTruncateCollectionOption(name string)`

    创建用于截断 Collection 的选项。`name` 指定要截断的 Collection。

**返回类型：**

*error*

**返回：**

Collection 被截断后返回 nil。如果操作失败，则返回错误。

**错误处理：**

- **error**

    操作失败。请求构建或 RPC 失败。请检查 `err != nil` 以了解失败详情。

## 示例\{#example}

演示 TruncateCollection() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

err = cli.TruncateCollection(ctx, milvusclient.NewTruncateCollectionOption("books"))
if err != nil {
	// handle error
}
```
