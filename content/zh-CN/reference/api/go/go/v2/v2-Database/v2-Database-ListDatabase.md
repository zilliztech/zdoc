---
title: "ListDatabase | Go | v2"
slug: /go/go/v2-Database-ListDatabase
sidebar_label: "ListDatabase"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出 Milvus 实例中的所有 Database。 | Go | v2"
type: docx
token: A0bMdNQyvon0rhxJIQpcHbPPn3f
sidebar_position: 7
keywords: 
  - DiskANN
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListDatabase
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListDatabase

此操作会列出 Milvus 实例中的所有 Database。

```go
func (c *Client) ListDatabase(ctx context.Context, option ListDatabaseOption, callOptions ...grpc.CallOption) (databaseNames []string, err error)
```

## 请求语法\{#request-syntax}

创建 ListDatabase() 的请求。

```go
option := milvusclient.NewListDatabaseOption()

dbs, err := client.ListDatabase(ctx, option)
```

**构建器方法：**

- `NewListDatabaseOption()`

    创建 ListDatabase() 的请求。

**返回类型：**

*databaseNames []string, err error*

**返回：**

返回名称列表。如果操作失败，则返回错误。

**参数：**

- **result** （*databaseNames []string*） -

    ListDatabase() 返回的 databaseNames []string 值。

**异常：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 ListDatabase() 的用法。

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
	// handle err
}
defer cli.Close(ctx)

dbs, err := cli.ListDatabase(ctx, milvusclient.NewListDatabaseOption())
if err != nil {
	// handle err
}
fmt.Println(dbs)
```
