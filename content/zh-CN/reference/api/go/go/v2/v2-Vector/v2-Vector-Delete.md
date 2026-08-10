---
title: "Delete() | Go | v2"
slug: /go/go/v2-Vector-Delete
sidebar_label: "Delete()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作通过主键值或筛选表达式从 Collection 中删除 Entity。 | Go | v2"
type: docx
token: ZIm2dVn5noFLpAxRkjbc6jiSnee
sidebar_position: 7
keywords: 
  - 向量化
  - k 最近邻算法
  - ANNS
  - 向量搜索
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

此操作通过主键值或筛选表达式从 Collection 中删除 Entity。

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

    目标 Collection 的名称。

**可选方法：**

- `WithExpr(expr string)`

    设置此操作的 expr。

- `WithInt64IDs(fieldName string, ids []int64)`

    设置此操作的 int64 i ds。

- `WithStringIDs(fieldName string, ids []string)`

    设置此操作的 string i ds。

- `WithPartition(partitionName string)`

    设置此操作的 Partition。

**返回类型：**

*[DeleteResult](./v2-Vector-DeleteResult), error*

**返回值：**

删除结果。如果操作失败，则返回错误。

**异常：**

- **error**

    检查 `err != nil` 以了解失败详情。

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
