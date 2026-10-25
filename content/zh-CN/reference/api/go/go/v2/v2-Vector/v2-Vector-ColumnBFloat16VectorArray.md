---
title: "ColumnBFloat16VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnBFloat16VectorArray
sidebar_label: "ColumnBFloat16VectorArray"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ColumnBFloat16VectorArray 实例表示一个 ArrayOfVector bfloat16 向量列，其各行包含具有相同维度的 bfloat16 向量值。Nullable 语义在 v3.0.0 中生效：可空性标志和有效值记录是实际实现的操作，而非桩实现。 | Go | v2"
type: docx
token: OG2HdyPMzoO7y7xob6HcX1V0n7b
sidebar_position: 2
keywords: 
  - 大语言模型
  - 机器学习
  - 检索增强生成
  - 自然语言处理
  - zilliz
  - Zilliz Cloud
  - 云
  - ColumnBFloat16VectorArray
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# ColumnBFloat16VectorArray

ColumnBFloat16VectorArray 实例表示一个 ArrayOfVector bfloat16 向量列，其各行包含具有相同维度的 bfloat16 向量值。Nullable 语义在 v3.0.0 中生效：可空性标志和有效值记录是实际实现的操作，而非桩实现。

```go
type ColumnBFloat16VectorArray struct {
}
```

**构建器方法：**

- `AppendValue(value any) error`

    此方法追加一个 Entity 行，该行以 []entity.BFloat16Vector 或 [][]byte 形式提供。

- `IsNull(idx int) (bool, error)`

    此方法报告给定索引处的行是否为 null。

- `Nullable() bool`

    此方法报告该列是否接受 null 值。

- `SetNullable(nullable bool)`

    此方法设置该列是否接受 null 值。

- `ValidCount() int`

    此方法返回非 null 行的数量。

- `ValidateNullable() error`

    此方法验证内部可空性记录，并在不匹配时返回错误。

**方法：**

- `Slice(start, end int) Column`

## 示例\{#example}

演示 ColumnBFloat16VectorArray 的用法。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnBFloat16VectorArray("embeddings", 4, [][][]byte{{{0, 1, 2, 3}}})
fmt.Println(values.Len())
```
