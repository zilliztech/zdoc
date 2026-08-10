---
title: "AddCollectionField() | Go | v2"
slug: /go/go/v2-Collection-AddCollectionField
sidebar_label: "AddCollectionField()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "在客户端验证字段选项后，为现有 Collection 添加一个可为 null 的字段。 | Go | v2"
type: docx
token: NmAwdxspJop8U0xi2DPcNYpmnBe
sidebar_position: 1
keywords: 
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - vectordb
  - zilliz
  - zilliz cloud
  - 云
  - AddCollectionField()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AddCollectionField()

在客户端验证字段选项后，为现有 Collection 添加一个可为 null 的字段。

```go
func (c *Client) AddCollectionField(ctx context.Context, opt AddCollectionFieldOption, callOpts ...grpc.CallOption) error
```

**参数：**

- **collectionName** (*string*) -

    **[必需]**

    要添加字段的 Collection 名称。

- **field** (**entity.Field*) -

    **[必需]**

    要添加的字段定义。向量字段必须可为 null。

**返回类型：**

*error*

**返回值：**

字段添加完成后返回 nil。当客户端验证失败或 RPC 失败时，返回错误。

**错误处理：**

- **error**

    验证、请求构造或 RPC 失败。请检查返回的错误以获取失败详情。

## 示例\{#example}

演示 AddCollectionField() 的用法。

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

field := entity.NewField().
	WithName("new_field").
	WithDataType(entity.FieldTypeInt64).
	WithNullable(true)

err = cli.AddCollectionField(ctx, milvusclient.NewAddCollectionFieldOption("books", field))
if err != nil {
	// handle error
}
```
