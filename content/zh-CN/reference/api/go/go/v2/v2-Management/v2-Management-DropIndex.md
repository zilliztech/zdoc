---
title: "DropIndex() | Go | v2"
slug: /go/go/v2-Management-DropIndex
sidebar_label: "DropIndex()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从 Collection 的字段中删除索引。 | Go | v2"
type: docx
token: DzchdYLEYomSrzxOys8c1mbanhg
sidebar_position: 7
keywords: 
  - 托管式 Milvus
  - Serverless 向量 Database
  - Milvus 开源
  - Milvus 的工作原理
  - zilliz
  - zilliz cloud
  - 云
  - DropIndex()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropIndex()

此操作会从 Collection 的字段中删除索引。

```go
func (c *Client) DropIndex(ctx context.Context, opt DropIndexOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewDropIndexOption(collectionName, indexName)

err := client.DropIndex(ctx, option)
```

**参数：**

- **collectionName** （*string*）

    目标 Collection 的名称。

- **indexName** （*string*）

    索引的名称。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述错误原因的 error。

**异常：**

- **error**

    查看 `err != nil` 了解失败详情。

## 示例\{#example}

```go
import (
	"context"

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

err = cli.DropIndex(ctx, milvusclient.NewDropIndexOption("my_collection", "my_index"))
if err != nil {
	// handle err
}
```
