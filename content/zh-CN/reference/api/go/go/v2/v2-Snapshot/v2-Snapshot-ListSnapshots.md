---
title: "ListSnapshots() | Go | v2"
slug: /go/go/v2-Snapshot-ListSnapshots
sidebar_label: "ListSnapshots()"
beta: ON REQUEST
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会列出指定 Collection 的所有快照名称。 | Go | v2"
type: docx
token: Bs3OdQ56zohZEbx9KaHcInM4nHh
sidebar_position: 7
keywords: 
  - 自然语言搜索
  - 相似度搜索
  - 多模态 RAG
  - LLM 幻觉
  - Zilliz
  - Zilliz Cloud
  - 云
  - ListSnapshots()
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ListSnapshots()

此操作会列出指定 Collection 的所有快照名称。

```go
func (c *Client) ListSnapshots(ctx context.Context, opt ListSnapshotsOption, callOptions ...grpc.CallOption) ([]string, error)
```

## 请求语法\{#request-syntax}

创建 ListSnapshots() 的请求。

```go
option := client.NewListSnapshotsOption(collectionName).
    WithDbName(dbName string)

result, err := client.ListSnapshots(option)
```

**参数：**

- **collectionName**（*string*）-

    **[必需]**

    目标 Collection 的名称。

**构建器方法：**

- `WithDbName(dbName string)`

    设置 Database 名称。如果未设置，则使用默认 Database。

**返回类型：**

*[]string, error*

**返回：**

快照名称列表。如果操作失败，则返回错误。

**参数：**

- **result**（*[]string*）-

    由 ListSnapshots() 返回的 []string 值。

**异常：**

- **error**

    操作失败。请检查 err != nil 以获取失败详情。

## 示例\{#example}

演示 ListSnapshots() 的用法。

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

option := milvusclient.NewListSnapshotsOption("my_collection")

snapshots, err := cli.ListSnapshots(ctx, option)
if err != nil {
	// handle error
}

fmt.Println(snapshots)
```
