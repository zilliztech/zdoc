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

## リクエスト構文\{#request-syntax}

```java
DropFunctionFieldReq.builder()
    .collectionName(collectionName)
    .databaseName(databaseName)
    .functionName(functionName)
    .build();
```

**BUILDER メソッド:**

- `collectionName(String collectionName)`

    対象コレクションの名前。

- `databaseName(String databaseName)`

    データベースの名前。省略した場合は現在のデータベースがデフォルトで使用されます。

- `functionName(String functionName)`

    定義と出力フィールドを削除する対象の関数名。

**戻り値:**

*void*

この操作は値を返しません。

**例外:**

- **MilvusClientException**

    リクエストの検証、トランスポート、またはサーバー実行に失敗した場合に発生します。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

```java
client.dropFunctionField(DropFunctionFieldReq.builder()
    .collectionName("books")
    .functionName("bm25")
    .build());
```
