---
title: "ListSnapshots() | Go | v2"
slug: /go/go/v2-Snapshot-ListSnapshots
sidebar_label: "ListSnapshots()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会列出指定 collection 的所有快照名称。 | Go | v2"
type: docx
token: Bs3OdQ56zohZEbx9KaHcInM4nHh
sidebar_position: 6
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - ListSnapshots()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ListSnapshots()

此操作会列出指定 collection 的所有快照名称。

```go
func (c *Client) ListSnapshots(ctx context.Context, opt ListSnapshotsOption, callOptions ...grpc.CallOption) ([]string, error)
```

## 请求语法\{#request-syntax}

```go
option := client.NewListSnapshotsOption(collectionName).
    WithDbName(dbName string)

result, err := client.ListSnapshots(option)
```

**参数：**

- **collectionName** (*string*) -

    目标 collection 的名称。

**构建器方法：**

- `WithDbName(dbName string)`

    此方法用于设置数据库名称。如果未设置，则使用默认数据库。

**返回类型：**

*[]string, error*

**返回值：**

快照名称列表。如果操作失败，则返回错误。

**异常：**

- **error**

    通过检查 `err != nil` 获取失败详情。

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

option := milvusclient.NewListSnapshotsOption("my_collection")

snapshots, err := cli.ListSnapshots(ctx, option)
if err != nil {
	// handle error
}

fmt.Println(snapshots)
```
