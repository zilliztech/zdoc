---
title: "Query | Cloud"
slug: /get-and-scalar-query
sidebar_label: "Query"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ANN 検索に加えて、MilvusZilliz Cloud はクエリによるメタデータフィルタリングもサポートしています。このページでは、Query、Get、QueryIterator を使用してメタデータフィルタリングを実行する方法を紹介します。 | Cloud"
type: origin
token: R7F7wY8pCiJ5Q4kbntxcMsE6nLf
sidebar_position: 9
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Query

ANN 検索に加えて、MilvusZilliz Cloud はクエリによるメタデータフィルタリングもサポートしています。このページでは、Query、Get、QueryIterators を使用してメタデータフィルタリングを実行する方法を紹介します。

<Admonition type="info" icon="📘" title="注意">

collection の作成後に新しいフィールドを追加した場合、それらのフィールドを含むクエリは、明示的に値が設定されていない entity に対して、定義されたデフォルト値または `NULL` を返します。詳細については、[Alter Collection Schema](./add-fields-to-an-existing-collection) を参照してください。

</Admonition>

## Overview\{#overview}

Collection にはさまざまな型の scalar フィールドを保存できます。Zilliz Cloud では、1 つ以上の scalar フィールドに基づいて Entities をフィルタリングできます。Zilliz Cloud では、Query、Get、QueryIterator の 3 種類のクエリを提供しています。以下の表では、これら 3 種類のクエリを比較しています。

<table>
   <tr>
     <th></th>
     <th><p>Get</p></th>
     <th><p>Query</p></th>
     <th><p>QueryIterator</p></th>
   </tr>
   <tr>
     <td><p>適用シナリオ</p></td>
     <td><p>指定した主キーを持つ entity を検索する場合。</p></td>
     <td><p>カスタムフィルタリング条件を満たすすべて、または指定数の entity を検索する場合</p></td>
     <td><p>カスタムフィルタリング条件を満たすすべての entity を、ページネーション付きクエリで検索する場合。</p></td>
   </tr>
   <tr>
     <td><p>フィルタリング方法</p></td>
     <td><p>主キーによる</p></td>
     <td><p>フィルタリング式による。</p></td>
     <td><p>フィルタリング式による。</p></td>
   </tr>
   <tr>
     <td><p>必須パラメータ</p></td>
     <td><ul><li><p>Collection 名</p></li><li><p>主キー</p></li></ul></td>
     <td><ul><li><p>Collection 名</p></li><li><p>フィルタリング式</p></li></ul></td>
     <td><ul><li><p>Collection 名</p></li><li><p>フィルタリング式</p></li><li><p>クエリごとに返す entity 数</p></li></ul></td>
   </tr>
   <tr>
     <td><p>オプションパラメータ</p></td>
     <td><ul><li><p>partition 名</p></li><li><p>出力フィールド</p></li></ul></td>
     <td><ul><li><p>partition 名</p></li><li><p>返す entity 数</p></li><li><p>出力フィールド</p></li></ul></td>
     <td><ul><li><p>partition 名</p></li><li><p>合計で返す entity 数</p></li><li><p>出力フィールド</p></li></ul></td>
   </tr>
   <tr>
     <td><p>戻り値</p></td>
     <td><p>指定した collection または partition 内で、指定した主キーを持つ entity を返します。</p></td>
     <td><p>指定した collection または partition 内で、カスタムフィルタリング条件を満たすすべて、または指定数の entity を返します。</p></td>
     <td><p>指定した collection または partition 内で、カスタムフィルタリング条件を満たすすべての entity を、ページネーション付きクエリを通じて返します。</p></td>
   </tr>
</table>

メタデータフィルタリングの詳細については、[Filtering Explained](./filtering-overview)[Filtering Explained](./filtering-overview) を参照してください。

## Use Get\{#use-get}

主キーによって entity を検索する必要がある場合は、**Get** メソッドを使用できます。以下のコード例では、collection に `id`、`vector`、`color` という 3 つのフィールドがあることを前提としています。

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

以下のように、ID によって entity を取得できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "id": [0, 1, 2],
    "outputFields": ["vector", "color"]
}'

