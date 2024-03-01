---
displayed_sidbar: javaSidebar
slug: /java/CollectionSchema-CollectionSchema
beta: false
notebook: false
type: docx
token: QLCqdU36nolXYTxdJyqcW11qntc
sidebar_position: 4
---

# CollectionSchema

A __CollectionSchema__ instance represents the schema of a collection. A schema sketches the structure of a collection.

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.CollectionSchema
```

## Constructor{#constructor}

Constructs the schema of a collection by defining fields, data types, and other parameters.

```java
CreateCollectionReq.CollectionSchema.builder()
    .description(String description)
    .enableDynamicField(boolean enableDynamicField)
    .fieldSchemaList(List<CreateCollectionReq.FieldSchema>)
    .build();
```

__BUILDER METHODS:__

- `description(String description)`

    The description of the schema.

    If a description is not provided, it will be set to an empty string.

- `enableDynamicField(boolean enableDynamicField)`

    Whether allows Milvus saves the values of undefined fields in a dynamic field if the data being inserted into the target collection includes fields that are not defined in the collection's schema.

    When you set this to __True__, Milvus and  will create a field called __$meta__ to store any undefined fields and their values from the data that is inserted.

    <div class="admonition note">

    <p><b>what is a dynamic field?</b></p>

    <p>If the data being inserted into the target collection includes fields that are not defined in the collection's schema, those fields will be saved in a dynamic field as key-value pairs.</p>

    </div>

- `fieldSchemaList(List<CreateCollectionReq.FieldSchema>)`

    A list of __FieldSchema__ objects that define the fields in the collection schema.

    <div class="admonition note">

    <p><b>what is a field schema?</b></p>

    <p>A field schema represents and contains metadata for a single field, while <strong>CollectionSchema</strong> ties together a list of FieldSchema objects to define the full schema.</p>

    </div>

__RETURN TYPE:__

_CollectionSchema_

__RETURNS:__

A __CollectionSchema__ object.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema(Boolean._TRUE_, "");
collectionSchema.addPrimaryField("id", DataType._Int64_, Boolean._TRUE_, Boolean._FALSE_);
collectionSchema.addVectorField("vector", DataType._FloatVector_, dim);
collectionSchema.addScalarField("int32", DataType._Int32_);
```

## Methods{#methods}

The following are the methods of the `CollectionSchema` class:

- [addPrimaryField()](./CollectionSchema-addPrimaryField)

- [ addScalarField()](./CollectionSchema-addScalarField)

- [ addVectorField()](./CollectionSchema-addVectorField)

