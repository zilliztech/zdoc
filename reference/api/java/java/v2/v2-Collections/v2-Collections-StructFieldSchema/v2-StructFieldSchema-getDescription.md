---
title: "getDescription() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getDescription
sidebar_label: "getDescription()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation returns the description of an Array of Structs field. | Java | v2"
type: docx
token: QbfPdyw7EoXpGwxSkGgcytBBnAb
sidebar_position: 2
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - getDescription()
  - javaV226
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getDescription()

This operation returns the description of an Array of Structs field.

```java
public String getDescription()
```

## Request Syntax\{#request-syntax}

```java
getDescription()
```

**RETURN TYPE:**

*String*

**RETURNS:**

The return value will be the description of the specified Array of Struct field.

## Examples\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getDescription();

// ""
```

