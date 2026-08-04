---
title: "getMaxCapacity() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getMaxCapacity
sidebar_label: "getMaxCapacity()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回 Struct 数组字段的最大容量。 | Java | v2"
type: docx
token: PSdEdxU7ZoTxelx7sLzcAAXsnQH
sidebar_position: 6
keywords: 
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - zilliz
  - zilliz cloud
  - cloud
  - getMaxCapacity()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getMaxCapacity()

此操作返回 Struct 数组字段的最大容量。

```java
public Integer getMaxCapacity()
```

## 请求语法\{#request-syntax}

```java
getMaxCapacity()
```

**返回类型：**

*Integer*

**返回：**

返回值将是指定 Struct 数组字段的最大容量。

## 示例\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getMaxCapacity();

// 600
```

