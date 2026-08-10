---
title: "ColumnFloatVectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnFloatVectorArray
sidebar_label: "ColumnFloatVectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "表示一个 ArrayOfVector 列，其各行包含具有相同维度的 Float 值。 | Go | v2"
type: docx
token: FEsedrkZpoiR3YxNgL4csDP4nEe
sidebar_position: 5
keywords: 
  - 混合搜索
  - 词法搜索
  - 最近邻搜索
  - Agentic RAG
  - zilliz
  - zilliz cloud
  - 云
  - ColumnFloatVectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnFloatVectorArray

表示一个 ArrayOfVector 列，其各行包含具有相同维度的 Float 值。

```go
type ColumnFloatVectorArray struct {
}
```

## 请求语法\{#request-syntax}

根据面向行的向量数组数据创建 ColumnFloatVectorArray。

```go
column.NewColumnFloatVectorArray(fieldName string, dim int, data [][][]float32) *ColumnFloatVectorArray
```

**方法：**

- `AppendValue(value any) error`

    此方法追加一行，输入可以是 []entity.FloatVector 或 [][]float32。

**返回类型：**

*ColumnFloatVectorArray*

**返回值：**

结构体数组字段中 ArrayOfVector 浮点向量数据的列类型。

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
