---
title: "ListIndexes() | Go | v2"
slug: /go/go/v2-Management-ListIndexes
sidebar_label: "ListIndexes()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出指定 Collection 上构建的所有索引。 | Go | v2"
type: docx
token: S8NxdJc1gom2SVxxNYkc5lHxnMg
sidebar_position: 17
keywords: 
  - Zilliz 向量 Database
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - ListIndexes()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListIndexes()

此操作会列出指定 Collection 上构建的所有索引。

```go
func (c *Client) ListIndexes(ctx context.Context, opt ListIndexOption, callOptions ...grpc.CallOption) ([]string, error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewListIndexOption(collectionName).
    WithFieldName(fieldName)

result, err := client.ListIndexes(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标 Collection 的名称。

**选项方法：**

- `WithFieldName(fieldName string)`

    设置操作的字段名称。

**返回类型：**

*[]string, error*

**返回：**

名称列表。如果操作失败，则返回错误。

**异常：**

- **error**

    查看 `err != nil` 了解失败详情。

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
	// handle err
}

indexes, err := cli.ListIndexes(ctx, milvusclient.NewListIndexOption("my_collection").WithFieldName("my_vector"))
if err != nil {
	// handle err
}
fmt.Println(indexes)
```
