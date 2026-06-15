---
title: "Query | BYOC"
slug: /get-and-scalar-query
sidebar_label: "Query"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In addition to ANN searches, MilvusZilliz Cloud also supports metadata filtering through queries. This page introduces how to use Query, Get, and QueryIterators to perform metadata filtering. | BYOC"
type: origin
token: R7F7wY8pCiJ5Q4kbntxcMsE6nLf
sidebar_position: 9
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Query

In addition to ANN searches, MilvusZilliz Cloud also supports metadata filtering through queries. This page introduces how to use Query, Get, and QueryIterators to perform metadata filtering.

<Admonition type="info" icon="📘" title="Notes">

If you add new fields after the collection has been created, queries that include these fields return the defined default values or `NULL` for entities that have not explicitly set values. For details, refer to [Alter Collection Schema](./add-fields-to-an-existing-collection).

</Admonition>

## Overview\{#overview}

A Collection can store various types of scalar fields. You can have Zilliz Cloud filter Entities based on one or more scalar fields. Zilliz Cloud offers three types of queries: Query, Get, and QueryIterator. The table below compares these three query types.

<table>
   <tr>
     <th></th>
     <th><p>Get</p></th>
     <th><p>Query</p></th>
     <th><p>QueryIterator</p></th>
   </tr>
   <tr>
     <td><p>Applicable scenarios</p></td>
     <td><p>To find entities that hold the specified primary keys.</p></td>
     <td><p>To find all or a specified number of entities that meet the custom filtering conditions</p></td>
     <td><p>To find all entities that meet the custom filtering conditions in paginated queries.</p></td>
   </tr>
   <tr>
     <td><p>Filtering method</p></td>
     <td><p>By primary keys</p></td>
     <td><p>By filtering expressions.</p></td>
     <td><p>By filtering expressions.</p></td>
   </tr>
   <tr>
     <td><p>Mandatory parameters</p></td>
     <td><ul><li><p>Collection name</p></li><li><p>Primary keys</p></li></ul></td>
     <td><ul><li><p>Collection name</p></li><li><p>Filtering expressions</p></li></ul></td>
     <td><ul><li><p>Collection name</p></li><li><p>Filtering expressions</p></li><li><p>Number of entities to return per query</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Optional parameters</p></td>
     <td><ul><li><p>Partition name</p></li><li><p>Output fields</p></li></ul></td>
     <td><ul><li><p>Partition name</p></li><li><p>Number of entities to return</p></li><li><p>Output fields</p></li></ul></td>
     <td><ul><li><p>Partition name</p></li><li><p>Number of entities to return in total</p></li><li><p>Output fields</p></li></ul></td>
   </tr>
   <tr>
     <td><p>Returns</p></td>
     <td><p>Returns entities that hold the specified primary keys in the specified collection or partition.</p></td>
     <td><p>Returns all or a specified number of entities that meet the custom filtering conditions in the specified collection or partition.</p></td>
     <td><p>Returns all entities that meet the custom filtering conditions in the specified collection or partition through paginated queries.</p></td>
   </tr>
</table>

For more on metadata filtering, refer to [Filtering](./undefined)[Filtering Explained](./filtering-overview).

## Use Get\{#use-get}

When you need to find entities by their primary keys, you can use the **Get** method. The following code examples assume that there are three fields named `id`, `vector`, and `color` in your collection.

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

You can get entities by their IDs as follows.

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
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "id": [0, 1, 2],
    "outputFields": ["vector", "color"]
}'