# {"code":0,"cost":0,"data":[{"color":"pink_8682","id":0,"vector":[0.35803765,-0.6023496,0.18414013,-0.26286206,0.90294385]},{"color":"red_7025","id":1,"vector":[0.19886813,0.060235605,0.6976963,0.26144746,0.8387295]},{"color":"orange_6781","id":2,"vector":[0.43742132,-0.55975026,0.6457888,0.7894059,0.20785794]}]}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::vector<int64_t> ids = {0, 1, 2};
auto request = milvus::GetRequest()
                   .WithCollectionName("my_collection")
                   .WithIDs(std::move(ids))
                   .AddOutputField("color")
                   .AddOutputField("vector");
                   
milvus::GetResponse response;
status = client->Get(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## Use Query\{#use-query}

### Basic Query\{#basic-query}

カスタムフィルタリング条件によって entity を検索する必要がある場合は、**Query** メソッドを使用します。以下のコード例では、`id`、`vector`、`color` という 3 つのフィールドがあることを前提とし、`color` の値が `red` で始まる entity を指定数返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "filter": "color like \"red%\"",
    "limit": 3,
    "outputFields": ["vector", "color"]
}'
#{"code":0,"cost":0,"data":[{"color":"red_7025","id":1,"vector":[0.19886813,0.060235605,0.6976963,0.26144746,0.8387295]},{"color":"red_4794","id":4,"vector":[0.44523495,-0.8757027,0.82207793,0.4640629,0.3033748]},{"color":"red_9392","id":6,"vector":[0.8371978,-0.015764369,-0.31062937,-0.56266695,-0.8984948]}]}
```

</TabItem>

<TabItem value='c++'>

```c++
 #include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::QueryRequest()
                   .WithCollectionName("my_collection")
                   .WithFilter(R"(color like "red%")")
                   .WithLimit(3)
                   .AddOutputField("vector")
                   .AddOutputField("color");

milvus::QueryResponse response;
status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### Sort Query Results | ONDEMAND\{#sort-query-results}

デフォルトでは、Query は順序が指定されていない状態で結果を返します。`order_by` パラメータを使用すると、1 つ以上の scalar フィールドで結果をソートできます。`order_by` を使用する場合は、以下の点に注意してください。

- `order_by` は `limit` と一緒に使用する必要があります。

- サポートされるフィールド型: `INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、`DOUBLE`、`VARCHAR`。vector、`JSON`、`ARRAY` フィールドでのソートはサポートされていません。

- nullable フィールドでソートする場合、NULL 値は昇順では末尾（NULLS LAST）、降順では先頭（NULLS FIRST）に配置されます。

#### Basic Sort\{#basic-sort}

`order_by` パラメータには `"field_name:direction"` 形式の文字列リストを渡します。ここで `direction` は `asc`（昇順）または `desc`（降順）です。`asc` と `desc` は大文字と小文字を区別する点に注意してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

Map<String, Object> queryParams = new HashMap<>();
// highlight-next-line
queryParams.put("order_by_fields", "id:asc");

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("color like \"red%\"")
        .outputFields(Arrays.asList("vector", "color"))
        .limit(3)
        .queryParams(queryParams)
        .build();

QueryResp queryResp = client.query(queryReq);
for (QueryResp.QueryResult result : queryResp.getQueryResults()) {
    System.out.println(result.getEntity());
}
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({ address, token });

const res = await client.query({
  collection_name: "my_collection",
  filter: 'color like "red%"',
  output_fields: ["vector", "color"],
  limit: 3,
  // highlight-next-line
  order_by: ["id:asc"],
});

console.log(res.data);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// c++
```

</TabItem>
</Tabs>

#### 複数フィールドでのソート\{#multi-field-sort}

複数のフィールドで同時にソートできます。結果はまずリスト内の最初のフィールドで並べ替えられます。2 行がそのフィールドで同じ値を持つ場合は、2 番目のフィールドで順序が決まり、以降も同様です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
Map<String, Object> queryParams = new HashMap<>();
// highlight-next-line
queryParams.put("order_by_fields", "rating:desc,price:asc");

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("")
        .outputFields(Arrays.asList("color", "rating", "price"))
        .limit(10)
        .queryParams(queryParams)
        .build();

