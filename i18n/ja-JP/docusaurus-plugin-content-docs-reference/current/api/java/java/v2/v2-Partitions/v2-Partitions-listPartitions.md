---
title: "listPartitions() | Java | v2"
slug: /java/java/v2-Partitions-listPartitions
sidebar_label: "listPartitions()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたコレクション内のパーティションを一覧表示します。 | Java | v2"
type: docx
token: Jj60dRCiVoLLRzxVCiGcjI37nHc
sidebar_position: 5
keywords: 
  - ベクトル化
  - k 近傍法アルゴリズム
  - ANNS
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - listPartitions()
  - javaV230
displayed_sidebar: javaSidebar

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

**ビルダーメソッド：**

- `databaseName(String databaseName)`

    対象のコレクションが属するデータベースの名前です。

- `collectionName(String collectionName)`

    既存のコレクションの名前です。

**戻り値の型：**

*List&lt;String&gt;*

**戻り値：**

パーティション名のリストです。

**パラメーター：**

- **partitionNames** (*List&lt;String&gt;*) -

    指定されたコレクション内のパーティション名のリストです。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生した場合、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.partition.request.ListPartitionsReq;
import java.util.List;
import java.util.Set;

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
