---
title: "getStructField() | Java | v2"
slug: /java/java/v2-CollectionSchema-getStructField
sidebar_label: "getStructField()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This getter returns a struct field schema by name from the collection schema. | Java | v2"
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

This getter returns a struct field schema by name from the collection schema.

```java
public CreateCollectionReq.StructFieldSchema getStructField(String fieldName)
```

**PARAMETERS:**

- **fieldName** (*String*) -

    The name of the struct field.

**RETURNS:**

*CreateCollectionReq.StructFieldSchema*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
CreateCollectionReq.StructFieldSchema structField = schema.getStructField("metadata");
```
