---
title: "DescribeIndex | Go | v2"
slug: /go/go/v2-Management-DescribeIndex
sidebar_label: "DescribeIndex"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回索引的详细信息，包括其类型和参数。 | Go | v2"
type: docx
token: PcKJdVvSkolLwnxpiQUcHO9Mnfh
sidebar_position: 6
keywords: 
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - LLM 作为评判者
  - zilliz
  - zilliz cloud
  - 云
  - DescribeIndex
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DescribeIndex

此操作返回索引的详细信息，包括其类型和参数。

```go
func (c *Client) DescribeIndex(ctx context.Context, opt DescribeIndexOption, callOptions ...grpc.CallOption) (IndexDescription, error)
```

## 请求语法\{#request-syntax}

创建 DescribeIndex() 的请求。

```go
option := milvusclient.NewDescribeIndexOption(collectionName, indexName)

result, err := client.DescribeIndex(ctx, option)
```

**参数：**

- **collectionName**（*string*）-

    **[必需]**

    目标 Collection 的名称。

- **indexName**（*string*）-

    **[必需]**

    索引的名称。

**构建器方法：**

- `NewDescribeIndexOption(collectionName string, indexName string)`

    创建 DescribeIndex() 的请求。

**返回类型：**

*IndexDescription, error*

**返回：**

返回索引的详细信息，包括类型、度量和参数。如果操作失败，则返回错误。

```go
type IndexDescription struct {
    index.Index
    State index.IndexState
    PendingIndexRows int64
    TotalRows int64
    IndexedRows int64
}
```

**参数：**

- **State**（*index.IndexState*）-

    当前状态。

- **PendingIndexRows**（*int64*）-

    待索引的行数。

- **TotalRows**（*int64*）-

    总行数。

- **IndexedRows**（*int64*）-

    已索引的行数。

**异常处理：**

- **error**

    操作失败。请检查 `err != nil` 了解失败详情。

## 示例\{#example}

演示 DescribeIndex() 的用法。

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

indexInfo, err := cli.DescribeIndex(ctx, milvusclient.NewDescribeIndexOption("my_collection", "my_index"))
if err != nil {
	// handle err
}
fmt.Println(indexInfo)
```
