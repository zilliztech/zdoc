---
title: "DropCollectionField | Go | v2"
slug: /go/go/v2-Collection-DropCollectionField
sidebar_label: "DropCollectionField"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会根据字段名称或字段 ID 从现有 Collection 中移除一个字段。 | Go | v2"
type: docx
token: Cx0Mdu2qio3sZpxtxlDcwPpNnEf
sidebar_position: 28
keywords: 
  - 深度学习
  - 知识库
  - 自然语言处理
  - AI 聊天机器人
  - zilliz
  - zilliz cloud
  - 云
  - DropCollectionField
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionField

此操作会根据字段名称或字段 ID 从现有 Collection 中移除一个字段。

```go
func (c *Client) DropCollectionField(ctx context.Context, opt DropCollectionFieldOption, callOpts ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 DropCollectionField() 的请求。

```go
option := milvusclient.NewDropCollectionFieldOption(collectionName, fieldName)

err := client.DropCollectionField(ctx, option)
```

**参数：**

- **collectionName** (*string*) -

    **[必需]**

    目标 Collection 的名称。

- **fieldID** (*int64*) -

    **[必需]**

    DropCollectionField 的 fieldName。

**构建器方法：**

- `NewDropCollectionFieldOption(collectionName string, fieldName string)`

    创建按字段名称删除字段的选项。

- `NewDropCollectionFieldByIDOption(collectionName string, fieldID int64)`

    创建按字段 ID 删除字段的选项。字段 ID 必须大于 0。

**返回类型：**

*error*

**返回：**

字段删除后返回 nil。当客户端校验或 RPC 失败时，返回错误。

**异常：**

- **error**

    操作失败。校验、请求构建或 RPC 失败。请检查 `err != nil` 以了解失败详情。

## 示例\{#example}

演示 DropCollectionField() 的用法。

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

err = cli.DropCollectionField(ctx, milvusclient.NewDropCollectionFieldOption("books", "old_field"))
if err != nil {
	// handle error
}
```
