---
title: "addCollectionStructField() | Java | v2"
slug: /java/java/v2-Collections-addCollectionStructField
sidebar_label: "addCollectionStructField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation adds a struct field to an existing collection. Use it to extend a collection schema with a structured array field after the collection has already been created. | Java | v2"
type: docx
token: RQT1dGVPloPOLAx8G2mcifFEnCc
sidebar_position: 37
keywords: 
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - zilliz
  - zilliz cloud
  - cloud
  - addCollectionStructField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionStructField()

This operation adds a struct field to an existing collection. Use it to extend a collection schema with a structured array field after the collection has already been created.

```java
public void addCollectionStructField(AddCollectionStructFieldReq request)
```

## Request Syntax\{#request-syntax}

```java
addCollectionStructField(AddCollectionStructFieldReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .fieldName(String fieldName)
    .description(String description)
    .maxCapacity(Integer maxCapacity)
    .nullable(Boolean nullable)
    .structFields(List<CreateCollectionReq.FieldSchema> structFields)
    .typeParams(Map<String, String> typeParams)
    .build());
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The target collection name.

- `databaseName(String databaseName)`

    The database that contains the collection. Omit this field to use the current database.

- `fieldName(String fieldName)`

    The name of the struct array field to add.

- `description(String description)`

    A human-readable description for the new field.

- `maxCapacity(Integer maxCapacity)`

    The maximum number of struct elements allowed in each row.

- `nullable(Boolean nullable)`

    Whether the struct field can be null.

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)`

    The scalar or vector fields contained in each struct element.

- `typeParams(Map<String, String> typeParams)`

    Additional type parameters passed to the server for the struct field.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when validation fails or the server returns an error for this operation.

## Example\{#example}

```java
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN")
    .build());

client.addCollectionStructField(AddCollectionStructFieldReq.builder()
    .collectionName("book")
    .fieldName("metadata")
    .maxCapacity(8)
    .nullable(true)
    .structFields(Arrays.asList(
        CreateCollectionReq.FieldSchema.builder()
            .name("author")
            .dataType(DataType.VarChar)
            .maxLength(256)
            .build()))
    .build());
```

{/* category: Collections; action: CREATE; addedSince: v3.0.x */}
