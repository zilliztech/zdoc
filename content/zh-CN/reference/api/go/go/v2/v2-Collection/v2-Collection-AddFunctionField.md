---
title: "AddFunctionField | Go | v2"
slug: /go/go/v2-Collection-AddFunctionField
sidebar_label: "AddFunctionField"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会在客户端校验字段和函数选项后，向现有 Collection 添加函数字段。 | Go | v2"
type: docx
token: Tn98dTncaoafNVxRazGc47auneY
sidebar_position: 27
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - zilliz
  - zilliz cloud
  - 云
  - AddFunctionField
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# AddFunctionField

此操作会在客户端校验字段和函数选项后，向现有 Collection 添加函数字段。

```go
func (c *Client) AddFunctionField(ctx context.Context, opt AddFunctionFieldOption, callOpts ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 AddFunctionField() 的请求。

```go
option := milvusclient.NewAddFunctionFieldOption(collectionName, field, function, boundIndex).
    WithIndexName(indexName)

err := client.AddFunctionField(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

- **field** （&ast;*entity.Field*） -

    **[必需]**

    用于 AddFunctionField 的字段（Entity）。

- **function** （&ast;*entity.Function*） -

    **[必需]**

    用于 AddFunctionField 的函数（Entity）。

- **boundIndex** （*index.Index*） -

    **[必需]**

    用于 AddFunctionField 的 boundIndex。

**构建器方法：**

- `NewAddFunctionFieldOption(collectionName string, field *entity.Field, function *entity.Function, boundIndex index.Index)`

    创建用于添加函数字段的选项。`field` 定义函数输出字段，`function` 描述内置函数（BM25 或 MinHash），`boundIndex` 是绑定到输出字段的索引。

- `WithIndexName(indexName string)`

    设置绑定到函数输出字段的索引的名称。

**返回类型：**

*error*

**返回：**

添加函数字段后返回 nil。当客户端校验或 RPC 失败时，返回错误。

**错误处理：**

- **error**

    该操作会失败。校验、请求构造或 RPC 失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 AddFunctionField() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/index"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

outputField := entity.NewField().
	WithName("sparse_vector").
	WithDataType(entity.FieldTypeSparseVector)

fn := entity.NewFunction().
	WithName("bm25_fn").
	WithType(entity.FunctionTypeBM25).
	WithInputFields("text").
	WithOutputFields("sparse_vector")

boundIndex := index.NewSparseInvertedIndex(entity.IP, 0.2)

err = cli.AddFunctionField(ctx, milvusclient.NewAddFunctionFieldOption("books", outputField, fn, boundIndex).
	WithIndexName("bm25_index"))
if err != nil {
	// handle error
}
```
