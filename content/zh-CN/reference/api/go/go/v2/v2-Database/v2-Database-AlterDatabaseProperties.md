---
title: "AlterDatabaseProperties() | Go | v2"
slug: /go/go/v2-Database-AlterDatabaseProperties
sidebar_label: "AlterDatabaseProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于修改现有数据库的属性。 | Go | v2"
type: docx
token: TxGQdsN2noPbRixebWycWSe0nYt
sidebar_position: 1
keywords: 
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - zilliz
  - zilliz cloud
  - cloud
  - AlterDatabaseProperties()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterDatabaseProperties()

此操作用于修改现有数据库的属性。

```go
func (c *Client) AlterDatabaseProperties(ctx context.Context, option AlterDatabasePropertiesOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewAlterDatabasePropertiesOption(dbName).
    WithProperty(key, value)

err := client.AlterDatabaseProperties(ctx, option)
```

**参数：**

- **dbName** (*string*)

    数据库名称。

**可选方法：**

- `WithProperty(key string, value any)`

    为资源设置自定义属性键值对。

**返回类型：**

*error*

**返回：**

成功时返回 nil；否则返回描述错误原因的错误对象。

**异常：**

- **error**

    可通过检查 `err != nil` 获取失败详情。

## 示例\{#example}

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
	"github.com/milvus-io/milvus/pkg/v2/common"
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

err = cli.AlterDatabaseProperties(ctx, milvusclient.NewAlterDatabasePropertiesOption("my_database").
	WithProperty(common.DatabaseReplicaNumber, 2))
if err != nil {
	// handle err
}
```
