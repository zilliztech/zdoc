---
title: "クエリ | BYOC"
slug: /get-and-scalar-query
sidebar_label: "クエリ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ANN検索に加えて、Zilliz Cloudはクエリを通じたメタデータフィルタリングもサポートしています。このページでは、Query、Get、QueryIteratorを使用してメタデータフィルタリングを実行する方法を紹介します。 | BYOC"
type: origin
token: R7F7wY8pCiJ5Q4kbntxcMsE6nLf
sidebar_position: 7
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - idで取得
  - フィルター付きクエリ
  - フィルタリング
  - milvusの仕組み
  - Zillizベクトルデータベース
  - Zillizデータベース
  - 非構造化データ

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クエリ

ANN検索に加えて、Zilliz Cloudはクエリを通じたメタデータフィルタリングもサポートしています。このページでは、Query、Get、QueryIteratorを使用してメタデータフィルタリングを実行する方法を紹介します。

## 概要\{#overview}

コレクションはさまざまな種類のスカラーフィールドを格納できます。Zilliz Cloudでは、1つ以上のスカラーフィールドに基づいてエンティティをフィルターできます。Zilliz Cloudは3つのタイプのクエリを提供しています：Query、Get、QueryIterator。以下の表は、これらの3つのクエリタイプを比較しています。

<table>
   <tr>
     <th></th>
     <th><p>Get</p></th>
     <th><p>Query</p></th>
     <th><p>QueryIterator</p></th>
   </tr>
   <tr>
     <td><p>適用可能なシナリオ</p></td>
     <td><p>指定されたプライマリキーを持つエンティティを見つけるため。</p></td>
     <td><p>カスタムフィルター条件を満たすすべてまたは指定された数のエンティティを見つけるため。</p></td>
     <td><p>ページネーションクエリでカスタムフィルター条件を満たすすべてのエンティティを見つけるため。</p></td>
   </tr>
   <tr>
     <td><p>フィルタリング方法</p></td>
     <td><p>プライマリキーによる</p></td>
     <td><p>フィルタリング式による。</p></td>
     <td><p>フィルタリング式による。</p></td>
   </tr>
   <tr>
     <td><p>必須パラメータ</p></td>
     <td><ul><li><p>コレクション名</p></li><li><p>プライマリキー</p></li></ul></td>
     <td><ul><li><p>コレクション名</p></li><li><p>フィルタリング式</p></li></ul></td>
     <td><ul><li><p>コレクション名</p></li><li><p>フィルタリング式</p></li><li><p>クエリごとに返すエンティティ数</p></li></ul></td>
   </tr>
   <tr>
     <td><p>任意パラメータ</p></td>
     <td><ul><li><p>パーティション名</p></li><li><p>出力フィールド</p></li></ul></td>
     <td><ul><li><p>パーティション名</p></li><li><p>返すエンティティ数</p></li><li><p>出力フィールド</p></li></ul></td>
     <td><ul><li><p>パーティション名</p></li><li><p>合計で返すエンティティ数</p></li><li><p>出力フィールド</p></li></ul></td>
   </tr>
   <tr>
     <td><p>返すもの</p></td>
     <td><p>指定されたコレクションまたはパーティション内で指定されたプライマリキーを持つエンティティを返します。</p></td>
     <td><p>指定されたコレクションまたはパーティション内でカスタムフィルター条件を満たすすべてまたは指定された数のエンティティを返します。</p></td>
     <td><p>ページネーションクエリを通じて、指定されたコレクションまたはパーティション内でカスタムフィルター条件を満たすすべてのエンティティを返します。</p></td>
   </tr>
</table>

メタデータフィルタリングの詳細については、[フィルタリング](./filtering)[フィルタリングの説明](./filtering-overview)を参照してください。

## Getの使用\{#use-get}

プライマリキーでエンティティを検索する必要がある場合、**Get**メソッドを使用できます。以下のコード例では、コレクションに`id`、`vector`、`color`という名前の3つのフィールドがあると仮定しています。

```python
[
        {"id": 0, "vector": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], "color": "pink_8682"},
        {"id": 1, "vector": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], "color": "red_7025"},
        {"id": 2, "vector": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], "color": "orange_6781"},
        {"id": 3, "vector": [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], "color": "pink_9298"},
        {"id": 4, "vector": [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], "color": "red_4794"},
        {"id": 5, "vector": [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], "color": "yellow_4222"},
        {"id": 6, "vector": [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], "color": "red_9392"},
        {"id": 7, "vector": [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], "color": "grey_8510"},
        {"id": 8, "vector": [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], "color": "white_9381"},
        {"id": 9, "vector": [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], "color": "purple_4976"},
]
```

