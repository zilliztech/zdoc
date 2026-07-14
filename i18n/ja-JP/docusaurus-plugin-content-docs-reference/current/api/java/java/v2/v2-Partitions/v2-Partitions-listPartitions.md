---
title: "listPartitions() | Java | v2"
slug: /java/java/v2-Partitions-listPartitions
sidebar_label: "listPartitions()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたコレクション内のパーティションを一覧表示します。 | Java | v2"
type: docx
token: Bjs5dej7ZoBKhXxZzMjclPCynmd
sidebar_position: 5
keywords: 
  - ベクトル化
  - k 最近傍アルゴリズム
  - ANNS
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - listPartitions()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listPartitions()

この操作は、指定されたコレクション内のパーティションを一覧表示します。

```java
public List<String> listPartitions(ListPartitionsReq request)
```

## リクエスト構文\{#request-syntax}

```java
listPartitions(ListPartitionsReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER メソッド:**

- `databaseName(String databaseName)`

    対象のコレクションが属するデータベースの名前。

- `collectionName(String collectionName)`

    既存のコレクションの名前。

**戻り値の型:**

*List\<String\>*

**戻り値:**

パーティション名のリスト。

**例外:**

- **MilvusClientExceptions**

    この操作の実行中に何らかのエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.ListPartitionsReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. List partitions in collection
ListPartitionsReq listPartitionsReq = ListPartitionsReq.builder()
        .collectionName("test")
        .build();
List<String> res = client.listPartitions(listPartitionsReq);
```

