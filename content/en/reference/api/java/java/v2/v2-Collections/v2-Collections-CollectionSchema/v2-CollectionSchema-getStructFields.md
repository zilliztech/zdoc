---
title: "getStructFields() | Java | v2"
slug: /java/java/v2-CollectionSchema-getStructFields
sidebar_label: "getStructFields()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This getter returns all struct field schemas in the collection schema. | Java | v2"
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

This getter returns all struct field schemas in the collection schema.

```java
public List<CreateCollectionReq.StructFieldSchema> getStructFields()
```

**RETURNS:**

*List&lt;CreateCollectionReq.StructFieldSchema&gt;*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
List<CreateCollectionReq.StructFieldSchema> fields = schema.getStructFields();
```
