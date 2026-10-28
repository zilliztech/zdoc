---
title: "UnpinSnapshotData() | Go | v2"
slug: /go/go/v2-Snapshot-UnpinSnapshotData
sidebar_label: "UnpinSnapshotData()"
beta: ON REQUEST
added_since: v3.0.0
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会取消固定先前已固定的快照数据，使垃圾回收（Garbage Collection）能够回收这些文件。 | Go | v2"
type: docx
token: NgKmd79aSob0ruxRuUEcZba7nge
sidebar_position: 11
keywords: 
  - Milvus 基准测试
  - 托管 Milvus
  - Serverless 向量 Database
  - Milvus 开源
  - Zilliz
  - Zilliz Cloud
  - 云
  - UnpinSnapshotData()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# UnpinSnapshotData()

此操作会取消固定先前已固定的快照数据，使垃圾回收（Garbage Collection）能够回收这些文件。

```go
func (c *Client) UnpinSnapshotData(ctx context.Context, opt UnpinSnapshotDataOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

为 UnpinSnapshotData() 创建请求。

```go
option := milvusclient.NewUnpinSnapshotDataOption(pinID)

err := cli.UnpinSnapshotData(ctx, option)
```

**参数：**

- **pinID** （*int64*） -

    **[必需]**

    由 `PinSnapshotData()` 返回的 pin ID。

**构建器方法：**

- `NewUnpinSnapshotDataOption(pinID int64)`

    为要释放的 pin 创建一个新选项。

**返回类型：**

*error*

**返回：**

成功时返回 nil；如果操作失败，则返回错误。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 UnpinSnapshotData() 的用法。

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	// handle error
}

defer cli.Close(ctx)

err = cli.UnpinSnapshotData(ctx, milvusclient.NewUnpinSnapshotDataOption(pinID))
if err != nil {
	// handle error
}
```
