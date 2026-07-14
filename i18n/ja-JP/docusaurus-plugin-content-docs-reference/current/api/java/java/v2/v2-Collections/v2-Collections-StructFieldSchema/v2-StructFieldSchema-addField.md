---
title: "addField() | Java | v2"
slug: /java/java/v2-StructFieldSchema-addField
sidebar_label: "addField()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、struct field schema にサブフィールドを追加します。これを使用して、struct 型カラムの内部フィールドを定義します。 | Java | v2"
type: docx
token: FGO8dhjlTovfOdxpOw0c3wyNntc
sidebar_position: 1
keywords: 
  - ベクトルデータベース比較
  - Faiss
  - 動画検索
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - クラウド
  - addField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addField()

この操作は、struct field schema にサブフィールドを追加します。これを使用して、struct 型カラムの内部フィールドを定義します。

```java
public StructFieldSchema addField(AddFieldReq addFieldReq)
```

**パラメーター：**

- **addFieldReq** (*AddFieldReq*) -

    サブフィールドのプロパティを定義する AddFieldReq オブジェクト。

**戻り値：**

*[StructFieldSchema](./v2-Collections-StructFieldSchema)*

**例外：**

- **MilvusClientException**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## Example\{#example}

```java
CreateCollectionReq.StructFieldSchema structField = CreateCollectionReq.StructFieldSchema.builder()
    .name("metadata")
    .build();
structField.addField(AddFieldReq.builder()
    .fieldName("key")
    .dataType(DataType.VarChar)
    .maxLength(128)
    .build());
```
