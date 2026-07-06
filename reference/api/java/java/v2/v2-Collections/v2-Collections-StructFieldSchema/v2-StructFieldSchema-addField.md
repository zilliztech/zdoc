---
title: "addField() | Java | v2"
slug: /java/java/v2-StructFieldSchema-addField
sidebar_label: "addField()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation adds a sub-field to a struct field schema. Use this to define the inner fields of a struct-type column. | Java | v2"
type: docx
token: FGO8dhjlTovfOdxpOw0c3wyNntc
sidebar_position: 1
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - addField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addField()

This operation adds a sub-field to a struct field schema. Use this to define the inner fields of a struct-type column.

```java
public StructFieldSchema addField(AddFieldReq addFieldReq)
```

**PARAMETERS:**

- **addFieldReq** (*AddFieldReq*) -

    An AddFieldReq object defining the sub-field properties.

**RETURNS:**

*[StructFieldSchema](./v2-Collections-StructFieldSchema)*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
CreateCollectionReq.StructFieldSchema structField = CreateCollectionReq.StructFieldSchema.builder()
    .name("metadata")
    .build();
structField.addField(AddFieldReq.builder()
    .fieldName("key")
    .dataType(DataType.VarChar)
    .maxLength(128)
    .build());
```
