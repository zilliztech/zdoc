---
title: "Get() | Go | v2"
slug: /go/go/v2-Vector-Get
sidebar_label: "Get()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作按主键值检索 Entity。 | Go | v2"
type: docx
token: FLBRdxZqWojjpXxuwJZc5APKncC
sidebar_position: 9
keywords: 
  - milvus
  - Zilliz
  - milvus 向量 Database
  - milvus db
  - zilliz
  - zilliz cloud
  - 云
  - Get()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Get()

此操作按主键值检索 Entity。

```go
func (c *Client) Get(ctx context.Context, option QueryOption, callOptions ...grpc.CallOption) (ResultSet, error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewQueryOption(collectionName).
    WithFilter(expr).
    WithTemplateParam(key, val).
    WithOffset(offset).
    WithLimit(limit).
    WithOutputFields(fieldNames).
    WithConsistencyLevel(consistencyLevel).
    WithPartitions(partitionNames).
    WithIDs(ids)

result, err := client.Get(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标 Collection 的名称。

**可选方法：**

- `WithFilter(expr string)`

    应用布尔筛选表达式以缩小结果范围。

- `WithTemplateParam(key string, val any)`

    设置用于表达式求值的模板参数。

- `WithOffset(offset int)`

    设置在返回匹配项之前要跳过的结果数。

- `WithLimit(limit int)`

    设置要返回的最大结果数。

- `WithOutputFields(fieldNames ...string)`

    指定返回结果中要包含哪些字段。

- `WithConsistencyLevel(consistencyLevel [entity.ConsistencyLevel](./v2-Collection-ConsistencyLevel))`

    设置操作的一致性级别（Strong、Bounded、Session 或 Eventually）。

- `WithPartitions(partitionNames ...string)`

    将操作限制在指定的 Partition 内。

- `WithIDs(ids column.Column)`

    设置操作的 ID。

**返回类型：**

*[ResultSet](./v2-Vector-ResultSet), error*

**返回值：**

搜索或查询结果，包含匹配的 Entity 及其分数和字段。如果操作失败，则返回错误。

**异常：**

- **error**

    查看 `err != nil` 了解失败详情。

## 示例\{#example}

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/column"
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

rs, err := cli.Get(ctx, milvusclient.NewQueryOption("quick_setup").
	WithIDs(column.NewColumnInt64("id", []int64{1, 2, 3})))
if err != nil {
	// handle error
}

fmt.Println(rs.GetColumn("id"))
```
