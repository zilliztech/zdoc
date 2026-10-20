---
title: "isEnableDynamicField() | Java | v2"
slug: /java/java/v2-CollectionSchema-isEnableDynamicField
sidebar_label: "isEnableDynamicField()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションスキーマで動的フィールドが有効かどうかを返します。 | Java | v2"
type: docx
token: XoUqdHpskoe2mOxPtITcHpPUnHg
sidebar_position: 9
keywords: 
  - エージェント型 RAG
  - RAG LLM アーキテクチャ
  - プライベート LLM
  - NN 検索
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - isEnableDynamicField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# isEnableDynamicField()

この操作は、コレクションスキーマで動的フィールドが有効かどうかを返します。

```java
public boolean isEnableDynamicField()
```

**戻り値の型：**

*boolean*

**戻り値：**

コレクションスキーマで動的フィールドが有効な場合は **true** を、それ以外の場合は **false** を返します。

**パラメーター：**

- **戻り値**（*boolean*） -

    コレクションスキーマで動的フィールド（`$meta`）が有効かどうか。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
CollectionSchema schema = CollectionSchema.builder()
    .enableDynamicField(true)
    .build();
boolean enabled = schema.isEnableDynamicField(); // true
```
