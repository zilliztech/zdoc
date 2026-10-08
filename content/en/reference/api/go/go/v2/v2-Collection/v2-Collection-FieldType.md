---
title: "FieldType | Go | v2"
slug: /go/go/v2-Collection-FieldType
sidebar_label: "FieldType"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A FieldType instance enumerates supported Milvus field data types and provides helpers for identifying vector types. | Go | v2"
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

A FieldType instance enumerates supported Milvus field data types and provides helpers for identifying vector types.

<Admonition type="info" title="Notes">

`IsVectorType()` returns true for binary, float, float16, bfloat16, sparse, and int8 vector field types.

</Admonition>

<Admonition type="info" title="Notes">

`FieldTypeText` is a variable-length string type that does not require a `max_length`.

</Admonition>

```go
type FieldType int32
```

**VALUES:**

- **FieldTypeNone** = `0`

    zero value place holder.

- **FieldTypeBool** = `1`

- **FieldTypeInt8** = `2`

- **FieldTypeInt16** = `3`

- **FieldTypeInt32** = `4`

- **FieldTypeInt64** = `5`

- **FieldTypeFloat** = `10`

- **FieldTypeDouble** = `11`

- **FieldTypeString** = `20`

- **FieldTypeVarChar** = `21`

    variable-length strings with a specified maximum length.

- **FieldTypeArray** = `22`

- **FieldTypeJSON** = `23`

- **FieldTypeGeometry** = `24`

- **FieldTypeText** = `25`

    variable-length strings without a required max_length.

- **FieldTypeTimestamptz** = `26`

- **FieldTypeBinaryVector** = `100`

- **FieldTypeFloatVector** = `101`

- **FieldTypeFloat16Vector** = `102`

- **FieldTypeBFloat16Vector** = `103`

- **FieldTypeSparseVector** = `104`

- **FieldTypeInt8Vector** = `105`

- **FieldTypeStruct** = `201`

## Example\{#example}

Demonstrates FieldType usage.

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/entity"
)

fieldType := entity.FieldTypeFloatVector
fmt.Println(fieldType.Name())
fmt.Println(fieldType.IsVectorType())
```
