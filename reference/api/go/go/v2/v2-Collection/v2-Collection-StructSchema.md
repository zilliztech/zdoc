---
title: "StructSchema | Go | v2"
slug: /go/go/v2-Collection-StructSchema
sidebar_label: "StructSchema"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Defines the sub-fields of a struct-array field and validates the rules applied to those sub-fields. | Go | v2"
type: docx
token: CB8KdOcuqopYf6x9PqYcJhXbntc
sidebar_position: 24
keywords: 
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - zilliz
  - zilliz cloud
  - cloud
  - StructSchema
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# StructSchema

Defines the sub-fields of a struct-array field and validates the rules applied to those sub-fields.

```go
type StructSchema struct {
    Fields []*Field
}
```

## Request Syntax\{#request-syntax}

Creates an empty struct schema.

```go
entity.NewStructSchema()
```

**METHODS:**

- `WithField(field *Field) *StructSchema`

    This appends a sub-field definition.

- `Validate(parentName string) error`

    This rejects empty, duplicate, nested, sparse-vector, nullable, key, auto-ID, dynamic, and default-valued sub-fields.

**RETURN TYPE:**

*StructSchema*

**RETURNS:**

Represents the schema of a struct field, including nested field definitions.

- **Fields** (*[]*Field*) -

    This contains the struct-array sub-field definitions.

## Example\{#example}

Demonstrates StructSchema usage.

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/entity"
)

structSchema := entity.NewStructSchema().
	WithField(entity.NewField().WithName("text").WithDataType(entity.FieldTypeVarChar).WithMaxLength(256)).
	WithField(entity.NewField().WithName("embedding").WithDataType(entity.FieldTypeFloatVector).WithDim(8))

err := structSchema.Validate("chunks")
fmt.Println(err)
```
