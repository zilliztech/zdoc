---
title: "クエリ | BYOC"
slug: /get-and-scalar-query
sidebar_key: get-and-scalar-query
sidebar_label: "クエリ"
beta: FALSE
notebook: FALSE
description: "ANN 検索に加えて、Zilliz Cloud はクエリによるメタデータフィルタリングもサポートしています。このページでは、Query、Get、QueryIterators を使用してエンティティの取得、メタデータのフィルタリング、クエリ結果の並べ替え、スカラー値の集計を行う方法を紹介します。 | BYOC"
type: origin
token: R7F7wY8pCiJ5Q4kbntxcMsE6nLf
sidebar_position: 8
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - data
  - get by id
  - query with filters
  - filtering

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クエリ

ANN 検索に加えて、Zilliz Cloud はクエリによるメタデータフィルタリングもサポートしています。このページでは、Query、Get、QueryIterators を使用してエンティティの取得、メタデータのフィルタリング、クエリ結果の並べ替え、スカラー値の集計を行う方法を紹介します。

<Admonition type="info" icon="📘" title="Notes">

<p>コレクション作成後に新しいフィールドを動的に追加した場合、これらのフィールドを含むクエリでは、値が明示的に設定されていないエンティティに対して定義済みのデフォルト値または NULL が返されます。詳細は <a href="./add-fields-to-an-existing-collection">既存コレクションへのフィールド追加</a> を参照してください。</p>

</Admonition>

## 概要\{#overview}

コレクションはさまざまなタイプのスカラーフィールドを保存できます。Zilliz Cloud に1つ以上のスカラーフィールドに基づいてエンティティをフィルタリングさせることができます。Zilliz Cloud は3種類のクエリを提供しています: Query、Get、および QueryIterator。下の表はこれら3つのクエリタイプを比較しています。

<table>
   <tr>
     <th></th>
     <th><p>Get</p></th>
     <th><p>Query</p></th>
     <th><p>QueryIterator</p></th>
   </tr>
   <tr>
     <td><p>適用シナリオ</p></td>
     <td><p>指定された主キーを持つエンティティを検索する場合。</p></td>
     <td><p>カスタムフィルタリング条件を満たすすべてまたは指定された数のエンティティを検索する場合</p></td>
     <td><p>ページネーションクエリでカスタムフィルタリング条件を満たすすべてのエンティティを検索する場合。</p></td>
   </tr>
   <tr>
     <td><p>フィルタリング方法</p></td>
     <td><p>主キーによる</p></td>
     <td><p>フィルタリング式による。</p></td>
     <td><p>フィルタリング式による。</p></td>
   </tr>
   <tr>
     <td><p>必須パラメータ</p></td>
     <td><ul><li><p>コレクション名</p></li><li><p>主キー</p></li></ul></td>
     <td><ul><li><p>コレクション名</p></li><li><p>フィルタリング式</p></li></ul></td>
     <td><ul><li><p>コレクション名</p></li><li><p>フィルタリング式</p></li><li><p>クエリごとに返すエンティティ数</p></li></ul></td>
   </tr>
   <tr>
     <td><p>オプションパラメータ</p></td>
     <td><ul><li><p>パーティション名</p></li><li><p>出力フィールド</p></li></ul></td>
     <td><ul><li><p>パーティション名</p></li><li><p>返すエンティティ数</p></li><li><p>出力フィールド</p></li></ul></td>
     <td><ul><li><p>パーティション名</p></li><li><p>合計で返すエンティティ数</p></li><li><p>出力フィールド</p></li></ul></td>
   </tr>
   <tr>
     <td><p>返却値</p></td>
     <td><p>指定されたコレクションまたはパーティション内で、指定された主キーを持つエンティティを返します。</p></td>
     <td><p>指定されたコレクションまたはパーティション内で、カスタムフィルタリング条件を満たすすべてまたは指定された数のエンティティを返します。</p></td>
     <td><p>ページネーションクエリを通じて、指定されたコレクションまたはパーティション内でカスタムフィルタリング条件を満たすすべてのエンティティを返します。</p></td>
   </tr>
