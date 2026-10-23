---
title: "GetExportSnapshotState | Go | v2"
slug: /go/go/v2-Snapshot-GetExportSnapshotState
sidebar_label: "GetExportSnapshotState"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作查询异步快照导出任务的状态和进度。 | Go | v2"
type: docx
token: Coq7d7x5qoOApzxWQAZcQ2wSnee
sidebar_position: 4
keywords: 
  - Milvus 开源
  - Milvus 的工作原理
  - Zilliz 向量 Database
  - Zilliz Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - GetExportSnapshotState
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetExportSnapshotState

此操作查询异步快照导出任务的状态和进度。

```go
func (c *Client) GetExportSnapshotState(ctx context.Context, opt GetExportSnapshotStateOption, callOptions ...grpc.CallOption) (*milvuspb.ExportSnapshotInfo, error)
```

## 请求语法\{#request-syntax}

为 GetExportSnapshotState() 创建请求。

```go
option := milvusclient.NewGetExportSnapshotStateOption(jobID)

info, err := cli.GetExportSnapshotState(ctx, option)
```

**参数：**

- **jobID** （*int64*） -

    **[必需]**

    由 `ExportSnapshot()` 返回的任务 ID。

**构建器方法：**

- `NewGetExportSnapshotStateOption(jobID int64)`

    为要查询的导出任务创建一个新选项。

**返回类型：**

*milvuspb.ExportSnapshotInfo, error*

**返回：**

指定导出快照任务的持久状态。如果操作失败，则返回错误。

**参数：**

- **result** （*milvuspb.ExportSnapshotInfo*） -

    指定导出快照任务的持久状态。

**错误处理：**

- **error**

    操作失败。请检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 GetExportSnapshotState() 的用法。

```go
import (
	"context"
	"fmt"

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

info, err := cli.GetExportSnapshotState(ctx, milvusclient.NewGetExportSnapshotStateOption(jobID))
if err != nil {
	// handle error
}

fmt.Printf("Export state: %v\n", info.GetState())
```
