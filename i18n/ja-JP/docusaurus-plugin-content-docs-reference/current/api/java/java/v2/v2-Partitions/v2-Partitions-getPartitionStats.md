---
title: "getPartitionStats() | Java | v2"
slug: /java/java/v2-Partitions-getPartitionStats
sidebar_label: "getPartitionStats()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、エンティティ数に加えて、パーティションの完全な統計情報マップを返します。 | Java | v2"
type: docx
token: TOfvdLLzaoWJydxBTPQcKevfndd
sidebar_position: 3
keywords: 
  - 検索拡張生成
  - 大規模言語モデル
  - ベクトル化
  - k 近傍法アルゴリズム
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - getPartitionStats()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getPartitionStats()

この操作は、エンティティ数に加えて、パーティションの完全な統計情報マップを返します。

```java
public GetPartitionStatsResp getPartitionStats(GetPartitionStatsReq request)
```

## リクエスト構文\{#request-syntax}

```java
GetPartitionStatsReq.builder()
    .databaseName(databaseName)
    .collectionName(collectionName)
    .partitionName(partitionName)
    .build();
```

**ビルダーメソッド：**

- `databaseName(String databaseName)`

    データベースの名前です。省略した場合は、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)`

    対象コレクションの名前です。

- `partitionName(String partitionName)`

    対象パーティションの名前です。

**戻り値の型：**

*GetPartitionStatsResp*

**戻り値：**

numOfEntities と、Milvus から返される完全な統計情報マップが含まれます。

**パラメーター：**

- **numOfEntities** (*Long*) -

    パーティション内のエンティティ数です。

- **stats** (*Map&lt;String, String&gt;*) -

    Milvus から返される完全な統計情報のキーと値のマップです。

**例外：**

- **MilvusClientException**

    リクエストの検証、トランスポート、またはサーバーでの実行に失敗すると発生します。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

レビュー済みの v3.0.x API を使用した getPartitionStats() の例を示します。

```java
GetPartitionStatsResp response = client.getPartitionStats(GetPartitionStatsReq.builder()
    .collectionName("books")
    .partitionName("history")
    .build());
Map<String, String> stats = response.getStats();
```
