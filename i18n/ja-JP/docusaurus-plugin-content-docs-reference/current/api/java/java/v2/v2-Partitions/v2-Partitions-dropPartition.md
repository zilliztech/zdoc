---
title: "dropPartition() | Java | v2"
slug: /java/java/v2-Partitions-dropPartition
sidebar_label: "dropPartition()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、現在の collection から指定された partition を削除します。 | Java | v2"
type: docx
token: CSaVdr3zao9zFpxaJBgcCTCYnPd
sidebar_position: 2
keywords: 
  - セマンティック検索
  - 異常検知
  - sentence transformers
  - レコメンダーシステム
  - zilliz
  - zilliz cloud
  - cloud
  - dropPartition()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropPartition()

この操作は、現在の collection から指定された partition を削除します。

partition を削除する前に、まずそれを release する必要があります。

```java
public void dropPartition(DropPartitionReq request)
```

## リクエスト構文\{#request-syntax}

```java
dropPartition(DropPartitionReq.builder()
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

    （必須）既存の collection の名前。

- `partitionName(String partitionName)`

    （必須）削除する partition の名前。

**戻り値:**

*void*

**例外:**

- **MilvusClientExceptions**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.DropPartitionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop partition "test_partition"
DropPartitionReq dropPartitionReq = DropPartitionReq.builder()
        .collectionName("test")
        .partitionName("test_partition")
        .build();
client.dropPartition(dropPartitionReq);
```

