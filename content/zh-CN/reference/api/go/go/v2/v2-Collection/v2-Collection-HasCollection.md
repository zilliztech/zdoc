---
title: "HasCollection() | Go | v2"
slug: /go/go/v2-Collection-HasCollection
sidebar_label: "HasCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作检查当前数据库中是否存在某个集合。 | Go | v2"
type: docx
token: JfRidhpQRo2tZFxrL87cNODunWc
sidebar_position: 19
keywords: 
  - 推荐系统
  - 信息检索
  - 降维
  - hnsw algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - HasCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# HasCollection()

此操作检查当前数据库中是否存在某个集合。

```go
func (c *Client) HasCollection(ctx context.Context, option HasCollectionOption, callOptions ...grpc.CallOption) (has bool, err error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewHasCollectionOption(name)

result, err := client.HasCollection(ctx, option)
```

**参数：**

- **name** (*string*)

    目标集合的名称。

**返回类型：**

*has bool, err error*

**返回值：**

一个布尔值，用于指示该资源是否存在。如果操作失败，则返回错误。

**异常：**

- **error**

    检查 `err != nil` 以获取失败详情。

## 示例\{#example}

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

has, err := cli.HasCollection(ctx, milvusclient.NewHasCollectionOption("quick_setup"))
if err != nil {
	// handle error
}
fmt.Println(has)
```
