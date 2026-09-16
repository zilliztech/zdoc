---
title: "IndexType | Go | v2"
slug: /go/go/v2-Management-IndexType
sidebar_label: "IndexType"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "ベクトルフィールドとスカラーフィールドでサポートされているインデックスアルゴリズムを列挙します。 | Go | v2"
type: docx
token: GppedViHro8TJMxQCZ3cJRKRnHg
sidebar_position: 16
keywords: 
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - 情報検索
  - zilliz
  - zilliz cloud
  - クラウド
  - IndexType
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# IndexType

ベクトルフィールドとスカラーフィールドでサポートされているインデックスアルゴリズムを列挙します。

```go
type IndexType string
```

**VALUES:**

- **AUTOINDEX** = "AUTOINDEX"

    最適なインデックスタイプを自動的に選択します。

- **Trie** = "Trie"

    文字列フィールド用の Trie インデックス。

- **Sorted** = "STL_SORT"

    スカラーフィールド用のソート済みインデックス。

- **Inverted** = "INVERTED"

    スカラーフィールド用の転置インデックス。

- **BITMAP** = "BITMAP"

    カーディナリティの低いスカラーフィールド用のビットマップインデックス。

- **RTREE** = "RTREE"

    空間データ用の R-tree インデックス。

## 例\{#example}

```go
import (
    "context"

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

// Create an HNSW index on a float vector field
hnswIndex := index.NewHNSWIndex(index.MetricTypeL2, 16, 200)
_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection", "embedding", hnswIndex))
if err != nil {
    // handle error
}

// Create an IVF_FLAT index
ivfIndex := index.NewIvfFlatIndex(index.MetricTypeL2, 128)
_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption(
    "my_collection", "embedding2", ivfIndex))
if err != nil {
    // handle error
}
```
