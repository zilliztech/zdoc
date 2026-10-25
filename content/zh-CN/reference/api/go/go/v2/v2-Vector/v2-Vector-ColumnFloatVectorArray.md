---
title: "ColumnFloatVectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnFloatVectorArray
sidebar_label: "ColumnFloatVectorArray"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ColumnFloatVectorArray 实例表示一个 ArrayOfVector 浮点向量列，其各行包含维度相同的浮点向量值。可空语义在 v3.0.0 中强制执行；可空性标志和有效值记录都是实际的操作，而不是桩。 | Go | v2"
type: docx
token: FEsedrkZpoiR3YxNgL4csDP4nEe
sidebar_position: 5
keywords: 
  - 混合搜索
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - Zilliz
  - Zilliz Cloud
  - 云
  - ColumnFloatVectorArray
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ColumnFloatVectorArray

ColumnFloatVectorArray 实例表示一个 ArrayOfVector 浮点向量列，其各行包含维度相同的浮点向量值。可空语义在 v3.0.0 中强制执行：可空性标志和有效值记录都是实际的操作，而不是桩。

```go
type ColumnFloatVectorArray struct {
}
```

**构建器方法：**

- `AppendValue(value any) error`

    此方法追加一行，该行以 []Entity.FloatVector 或 [][]float32 提供。

- `IsNull(idx int) (bool, error)`

    此方法报告指定索引处的行是否为空。

- `Nullable() bool`

    此方法报告该列是否接受空值。

- `SetNullable(nullable bool)`

    此方法设置该列是否接受空值。

- `ValidCount() int`

    此方法返回非空行的数量。

- `ValidateNullable() error`

    此方法验证内部的可空性记录，并在不一致时返回错误。

**方法：**

- `Slice(start, end int) Column`

## 示例\{#example}

演示 ColumnFloatVectorArray 的用法。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnFloatVectorArray("embeddings", 4, [][][]float32{{{0.1, 0.2, 0.3, 0.4}}})
fmt.Println(values.Len())
```
