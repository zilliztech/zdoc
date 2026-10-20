---
title: "queryIterator() | Java | v2"
slug: /java/java/v2-Vector-queryIterator
sidebar_label: "queryIterator()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、データを反復処理するクエリイテレーターを返します。 | Java | v2"
type: docx
token: HnxQdhvGQotpwfxgo4pcviKNn4g
sidebar_position: 6
keywords: 
  - ベクトルデータベースとは
  - ベクトルデータベースの比較
  - Faiss
  - 動画検索
  - zilliz
  - Zilliz Cloud
  - クラウド
  - queryIterator()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# queryIterator()

この操作は、データを反復処理するクエリイテレーターを返します。

```java
public QueryIterator queryIterator(QueryIteratorReq request)
```

## リクエスト構文\{#request-syntax}

```java
queryIterator(QueryIteratorReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
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
    .cursor(QueryIteratorCursor cursor)
    .filterTemplateValues(Map<String, Object> filterTemplateValues)
    .build()
);
```

**ビルダーメソッド：**

- `databaseName(String databaseName)`

    データベースの名前です。指定しない場合は、現在のデータベースがデフォルトになります。

- `collectionName(String collectionName)`

    対象のコレクションの名前です。

- `partitionNames(List<String> partitionNames)`

    対象とするパーティション名のリストです。

- `outputFields(List<String> outputFields)`

    出力に含めるフィールド名のリストです。

- `expr(String expr)`

    結果をフィルタリングするブール式です。

- `consistencyLevel(ConsistencyLevel consistencyLevel)`

    操作の整合性レベルです。

- `offset(long offset)`

    返す前にスキップする結果の数です。

- `limit(long limit)`

    返す結果の最大数です。

- `ignoreGrowing(boolean ignoreGrowing)`

    操作中に増加中のセグメントを無視するかどうかです。

- `timezone(String timezone)`

    時間関連のフィルターに使用するタイムゾーンの文字列です。

- `batchSize(long batchSize)`

    イテレーター操作のバッチサイズです。

- `reduceStopForBest(boolean reduceStopForBest)`

    最適な結果が見つかったときに反復処理を停止するかどうかです。

- `cursor(QueryIteratorCursor cursor)`

    ページネーションを再開するために、以前に取得したカーソルです。設定すると、イテレーターは最初からやり直すのではなく、カーソルのセッションタイムスタンプと位置から処理を続行します。その場合、`offset()` は無視されます。

- `filterTemplateValues(Map<String, Object> filterTemplateValues)`

    パラメーター化されたフィルター用のテンプレート変数値のマップです。

**戻り値の型：**

*QueryIterator*

**戻り値：**

クエリ結果をページごとに反復処理する **QueryIterator** オブジェクトです。次のメソッドを提供します：

**パラメーター：**

- **next()** (*List&lt;QueryResultsWrapper.RowRecord&gt;*) -

    クエリ式に一致する行の次のバッチを返します。

- **close()** -

    イテレーターと、そのカーソルが保持するリソースを解放します。

- **getCursor()** (*QueryIteratorCursor*) -

    反復処理の進行状況を保持するカーソルを返します。

**例外：**

- **MilvusClientException**

    この操作中にエラーが発生すると、この例外がスローされます。

## 例\{#example}

```java
import io.milvus.orm.iterator.QueryIterator;
import io.milvus.response.QueryResultsWrapper;
import io.milvus.v2.service.vector.request.QueryIteratorReq;
import io.milvus.v2.common.ConsistencyLevel;

import java.util.Arrays;
import java.util.List;

// Create a query iterator to retrieve results in batches
QueryIterator queryIterator = client.queryIterator(QueryIteratorReq.builder()
        .collectionName("my_collection")
        .expr("userID < 3000")
        .outputFields(Arrays.asList("userID", "userAge"))
        .batchSize(100)
        .offset(0)
        .limit(10000)
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build());

// Iterate through all results
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
