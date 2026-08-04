---
title: "ColumnBFloat16VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnBFloat16VectorArray
sidebar_label: "ColumnBFloat16VectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "表示一个 ArrayOfVector 列，其中各行包含共享维度的 BFloat16 值。| Go | v2"
type: docx
token: OG2HdyPMzoO7y7xob6HcX1V0n7b
sidebar_position: 2
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - ColumnBFloat16VectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnBFloat16VectorArray

表示一个 ArrayOfVector 列，其中各行包含共享维度的 BFloat16 值。

```go
type ColumnBFloat16VectorArray struct {
}
```

## 请求语法\{#request-syntax}

根据面向行的向量数组数据创建一个 ColumnBFloat16VectorArray。

```go
column.NewColumnBFloat16VectorArray(fieldName string, dim int, data [][][]byte) *ColumnBFloat16VectorArray
```

**方法：**

- `AppendValue(value any) error`

    追加一行数据，输入可以是 []entity.BFloat16Vector 或 [][]byte。

**返回类型：**

*ColumnBFloat16VectorArray*

**返回值：**

用于结构体数组字段中 ArrayOfVector bfloat16 向量数据的列类型。

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
