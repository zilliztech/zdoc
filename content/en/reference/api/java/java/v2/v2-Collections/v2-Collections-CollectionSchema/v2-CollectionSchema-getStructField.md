---
title: "getStructField() | Java | v2"
slug: /java/java/v2-CollectionSchema-getStructField
sidebar_label: "getStructField()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation returns a struct field schema by name from the collection schema. | Java | v2"
type: docx
token: KJSvdrks9o6WOsxr0rZcPXe5ngn
sidebar_position: 7
keywords: 
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - zilliz
  - zilliz cloud
  - cloud
  - getStructField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getStructField()

This operation returns a struct field schema by name from the collection schema.

```java
public CreateCollectionReq.StructFieldSchema getStructField(String fieldName)
```

**PARAMETERS:**

- **fieldName** (*String*) -

    The name of the struct field.

**RETURN TYPE:**

*CreateCollectionReq.StructFieldSchema*

**RETURNS:**

The **CreateCollectionReq.StructFieldSchema** object contains the following fields:

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
CreateCollectionReq.StructFieldSchema structField = schema.getStructField("metadata");
```
