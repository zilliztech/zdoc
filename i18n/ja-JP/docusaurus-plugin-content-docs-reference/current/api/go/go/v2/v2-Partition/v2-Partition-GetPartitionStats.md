---
title: "GetPartitionStats() | Go | v2"
slug: /go/go/v2-Partition-GetPartitionStats
sidebar_label: "GetPartitionStats()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、パーティションの行数などの統計情報を返します。 | Go | v2"
type: docx
token: Z835dscn3oM3sGxnDlacgndBn9o
sidebar_position: 3
keywords: 
  - マルチモーダル RAG
  - LLM ハルシネーション
  - ハイブリッド検索
  - レキシカル検索
  - zilliz
  - zilliz cloud
  - cloud
  - GetPartitionStats()
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# GetPartitionStats()

この操作は、パーティションの行数などの統計情報を返します。

```go
func (c *Client) GetPartitionStats(ctx context.Context, opt GetPartitionStatsOption, callOptions ...grpc.CallOption) (map[string]string, error)
```

**戻り値の型:**

*map[string]string, error*

**戻り値:**

統計情報のキーと値のペアからなるマップを返します。操作が失敗した場合は error を返します。

**例外:**

- **error**

    失敗の詳細は `err != nil` を確認してください。

## 例\{#example}

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
