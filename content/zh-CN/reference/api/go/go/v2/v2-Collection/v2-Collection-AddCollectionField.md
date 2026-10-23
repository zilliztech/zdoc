---
title: "AddCollectionField() | Go | v2"
slug: /go/go/v2-Collection-AddCollectionField
sidebar_label: "AddCollectionField()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作通过在服务器上更改 Collection 的 Schema，向现有 Collection 添加一个可空字段，然后从客户端清除该 Collection 的 Collection 缓存。 | Go | v2"
type: docx
token: NmAwdxspJop8U0xi2DPcNYpmnBe
sidebar_position: 1
keywords: 
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - AddCollectionField()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AddCollectionField()

此操作通过在服务器上更改 Collection 的 Schema，向现有 Collection 添加一个可空字段，然后从客户端清除该 Collection 的 Collection 缓存。

```go
func (c *Client) AddCollectionField(ctx context.Context, opt AddCollectionFieldOption, callOpts ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 AddCollectionField() 的请求。

```go
option := milvusclient.NewAddCollectionFieldOption(collectionName, field)

err := client.AddCollectionField(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    要添加该字段的 Collection 名称。

- **field** （&ast;*Entity.Field*） -

    **[必需]**

    要添加的字段定义。向量字段必须可为空。

**构建器方法：**

- `NewAddCollectionFieldOption(collectionName string, field *entity.Field)`

    创建 AddCollectionField() 的请求。

**返回类型：**

*error*

**返回：**

操作成功后返回 nil。当客户端验证或 RPC 失败时，返回错误。

**异常：**

- **error**

    客户端验证或 RPC 失败。请检查返回的错误以了解失败详情。

## 示例\{#example}

演示 AddCollectionField 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/entity"
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

field := entity.NewField().
	WithName("new_field").
	WithDataType(entity.FieldTypeInt64).
	WithNullable(true)

err = cli.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("books", field))
if err != nil {
	// handle error
}
```
