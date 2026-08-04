---
title: "upsert() | Java | v2"
slug: /java/java/v2-Vector-upsert
sidebar_label: "upsert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "collection に行をアップサートします。部分更新ではフィールド操作を適用でき、各行は collection スキーマに対して検証されます。 | Java | v2"
type: docx
token: I7UWdVnAJobbSSxSPdHc024unMe
sidebar_position: 9
keywords: 
  - Vector index
  - オープンソース vector database
  - オープンソース vector db
  - vector database の例
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

collection に行をアップサートします。部分更新ではフィールド操作を適用でき、各行は collection スキーマに対して検証されます。

```java
public UpsertResp upsert(UpsertReq request)
```

## Request Syntax\{#request-syntax}

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

**BUILDER METHODS:**

- `data(List<JsonObject> data)`

    挿入または更新する行です。すべての部分更新行には主キーを含める必要があります。

- `databaseName(String databaseName)`

    database の名前です。省略した場合は現在の database がデフォルトで使用されます。

- `collectionName(String collectionName)`

    対象 collection の名前です。

- `partitionName(String partitionName)`

    対象 partition の名前です。

- `partialUpdate(boolean partialUpdate)`

    省略された非主キーフィールドを変更せずに保持するかどうかです。

- `fieldOps(List<FieldPartialUpdateOp> fieldOps)`

    フィールドレベルの操作です。`ARRAY_APPEND` と `ARRAY_REMOVE` は部分更新セマンティクスを意味します。

**RETURNS:**

*UpsertResp*

挿入または更新された entity の数を含みます。

**EXCEPTIONS:**

- **MilvusClientException**

    リクエストの検証、転送、またはサーバー実行が失敗した場合に発生します。正確な失敗理由については例外メッセージを確認してください。

## Example\{#example}

```java
UpsertResp response = client.upsert(UpsertReq.builder()
    .collectionName("books")
    .data(rows)
    .fieldOps(fieldOps)
    .build());
```
