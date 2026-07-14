---
title: "getPartitionStats() | Java | v2"
slug: /java/java/v2-Partitions-getPartitionStats
sidebar_label: "getPartitionStats()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定の partition で収集された統計情報を一覧表示します。 | Java | v2"
type: docx
token: ZCESd1IrfoFHByx125kcd38Zndg
sidebar_position: 3
keywords: 
  - Retrieval Augmented Generation
  - 大規模言語モデル
  - ベクトル化
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

この操作は、特定の partition で収集された統計情報を一覧表示します。

```java
public GetPartitionStatsResp getPartitionStats(GetPartitionStatsReq request)
```

## リクエスト構文\{#request-syntax}

```java
getPartitionStats(GetPartitionStatsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**BUILDER メソッド:**

- `databaseName(String databaseName)`

    対象の collection が属する database の名前。

- `collectionName(String collectionName)`

    collection の名前。

- `partitionName(String partitionName)`

    指定された collection 内の partition の名前。

**戻り値の型:**

*GetPartitionStatsResp*

**戻り値:**

指定された collection で収集された統計情報を含む **GetPartitionStatsResp** オブジェクト。

**パラメータ:**

- **numOfEntities** (*long*)

    partition 内のエンティティ数。

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.GetPartitionStatsReq;
import io.milvus.v2.service.partition.response.GetPartitionStatsResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get partition stats
GetPartitionStatsReq getPartitionStatsReq = GetPartitionStatsReq.builder()
        .collectionName("test")
        .partitionName("default")
        .build();
GetPartitionStatsResp getPartitionStatsResp = client.getPartitionStats(getPartitionStatsReq);
```

