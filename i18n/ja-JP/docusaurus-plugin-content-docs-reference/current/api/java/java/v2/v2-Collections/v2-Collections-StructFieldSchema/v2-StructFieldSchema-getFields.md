---
title: "getFields() | Java | v2"
slug: /java/java/v2-StructFieldSchema-getFields
sidebar_label: "getFields()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、Array of Structs 内の Struct 要素の fields を返します。 | Java | v2"
type: docx
token: FIzIdKrRNooFttxaf3Pc1vOlnnc
sidebar_position: 5
keywords: 
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
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

この操作は、Array of Structs 内の Struct 要素の fields を返します。

```java
public List<CreateCollectionReq.FieldSchema> getFields()
```

## リクエスト構文\{#request-syntax}

```java
getFields()
```

**戻り値の型:**

*List&lt;CreateCollectionReq.FieldSchema&gt;*

**戻り値:**

戻り値は、Array of Structs 内の Struct 要素の fields です。

## 例\{#examples}

```java
// You can get an instance of StructFieldSchema by describing
// a collection containing an Array of Struct field.

structFieldSchema.getFields();
```

