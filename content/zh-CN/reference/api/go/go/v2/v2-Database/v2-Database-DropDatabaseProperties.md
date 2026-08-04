---
title: "DropDatabaseProperties() | Go | v2"
slug: /go/go/v2-Database-DropDatabaseProperties
sidebar_label: "DropDatabaseProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从数据库中移除指定的属性。 | Go | v2"
type: docx
token: Le2bdLZXCoKVXXxF2kgcuDt2neh
sidebar_position: 6
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - DropDatabaseProperties()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropDatabaseProperties()

此操作会从数据库中移除指定的属性。

```go
func (c *Client) DropDatabaseProperties(ctx context.Context, option DropDatabasePropertiesOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewDropDatabasePropertiesOption(dbName, propertyKeys)

err := client.DropDatabaseProperties(ctx, option)
```

**参数：**

- **dbName** (*string*)

    数据库名称。

- **propertyKeys** (*...string*)

    属性键。

**返回类型：**

*error*

**返回：**

成功时返回 nil；如果失败，则返回描述错误原因的 error。

**异常：**

- **error**

    通过检查 `err != nil` 获取失败详情。

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

err = cli.DropDatabaseProperties(ctx, milvusclient.NewDropDatabasePropertiesOption("my_database", common.DatabaseReplicaNumber))
if err != nil {
	// handle err
}
```
