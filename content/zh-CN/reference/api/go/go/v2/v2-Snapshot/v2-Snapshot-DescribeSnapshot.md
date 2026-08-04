---
title: "DescribeSnapshot() | Go | v2"
slug: /go/go/v2-Snapshot-DescribeSnapshot
sidebar_label: "DescribeSnapshot()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作检索特定快照的详细元数据，包括源集合、分区名称、创建时间戳和存储位置。 | Go | v2"
type: docx
token: NM44dNuQtoKR9UxlEbqcZrVUnpb
sidebar_position: 2
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - DescribeSnapshot()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# DescribeSnapshot()

此操作检索特定快照的详细元数据，包括源集合、分区名称、创建时间戳和存储位置。

```go
func (c *Client) DescribeSnapshot(ctx context.Context, opt DescribeSnapshotOption, callOptions ...grpc.CallOption) (*milvuspb.DescribeSnapshotResponse, error)
```

## 请求语法\{#request-syntax}

```go
option := client.NewDescribeSnapshotOption(snapshotName, collectionName).
    WithDbName(dbName string)

result, err := client.DescribeSnapshot(option)
```

**参数：**

- **snapshotName** (*string*) - 

    要描述的快照名称。

- **collectionName** (*string*) - 

    该快照所属集合的名称。

**构建器方法：**

- `WithDbName(dbName string)`

    设置指定集合所属的数据库。

**返回类型：**

*milvuspb.DescribeSnapshotResponse, error*

**返回值：**

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

**构建器方法：**

- **Name** (*string*) -

    快照名称。

- **Description** (*string*) -

    快照描述。

- **CollectionName** (*string*) -

    源集合名称。

- **CreateTs** (*int64*) -

    以毫秒为单位的创建时间戳。

- **S3Location** (*string*) -

    快照数据的 S3 存储位置。

- **PartitionNames** (*[]string*) -

    快照中包含的分区名称列表。

**异常：**

- **error**

    检查 `err != nil` 以获取失败详情。

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
