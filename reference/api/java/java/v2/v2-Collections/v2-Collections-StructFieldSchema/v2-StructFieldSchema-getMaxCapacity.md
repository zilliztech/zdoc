---
title: "getMaxCapacity() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getMaxCapacity
sidebar_label: "getMaxCapacity()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the maximum capacity of an Array of Structs field. | Java | v2"
type: docx
token: PSdEdxU7ZoTxelx7sLzcAAXsnQH
sidebar_position: 5
keywords: 
  - milvus vector database
  - milvus db
  - milvus vector db
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - cloud
  - getMaxCapacity()
  - javaV226
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getMaxCapacity()

This operation returns the maximum capacity of an Array of Structs field.

```java
public Integer getMaxCapacity()
```

## Request Syntax\{#request-syntax}

```java
getMaxCapacity()
```

**RETURN TYPE:**

*Integer*

**RETURNS:**

The return value will be the maximum capacity of the specified Array of Struct field.

## Examples\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getMaxCapacity();

// 600
```

