---
title: "search() | Java | v2"
slug: /java/java/v2-Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "オプションの結果順序付け、集計リクエストとバケット、および実行メトリクスを使用して vector search を実行します。 | Java | v2"
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

オプションの結果順序付け、集計リクエストとバケット、および実行メトリクスを使用して vector search を実行します。

```java
public SearchResp search(SearchReq request)
```

## Request Syntax\{#request-syntax}

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
    .filterTemplateValues(filterTemplateValues)
    .highlighter(highlighter)
    .searchAggregation(searchAggregation)
    .build();
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    データベース名です。省略した場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)`

    対象 collection の名前です。

- `clusterId(String clusterId)`

    このリクエストの Zilliz Cloud cluster ID です。

- `partitionNames(List<String> partitionNames)`

    検索する partition です。

- `annsField(String annsField)`

    近似最近傍探索に使用する vector field です。

- `topK(int topK)`

    サーバーに要求する最近傍候補の数です。

- `filter(String filter)`

    scalar フィルタリング式です。

- `outputFields(List<String> outputFields)`

    各一致結果に含まれる entity field です。

- `data(List<BaseVector> data)`

    クエリ vector です。ids と一緒に使用しないでください。

- `ids(List<Object> ids)`

    保存済み vector をクエリ vector として使用する主キーです。data と一緒に使用しないでください。

- `offset(long offset)`

    スキップする一致結果の数です。

- `limit(long limit)`

    各クエリに対して返される一致結果の最大数です。

- `roundDecimal(int roundDecimal)`

    スコアの丸めに使用する小数点以下の桁数です。

- `searchParams(Map<String, Object> searchParams)`

    index 固有の検索パラメータです。

- `guaranteeTimestamp(long guaranteeTimestamp)`

    非推奨の guarantee timestamp です。

- `gracefulTime(Long gracefulTime)`

    非推奨の graceful consistency window です。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    検索の整合性レベルです。

- `ignoreGrowing(boolean ignoreGrowing)`

    growing segment を無視するかどうかです。

- `timezone(String timezone)`

    時間に関する式の解釈に使用するタイムゾーンです。

- `orderByFields(List<OrderByField> orderByFields)`

    検索結果の順序付けに使用する scalar field と方向です。

- `groupByFieldName(String groupByFieldName)`

    一致した entity をグループ化するために使用する field です。

- `groupSize(Integer groupSize)`

    グループごとに返される entity の最大数です。

- `strictGroupSize(Boolean strictGroupSize)`

    返されるすべてのグループに groupSize 個の entity を含める必要があるかどうかです。

- `functionScore(FunctionScore functionScore)`

    検索結果に適用されるスコアリング関数です。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    filter 式内のプレースホルダーに置換される値です。

- `highlighter(Highlighter highlighter)`

    返される field のテキストハイライト設定です。

- `searchAggregation(SearchAggregation searchAggregation)`

    集計 field、メトリクス、順序付け、top hits、およびネストされた集計設定です。

**RETURNS:**

*SearchResp*

検索結果、recall、コスト、スキャンされたバイト数、キャッシュヒット率、および集計バケットを含みます。

**EXCEPTIONS:**

- **MilvusClientException**

    リクエストの検証、転送、またはサーバー実行が失敗した場合に発生します。正確な失敗理由については例外メッセージを確認してください。

## Example\{#example}

Zilliz Cloud cluster に対する search() を示します。

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
