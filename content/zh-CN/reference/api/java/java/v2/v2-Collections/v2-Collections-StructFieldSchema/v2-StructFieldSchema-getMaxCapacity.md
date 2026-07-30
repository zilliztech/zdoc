---
displayed_sidbar: javaSidebar
title: "getMaxCapacity() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getMaxCapacity
sidebar_label: "getMaxCapacity()"
added_since: v2.6.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation returns the maximum capacity of an Array of Structs field. | Java | v2"
type: docx
token: PSdEdxU7ZoTxelx7sLzcAAXsnQH
sidebar_position: 5
keywords: 
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - zilliz
  - zilliz cloud
  - cloud
  - getMaxCapacity()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getMaxCapacity()

This operation returns the maximum capacity of an Array of Structs field.

```java
public Integer getMaxCapacity()
```

## Request Syntax

```java
getMaxCapacity()
```

**RETURN TYPE:**

*Integer*

**RETURNS:**

The return value will be the maximum capacity of the specified Array of Struct field.

## Examples

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getMaxCapacity();

// 600
```

