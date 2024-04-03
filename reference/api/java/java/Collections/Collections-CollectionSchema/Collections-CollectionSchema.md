---
displayed_sidbar: javaSidebar
slug: /java/Collections-CollectionSchema
beta: false
notebook: false
type: folder
token: EfYXfQjt7lz77odlUj7cjJZVnMh
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# CollectionSchema

A __CollectionSchema__ instance represents the schema of a collection. A schema sketches the structure of a collection.

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.CollectionSchema
```

## Constructor{#constructor}

Constructs the schema of a collection by defining fields, data types, and other parameters.

```java
CreateCollectionReq.CollectionSchema.builder()
    .fieldSchemaList(List<CreateCollectionReq.FieldSchema>)
    .build();
```

__BUILDER METHODS:__

- `fieldSchemaList(List<CreateCollectionReq.FieldSchema>)`

    A list of __FieldSchema__ objects that define the fields in the collection schema.

    <Admonition type="info" icon="📘" title="What is a field schema?">

    <p>A field schema represents and contains metadata for a single field, while <strong>CollectionSchema</strong> ties together a list of FieldSchema objects to define the full schema.</p>

    </Admonition>

__RETURN TYPE:__

_CollectionSchema_

__RETURNS:__

A __CollectionSchema__ object.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// define a Collection Schema
CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema();
// add two fileds, id and vector
collectionSchema.addField(AddFieldReq._builder_().fieldName("id").dataType(DataType._Int64_).isPrimaryKey(Boolean._TRUE_).autoID(Boolean._FALSE_).description("id").build());
collectionSchema.addField(AddFieldReq._builder_().fieldName("vector").dataType(DataType._FloatVector_).dimension(dim).build());
```

## Methods{#methods}

The following are the methods of the `CollectionSchema` class:



import DocCardList from '@theme/DocCardList';

<DocCardList />