---
title: "GetPersistentSegmentInfo | Go | v2"
slug: /go/go/v2-Management-GetPersistentSegmentInfo
sidebar_label: "GetPersistentSegmentInfo"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作返回 Collection 中持久化数据 Segment 的信息。 | Go | v2"
type: docx
token: WYiEdG01Oo8BgHxnjA3ci72insg
sidebar_position: 13
keywords: 
  - DiskANN
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - zilliz
  - zilliz cloud
  - 云
  - GetPersistentSegmentInfo
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetPersistentSegmentInfo

此操作返回 Collection 中持久化数据 Segment 的信息。

```go
func (c *Client) GetPersistentSegmentInfo(ctx context.Context, option GetPersistentSegmentInfoOption) ([]*entity.Segment, error)
```

## 请求语法\{#request-syntax}

创建 GetPersistentSegmentInfo() 的请求。

```go
option := milvusclient.NewGetPersistentSegmentInfoOption("quick_setup")

segments, err := client.GetPersistentSegmentInfo(ctx, option)
```

**构建器方法：**

- `NewGetPersistentSegmentInfoOption(collectionName string)`

    创建 GetPersistentSegmentInfo() 的请求。

**返回类型：**

<em>[]</em>Entity.Segment, error&ast;

**返回：**

持久化 Segment 详细信息列表。如果操作失败，则返回错误。

```go
type Segment struct {
    ID           int64
    CollectionID int64
    ParititionID int64
    NumRows      int64
    State        commonpb.SegmentState
}
```

**参数：**

- **ID** (*int64*) -

    Segment 的唯一标识符。

- **CollectionID** (*int64*) -

    Segment 所属 Collection 的标识符。

- **ParititionID** (*int64*) -

    Segment 所属 Partition 的标识符。

- **NumRows** (*int64*) -

    Segment 中的行数。

- **State** (*commonpb.SegmentState*) -

    Segment 的当前状态。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以了解失败详情。

## 示例\{#example}

演示 GetPersistentSegmentInfo() 的用法。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
	log.Fatal("failed to connect to milvus server: ", err.Error())
}
defer cli.Close(ctx)

segments, err := cli.GetPersistentSegmentInfo(ctx, milvusclient.NewGetPersistentSegmentInfoOption("quick_setup"))
if err != nil {
	// handle error
}
fmt.Println(segments)
```
