---
title: "ColumnFloat16VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnFloat16VectorArray
sidebar_label: "ColumnFloat16VectorArray"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ColumnFloat16VectorArray 实例表示一个 ArrayOfVector float16 向量列，其各行包含具有共享维度的 float16 向量值。在 v3.0.0 中强制执行可空语义：可空性标志和有效值记录是实际的操作，而非占位实现。 | Go | v2"
type: docx
token: Ip2HdObkAodufpxSIoTcJ6rbnWf
sidebar_position: 3
keywords: 
  - 向量 Database 对比
  - Faiss
  - 视频搜索
  - AI 幻觉
  - Zilliz
  - Zilliz Cloud
  - 云
  - ColumnFloat16VectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnFloat16VectorArray

ColumnFloat16VectorArray 实例表示一个 ArrayOfVector float16 向量列，其各行包含具有共享维度的 float16 向量值。v3.0.0 中会强制执行可空语义：可空性标志和有效值记录是实际的操作，而非占位实现。

```go
type ColumnFloat16VectorArray struct {
}
```

**构建器方法：**

- `AppendValue(value any) error`

    该方法追加一行，该行以 []Entity.Float16Vector 或 [][]byte 的形式提供。

- `IsNull(idx int) (bool, error)`

    报告给定索引处的行是否为 null。

- `Nullable() bool`

    报告该列是否接受 null 值。

- `SetNullable(nullable bool)`

    设置该列是否接受 null 值。

- `ValidCount() int`

    返回非 null 行的数量。

- `ValidateNullable() error`

    验证内部的可空性记录，并在不匹配时返回错误。

**方法：**

- `Slice(start, end int) Column`

## 示例\{#example}

演示 ColumnFloat16VectorArray 的用法。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnFloat16VectorArray("embeddings", 4, [][][]byte{{{0, 1, 2, 3}}})
fmt.Println(values.Len())
```
