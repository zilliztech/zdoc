---
title: "Delete() | Go | v2"
slug: /go/go/v2-Vector-Delete
sidebar_label: "Delete()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作通过主键值或过滤表达式从集合中删除实体。 | Go | v2"
type: docx
token: ZIm2dVn5noFLpAxRkjbc6jiSnee
sidebar_position: 7
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - Delete()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Delete()

此操作通过主键值或过滤表达式从集合中删除实体。

```go
func (c *Client) Delete(ctx context.Context, option DeleteOption, callOptions ...grpc.CallOption) (DeleteResult, error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewDeleteOption(collectionName).
    WithExpr(expr).
    WithInt64IDs(fieldName, ids).
    WithStringIDs(fieldName, ids).
    WithPartition(partitionName)

result, err := client.Delete(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标集合的名称。

**可选方法：**

- `WithExpr(expr string)`

    为此操作设置 expr。

- `WithInt64IDs(fieldName string, ids []int64)`

    为此操作设置 int64 IDs。

- `WithStringIDs(fieldName string, ids []string)`

    为此操作设置 string IDs。

- `WithPartition(partitionName string)`

    为此操作设置分区。

**返回类型：**

*[DeleteResult](./v2-Vector-DeleteResult), error*

**返回：**

删除结果。如果操作失败，则返回错误。

**异常：**

- **error**

    检查 `err != nil` 以获取失败详情。

## 示例\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

res, err := cli.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").
	WithInt64IDs("id", []int64{1, 2, 3}))
if err != nil {
	// handle error
}

fmt.Println(res.DeleteCount)
```
