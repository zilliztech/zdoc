---
title: "FieldType | Go | v2"
slug: /go/go/v2-Collection-FieldType
sidebar_label: "FieldType"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "枚举受支持的 Milvus 字段数据类型，并提供用于识别向量类型的辅助方法。 | Go | v2"
type: docx
token: V6aWdRUh3o1alDxmCo5c29hRnic
sidebar_position: 16
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - FieldType
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# FieldType

枚举受支持的 Milvus 字段数据类型，并提供用于识别向量类型的辅助方法。

**返回类型：**

*FieldType*

**返回：**

枚举集合字段受支持的数据类型。

- **FieldTypeNone** (*int32*) -

    默认值：`0`

    零值占位符。

- **FieldTypeBool** (*int32*) -

    默认值：`1`

- **FieldTypeInt8** (*int32*) -

    默认值：`2`

- **FieldTypeInt16** (*int32*) -

    默认值：`3`

- **FieldTypeInt32** (*int32*) -

    默认值：`4`

- **FieldTypeInt64** (*int32*) -

    默认值：`5`

- **FieldTypeFloat** (*int32*) -

    默认值：`10`

- **FieldTypeDouble** (*int32*) -

    默认值：`11`

- **FieldTypeString** (*int32*) -

    默认值：`20`

- **FieldTypeVarChar** (*int32*) -

    默认值：`21`

    具有指定最大长度的可变长度字符串。

- **FieldTypeArray** (*int32*) -

    默认值：`22`

- **FieldTypeJSON** (*int32*) -

    默认值：`23`

- **FieldTypeGeometry** (*int32*) -

    默认值：`24`

- **FieldTypeTimestamptz** (*int32*) -

    默认值：`26`

- **FieldTypeBinaryVector** (*int32*) -

    默认值：`100`

- **FieldTypeFloatVector** (*int32*) -

    默认值：`101`

- **FieldTypeFloat16Vector** (*int32*) -

    默认值：`102`

- **FieldTypeBFloat16Vector** (*int32*) -

    默认值：`103`

- **FieldTypeSparseVector** (*int32*) -

    默认值：`104`

- **FieldTypeInt8Vector** (*int32*) -

    默认值：`105`

- **FieldTypeStruct** (*int32*) -

    默认值：`201`

## 示例\{#example}

演示 FieldType 的用法。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/entity"
)

fieldType := entity.FieldTypeFloatVector
fmt.Println(fieldType.Name())
fmt.Println(fieldType.IsVectorType())
```

## 注意事项\{#notes}

- 对于 binary、float、float16、bfloat16、sparse 和 int8 向量字段类型，`IsVectorType()` 返回 true。