以下のようにしてIDでエンティティを取得できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

res = client.get(
    collection_name="my_collection",
    ids=[0, 1, 2],
    output_fields=["vector", "color"]
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.GetReq
import io.milvus.v2.service.vector.request.GetResp
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.*;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

GetReq getReq = GetReq.builder()
        .collectionName("my_collection")
        .ids(Arrays.asList(0, 1, 2))
        .outputFields(Arrays.asList("vector", "color"))
        .build();

GetResp getResp = client.get(getReq);

List<QueryResp.QueryResult> results = getResp.getGetResults();
for (QueryResp.QueryResult result : results) {
    System.out.println(result.getEntity());
}

// Output
// {color=pink_8682, vector=[0.35803765, -0.6023496, 0.18414013, -0.26286206, 0.90294385], id=0}
// {color=red_7025, vector=[0.19886813, 0.060235605, 0.6976963, 0.26144746, 0.8387295], id=1}
// {color=orange_6781, vector=[0.43742132, -0.55975026, 0.6457888, 0.7894059, 0.20785794], id=2}
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

resultSet, err := client.Get(ctx, milvusclient.NewQueryOption("my_collection").
    WithConsistencyLevel(entity.ClStrong).
    WithIDs(column.NewColumnInt64("id", []int64{0, 1, 2})).
    WithOutputFields("vector", "color"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println("id: ", resultSet.GetColumn("id").FieldData().GetScalars())
fmt.Println("vector: ", resultSet.GetColumn("vector").FieldData().GetVectors())
fmt.Println("color: ", resultSet.GetColumn("color").FieldData().GetScalars())
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

const res = client.get({
    collection_name="my_collection",
    ids=[0,1,2],
    output_fields=["vector", "color"]
})
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/get" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "id": [0, 1, 2],
    "outputFields": ["vector", "color"]
}'

# {"code":0,"cost":0,"data":[{"color":"pink_8682","id":0,"vector":[0.35803765,-0.6023496,0.18414013,-0.26286206,0.90294385]},{"color":"red_7025","id":1,"vector":[0.19886813,0.060235605,0.6976963,0.26144746,0.8387295]},{"color":"orange_6781","id":2,"vector":[0.43742132,-0.55975026,0.6457888,0.7894059,0.20785794]}]}
```

</TabItem>
</Tabs>

## Queryの使用\{#use-query}

カスタムフィルター条件でエンティティを検索する必要がある場合は、**Query**メソッドを使用します。以下のコード例では、`id`、`vector`、`color`という名前の3つのフィールドがあり、`color`値が`red`で始まる指定された数のエンティティを返すと仮定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

res = client.query(
    collection_name="my_collection",
    filter="color like \"red%\"",
    output_fields=["vector", "color"],
    limit=3
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq
import io.milvus.v2.service.vector.request.QueryResp

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("color like \"red%\"")
        .outputFields(Arrays.asList("vector", "color"))
        .limit(3)
        .build();

QueryResp queryResp = client.query(queryReq);

List<QueryResp.QueryResult> results = queryResp.getQueryResults();
for (QueryResp.QueryResult result : results) {
    System.out.println(result.getEntity());
}

// Output
// {color=red_7025, vector=[0.19886813, 0.060235605, 0.6976963, 0.26144746, 0.8387295], id=1}
// {color=red_4794, vector=[0.44523495, -0.8757027, 0.82207793, 0.4640629, 0.3033748], id=4}
// {color=red_9392, vector=[0.8371978, -0.015764369, -0.31062937, -0.56266695, -0.8984948], id=6}
```

</TabItem>

<TabItem value='go'>

```go
resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("color like \"red%\"").
    WithOutputFields("vector", "color"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println("id: ", resultSet.GetColumn("id").FieldData().GetScalars())
fmt.Println("vector: ", resultSet.GetColumn("vector").FieldData().GetVectors())
fmt.Println("color: ", resultSet.GetColumn("color").FieldData().GetScalars())

```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

const res = client.query({
    collection_name="my_collection",
    filter='color like "red%"',
    output_fields=["vector", "color"],
    limit(3)
})
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "filter": "color like \"red%\"",
    "limit": 3,
    "outputFields": ["vector", "color"]
}'
#{"code":0,"cost":0,"data":[{"color":"red_7025","id":1,"vector":[0.19886813,0.060235605,0.6976963,0.26144746,0.8387295]},{"color":"red_4794","id":4,"vector":[0.44523495,-0.8757027,0.82207793,0.4640629,0.3033748]},{"color":"red_9392","id":6,"vector":[0.8371978,-0.015764369,-0.31062937,-0.56266695,-0.8984948]}]}
```

</TabItem>
</Tabs>

## QueryIteratorの使用\{#use-queryiterator}

ページネーションクエリを通じてカスタムフィルター条件でエンティティを検索する場合は、**QueryIterator**を作成し、その**next()**メソッドを使用してすべてのエンティティを反復処理し、フィルター条件を満たすエンティティを見つけます。以下のコード例では、`id`、`vector`、`color`という名前の3つのフィールドがあり、`color`値が`red`で始まるすべてのエンティティを返すと仮定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import connections, Collection

connections.connect(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

collection = Collection("my_collection")

iterator = collection.query_iterator(
    batch_size=10,
    expr="color like \"red%\"",
    output_fields=["color"]
)

results = []

while True:
    result = iterator.next()
    if not result:
        iterator.close()
        break

    print(result)
    results += result
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.orm.iterator.QueryIterator;
import io.milvus.response.QueryResultsWrapper;
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.vector.request.QueryIteratorReq;

QueryIteratorReq req = QueryIteratorReq.builder()
        .collectionName("my_collection")
        .expr("color like \"red%\"")
        .batchSize(50L)
        .outputFields(Collections.singletonList("color"))
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build();
QueryIterator queryIterator = client.queryIterator(req);

while (true) {
    List<QueryResultsWrapper.RowRecord> res = queryIterator.next();
    if (res.isEmpty()) {
        queryIterator.close();
        break;
    }

    for (QueryResultsWrapper.RowRecord record : res) {
        System.out.println(record);
    }
}

// Output
// [color:red_7025, id:1]
// [color:red_4794, id:4]
// [color:red_9392, id:6]
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const iterator = await milvusClient.queryIterator({
  collection_name: 'my_collection',
  batchSize: 10,
  expr: 'color like "red%"',
  output_fields: ['color'],
});

const results = [];
for await (const value of iterator) {
  results.push(...value);
  page += 1;
}
```

</TabItem>

<TabItem value='bash'>

```bash
# Not available
```

</TabItem>
</Tabs>

## パーティション内でのクエリ\{#queries-in-partitions}

Get、Query、またはQueryIteratorリクエストにパーティション名を含めることで、1つまたは複数のパーティション内でクエリを実行することもできます。以下のコード例では、コレクションに**PartitionA**という名前のパーティションがあると仮定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

res = client.get(
    collection_name="my_collection",
    # highlight-next-line
    partitionNames=["partitionA"],
    ids=[10, 11, 12],
    output_fields=["vector", "color"]
)

from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

res = client.query(
    collection_name="my_collection",
    # highlight-next-line
    partitionNames=["partitionA"],
    filter="color like \"red%\"",
    output_fields=["vector", "color"],
    limit=3
)

# Use QueryIterator
from pymilvus import connections, Collection

connections.connect(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

collection = Collection("my_collection")

iterator = collection.query_iterator(
    # highlight-next-line
    partition_names=["partitionA"],
    batch_size=10,
    expr="color like \"red%\"",
    output_fields=["color"]
)

results = []

while True:
    result = iterator.next()
    if not result:
        iterator.close()
        break

    print(result)
    results += result
```

</TabItem>

<TabItem value='java'>

```java
GetReq getReq = GetReq.builder()
        .collectionName("my_collection")
        .partitionName("partitionA")
        .ids(Arrays.asList(10, 11, 12))
        .outputFields(Collections.singletonList("color"))
        .build();

GetResp getResp = client.get(getReq);

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .partitionNames(Collections.singletonList("partitionA"))
        .filter("color like \"red%\"")
        .outputFields(Collections.singletonList("color"))
        .limit(3)
        .build();

QueryResp getResp = client.query(queryReq);

QueryIteratorReq req = QueryIteratorReq.builder()
        .collectionName("my_collection")
        .partitionNames(Collections.singletonList("partitionA"))
        .expr("color like \"red%\"")
        .batchSize(50L)
        .outputFields(Collections.singletonList("color"))
        .consistencyLevel(ConsistencyLevel.BOUNDED)
        .build();
QueryIterator queryIterator = client.queryIterator(req);
```

</TabItem>

<TabItem value='go'>

```go
resultSet, err := client.Get(ctx, milvusclient.NewQueryOption("my_collection").
    WithPartitions("partitionA").
    WithIDs(column.NewColumnInt64("id", []int64{10, 11, 12})).
    WithOutputFields("vector", "color"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println("id: ", resultSet.GetColumn("id").FieldData().GetScalars())
fmt.Println("vector: ", resultSet.GetColumn("vector").FieldData().GetVectors())
fmt.Println("color: ", resultSet.GetColumn("color").FieldData().GetScalars())

resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithPartitions("partitionA").
    WithFilter("color like \"red%\"").
    WithOutputFields("vector", "color"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println("id: ", resultSet.GetColumn("id").FieldData().GetScalars())
fmt.Println("vector: ", resultSet.GetColumn("vector").FieldData().GetVectors())
fmt.Println("color: ", resultSet.GetColumn("color").FieldData().GetScalars())
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// Use get
var res = client.query({
    collection_name="my_collection",
    // highlight-next-line
    partition_names=["partitionA"],
    filter='color like "red%"',
    output_fields=["vector", "color"],
    limit(3)
})

// Use query
res = client.query({
    collection_name="my_collection",
    // highlight-next-line
    partition_names=["partitionA"],
    filter="color like \"red%\"",
    output_fields=["vector", "color"],
    limit(3)
})

// Use queryiterator
const iterator = await milvusClient.queryIterator({
  collection_name: 'my_collection',
  partition_names: ['partitionA'],
  batchSize: 10,
  expr: 'color like "red%"',
  output_fields: ['vector', 'color'],
});

const results = [];
for await (const value of iterator) {
  results.push(...value);
  page += 1;
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# Use get
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/get" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionNames": ["partitionA"],
    "id": [0, 1, 2],
    "outputFields": ["vector", "color"]
}'

# Use query
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/get" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection",
    "partitionNames": ["partitionA"],
    "filter": "color like \"red%\"",
    "limit": 3,
    "outputFields": ["vector", "color"],
    "id": [0, 1, 2]
}'
```

</TabItem>
</Tabs>

## Queryでのランダムサンプリング\{#random-sampling-with-query}

データ探索や開発テストのためにコレクションから代表的なデータのサブセットを抽出するには、`RANDOM_SAMPLE(sampling_factor)`式を使用します。`sampling_factor`は、0から1の間の浮動小数点数で、サンプルするデータの割合を表します。

<Admonition type="info" icon="📘" title="注釈">

<p>詳細な使用方法、高度な例、およびベストプラクティスについては、<a href="./ramdom-sampling">ランダムサンプリング</a>を参照してください。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Sample 1% of the entire collection
res = client.query(
    collection_name="my_collection",
    # highlight-next-line
    filter="RANDOM_SAMPLE(0.01)",
    output_fields=["vector", "color"]
)

print(f"Sampled {len(res)} entities from collection")

# Combine with other filters - first filter, then sample
res = client.query(
    collection_name="my_collection",
    # highlight-next-line
    filter="color like \"red%\" AND RANDOM_SAMPLE(0.005)",
    output_fields=["vector", "color"],
    limit=10
)

print(f"Found {len(res)} red items in sample")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.GetReq
import io.milvus.v2.service.vector.request.GetResp
import io.milvus.v2.service.vector.request.QueryReq
import io.milvus.v2.service.vector.request.QueryResp
import java.util.*;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("RANDOM_SAMPLE(0.01)")
        .outputFields(Arrays.asList("vector", "color"))
        .build();

QueryResp getResp = client.query(queryReq);
for (QueryResp.QueryResult result : getResp.getQueryResults()) {
    System.out.println(result.getEntity());
}

queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("color like \"red%\" AND RANDOM_SAMPLE(0.005)")
        .outputFields(Arrays.asList("vector", "color"))
        .limit(10)
        .build();

getResp = client.query(queryReq);
for (QueryResp.QueryResult result : getResp.getQueryResults()) {
    System.out.println(result.getEntity());
}
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    return err
}

resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("RANDOM_SAMPLE(0.01)").
    WithOutputFields("vector", "color"))
if err != nil {
    return err
}

resultSet, err = client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("color like \"red%\" AND RANDOM_SAMPLE(0.005)").
    WithLimit(10).
    WithOutputFields("vector", "color"))
if err != nil {
    return err
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>
