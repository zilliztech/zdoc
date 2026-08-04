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
  - 高密度埋め込み
  - Faiss vector database
  - Chroma vector database
  - nlp 検索
  - zilliz
  - zilliz cloud
  - クラウド
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

## リクエスト構文\{#request-syntax}

```java
GetCollectionStatsReq.builder()
    .databaseName(databaseName)
    .collectionName(collectionName)
    .build();
```

**BUILDER メソッド:**

- `databaseName(String databaseName)`

    データベースの名前です。省略した場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)`

    対象コレクションの名前です。

**戻り値:**

*GetCollectionStatsResp*

Milvus によって返される `numOfEntities` と完全な stats マップを含みます。

**例外:**

- **MilvusClientException**

    リクエストの検証、トランスポート、またはサーバー実行が失敗した場合に発生します。正確な失敗理由については例外メッセージを確認してください。

## 例\{#example}

```java
GetCollectionStatsResp response = client.getCollectionStats(GetCollectionStatsReq.builder()
    .collectionName("books")
    .build());
Map<String, String> stats = response.getStats();
```
