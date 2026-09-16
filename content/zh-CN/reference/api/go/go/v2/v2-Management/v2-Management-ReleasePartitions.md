---
title: "ReleasePartitions() | Go | v2"
slug: /go/go/v2-Management-ReleasePartitions
sidebar_label: "ReleasePartitions()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会将特定 Partition 从内存中释放。 | Go | v2"
type: docx
token: BcAVdlDIioMUXTxqyZkcXfqznKd
sidebar_position: 25
keywords: 
  - Zilliz 向量 Database
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - zilliz
  - zilliz cloud
  - 云
  - ReleasePartitions()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ReleasePartitions()

此操作会将特定 Partition 从内存中释放。

```go
func (c *Client) ReleasePartitions(ctx context.Context, option ReleasePartitionsOption, callOptions ...grpc.CallOption) error
```

## Request Syntax\{#request-syntax}

```go
option := milvusclient.NewReleasePartitionsOption(collectionName, partitionNames)

err := client.ReleasePartitions(ctx, option)
```

**参数：**

- **collectionName** (*string*)

    目标 Collection 的名称。

- **partitionNames** (*...string*)

    Partition 的名称。

**返回类型：**

*error*

**返回：**

成功时返回 nil，否则返回描述错误原因的 error。

**异常：**

- **error**

    查看 `err != nil` 了解失败详情。

## 示例\{#example}

```go
import (
	"context"

	"github.com/milvus-io/milvus/client/v2/milvusclient"
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

err = cli.ReleasePartitions(ctx, milvusclient.NewReleasePartitionsOptions("quick_setup", "partitionA"))
if err != nil {
	// handle error
}
```
