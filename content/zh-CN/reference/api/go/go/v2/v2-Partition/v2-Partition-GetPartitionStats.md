---
title: "GetPartitionStats() | Go | v2"
slug: /go/go/v2-Partition-GetPartitionStats
sidebar_label: "GetPartitionStats()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回有关 Partition 的统计信息，例如行数。 | Go | v2"
type: docx
token: Z835dscn3oM3sGxnDlacgndBn9o
sidebar_position: 3
keywords: 
  - 多模态 RAG
  - llm 幻觉
  - 混合搜索
  - 词法搜索
  - zilliz
  - zilliz cloud
  - 云
  - GetPartitionStats()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetPartitionStats()

此操作返回有关 Partition 的统计信息，例如行数。

```go
func (c *Client) GetPartitionStats(ctx context.Context, opt GetPartitionStatsOption, callOptions ...grpc.CallOption) (map[string]string, error)
```

**返回类型：**

*map[string]string, error*

**返回值：**

统计信息键值对的映射。如果操作失败，则返回错误。

**异常：**

- **error**

    请查看 `err != nil` 了解失败详情。

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
	// handle error
}
defer cli.Close(ctx)

stats, err := cli.GetPartitionStats(ctx, milvusclient.NewGetPartitionStatsOption("quick_setup", "partitionA"))
if err != nil {
	// handle error
}
fmt.Println(stats)
```
