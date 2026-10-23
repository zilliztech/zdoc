---
title: "ColumnInt8VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnInt8VectorArray
sidebar_label: "ColumnInt8VectorArray"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "ColumnInt8VectorArray 实例表示一个 ArrayOfVector int8 向量列，其各行包含具有共享维度的 int8 向量值。Nullable 语义在 v3.0.0 中强制执行：可空性标志和有效值记录是实际执行的操作，而不是桩实现。 | Go | v2"
type: docx
token: Snk1duMEtoe1VexGeJYcXW7VnXe
sidebar_position: 5
keywords: 
  - 大语言模型
  - 机器学习
  - 检索增强生成
  - 自然语言处理
  - zilliz
  - Zilliz Cloud
  - 云
  - ColumnInt8VectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnInt8VectorArray

ColumnInt8VectorArray 实例表示一个 ArrayOfVector int8 向量列，其各行包含具有共享维度的 int8 向量值。Nullable 语义在 v3.0.0 中强制执行：可空性标志和有效值记录是实际执行的操作，而不是桩实现。

```go
type ColumnInt8VectorArray struct {
}
```

**构建器方法：**

- `AppendValue(value any) error`

    此方法会追加一个 Entity 行，输入形式为 []entity.Int8Vector 或 [][]int8。

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

演示 ColumnInt8VectorArray 的用法。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/column"
)

values := column.NewColumnInt8VectorArray("embeddings", 4, [][][]int8{{{1, 2, 3, 4}}})
fmt.Println(values.Len())
```
