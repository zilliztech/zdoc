---
title: "CreateSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-CreateSnapshot
sidebar_label: "CreateSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建 Collection 的时间点快照。您可以使用快照备份 Collection 数据和元数据，以便进行灾难恢复或迁移。 | Go | v2"
type: docx
token: QFxmdtUNVoy071xXO8Acvkdpnse
sidebar_position: 1
keywords: 
  - Milvus 数据库
  - Milvus 向量数据库
  - Zilliz Cloud
  - 什么是 Milvus
  - zilliz
  - zilliz cloud
  - 云
  - CreateSnapshot()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# CreateSnapshot()

此操作会创建 Collection 的时间点快照。您可以使用快照备份 Collection 数据和元数据，以便进行灾难恢复或迁移。

```go
func (c *Client) CreateSnapshot(ctx context.Context, opt CreateSnapshotOption, callOptions ...grpc.CallOption) error
```

## 请求语法\{#request-syntax}

```go
option := client.NewCreateSnapshotOption(snapshotName, collectionName).
    WithDescription(description string).
    WithDbName(dbName string)

err := client.CreateSnapshot(option)
```

**参数：**

- **snapshotName** (*string*) - 

    要创建的快照名称。该名称在 Collection 内必须唯一。

- **collectionName** (*string*) - 

    要创建快照的 Collection 名称。

**构建器方法：**

- `WithDescription(description string)`

    用于为快照设置可选的人类可读描述。

- `WithDbName(dbName string)`

    用于设置 Database 名称。如果未设置，则使用默认 Database。

**返回类型：**

*error*

**返回值：**

成功时返回 nil。如果 Collection 不存在、快照名称已被占用，或操作因任何其他原因失败，则返回错误。

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

option := milvusclient.NewCreateSnapshotOption("backup_20260418", "my_collection").
	WithDescription("Daily backup before schema change")

err = cli.CreateSnapshot(ctx, option)
if err != nil {
	// handle error
}

fmt.Println("Snapshot created successfully")
```
