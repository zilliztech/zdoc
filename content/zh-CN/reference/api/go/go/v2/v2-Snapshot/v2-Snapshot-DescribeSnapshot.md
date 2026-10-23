---
title: "DescribeSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-DescribeSnapshot
sidebar_label: "DescribeSnapshot()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作检索特定快照的详细元数据，包括源 Collection、Partition 名称、创建时间戳和存储位置。 | Go | v2"
type: docx
token: NM44dNuQtoKR9UxlEbqcZrVUnpb
sidebar_position: 2
keywords: 
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - LLM 幻觉
  - zilliz
  - zilliz cloud
  - 云
  - DescribeSnapshot()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeSnapshot()

此操作检索特定快照的详细元数据，包括源 Collection、Partition 名称、创建时间戳和存储位置。

```go
func (c *Client) DescribeSnapshot(ctx context.Context, opt DescribeSnapshotOption, callOptions ...grpc.CallOption) (*milvuspb.DescribeSnapshotResponse, error)
```

## 请求语法\{#request-syntax}

为 DescribeSnapshot() 创建请求。

```go
option := client.NewDescribeSnapshotOption(snapshotName, collectionName).
    WithDbName(dbName string)

result, err := client.DescribeSnapshot(option)
```

**参数：**

- **name** (*string*) -

    **[必需]**

    要描述的快照名称。

- **collectionName** (*string*) -

    **[必需]**

    该快照所属的 Collection 名称。

**构建器方法：**

- `WithDbName(dbName string)`

**返回类型：**

*milvuspb.DescribeSnapshotResponse, error*

**返回：**

包含详细快照元数据的 DescribeSnapshotResponse 对象。

```go
type DescribeSnapshotResponse struct {
    Name           string
    Description    string
    CollectionName string
    CreateTs       int64
    S3Location     string
    PartitionNames []string
}
```

**参数：**

- **result** (*milvuspb.DescribeSnapshotResponse*) -

    包含详细快照元数据的 DescribeSnapshotResponse 对象。

**异常处理：**

- **error**

    操作失败。检查 err != nil 以获取失败详情。

## 示例\{#example}

演示 DescribeSnapshot() 的用法。

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

option := milvusclient.NewDescribeSnapshotOption("backup_20260418", "my_collection")

resp, err := cli.DescribeSnapshot(ctx, option)
if err != nil {
	// handle error
}

fmt.Println(resp.GetName())
fmt.Println(resp.GetCollectionName())
fmt.Println(resp.GetPartitionNames())
fmt.Println(resp.GetCreateTs())
fmt.Println(resp.GetS3Location())
```
