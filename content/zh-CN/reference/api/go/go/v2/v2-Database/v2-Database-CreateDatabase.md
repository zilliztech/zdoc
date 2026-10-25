---
title: "CreateDatabase | Go | v2"
slug: /go/go/v2-Database-CreateDatabase
sidebar_label: "CreateDatabase"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用指定名称和可选属性创建一个新的 Database。 | Go | v2"
type: docx
token: KgMSdCS28oPhbWx38NLcrXKanCd
sidebar_position: 2
keywords: 
  - 分层可导航小世界
  - 稠密嵌入
  - Faiss 向量 Database
  - Chroma 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - CreateDatabase
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# CreateDatabase

此操作使用指定名称和可选属性创建一个新的 Database。

```go
func (c *Client) CreateDatabase(ctx context.Context, option CreateDatabaseOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 CreateDatabase() 的请求。

```go
option := milvusclient.NewCreateDatabaseOption(dbName).
    WithProperty(key, value)

err := client.CreateDatabase(ctx, option)
```

**参数：**

- **dbName** （*string*） -

    **[必需]**

    Database 的名称。

**构建器方法：**

- `NewCreateDatabaseOption(dbName string)`

    创建用于新建 Database 的选项。`dbName` 指定要创建的 Database 的名称。

- `WithProperty(key string, value any)`

    在将值转换为其字符串表示形式后，设置 Database 属性键值对。

**返回类型：**

*error*

**返回：**

Database 创建后返回 nil。如果操作失败，则返回错误。

**异常：**

- **error**

    操作失败。请求构建或 RPC 失败。请检查 `err != nil` 了解失败详情。

## 示例\{#example}

演示 CreateDatabase() 的用法。

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

err = cli.CreateDatabase(ctx, milvusclient.NewCreateDatabaseOption("test_db").
	WithProperty("database.replica.number", "3"))
if err != nil {
	// handle error
}
```
