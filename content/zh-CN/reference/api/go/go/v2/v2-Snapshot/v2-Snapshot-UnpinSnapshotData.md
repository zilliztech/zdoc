---
title: "UnpinSnapshotData() | Go | v2"
slug: /go/go/v2-Snapshot-UnpinSnapshotData
sidebar_label: "UnpinSnapshotData()"
beta: false
added_since: v3.0.0
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会取消固定先前已固定的快照数据，使其能够被垃圾回收。 | Go | v2"
type: docx
token: NgKmd79aSob0ruxRuUEcZba7nge
sidebar_position: 9
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless 向量 Database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - UnpinSnapshotData()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# UnpinSnapshotData()

此操作会取消固定先前已固定的快照数据，使其能够被垃圾回收。

```go
func (c *Client) UnpinSnapshotData(ctx context.Context, opt UnpinSnapshotDataOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewUnpinSnapshotDataOption(pinID)

err := cli.UnpinSnapshotData(ctx, option)
```

**参数：**

- **opt** (*UnpinSnapshotDataOption*) -

    用于取消固定快照数据的选项。

**构建器方法：**

- `NewUnpinSnapshotDataOption(pinID int64)`

    这会使用由 `PinSnapshotData()` 返回的 pin ID 创建一个用于取消固定快照数据的选项。

**返回类型：**

*error*

**返回值：**

成功时返回 nil；如果操作失败，则返回错误。

**异常：**

- **error**

    检查 err != nil 以获取失败详情。

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

pinID := int64(12345)

err = cli.UnpinSnapshotData(ctx, milvusclient.NewUnpinSnapshotDataOption(pinID))
if err != nil {
	log.Fatal("failed to unpin snapshot data: ", err.Error())
}
```
