---
title: "getCollectionStats() | Java | v2"
slug: /java/java/v2-Collections-getCollectionStats
sidebar_label: "getCollectionStats()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "エンティティ数に加えて、完全なコレクション統計マップを返します。 | Java | v2"
type: docx
token: RSNDdgCQ2oRIMWxeVafcNf8LnAc
sidebar_position: 17
keywords: 
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - zilliz
  - zilliz cloud
  - cloud
  - getCollectionStats()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getCollectionStats()

エンティティ数に加えて、完全なコレクション統計マップを返します。

```java
public GetCollectionStatsResp getCollectionStats(GetCollectionStatsReq request)
```

## Request Syntax\{#request-syntax}

```java
GetCollectionStatsReq.builder()
    .databaseName(databaseName)
    .collectionName(collectionName)
    .build();
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    データベースの名前です。省略した場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)`

    対象のコレクションの名前です。

**RETURNS:**

*GetCollectionStatsResp*

Milvus によって返される `numOfEntities` と完全な stats マップを含みます。

**EXCEPTIONS:**

- **MilvusClientException**

    リクエストの検証、トランスポート、またはサーバー実行に失敗したときに発生します。正確な失敗理由については、例外メッセージを確認してください。

## Example\{#example}

```java
GetCollectionStatsResp response = client.getCollectionStats(GetCollectionStatsReq.builder()
    .collectionName("books")
    .build());
Map<String, String> stats = response.getStats();
```
