---
title: "PinSnapshotData() | Go | v2"
slug: /go/go/v2-Snapshot-PinSnapshotData
sidebar_label: "PinSnapshotData()"
beta: false
added_since: v3.0.0
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会固定 Collection 的快照数据，防止其被垃圾回收。返回一个 pin ID，您之后可以使用该 ID 取消固定数据。 | Go | v2"
type: docx
token: HmEkdVsmRoc2TbxEjtkcKChfnEf
sidebar_position: 7
keywords: 
  - Milvus 数据库
  - Milvus 向量数据库
  - Zilliz Cloud
  - 什么是 Milvus
  - zilliz
  - zilliz cloud
  - 云
  - PinSnapshotData()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# PinSnapshotData()

此操作会固定 Collection 的快照数据，防止其被垃圾回收。返回一个 pin ID，您之后可以使用该 ID 取消固定数据。

```go
func (c *Client) PinSnapshotData(ctx context.Context, opt PinSnapshotDataOption, callOptions ...grpc.CallOption) (int64, error)
```

## 请求语法\{#request-syntax}

```go
option := milvusclient.NewPinSnapshotDataOption("my_snapshot", "my_collection").
    WithDbName("my_db").
    WithTTL(3600)

pinID, err := cli.PinSnapshotData(ctx, option)
```

**参数：**

- **opt** (*PinSnapshotDataOption*) -

    用于固定快照数据的选项。

**构建器方法：**

- `NewPinSnapshotDataOption(name string, collectionName string)`<br/>
  此方法会为指定的 Collection 创建一个用于固定快照数据的选项。

- `WithDbName(dbName string)`<br/>
  此方法设置 Collection 的 Database 名称。

- `WithTTL(ttlSeconds int64)`<br/>
  此方法以秒为单位设置该 pin 的生存时间。

**返回类型：**

*int64, error*

**返回值：**

成功时返回 pin ID；如果操作失败，则返回错误。

**异常：**

- **error**

    检查 err != nil 以了解失败详情。

## 示例\{#example}

```go
import (
	"context"
	"fmt"
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

pinID, err := cli.PinSnapshotData(ctx, milvusclient.NewPinSnapshotDataOption("my_snapshot", "quick_setup"))
if err != nil {
	log.Fatal("failed to pin snapshot data: ", err.Error())
}

fmt.Println("Pin ID:", pinID)
```
