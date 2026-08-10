---
title: "Query() | Go | v2"
slug: /go/go/v2-Vector-Query
sidebar_label: "Query()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会检索与布尔筛选表达式匹配的 Entity。 | Go | v2"
type: docx
token: P84bd17ncosvh4xuahpcFGzoneb
sidebar_position: 13
keywords: 
  - 开源向量数据库
  - 向量 Database 示例
  - rag 向量 Database
  - 什么是向量数据库
  - zilliz
  - zilliz cloud
  - 云
  - Query()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Query()

此操作会检索与布尔筛选表达式匹配的 Entity。

```go
func (c *Client) Query(ctx context.Context, option QueryOption, callOptions ...grpc.CallOption) (ResultSet, error)
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

result, err := client.Query(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标 Collection 的名称。

**可选方法：**

- `WithFilter(expr string)`

    应用布尔筛选表达式以缩小结果范围。

- `WithTemplateParam(key string, val any)`

    为表达式求值设置模板参数。

- `WithOffset(offset int)`

    设置在返回匹配结果前要跳过的结果数量。

- `WithLimit(limit int)`

    设置要返回的最大结果数量。

- `WithOutputFields(fieldNames ...string)`

    指定在返回结果中包含哪些字段。

- `WithConsistencyLevel(consistencyLevel [entity.ConsistencyLevel](./v2-Collection-ConsistencyLevel))`

    设置此操作的一致性级别（Strong、Bounded、Session 或 Eventually）。

- `WithPartitions(partitionNames ...string)`

    将此操作限制在指定的 Partition 中。

- `WithIDs(ids column.Column)`

    为此操作设置 ID。

**返回类型：**

*[ResultSet](./v2-Vector-ResultSet), error*

**返回值：**

包含匹配 Entity 的搜索或查询结果，其中包括分数和字段。如果操作失败，则返回错误。

**异常：**

- **error**

    查看 `err != nil` 了解失败详情。

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

rs, err := cli.Query(ctx, milvusclient.NewQueryOption("quick_setup").
	WithFilter("emb_type == 3").
	WithOutputFields("id", "emb_type"))
if err != nil {
	// handle error
}

fmt.Println(rs.GetColumn("id"))
```
