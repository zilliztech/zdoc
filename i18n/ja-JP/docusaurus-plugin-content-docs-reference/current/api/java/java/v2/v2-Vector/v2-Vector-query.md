---
title: "query() | Java | v2"
slug: /java/java/v2-Vector-query
sidebar_label: "query()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "`orderByFields` による任意の並び替えを使用して、主キーまたはフィルターでエンティティをクエリします。 | Java | v2"
type: docx
token: U7eQdBzB0opJOXxRUcncnRDInSf
sidebar_position: 5
keywords: 
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - Multimodal search
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

`orderByFields` による任意の並び替えを使用して、主キーまたはフィルターでエンティティをクエリします。

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

    データベースの名前です。省略した場合は現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)`

    対象の collection の名前です。

- `clusterId(String clusterId)`

    このリクエストの Zilliz Cloud cluster ID です。

- `partitionNames(List<String> partitionNames)`

    クエリ対象の partition です。

- `outputFields(List<String> outputFields)`

    返される各行に含めるフィールドです。

- `ids(List<Object> ids)`

    クエリする主キー値です。

- `filter(String filter)`

    scalar フィルタリング式です。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    クエリの整合性レベルです。

- `offset(long offset)`

    スキップする一致行数です。

- `limit(long limit)`

    返す最大行数です。

- `ignoreGrowing(boolean ignoreGrowing)`

    growing segment を無視するかどうかです。

- `timezone(String timezone)`

    時刻関連の式を解釈するために使用するタイムゾーンです。

- `orderByFields(List<OrderByField> orderByFields)`

    一致した行を並び替えるために使用する scalar フィールドと方向です。

- `queryParams(Map<String, Object> queryParams)`

    追加のクエリパラメータです。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    フィルター式内のプレースホルダーに代入される値です。

**RETURNS:**

*QueryResp*

提供された場合、orderByFields に従って並び替えられたクエリ行を含みます。

**EXCEPTIONS:**

- **MilvusClientException**

    リクエストの検証、トランスポート、またはサーバー実行が失敗したときに発生します。正確な失敗理由については、例外メッセージを確認してください。

## Example\{#example}

Zilliz Cloud cluster に対する query() を示します。

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
