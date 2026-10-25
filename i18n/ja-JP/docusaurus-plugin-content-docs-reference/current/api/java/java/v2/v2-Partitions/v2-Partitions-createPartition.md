---
title: "createPartition() | Java | v2"
slug: /java/java/v2-Partitions-createPartition
sidebar_label: "createPartition()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、対象のコレクションにパーティションを作成します。 | Java | v2"
type: docx
token: Un23d2Ac7ovfQsxFDIsczDYzn9d
sidebar_position: 1
keywords: 
  - 類似検索
  - マルチモーダル RAG
  - LLM ハルシネーション
  - ハイブリッド検索
  - zilliz
  - zilliz cloud
  - クラウド
  - createPartition()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createPartition()

この操作は、対象のコレクションにパーティションを作成します。

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

**ビルダーメソッド：**

- `databaseName(String databaseName)`

    対象のコレクションが属するデータベースの名前です。

- `collectionName(String collectionName)`

    （必須）既存のコレクションの名前です。

- `partitionName(String partitionName)`

    （必須）作成するパーティションの名前です。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.CreatePartitionReq;
import java.util.Set;

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
