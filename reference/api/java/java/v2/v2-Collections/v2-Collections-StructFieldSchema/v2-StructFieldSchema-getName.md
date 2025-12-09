---
title: "getName() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getName
sidebar_label: "getName()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the name of an Array of Structs field. | Java | v2"
type: docx
token: DZcddGCD3oh29txhnB5cuxzzn4d
sidebar_position: 6
keywords: 
  - Machine Learning
  - RAG
  - NLP
  - Neural Network
  - zilliz
  - zilliz cloud
  - cloud
  - getName()
  - javaV226
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getName()

This operation returns the name of an Array of Structs field.

```java
public String getName()
```

## Request Syntax\{#request-syntax}

```java
getName()
```

**RETURN TYPE:**

*String*

**RETURNS:**

The return value will be the name of the specified Array of Struct field.

## Examples\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getName();

// "array_of_structs"
```

