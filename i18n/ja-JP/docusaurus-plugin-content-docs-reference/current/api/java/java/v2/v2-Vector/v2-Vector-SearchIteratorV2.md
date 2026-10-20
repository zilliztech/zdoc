---
title: "SearchIteratorV2() | Java | v2"
slug: /java/java/v2-Vector-SearchIteratorV2
sidebar_label: "SearchIteratorV2()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作では、検索結果を反復処理するためのイテレーターを作成します。検索結果に大量のデータが含まれる場合に特に便利です。 | Java | v2"
type: docx
token: ZouQdklUsoSZEDxWkJvc90pvnmg
sidebar_position: 11
keywords: 
  - ベクトルデータベース比較
  - OpenAI ベクトルデータベース
  - 自然言語処理データベース
  - 低コストなベクトルデータベース
  - zilliz
  - Zilliz Cloud
  - クラウド
  - SearchIteratorV2()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# SearchIteratorV2()

この操作では、検索結果を反復処理するためのイテレーターを作成します。これは、検索結果に大量のデータが含まれる場合に特に便利です。

```java
public SearchIteratorV2 searchIteratorV2(SearchIteratorReqV2 request)
```

## リクエスト構文\{#request-syntax}

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

**ビルダーメソッド:**

- `databaseName(String databaseName)`

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)`

    対象のコレクションの名前です。

- `clusterId(String clusterId)`

    このベクトル読み取りリクエストの対象クラスター ID です。複数のリクエストで同じクラスター ID を共有する場合は、`session(String clusterId)` を使用します。

- `partitionNames(List<String> partitionNames)`

    対象とするパーティション名のリストです。

- `vectorFieldName(String vectorFieldName)`

    検索するベクトルフィールドの名前です。

- `topK(int topK)`

    返す上位結果の数です。

- `limit(long limit)`

    返す結果の最大数です。

- `filter(String filter)`

    結果をフィルターするためのブール式です。

- `outputFields(List<String> outputFields)`

    出力に含めるフィールド名のリストです。

- `vectors(List<BaseVector> vectors)`

    検索に使用するベクトルのリストです。

- `roundDecimal(int roundDecimal)`

    distance/score の丸めに使用する小数点以下の桁数です。

- `searchParams(Map<String, Object> searchParams)`

    キーと値のペアとして指定する追加の検索パラメーターです。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    操作の整合性レベルです。

- `ignoreGrowing(boolean ignoreGrowing)`

    操作中に Growing セグメントを無視するかどうかです。

- `timezone(String timezone)`

    時間に関連するフィルターに使用するタイムゾーン文字列です。

- `groupByFieldName(String groupByFieldName)`

    検索結果をグループ化するフィールド名です。

- `batchSize(long batchSize)`

    イテレーター操作のバッチサイズです。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    パラメーター化されたフィルターのテンプレート変数値のマップです。

**戻り値の型:**

*SearchIteratorV2*

**戻り値:**

検索結果を反復処理するために使用できる **SearchIteratorV2** イテレーターです。

**パラメーター:**

- **searchIterator** (*SearchIteratorV2*) -

    この操作から返されるイテレーターインスタンスです。次のバッチ結果を取得するには `next()` を呼び出します。空のリストが返されたら、`close()` を呼び出してイテレーターを解放します。

**例外:**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

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
