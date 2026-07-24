---
title: "dropFunctionField() | Java | v2"
slug: /java/java/v2-Collections-dropFunctionField
sidebar_label: "dropFunctionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "関数と、その関数が所有する出力フィールドを削除します。 | Java | v2"
type: docx
token: LUUvdGTqrog0AIxfea7cc9a1nCd
sidebar_position: 40
keywords: 
  - ベクトルデータベースとは
  - ベクトルデータベースの比較
  - Faiss
  - 動画検索
  - zilliz
  - zilliz cloud
  - cloud
  - dropFunctionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropFunctionField()

関数と、その関数が所有する出力フィールドを削除します。

```java
public void dropFunctionField(DropFunctionFieldReq request)
```

## Request Syntax\{#request-syntax}

```java
DropFunctionFieldReq.builder()
    .collectionName(collectionName)
    .databaseName(databaseName)
    .functionName(functionName)
    .build();
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    対象 collection の名前です。

- `databaseName(String databaseName)`

    データベースの名前です。省略した場合は現在のデータベースが使用されます。

- `functionName(String functionName)`

    定義と出力フィールドを削除する対象の関数名です。

**RETURNS:**

*void*

この操作は値を返しません。

**EXCEPTIONS:**

- **MilvusClientException**

    リクエストの検証、転送、またはサーバー実行に失敗した場合に発生します。正確な失敗理由については例外メッセージを確認してください。

## Example\{#example}

```java
client.dropFunctionField(DropFunctionFieldReq.builder()
    .collectionName("books")
    .functionName("bm25")
    .build());
```
