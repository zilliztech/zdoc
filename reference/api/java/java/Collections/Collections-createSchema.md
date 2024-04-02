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
public CreateCollectionReq.CollectionSchema createSchema()
```

## Request Syntax{#request-syntax}

```java
MilvusClientV2.createSchema()
```

__PARAMETERS:__

None

__RETURN TYPE:__

_CreateCollectionReq.CollectionSchema_

__RETURNS:__

A __CreateCollectionReq.CollectionSchema__ object.

## Example{#example}

```java
// quickly create a collectionSchema
CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema();
collectionSchema.addField(AddFieldReq._builder_().fieldName("id").dataType(DataType._Int64_).isPrimaryKey(Boolean._TRUE_).autoID(Boolean._FALSE_).description("id").build());
collectionSchema.addField(AddFieldReq._builder_().fieldName("vector").dataType(DataType._FloatVector_).dimension(dim).build());
```
