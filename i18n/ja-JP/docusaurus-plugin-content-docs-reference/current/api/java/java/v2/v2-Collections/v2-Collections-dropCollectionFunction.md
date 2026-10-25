---
title: "dropCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionFunction
sidebar_label: "dropCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションから関数定義を削除しますが、その出力フィールドは削除しません。両方を削除するには、`dropFunctionField()` を使用します。 | Java | v2"
type: docx
token: K0wedJ57uoHCyXxOFtNc673tnuA
sidebar_position: 31
keywords: 
  - milvus ベクトルデータベース
  - milvus データベース
  - milvus ベクトルデータベース
  - Zilliz Cloud
  - zilliz
  - Zilliz Cloud
  - クラウド
  - dropCollectionFunction()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropCollectionFunction()

この操作は、既存のコレクションから関数定義を削除しますが、その出力フィールドは削除しません。両方を削除するには、`dropFunctionField()` を使用します。

```java
public void dropCollectionFunction(DropCollectionFunctionReq request)
```

## リクエスト構文\{#request-syntax}

```java
DropCollectionFunctionReq.builder()
    .collectionName(collectionName)
    .databaseName(databaseName)
    .functionName(functionName)
    .build();
```

**ビルダーメソッド:**

- `collectionName(String collectionName)`

    対象コレクションの名前です。

- `databaseName(String databaseName)`

    データベースの名前です。省略した場合は、現在のデータベースが使用されます。

- `functionName(String functionName)`

    削除する関数定義の名前です。

**例外:**

- **MilvusClientException**

    リクエストの検証、転送、またはサーバーでの実行に失敗した場合に発生します。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

```java
client.dropCollectionFunction(DropCollectionFunctionReq.builder()
    .collectionName("books")
    .functionName("bm25")
    .build());
```
