---
title: "IndexType | Go | v2"
slug: /go/go/v2-Management-IndexType
sidebar_label: "IndexType"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "枚举向量字段和标量字段支持的索引算法。 | Go | v2"
type: docx
token: GppedViHro8TJMxQCZ3cJRKRnHg
sidebar_position: 16
keywords: 
  - 异常检测
  - sentence transformers
  - 推荐系统
  - 信息检索
  - zilliz
  - zilliz cloud
  - 云
  - IndexType
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# IndexType

枚举向量字段和标量字段支持的索引算法。

```go
type IndexType string
```

**取值：**

- **AUTOINDEX** = "AUTOINDEX"

    自动选择最佳索引类型。

- **Trie** = "Trie"

    用于字符串字段的 Trie 索引。

- **Sorted** = "STL_SORT"

    用于标量字段的排序索引。

- **Inverted** = "INVERTED"

    用于标量字段的倒排索引。

- **BITMAP** = "BITMAP"

    用于低基数标量字段的位图索引。

- **RTREE** = "RTREE"

    用于空间数据的 R-tree 索引。

## 示例\{#example}

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
