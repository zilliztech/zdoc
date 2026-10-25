---
title: "New | Go | v2"
slug: /go/go/v2-Client-New
sidebar_label: "New"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用指定配置创建与指定 Milvus 服务器的连接。 | Go | v2"
type: docx
token: TiJxdTD1yoot4TxXHHUchnERn8e
sidebar_position: 4
keywords: 
  - 向量 Database
  - IVF
  - knn
  - 图像搜索
  - zilliz
  - zilliz cloud
  - 云
  - New
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# New

此操作使用指定配置创建与指定 Milvus 服务器的连接。

```go
func New(ctx context.Context, config *ClientConfig) (*Client, error)
```

## 请求语法\{#request-syntax}

创建与指定 Milvus 服务器的连接。

```go
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
```

**参数：**

- **config** （&ast;*ClientConfig*） -

    连接的配置，包括 Milvus 服务器地址。

**返回类型：**

&ast;*Client, error*

**返回：**

返回一个已连接且可供使用的 Client 实例。如果连接失败，则返回错误。

**参数：**

- **result** （&ast;*Client*） -

    New() 返回的 &ast;Client 值。

**错误处理：**

- **error**

    操作失败。查看 `err != nil` 了解失败详情。

## 示例\{#example}

演示 New() 的用法。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

// Connect to a local Milvus server
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to create client:", err)
}
defer cli.Close(ctx)

collections, err := cli.ListCollections(ctx, milvusclient.NewListCollectionOption())
if err != nil {
	log.Fatal("failed to list collections:", err)
}
fmt.Println(collections)
```
