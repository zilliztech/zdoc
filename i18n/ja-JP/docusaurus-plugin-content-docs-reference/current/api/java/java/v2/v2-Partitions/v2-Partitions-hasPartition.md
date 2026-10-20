---
title: "hasPartition() | Java | v2"
slug: /java/java/v2-Partitions-hasPartition
sidebar_label: "hasPartition()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたコレクション内に指定されたパーティションが存在するかどうかを確認します。 | Java | v2"
type: docx
token: NF0FdJbD7o5HHtx9kxwczbq0nwf
sidebar_position: 4
keywords: 
  - Elastic ベクトルデータベース
  - Pinecone と Milvus
  - Chroma と Milvus
  - Annoy ベクトル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - hasPartition()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# hasPartition()

この操作は、指定されたコレクション内に指定されたパーティションが存在するかどうかを確認します。

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

**ビルダーメソッド：**

- `databaseName(String databaseName)`

    対象のコレクションが属するデータベースの名前です。

- `collectionName(String collectionName)`

    既存のコレクションの名前です。

- `partitionName(String partitionName)`

    確認するパーティションの名前です。

**戻り値の型：**

*Boolean*

**戻り値：**

指定されたパーティションが存在するかどうかを示すブール値です。

**パラメーター：**

- **value** (*Boolean*) -

    指定されたコレクション内に指定されたパーティションが存在するかどうかを示します。

**例外：**

- **MilvusClientException**

    この操作中に何らかのエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.HasPartitionReq;
import java.util.Set;

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
