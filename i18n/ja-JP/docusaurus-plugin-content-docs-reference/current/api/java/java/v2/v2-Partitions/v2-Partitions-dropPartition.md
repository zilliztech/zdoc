---
title: "dropPartition() | Java | v2"
slug: /java/java/v2-Partitions-dropPartition
sidebar_label: "dropPartition()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、現在のコレクションから指定されたパーティションを削除します。 | Java | v2"
type: docx
token: GfGfd7P5Aong4Fx4bctc4SQPn1g
sidebar_position: 2
keywords: 
  - セマンティック検索
  - 異常検知
  - Sentence Transformers
  - レコメンダーシステム
  - zilliz
  - zilliz cloud
  - クラウド
  - dropPartition()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropPartition()

この操作は、現在のコレクションから指定されたパーティションを削除します。

パーティションを削除する前に、そのパーティションを解放する必要があります。

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

**ビルダーメソッド：**

- `databaseName(String databaseName)`

    対象コレクションが属するデータベースの名前です。

- `collectionName(String collectionName)`

    （必須）既存のコレクションの名前です。

- `partitionName(String partitionName)`

    （必須）削除するパーティションの名前です。

**例外：**

- **MilvusClientException**

    この操作中に何らかのエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.DropPartitionReq;
import java.util.Set;

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
