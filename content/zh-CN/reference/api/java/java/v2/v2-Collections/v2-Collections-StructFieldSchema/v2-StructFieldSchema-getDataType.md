---
displayed_sidbar: javaSidebar
title: "getDataType() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getDataType
sidebar_label: "getDataType()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation returns the data type of an Array of Structs field. | Java | v2"
type: docx
token: MPJ0dxzDIoNKYPxGA5PcD2F8nRb
sidebar_position: 1
keywords: 
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - getDataType()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getDataType()

This operation returns the data type of an Array of Structs field.

```java
public DataType getDataType()
```

## Request Syntax

```java
getDataType()
```

**RETURN TYPE:**

*DataType*

**RETURNS:**

The return value will always be `DataType.Array`.

## Examples

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getDataType();

// DataType.Array
```
