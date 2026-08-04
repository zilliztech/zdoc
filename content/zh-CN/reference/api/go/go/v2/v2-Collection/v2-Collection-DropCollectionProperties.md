---
title: "DropCollectionProperties() | Go | v2"
slug: /go/go/v2-Collection-DropCollectionProperties
sidebar_label: "DropCollectionProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作从集合中移除指定属性。 | Go | v2"
type: docx
token: Zyf1dXoBIo83V2xWHiKcXUEAnMc
sidebar_position: 14
keywords: 
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollectionProperties()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropCollectionProperties()

此操作从集合中移除指定属性。

```go
func (c *Client) DropCollectionProperties(ctx context.Context, option DropCollectionPropertiesOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewDropCollectionPropertiesOption(collection, propertyKeys)

err := client.DropCollectionProperties(ctx, option)
```

**参数：**

- **[collection](./v2-Collection)** (*string*)

    集合。

- **propertyKeys** (*...string*)

    属性键。

**返回类型：**

*error*

**返回值：**

成功时返回 nil，否则返回描述错误原因的 error。

**异常：**

- **error**

    检查 `err != nil` 以获取失败详情。

## 示例\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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
