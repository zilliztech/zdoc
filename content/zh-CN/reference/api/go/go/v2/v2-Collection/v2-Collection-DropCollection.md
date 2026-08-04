---
title: "DropCollection() | Go | v2"
slug: /go/go/v2-Collection-DropCollection
sidebar_label: "DropCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会永久删除一个 collection 及其所有数据。 | Go | v2"
type: docx
token: LBTLd1W4UoAbUHxvv6xce1gHnqf
sidebar_position: 13
keywords: 
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - zilliz
  - zilliz cloud
  - cloud
  - DropCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropCollection()

此操作会永久删除一个 collection 及其所有数据。

```go
func (c *Client) DropCollection(ctx context.Context, option DropCollectionOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewDropCollectionOption(name)

err := client.DropCollection(ctx, option)
```

**参数：**

- **name** (*string*)

    目标 collection 的名称。

**返回类型：**

*error*

**返回值：**

成功时返回 nil；如果失败，则返回描述具体问题的 error。

**异常：**

- **error**

    通过检查 `err != nil` 获取失败详情。

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

err = cli.DropCollection(ctx, milvusclient.NewDropCollectionOption("customized_setup_2"))
if err != nil {
	// handle err
}
```
