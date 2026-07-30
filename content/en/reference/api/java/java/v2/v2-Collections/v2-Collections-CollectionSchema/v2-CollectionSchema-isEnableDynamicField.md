---
title: "isEnableDynamicField() | Java | v2"
slug: /java/java/v2-CollectionSchema-isEnableDynamicField
sidebar_label: "isEnableDynamicField()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This getter returns whether the dynamic field is enabled for the collection schema. | Java | v2"
type: docx
token: XoUqdHpskoe2mOxPtITcHpPUnHg
sidebar_position: 9
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - isEnableDynamicField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# isEnableDynamicField()

This getter returns whether the dynamic field is enabled for the collection schema.

```java
public boolean isEnableDynamicField()
```

**RETURNS:**

*boolean*

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
CollectionSchema schema = CollectionSchema.builder()
    .enableDynamicField(true)
    .build();
boolean enabled = schema.isEnableDynamicField(); // true
```
