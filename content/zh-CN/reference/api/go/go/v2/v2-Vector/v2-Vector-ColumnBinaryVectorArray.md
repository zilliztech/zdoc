---
title: "ColumnBinaryVectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnBinaryVectorArray
sidebar_label: "ColumnBinaryVectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "表示一个 ArrayOfVector 列，其行包含具有相同维度的 Binary 值。 | Go | v2"
type: docx
token: VKeBdnkoXoI29txzTuncqsaDnte
sidebar_position: 3
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - ColumnBinaryVectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnBinaryVectorArray

表示一个 ArrayOfVector 列，其行包含具有相同维度的 Binary 值。

```go
type ColumnBinaryVectorArray struct {
}
```

## 请求语法\{#request-syntax}

从按行组织的向量数组数据创建一个 ColumnBinaryVectorArray。

```go
column.NewColumnBinaryVectorArray(fieldName string, dim int, data [][][]byte) *ColumnBinaryVectorArray
```

**方法：**

- `AppendValue(value any) error`

    追加一行数据，支持以 `[]entity.BinaryVector` 或 `[][]byte` 形式提供。

**返回类型：**

*ColumnBinaryVectorArray*

**返回：**

用于结构体数组字段中 ArrayOfVector 二进制向量数据的列类型。

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
