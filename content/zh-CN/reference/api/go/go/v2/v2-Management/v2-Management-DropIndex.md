---
title: "DropIndex | Go | v2"
slug: /go/go/v2-Management-DropIndex
sidebar_label: "DropIndex"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从 Collection 的字段中删除索引。 | Go | v2"
type: docx
token: Fjo3dPXt5o62BPxPefHcUFbtnoc
sidebar_position: 7
keywords: 
  - 异常检测
  - 句子转换器
  - 推荐系统
  - 信息检索
  - zilliz
  - zilliz cloud
  - 云
  - DropIndex
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DropIndex

此操作会从 Collection 的字段中删除索引。

```go
func (c *Client) DropIndex(ctx context.Context, opt DropIndexOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 DropIndex() 的请求。

```go
option := milvusclient.NewDropIndexOption(collectionName, indexName)

err := client.DropIndex(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必填]**

    目标 Collection 的名称。

- **indexName** （*string*） -

    **[必填]**

    索引的名称。

**构建器方法：**

- `NewDropIndexOption(collectionName string, indexName string)`

    创建 DropIndex() 的请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述错误原因的 error。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以了解失败详情。

## 示例\{#example}

演示 DropIndex() 的用法。

```go
import (
	"context"

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

err = cli.DropIndex(ctx, milvusclient.NewDropIndexOption("my_collection", "my_index"))
if err != nil {
	// handle err
}
```
