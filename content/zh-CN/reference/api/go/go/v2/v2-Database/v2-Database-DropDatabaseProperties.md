---
title: "DropDatabaseProperties | Go | v2"
slug: /go/go/v2-Database-DropDatabaseProperties
sidebar_label: "DropDatabaseProperties"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会移除 Database 中指定的属性。 | Go | v2"
type: docx
token: RDOmdzzj2o4a6XxHcNZcmR2fnVh
sidebar_position: 6
keywords: 
  - 多模态 RAG
  - LLM 幻觉
  - 混合搜索
  - 词法搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - DropDatabaseProperties
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropDatabaseProperties

此操作会移除 Database 中指定的属性。

```go
func (c *Client) DropDatabaseProperties(ctx context.Context, option DropDatabasePropertiesOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 DropDatabaseProperties() 的请求。

```go
option := milvusclient.NewDropDatabasePropertiesOption(dbName, propertyKeys)

err := client.DropDatabaseProperties(ctx, option)
```

**参数：**

- **dbName** （*string*） -

    **[必需]**

    Database 的名称。

- **propertyKeys** （*...string*） -

    **[必需]**

    属性键。

**构建器方法：**

- `NewDropDatabasePropertiesOption(dbName string, propertyKeys ...string)`

    创建 DropDatabaseProperties() 的请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述出错原因的 error。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 DropDatabaseProperties() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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
