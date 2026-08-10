---
title: "AlterCollectionFieldProperty() | Go | v2"
slug: /go/go/v2-Collection-AlterCollectionFieldProperty
sidebar_label: "AlterCollectionFieldProperty()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会修改 Collection 中特定字段的一个属性。 | Go | v2"
type: docx
token: MIyedieIBo43Yrxee0lcY3cUn8b
sidebar_position: 4
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy 向量搜索
  - Milvus
  - Zilliz
  - Zilliz Cloud
  - 云
  - AlterCollectionFieldProperty()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AlterCollectionFieldProperty()

此操作会修改 Collection 中特定字段的一个属性。

```go
func (c *Client) AlterCollectionFieldProperty(ctx context.Context, option AlterCollectionFieldPropertiesOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewAlterCollectionFieldPropertiesOption(collectionName, fieldName).
    WithProperty(key, value)

err := client.AlterCollectionFieldProperty(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标 Collection 的名称。

- **fieldName** (*string*)

    字段名称。

**可选方法：**

- `WithProperty(key string, value any)`

    为资源设置自定义属性键值对。

**返回类型：**

*error*

**返回值：**

成功时返回 nil，否则返回描述错误原因的错误信息。

**异常：**

- **error**

    查看 `err != nil` 了解失败详情。

## 示例\{#example}

```go
import (
	"context"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

err = cli.AlterCollectionFieldProperty(ctx, milvusclient.NewAlterCollectionFieldPropertiesOption("my_collection", "my_vector").
	WithProperty("mmap.enabled", true))
if err != nil {
	// handle error
}
```
