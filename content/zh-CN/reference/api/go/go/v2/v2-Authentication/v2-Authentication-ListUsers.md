---
title: "ListUsers | Go | v2"
slug: /go/go/v2-Authentication-ListUsers
sidebar_label: "ListUsers"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出 Milvus 实例中的所有用户。 | Go | v2"
type: docx
token: M6AhdT0bvoytK5x81QdciNKnnLd
sidebar_position: 16
keywords: 
  - 自然语言处理
  - AI 聊天机器人
  - 余弦距离
  - 什么是向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListUsers
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListUsers

此操作会列出 Milvus 实例中的所有用户。

```go
func (c *Client) ListUsers(ctx context.Context, opt ListUserOption, callOpts ...grpc.CallOption) ([]string, error)
```

## 请求语法\{#request-syntax}

创建 ListUsers() 的请求。

```go
option := milvusclient.NewListUserOption()

users, err := client.ListUsers(ctx, option)
```

**构建器方法：**

- `NewListUserOption()`

    创建 ListUsers() 的请求。

**返回类型：**

*[]string, error*

**返回值：**

名称列表。如果操作失败，则返回错误。

**参数：**

- **result**（*[]string*） -

    ListUsers() 返回的 []string 值。

**错误处理：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 ListUsers() 的用法。

```go
import (
	"context"
	"fmt"

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

users, err := cli.ListUsers(ctx, milvusclient.NewListUserOption())
if err != nil {
	// handle error
}
fmt.Println(users)
```
