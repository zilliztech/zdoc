---
title: "isEnableDynamicField() | Java | v2"
slug: /java/java/v2-CollectionSchema-isEnableDynamicField
sidebar_label: "isEnableDynamicField()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この getter は、collection schema に対して dynamic field が有効になっているかどうかを返します。 | Java | v2"
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

この getter は、collection schema に対して dynamic field が有効になっているかどうかを返します。

```java
public boolean isEnableDynamicField()
```

**戻り値:**

*boolean*

**例外:**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```java
CollectionSchema schema = CollectionSchema.builder()
    .enableDynamicField(true)
    .build();
boolean enabled = schema.isEnableDynamicField(); // true
```