# {"code":0,"cost":0,"data":[{"color":"pink_8682","id":0,"vector":[0.35803765,-0.6023496,0.18414013,-0.26286206,0.90294385]},{"color":"red_7025","id":1,"vector":[0.19886813,0.060235605,0.6976963,0.26144746,0.8387295]},{"color":"orange_6781","id":2,"vector":[0.43742132,-0.55975026,0.6457888,0.7894059,0.20785794]}]}
```

</TabItem>
</Tabs>

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

## Use Query\{#use-query}

### Basic Query\{#basic-query}

When you need to find entities by custom filtering conditions, use the **Query** method. The following code examples assume there are three fields named `id`, `vector`, and `color` and return the specified number of entities that hold a `color` value starting with `red`.

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
</Tabs>

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

### Sort Query Results | PRIVATE\{#sort-query-results}

By default, Query returns results in an unspecified order. Use the `order_by` parameter to sort results by one or more scalar fields. When using `order_by`, note that:

- `order_by` must be used together with `limit`.

- Supported field types: `INT8`, `INT16`, `INT32`, `INT64`, `FLOAT`, `DOUBLE`, and `VARCHAR`. Sorting by vector, `JSON`, or `ARRAY` fields is not supported.

- When sorting by a nullable field, NULL values are placed at the end for ascending order (NULLS LAST) and at the beginning for descending order (NULLS FIRST).

#### Basic Sort\{#basic-sort}

Pass a list of `"field_name:direction"` strings to the `order_by` parameter, where `direction` is either `asc` (ascending) or `desc` (descending). Note that `asc` and `desc` are case-sensitive.

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

#### Multi-field Sort\{#multi-field-sort}

You can sort by multiple fields at once. Results are first ordered by the first field in the list. When two rows have the same value in that field, the second field determines their order, and so on.

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

#### Pagination with Sort\{#pagination-with-sort}

Use `order_by` together with `limit` and `offset` to paginate through sorted results. For example, to display a product list sorted by price across multiple pages, each page shows the next batch of items in the correct price order without duplicates or gaps.

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

### Aggregate Query Results | PRIVATE\{#aggregate-query-results}

You can group query results by one or more scalar fields and compute aggregations per group. The supported aggregation operators are `count`, `min`, `max`, `sum`, and `avg`.

When using `group_by_fields`, note that:

- Supported field types for `group_by_fields`: `INT8`, `INT16`, `INT32`, `INT64`, `VARCHAR`, and `TIMESTAMPTZ`. Grouping by `FLOAT`, `DOUBLE`, vector, `JSON`, or `ARRAY` fields returns an error.

- `sum` and `avg` are numeric only — applying them to a `VARCHAR` field returns an error.

To enable aggregation, pass `group_by_fields` to `query()` and add aggregation expressions (`count(*)`, `count(<field>)`, `min(<field>)`, `max(<field>)`, `sum(<field>)`, `avg(<field>)`) to `output_fields`.

The following example groups entities by the `color` field and returns the number of entities in each color group:

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

You can request several aggregation expressions in a single call. The following example groups by `color` and returns the row count, average price, and maximum rating for each group:

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

Pass more than one field to `group_by_fields` to compute composite groups. The following example groups by `(color, rating)` and computes the price range in each bucket:

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

You can also combine `group_by_fields` with `limit` to cap how many groups come back — useful when a field has high cardinality and you only need a sample of buckets:

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

## Use QueryIterator\{#use-queryiterator}

When you need to find entities by custom filtering conditions through paginated queries, create a **QueryIterator** and use its **next()** method to iterate over all entities to find those meeting the filtering conditions. The following code examples assume that there are three fields named `id`, `vector`, and `color` and return all entities that hold a `color` value starting with `red`.

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

## Queries in Partitions\{#queries-in-partitions}

You can also perform queries within one or multiple partitions by including the partition names in the Get, Query, or QueryIterator request. The following code examples assume that there is a partition named **PartitionA** in the collection.

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
</Tabs>

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

## Random Sampling with Query\{#random-sampling-with-query}

To extract a representative subset of data from your collection for data exploration or development testing, use the `RANDOM_SAMPLE(sampling_factor)` expression, where the `sampling_factor` is a float between 0 and 1 representing the percentage of data to sample.

<Admonition type="info" icon="📘" title="Notes">

For detailed usage, advanced examples, and best practices, refer to [Random Sampling](./ramdom-sampling).

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
</Tabs>

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

## Temporarily Set a Timezone for a Query\{#temporarily-set-a-timezone-for-a-query}

If your collection has a `TIMESTAMPTZ` field, you can temporarily override the database or collection default timezone for a single operation by setting the `timezone` parameter in the query call. This controls how `TIMESTAMPTZ` values are displayed and compared during the operation.

The value of `timezone` must be a valid [IANA time zone identifier](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones) (for example, **Asia/Shanghai**, **America/Chicago**, or **UTC**). For details on how to use a `TIMESTAMPTZ` field, refer to [TIMESTAMPTZ Field](./use-timestamptz-field).

The example below shows how to temporarily set a timezone for a query operation:

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
</Tabs>

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

