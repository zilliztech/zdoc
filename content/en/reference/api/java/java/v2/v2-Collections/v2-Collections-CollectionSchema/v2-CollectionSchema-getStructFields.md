---
title: "getStructFields() | Java | v2"
slug: /java/java/v2-CollectionSchema-getStructFields
sidebar_label: "getStructFields()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation returns all struct field schemas in the collection schema. | Java | v2"
type: docx
token: S0Iudxn6NoqusZx4xjRcLWLpnGc
sidebar_position: 8
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - getStructFields()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getStructFields()

This operation returns all struct field schemas in the collection schema.

```java
public List<CreateCollectionReq.StructFieldSchema> getStructFields()
```

**RETURN TYPE:**

*List&lt;CreateCollectionReq.StructFieldSchema&gt;*

**RETURNS:**

A list of **CreateCollectionReq.StructFieldSchema** objects. Each **CreateCollectionReq.StructFieldSchema** object contains the following fields:

**PARAMETERS:**

- **name** (*String*) -

    The name of the struct field.

- **description** (*String*) -

    The description of the struct field. Defaults to an empty string.

- **fields** (*List&lt;CreateCollectionReq.FieldSchema&gt;*) -

    The sub-fields of the struct field. Array, ArrayOfVector, and Struct element types are not supported in sub-fields.

- **maxCapacity** (*Integer*) -

    The maximum number of elements the struct field can hold.

- **nullable** (*Boolean*) -

    Whether the struct field is nullable. Default: `false`.

- **typeParams** (*Map&lt;String, String&gt;*) -

    The type parameters of the struct field.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
List<CreateCollectionReq.StructFieldSchema> fields = schema.getStructFields();
```
