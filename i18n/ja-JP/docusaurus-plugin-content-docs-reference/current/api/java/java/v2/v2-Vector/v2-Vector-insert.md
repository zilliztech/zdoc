---
title: "insert() | Java | v2"
slug: /java/java/v2-Vector-insert
sidebar_label: "insert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションに行を挿入します。 | Java | v2"
type: docx
token: DKs7dzHI5oaJvlxezuAcuMVzn9c
sidebar_position: 4
keywords: 
  - Chroma vs Milvus
  - Annoy ベクトル検索
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - insert()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# insert()

この操作は、コレクションに行を挿入します。

```java
public InsertResp insert(InsertReq request)
```

## リクエスト構文\{#request-syntax}

```java
InsertReq.builder()
    .data(data)
    .databaseName(databaseName)
    .collectionName(collectionName)
    .partitionName(partitionName)
    .build();
```

**ビルダーメソッド:**

- `data(List<JsonObject> data)`

    挿入する行です。フィールド名と値は、コレクションのスキーマに準拠している必要があります。

- `databaseName(String databaseName)`

    データベースの名前です。省略した場合、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)`

    対象コレクションの名前です。

- `partitionName(String partitionName)`

    対象パーティションの名前です。

**戻り値の型:**

*InsertResp*

**戻り値:**

挿入されたエンティティの数、該当する場合は生成された主キー、および操作コスト（`getCost()`）を含みます。

**パラメーター:**

- **insertCnt** (*long*) -

    挿入されたエンティティの数です。

- **primaryKeys** (*List&lt;Object&gt;*) -

    挿入されたエンティティの主キーです。

- **cost** (*Long*) -

    操作の時間コストです。

**例外:**

- **MilvusClientException**

    リクエストの検証、転送、またはサーバーでの実行に失敗した場合にスローされます。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

レビュー済みの v3.0.x API を使用した insert() の例を示します。

```java
InsertResp response = client.insert(InsertReq.builder()
    .collectionName("books")
    .data(rows)
    .build());
```
