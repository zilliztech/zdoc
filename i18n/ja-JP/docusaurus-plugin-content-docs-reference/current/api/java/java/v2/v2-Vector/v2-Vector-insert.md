---
title: "insert() | Java | v2"
slug: /java/java/v2-Vector-insert
sidebar_label: "insert()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "auto-ID フィールド、関数出力フィールド、動的フィールド、Struct 値に対する insert-row の検証を整合させます。 | Java | v2"
type: docx
token: DKs7dzHI5oaJvlxezuAcuMVzn9c
sidebar_position: 4
keywords: 
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - insert()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# insert()

auto-ID フィールド、関数出力フィールド、動的フィールド、Struct 値に対する insert-row の検証を整合させます。

```java
public InsertResp insert(InsertReq request)
```

## Request Syntax\{#request-syntax}

```java
InsertReq.builder()
    .data(data)
    .databaseName(databaseName)
    .collectionName(collectionName)
    .partitionName(partitionName)
    .build();
```

**BUILDER METHODS:**

- `data(List<JsonObject> data)`

    挿入する行です。フィールド名と値は collection スキーマに準拠している必要があります。

- `databaseName(String databaseName)`

    データベースの名前です。省略した場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)`

    対象の collection の名前です。

- `partitionName(String partitionName)`

    対象の partition の名前です。

**RETURNS:**

*InsertResp*

挿入されたエンティティの数と、該当する場合は生成された主キーが含まれます。

**EXCEPTIONS:**

- **MilvusClientException**

    リクエストの検証、転送、またはサーバー実行に失敗した場合に発生します。正確な失敗理由については例外メッセージを確認してください。

## Example\{#example}

レビュー済みの v3.0.x API を使用した insert() を示します。

```java
InsertResp response = client.insert(InsertReq.builder()
    .collectionName("books")
    .data(rows)
    .build());
```
