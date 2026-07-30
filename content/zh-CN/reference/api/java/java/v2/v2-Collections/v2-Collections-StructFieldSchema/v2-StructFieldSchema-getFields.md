---
displayed_sidbar: javaSidebar
title: "getFields() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getFields
sidebar_label: "getFields()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation returns the fields of the Struct elements in an Array of Structs. | Java | v2"
type: docx
token: FIzIdKrRNooFttxaf3Pc1vOlnnc
sidebar_position: 4
keywords: 
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - zilliz
  - zilliz cloud
  - cloud
  - getFields()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getFields()

This operation returns the fields of the Struct elements in an Array of Structs.

```java
public List<CreateCollectionReq.FieldSchema> getFields()
```

## Request Syntax

```java
getFields()
```

**RETURN TYPE:**

*List\<CreateCollectionReq.FieldSchema>*

**RETURNS:**

The return value will be the fields of the Struct elements in an Array of Structs.

## Examples

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getFields();
```

