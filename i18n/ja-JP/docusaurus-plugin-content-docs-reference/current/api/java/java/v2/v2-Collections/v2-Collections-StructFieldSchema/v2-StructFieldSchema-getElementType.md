---
title: "getElementType() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getElementType
sidebar_label: "getElementType()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Array of Structs フィールド内の Struct 要素のデータ型を返します。 | Java | v2"
type: docx
token: PvRGdribPou7PHxcoSWcRK3unUc
sidebar_position: 4
keywords: 
  - vector db とは
  - vector databases とは
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

この操作は、Array of Structs フィールド内の Struct 要素のデータ型を返します。

```java
public DataType getElementType()
```

## リクエスト構文\{#request-syntax}

```java
getElementType()
```

**戻り値の型:**

*[DataType](./v2-Collections-DataType)*

**戻り値:**

返される値は常に `DataType.Array` です。

## 例\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getElementType();

// DataType.Struct
```

