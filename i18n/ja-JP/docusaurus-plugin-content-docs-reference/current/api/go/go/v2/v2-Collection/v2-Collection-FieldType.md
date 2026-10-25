---
title: "FieldType | Go | v2"
slug: /go/go/v2-Collection-FieldType
sidebar_label: "FieldType"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "FieldType インスタンスは、サポートされている Milvus フィールドデータ型を列挙し、ベクトル型を識別するためのヘルパーを提供します。 | Go | v2"
type: docx
token: V6aWdRUh3o1alDxmCo5c29hRnic
sidebar_position: 16
keywords: 
  - IVF
  - knn
  - 画像検索
  - LLM
  - zilliz
  - zilliz cloud
  - cloud
  - FieldType
  - gov230
displayed_sidebar: goSidebar

---

import Admonition from '@theme/Admonition';


# FieldType

FieldType インスタンスは、サポートされている Milvus フィールドデータ型を列挙し、ベクトル型を識別するためのヘルパーを提供します。

<Admonition type="info" title="Notes">

`IsVectorType()` は、バイナリ、float、float16、bfloat16、sparse、および int8 のベクトルフィールド型に対して true を返します。

</Admonition>

<Admonition type="info" title="Notes">

`FieldTypeText` は、`max_length` を必要としない可変長文字列型です。

</Admonition>

```go
type FieldType int32
```

**値:**

- **FieldTypeNone** = `0`

    ゼロ値のプレースホルダーです。

- **FieldTypeBool** = `1`

- **FieldTypeInt8** = `2`

- **FieldTypeInt16** = `3`

- **FieldTypeInt32** = `4`

- **FieldTypeInt64** = `5`

- **FieldTypeFloat** = `10`

- **FieldTypeDouble** = `11`

- **FieldTypeString** = `20`

- **FieldTypeVarChar** = `21`

    最大長を指定した可変長文字列です。

- **FieldTypeArray** = `22`

- **FieldTypeJSON** = `23`

- **FieldTypeGeometry** = `24`

- **FieldTypeText** = `25`

    max_length を必須としない可変長文字列です。

- **FieldTypeTimestamptz** = `26`

- **FieldTypeBinaryVector** = `100`

- **FieldTypeFloatVector** = `101`

- **FieldTypeFloat16Vector** = `102`

- **FieldTypeBFloat16Vector** = `103`

- **FieldTypeSparseVector** = `104`

- **FieldTypeInt8Vector** = `105`

- **FieldTypeStruct** = `201`

## 例\{#example}

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
