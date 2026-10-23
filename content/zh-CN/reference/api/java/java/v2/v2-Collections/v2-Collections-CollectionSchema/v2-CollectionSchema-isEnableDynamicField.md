---
title: "isEnableDynamicField() | Java | v2"
slug: /java/java/v2-CollectionSchema-isEnableDynamicField
sidebar_label: "isEnableDynamicField()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作返回 Collection Schema 的动态字段是否已启用。 | Java | v2"
type: docx
token: XoUqdHpskoe2mOxPtITcHpPUnHg
sidebar_position: 9
keywords: 
  - Agentic RAG
  - RAG LLM 架构
  - 私有 LLM
  - 最近邻搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - isEnableDynamicField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# isEnableDynamicField()

此操作返回 Collection Schema 的动态字段是否已启用。

```java
public boolean isEnableDynamicField()
```

**返回类型：**

*boolean*

**返回：**

如果 Collection Schema 的动态字段已启用，则返回 **true**，否则返回 **false**。

**参数：**

- **返回值**（*boolean*） -

    Collection Schema 的动态字段（`$meta`）是否已启用。

**异常：**

- **MilvusClientException**

    当此操作过程中发生任何错误时，将引发此异常。

## 示例\{#example}

```java
CollectionSchema schema = CollectionSchema.builder()
    .enableDynamicField(true)
    .build();
boolean enabled = schema.isEnableDynamicField(); // true
```
