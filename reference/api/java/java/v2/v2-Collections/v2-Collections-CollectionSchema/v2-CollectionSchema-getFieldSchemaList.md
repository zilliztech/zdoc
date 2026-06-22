---
title: "getFieldSchemaList() | Java | v2"
slug: /java/java/v2-CollectionSchema-getFieldSchemaList
sidebar_key: java/v2-CollectionSchema-getFieldSchemaList
sidebar_label: "getFieldSchemaList()"
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
beta: false
notebook: false
description: "This getter returns the list of all field schemas in the collection schema. | Java | v2"
type: docx
token: XssmdFjdZoXgyXxMDxWceywrnud
sidebar_position: 5
keywords: 
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - zilliz
  - zilliz cloud
  - cloud
  - getFieldSchemaList()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getFieldSchemaList()

This getter returns the list of all field schemas in the collection schema.

```java
public List<CreateCollectionReq.FieldSchema> getFieldSchemaList()
```

**RETURNS:**

*List&lt;CreateCollectionReq.FieldSchema&gt;*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
List<CreateCollectionReq.FieldSchema> fields = schema.getFieldSchemaList();
```
