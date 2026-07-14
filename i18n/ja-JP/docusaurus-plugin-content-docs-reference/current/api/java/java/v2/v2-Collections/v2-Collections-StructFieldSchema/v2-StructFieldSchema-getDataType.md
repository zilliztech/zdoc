---
title: "getDataType() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getDataType
sidebar_label: "getDataType()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Array of Structs フィールドのデータ型を返します。 | Java | v2"
type: docx
token: MPJ0dxzDIoNKYPxGA5PcD2F8nRb
sidebar_position: 2
keywords: 
  - vector db とは
  - vector databases とは
  - vector databases の比較
  - Faiss
  - zilliz
  - zilliz cloud
  - cloud
  - getDataType()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getDataType()

この操作は、Array of Structs フィールドのデータ型を返します。

```java
public DataType getDataType()
```

## リクエスト構文\{#request-syntax}

```java
getDataType()
```

**戻り値の型:**

*[DataType](./v2-Collections-DataType)*

**戻り値:**

戻り値は常に `DataType.Array` です。

## 例\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getDataType();

// DataType.Array
```
