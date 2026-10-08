---
title: "getFieldSchemaList() | Java | v2"
slug: /java/java/v2-CollectionSchema-getFieldSchemaList
sidebar_label: "getFieldSchemaList()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation returns the list of all field schemas in the collection schema. | Java | v2"
type: docx
token: XssmdFjdZoXgyXxMDxWceywrnud
sidebar_position: 5
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - getFieldSchemaList()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getFieldSchemaList()

This operation returns the list of all field schemas in the collection schema.

```java
public List<CreateCollectionReq.FieldSchema> getFieldSchemaList()
```

**RETURN TYPE:**

*List&lt;CreateCollectionReq.FieldSchema&gt;*

**RETURNS:**

A list of **CreateCollectionReq.FieldSchema** objects. Each **CreateCollectionReq.FieldSchema** object contains the following fields:

**PARAMETERS:**

- **name** (*String*) -

    The name of the field.

- **description** (*String*) -

    The description of the field. Defaults to an empty string.

- **dataType** (*DataType*) -

    The data type of the field.

- **maxLength** (*Integer*) -

    The maximum number of characters a value can contain. Required if **dataType** of this field is set to **DataType.VarChar**. Default: `65535`.

- **dimension** (*Integer*) -

    The dimensionality of a vector field. The value should be greater than 1 and is usually determined by the embedding model in use.

- **isPrimaryKey** (*Boolean*) -

    Whether the current field is the primary field. Default: `false`.

- **isPartitionKey** (*Boolean*) -

    Whether the current field is the partition key field. Default: `false`.

- **isClusteringKey** (*Boolean*) -

    Whether the current field is the clustering key field. Default: `false`.

- **autoID** (*Boolean*) -

    Whether the primary field automatically increments. Default: `false`.

- **elementType** (*DataType*) -

    The data type of elements in array fields. Required if **dataType** of this field is set to **DataType.Array**.

- **maxCapacity** (*Integer*) -

    The maximum number of elements that an array field can contain. Required if **dataType** of this field is set to **DataType.Array**.

- **isNullable** (*Boolean*) -

    Whether the field can accept null values. Applies to scalar fields only. Default: `false`.

- **defaultValue** (*Object*) -

    The default value of the field, used when no value is explicitly provided during data insertion. Applies to scalar fields only.

- **enableAnalyzer** (*Boolean*) -

    Whether to enable text analysis for the `VARCHAR` field. When set to `true`, Milvus uses a text analyzer (BM25 tokenizer) on the field content.

- **analyzerParams** (*Map&lt;String, Object&gt;*) -

    Analyzer configuration (tokenizer and filter settings) for the `VARCHAR` field.

- **enableMatch** (*Boolean*) -

    Whether to enable keyword matching for the `VARCHAR` field (BM25 keyword search).

- **typeParams** (*Map&lt;String, String&gt;*) -

    The parameters specific to the data type of the field, e.g. `maxLength` for a `VarChar` field. Specified values override the corresponding `typeParams` keys.

- **multiAnalyzerParams** (*Map&lt;String, Object&gt;*) -

    A multi-language analyzer that allows you to configure multiple analyzers for a text field and store multilingual documents in this text field.

- **externalField** (*String*) -

    The name of an external field that this Milvus field maps to. Defaults to an empty string.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
List<CreateCollectionReq.FieldSchema> fields = schema.getFieldSchemaList();
```
