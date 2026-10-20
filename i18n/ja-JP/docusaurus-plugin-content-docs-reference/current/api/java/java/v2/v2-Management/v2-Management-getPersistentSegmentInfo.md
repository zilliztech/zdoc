---
title: "getPersistentSegmentInfo() | Java | v2"
slug: /java/java/v2-Management-getPersistentSegmentInfo
sidebar_label: "getPersistentSegmentInfo()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、データノードからコレクションの永続セグメントに関する情報を取得します。この情報にはエンティティ数が含まれます。 | Java | v2"
type: docx
token: Qg8wdRoRdoan3pxQnJLcOW5jnub
sidebar_position: 20
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN 検索
  - ベクトル埋め込みとは
  - zilliz
  - zilliz cloud
  - cloud
  - getPersistentSegmentInfo()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# getPersistentSegmentInfo()

この操作では、データノードからコレクションの永続セグメントに関する情報を取得します。この情報にはエンティティ数が含まれます。

```java
public GetPersistentSegmentInfoResp getPersistentSegmentInfo(GetPersistentSegmentInfoReq request)
```

## リクエスト構文\{#request-syntax}

```java
getPersistentSegmentInfo(GetPersistentSegmentInfoReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**ビルダーメソッド：**

- `databaseName(String databaseName)`

    対象のコレクションが属するデータベースの名前です。

- `collectionName(String collectionName)`

    対象のコレクションの名前です。

**戻り値の型：**

*GetPersistentSegmentInfoResp*

**戻り値：**

**GetPersistentSegmentInfoResp** オブジェクトです。指定したコレクション内の永続化されたセグメントに関する詳細情報を保持します。この情報には、各セグメントのエンティティ数が含まれます。このオブジェクトには以下のパラメーターがあります。

**パラメーター：**

- **segmentInfos** (*List&lt;PersistentSegmentInfo&gt;*) -

    セグメントのリストです。各セグメントは PersistentSegmentInfo オブジェクトで表され、以下のフィールドを持ちます。

    - **segmentID** (*Long*) -

        現在のセグメントの ID です。

    - **collectionID** (*Long*) -

        現在のセグメントが属するコレクションの ID です。

    - **partitionID** (*Long*) -

        現在のセグメントが属するパーティションの ID です。

    - **collectionName** (*String*) -

        現在のセグメントが属するコレクションの名前です。

    - **numOfRows** (*Long*) -

        現在のセグメント内のエンティティ数です。

    - **state** (*String*) -

        現在のセグメントの状態です。指定可能な値は、"Growing"、"Sealed"、"Flushed"、"Flushing"、"Dropped"、"Importing" です。

    - **level** (*String*) -

        現在のセグメントの Compaction レベルです。指定可能な値は、"Legacy"、"L0"、"L1"、"L2" です。

    - **storageVersion** (*Long*) -

        現在のセグメントのストレージ形式バージョンです。

    - **isSorted** (*Boolean*) -

        現在のセグメント内のエンティティがソートされているかどうかです。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外が発生します。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.GetPersistentSegmentInfoReq;
import io.milvus.v2.service.utility.response.GetPersistentSegmentInfoResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get segment info
GetPersistentSegmentInfoResp segInfoResp = client.getPersistentSegmentInfo(GetPersistentSegmentInfoReq.builder()
        .collectionName(randomCollectionName)
        .build());
```