QueryResp queryResp = client.query(queryReq);
for (QueryResp.QueryResult result : queryResp.getQueryResults()) {
    System.out.println(result.getEntity());
}
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.query({
  collection_name: "my_collection",
  filter: "",
  output_fields: ["color", "rating", "price"],
  limit: 10,
  // highlight-next-line
  order_by: ["rating:desc", "price:asc"],
});

console.log(res.data);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// c++
```

</TabItem>
</Tabs>

#### ソート付きページネーション\{#pagination-with-sort}

`order_by` を `limit` および `offset` と組み合わせて、ソート済みの結果をページネーションできます。たとえば、複数ページにまたがって価格順でソートされた商品リストを表示する場合、各ページには重複や欠落なしに、正しい価格順で次のアイテムのまとまりが表示されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
Map<String, Object> queryParams = new HashMap<>();
// highlight-next-line
queryParams.put("order_by_fields", "price:asc");

QueryReq page1Req = QueryReq.builder()
        .collectionName("my_collection")
        .filter("color like \"red%\"")
        .outputFields(Arrays.asList("color", "price"))
        .limit(5)
        .offset(0)
        .queryParams(queryParams)
        .build();

QueryResp page1 = client.query(page1Req);
for (QueryResp.QueryResult result : page1.getQueryResults()) {
    System.out.println(result.getEntity());
}

QueryReq page2Req = QueryReq.builder()
        .collectionName("my_collection")
        .filter("color like \"red%\"")
        .outputFields(Arrays.asList("color", "price"))
        .limit(5)
        .offset(5)
        .queryParams(queryParams)
        .build();

QueryResp page2 = client.query(page2Req);
for (QueryResp.QueryResult result : page2.getQueryResults()) {
    System.out.println(result.getEntity());
}
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='javascript'>

```javascript
const page1 = await client.query({
  collection_name: "my_collection",
  filter: 'color like "red%"',
  output_fields: ["color", "price"],
  limit: 5,
  offset: 0,
  // highlight-next-line
  order_by: ["price:asc"],
});

console.log(page1.data);

const page2 = await client.query({
  collection_name: "my_collection",
  filter: 'color like "red%"',
  output_fields: ["color", "price"],
  limit: 5,
  offset: 5,
  // highlight-next-line
  order_by: ["price:asc"],
});

