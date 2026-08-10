---
title: "getStructField() | Java | v2"
slug: /java/java/v2-CollectionSchema-getStructField
sidebar_label: "getStructField()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此 getter 按名称从 Collection Schema 中返回 struct 字段 Schema。 | Java | v2"
type: docx
token: KJSvdrks9o6WOsxr0rZcPXe5ngn
sidebar_position: 7
keywords: 
  - 上下文窗口
  - 自然语言搜索
  - 相似性搜索
  - 多模态 RAG
  - zilliz
  - Zilliz Cloud
  - 云
  - getStructField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getStructField()

此 getter 按名称从 Collection Schema 中返回 struct 字段 Schema。

```java
public CreateCollectionReq.StructFieldSchema getStructField(String fieldName)
```

**参数：**

- **fieldName** (*String*) -

    struct 字段的名称。

**返回：**

*CreateCollectionReq.StructFieldSchema*

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
CreateCollectionReq.StructFieldSchema structField = schema.getStructField("metadata");
```
