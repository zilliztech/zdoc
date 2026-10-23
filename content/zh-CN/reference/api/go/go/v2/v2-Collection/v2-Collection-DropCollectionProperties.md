---
title: "DropCollectionProperties | Go | v2"
slug: /go/go/v2-Collection-DropCollectionProperties
sidebar_label: "DropCollectionProperties"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从 Collection 中移除指定的属性。 | Go | v2"
type: docx
token: V7Zydmw53obtpRxMfqCcjj62njH
sidebar_position: 14
keywords: 
  - 向量 Database 教程
  - 向量 Database 的工作原理
  - 向量 Database 比较
  - OpenAI 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - DropCollectionProperties
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionProperties

此操作会从 Collection 中移除指定的属性。

```go
func (c *Client) DropCollectionProperties(ctx context.Context, option DropCollectionPropertiesOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

创建 DropCollectionProperties() 的请求。

```go
option := milvusclient.NewDropCollectionPropertiesOption(collection, propertyKeys)

err := client.DropCollectionProperties(ctx, option)
```

**参数：**

- **collection** (*string*) -

    **[必需]**

    该 Collection。

- **propertyKeys** (*...string*) -

    **[必需]**

    属性键。

**构建器方法：**

- `NewDropCollectionPropertiesOption(collection string, propertyKeys ...string)`

    创建 DropCollectionProperties() 的请求。

**返回类型：**

*error*

**返回：**

成功时返回 nil，失败时返回描述出错原因的错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 DropCollectionProperties() 的用法。

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
	"github.com/milvus-io/milvus/pkg/v2/common"
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

err = cli.DropCollectionProperties(ctx, milvusclient.NewDropCollectionPropertiesOption("my_collection", common.CollectionTTLConfigKey))
if err != nil {
	// handle error
}
```
