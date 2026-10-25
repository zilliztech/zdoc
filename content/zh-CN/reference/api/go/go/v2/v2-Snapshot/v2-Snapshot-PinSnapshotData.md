---
title: "PinSnapshotData() | Go | v2"
slug: /go/go/v2-Snapshot-PinSnapshotData
sidebar_label: "PinSnapshotData()"
beta: false
added_since: v3.0.0
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会固定 Collection 的快照数据，防止其被垃圾回收。返回一个 pin ID，您之后可以使用该 ID 取消固定数据。 | Go | v2"
type: docx
token: HmEkdVsmRoc2TbxEjtkcKChfnEf
sidebar_position: 8
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

---

import Admonition from '@theme/Admonition';


# PinSnapshotData()

此操作会固定 Collection 的快照数据，防止其被垃圾回收。返回一个 pin ID，您之后可以使用该 ID 取消固定数据。

```go
func (c *Client) PinSnapshotData(ctx context.Context, opt PinSnapshotDataOption, callOptions ...grpc.CallOption) (int64, error)
```

## 请求语法\{#request-syntax}

创建 PinSnapshotData() 的请求。

```go
option := milvusclient.NewPinSnapshotDataOption("my_snapshot", "my_collection").
    WithDbName("my_db").
    WithTTL(3600)

pinID, err := cli.PinSnapshotData(ctx, option)
```

**参数：**

- **name** (*string*) -

    **[必需]**

    要创建的 Collection 的名称。

- **collectionName** (*string*) -

    **[必需]**

    目标 Collection 的名称。

**构建器方法：**

- `NewPinSnapshotDataOption(name string, collectionName string)`

    此方法会为指定的 Collection 创建一个用于固定快照数据的选项。

- `WithDbName(dbName string)`

    此方法设置 Collection 的 Database 名称。

- `WithTTL(ttlSeconds int64)`

    此方法以秒为单位设置该 pin 的生存时间。

**返回类型：**

*int64, error*

**返回：**

成功时返回 pin ID；如果操作失败，则返回错误。

**参数：**

- **result** (*int64*) -

    PinSnapshotData() 返回的 int64 值。

**异常：**

- **error**

    操作失败。检查 err != nil 以获取失败详情。

## 示例\{#example}

演示 PinSnapshotData() 的用法。

```go
import (
	"context"
	"fmt"
	"log"

	"github.com/milvus-io/milvus/client/v3/milvusclient"
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