console.log(page2.data);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
// c++
```

</TabItem>
</Tabs>

### クエリ結果の集計 | ONDEMAND\{#aggregate-query-results}

1 つ以上の scalar フィールドでクエリ結果をグループ化し、グループごとに集計を計算できます。サポートされている集計演算子は `count`、`min`、`max`、`sum`、`avg` です。

`group_by_fields` を使用する際は、次の点に注意してください。

- `group_by_fields` でサポートされるフィールド型: `INT8`、`INT16`、`INT32`、`INT64`、`VARCHAR`、`TIMESTAMPTZ`。`FLOAT`、`DOUBLE`、vector、`JSON`、`ARRAY` フィールドでグループ化するとエラーになります。

- `sum` と `avg` は数値型のみを対象とします。`VARCHAR` フィールドに適用するとエラーになります。

集計を有効にするには、`query()` に `group_by_fields` を渡し、`output_fields` に集計式（`count(*)`、`count(<field>)`、`min(<field>)`、`max(<field>)`、`sum(<field>)`、`avg(<field>)`）を追加します。

次の例では、`color` フィールドで entity をグループ化し、各色グループ内の entity 数を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

Map<String, Object> queryParams = new HashMap<>();
// highlight-next-line
queryParams.put("group_by_fields", "color");

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("")
        .outputFields(Arrays.asList("color", "count(*)"))
        .queryParams(queryParams)
        .build();

QueryResp queryResp = client.query(queryReq);
for (QueryResp.QueryResult result : queryResp.getQueryResults()) {
    System.out.println(result.getEntity());
}

// Output
// {color=red, count(*)=10}
// {color=orange, count(*)=10}
// {color=yellow, count(*)=10}
// {color=green, count(*)=10}
// {color=blue, count(*)=10}
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

1 回の呼び出しで複数の集計式をリクエストできます。次の例では、`color` でグループ化し、各グループの行数、平均価格、最大 rating を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
Map<String, Object> queryParams = new HashMap<>();
// highlight-next-line
queryParams.put("group_by_fields", "color");

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("")
        .outputFields(Arrays.asList("color", "count(*)", "avg(price)", "max(rating)"))
        .queryParams(queryParams)
        .build();

QueryResp queryResp = client.query(queryReq);
for (QueryResp.QueryResult result : queryResp.getQueryResults()) {
    System.out.println(result.getEntity());
}

// Output
// {color=red, count(*)=10, avg(price)=65.22, max(rating)=5}
// {color=orange, count(*)=10, avg(price)=48.67, max(rating)=5}
// {color=yellow, count(*)=10, avg(price)=64.15, max(rating)=3}
// {color=green, count(*)=10, avg(price)=58.28, max(rating)=5}
// {color=blue, count(*)=10, avg(price)=50.20, max(rating)=5}
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

複合グループを計算するには、複数のフィールドを `group_by_fields` に渡します。次の例では、`(color, rating)` でグループ化し、各バケット内の価格範囲を計算します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
Map<String, Object> queryParams = new HashMap<>();
// highlight-next-line
queryParams.put("group_by_fields", "color,rating");

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("")
        .outputFields(Arrays.asList("color", "rating", "min(price)", "max(price)"))
        .queryParams(queryParams)
        .build();

QueryResp queryResp = client.query(queryReq);
for (QueryResp.QueryResult result : queryResp.getQueryResults()) {
    System.out.println(result.getEntity());
}

// Output
// {color=red, rating=5, min(price)=34.51, max(price)=70.90}
// {color=orange, rating=2, min(price)=12.39, max(price)=81.99}
// {color=yellow, rating=2, min(price)=22.62, max(price)=88.24}
// {color=green, rating=1, min(price)=18.35, max(price)=59.53}
// {color=blue, rating=4, min(price)=21.23, max(price)=82.45}
// ...
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

`group_by_fields` を `limit` と組み合わせて、返されるグループ数に上限を設けることもできます。これは、フィールドのカーディナリティが高く、バケットのサンプルだけが必要な場合に便利です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
Map<String, Object> queryParams = new HashMap<>();
queryParams.put("group_by_fields", "color");

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("")
        .outputFields(Arrays.asList("color", "avg(price)", "count(*)"))
        // highlight-next-line
        .limit(5)
        .queryParams(queryParams)
        .build();

QueryResp queryResp = client.query(queryReq);
for (QueryResp.QueryResult result : queryResp.getQueryResults()) {
    System.out.println(result.getEntity());
}

// Output
// {color=red, avg(price)=65.22, count(*)=10}
// {color=orange, avg(price)=48.67, count(*)=10}
// {color=yellow, avg(price)=64.15, count(*)=10}
// {color=green, avg(price)=58.28, count(*)=10}
// {color=blue, avg(price)=50.20, count(*)=10}
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

## QueryIterator を使用する\{#use-queryiterator}

ページネーションされたクエリを通じてカスタムのフィルタリング条件で entity を見つける必要がある場合は、**QueryIterator** を作成し、その **next()** メソッドを使用してすべての entity を反復処理し、フィルタリング条件を満たすものを見つけます。以下のコード例では、`id`、`vector`、`color` という 3 つのフィールドが存在することを前提としており、`color` の値が `red` で始まるすべての entity を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
milvus::QueryIteratorRequest request;
request.SetCollectionName("my_collection");
request.SetBatchSize(10);
request.SetFilter(R"(color like "red%")");
request.AddOutputField("color");

milvus::QueryIteratorPtr iterator;
auto status = client->QueryIterator(request, iterator);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

while (true) {
    milvus::QueryResults batch_results;
    status = iterator->Next(batch_results);
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
        break;
    }

    milvus::EntityRows rows;
    status = batch_results.OutputRows(rows);
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
        break;
    }
    for (const auto& row : rows) {
        std::cout << row.dump() << std::endl;
    }
}
```

