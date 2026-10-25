---
title: "DescribeCollection | Go | v2"
slug: /go/go/v2-Collection-DescribeCollection
sidebar_label: "DescribeCollection"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回 Collection 的详细信息，包括其 Schema 和属性。 | Go | v2"
type: docx
token: Gqw1dx2TLodFGCx2prYcTgminRe
sidebar_position: 11
keywords: 
  - ANNS
  - 向量搜索
  - knn 算法
  - HNSW
  - zilliz
  - Zilliz Cloud
  - 云
  - DescribeCollection
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# DescribeCollection

此操作返回 Collection 的详细信息，包括其 Schema 和属性。

```go
func (c *Client) DescribeCollection(ctx context.Context, option DescribeCollectionOption, callOptions ...grpc.CallOption) (collection *entity.Collection, err error)
```

## 请求语法\{#request-syntax}

创建 DescribeCollection() 的请求。

```go
option := milvusclient.NewDescribeCollectionOption(name)

result, err := client.DescribeCollection(ctx, option)
```

**参数：**

- **name** （*string*） -

    **[必需]**

    目标 Collection 的名称。

**构建器方法：**

- `NewDescribeCollectionOption(name string)`

    创建 DescribeCollection() 的请求。

**返回类型：**

*Entity.Collection, error*

**返回：**

Collection 的描述，包括 Schema、字段和属性。如果操作失败，则返回错误。

```go
type Collection struct {
    ID               int64
    Name             string
    Schema           *Schema
    PhysicalChannels []string
    VirtualChannels  []string
    Loaded           bool
    ConsistencyLevel ConsistencyLevel
    ShardNum         int32
    Properties       map[string]string
    UpdateTimestamp  uint64
}
```

**参数：**

- **ID** （*int64*） -

    Collection 的唯一标识符。

- **Name** （*string*） -

    Collection 的名称。

- **Schema** （[Schema](./v2-Collection-Schema)） -

    Collection 的 Schema，包含字段定义和主键。

- **PhysicalChannels** （*[]string*） -

    Collection 使用的物理消息通道。

- **VirtualChannels** （*[]string*） -

    Collection 使用的虚拟消息通道。

- **Loaded** （*bool*） -

    Collection 当前是否已加载。

- **ConsistencyLevel** （[ConsistencyLevel](./v2-Collection-ConsistencyLevel)） -

    Collection 的一致性级别。

- **ShardNum** （*int32*） -

    Collection 中分片的数量。

- **Properties** （*map[string]string*） -

    Collection 的属性（例如，TTL 设置）。

- **UpdateTimestamp** （*uint64*） -

    Collection 的更新时间戳，通常用于内部变更检测。

**异常：**

- **error**

    操作失败。请查看 `err != nil` 了解失败详情。

## 示例\{#example}

演示 DescribeCollection() 的用法。

```go
import (
	"context"
	"fmt"
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

collection, err := cli.DescribeCollection(ctx, milvusclient.NewDescribeCollectionOption("quick_setup"))
if err != nil {
	// handle error
}

fmt.Println(collection)
```
