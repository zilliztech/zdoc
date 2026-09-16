---
title: "ReleaseCollection() | Go | v2"
slug: /go/go/v2-Management-ReleaseCollection
sidebar_label: "ReleaseCollection()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将 Collection 从内存中释放，以释放资源。 | Go | v2"
type: docx
token: YMxDdZUXfoCEPtxBhN8clGxDnUd
sidebar_position: 24
keywords: 
  - 向量索引
  - 开源向量 Database
  - 开源向量数据库
  - 向量 Database 示例
  - zilliz
  - zilliz cloud
  - 云
  - ReleaseCollection()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ReleaseCollection()

此操作会将 Collection 从内存中释放，以释放资源。

```go
func (c *Client) ReleaseCollection(ctx context.Context, option ReleaseCollectionOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewReleaseCollectionOption(collectionName)

err := client.ReleaseCollection(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标 Collection 的名称。

**返回类型：**

*error*

**返回：**

成功时返回 nil；如果出现问题，则返回描述出错原因的错误。

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

err = cli.ReleaseCollection(ctx, milvusclient.NewReleaseCollectionOption("custom_quick_setup"))
if err != nil {
	// handle error
}
```
