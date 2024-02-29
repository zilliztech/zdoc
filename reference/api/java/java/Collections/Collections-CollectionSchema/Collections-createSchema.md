---
displayed_sidbar: javaSidebar
slug: /java/Collections-createSchema
beta: false
notebook: false
type: docx
token: RdfxdvgRfonSK8xlEgjc5PpVnDg
sidebar_position: 6
---

import Admonition from '@theme/Admonition';


# createSchema()

This operation creates a collection schema.

```java
public CreateCollectionReq.CollectionSchema createSchema(boolean enableDynamicField,
 String description)
```

## Request Syntax{#request-syntax}

```java
MilvusClientV2.createSchema(
    boolean enableDynamicField,
    String description
)
```

__PARAMETERS:__

- `enableDynamicField`

    Whether allows Zilliz Cloud saves the values of undefined fields in a dynamic field if the data being inserted into the target collection includes fields that are not defined in the collection's schema.

    When you set this to __True__,  and Zilliz Cloud will create a field called __$meta__ to store any undefined fields and their values from the data that is inserted.

    <Admonition type="info" icon="📘" title="What is a dynamic field?">

    <p>If the data being inserted into the target collection includes fields that are not defined in the collection's schema, those fields will be saved in a reserved dynamic field named <strong>$meta</strong> as key-value pairs.</p>

    </Admonition>

- `description`

    The description of the schema.

__RETURN TYPE:__

_CreateCollectionReq.CollectionSchema_

__RETURNS:__

A __CreateCollectionReq.CollectionSchema__ object.

## Example{#example}

```java
CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema(Boolean._TRUE_, "");
collectionSchema.addPrimaryField("id", DataType._Int64_, Boolean._TRUE_, Boolean._FALSE_);
collectionSchema.addVectorField("vector", DataType._FloatVector_, 8);
collectionSchema.addScalarField("num", DataType._Int32_);
```
