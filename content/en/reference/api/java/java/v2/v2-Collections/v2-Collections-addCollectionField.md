---
title: "addCollectionField() | Java | v2"
slug: /java/java/v2-Collections/v2-Collections-addCollectionField
sidebar_label: "addCollectionField()"
beta: false
added_since: v2.6.x
last_modified: v3.0.1
deprecate_since: false
notebook: false
description: "This operation adds a new scalar or vector field to an existing collection without recreating the collection. Existing rows do not have values for the new field, so added vector fields must be nullable. | Java | v2"
type: docx
token: LaHmdGNGZog0JbxA8amcblpsnDR
sidebar_position: 23
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - addCollectionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionField()

This operation adds a new scalar or vector field to an existing collection without recreating the collection. Existing rows do not have values for the new field, so added vector fields must be nullable.

```java
public void addCollectionField(AddCollectionFieldReq request)
```

## Request Syntax\{#request-syntax}

```java
client.addCollectionField(AddCollectionFieldReq.builder()
    .collectionName(String collectionName)
    .databaseName(String databaseName)
    .fieldName(String fieldName)
    .description(String description)
    .dataType(DataType dataType)
    .maxLength(Integer maxLength)
    .dimension(Integer dimension)
    .elementType(DataType elementType)
    .maxCapacity(Integer maxCapacity)
    .isNullable(Boolean isNullable)
    .defaultValue(Object defaultValue)
    .enableAnalyzer(Boolean enableAnalyzer)
    .analyzerParams(Map<String, Object> analyzerParams)
    .enableMatch(Boolean enableMatch)
    .typeParams(Map<String, String> typeParams)
    .multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)
    .structFields(List<CreateCollectionReq.FieldSchema> structFields)
    .externalField(String externalField)
    .build()
);
```

**BUILDER METHODS:**

- `collectionName(String collectionName)` -

    The name of the target collection.

- `databaseName(String databaseName)` -

    The name of the database. Defaults to the current database if not specified.

- `fieldName(String fieldName)` -

    The name of the field to add.

- `description(String description)` -

    A human-readable description for the field.

- `dataType(DataType dataType)` -

    The data type of the field. Scalar, vector, array, JSON, and struct-related field types follow the same `DataType` values used when creating a collection.

- `maxLength(Integer maxLength)` -

    The maximum number of characters for a `DataType.VarChar` field. This is required for VarChar fields unless the value is supplied through `typeParams`.

- `dimension(Integer dimension)` -

    The vector dimension. This is required for fixed-dimension vector fields such as `DataType.FloatVector`.

- `elementType(DataType elementType)` -

    The element type for an array field.

- `maxCapacity(Integer maxCapacity)` -

    The maximum number of elements allowed in an array field.

- `isNullable(Boolean isNullable)` -

    Whether the added field accepts `null` values. For v3.0.1 and later, vector fields added to an existing collection must set this to `true`; otherwise the SDK raises `MilvusClientException`.

- `defaultValue(Object defaultValue)` -

    The default value for the added field. The runtime type must match `dataType`.

- `enableAnalyzer(Boolean enableAnalyzer)` -

    Whether to enable text analysis for a `DataType.VarChar` field.

- `analyzerParams(Map<String, Object> analyzerParams)` -

    Analyzer configuration for a VarChar field, such as tokenizer and filter settings.

- `enableMatch(Boolean enableMatch)` -

    Whether to enable keyword matching for a VarChar field.

- `typeParams(Map<String, String> typeParams)` -

    Additional field type parameters. Dedicated builder methods such as `dimension` or `maxLength` override corresponding entries in this map.

- `multiAnalyzerParams(Map<String, Object> multiAnalyzerParams)` -

    Multi-language analyzer configuration for a text field.

- `structFields(List<CreateCollectionReq.FieldSchema> structFields)` -

    Nested field schemas for a struct field.

- `externalField(String externalField)` -

    The external source field that maps to this Milvus field when the collection is backed by an external source.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation, including when a vector field is added with `isNullable(false)` or without setting `isNullable(true)`.

## Example\{#example}

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddCollectionFieldReq;

// Add a nullable scalar field to an existing collection.
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(100)
        .isNullable(true)
        .build());

// Add a nullable vector field to an existing collection.
client.addCollectionField(AddCollectionFieldReq.builder()
        .collectionName("my_collection")
        .fieldName("embedding_v2")
        .dataType(DataType.FloatVector)
        .dimension(128)
        .isNullable(true)
        .build());
```
