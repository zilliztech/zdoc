---
title: "query() | Java | v2"
slug: /java/java/v2-Vector-query
sidebar_label: "query()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、主キーまたはフィルターでエンティティをクエリします。`orderByFields` を使用して任意で並べ替えることもできます。 | Java | v2"
type: docx
token: U7eQdBzB0opJOXxRUcncnRDInSf
sidebar_position: 5
keywords: 
  - Chroma ベクトルデータベース
  - NLP 検索
  - LLM ハルシネーション
  - マルチモーダル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - query()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# query()

この操作では、主キーまたはフィルターでエンティティをクエリします。`orderByFields` を使用して任意で並べ替えることもできます。

```java
public QueryResp query(QueryReq request)
```

## リクエスト構文\{#request-syntax}

```java
QueryReq.builder()
    .databaseName(databaseName)
    .collectionName(collectionName)
    .clusterId(clusterId)
    .partitionNames(partitionNames)
    .outputFields(outputFields)
    .ids(ids)
    .filter(filter)
    .consistencyLevel(consistencyLevel)
    .offset(offset)
    .limit(limit)
    .ignoreGrowing(ignoreGrowing)
    .timezone(timezone)
    .orderByFields(orderByFields)
    .queryParams(queryParams)
    .filterTemplateValues(filterTemplateValues)
    .build();
```

**ビルダーメソッド：**

- `databaseName(String databaseName)`

    データベースの名前です。省略した場合は、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)`

    対象コレクションの名前です。

- `partitionNames(List<String> partitionNames)`

    クエリ対象のパーティションです。

- `outputFields(List<String> outputFields)`

    返される各行に含めるフィールドです。

- `ids(List<Object> ids)`

    クエリ対象の主キー値です。

- `filter(String filter)`

    スカラーフィルター式です。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    クエリの整合性レベルです。

- `offset(long offset)`

    スキップする一致行の数です。

- `limit(long limit)`

    返される行の最大数です。

- `ignoreGrowing(boolean ignoreGrowing)`

    増加中のセグメントを無視するかどうかです。

- `timezone(String timezone)`

    時間式を解釈するために使用するタイムゾーンです。

- `orderByFields(List<OrderByField> orderByFields)`

    一致行の並べ替えに使用するスカラーフィールドと方向です。

- `queryParams(Map<String, Object> queryParams)`

    追加のクエリパラメーターです。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    フィルター式内のプレースホルダーに代入される値です。

**戻り値の型：**

*QueryResp*

**戻り値：**

指定した場合は orderByFields に従って並べ替えられたクエリ行と、実行メトリクス（`getCost()`、`getScannedRemoteBytes()`、`getScannedTotalBytes()`、`getCacheHitRatio()`）を含みます。構造体配列の要素レベルのクエリ（`element_filter` を使用）では、返される各 `QueryResult` に、一致した要素のインデックスが `getElementOffset()` を通じて含まれます。

**パラメーター：**

- **queryResults** (*List&lt;QueryResp.QueryResult&gt;*) -

    クエリ結果のリストです。各結果には以下のフィールドが含まれます。

- **entity** (*Map&lt;String,Object&gt;*) -

    一致したエンティティのフィールド名と値を含むマップです。

- **elementOffset** (*Long*) -

    構造体配列の要素レベルのクエリでは、配列内で一致した要素のインデックスです。通常のクエリでは null です。

- **sessionTs** (*long*) -

    読み取りのセッションタイムスタンプです。

- **cost** (*Long*) -

    操作の所要時間です。

- **scannedRemoteBytes** (*Long*) -

    クエリ中にリモートでスキャンされたバイト数です。

- **scannedTotalBytes** (*Long*) -

    クエリ中にスキャンされた合計バイト数です。

- **cacheHitRatio** (*Float*) -

    クエリのキャッシュヒット率です。

**例外：**

- **MilvusClientException**

    リクエストの検証、転送、またはサーバーでの実行に失敗した場合に発生します。正確な失敗理由については、例外メッセージを確認してください。

## 例\{#example}

Milvus に対して query() を使用する方法を示します。

```java
QueryResp response = client.query(QueryReq.builder()
    .collectionName("books")
    .clusterId(CLUSTER_ID)
    .orderByFields(Collections.singletonList(OrderByField.builder()
        .fieldName("published_year")
        .direction(AggDirection.DESC)
        .build()))
    .limit(10)
    .build());
```
