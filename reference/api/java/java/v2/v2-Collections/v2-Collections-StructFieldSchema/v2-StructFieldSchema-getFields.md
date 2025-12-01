---
title: "getFields() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getFields
sidebar_label: "getFields()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the fields of the Struct elements in an Array of Structs. | Java | v2"
type: docx
token: FIzIdKrRNooFttxaf3Pc1vOlnnc
sidebar_position: 4
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - getFields()
  - javaV226
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getFields()

This operation returns the fields of the Struct elements in an Array of Structs.

```java
public List<CreateCollectionReq.FieldSchema> getFields()
```

## Request Syntax\{#request-syntax}

```java
getFields()
```

**RETURN TYPE:**

*List\<CreateCollectionReq.FieldSchema>*

**RETURNS:**

The return value will be the fields of the Struct elements in an Array of Structs.

## Examples\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getFields();
```

