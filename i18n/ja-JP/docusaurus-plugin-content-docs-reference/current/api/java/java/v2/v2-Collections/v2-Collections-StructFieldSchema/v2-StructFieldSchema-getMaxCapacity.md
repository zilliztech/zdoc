---
title: "getMaxCapacity() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getMaxCapacity
sidebar_label: "getMaxCapacity()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Array of Structs フィールドの最大容量を返します。 | Java | v2"
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

この操作は、Array of Structs フィールドの最大容量を返します。

```java
public Integer getMaxCapacity()
```

## リクエスト構文\{#request-syntax}

```java
getMaxCapacity()
```

**戻り値の型:**

*Integer*

**戻り値:**

戻り値は、指定された Array of Struct フィールドの最大容量です。

## 例\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getMaxCapacity();

// 600
```

