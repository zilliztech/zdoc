---
title: "getQuerySegmentInfo() | Java | v2"
slug: /java/java/v2-Management-getQuerySegmentInfo
sidebar_label: "getQuerySegmentInfo()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、クエリノードからコレクションの永続セグメントに関する情報を取得します。これにはエンティティ数が含まれます。 | Java | v2"
type: docx
token: QuXrdxjjro2u25xZChncXfBunlO
sidebar_position: 21
keywords: 
  - ベクトルデータベースの比較
  - OpenAI ベクトルデータベース
  - 自然言語処理データベース
  - 安価なベクトルデータベース
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - getQuerySegmentInfo()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getQuerySegmentInfo()

この操作では、クエリノードからコレクションの永続セグメントに関する情報を取得します。これにはエンティティ数が含まれます。

```java
public GetQuerySegmentInfoResp getQuerySegmentInfo(GetQuerySegmentInfoReq request)
```

## リクエストパラメーター\{#request-parameters}

```java
getQuerySegmentInfo(GetQuerySegmentInfoReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .build()
)
```

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    対象のコレクションが属するデータベースの名前です。

- `collectionName(String collectionName)`

    対象のコレクションの名前です。

**戻り値の型:**

*GetQuerySegmentInfoResp*

**戻り値:**

指定したコレクション内の永続セグメントに関する詳細情報を含む **GetQuerySegmentInfoResp** オブジェクトです。この情報には、各セグメントのエンティティ数が含まれます。このオブジェクトには、以下のパラメーターがあります。

**パラメーター:**

- **segmentInfos** (*List&lt;QuerySegmentInfo&gt;*) -

    セグメントのリストです。各セグメントは **QuerySegmentInfo** オブジェクトで表され、以下のフィールドを持ちます。

    - **collectionName** (*String*) -

        現在のセグメントが属するコレクションの名前です。

    - **segmentID** (*Long*) -

        現在のセグメントの ID です。

    - **collectionID** (*Long*) -

        現在のセグメントが属するコレクションの ID です。

    - **partitionID** (*Long*) -

        現在のセグメントが属するパーティションの ID です。

    - **memSize** (*Long*) -

        現在のセグメントがメモリ内で占有するサイズです。

    - **numOfRows** (*Long*) -

        現在のセグメント内のエンティティ数です。

    - **indexName** (*String*) -

        現在のセグメントに関連するインデックスの名前です。

    - **indexID** (*Long*) -

        現在のセグメントに関連するインデックスの ID です。

    - **state** (*String*) -

        現在のセグメントの状態です。指定できる値は "Growing"、"Sealed"、"Flushed"、"Flushing"、"Dropped"、"Importing" です。

    - **level** (*String*) -

        現在のセグメントの Compaction レベルです。指定できる値は "Legacy"、"L0"、"L1"、"L2" です。

    - **nodeIDs** (*List&lt;Long&gt;*) -

        クエリノード ID のリストです。

    - **storageVersion** (*Long*) -

        現在のセグメントのストレージ形式のバージョンです。

    - **isSorted** (*Boolean*) -

        現在のセグメント内のエンティティがソートされているかどうかを示します。

**例外:**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.GetQuerySegmentInfoReq;
import io.milvus.v2.service.utility.response.GetQuerySegmentInfoResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get segment info
GetQuerySegmentInfoResp segInfoResp = client.getQuerySegmentInfo(GetQuerySegmentInfoReq.builder()
        .collectionName("test")
        .build());
```
