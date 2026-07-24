---
title: "query() | Java | v2"
slug: /java/java/v2-Vector-query
sidebar_label: "query()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "必要に応じた `orderByFields` による並べ替えを使用して、主キーまたはフィルターでエンティティをクエリします。 | Java | v2"
type: docx
token: U7eQdBzB0opJOXxRUcncnRDInSf
sidebar_position: 5
keywords: 
  - Chroma ベクトルデータベース
  - nlp 検索
  - llm ハルシネーション
  - マルチモーダル検索
  - zilliz
  - zilliz cloud
  - cloud
  - query()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# query()

主キーまたはフィルターでエンティティをクエリし、必要に応じて `orderByFields` による並べ替えを行います。

```java
public QueryResp query(QueryReq request)
```

## Request Syntax\{#request-syntax}

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

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    データベース名です。省略した場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)`

    対象のコレクション名です。

- `clusterId(String clusterId)`

    このリクエストの Zilliz Cloud クラスター ID です。

- `partitionNames(List<String> partitionNames)`

    クエリ対象のパーティションです。

- `outputFields(List<String> outputFields)`

    返される各行に含めるフィールドです。

- `ids(List<Object> ids)`

    クエリする主キー値です。

- `filter(String filter)`

    スカラー フィルタリング式です。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    クエリの整合性レベルです。

- `offset(long offset)`

    スキップする一致行数です。

- `limit(long limit)`

    返す行の最大数です。

- `ignoreGrowing(boolean ignoreGrowing)`

    growing セグメントを無視するかどうかです。

- `timezone(String timezone)`

    時間に関する式の解釈に使用されるタイムゾーンです。

- `orderByFields(List<OrderByField> orderByFields)`

    一致した行の並べ替えに使用するスカラー フィールドと方向です。

- `queryParams(Map<String, Object> queryParams)`

    追加のクエリパラメータです。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    フィルター式内のプレースホルダーに代入される値です。

**RETURNS:**

*QueryResp*

提供された場合は `orderByFields` に従って並べられたクエリ行を含みます。

**EXCEPTIONS:**

- **MilvusClientException**

    リクエストの検証、転送、またはサーバー実行に失敗した場合に発生します。正確な失敗理由については例外メッセージを確認してください。

## Example\{#example}

Zilliz Cloud クラスターに対する query() の使用例を示します。

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
