---
title: "getName() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getName
sidebar_label: "getName()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Array of Structs フィールドの名前を返します。 | Java | v2"
type: docx
token: DZcddGCD3oh29txhnB5cuxzzn4d
sidebar_position: 7
keywords: 
  - Zilliz database
  - 非構造化データ
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - getName()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getName()

この操作は、Array of Structs フィールドの名前を返します。

```java
public String getName()
```

## リクエスト構文\{#request-syntax}

```java
getName()
```

**RETURN TYPE:**

*String*

**RETURNS:**

戻り値は、指定された Array of Struct フィールドの名前です。

## 例\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getName();

// "array_of_structs"
```

