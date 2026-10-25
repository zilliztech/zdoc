---
title: "getCollectionStats() | Java | v2"
slug: /java/java/v2-Collections-getCollectionStats
sidebar_label: "getCollectionStats()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、エンティティ数に加えて、コレクションの完全な統計マップを返します。 | Java | v2"
type: docx
token: RSNDdgCQ2oRIMWxeVafcNf8LnAc
sidebar_position: 15
keywords: 
  - 密な埋め込み
  - Faiss ベクトルデータベース
  - Chroma ベクトルデータベース
  - NLP 検索
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - getCollectionStats()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getCollectionStats()

この操作では、エンティティ数に加えて、コレクションの完全な統計マップを返します。

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

    データベース名です。省略すると、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)`

    対象コレクション名です。

**戻り値の型:**

*GetCollectionStatsResp*

**戻り値:**

指定したコレクションのエンティティ数と完全な統計マップを含む **GetCollectionStatsResp** オブジェクトです。

**パラメーター:**

- **numOfEntities** (*Long*) -

    コレクション内のエンティティ数です。

- **stats** (*Map&lt;String, String&gt;*) -

    Milvus によってキーと値のペアとして返される、コレクションの完全な統計マップです。

**例外:**

- **MilvusClientException**

    リクエストの検証、トランスポート、またはサーバーでの実行に失敗した場合にスローされます。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

```java
GetCollectionStatsResp response = client.getCollectionStats(GetCollectionStatsReq.builder()
    .collectionName("books")
    .build());
Map<String, String> stats = response.getStats();
```
