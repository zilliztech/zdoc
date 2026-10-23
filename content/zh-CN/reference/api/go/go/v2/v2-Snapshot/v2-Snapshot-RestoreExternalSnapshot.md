---
title: "RestoreExternalSnapshot | Go | v2"
slug: /go/go/v2-Snapshot-RestoreExternalSnapshot
sidebar_label: "RestoreExternalSnapshot"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将外部快照恢复到目标 Collection。恢复将异步运行——请使用 `GetRestoreSnapshotState()` 监控进度。 | Go | v2"
type: docx
token: HSYWdB6MaoyG2vxEpMSca16fnsb
sidebar_position: 9
keywords: 
  - 私有 LLM
  - 最近邻搜索
  - LLM 评估
  - 稀疏与稠密
  - Zilliz
  - Zilliz Cloud
  - 云
  - RestoreExternalSnapshot
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RestoreExternalSnapshot

此操作会将外部快照恢复到目标 Collection。恢复将异步运行——请使用 `GetRestoreSnapshotState()` 监控进度。

```go
func (c *Client) RestoreExternalSnapshot(ctx context.Context, opt RestoreExternalSnapshotOption, callOptions ...grpc.CallOption) (int64, error)
```

## 请求语法\{#request-syntax}

创建 RestoreExternalSnapshot() 的请求。

```go
option := milvusclient.NewRestoreExternalSnapshotOption(targetCollectionName, snapshotMetadataURI).
    WithDbName(dbName).
    WithExternalSpec(externalSpec).
    WithRequestTimeout(timeout)

jobID, err := cli.RestoreExternalSnapshot(ctx, option)
```

**参数：**

- **targetCollectionName** (*string*) -

    **[必需]**

    要恢复到的目标 Collection 的名称。

- **snapshotMetadataURI** (*string*) -

    **[必需]**

    要恢复的快照元数据的 URI。

**构建器方法：**

- `NewRestoreExternalSnapshotOption(targetCollectionName string, snapshotMetadataURI string)`

    创建一个用于恢复外部快照的新选项。

- `WithDbName(dbName string)`

    设置目标 Collection 的 Database 名称。

- `WithExternalSpec(externalSpec string)`

    设置用于恢复的外部存储规范（例如自定义 Endpoint 凭据）。

- `WithRequestTimeout(timeout time.Duration)`

    设置恢复请求的超时时间。默认值：`120 * time.Second`。

**返回类型：**

*int64, error*

**返回：**

成功时返回恢复作业 ID。将此 ID 与 `GetRestoreSnapshotState()` 配合使用，以跟踪恢复进度。如果操作失败，则返回错误。

**参数：**

- **result** (*int64*) -

    RestoreExternalSnapshot() 返回的 int64 值。

**异常：**

- **error**

    操作失败。检查 `err != nil` 以获取失败详情。

## 示例\{#example}

演示 RestoreExternalSnapshot() 的用法。

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

jobID, err := cli.RestoreExternalSnapshot(ctx, milvusclient.NewRestoreExternalSnapshotOption("restored_collection", "s3://my-bucket/snapshots/backup/"))
if err != nil {
	// handle error
}

fmt.Printf("Restore job started: %d\n", jobID)
```
