---
title: "query() | Java | v2"
slug: /java/java/v2-Vector-query
sidebar_label: "query()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、指定されたブール式を使用してスカラーフィルタリングを実行します。 | Java | v2"
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

この操作は、指定されたブール式を使用してスカラーフィルタリングを実行します。

```java
public QueryResp query(QueryReq request)
```

## リクエスト構文\{#request-syntax}

```java
query(QueryReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .clusterId(String clusterId)
    .partitionNames(List<String> partitionNames)
    .outputFields(List<String> outputFields)
    .ids(List<Object> ids)
    .filter(String filter)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .offset(long offset)
    .limit(long limit)
    .ignoreGrowing(boolean ignoreGrowing)
    .timezone(String timezone)
    .queryParams(Map<String, Object> queryParams)
    .filterTemplateValues(Map<String, Object> filterTemplateValues)
    .build()
);
```

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    データベース名です。指定しない場合、現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)`

    対象のコレクション名です。

- `clusterId(String clusterId)`

    このベクトル読み取りリクエストの対象クラスター ID です。複数のリクエストで同じクラスター ID を共有する場合は、`session(String clusterId)` を使用します。

- `partitionNames(List<String> partitionNames)`

    対象とするパーティション名のリストです。

- `outputFields(List<String> outputFields)`

    出力に含めるフィールド名のリストです。

- `ids(List<Object> ids)`

    特定のエンティティを識別するための主キー値のリストです。

- `filter(String filter)`

    結果をフィルタリングするためのブール式です。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    この操作の整合性レベルです。

- `offset(long offset)`

    返却前にスキップする結果の数です。

- `limit(long limit)`

    返却する結果の最大数です。

- `ignoreGrowing(boolean ignoreGrowing)`

    操作中に growing セグメントを無視するかどうかを指定します。

- `timezone(String timezone)`

    時刻関連のフィルターに使用するタイムゾーン文字列です。

- `queryParams(Map<String, Object> queryParams)`

    キーと値のペアとして指定する追加のクエリパラメータです。デフォルトは `new HashMap<>()` です。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    パラメータ化されたフィルター用のテンプレート変数値のマップです。

**戻り値:**

*QueryResp*

指定された出力フィールドを持つ特定のクエリ結果を表す **QueryResp** オブジェクト

**例外:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合に、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Query by filter "id < 10"
QueryReq queryReq = QueryReq.builder()
        .collectionName("test")
        .filter("id < 10")
        .build();
QueryResp queryResp = client.query(queryReq);
for (QueryResp.QueryResult result : queryResp.getGetResults()) {
    System.out.println(result.getEntity());
}
```
