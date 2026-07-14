---
title: "queryIterator() | Java | v2"
slug: /java/java/v2-Vector-queryIterator
sidebar_label: "queryIterator()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "(placeholder) | Java | v2"
type: docx
token: HnxQdhvGQotpwfxgo4pcviKNn4g
sidebar_position: 6
keywords: 
  - vector データベースとは
  - vector データベースの比較
  - Faiss
  - 動画検索
  - zilliz
  - zilliz cloud
  - クラウド
  - queryIterator()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# queryIterator()

# queryIterator()\{#queryiterator}

このメソッドは、データを反復処理するための query iterator を返します。

```java
public QueryIterator queryIterator(QueryIteratorReq request)
```

## Request Syntax\{#request-syntax}

```java
queryIterator(QueryIteratorReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .clusterId(String clusterId)
    .partitionNames(List<String> partitionNames)
    .outputFields(List<String> outputFields)
    .expr(String expr)
    .consistencyLevel(ConsistencyLevel consistencyLevel)
    .offset(long offset)
    .limit(long limit)
    .ignoreGrowing(boolean ignoreGrowing)
    .timezone(String timezone)
    .batchSize(long batchSize)
    .reduceStopForBest(boolean reduceStopForBest)
    .filterTemplateValues(Map<String, Object> filterTemplateValues)
    .build()
);
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    データベース名。指定しない場合は、現在のデータベースがデフォルトで使用されます。

- `collectionName(String collectionName)`

    対象 collection の名前。

- `clusterId(String clusterId)`

    この vector 読み取りリクエストの対象 cluster ID。複数のリクエストで同じ cluster ID を共有する場合は、`session(String clusterId)` を使用します。

- `partitionNames(List<String> partitionNames)`

    対象とする partition 名のリスト。

- `outputFields(List<String> outputFields)`

    出力に含めるフィールド名のリスト。

- `expr(String expr)`

    結果をフィルタリングするためのブール式。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    操作の整合性レベル。

- `offset(long offset)`

    返却前にスキップする結果の数。

- `limit(long limit)`

    返す結果の最大数。

- `ignoreGrowing(boolean ignoreGrowing)`

    操作中に growing segment を無視するかどうか。

- `timezone(String timezone)`

    時刻関連のフィルターに使用するタイムゾーン文字列。

- `batchSize(long batchSize)`

    iterator 操作のバッチサイズ。

- `reduceStopForBest(boolean reduceStopForBest)`

    最良の結果が見つかった時点で反復を停止するかどうか。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    パラメータ化フィルター用のテンプレート変数値のマップ。

**RETURNS:**

*QueryIterator*

*QueryIterator*

**EXCEPTIONS:**

- **MilvusClientException**

    この操作中に何らかのエラーが発生した場合、この例外がスローされます。

## Example\{#example}

```java
import io.milvus.orm.iterator.QueryIterator;
import io.milvus.response.QueryResultsWrapper;
import io.milvus.v2.service.vector.request.QueryIteratorReq;
import io.milvus.v2.common.ConsistencyLevel;

import java.util.Arrays;
import java.util.List;

// バッチで結果を取得するための query iterator を作成
QueryIterator queryIterator = client.queryIterator(QueryIteratorReq.builder()
        .collectionName("my_collection")
        .expr("userID < 3000")
        .outputFields(Arrays.asList("userID", "userAge"))
        .batchSize(100)
        .offset(0)
        .limit(10000)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build());

// すべての結果を反復処理
int counter = 0;
while (true) {
    List<QueryResultsWrapper.RowRecord> res = queryIterator.next();
    if (res.isEmpty()) {
        queryIterator.close();
        break;
    }
    for (QueryResultsWrapper.RowRecord record : res) {
        System.out.println(record);
        counter++;
    }
}
System.out.printf("%d query results returned%n", counter);
```
