---
title: "AlterDatabaseProperties | Go | v2"
slug: /go/go/v2-Database-AlterDatabaseProperties
sidebar_label: "AlterDatabaseProperties"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作修改现有 Database 的属性。 | Go | v2"
type: docx
token: P66AdsWbooIL47xykGkcsI5ZnAg
sidebar_position: 1
keywords: 
  - 知识库
  - 自然语言处理
  - AI 聊天机器人
  - 余弦距离
  - zilliz
  - zilliz cloud
  - 云
  - AlterDatabaseProperties
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterDatabaseProperties

此操作修改现有 Database 的属性。

```go
func (c *Client) AlterDatabaseProperties(ctx context.Context, option AlterDatabasePropertiesOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 AlterDatabaseProperties() 的请求。

```go
option := milvusclient.NewAlterDatabasePropertiesOption(dbName).
    WithProperty(key, value)

err := client.AlterDatabaseProperties(ctx, option)
```

**参数：**

- **dbName** （*string*） -

    **[必需]**

    Database 的名称。

**构建器方法：**

- `NewAlterDatabasePropertiesOption(dbName string)`

    创建用于修改 Database 属性的选项。`dbName` 指定要修改其属性的 Database。

- `WithProperty(key string, value any)`

    将值转换为其字符串表示形式后，设置 Database 属性键值对。

**返回类型：**

*error*

**返回：**

修改 Database 属性后返回 nil。如果操作失败，则返回错误。

**异常：**

- **error**

    操作失败。请求构建或 RPC 失败。查看 `err != nil` 了解失败详情。

## 示例\{#example}

演示 AlterDatabaseProperties() 的用法。

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

err = cli.AlterDatabaseProperties(ctx, milvusclient.NewAlterDatabasePropertiesOption("test_db").
	WithProperty("database.replica.number", "2"))
if err != nil {
	// handle error
}
```
