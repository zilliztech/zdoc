---
title: "createPartition() | Java | v2"
slug: /java/java/v2-Partitions-createPartition
sidebar_label: "createPartition()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、対象の collection に partition を作成します。 | Java | v2"
type: docx
token: WE4gduIjooCgQUxcKyLcwQe1n3g
sidebar_position: 1
keywords: 
  - 類似性検索
  - マルチモーダル RAG
  - llm hallucinations
  - ハイブリッド検索
  - zilliz
  - zilliz cloud
  - クラウド
  - createPartition()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createPartition()

この操作は、対象の collection に partition を作成します。

```java
public void createPartition(CreatePartitionReq request)
```

## リクエスト構文\{#request-syntax}

```java
createPartition(CreatePartitionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    対象の collection が属するデータベースの名前です。

- `collectionName(String collectionName)`

    （必須）既存の collection の名前です。

- `partitionName(String partitionName)`

    （必須）作成する partition の名前です。

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    この例外は、この操作中に何らかのエラーが発生した場合にスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.CreatePartitionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create a partition "test_partition" in collection "test"
CreatePartitionReq createPartitionReq = CreatePartitionReq.builder()
        .collectionName("test")
        .partitionName("test_partition")
        .build();
client.createPartition(createPartitionReq);
```

