---
title: "get() | Java | v2"
slug: /java/java/v2-Vector-get
sidebar_label: "get()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ID を指定して特定のエンティティを取得します。 | Java | v2"
type: docx
token: Xl3QdxmFxo3MNCxWlrxc9jFbnFc
sidebar_position: 2
keywords: 
  - LLM-as-a-Judge
  - ハイブリッドベクトル検索
  - 動画の重複排除
  - 動画類似検索
  - zilliz
  - zilliz cloud
  - クラウド
  - get()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# get()

この操作は、ID を指定して特定のエンティティを取得します。

```java
public GetResp get(GetReq request)
```

## リクエスト構文\{#request-syntax}

```java
get(GetReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .clusterId(String clusterId)
    .partitionName(String partitionName)
    .partitionNames(List<String> partitionNames)
    .ids(List<Object> ids)
    .outputFields(List<String> outputFields)
    .build()
)
```

**ビルダーメソッド：**

- `databaseName(String databaseName)`

    対象コレクションが属するデータベースの名前です。

- `collectionName(String collectionName)`

    既存のコレクションの名前です。

- `clusterId(String clusterId)`

    クエリ対象のクラスターの ID です。グローバルクラスターデプロイメントに適用されます。

- `partitionName(String partitionName)`

    パーティションの名前です。

- `partitionNames(List<String> partitionNames)`

    クエリ対象のパーティション名のリストです。

- `ids(List<Object> ids)`

    特定のエンティティ ID またはエンティティ ID のリストです。

- `outputFields(List<String> outputFields)`

    クエリ結果に含めるフィールド名のリストです。

**戻り値の型：**

*GetResp*

**戻り値：**

1 つ以上のクエリ対象エンティティを表す **GetResp** オブジェクトです。利用可能な場合は、操作コスト（`getCost()`）とスキャンされたバイト数のメトリクス（`getScannedRemoteBytes()`、`getScannedTotalBytes()`、`getCacheHitRatio()`）が含まれます。

**パラメーター：**

- **getResults** (*List&lt;QueryResp.QueryResult&gt;*) -

    取得されたエンティティのリストです。各 **QueryResp.QueryResult** には次のフィールドが含まれます：

    - **entity** (*Map&lt;String,Object&gt;*) -

        フィールド名とその値をキーと値のペアで格納するマップです。

    - **elementOffset** (*Long*) -

        構造体配列の要素レベルのクエリでは、一致した要素の配列内のインデックスです。通常のクエリでは null です。

- **sessionTs** (*long*) -

    読み取りのセッションタイムスタンプです。

- **cost** (*Long*) -

    操作の時間コストです。

- **scannedRemoteBytes** (*Long*) -

    クエリ中にリモートでスキャンされたバイト数です。

- **scannedTotalBytes** (*Long*) -

    クエリ中にスキャンされた合計バイト数です。

- **cacheHitRatio** (*Float*) -

    クエリのキャッシュヒット率です。

- **fields** (*Map&lt;String,Object&gt;*) -

    フィールド名とその値をキーと値のペアで格納するマップです。

**例外：**

- **MilvusClientExceptions**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.GetReq;
import io.milvus.v2.service.vector.response.GetResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Get entity with id 0
GetReq getReq = GetReq.builder()
        .collectionName("test")
        .ids(Collections.singletonList("0"))
        .build();
GetResp getResp = client.get(getReq);
```
