---
title: "DropDatabase | Go | v2"
slug: /go/go/v2-Database-DropDatabase
sidebar_label: "DropDatabase"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会永久删除一个 Database 及其所有 Collection。 | Go | v2"
type: docx
token: XjDhd3KjUo8gxdxqPvAcUqOUnfe
sidebar_position: 5
keywords: 
  - 什么是向量嵌入
  - 向量 Database 教程
  - 向量 Database 的工作原理
  - 向量 Database 对比
  - Zilliz
  - Zilliz Cloud
  - 云
  - DropDatabase
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropDatabase

此操作会永久删除一个 Database 及其所有 Collection。

```go
func (c *Client) DropDatabase(ctx context.Context, option DropDatabaseOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 DropDatabase() 的请求。

```go
option := milvusclient.NewDropDatabaseOption(dbName)

err := client.DropDatabase(ctx, option)
```

**参数：**

- **dbName** （*string*） -

    **[必需]**

    Database 的名称。

**构建器方法：**

- `NewDropDatabaseOption(dbName string)`

    创建 DropDatabase() 的请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述出错原因的错误。

**异常：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 DropDatabase() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle err
}
defer cli.Close(ctx)

err = cli.DropDatabase(ctx, milvusclient.NewDropDatabaseOption("test_db"))
if err != nil {
	// handle err
}
```
