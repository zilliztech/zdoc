---
title: "UseDatabase | Go | v2"
slug: /go/go/v2-Database-UseDatabase
sidebar_label: "UseDatabase"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会切换当前客户端连接的活跃 Database。 | Go | v2"
type: docx
token: EwKhdwcBuoINVbxxLopcubz7nxa
sidebar_position: 8
keywords: 
  - 视频搜索
  - AI 幻觉
  - AI 智能体
  - 语义搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - UseDatabase
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# UseDatabase

此操作会切换当前客户端连接的活跃 Database。

```go
func (c *Client) UseDatabase(ctx context.Context, option UseDatabaseOption) error
```

## 请求语法\{#request-syntax}

创建 UseDatabase() 的请求。

```go
option := milvusclient.NewUseDatabaseOption("my_database")

 := client.UseDatabase(ctx, option)
```

**构建器方法：**

- `NewUseDatabaseOption(dbName string)`

    创建 UseDatabase() 的请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回一个说明出错原因的错误。

**错误处理：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 UseDatabase() 的用法。

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

err = cli.UseDatabase(ctx, milvusclient.NewUseDatabaseOption("my_database"))
if err != nil {
	// handle err
}
```
