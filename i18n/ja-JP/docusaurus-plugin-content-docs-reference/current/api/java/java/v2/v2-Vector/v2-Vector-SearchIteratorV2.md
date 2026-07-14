---
title: "SearchIteratorV2() | Java | v2"
slug: /java/java/v2-Vector-SearchIteratorV2
sidebar_label: "SearchIteratorV2()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、検索結果を反復処理するためのイテレータを作成します。特に、検索結果に大量のデータが含まれる場合に便利です。 | Java | v2"
type: docx
token: ZouQdklUsoSZEDxWkJvc90pvnmg
sidebar_position: 11
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - SearchIteratorV2()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# SearchIteratorV2()

この操作では、検索結果を反復処理するためのイテレータを作成します。特に、検索結果に大量のデータが含まれる場合に便利です。

```java
public SearchIteratorV2 searchIteratorV2(SearchIteratorReqV2 request)
```

## Request Syntax\{#request-syntax}

```java
searchIteratorV2(SearchIteratorReqV2.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .clusterId(String clusterId)
    .partitionNames(List<String> partitionNames)
    .vectorFieldName(String vectorFieldName)
    .topK(int topK)
    .limit(long limit)
    .filter(String filter)
    .outputFields(List<String> outputFields)
    .vectors(List<BaseVector> vectors)
    .roundDecimal(int roundDecimal)
    .searchParams(Map<String, Object> searchParams)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .ignoreGrowing(boolean ignoreGrowing)
    .timezone(String timezone)
    .groupByFieldName(String groupByFieldName)
    .batchSize(long batchSize)
    .filterTemplateValues(Map<String, Object> filterTemplateValues)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    データベースの名前。指定しない場合は、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)`

    対象の collection の名前。

- `clusterId(String clusterId)`

    この vector 読み取りリクエストの対象 cluster ID。複数のリクエストで同じ cluster ID を共有する場合は `session(String clusterId)` を使用します。

- `partitionNames(List<String> partitionNames)`

    対象とする partition 名のリスト。

- `vectorFieldName(String vectorFieldName)`

    検索する vector フィールドの名前。

- `topK(int topK)`

    返される上位結果の数。

- `limit(long limit)`

    返される結果の最大数。

- `filter(String filter)`

    結果をフィルタリングするためのブール式。

- `outputFields(List<String> outputFields)`

    出力に含めるフィールド名のリスト。

- `vectors(List<BaseVector> vectors)`

    検索に使用する vector のリスト。

- `roundDecimal(int roundDecimal)`

    distance/score の丸めに使用する小数点以下の桁数。

- `searchParams(Map<String, Object> searchParams)`

    追加の検索パラメータ（キーと値のペア）。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    この操作の整合性レベル。

- `ignoreGrowing(boolean ignoreGrowing)`

    操作中に growing セグメントを無視するかどうか。

- `timezone(String timezone)`

    時間関連のフィルターに使用するタイムゾーン文字列。

- `groupByFieldName(String groupByFieldName)`

    検索結果をグループ化するフィールド名。

- `batchSize(long batchSize)`

    イテレータ操作のバッチサイズ。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    パラメータ化されたフィルター用のテンプレート変数値のマップ。

**RETURNS:**

*SearchIteratorV2*

*SearchIteratorV2*

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## Example\{#example}

```java
import io.milvus.orm.iterator.SearchIteratorV2;
import io.milvus.v2.service.vector.request.SearchIteratorReqV2;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.common.IndexParam;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

// Create a SearchIteratorV2 for paginated vector search.
// V2 is recommended over V1: 20-30% faster with better recall.
SearchIteratorV2 searchIterator = client.searchIteratorV2(SearchIteratorReqV2.builder()
        .collectionName("my_collection")
        .outputFields(Arrays.asList("userAge"))
        .batchSize(50)
        .vectorFieldName("userFace")
        .vectors(Collections.singletonList(new FloatVec(queryVector)))
        .filter("userAge > 10 && userAge < 20")
        .searchParams(new HashMap<>())
        .limit(120)
        .metricType(IndexParam.MetricType.L2)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build());

// Iterate through search results
int counter = 0;
while (true) {
    List<SearchResp.SearchResult> res = searchIterator.next();
    if (res.isEmpty()) {
        searchIterator.close();
        break;
    }
    for (SearchResp.SearchResult result : res) {
        System.out.println(result);
        counter++;
    }
}
System.out.printf("%d search results returned%n", counter);
```
