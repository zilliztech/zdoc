---
title: "GetCollectionStats() | Go | v2"
slug: /go/go/v2-Collection-GetCollectionStats
sidebar_label: "GetCollectionStats()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回有关 Collection 的统计信息，例如行数。 | Go | v2"
type: docx
token: L4CvdyBIVoFsMNx546qcBqrOnJd
sidebar_position: 18
keywords: 
  - Milvus Database
  - Milvus Lite
  - Milvus Benchmark
  - 托管 Milvus
  - Zilliz
  - Zilliz Cloud
  - 云
  - GetCollectionStats()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetCollectionStats()

此操作返回有关 Collection 的统计信息，例如行数。

```go
func (c *Client) GetCollectionStats(ctx context.Context, opt GetCollectionOption) (map[string]string, error)
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

stats, err := cli.GetCollectionStats(ctx, milvusclient.NewGetCollectionStatsOption("quick_setup"))
if err != nil {
	// handle error
}
fmt.Println(stats)
```
