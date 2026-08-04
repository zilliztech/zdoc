---
title: "addField() | Java | v2"
slug: /java/java/v2-StructFieldSchema-addField
sidebar_label: "addField()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会向结构体字段 schema 添加一个子字段。使用此操作可定义结构体类型列的内部字段。 | Java | v2"
type: docx
token: FGO8dhjlTovfOdxpOw0c3wyNntc
sidebar_position: 1
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - addField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addField()

此操作会向结构体字段 schema 添加一个子字段。使用此操作可定义结构体类型列的内部字段。

```java
public StructFieldSchema addField(AddFieldReq addFieldReq)
```

**参数：**

- **addFieldReq** (*AddFieldReq*) -

    用于定义子字段属性的 AddFieldReq 对象。

**返回：**

*[StructFieldSchema](./v2-Collections-StructFieldSchema)*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
CreateCollectionReq.StructFieldSchema structField = CreateCollectionReq.StructFieldSchema.builder()
    .name("metadata")
    .build();
structField.addField(AddFieldReq.builder()
    .fieldName("key")
    .dataType(DataType.VarChar)
    .maxLength(128)
    .build());
```
