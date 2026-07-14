---
title: "AnnParam | Go | v2"
slug: /go/go/v2-Vector-AnnParam
sidebar_label: "AnnParam"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "近似最近傍探索パラメータのインターフェースです。設定可能なインスタンスを作成するには NewCustomAnnParam() を使用します。 | Go | v2"
type: docx
token: XV3adWSVho0zgfx6CZDc30GAnMc
sidebar_position: 1
keywords: 
  - 大規模言語モデル
  - ベクトル化
  - k近傍アルゴリズム
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - AnnParam
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# AnnParam

近似最近傍探索パラメータのインターフェースです。設定可能なインスタンスを作成するには NewCustomAnnParam() を使用します。

```go
type AnnParam interface {
    Params() map[string]any
}
```

**メソッド:**

- `Params() map[string]any`

    検索パラメータをキーと値のマップとして返します。

## Example\{#example}

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
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

queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

// Create AnnParam for HNSW search (ef controls recall vs speed)
annParam := index.NewHNSWAnnParam(64) // ef = 64

results, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", 10, []entity.Vector{entity.FloatVector(queryVector)},
).WithAnnParam(annParam))
if err != nil {
    // handle error
}
fmt.Println(results)
```
