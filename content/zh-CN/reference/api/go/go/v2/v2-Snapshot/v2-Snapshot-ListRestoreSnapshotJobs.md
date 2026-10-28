---
title: "ListRestoreSnapshotJobs() | Go | v2"
slug: /go/go/v2-Snapshot-ListRestoreSnapshotJobs
sidebar_label: "ListRestoreSnapshotJobs()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "列出所有恢复快照作业。可选按 Collection 名称或 Database 名称筛选。 | Go | v2"
type: docx
token: QrOmdt65AooKEkxVmNuc7qunnmf
sidebar_position: 6
keywords: 
  - Zilliz
  - Milvus 向量 Database
  - Milvus Database
  - Milvus 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListRestoreSnapshotJobs()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListRestoreSnapshotJobs()

此操作会列出所有恢复快照作业。您可以选择按 Collection 名称或 Database 名称筛选。

```go
func (c *Client) ListRestoreSnapshotJobs(ctx context.Context, opt ListRestoreSnapshotJobsOption, callOptions ...grpc.CallOption) ([]*milvuspb.RestoreSnapshotInfo, error)
```

## 请求语法\{#request-syntax}

创建 ListRestoreSnapshotJobs() 的请求。

```go
option := client.NewListRestoreSnapshotJobsOption().
    WithCollectionName(collectionName string).
    WithDbName(dbName string)

result, err := client.ListRestoreSnapshotJobs(option)
```

**参数：**

- **JobId**（*int64*）-

    恢复作业的 ID。

- **SnapshotName**（*string*）-

    正在恢复的快照名称。

- **DbName**（*string*）-

    目标 Database 名称。

- **CollectionName**（*string*）-

    目标 Collection 名称。

- **State**（*RestoreSnapshotState*）-

    当前状态。可能的值：*RestoreSnapshotNone*、*RestoreSnapshotPending*、*RestoreSnapshotExecuting*、*RestoreSnapshotCompleted* 和 *RestoreSnapshotFailed*。

- **Progress**（*int64*）-

    进度百分比（0 到 100）。

- **Reason**（*string*）-

    作业失败时的错误原因。

- **StartTime**（*int64*）-

    开始时间戳，单位为毫秒。

- **TimeCost**（*int64*）-

    耗时，单位为毫秒。

**构建器方法：**

- `WithCollectionName(collectionName string)`

    此方法按目标 Collection 名称筛选恢复作业。如果未设置，则会列出所有恢复作业。

- `WithDbName(dbName string)`

    此方法指定 Database 名称。如果未设置，则使用默认 Database。

**返回类型：**

<em>[]</em>milvuspb.RestoreSnapshotInfo, error&ast;

**返回：**

RestoreSnapshotInfo 对象的列表，每个对象记录一个恢复快照作业的详细信息。

```go
type RestoreSnapshotInfo struct {
    JobId          int64
    SnapshotName   string
    DbName         string
    CollectionName string
    State          RestoreSnapshotState
    Progress       int64
    Reason         string
    StartTime      int64
    TimeCost       int64
}
```

**参数：**

- **result**（<em>[]</em>milvuspb.RestoreSnapshotInfo&ast;）-

    RestoreSnapshotInfo 对象，每个对象记录一个恢复快照作业的详细信息。

**错误处理：**

- **error**

    操作失败。请检查 err != nil 以获取失败详情。

## 示例\{#example}

演示 ListRestoreSnapshotJobs() 的用法。

```go
import (
	"log"
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
	log.Fatal(err)
}

defer cli.Close(ctx)

option := milvusclient.NewListRestoreSnapshotJobsOption()

jobs, err := cli.ListRestoreSnapshotJobs(ctx, option)
if err != nil {
	// handle error
}

for _, job := range jobs {
	fmt.Printf("Job %d: %s -> %s (%s)\n", job.GetJobId(), job.GetSnapshotName(), job.GetCollectionName(), job.GetState())
}
```
