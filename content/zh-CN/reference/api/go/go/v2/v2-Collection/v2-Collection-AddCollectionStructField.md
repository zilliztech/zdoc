---
title: "AddCollectionStructField | Go | v2"
slug: /go/go/v2-Collection-AddCollectionStructField
sidebar_label: "AddCollectionStructField"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会在客户端验证字段选项后，向现有 Collection 添加结构体数组字段。 | Go | v2"
type: docx
token: ZSsxdrxftoPHDhxu0u6c8j2Fntm
sidebar_position: 26
keywords: 
  - 上下文窗口
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - zilliz
  - zilliz cloud
  - 云
  - AddCollectionStructField
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AddCollectionStructField

此操作会在客户端验证字段选项后，向现有 Collection 添加结构体数组字段。

```go
func (c *Client) AddCollectionStructField(ctx context.Context, opt AddCollectionStructFieldOption, callOpts ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 AddCollectionStructField() 的请求。

```go
option := milvusclient.NewAddCollectionStructFieldOption(collectionName, field)

err := client.AddCollectionStructField(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

- **field** （&ast;*entity.Field*） -

    **[必需]**

    用于 AddCollectionStructField 的 Entity 字段。

**构建器方法：**

- `NewAddCollectionStructFieldOption(collectionName string, field *entity.Field)`

    创建用于添加结构体数组字段的选项。该字段必须使用 Array 数据类型和 Struct 元素类型，并包含结构体 Schema。`collectionName` 指定 Collection，`field` 定义要添加的字段。

**返回类型：**

*error*

**返回：**

添加字段后返回 nil。当客户端验证或 RPC 失败时，返回错误。

**异常：**

- **error**

    操作失败。验证、请求构建或 RPC 失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 AddCollectionStructField() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{Address: "YOUR_CLUSTER_ENDPOINT"})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

structSchema := entity.NewStructSchema().
	WithField(entity.NewField().WithName("title").WithDataType(entity.FieldTypeVarChar).WithMaxLength(256))

field := entity.NewField().
	WithName("chunks").
	WithDataType(entity.FieldTypeArray).
	WithElementType(entity.FieldTypeStruct).
	WithStructSchema(structSchema)

err = cli.AddCollectionStructField(ctx, milvusclient.NewAddCollectionStructFieldOption("books", field))
if err != nil {
	// handle error
}
```
