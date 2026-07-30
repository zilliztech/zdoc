---
title: "getPlaceholderType() | Java | v2"
slug: /java/java/v2-EmbeddingList-getPlaceholderType
sidebar_label: "getPlaceholderType()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This getter returns the placeholder type of the embedding list, which indicates the vector data format. | Java | v2"
type: docx
token: D0UGdkudVo5vtLxlZw3c6cdqnmc
sidebar_position: 4
keywords: 
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - zilliz
  - zilliz cloud
  - cloud
  - getPlaceholderType()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getPlaceholderType()

This getter returns the placeholder type of the embedding list, which indicates the vector data format.

```java
public PlaceholderType getPlaceholderType()
```

**RETURNS:**

*PlaceholderType*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
EmbeddingList embeddingList = new EmbeddingList();
PlaceholderType type = embeddingList.getPlaceholderType();
```
