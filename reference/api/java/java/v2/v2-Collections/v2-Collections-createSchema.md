---
displayed_sidbar: this.displayedSidebar
slug: /java/java/v2-Collections-createSchema
beta: FALSE
notebook: FALSE
type: docx
token: RdfxdvgRfonSK8xlEgjc5PpVnDg
sidebar_position: 6
displayed_sidebar: javaSidebar

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

**PARAMETERS:**

None

**RETURN TYPE:**

*CreateCollectionReq.CollectionSchema*

**RETURNS:**

A **CreateCollectionReq.CollectionSchema** object.

## Example{#example}

```java
// quickly create a collectionSchema
CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema();
collectionSchema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(Boolean.TRUE).autoID(Boolean.FALSE).description("id").build());
collectionSchema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector).dimension(dim).build());
```
