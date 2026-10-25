---
title: "ListCollections | Go | v2"
slug: /go/go/v2-Collection-ListCollections
sidebar_label: "ListCollections"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出当前 Database 中的所有 Collection。 | Go | v2"
type: docx
token: TEBxdE4JvooYMjxHloBcP9k6nE6
sidebar_position: 21
keywords: 
  - Zilliz 向量 Database
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - zilliz
  - Zilliz Cloud
  - 云
  - ListCollections
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListCollections

此操作会列出当前 Database 中的所有 Collection。

```go
func (c *Client) ListCollections(ctx context.Context, option ListCollectionOption, callOptions ...grpc.CallOption) (collectionNames []string, err error)
```

## 请求语法\{#request-syntax}

创建 ListCollections() 的请求。

```go
option := milvusclient.NewListCollectionOption()

result, err := client.ListCollections(ctx, option)
```

**构建器方法：**

- `NewListCollectionOption()`

    创建 ListCollections() 的请求。

**返回类型：**

*collectionNames []string, err error*

**返回：**

返回名称列表。如果操作失败，则返回错误。

**参数：**

- **result** （*collectionNames []string*） -

    ListCollections() 返回的 collectionNames []string 值。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 ListCollections() 的用法。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

collectionNames, err := cli.ListCollections(ctx, milvusclient.NewListCollectionOption())
if err != nil {
	// handle error
}

fmt.Println(collectionNames)
```
