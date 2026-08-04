---
title: "getPartitionStats() | Java | v2"
slug: /java/java/v2-Partitions-getPartitionStats
sidebar_label: "getPartitionStats()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "エンティティ数に加えて、完全な partition 統計マップを返します。 | Java | v2"
type: docx
token: TOfvdLLzaoWJydxBTPQcKevfndd
sidebar_position: 3
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - getPartitionStats()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getPartitionStats()

エンティティ数に加えて、完全な partition 統計マップを返します。

```java
public GetPartitionStatsResp getPartitionStats(GetPartitionStatsReq request)
```

## Request Syntax\{#request-syntax}

```java
GetPartitionStatsReq.builder()
    .databaseName(databaseName)
    .collectionName(collectionName)
    .partitionName(partitionName)
    .build();
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    データベースの名前です。省略した場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)`

    対象の collection の名前です。

- `partitionName(String partitionName)`

    対象の partition の名前です。

**RETURNS:**

*GetPartitionStatsResp*

Milvus によって返される `numOfEntities` と完全な stats マップが含まれます。

**EXCEPTIONS:**

- **MilvusClientException**

    リクエストの検証、転送、またはサーバー実行が失敗した場合に発生します。正確な失敗理由については、例外メッセージを確認してください。

## Example\{#example}

レビュー済みの v3.0.x API を使用した `getPartitionStats()` の例を示します。

```java
GetPartitionStatsResp response = client.getPartitionStats(GetPartitionStatsReq.builder()
    .collectionName("books")
    .partitionName("history")
    .build());
Map<String, String> stats = response.getStats();
```
