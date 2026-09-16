---
title: "DropIndexProperties() | Go | v2"
slug: /go/go/v2-Management-DropIndexProperties
sidebar_label: "DropIndexProperties()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会从索引中移除指定的属性。 | Go | v2"
type: docx
token: VuYydaf7loMiRAxkB3scXzA1nPb
sidebar_position: 8
keywords: 
  - milvus lite
  - milvus benchmark
  - 托管式 Milvus
  - Serverless 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - DropIndexProperties()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropIndexProperties()

此操作会从索引中移除指定的属性。

```go
func (c *Client) DropIndexProperties(ctx context.Context, opt DropIndexPropertiesOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewDropIndexPropertiesOption(collectionName, indexName, keys)

err := client.DropIndexProperties(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标 Collection 的名称。

- **indexName** (*string*)

    索引的名称。

- **keys** (*...string*)

    键。

**返回类型：**

*error*

**返回值：**

成功时返回 nil；否则返回描述错误原因的 error。

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
defer cli.Close(ctx)

err = cli.DropIndexProperties(ctx, milvusclient.NewDropIndexPropertiesOption("my_collection", "my_index", "mmap.enabled"))
if err != nil {
	// handle err
}
```
