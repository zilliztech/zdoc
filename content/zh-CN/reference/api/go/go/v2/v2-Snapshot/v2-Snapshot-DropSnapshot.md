---
title: "DropSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-DropSnapshot
sidebar_label: "DropSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会永久删除快照。删除后，快照数据将无法恢复。 | Go | v2"
type: docx
token: YP0vdMHw9oDlrcxjvg0cihgSnJb
sidebar_position: 3
keywords: 
  - DiskANN
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - zilliz
  - zilliz cloud
  - 云
  - DropSnapshot()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DropSnapshot()

此操作会永久删除快照。删除后，快照数据将无法恢复。

```go
func (c *Client) DropSnapshot(ctx context.Context, opt DropSnapshotOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := client.NewDropSnapshotOption(snapshotName, collectionName).
    WithDbName(dbName string)

err := client.DropSnapshot(option)
```

**参数：**

- **snapshotName** (*string*) - 

    要删除的快照名称。

- **collectionName** (*string*) - 

    该快照所属 Collection 的名称。

**构建器方法：**

- `WithDbName(dbName string)`

    用于设置指定 Collection 所属 Database 的名称。

**返回类型：**

*error*

**返回值：**

成功时返回 nil。如果快照不存在或操作失败，则返回错误。

**异常：**

- **error**

    通过检查 err != nil 获取失败详情。

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

option := milvusclient.NewDropSnapshotOption("backup_20260401", "my_collection")

err = cli.DropSnapshot(ctx, option)
if err != nil {
	// handle error
}

fmt.Println("Snapshot dropped successfully")
```
