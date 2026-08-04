---
title: "isEnableDynamicField() | Java | v2"
slug: /java/java/v2-CollectionSchema-isEnableDynamicField
sidebar_label: "isEnableDynamicField()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此 getter 返回集合 schema 是否启用了动态字段。 | Java | v2"
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

此 getter 返回集合 schema 是否启用了动态字段。

```java
public boolean isEnableDynamicField()
```

**返回：**

*boolean*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
CollectionSchema schema = CollectionSchema.builder()
    .enableDynamicField(true)
    .build();
boolean enabled = schema.isEnableDynamicField(); // true
```
