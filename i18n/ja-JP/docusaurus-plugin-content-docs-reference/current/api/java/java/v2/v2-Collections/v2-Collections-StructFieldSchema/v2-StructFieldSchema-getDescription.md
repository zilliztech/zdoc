---
title: "getDescription() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getDescription
sidebar_label: "getDescription()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Array of Structs フィールドの説明を返します。 | Java | v2"
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

この操作は、Array of Structs フィールドの説明を返します。

```java
public String getDescription()
```

## リクエスト構文\{#request-syntax}

```java
getDescription()
```

**RETURN TYPE:**

*String*

**RETURNS:**

返り値は、指定された Array of Struct フィールドの説明です。

## 例\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getDescription();

// ""
```

