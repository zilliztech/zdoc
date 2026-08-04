---
title: "ColumnInt8VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnInt8VectorArray
sidebar_label: "ColumnInt8VectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "表示一个 ArrayOfVector 列，其行包含具有共享维度的 Int8 值。 | Go | v2"
type: docx
token: Snk1duMEtoe1VexGeJYcXW7VnXe
sidebar_position: 6
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - ColumnInt8VectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnInt8VectorArray

表示一个 ArrayOfVector 列，其行包含具有共享维度的 Int8 值。

```go
type ColumnInt8VectorArray struct {
}
```

## 请求语法\{#request-syntax}

从按行组织的向量数组数据创建 ColumnInt8VectorArray。

```go
column.NewColumnInt8VectorArray(fieldName string, dim int, data [][][]int8) *ColumnInt8VectorArray
```

**方法：**

- `AppendValue(value any) error`

    追加一行数据，输入可以是 []entity.Int8Vector 或 [][]int8。

**返回类型：**

*ColumnInt8VectorArray*

**返回：**

用于结构数组字段中 ArrayOfVector int8-vector 数据的列类型。

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
