---
title: "getFields() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getFields
sidebar_label: "getFields()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回 Struct 数组中 Struct 元素的字段。 | Java | v2"
type: docx
token: FIzIdKrRNooFttxaf3Pc1vOlnnc
sidebar_position: 5
keywords: 
  - 多模态搜索
  - 向量搜索算法
  - 问答系统
  - llm-as-a-judge
  - zilliz
  - zilliz cloud
  - cloud
  - getFields()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getFields()

此操作返回 Struct 数组中 Struct 元素的字段。

```java
public List<CreateCollectionReq.FieldSchema> getFields()
```

## 请求语法\{#request-syntax}

```java
getFields()
```

**返回类型：**

*List&lt;CreateCollectionReq.FieldSchema&gt;*

**返回：**

返回值为 Struct 数组中 Struct 元素的字段。

## 示例\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getFields();
```

