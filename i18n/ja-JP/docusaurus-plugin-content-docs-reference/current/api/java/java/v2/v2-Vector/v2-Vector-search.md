---
title: "search() | Java | v2"
slug: /java/java/v2-Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、オプションの結果順序付け、集計リクエストとバケット、および実行メトリクスを使用してベクトル検索を実行します。 | Java | v2"
type: docx
token: ANw4d8gGEo46B4xxde3cC0xqndf
sidebar_position: 7
keywords: 
  - レキシカル検索
  - 最近傍検索
  - Agentic RAG
  - RAG LLM アーキテクチャ
  - zilliz
  - zilliz cloud
  - cloud
  - search()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# search()

この操作は、オプションの結果順序付け、集計リクエストとバケット、および実行メトリクスを使用してベクトル検索を実行します。

```java
public SearchResp search(SearchReq request)
```

## リクエスト構文\{#request-syntax}

```java
SearchReq.builder()
    .databaseName(databaseName)
    .collectionName(collectionName)
    .clusterId(clusterId)
    .partitionNames(partitionNames)
    .annsField(annsField)
    .topK(topK)
    .filter(filter)
    .outputFields(outputFields)
    .data(data)
    .ids(ids)
    .offset(offset)
    .limit(limit)
    .roundDecimal(roundDecimal)
    .searchParams(searchParams)
    .guaranteeTimestamp(guaranteeTimestamp)
    .gracefulTime(gracefulTime)
    .consistencyLevel(consistencyLevel)
    .ignoreGrowing(ignoreGrowing)
    .timezone(timezone)
    .orderByFields(orderByFields)
    .groupByFieldName(groupByFieldName)
    .groupSize(groupSize)
    .strictGroupSize(strictGroupSize)
    .functionScore(functionScore)
    .functionChains(functionChains)
    .filterTemplateValues(filterTemplateValues)
    .highlighter(highlighter)
    .searchAggregation(searchAggregation)
    .build();
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    データベースの名前です。省略した場合は、現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)`

    対象コレクションの名前です。

- `partitionNames(List<String> partitionNames)`

    検索するパーティションです。

- `annsField(String annsField)`

    近似最近傍探索に使用するベクトルフィールドです。

- `metricType(IndexParam.MetricType metricType)`

    ベクトル類似度を測定するために使用するメトリックタイプです。

- `topK(int topK)`

    サーバーに要求する最近傍候補の数です。

- `filter(String filter)`

    スカラーフィルタリング式です。

- `outputFields(List<String> outputFields)`

    各一致結果に含まれるエンティティフィールドです。

- `data(List<BaseVector> data)`

    クエリベクトルです。ids と一緒に使用しないでください。

- `ids(List<Object> ids)`

    保存済みベクトルをクエリベクトルとして使用する主キーです。data と一緒に使用しないでください。

- `offset(long offset)`

    スキップする一致結果の数です。

- `limit(long limit)`

    各クエリに対して返される一致結果の最大数です。

- `roundDecimal(int roundDecimal)`

    スコアの丸めに使用する小数点以下の桁数です。

- `searchParams(Map<String, Object> searchParams)`

    インデックス固有の検索パラメーターです。

- `guaranteeTimestamp(long guaranteeTimestamp)`

    非推奨の guarantee timestamp です。

- `gracefulTime(Long gracefulTime)`

    非推奨の graceful consistency window です。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    検索の整合性レベルです。

- `ignoreGrowing(boolean ignoreGrowing)`

    growing セグメントを無視するかどうかです。

- `timezone(String timezone)`

    時間式の解釈に使用するタイムゾーンです。

- `orderByFields(List<OrderByField> orderByFields)`

    検索結果の順序付けに使用するスカラーフィールドと方向です。

- `groupByFieldName(String groupByFieldName)`

    一致したエンティティをグループ化するために使用するフィールドです。

- `groupSize(Integer groupSize)`

    グループごとに返されるエンティティの最大数です。

- `strictGroupSize(Boolean strictGroupSize)`

    返されるすべてのグループに groupSize 個のエンティティを含める必要があるかどうかです。

- `functionScore(FunctionScore functionScore)`

    検索結果に適用されるスコアリング関数です。

- `ranker(CreateCollectionReq.Function ranker)`

    検索結果に適用される単一の再ランキング関数です。`functionScore()` または `functionChains()` と一緒に使用しないでください。

- `functionChains(List<FunctionChain> functionChains)`

    検索結果を後処理するために適用される関数チェーンです。関数チェーンと再ランキング（`ranker()`/`functionScore()`）は一緒に使用できません。FunctionChain を参照してください。

- `addFunctionChain(FunctionChain functionChain)`

    検索リクエストに 1 つの関数チェーンを追加します。関数チェーンと再ランキング（`ranker()`/`functionScore()`）は一緒に使用できません。FunctionChain を参照してください。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    フィルター式内のプレースホルダーに置換される値です。

- `highlighter(Highlighter highlighter)`

    返されるフィールドのテキストハイライト設定です。

- `searchAggregation(SearchAggregation searchAggregation)`

    集計フィールド、メトリクス、順序付け、トップヒット、およびネストされた集計設定です。

**RETURN TYPE:**

*SearchResp*

**RETURNS:**

検索結果、再現率、コスト、スキャンされたバイト数、キャッシュヒット率、および集計バケットを含みます。

**PARAMETERS:**

- **searchResults** (*List&lt;List&lt;SearchResult&gt;&gt;*) -

    検索結果バッチのリストです。クエリベクトルごとに 1 つあり、それぞれに以下のフィールドを持つ **SearchResult** エントリが含まれます。

- **id** (*Object*) -

    一致したエンティティの主キー値です。

- **score** (*Float*) -

    一致結果の関連性スコアです。

- **entity** (*Map&lt;String,Object&gt;*) -

    一致したエンティティのフィールド名と値を含むマップです。

- **primaryKey** (*String*) -

    主キーフィールドの名前です。

- **highlightResults** (*Map&lt;String,HighlightResult&gt;*) -

    ハイライトが要求された場合に、フィールド名をキーとするハイライト結果です。

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

    集計が要求された場合に、クエリベクトルごとにグループ化された集計バケットです。

**EXCEPTIONS:**

- **MilvusClientException**

    リクエストの検証、転送、またはサーバー実行が失敗した場合に発生します。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

Milvus に対する search() を示します。

```java
SearchResp response = client.search(SearchReq.builder()
    .collectionName("books")
    .clusterId(CLUSTER_ID)
    .data(Collections.singletonList(queryVector))
    .annsField("embedding")
    .searchAggregation(SearchAggregation.builder()
        .fields(Collections.singletonList("category"))
        .size(10)
        .build())
    .limit(10)
    .build());
```
