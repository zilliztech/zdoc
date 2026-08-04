---
title: "RestoreSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-RestoreSnapshot
sidebar_label: "RestoreSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将快照恢复到目标集合。恢复会异步运行——使用 `GetRestoreSnapshotState()` 监控进度。 | Go | v2"
type: docx
token: DrQidTj6koNKBkxHi4NcAxBfnDd
sidebar_position: 8
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - RestoreSnapshot()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# RestoreSnapshot()

此操作会将快照恢复到目标集合。恢复会异步运行——使用 `GetRestoreSnapshotState()` 监控进度。

```go
func (c *Client) RestoreSnapshot(ctx context.Context, opt RestoreSnapshotOption, callOptions ...grpc.CallOption) (int64, error)
```

## 请求语法\{#request-syntax}

```go
option := client.NewRestoreSnapshotOption(snapshotName, collectionName, targetCollectionName).
    WithDbName(dbName string).
    WithTargetDbName(targetDbName string)

jobID, err := client.RestoreSnapshot(option)
```

**参数：**

- **snapshotName** (*string*) -

    要恢复的快照名称。

- **collectionName** (*string*) -

    创建该快照时所在的源集合名称。

- **targetCollectionName** (*string*) -

    恢复后集合的名称。该名称必须与源集合名称不同。

**构建器方法：**

- `WithDbName(dbName string)`

    设置源数据库名称。如果未设置，则使用默认数据库。

- `WithTargetDbName(targetDbName string)`

    设置恢复后集合的目标数据库名称。如果未设置，则使用源数据库。

**返回类型：**

*int64, error*

**返回值：**

恢复任务 ID。使用此 ID 配合 `GetRestoreSnapshotState()` 跟踪恢复进度。如果快照不存在或操作失败，则返回错误。

**异常：**

- **error**

    检查 err != nil 以获取失败详情。

## 示例\{#example}

```go
import (
	"context"
	"fmt"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
	Address: milvusAddr,
})
if err != nil {
	log.Fatal(err)
}

defer cli.Close(ctx)

option := milvusclient.NewRestoreSnapshotOption("backup_20260418", "my_collection", "restored_collection")

jobID, err := cli.RestoreSnapshot(ctx, option)
if err != nil {
	// handle error
}

fmt.Printf("Restore job started: %d\n", jobID)
```
