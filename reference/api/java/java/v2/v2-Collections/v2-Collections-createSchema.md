---
displayed_sidbar: javaSidebar
title: "createSchema() | Java | v2"
slug: /java/java/v2-Collections-createSchema
sidebar_label: "createSchema()"
beta: false
notebook: false
description: "This operation creates a collection schema. | Java | v2"
type: docx
token: V5KXdwdO0oqkhnxsKb9c3xaKn4c
sidebar_position: 9
keywords: 
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - createSchema()
  - javaV225
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
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
