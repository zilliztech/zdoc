---
title: "hasPartition() | Java | v2"
slug: /java/java/v2-Partitions-hasPartition
sidebar_label: "hasPartition()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、指定された collection 内に指定された partition が存在するかどうかを確認します。 | Java | v2"
type: docx
token: KVSUdHV0ho7nnwxeQKMcEL47nKe
sidebar_position: 4
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - hasPartition()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# hasPartition()

この操作は、指定された collection 内に指定された partition が存在するかどうかを確認します。

```java
public Boolean hasPartition(HasPartitionReq request)
```

## リクエスト構文\{#request-syntax}

```java
hasPartition(HasPartitionReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    対象の collection が属するデータベースの名前。

- `collectionName(String collectionName)`

    既存の collection の名前。

- `partitionName(String partitionName)`

    確認する partition の名前。

**戻り値の型:**

*Boolean*

**戻り値:**

指定された partition が存在するかどうかを示すブール値。

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.HasPartitionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Check is partition "test_partition" exists in collection
HasPartitionReq hasPartitionReq = HasPartitionReq.builder()
        .collectionName("test")
        .partitionName("test_partition")
        .build();
Boolean res = client.hasPartition(hasPartitionReq);
```

