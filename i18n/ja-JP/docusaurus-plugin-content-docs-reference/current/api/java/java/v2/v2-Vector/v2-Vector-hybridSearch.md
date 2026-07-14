---
title: "hybridSearch() | Java | v2"
slug: /java/java/v2-Vector-hybridSearch
sidebar_label: "hybridSearch()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、collection に対してマルチベクトル検索を実行し、再ランキング後の検索結果を返します。 | Java | v2"
type: docx
token: R1NDdFPnVo4wTuxvHjFcozc8nMa
sidebar_position: 3
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - hybridSearch()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# hybridSearch()

この操作は、collection に対してマルチベクトル検索を実行し、再ランキング後の検索結果を返します。

```java
public SearchResp hybridSearch(HybridSearchReq request)
```

## リクエスト構文\{#request-syntax}

```java
hybridSearch(HybridSearchReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .clusterId(String clusterId)
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

**BUILDER メソッド:**

- `databaseName(String databaseName)`

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)`

    対象 collection の名前です。

- `clusterId(String clusterId)`

    この vector 読み取りリクエストの対象 cluster ID です。複数のリクエストで同じ cluster ID を共有する場合は、`session(String clusterId)` を使用します。

- `partitionNames(List<String> partitionNames)`

    対象とする partition 名のリストです。

- `searchRequests(List<AnnSearchReq> searchRequests)`

    hybrid search 用の AnnSearchReq オブジェクトのリストです。

- `topK(int topK)`

    返す上位結果の件数です。

- `limit(long limit)`

    返す結果の最大件数です。

- `outFields(List<String> outFields)`

    出力に含めるフィールド名のリストです。

- `offset(long offset)`

    返却前にスキップする結果数です。

- `roundDecimal(int roundDecimal)`

    距離/スコアの丸めに使用する小数点以下の桁数です。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    この操作の整合性レベルです。

- `groupByFieldName(String groupByFieldName)`

    検索結果をグループ化するためのフィールド名です。

- `groupSize(Integer groupSize)`

    グループごとに返す結果数です。

- `strictGroupSize(Boolean strictGroupSize)`

    グループサイズを厳密に適用するかどうかです。

- `functionScore(FunctionScore functionScore)`

    カスタムスコアリング用の FunctionScore オブジェクトです。

**戻り値:**

*SearchResp*

*SearchResp*

**例外:**

- **MilvusClientException**

    この操作の実行中に何らかのエラーが発生した場合、この例外が送出されます。

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

// 複数の vector フィールドに対する ANN 検索リクエストを構築
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

// FunctionScore を介した WeightedRanker によるハイブリッド検索
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
