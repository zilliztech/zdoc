---
title: "DropCollection | Go | v2"
slug: /go/go/v2-Collection-DropCollection
sidebar_label: "DropCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会永久删除 Collection 及其所有数据。 | Go | v2"
type: docx
token: MPMwdusXRoBFuUxQolHcZBFhn5e
sidebar_position: 13
keywords: 
  - 非结构化数据
  - 向量 Database
  - IVF
  - knn
  - zilliz
  - Zilliz Cloud
  - 云
  - DropCollection
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DropCollection

此操作会永久删除 Collection 及其所有数据。

```go
func (c *Client) DropCollection(ctx context.Context, option DropCollectionOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 DropCollection() 的请求。

```go
option := milvusclient.NewDropCollectionOption(name)

err := client.DropCollection(ctx, option)
```

**参数：**

- **name** （*string*） -

    **[必需]**

    目标 Collection 的名称。

**构建器方法：**

- `NewDropCollectionOption(name string)`

    创建 DropCollection() 的请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述出错原因的错误。

**异常处理：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 DropCollection() 的用法。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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

err = cli.DropCollection(ctx, milvusclient.NewDropCollectionOption("customized_setup_2"))
if err != nil {
	// handle err
}
```
