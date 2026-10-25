---
title: "searchAsync() | Java | v2"
slug: /java/java/v2-Vector-searchAsync
sidebar_label: "searchAsync()"
beta: false
added_since: v3.0.7
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ベクトル検索を非同期で実行し、Future を返します。 | Java | v2"
type: docx
token: DONndM4QbouPN1xdGujcWedRnXb
sidebar_position: 17
keywords: 
  - knn アルゴリズム
  - HNSW
  - 非構造化データとは
  - ベクトル埋め込み
  - zilliz
  - zilliz cloud
  - クラウド
  - searchAsync()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# searchAsync()

この操作は、ベクトル検索を非同期で実行し、Future を返します。

```java
public CompletableFuture<SearchResp> searchAsync(SearchReq request)
```

このメソッドは `search()` と同じリクエストパラメーターを使用しますが、`CompletableFuture<SearchResp>` を直ちに返します。返された Future を使用して、結果を取得するか、操作が失敗したときの例外完了を処理してください。

## リクエスト構文\{#request-syntax}

```java
CompletableFuture<SearchResp> future = client.searchAsync(SearchReq.builder()
    .collectionName(String collectionName)
    .data(List<BaseVector> data)
    .annsField(String annsField)
    .limit(long limit)
    .build());
```

`SearchReq` のビルダーメソッドの完全な一覧については、search() を参照してください。

**戻り値の型：**

*CompletableFuture&lt;SearchResp&gt;*

**戻り値：**

`SearchResp` で完了する Future、または操作が失敗したときに例外で完了する Future です。

**パラメーター：**

- **searchResults** (*List&lt;List&lt;SearchResult&gt;&gt;*) -

    クエリベクトルごとに 1つずつ含まれる検索結果バッチのリストです。各バッチには、次のフィールドを持つ **SearchResult** エントリが含まれます：

- **id** (*Object*) -

    一致したエンティティのプライマリキー値です。

- **score** (*Float*) -

    一致の関連性スコアです。

- **entity** (*Map&lt;String,Object&gt;*) -

    一致したエンティティのフィールド名と値を含むマップです。

- **primaryKey** (*String*) -

    プライマリキーフィールドの名前です。

- **highlightResults** (*Map&lt;String,HighlightResult&gt;*) -

    ハイライトが要求された場合の、フィールド名をキーとするハイライト結果です。

- **sessionTs** (*long*) -

    読み取りのセッションタイムスタンプです。

- **recalls** (*List&lt;Float&gt;*) -

    報告された場合の、各クエリベクトルの再現率です。

- **cost** (*Long*) -

    操作の所要時間です。

- **scannedRemoteBytes** (*Long*) -

    検索中にリモートでスキャンされたバイト数です。

- **scannedTotalBytes** (*Long*) -

    検索中にスキャンされた合計バイト数です。

- **cacheHitRatio** (*Float*) -

    検索のキャッシュヒット率です。

- **aggregationBuckets** (*List&lt;List&lt;AggregationBucket&gt;&gt;*) -

    集計が要求された場合の、クエリベクトルごとにグループ化された集計バケットです。

**例外：**

- **MilvusClientException**

    この例外は、リクエストの検証、トランスポート、またはサーバーでの実行に失敗した場合にスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

CompletableFuture<SearchResp> future = client.searchAsync(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f})))
        .annsField("vector")
        .limit(10)
        .build());
SearchResp response = future.get();
```
