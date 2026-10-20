---
title: "dropFunctionField() | Java | v2"
slug: /java/java/v2-Collections-dropFunctionField
sidebar_label: "dropFunctionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、関数と、その関数が所有する出力フィールドを削除します。 | Java | v2"
type: docx
token: LUUvdGTqrog0AIxfea7cc9a1nCd
sidebar_position: 42
keywords: 
  - ベクトルデータベースとは
  - ベクトルデータベース比較
  - Faiss
  - 動画検索
  - zilliz
  - zilliz cloud
  - クラウド
  - dropFunctionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropFunctionField()

この操作は、関数と、その関数が所有する出力フィールドを削除します。

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

**ビルダーメソッド:**

- `collectionName(String collectionName)`

    対象のコレクションの名前です。

- `databaseName(String databaseName)`

    データベースの名前です。省略した場合は、現在のデータベースが使用されます。

- `functionName(String functionName)`

    定義と出力フィールドを削除する関数の名前です。

**例外:**

- **MilvusClientException**

    リクエストの検証、トランスポート、またはサーバー実行が失敗した場合に発生します。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

```java
client.dropFunctionField(DropFunctionFieldReq.builder()
    .collectionName("books")
    .functionName("bm25")
    .build());
```
