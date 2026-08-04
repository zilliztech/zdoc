---
title: "GetCollectionStats() | Go | v2"
slug: /go/go/v2-Collection-GetCollectionStats
sidebar_label: "GetCollectionStats()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回有关集合的统计信息，例如行数。 | Go | v2"
type: docx
token: L4CvdyBIVoFsMNx546qcBqrOnJd
sidebar_position: 18
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - GetCollectionStats()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetCollectionStats()

此操作返回有关集合的统计信息，例如行数。

```go
func (c *Client) GetCollectionStats(ctx context.Context, opt GetCollectionOption) (map[string]string, error)
```

**返回类型：**

*map[string]string, error*

**返回：**

统计信息键值对组成的映射。如果操作失败，则返回错误。

**异常：**

- **error**

    通过检查 `err != nil` 获取失败详情。

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