</TabItem>
</Tabs>

## partition 内での Query\{#queries-in-partitions}

Get、Query、または QueryIterator リクエストに partition 名を含めることで、1 つまたは複数の partition 内で Query を実行することもできます。以下のコード例では、collection 内に **PartitionA** という名前の partition が存在することを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# Use get
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/get" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
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
--header "Request-Timeout: 10" \
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

<TabItem value='c++'>

```c++
// Use get
{
    std::vector<int64_t> ids = {10, 11, 12};
    auto request = milvus::GetRequest()
                       .WithCollectionName("my_collection")
                       .AddPartitionName("partitionA")
                       .WithIDs(std::move(ids))
                       .AddOutputField("color")
                       .AddOutputField("vector");
                       
    milvus::GetResponse response;
    status = client->Get(request, response);
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
    }
}

// Use query
{
    auto request = milvus::QueryRequest()
                       .WithCollectionName("my_collection")
                       .AddPartitionName("partitionA")
                       .WithFilter(R"(color like "red%")")
                       .WithLimit(3)
                       .AddOutputField("vector")
                       .AddOutputField("color");
    
    milvus::QueryResponse response;
    status = client->Query(request, response);
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
    }
}

// Use queryiterator
{
    milvus::QueryIteratorRequest request;
    request.SetCollectionName("my_collection");
    request.AddPartitionName("partitionA")
    request.SetBatchSize(10);
    request.SetFilter(R"(color like "red%")");
    request.AddOutputField("color");
    
    milvus::QueryIteratorPtr iterator;
    auto status = client->QueryIterator(request, iterator);
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
    }
    
    while (true) {
        milvus::QueryResults batch_results;
        status = iterator->Next(batch_results);
        if (!status.IsOk()) {
            std::cout << status.Message() << std::endl;
            break;
        }
    
        milvus::EntityRows rows;
        status = batch_results.OutputRows(rows);
        if (!status.IsOk()) {
            std::cout << status.Message() << std::endl;
            break;
        }
        for (const auto& row : rows) {
            std::cout << row.dump() << std::endl;
        }
    }
}
```

</TabItem>
</Tabs>

## Query によるランダムサンプリング\{#random-sampling-with-query}

データ探索や開発時のテストのために collection から代表的なデータのサブセットを抽出するには、`RANDOM_SAMPLE(sampling_factor)` 式を使用します。ここで `sampling_factor` は 0 から 1 の間の float 値で、サンプリングするデータの割合を表します。

<Admonition type="info" icon="📘" title="注意">

詳細な使用方法、高度な例、ベストプラクティスについては、[Random Sampling](./ramdom-sampling) を参照してください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='go'>

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

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
                   .WithCollectionName("my_collection")
                   .WithFilter("RANDOM_SAMPLE(0.01)")
                   .AddOutputField("vector")
                   .AddOutputField("color");

milvus::QueryResponse response;
status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

request.SetFilter(R"(color like "red%" AND RANDOM_SAMPLE(0.005))")
status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## Query に対して一時的にタイムゾーンを設定する\{#temporarily-set-a-timezone-for-a-query}

collection に `TIMESTAMPTZ` フィールドがある場合、query 呼び出しで `timezone` パラメータを設定することで、単一の操作に対してデータベースまたは collection のデフォルトタイムゾーンを一時的に上書きできます。これにより、操作中に `TIMESTAMPTZ` 値がどのように表示・比較されるかを制御できます。

`timezone` の値は、有効な [IANA time zone identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) である必要があります（例: **Asia/Shanghai**、**America/Chicago**、**UTC**）。`TIMESTAMPTZ` フィールドの使用方法の詳細については、[TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。

以下の例は、query 操作に対して一時的にタイムゾーンを設定する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='javascript'>

```javascript
// js
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
                   .WithCollectionName("my_collection")
                   .WithFilter("id <= 10")
                   .WithLimit(2)
                   .AddOutputField("id")
                   .AddOutputField("tsz")
                   .AddOutputField("vec")
                   .WithTimezone("America/Havana");

milvus::QueryResponse response;
status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

