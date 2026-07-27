---
title: "FieldType | Go | v2"
slug: /go/go/v2-Collection-FieldType
sidebar_label: "FieldType"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "サポートされている Milvus フィールドデータ型を列挙し、vector 型を識別するためのヘルパーを提供します。 | Go | v2"
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

サポートされている Milvus フィールドデータ型を列挙し、vector 型を識別するためのヘルパーを提供します。

**RETURN TYPE:**

*FieldType*

**RETURNS:**

collection フィールドでサポートされているデータ型を列挙します。

- **FieldTypeNone** (*int32*) -

    Default: `0`

    ゼロ値のプレースホルダー。

- **FieldTypeBool** (*int32*) -

    Default: `1`

- **FieldTypeInt8** (*int32*) -

    Default: `2`

- **FieldTypeInt16** (*int32*) -

    Default: `3`

- **FieldTypeInt32** (*int32*) -

    Default: `4`

- **FieldTypeInt64** (*int32*) -

    Default: `5`

- **FieldTypeFloat** (*int32*) -

    Default: `10`

- **FieldTypeDouble** (*int32*) -

    Default: `11`

- **FieldTypeString** (*int32*) -

    Default: `20`

- **FieldTypeVarChar** (*int32*) -

    Default: `21`

    指定された最大長を持つ可変長文字列。

- **FieldTypeArray** (*int32*) -

    Default: `22`

- **FieldTypeJSON** (*int32*) -

    Default: `23`

- **FieldTypeGeometry** (*int32*) -

    Default: `24`

- **FieldTypeTimestamptz** (*int32*) -

    Default: `26`

- **FieldTypeBinaryVector** (*int32*) -

    Default: `100`

- **FieldTypeFloatVector** (*int32*) -

    Default: `101`

- **FieldTypeFloat16Vector** (*int32*) -

    Default: `102`

- **FieldTypeBFloat16Vector** (*int32*) -

    Default: `103`

- **FieldTypeSparseVector** (*int32*) -

    Default: `104`

- **FieldTypeInt8Vector** (*int32*) -

    Default: `105`

- **FieldTypeStruct** (*int32*) -

    Default: `201`

## Example\{#example}

FieldType の使用方法を示します。

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/entity"
)

fieldType := entity.FieldTypeFloatVector
fmt.Println(fieldType.Name())
fmt.Println(fieldType.IsVectorType())
```

## Notes\{#notes}

- `IsVectorType()` は、binary、float、float16、bfloat16、sparse、および int8 の vector フィールド型に対して true を返します。

