---
title: "upsert() | Java | v2"
slug: /java/java/v2-Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションに行を upsert します。部分更新ではフィールド操作を適用でき、各行はコレクションのスキーマに対して検証されます。 | Java | v2"
type: docx
token: I7UWdVnAJobbSSxSPdHc024unMe
sidebar_position: 9
keywords: 
  - ベクトルインデックス
  - オープンソースのベクトルデータベース
  - オープンソースのベクトル DB
  - ベクトルデータベースの例
  - zilliz
  - zilliz cloud
  - クラウド
  - upsert()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# upsert()

この操作は、コレクションに行を upsert します。部分更新ではフィールド操作を適用でき、各行はコレクションのスキーマに対して検証されます。

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

**ビルダーメソッド：**

- `data(List<JsonObject> data)`

    挿入または更新する行です。部分更新の各行には、プライマリキーを含める必要があります。

- `databaseName(String databaseName)`

    データベースの名前です。省略した場合は、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)`

    対象コレクションの名前です。

- `partitionName(String partitionName)`

    対象パーティションの名前です。

- `partialUpdate(boolean partialUpdate)`

    省略された非プライマリフィールドを変更せずに保持するかどうかを指定します。

- `fieldOps(List<FieldPartialUpdateOp> fieldOps)`

    フィールドレベルの操作です。`ARRAY_APPEND` と `ARRAY_REMOVE` は、部分更新のセマンティクスを暗黙的に示します。

**戻り値の型：**

*UpsertResp*

**戻り値：**

挿入または更新されたエンティティの数と、操作コスト（`getCost()`）が含まれます。

**パラメーター：**

- **upsertCnt** (*long*) -

    upsert されたエンティティの数です。

- **primaryKeys** (*List&lt;Object&gt;*) -

    upsert されたエンティティのプライマリキーです。

- **cost** (*Long*) -

    操作の時間コストです。

**例外：**

- **MilvusClientException**

    リクエストの検証、トランスポート、またはサーバーでの実行に失敗すると発生します。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

```java
UpsertResp response = client.upsert(UpsertReq.builder()
    .collectionName("books")
    .data(rows)
    .fieldOps(fieldOps)
    .build());
```