</table>

メタデータフィルタリングの詳細については、[フィルタリング](./filtering)[フィルタリングの解説](./filtering-overview) を参照してください。

## Get の使用\{#use-get}

主キーでエンティティを検索する必要がある場合、**Get** メソッドを使用できます。以下のコード例では、コレクションに `id`、`vector`、`color` という3つのフィールドがあることを前提としています。

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

次のように、ID でエンティティを取得できます。

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

<TabItem value='java'>

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

<TabItem value='java'>

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

<TabItem value='java'>

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

## クエリの使用\{#use-query}

### 基本クエリ\{#basic-query}

カスタムフィルタリング条件でエンティティを検索する必要がある場合は、**Query** メソッドを使用します。以下のコード例では、`id`、`vector`、`color` という 3 つのフィールドが存在することを前提とし、`color` の値が `red` で始まる指定された数のエンティティを返します。

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

<TabItem value='java'>

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

<TabItem value='java'>

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

<TabItem value='java'>

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

### クエリ結果の並べ替え | PRIVATE\{#sort-query-results}

デフォルトでは、クエリは不定の順序で結果を返します。`order_by` パラメータを使用して、1 つ以上のスカラーフィールドで結果を並べ替えます。`order_by` を使用する際は、以下の点に注意してください：

- `order_by` は `limit` と一緒に使用する必要があります。

