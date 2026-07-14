---
title: "search() | Java | v2"
slug: /java/java/v2-Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、オプションの scalar フィルタリング式を使用して vector 類似検索を実行します。 | Java | v2"
type: docx
token: ANw4d8gGEo46B4xxde3cC0xqndf
sidebar_position: 7
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - search()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# search()

この操作は、オプションの scalar フィルタリング式を使用して vector 類似検索を実行します。

```java
public SearchResp search(SearchReq request)
```

## リクエスト構文\{#request-syntax}

```java
search(SearchReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .clusterId(String clusterId)
    .partitionNames(List<String> partitionNames)
    .annsField(String annsField)
    .topK(int topK)
    .filter(String filter)
    .outputFields(List<String> outputFields)
    .data(List<BaseVector> data)
    .ids(List<Object> ids)
    .offset(long offset)
    .limit(long limit)
    .roundDecimal(int roundDecimal)
    .searchParams(Map<String, Object> searchParams)
    .guaranteeTimestamp(long guaranteeTimestamp)
    .gracefulTime(Long gracefulTime)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .ignoreGrowing(boolean ignoreGrowing)
    .timezone(String timezone)
    .groupByFieldName(String groupByFieldName)
    .groupSize(Integer groupSize)
    .strictGroupSize(Boolean strictGroupSize)
    .functionScore(FunctionScore functionScore)
    .filterTemplateValues(Map<String, Object> filterTemplateValues)
    .highlighter(Highlighter highlighter)
    .build()
);
```

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    データベース名。指定しない場合、現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)`

    対象 collection の名前。

- `clusterId(String clusterId)`

    この vector 読み取りリクエストの対象 cluster ID。複数のリクエストで同じ cluster ID を共有する場合は `session(String clusterId)` を使用します。

- `partitionNames(List<String> partitionNames)`

    対象とする partition 名のリスト。

- `annsField(String annsField)`

    近似最近傍探索に使用する vector フィールドの名前。

- `topK(int topK)`

    返す上位結果の件数。

- `filter(String filter)`

    結果をフィルタリングするためのブール式。

- `outputFields(List<String> outputFields)`

    出力に含めるフィールド名のリスト。

- `data(List<BaseVector> data)`

    JSON オブジェクトとして挿入/アップサートするデータ行のリスト。

- `ids(List<Object> ids)`

    特定のエンティティを識別するための主キー値のリスト。

- `offset(long offset)`

    返却前にスキップする結果数。

- `limit(long limit)`

    返す結果の最大数。

- `roundDecimal(int roundDecimal)`

    distance/score の丸めに使用する小数点以下の桁数。

- `searchParams(Map<String, Object> searchParams)`

    キーと値のペアとして指定する追加の検索パラメータ。

- `guaranteeTimestamp(long guaranteeTimestamp)`

    それ以前のすべての操作が可視であることを保証するタイムスタンプ。

- `gracefulTime(Long gracefulTime)`

    整合性のための猶予時間（ミリ秒）。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    この操作の整合性レベル。

- `ignoreGrowing(boolean ignoreGrowing)`

    操作中に growing セグメントを無視するかどうか。

- `timezone(String timezone)`

    時刻関連のフィルタに使用するタイムゾーン文字列。

- `groupByFieldName(String groupByFieldName)`

    検索結果をグループ化するフィールド名。

- `groupSize(Integer groupSize)`

    各グループごとに返す結果数。

- `strictGroupSize(Boolean strictGroupSize)`

    グループサイズを厳密に適用するかどうか。

- `functionScore(FunctionScore functionScore)`

    カスタムスコアリングのための FunctionScore オブジェクト。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    パラメータ化されたフィルタに使用するテンプレート変数値のマップ。

- `highlighter(Highlighter highlighter)`

    検索結果内のテキストをハイライトするための Highlighter オブジェクト。

**戻り値:**

*SearchResp*

*SearchResp*

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## 例\{#example}

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.FunctionScore;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.request.ranker.DecayRanker;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

// Build a DecayRanker to rerank results by field value proximity
DecayRanker decay = DecayRanker.builder()
        .name("birth_year_decay")
        .inputFieldNames(Collections.singletonList("birth_year"))
        .function("linear")
        .origin(1900)
        .scale(50)
        .offset(0)
        .decay(0.1)
        .build();

// Search with FunctionScore for reranking
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new EmbeddedText("Albert Darwin")))
        .limit(100)
        .outputFields(Arrays.asList("birth_year", "lifespan"))
        .functionScore(FunctionScore.builder()
        .addFunction(decay)
        .build())
        .build());

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```
