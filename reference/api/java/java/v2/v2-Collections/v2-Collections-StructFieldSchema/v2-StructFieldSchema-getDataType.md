---
title: "getDataType() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getDataType
sidebar_label: "getDataType()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the data type of an Array of Structs field. | Java | v2"
type: docx
token: MPJ0dxzDIoNKYPxGA5PcD2F8nRb
sidebar_position: 1
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - getDataType()
  - javaV226
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getDataType()

This operation returns the data type of an Array of Structs field.

```java
public DataType getDataType()
```

## Request Syntax\{#request-syntax}

```java
getDataType()
```

**RETURN TYPE:**

*DataType*

**RETURNS:**

The return value will always be `DataType.Array`.

## Examples\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getDataType();

// DataType.Array
```
