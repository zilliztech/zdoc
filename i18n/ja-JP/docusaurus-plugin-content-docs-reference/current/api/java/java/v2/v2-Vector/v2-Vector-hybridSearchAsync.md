---
title: "hybridSearchAsync() | Java | v2"
slug: /java/java/v2-Vector-hybridSearchAsync
sidebar_label: "hybridSearchAsync()"
beta: false
added_since: v3.0.7
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、ランカーを使用したマルチベクトルの類似性検索を非同期で実行し、Future を返します。 | Java | v2"
type: docx
token: BqO8dsvRBoAZ5Mxgqhscqattnzh
sidebar_position: 15
keywords: 
  - ANNS
  - ベクトル検索
  - knn アルゴリズム
  - HNSW
  - zilliz
  - zilliz cloud
  - クラウド
  - hybridSearchAsync()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# hybridSearchAsync()

この操作は、ランカーを使用したマルチベクトルの類似性検索を非同期で実行し、Future を返します。

```java
public CompletableFuture<SearchResp> hybridSearchAsync(HybridSearchReq request)
```

このメソッドは `hybridSearch()` と同じリクエストパラメーターを使用しますが、`CompletableFuture<SearchResp>` を直ちに返します。返された Future を使用して、結果を取得するか、操作が失敗したときの例外完了を処理します。

## リクエスト構文\{#request-syntax}

```java
CompletableFuture<SearchResp> future = client.hybridSearchAsync(HybridSearchReq.builder()
    .collectionName(String collectionName)
    .searchRequests(List<AnnSearchReq> searchRequests)
    .ranker(FunctionScore ranker)
    .limit(long limit)
    .build());
```

`HybridSearchReq` のビルダーメソッドの完全な一覧については、hybridSearch() を参照してください。

**戻り値の型：**

*CompletableFuture&lt;SearchResp&gt;*

**戻り値：**

`SearchResp` で完了する Future、または操作が失敗したときに例外完了する Future です。

**パラメーター：**

- **searchResults** (*List&lt;List&lt;SearchResult&gt;&gt;*) -

    クエリベクトルごとに 1 つずつ含まれる検索結果バッチのリストで、各バッチには次のフィールドを持つ **SearchResult** エントリが含まれます。

    - **id** (*Object*) -

        一致したエンティティのプライマリキー値です。

    - **score** (*Float*) -

        再ランキング後の一致の関連性スコアです。

    - **entity** (*Map&lt;String,Object&gt;*) -

        一致したエンティティのフィールド名と値を含むマップです。

    - **primaryKey** (*String*) -

        プライマリキーフィールドの名前です。

    - **highlightResults** (*Map&lt;String,HighlightResult&gt;*) -

        ハイライトが要求された場合の、フィールド名をキーとするハイライト結果です。

    - **elementOffset** (*Long*) -

        構造体配列の要素レベルの一致（`element_filter` 経由）の場合、配列内の一致した要素のインデックスです。通常の一致の場合は Null です。

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

    この例外は、リクエストの検証、トランスポート、またはサーバーでの実行に失敗した場合に発生します。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

CompletableFuture<SearchResp> future = client.hybridSearchAsync(HybridSearchReq.builder()
        .collectionName("my_collection")
        .searchRequests(Arrays.asList(
                AnnSearchReq.builder()
                        .vectorFieldName("dense_vector")
                        .vectors(Collections.singletonList(queryVector))
                        .build(),
                AnnSearchReq.builder()
                        .vectorFieldName("sparse_vector")
                        .vectors(Collections.singletonList(sparseVector))
                        .build()))
        .build());
SearchResp response = future.get();
```
