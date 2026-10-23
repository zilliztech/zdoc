---
title: "ListIndexes | Go | v2"
slug: /go/go/v2-Management-ListIndexes
sidebar_label: "ListIndexes"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出指定 Collection 上构建的所有索引。 | Go | v2"
type: docx
token: R53fdYWNAorBuUxdrF7cSuovnnf
sidebar_position: 16
keywords: 
  - 向量嵌入
  - 向量存储
  - 开源向量 Database
  - 向量索引
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListIndexes
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListIndexes

此操作会列出指定 Collection 上构建的所有索引。

```go
func (c *Client) ListIndexes(ctx context.Context, opt ListIndexOption, callOptions ...grpc.CallOption) ([]string, error)
```

## 请求语法\{#request-syntax}

为 ListIndexes() 创建请求。

```go
option := milvusclient.NewListIndexOption(collectionName).
    WithFieldName(fieldName)

result, err := client.ListIndexes(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

**构建器方法：**

- `NewListIndexOption(collectionName string)`

    为 ListIndexes() 创建请求。

- `WithFieldName(fieldName string)`

    设置此操作的字段名称。

**返回类型：**

*[]string, error*

**返回：**

索引名称列表。如果操作失败，则返回错误。

**参数：**

- **result** （*[]string*） -

    由 ListIndexes() 返回的 []string 值。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 ListIndexes() 的用法。

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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
