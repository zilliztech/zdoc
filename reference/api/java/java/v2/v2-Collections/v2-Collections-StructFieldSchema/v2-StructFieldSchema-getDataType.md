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
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
  - zilliz
  - zilliz cloud
  - cloud
  - getDataType()
  - javaV226
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
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
