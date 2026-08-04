---
title: "New() | Go | v2"
slug: /go/go/v2-Client-New
sidebar_label: "New()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作使用指定的配置创建与指定 Zilliz Cloud 集群的连接。 | Go | v2"
type: docx
token: NvlZd3VOpoMrsoxmavQckdAOnQg
sidebar_position: 4
keywords: 
  - 向量存储
  - 开源向量数据库
  - 向量索引
  - 开源向量数据库
  - zilliz
  - zilliz cloud
  - 云
  - New()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# New()

此操作使用指定的配置创建与指定 Zilliz Cloud 集群的连接。

```go
func New(ctx context.Context, config *ClientConfig) (*Client, error)
```

**返回类型：**

**Client, error*

**返回：**

一个已连接且可直接使用的 Client 实例。如果连接失败，则返回错误。

**异常：**

- **error**

    请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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
