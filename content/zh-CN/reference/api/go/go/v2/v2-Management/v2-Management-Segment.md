---
title: "Segment | Go | v2"
slug: /go/go/v2-Management-Segment
sidebar_label: "Segment"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Segment 实例表示 Milvus 中的持久化数据 Segment。由 `GetPersistentSegmentInfo()` 返回。 | Go | v2"
type: docx
token: CTUCd5vxBoEyEYxrzgrc58EsnJc
sidebar_position: 25
keywords: 
  - 音频相似度搜索
  - Elastic 向量 Database
  - Pinecone 与 Milvus 对比
  - Chroma 与 Milvus 对比
  - zilliz
  - Zilliz Cloud
  - 云
  - Segment
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# Segment

Segment 实例表示 Milvus 中的一个持久化数据 Segment。由 `GetPersistentSegmentInfo()` 返回。

```go
type Segment struct {
    ID int64
    CollectionID int64
    ParititionID int64
    NumRows int64
    State commonpb.SegmentState
}
```

**字段：**

- **ID**（*int64*） -

    Segment 的唯一标识符。

- **CollectionID**（*int64*） -

    该 Segment 所属的 Collection 的标识符。

- **ParititionID**（*int64*） -

    该 Segment 所属的 Partition 的标识符。

- **NumRows**（*int64*） -

    Segment 中的行数。

- **State**（*commonpb.SegmentState*） -

    Segment 的当前状态。

**构建器方法：**

- `Flushed() bool`

    当 Segment 处于 flushed 状态时返回 true。

## 示例\{#example}

演示 Segment 的用法。

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

segments, err := cli.GetPersistentSegmentInfo(ctx, milvusclient.NewGetPersistentSegmentInfoOption("books"))
if err != nil {
	// handle error
}
for _, segment := range segments {
	fmt.Println(segment.ID, segment.NumRows)
}
```
