---
title: "ColumnFloat16VectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnFloat16VectorArray
sidebar_label: "ColumnFloat16VectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "表示一个 ArrayOfVector 列，其各行包含具有共享维度的 Float16 值。 | Go | v2"
type: docx
token: Ip2HdObkAodufpxSIoTcJ6rbnWf
sidebar_position: 4
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - ColumnFloat16VectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnFloat16VectorArray

表示一个 ArrayOfVector 列，其各行包含具有共享维度的 Float16 值。

```go
type ColumnFloat16VectorArray struct {
}
```

## 请求语法\{#request-syntax}

根据按行组织的向量数组数据创建一个 ColumnFloat16VectorArray。

```go
column.NewColumnFloat16VectorArray(fieldName string, dim int, data [][][]byte) *ColumnFloat16VectorArray
```

**方法：**

- `AppendValue(value any) error`

    追加一行数据，输入可以是 []entity.Float16Vector 或 [][]byte。

**返回类型：**

*ColumnFloat16VectorArray*

**返回值：**

结构体数组字段中用于 ArrayOfVector float16-vector 数据的列类型。

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
