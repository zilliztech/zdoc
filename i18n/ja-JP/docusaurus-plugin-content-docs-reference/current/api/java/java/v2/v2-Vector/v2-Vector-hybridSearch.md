---
title: "hybridSearch() | Java | v2"
slug: /java/java/v2-Vector-hybridSearch
sidebar_label: "hybridSearch()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションに対してマルチベクトル検索を実行し、再ランキング後の検索結果を返します。 | Java | v2"
type: docx
token: R1NDdFPnVo4wTuxvHjFcozc8nMa
sidebar_position: 3
keywords: 
  - Faiss
  - 動画検索
  - AI ハルシネーション
  - AI エージェント
  - zilliz
  - zilliz cloud
  - クラウド
  - hybridSearch()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# hybridSearch()

この操作は、コレクションに対してマルチベクトル検索を実行し、再ランキング後の検索結果を返します。

```java
public SearchResp hybridSearch(HybridSearchReq request)
```

## リクエスト構文\{#request-syntax}

```java
hybridSearch(HybridSearchReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .searchRequests(List<AnnSearchReq> searchRequests)
    .topK(int topK)
    .limit(long limit)
    .outFields(List<String> outFields)
    .offset(long offset)
    .roundDecimal(int roundDecimal)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .groupByFieldName(String groupByFieldName)
    .groupSize(Integer groupSize)
    .strictGroupSize(Boolean strictGroupSize)
    .functionScore(FunctionScore functionScore)
    .build()
);
```

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトで使用されます。

- `clusterId(String clusterId)`

    **非推奨。** クエリの対象となるクラスターの ID です。グローバルクラスターのデプロイメントに適用されます。

- `collectionName(String collectionName)`

    対象コレクションの名前です。

- `partitionNames(List<String> partitionNames)`

    対象とするパーティション名のリストです。

- `searchRequests(List<AnnSearchReq> searchRequests)`

    ハイブリッド検索用の AnnSearchReq オブジェクトのリストです。

- `topK(int topK)`

    返す上位結果の数です。

- `limit(long limit)`

    返す結果の最大数です。

- `outFields(List<String> outFields)`

    出力に含めるフィールド名のリストです。

- `offset(long offset)`

    返す前にスキップする結果の数です。

- `roundDecimal(int roundDecimal)`

    distance/score の丸めに使用する小数点以下の桁数です。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    操作の整合性レベルです。

- `groupByFieldName(String groupByFieldName)`

    検索結果をグループ化するフィールド名です。

- `groupSize(Integer groupSize)`

    グループごとに返す結果の数です。

- `strictGroupSize(Boolean strictGroupSize)`

    グループサイズを厳密に適用するかどうかです。

- `functionScore(FunctionScore functionScore)`

    カスタムスコアリング用の FunctionScore オブジェクトです。

- `ranker(CreateCollectionReq.Function ranker)`

    **非推奨。** 検索結果に適用される単一の再ランキング関数です。`functionScore()` を優先してください。

**戻り値の型:**

*SearchResp*

**戻り値:**

すべてのクエリベクトルからのマージ結果を含み、再ランキング戦略に従って並べられた **SearchResp** オブジェクトです。

**パラメーター:**

- **searchResults** (*List&lt;List&lt;SearchResult&gt;&gt;*) -

    クエリベクトルごとに 1 つずつ含まれる検索結果バッチのリストです。各バッチには、次のフィールドを持つ **SearchResult** エントリが含まれます。

    - **id** (*Object*) -

        一致したエンティティの主キー値です。

    - **score** (*Float*) -

        再ランキング後の一致の関連性スコアです。

    - **entity** (*Map&lt;String,Object&gt;*) -

        一致したエンティティのフィールド名と値を含むマップです。

    - **primaryKey** (*String*) -

        主キーフィールドの名前です。

    - **highlightResults** (*Map&lt;String,HighlightResult&gt;*) -

        ハイライトが要求された場合の、フィールド名をキーとするハイライト結果です。

    - **elementOffset** (*Long*) -

        構造体配列の要素レベルの一致（`element_filter` 経由）の場合、配列内での一致した要素のインデックスです。通常の一致の場合は null です。

- **sessionTs** (*long*) -

    読み取りのセッションタイムスタンプです。

- **recalls** (*List&lt;Float&gt;*) -

    報告された場合の、各クエリベクトルの再現率です。

- **cost** (*Long*) -

    操作の時間コストです。

- **scannedRemoteBytes** (*Long*) -

    検索中にリモートでスキャンされたバイト数です。

- **scannedTotalBytes** (*Long*) -

    検索中にスキャンされた合計バイト数です。

- **cacheHitRatio** (*Float*) -

    検索のキャッシュヒット率です。

- **aggregationBuckets** (*List&lt;List&lt;AggregationBucket&gt;&gt;*) -

    集計が要求された場合の、クエリベクトルごとにグループ化された集計バケットです。

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合に、この例外が送出されます。

## 例\{#example}

```java
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.request.FunctionScore;
import io.milvus.v2.service.vector.request.ranker.WeightedRanker;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.common.ConsistencyLevel;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

// Build ANN search requests for multiple vector fields
List<AnnSearchReq> searchRequests = new ArrayList<>();
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("float_vector")
        .vectors(floatVectors)
        .params("{\"nprobe\": 10}")
        .limit(10)
        .build());
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("binary_vector")
        .vectors(binaryVectors)
        .limit(50)
        .build());
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("sparse_vector")
        .vectors(sparseVectors)
        .limit(100)
        .build());

// Hybrid search with WeightedRanker via FunctionScore
SearchResp searchResp = client.hybridSearch(HybridSearchReq.builder()
        .collectionName("my_collection")
        .searchRequests(searchRequests)
        .functionScore(FunctionScore.builder()
                .addFunction(WeightedRanker.builder()
                        .weights(Arrays.asList(0.2f, 0.5f, 0.6f))
                        .build())
                .build())
        .limit(5)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build());

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```
