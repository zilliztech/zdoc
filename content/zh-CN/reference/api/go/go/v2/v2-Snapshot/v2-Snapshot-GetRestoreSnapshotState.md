---
title: "GetRestoreSnapshotState() | Go | v2"
slug: /go/go/v2-Snapshot-GetRestoreSnapshotState
sidebar_label: "GetRestoreSnapshotState()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会查询异步恢复快照任务的状态和进度。 | Go | v2"
type: docx
token: SxMgdp3ThoMYHaxkKtKc9EWvnZd
sidebar_position: 5
keywords: 
  - 什么是向量 Database
  - 有哪些向量 Database
  - 向量 Database 比较
  - Faiss
  - Zilliz
  - Zilliz Cloud
  - 云
  - GetRestoreSnapshotState()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# GetRestoreSnapshotState()

此操作会查询异步恢复快照任务的状态和进度。

```go
func (c *Client) GetRestoreSnapshotState(ctx context.Context, opt GetRestoreSnapshotStateOption, callOptions ...grpc.CallOption) (*milvuspb.RestoreSnapshotInfo, error)
```

## 请求语法\{#request-syntax}

为 GetRestoreSnapshotState() 创建请求。

```go
option := client.NewGetRestoreSnapshotStateOption(jobID)

result, err := client.GetRestoreSnapshotState(option)
```

**参数：**

- **jobID** (*int64*) -

    **[REQUIRED]**

    恢复任务 ID。

**返回类型：**

*milvuspb.RestoreSnapshotInfo, error*

**返回：**

一个 RestoreSnapshotInfo 对象，记录指定恢复快照任务的详细信息。

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

- **result** (*milvuspb.RestoreSnapshotInfo*) -

    该 RestoreSnapshotInfo 对象记录指定恢复快照任务的详细信息。

**错误处理：**

- **error**

    操作失败。请检查 err != nil 以获取失败详情。

## 示例\{#example}

演示 GetRestoreSnapshotState() 的用法。

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

option := milvusclient.NewGetRestoreSnapshotStateOption(12345)

info, err := cli.GetRestoreSnapshotState(ctx, option)
if err != nil {
	// handle error
}

fmt.Println(info.GetState())
fmt.Println(info.GetProgress())
```
