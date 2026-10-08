---
title: "Field | Go | v2"
slug: /go/go/v2-Collection-Field
sidebar_label: "Field"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A Field instance defines a field in a collection schema, including its data type, constraints, and indexing properties. | Go | v2"
type: docx
token: DPcJdZceFoes0sxeRVKcKhaunq9
sidebar_position: 15
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - Field
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Field

A Field instance defines a field in a collection schema, including its data type, constraints, and indexing properties.

```go
type Field struct {
    ID int64
    Name string
    PrimaryKey bool
    AutoID bool
    Description string
    DataType FieldType
    TypeParams map[string]string
    IndexParams map[string]string
    IsDynamic bool
    IsPartitionKey bool
    IsClusteringKey bool
    ElementType FieldType
    DefaultValue *schemapb.ValueField
    Nullable bool
    StructSchema *StructSchema
    ExternalField string
}
```

**FIELDS:**

- **ID** (*int64*) -

    The field ID, generated when the collection is created; the input value is ignored.

- **Name** (*string*) -

    The name of the field.

- **PrimaryKey** (*bool*) -

    Whether the field is the primary key.

- **AutoID** (*bool*) -

    Whether the ID is auto-generated.

- **Description** (*string*) -

    The human-readable description of the field.

- **DataType** ([FieldType](./v2-Collection-FieldType)) -

    The data type of the field.

- **TypeParams** (*map[string]string*) -

    The type parameters of the field, such as dim or max_length.

- **IndexParams** (*map[string]string*) -

    The index parameters of the field.

- **IsDynamic** (*bool*) -

    Whether the field is a dynamic field.

- **IsPartitionKey** (*bool*) -

    Whether the field is the partition key.

- **IsClusteringKey** (*bool*) -

    Whether the field is the clustering key.

- **ElementType** ([FieldType](./v2-Collection-FieldType)) -

    The element type of an array field.

- **DefaultValue** (&ast;*schemapb.ValueField*) -

    The default value of the field.

- **Nullable** (*bool*) -

    Whether the field accepts null values.

- **StructSchema** (&ast;*StructSchema*) -

    The struct schema of a struct-type field.

- **ExternalField** (*string*) -

    The name of a field in the external data files that the current field maps to.

**BUILDER METHODS:**

- `WithName(name string)`

    Sets the name of the field.

- `WithDescription(desc string)`

    Sets the description of the field.

- `WithDataType(dataType [FieldType](FieldType.md))`

    Sets the data type of the field (e.g., Int64, VarChar, FloatVector).

- `WithIsPrimaryKey(isPrimaryKey bool)`

    Sets whether this field is the primary key.

- `WithIsAutoID(isAutoID bool)`

    Enables auto ID generation for this field.

- `WithIsDynamic(isDynamic bool)`

    Marks this as a dynamic field.

- `WithIsPartitionKey(isPartitionKey bool)`

    Sets this field as a partition key for data routing.

- `WithIsClusteringKey(isClusteringKey bool)`

    Sets this field as a clustering key for data organization.

- `WithNullable(nullable bool)`

    Sets whether this field allows null values.

- `WithDefaultValueBool(defaultValue bool)`

    Sets the default value for the field.

- `WithDefaultValueInt(defaultValue int32)`

    Sets the default value for the field.

- `WithDefaultValueLong(defaultValue int64)`

    Sets the default value for the field.

- `WithDefaultValueFloat(defaultValue float32)`

    Sets the default value for the field.

- `WithDefaultValueDouble(defaultValue float64)`

    Sets the default value for the field.

- `WithDefaultValueTimestamptz(defaultValue int64)`

    Sets the default value for the field.

- `WithDefaultValueString(defaultValue string)`

    Sets the default value for the field.

- `WithTypeParams(key string, value string)`

    Sets a type parameter key-value pair for the field.

- `WithDim(dim int64)`

    Sets the vector dimension for this field.

- `WithMaxLength(maxLen int64)`

    Sets the maximum character length for varchar fields.

- `WithElementType(eleType [FieldType](FieldType.md))`

    Sets the element type for array fields.

- `WithMaxCapacity(maxCap int64)`

    Sets the maximum capacity for array fields.

- `WithEnableAnalyzer(enable bool)`

    Enables the text analyzer for full-text search on this field.

- `WithAnalyzerParams(params map[string]any)`

    Sets the analyzer parameters for text processing.

- `WithMultiAnalyzerParams(params map[string]any)`

    Sets multiple analyzer configurations for the field.

- `WithEnableMatch(enable bool)`

    Enables text matching for this field.

- `WithStructSchema(schema *StructSchema)`

    Sets the struct schema for struct-type fields.

- `WithExternalField(externalField string)`

    Sets the name of a field in the external data files that the current field maps to.

**METHODS:**

- `GetDim() (int64, error)`

    Returns the dimension of the field.

## Example\{#example}

Demonstrates Field usage.

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"
)

// Primary key field
pkField := entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true)

// Vector field
vectorField := entity.NewField().
    WithName("embedding").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(768)

// Scalar field with max length
varcharField := entity.NewField().
    WithName("category").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(256)
```
