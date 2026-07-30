---
displayed_sidbar: javaSidebar
title: "getElementType() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getElementType
sidebar_label: "getElementType()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation returns the data type of the Struct elements within an Array of Structs field. | Java | v2"
type: docx
token: PvRGdribPou7PHxcoSWcRK3unUc
sidebar_position: 3
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - getElementType()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getElementType()

This operation returns the data type of the Struct elements within an Array of Structs field.

```java
public DataType getElementType()
```

## Request Syntax

```java
getElementType()
```

**RETURN TYPE:**

*DataType*

**RETURNS:**

The return value will always be `DataType.Array`.

## Examples

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getElementType();

// DataType.Struct
```

