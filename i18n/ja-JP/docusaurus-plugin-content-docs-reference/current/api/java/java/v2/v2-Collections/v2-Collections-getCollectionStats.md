---
title: "getCollectionStats() | Java | v2"
slug: /java/java/v2-Collections-getCollectionStats
sidebar_label: "getCollectionStats()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、特定の collection で収集された統計情報を一覧表示します。 | Java | v2"
type: docx
token: E27SdesNPoKA8zx6jHkcejt0nWg
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

この操作は、特定の collection で収集された統計情報を一覧表示します。

```java
public GetCollectionStatsResp getCollectionStats(GetCollectionStatsReq request)
```

## Request Syntax\{#request-syntax}

```java
getCollectionStats(GetCollectionStatsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    対象の collection が属するデータベースの名前。

- `collectionName(String collectionName)`

    collection の名前。

**RETURN TYPE:**

*GetCollectionStatsResp*

**RETURNS:**

指定された collection で収集された統計情報を含む **GetCollectionStatsResp** オブジェクト。

**PARAMETERS:**

- **numOfEntities** (*long*)

    collection 内の entity の数。

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.GetCollectionStatsReq;
import io.milvus.v2.service.collection.response.GetCollectionStatsResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get collection stats
GetCollectionStatsReq getCollectionStatsReq = GetCollectionStatsReq.builder()
        .collectionName("test")
        .build();
GetCollectionStatsResp getCollectionStatsResp = client.getCollectionStats(getCollectionStatsReq);
```

