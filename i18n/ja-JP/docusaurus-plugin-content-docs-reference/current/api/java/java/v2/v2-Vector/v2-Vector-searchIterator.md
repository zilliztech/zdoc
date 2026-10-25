---
title: "searchIterator() | Java | v2"
slug: /java/java/v2-Vector-searchIterator
sidebar_label: "searchIterator()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、検索結果を反復処理するための検索イテレーターを返します。 | Java | v2"
type: docx
token: X7Ybdk6yRoVRPZxeHklct1i2n8c
sidebar_position: 8
keywords: 
  - LLM 評価
  - スパースベクトルと密ベクトル
  - 密ベクトル
  - Hierarchical Navigable Small Worlds
  - Zilliz
  - Zilliz Cloud
  - クラウド
  - searchIterator()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# searchIterator()

この操作は、検索結果を反復処理するための検索イテレーターを返します。

```java
public SearchIterator searchIterator(SearchIteratorReq request)
```

## リクエスト構文\{#request-syntax}

```java
searchIterator(SearchIteratorReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .partitionNames(List<String> partitionNames)
    .vectorFieldName(String vectorFieldName)
    .metricType(IndexParam.MetricType metricType)
    .topK(int topK)
    .limit(long limit)
    .expr(String expr)
    .outputFields(List<String> outputFields)
    .vectors(List<BaseVector> vectors)
    .roundDecimal(int roundDecimal)
    .params(String params)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .ignoreGrowing(boolean ignoreGrowing)
    .groupByFieldName(String groupByFieldName)
    .batchSize(long batchSize)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトになります。

- `clusterId(String clusterId)`

    **非推奨です。** クエリ対象のクラスターの ID です。グローバルクラスターデプロイメントに適用されます。

- `collectionName(String collectionName)`

    対象のコレクションの名前です。

- `partitionNames(List<String> partitionNames)`

    対象とするパーティション名のリストです。

- `vectorFieldName(String vectorFieldName)`

    ベクトルフィールドの名前です。

- `metricType(IndexParam.MetricType metricType)`

    ベクトル間の類似度を測定するために使用するメトリクスタイプです。

- `topK(int topK)`

    返す上位結果の件数です。

- `limit(long limit)`

    返す結果の最大件数です。

- `expr(String expr)`

    結果をフィルタリングするためのブール式です。

- `outputFields(List<String> outputFields)`

    出力に含めるフィールド名のリストです。

- `vectors(List<BaseVector> vectors)`

    検索に使用するベクトルのリストです。

- `roundDecimal(int roundDecimal)`

    distance/score の丸めに使用する小数点以下の桁数です。

- `params(String params)`

    JSON 文字列として指定する追加の検索パラメーターです。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    操作の整合性レベルです。

- `ignoreGrowing(boolean ignoreGrowing)`

    操作中に増加中のセグメントを無視するかどうかです。

- `groupByFieldName(String groupByFieldName)`

    検索結果をグループ化するフィールド名です。

- `batchSize(long batchSize)`

    イテレーター操作のバッチサイズです。

**RETURN TYPE:**

*SearchIterator*

**RETURNS:**

検索結果を反復処理する **SearchIterator** オブジェクトです。このオブジェクトは以下のメソッドを提供します。

**PARAMETERS:**

- **next()** (*List&lt;QueryResultsWrapper.RowRecord&gt;*) -

    検索式に一致する結果の次のバッチを返します。

- **close()** -

    イテレーターと、そのカーソルが保持するリソースを解放します。

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.orm.iterator.SearchIterator;
import io.milvus.response.QueryResultsWrapper;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.vector.request.SearchIteratorReq;
import io.milvus.v2.service.vector.request.data.FloatVec;

import com.google.common.collect.Lists;
import java.util.Collections;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Iterator search
List<Float> vector = generateFloatVector();
SearchIterator searchIterator = client.searchIterator(SearchIteratorReq.builder()
        .collectionName("test")
        .outputFields(Lists.newArrayList("vector"))
        .batchSize(50L)
        .vectorFieldName("vector")
        .vectors(Collections.singletonList(new FloatVec(vector)))
        .expr("id > 100")
        .params("{\"range_filter\": 15.0, \"radius\": 20.0}")
        .topK(300)
        .metricType(IndexParam.MetricType.L2)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build());

System.out.println("SearchIteratorV1 results:");
while (true) {
    List<QueryResultsWrapper.RowRecord> res = searchIterator.next();
    if (res.isEmpty()) {
        System.out.println("Search iteration finished, close");
        searchIterator.close();
        break;
    }

    for (QueryResultsWrapper.RowRecord record : res) {
        System.out.println(record);
    }
}
```