- サポートされているフィールド型：`INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、`DOUBLE`、および `VARCHAR`。ベクトル、`JSON`、または `ARRAY` フィールドによる並べ替えはサポートされていません。

- NULL 許容フィールドで並べ替える場合、昇順では NULL 値が末尾に配置され（NULLS LAST）、降順では先頭に配置されます（NULLS FIRST）。

#### 基本的な並べ替え\{#basic-sort}

`order_by` パラメータに `"field_name:direction"` 形式の文字列リストを渡します。ここで、`direction` は `asc`（昇順）または `desc`（降順）のいずれかです。`asc` と `desc` は大文字小文字を区別することに注意してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Sort results by id in ascending order
res = client.query(
    collection_name="my_collection",
    filter="color like \"red%\"",
    output_fields=["vector", "color"],
    limit=3,
    # highlight-next-line
    order_by=["id:asc"],
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

#### Multi-field Sort\{#multi-field-sort}

複数のフィールドで同時にソートできます。結果はまずリストの最初のフィールドで順序付けられます。そのフィールドの値が 2 つの行で同じ場合、2 番目のフィールドで順序が決定され、以降同様です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Sort by rating descending, then by price ascending for ties
res = client.query(
    collection_name="my_collection",
    filter="",
    output_fields=["color", "rating", "price"],
    limit=10,
    # highlight-next-line
    order_by=["rating:desc", "price:asc"],
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

#### Pagination with Sort\{#pagination-with-sort}

`order_by` を `limit` および `offset` と組み合わせて、ソートされた結果をページネーションできます。例えば、価格でソートされた製品リストを複数のページにわたって表示する場合、各ページは重複や欠落なく、正しい価格順序で次のバッチのアイテムを表示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Page 1
page1 = client.query(
    collection_name="my_collection",
    filter="color like \"red%\"",
    output_fields=["color", "price"],
    limit=5,
    offset=0,
    # highlight-next-line
    order_by=["price:asc"],
)

# Page 2
page2 = client.query(
    collection_name="my_collection",
    filter="color like \"red%\"",
    output_fields=["color", "price"],
    limit=5,
    offset=5,
    # highlight-next-line
    order_by=["price:asc"],
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

### クエリ結果の集計 | PRIVATE\{#aggregate-query-results}

クエリ結果を 1 つ以上のスカラーフィールドでグループ化し、グループごとに集計を計算できます。サポートされている集計演算子は `count`、`min`、`max`、`sum`、`avg` です。

`group_by_fields` を使用する際は、以下の点に注意してください：

- `group_by_fields` でサポートされるフィールド型は `INT8`、`INT16`、`INT32`、`INT64`、`VARCHAR`、`TIMESTAMPTZ` です。`FLOAT`、`DOUBLE`、ベクトル、`JSON`、`ARRAY` フィールドでのグループ化はエラーになります。

- `sum` と `avg` は数値型フィールドでのみ使用できます。`VARCHAR` フィールドに適用するとエラーになります。

集計を有効にするには、`query()` に `group_by_fields` を渡し、`output_fields` に集計式（`count(*)`、`count(<field>)`、`min(<field>)`、`max(<field>)`、`sum(<field>)`、`avg(<field>)`）を追加します。

次の例では、エンティティを `color` フィールドでグループ化し、各色グループ内のエンティティ数を返します：

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
    filter="",
    # highlight-start
    group_by_fields=["color"],
    output_fields=["color", "count(*)"],
    # highlight-end
)

# [{'color': 'red',    'count(*)': 10},
#  {'color': 'orange', 'count(*)': 10},
#  {'color': 'yellow', 'count(*)': 10},
#  {'color': 'green',  'count(*)': 10},
#  {'color': 'blue',   'count(*)': 10}]
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

1 回の呼び出しで複数の集計式を指定することもできます。次の例では `color` でグループ化し、各グループの行数、平均価格、最大評価を返します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.query(
    collection_name="my_collection",
    filter="",
    # highlight-start
    group_by_fields=["color"],
    output_fields=["color", "count(*)", "avg(price)", "max(rating)"],
    # highlight-end
)

# [{'color': 'red',    'count(*)': 10, 'avg(price)': 65.22, 'max(rating)': 5},
#  {'color': 'orange', 'count(*)': 10, 'avg(price)': 48.67, 'max(rating)': 5},
#  {'color': 'yellow', 'count(*)': 10, 'avg(price)': 64.15, 'max(rating)': 3},
#  {'color': 'green',  'count(*)': 10, 'avg(price)': 58.28, 'max(rating)': 5},
#  {'color': 'blue',   'count(*)': 10, 'avg(price)': 50.20, 'max(rating)': 5}]
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

`group_by_fields` に複数のフィールドを渡すことで、複合グループを計算できます。次の例では `(color, rating)` でグループ化し、各バケットの価格レンジを計算します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.query(
    collection_name="my_collection",
    filter="",
    # highlight-start
    group_by_fields=["color", "rating"],
    output_fields=["color", "rating", "min(price)", "max(price)"],
    # highlight-end
)

# [{'color': 'red',    'rating': 5, 'min(price)': 34.51, 'max(price)': 70.90},
#  {'color': 'orange', 'rating': 2, 'min(price)': 12.39, 'max(price)': 81.99},
#  {'color': 'yellow', 'rating': 2, 'min(price)': 22.62, 'max(price)': 88.24},
#  {'color': 'green',  'rating': 1, 'min(price)': 18.35, 'max(price)': 59.53},
#  {'color': 'blue',   'rating': 4, 'min(price)': 21.23, 'max(price)': 82.45},
#  ...]
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

`group_by_fields` を `limit` と組み合わせることで、返されるグループ数に上限を設定できます。これはフィールドのカーディナリティが高く、バケットのサンプルだけが必要な場合に有効です：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.query(
    collection_name="my_collection",
    filter="",
    group_by_fields=["color"],
    output_fields=["color", "avg(price)", "count(*)"],
    # highlight-next-line
    limit=5,
)

# [{'color': 'red',    'avg(price)': 65.22, 'count(*)': 10},
#  {'color': 'orange', 'avg(price)': 48.67, 'count(*)': 10},
#  {'color': 'yellow', 'avg(price)': 64.15, 'count(*)': 10},
#  {'color': 'green',  'avg(price)': 58.28, 'count(*)': 10},
#  {'color': 'blue',   'avg(price)': 50.20, 'count(*)': 10}]
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

## QueryIterator の使用\{#use-queryiterator}

カスタムのフィルタリング条件に基づいてエンティティを検索する必要があり、かつページネーションによるクエリを行う場合、**QueryIterator** を作成し、その **next()** メソッドを使用してすべてのエンティティを順に取得し、フィルタリング条件を満たすものを見つけます。以下のコード例では、`id`、`vector`、`color` という3つのフィールドが存在し、`color` フィールドの値が `red` で始まるすべてのエンティティを返すことを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
iterator = client.query_iterator(
    "my_collection",
    batch_size=10,
    filter="color like \"red%\"",
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
        .batchSize(10L)
        .outputFields(Collections.singletonList("color"))
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

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```bash
# Not available
```

</TabItem>
</Tabs>

## パーティションでのクエリ\{#queries-in-partitions}

Get、Query、または QueryIterator リクエストにパーティション名を含めることで、1つまたは複数のパーティション内でクエリを実行することもできます。以下のコード例では、コレクション内に **PartitionA** という名前のパーティションが存在すると仮定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.get(
    collection_name="my_collection",
    # highlight-next-line
    partitionNames=["partitionA"],
    ids=[10, 11, 12],
    output_fields=["vector", "color"]
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
iterator = client.query_iterator(
    "my_collection",
    partition_names=["partitionA"],
    batch_size=10,
    filter="color like \"red%\"",
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

<TabItem value='java'>

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

<TabItem value='java'>

```javascript
// Use get
var res = client.get({
    collection_name="my_collection",
    // highlight-next-line
    partition_names=["partitionA"],
    ids=[10,11,12],
    output_fields=["vector", "color"]
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

<TabItem value='java'>

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
    "id": [10, 11, 12],
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

## クエリによるランダムサンプリング\{#random-sampling-with-query}

データ探索や開発テストのためにコレクションから代表的なデータのサブセットを抽出するには、`RANDOM_SAMPLE(sampling_factor)` 式を使用します。ここで `sampling_factor` は 0 から 1 の間の浮動小数点数で、サンプリングするデータの割合を表します。

<Admonition type="info" icon="📘" title="Notes">

<p>詳細な使用方法、高度な例、およびベストプラクティスについては、<a href="./ramdom-sampling">ランダムサンプリング</a>を参照してください。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
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
import io.milvus.v2.service.vector.request.GetReq
import io.milvus.v2.service.vector.request.GetResp
import io.milvus.v2.service.vector.request.QueryReq
import io.milvus.v2.service.vector.request.QueryResp
import java.util.*;

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

<TabItem value='java'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

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

<TabItem value='java'>

```javascript
// node
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

## クエリのタイムゾーンを一時的に設定する\{#temporarily-set-a-timezone-for-a-query}

コレクションに `TIMESTAMPTZ` フィールドがある場合、クエリ呼び出しで `timezone` パラメータを設定することで、単一の操作に対してデータベースまたはコレクションのデフォルトタイムゾーンを一時的に上書きできます。これにより、操作中の `TIMESTAMPTZ` 値の表示方法と比較方法が制御されます。

`timezone` の値は、有効な [IANA タイムゾーン識別子](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)（例: **Asia/Shanghai**、**America/Chicago**、**UTC**）である必要があります。`TIMESTAMPTZ` フィールドの使用方法の詳細については、[TIMESTAMPTZ フィールド](./use-timestamptz-field) を参照してください。

以下の例は、クエリ操作のタイムゾーンを一時的に設定する方法を示しています:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Query data and display the tsz field converted to "America/Havana"
results = client.query(
    "my_collection",
    filter="id <= 10",
    output_fields=["id", "tsz", "vec"],
    limit=2,
    # highlight-next-line
    timezone="America/Havana",
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='java'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

