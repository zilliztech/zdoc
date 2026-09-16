---
title: "DescribeIndex() | Go | v2"
slug: /go/go/v2-Management-DescribeIndex
sidebar_label: "DescribeIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回索引的详细信息，包括其类型和参数。 | Go | v2"
type: docx
token: PjAddPiH8oyRNpxqafBc1ZGknSd
sidebar_position: 6
keywords: 
  - milvus 向量 Database
  - milvus 数据库
  - milvus 向量 db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - 云
  - DescribeIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeIndex()

此操作返回索引的详细信息，包括其类型和参数。

```go
func (c *Client) DescribeIndex(ctx context.Context, opt DescribeIndexOption, callOptions ...grpc.CallOption) (IndexDescription, error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewDescribeIndexOption(collectionName, indexName)

result, err := client.DescribeIndex(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标 Collection 的名称。

- **indexName** (*string*)

    索引的名称。

**返回类型：**

*[IndexDescription](./v2-Management-IndexDescription), error*

**返回值：**

索引的详细信息，包括类型、度量和参数。如果操作失败，则返回错误。

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

indexInfo, err := cli.DescribeIndex(ctx, milvusclient.NewDescribeIndexOption("my_collection", "my_index"))
if err != nil {
	// handle err
}
fmt.Println(indexInfo)
```
