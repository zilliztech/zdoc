---
title: "Get() | Go | v2"
slug: /go/go/v2-Vector-Get
sidebar_label: "Get()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作按主键值检索实体。 | Go | v2"
type: docx
token: FLBRdxZqWojjpXxuwJZc5APKncC
sidebar_position: 9
keywords: 
  - milvus
  - Zilliz
  - milvus vector database
  - milvus db
  - zilliz
  - zilliz cloud
  - cloud
  - Get()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Get()

此操作按主键值检索实体。

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

    目标 collection 的名称。

**可选方法：**

- `WithFilter(expr string)`

    应用布尔过滤表达式以缩小结果范围。

- `WithTemplateParam(key string, val any)`

    为表达式求值设置模板参数。

- `WithOffset(offset int)`

    设置在返回匹配结果之前要跳过的结果数量。

- `WithLimit(limit int)`

    设置要返回的最大结果数量。

- `WithOutputFields(fieldNames ...string)`

    指定返回结果中应包含哪些字段。

- `WithConsistencyLevel(consistencyLevel [entity.ConsistencyLevel](./v2-Collection-ConsistencyLevel))`

    设置此操作的一致性级别（Strong、Bounded、Session 或 Eventually）。

- `WithPartitions(partitionNames ...string)`

    将此操作限制在指定的分区中。

- `WithIDs(ids column.Column)`

    设置此操作的 ID。

**返回类型：**

*[ResultSet](./v2-Vector-ResultSet), error*

**返回：**

包含匹配实体及其分数和字段的搜索或查询结果。如果操作失败，则返回错误。

**异常：**

- **error**

    通过检查 `err != nil` 获取失败详情。

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
