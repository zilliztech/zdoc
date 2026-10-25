---
title: "ReleaseCollection | Go | v2"
slug: /go/go/v2-Management-ReleaseCollection
sidebar_label: "ReleaseCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会将 Collection 从内存中释放，以释放资源。 | Go | v2"
type: docx
token: VQTgdYK3yoNZPxxt9dfct0M4nze
sidebar_position: 23
keywords: 
  - 大语言模型
  - 机器学习
  - RAG
  - 自然语言处理
  - zilliz
  - zilliz cloud
  - 云
  - ReleaseCollection
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ReleaseCollection

此操作会将 Collection 从内存中释放，以释放资源。

```go
func (c *Client) ReleaseCollection(ctx context.Context, option ReleaseCollectionOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

为 ReleaseCollection() 创建请求。

```go
option := milvusclient.NewReleaseCollectionOption(collectionName)

err := client.ReleaseCollection(ctx, option)
```

**参数：**

- **collectionName** （*string*） -

    **[必需]**

    目标 Collection 的名称。

**构建器方法：**

- `NewReleaseCollectionOption(collectionName string)`

    为 ReleaseCollection() 创建请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil；如果出现问题，则返回描述出错原因的错误。

**错误处理：**

- **error**

    操作失败。查看 `err != nil` 了解失败详情。

## 示例\{#example}

演示 ReleaseCollection() 的用法。

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

err = cli.ReleaseCollection(ctx, milvusclient.NewReleaseCollectionOption("custom_quick_setup"))
if err != nil {
	// handle error
}
```
