---
title: "Schema | Go | v2"
slug: /go/go/v2-Collection-Schema
sidebar_label: "Schema"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Defines a Milvus v3 collection schema, validates struct-array fields, and supports external collection source configuration. | Go | v2"
type: docx
token: Du2ZdjCWIorDg4xdwercNnYgnJb
sidebar_position: 23
keywords: 
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - zilliz
  - zilliz cloud
  - cloud
  - Schema
  - gov230
displayed_sidebar: goSidebar

displayed_sidbar: goSidebar
---

import Admonition from '@theme/Admonition';


# Schema

Defines a Milvus v3 collection schema, validates struct-array fields, and supports external collection source configuration.

```go
type Schema struct {
    CollectionName string
    Description string
    AutoID bool
    Fields []*Field
    EnableDynamicField bool
    Functions []*Function
    ExternalSource string
    ExternalSpec string
}
```

## Request Syntax\{#request-syntax}

Creates an empty collection schema.

```go
entity.NewSchema()
```

**METHODS:**

- `WithName(name string) *Schema`

    This sets the collection name.

- `WithDescription(desc string) *Schema`

    This sets the collection description.

- `WithAutoID(autoID bool) *Schema`

    This sets whether Milvus automatically generates primary keys.

- `WithDynamicFieldEnabled(dynamicEnabled bool) *Schema`

    This enables or disables the dynamic field.

- `WithExternalSource(externalSource string) *Schema`

    This sets the external data source URI.

- `WithExternalSpec(externalSpec string) *Schema`

    This sets the external source configuration as JSON.

- `WithField(field *Field) *Schema`

    This appends a field definition to the schema.

- `WithFunction(function *Function) *Schema`

    This appends a built-in function definition to the schema.

- `Validate() error`

    This validates struct-array sub-fields and returns an error for unsupported nesting or top-level-only flags.

- `PKFieldName() string`

    This returns the primary-key field name.

- `PKField() *Field`

    This returns the primary-key field definition.

- `WithExternalSource(externalSource string)`

    This sets the source data URI, which should be the name of an accessible external volume..

- `WithExternalSpec(externalSpec string)`

    The external source specifications, which are a set of secondary parameters:

    - **format** (*string*) - 

        The format of the target source data files.

        Possible values are `parquet`, `vortex`, `lance-table`, and `iceberg-table`.

**RETURN TYPE:**

*Schema*

**RETURNS:**

Represents the schema of a collection, including field definitions, functions, and dynamic field settings.

- **CollectionName** (*string*) -

    This stores the collection name.

- **Description** (*string*) -

    This stores the collection description.

- **AutoID** (*bool*) -

    This indicates whether Milvus automatically generates primary keys.

- **Fields** (*[]*Field*) -

    This contains the collection field definitions.

- **EnableDynamicField** (*bool*) -

    This indicates whether the dynamic field is enabled.

- **Functions** (*[]*Function*) -

    This contains the built-in function definitions.

- **ExternalSource** (*string*) -

    External data source (e.g., "s3://bucket/path").

- **ExternalSpec** (*string*) -

    External source config (JSON).

## Example\{#example}

Demonstrates Schema usage.

```go
import (
	"fmt"

	"github.com/milvus-io/milvus/client/v3/entity"
)

structSchema := entity.NewStructSchema().
	WithField(entity.NewField().WithName("embedding").WithDataType(entity.FieldTypeFloatVector).WithDim(8))

schema := entity.NewSchema().
	WithField(entity.NewField().WithName("chunks").WithDataType(entity.FieldTypeArray).WithElementType(entity.FieldTypeStruct).WithStructSchema(structSchema))

err := schema.Validate()
fmt.Println(err)
```

## Notes\{#notes}

- Struct-array decoding preserves nullable state and restores `max_capacity` from sub-fields when the parent does not carry it.

- `ExternalSource` and `ExternalSpec` describe external collection storage and configuration.

