---
title: "releasePartitions() | Java | v2"
slug: /java/java/v2-Partitions-releasePartitions
sidebar_label: "releasePartitions()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたコレクション内のパーティションをメモリから解放します。 | Java | v2"
type: docx
token: VsyQdDkXnoloWYxfjXNchc0dnng
sidebar_position: 7
keywords: 
  - ANNS
  - ベクトル検索
  - knn algorithm
  - HNSW
  - zilliz
  - zilliz cloud
  - cloud
  - releasePartitions()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# releasePartitions()

この操作は、指定されたコレクション内のパーティションをメモリから解放します。

```java
public void releasePartitions(ReleasePartitionsReq request)
```

## リクエスト構文\{#request-syntax}

```java
releasePartitions(ReleasePartitionsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .build()
)
```

**BUILDER メソッド:**

- `databaseName(String databaseName)`

    コレクションが属するデータベースの名前。

- `collectionName(String collectionName)`

    既存のコレクションの名前。

- `partitionNames(List<String> partitionNames)`

    解放するパーティションの名前のリスト。

**戻り値:**

*void*

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.ReleasePartitionsReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Release partition in collection
ReleasePartitionsReq releasePartitionsReq = ReleasePartitionsReq.builder()
        .collectionName("test_partition")
        .partitionNames(Collections.singletonList("test_partition"))
        .build();
client.releasePartitions(releasePartitionsReq);
```

