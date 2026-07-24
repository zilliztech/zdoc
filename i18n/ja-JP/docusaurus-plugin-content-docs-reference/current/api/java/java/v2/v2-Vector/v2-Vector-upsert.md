---
title: "upsert() | Java | v2"
slug: /java/java/v2-Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "collection に行を upsert します。部分更新ではフィールド操作を適用でき、各行は collection スキーマに対して検証されます。 | Java | v2"
type: docx
token: I7UWdVnAJobbSSxSPdHc024unMe
sidebar_position: 9
keywords: 
  - Vector index
  - vector database open source
  - open source vector db
  - vector database example
  - zilliz
  - zilliz cloud
  - cloud
  - upsert()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# upsert()

collection に行を upsert します。部分更新ではフィールド操作を適用でき、各行は collection スキーマに対して検証されます。

```java
public UpsertResp upsert(UpsertReq request)
```

## リクエスト構文\{#request-syntax}

```java
UpsertReq.builder()
    .data(data)
    .databaseName(databaseName)
    .collectionName(collectionName)
    .partitionName(partitionName)
    .partialUpdate(partialUpdate)
    .fieldOps(fieldOps)
    .build();
```

**BUILDER メソッド:**

- `data(List<JsonObject> data)`

    挿入または更新する行です。すべての部分更新行には主キーを含める必要があります。

- `databaseName(String databaseName)`

    データベースの名前です。省略した場合は現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)`

    対象 collection の名前です。

- `partitionName(String partitionName)`

    対象 partition の名前です。

- `partialUpdate(boolean partialUpdate)`

    省略された非主キーフィールドを変更せずに保持するかどうかです。

- `fieldOps(List<FieldPartialUpdateOp> fieldOps)`

    フィールドレベルの操作です。`ARRAY_APPEND` と `ARRAY_REMOVE` は部分更新セマンティクスを暗黙的に適用します。

**戻り値:**

*UpsertResp*

挿入または更新されたエンティティ数を含みます。

**例外:**

- **MilvusClientException**

    リクエストの検証、トランスポート、またはサーバー実行が失敗したときに発生します。正確な失敗理由については例外メッセージを確認してください。

## 例\{#example}

```java
UpsertResp response = client.upsert(UpsertReq.builder()
    .collectionName("books")
    .data(rows)
    .fieldOps(fieldOps)
    .build());
```
