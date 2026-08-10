---
title: "ColumnBinaryVectorArray | Go | v2"
slug: /go/go/v2-Vector-ColumnBinaryVectorArray
sidebar_label: "ColumnBinaryVectorArray"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "表示一种 ArrayOfVector 列，其中各行包含具有共享维度的 Binary 值。 | Go | v2"
type: docx
token: VKeBdnkoXoI29txzTuncqsaDnte
sidebar_position: 3
keywords: 
  - 向量搜索
  - knn 算法
  - HNSW
  - 什么是非结构化数据
  - zilliz
  - zilliz cloud
  - 云
  - ColumnBinaryVectorArray
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# ColumnBinaryVectorArray

表示一种 ArrayOfVector 列，其中各行包含具有共享维度的 Binary 值。

```go
type ColumnBinaryVectorArray struct {
}
```

## 请求语法\{#request-syntax}

根据面向行的向量数组数据创建 ColumnBinaryVectorArray。

```go
column.NewColumnBinaryVectorArray(fieldName string, dim int, data [][][]byte) *ColumnBinaryVectorArray
```

**方法：**

- `AppendValue(value any) error`

    用于追加一行，该行可表示为 []entity.BinaryVector 或 [][]byte。

**返回类型：**

*ColumnBinaryVectorArray*

**返回值：**

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
