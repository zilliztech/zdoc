---
title: "getElementType() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getElementType
sidebar_label: "getElementType()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作返回 Struct 数组字段中 Struct 元素的数据类型。 | Java | v2"
type: docx
token: PvRGdribPou7PHxcoSWcRK3unUc
sidebar_position: 4
keywords: 
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - getElementType()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getElementType()

此操作返回 Struct 数组字段中 Struct 元素的数据类型。

```java
public DataType getElementType()
```

## 请求语法\{#request-syntax}

```java
getElementType()
```

**返回类型：**

*[DataType](./v2-Collections-DataType)*

**返回：**

返回值始终为 `DataType.Array`。

## 示例\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getElementType();

// DataType.Struct
```

