---
title: "ColumnBinaryVectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnBinaryVectorArray
sidebar_label: "ColumnBinaryVectorArray"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ColumnBinaryVectorArray 实例表示一个 ArrayOfVector 二进制向量列，其各行包含具有相同维度的二进制向量值。可空语义在 v3.0.0 中强制执行：可空性标志和有效值记录都是真实操作，而不是占位实现。 | Go | v2"
type: docx
token: VKeBdnkoXoI29txzTuncqsaDnte
sidebar_position: 3
keywords: 
  - 向量搜索
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - Zilliz
  - Zilliz Cloud
  - 云
  - ColumnBinaryVectorArray
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ColumnBinaryVectorArray

ColumnBinaryVectorArray 实例表示一个 ArrayOfVector 二进制向量列，其各行包含具有相同维度的二进制向量值。可空语义在 v3.0.0 中强制执行：可空性标志和有效值记录都是真实操作，而不是占位实现。

```go
type ColumnBinaryVectorArray struct {
}
```

**构建器方法：**

- `AppendValue(value any) error`

    此方法追加一行，该行以 []Entity.BinaryVector 或 [][]byte 的形式提供。

- `IsNull(idx int) (bool, error)`

    此方法指示给定索引处的行是否为 null。

- `Nullable() bool`

    此方法指示该列是否接受 null 值。

- `SetNullable(nullable bool)`

    此方法设置该列是否接受 null 值。

- `ValidCount() int`

    此方法返回非 null 行的数量。

- `ValidateNullable() error`

    此方法验证内部可空性记录，并在不一致时返回错误。

**方法：**

- `Slice(start, end int) Column`

## 示例\{#example}

演示 ColumnBinaryVectorArray 的用法。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnBinaryVectorArray("embeddings", 8, [][][]byte{{{0xff}}})
fmt.Println(values.Len())
```
