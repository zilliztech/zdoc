---
title: "getDescription() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getDescription
sidebar_label: "getDescription()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回 Struct 数组字段的描述。 | Java | v2"
type: docx
token: QbfPdyw7EoXpGwxSkGgcytBBnAb
sidebar_position: 3
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - getDescription()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getDescription()

此操作返回 Struct 数组字段的描述。

```java
public String getDescription()
```

## 请求语法\{#request-syntax}

```java
getDescription()
```

**返回类型：**

*String*

**返回：**

返回值将是指定 Struct 数组字段的描述。

## 示例\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getDescription();

// ""
```

