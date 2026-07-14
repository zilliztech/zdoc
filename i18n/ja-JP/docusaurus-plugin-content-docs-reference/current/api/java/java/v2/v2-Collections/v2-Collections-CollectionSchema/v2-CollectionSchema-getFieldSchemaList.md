---
title: "getFieldSchemaList() | Java | v2"
slug: /java/java/v2-CollectionSchema-getFieldSchemaList
sidebar_label: "getFieldSchemaList()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この getter は、collection schema 内のすべての field schema のリストを返します。 | Java | v2"
type: docx
token: XssmdFjdZoXgyXxMDxWceywrnud
sidebar_position: 5
keywords: 
  - プライベート llms
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

この getter は、collection schema 内のすべての field schema のリストを返します。

```java
public List<CreateCollectionReq.FieldSchema> getFieldSchemaList()
```

**戻り値:**

*List&lt;CreateCollectionReq.FieldSchema&gt;*

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
List<CreateCollectionReq.FieldSchema> fields = schema.getFieldSchemaList();
```
