---
title: "Collection | Go | v2"
slug: /go/go/v2-Collection
sidebar_label: "Collection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Collection 实例表示 Milvus 中的 Collection 元数据，包括 Collection Schema 和一致性设置。由 `DescribeCollection()` 返回。 | Go | v2"
type: docx
token: PNwFdxMMdo6rtIxERDHcVFgdnxc
sidebar_position: 6
keywords: 
  - 低成本向量 Database
  - 托管向量 Database
  - Pinecone 向量 Database
  - 音频搜索
  - zilliz
  - zilliz cloud
  - 云
  - Collection
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Collection

Collection 实例表示 Milvus 中的 Collection 元数据，包括 Collection Schema 和一致性设置。由 `DescribeCollection()` 返回。

```go
type Collection struct {
    ID int64
    Name string
    Schema *Schema
    PhysicalChannels []string
    VirtualChannels []string
    Loaded bool
    ConsistencyLevel ConsistencyLevel
    ShardNum int32
    Properties map[string]string
    UpdateTimestamp uint64
}
```

**字段：**

- **ID**（*int64*）

    Collection 的唯一标识符。

- **Name**（*string*）

    Collection 的名称。

- **Schema**（[Schema](./v2-Collection-Schema)）

    Collection 的 Schema，包含字段定义和主键。

- **PhysicalChannels**（*[]string*）

    Collection 使用的物理消息通道。

- **VirtualChannels**（*[]string*）

    Collection 使用的虚拟消息通道。

- **Loaded**（*bool*）

    Collection 当前是否已加载。

- **ConsistencyLevel**（[ConsistencyLevel](./v2-Collection-ConsistencyLevel)）

    Collection 的一致性级别。

- **ShardNum**（*int32*）

    Collection 中的分片数量。

- **Properties**（*map[string]string*）

    Collection 属性（例如 TTL 设置）。

- **UpdateTimestamp**（*uint64*）

    Collection 的更新时间戳，通常用于内部变更检测。

## 示例\{#example}

演示 Collection 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	// handle error
}
defer cli.Close(ctx)

collection, err := cli.DescribeCollection(ctx, milvusclient.NewDescribeCollectionOption("books"))
if err != nil {
	// handle error
}
fmt.Println(collection.Name, collection.ConsistencyLevel)
```
