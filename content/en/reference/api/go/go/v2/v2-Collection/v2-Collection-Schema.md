---
title: "Schema | Go | v2"
slug: /go/go/v2-Collection-Schema
sidebar_label: "Schema"
beta: false
added_since: v2.6.x
last_modified: v3.0.0
deprecate_since: false
notebook: false
description: "Represents the schema of a collection, including field definitions, functions, and dynamic field settings. | Go | v2"
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

Represents the schema of a collection, including field definitions, functions, and dynamic field settings.

```go
type Schema struct {
    CollectionName string
    Description string
    AutoID bool
    Fields []*Field
    EnableDynamicField bool
    Functions []*Function
}
```

## Constructor\{#constructor}

```go
entity.NewSchema().
    WithName(name).
    WithDescription(desc).
    WithAutoID(autoID).
    WithDynamicFieldEnabled(dynamicEnabled).
    // ...
```

**BUILDER METHODS:**

- `WithName(name string)`

    This sets the name value of schema, returns schema itself.

- `WithExternalSource(externalSource string)`

    This sets the source data URI, which should be the name of an accessible external volume..

- `WithExternalSpec(externalSpec string)`

    The external source specifications, which are a set of secondary parameters:

    - **format** (*string*) - 

        The format of the target source data files.

        Possible values are `parquet`, `vortex`, `lance-table`, and `iceberg-table`.

- `WithDescription(desc string)`

    This sets the description value of schema, returns schema itself.

- `WithAutoID(autoID bool)`

    This enables or disables auto ID generation for the collection. This does not apply to external collections.

- `WithDynamicFieldEnabled(dynamicEnabled bool)`

    This enables or disables dynamic field support for flexible data insertion.

- `WithField(f *[Field](./v2-Collection-Field))`

    This adds a field into schema and returns schema itself.

- `WithFunction(f *[Function](./v2-Collection-Function))`

    This adds a function definition (e.g., BM25, text embedding) to the schema. This does not apply to external collections.

**METHODS:**

- `PKFieldName() string`

    PKFieldName returns pk field name for this schemapb.

- `PKField() *[Field`](./v2-Collection-Field)

    PKField returns PK Field schema for this schema.

## Example\{#example}

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
)

schema := entity.NewSchema().
    WithName("my_collection").
    WithField(entity.NewField().
        WithName("id").
        WithDataType(entity.FieldTypeInt64).
        WithIsPrimaryKey(true)).
    WithField(entity.NewField().
        WithName("embedding").
        WithDataType(entity.FieldTypeFloatVector).
        WithDim(768))
```
