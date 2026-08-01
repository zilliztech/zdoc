---
title: "Query | Cloud"
slug: /get-and-scalar-query
sidebar_label: "Query"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 除了支持 ANN Search 外，还提供基于标量的过滤查询功能。本节将介绍如何使用 Query、Get 和 QueryIterator 进行标量查询以及进行标量查询时的注意事项。 | Cloud"
type: origin
token: GMOpwnUH0iYRN1kbRidcET0cnKg
sidebar_position: 9
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Query

Zilliz Cloud 除了支持 ANN Search 外，还提供基于标量的过滤查询功能。本节将介绍如何使用 Query、Get 和 QueryIterator 进行标量查询以及进行标量查询时的注意事项。

<Admonition type="info" icon="📘" title="说明">

如果在 Collection 创建后动态添加新字段，包含这些字段的搜索将为未显式设置值的 Entity 返回定义的默认值或 NULL。有关详细信息，请参阅[向 Collection 添加字段](./add-fields-to-an-existing-collection)。

</Admonition>

## 概述\{#overview}

Collection 中可以存储多种类型的标量字段。您可以让 Milvus 基于一个或多个标量字段进行过滤查询，找出符合指定条件的部分或所有 Entity。Zilliz Cloud 提供了三种过滤查询的方法，分别为 Query、Get 和 QueryIterator。下表对这三种过滤查询方法进行了比较。

<table>
   <tr>
     <th></th>
     <th><p>Get</p></th>
     <th><p>Query</p></th>
     <th><p>QueryIterator</p></th>
   </tr>
   <tr>
     <td><p>适用场景</p></td>
     <td><p>要求根据主键值查询，返回指定 Entity。</p></td>
     <td><p>要求根据自定义条件查询，且返回所有或指定数量的符合条件的 Entity。</p></td>
     <td><p>要求根据自定义条件查询，且分页返回所有符合条件的 Entity。</p></td>
   </tr>
   <tr>
     <td><p>过滤方法</p></td>
     <td><p>基于主键字段过滤。</p></td>
     <td><p>基于过滤条件表达式过滤。</p></td>
     <td><p>基于过滤条件表达式过滤。</p></td>
   </tr>
   <tr>
     <td><p>必选参数</p></td>
     <td><ul><li><p>Collection 名称</p></li><li><p>主键值</p></li></ul></td>
     <td><ul><li><p>Collection 名称</p></li><li><p>过滤条件表达式</p></li></ul></td>
     <td><ul><li><p>Collection 名称</p></li><li><p>过滤条件表达式</p></li><li><p>单页返回 Entity 数量</p></li></ul></td>
   </tr>
   <tr>
     <td><p>可选参数</p></td>
     <td><ul><li><p>Partition 名称</p></li><li><p>返回 Entity 携带字段名称</p></li></ul></td>
     <td><ul><li><p>Partition 名称</p></li><li><p>返回 Entity 数量</p></li><li><p>返回 Entity 携带字段名称</p></li></ul></td>
     <td><ul><li><p>Partition 名称</p></li><li><p>返回 Entity 总数量</p></li><li><p>返回 Entity 携带字段名称</p></li></ul></td>
   </tr>
   <tr>
     <td><p>返回结果</p></td>
     <td><p>返回 Collection 或指定 Partition 中符合指定主键值的 Entity。</p></td>
     <td><p>返回 Collection 或指定 Partition 中所有或指定数量的符合指定过滤条件的 Entity。</p></td>
     <td><p>分页返回 Collection 或指定 Partition 中所有符合指定过滤条件的 Entity。</p></td>
   </tr>
</table>

关于过滤条件表达式的更多细节，可参考[过滤表达式概览](./filtering-overview)。

## 使用 Get\{#use-get}

当您需要根据 Entity 主键从 Collection 或 Partition 中查询 Entity 时，可以使用 Get 方法。如下代码示例中假设 Collection 有 `id`、`vector` 和 `color` 三个字段。

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

您可以参考如下代码示例获取主键值为 `0`、`1`、`2` 的三个 Entity。

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

## 使用 Query\{#use-query}

### 基础 Query\{#basic-query}

当您需要根据自定义条件查询，且返回所有或指定数量的符合条件的 Entity 时，可以使用 Query 方法。如下代码示例中假设 Collection 有 `id`、`vector` 和 `color` 三个字段。要求返回三个 `color` 以 `red` 开头的 Entity。

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

### 对查询结果排序 | ONDEMAND \{#sort-query-results}

默认情况下，Query 返回结果的顺序不固定。使用 `order_by` 参数可以按一个或多个标量字段对结果排序。

- `order_by` 必须与 `limit` 一起使用。

- 支持的字段类型包括：INT8、INT16、INT32、INT64、FLOAT、DOUBLE 和 VARCHAR。不支持按向量、JSON 或 ARRAY 字段排序。

- 按可为 `NULL` 的字段排序时，升序排序会将 `NULL` 值放在末尾（NULLS LAST），降序排序会将 `NULL` 值放在开头（NULLS FIRST）。

#### 基础排序\{#basic-sort}

向 `order_by` 参数传入一个 `"field_name:direction"` 字符串列表，其中 `direction` 为 `asc`（升序）或 `desc`（降序）。注意，`asc` 和 `desc` 区分大小写。

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

#### 多字段排序\{#multi-field-sort}

您可以同时按多个字段排序。结果会先按列表中的第一个字段排序。当两条结果在该字段上的值相同时，再由第二个字段决定它们的顺序，依此类推。

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

#### 结合分页排序\{#pagination-with-sort}

将 `order_by` 与 `limit` 和 `offset` 一起使用，可以对排序后的结果进行分页。例如，如果要按价格排序展示商品列表，每个页面都会按正确的价格顺序显示下一批商品，且不会出现重复或遗漏。

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

### 对查询结果进行分组聚合 | ONDEMAND \{#aggregate-query-results}

可以按一个或多个标量字段对查询结果进行分组，并对每个分组计算聚合值。支持的聚合算子包括 `count`、`min`、`max`、`sum` 和 `avg`。

使用 `group_by_fields` 时需要注意：

- `group_by_fields` 支持的字段类型：`INT8`、`INT16`、`INT32`、`INT64`、`VARCHAR` 和 `TIMESTAMPTZ`。对`FLOAT`、`DOUBLE`、向量、`JSON` 或 `ARRAY` 字段进行分组将返回错误。

- `sum` 和 `avg` 仅支持数值类型——对 `VARCHAR` 字段使用这两个算子将返回错误。

要启用聚合，向 `query()` 传入 `group_by_fields`，并在 `output_fields` 中加入聚合表达式（`count(*)`、`count(<field>)`、`min(<field>)`、`max(<field>)`、`sum(<field>)`、`avg(<field>)`）。

以下示例按 `color` 字段对 Entity 进行分组，并返回每个颜色分组中的 Entity 数量：

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

一次调用中可以请求多个聚合表达式。以下示例按 `color` 分组，并返回每个分组的行数、平均价格和最高评分：

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

向 `group_by_fields` 传入多个字段可以构成复合分组。以下示例按 `(color, rating)` 分组，并计算每个分组中的价格范围：

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

还可以将 `group_by_fields` 与 `limit` 结合使用，限制返回的分组数量——当某个字段的基数较高、只需要采样部分分组时非常有用：

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

## 使用 QueryIterator\{#use-query-iterator}

当您需要根据自定义条件查询，且分页返回所有符合条件的 Entity，可以使用 QueryIterator 创建一个迭代器。然后使用迭代器的 `next()` 方法循环遍历所有符合条件的 Entity。如下代码示例中假设 Collection 有 `id`、`vector` 和 `color` 三个字段。要求返回所有 `color` 以 `red` 开头的 Entity。

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

## 在 Partition 中过滤查询\{#query-in-partitions}

除了在 Collection 中进行过滤查询外，还可以在指定的一个或多个 Partition 中进行过滤查询，只需要在上面的 Get、Query 和 QueryIterator 方法中增加 Partition 名称即可。如下示例代码中假设 Collection 中存在一个名为 PartitionA 的 Partition。

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

## 使用 Query 进行随机取样\{#random-sampling-with-query}

若要从数据集中提取具有代表性的数据子集用于数据探索或开发测试，请使用  `RANDOM_SAMPLE(sampling_factor)`  表达式，其中 `sampling_factor` 是一个介于 `0` 和 `1` 之间的浮点数，表示要采样的数据百分比。

<Admonition type="info" icon="📘" title="说明">

关于随机采样的详细使用方法、高级示例和最佳实践，可参考[随机采样](./ramdom-sampling)。

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

## 为 Query 临时设置一个时区\{#temporarily-set-a-timezone-for-a-query}

如果你的 Collection 包含 `TIMESTAMPTZ` 字段，你可以在一次操作中通过在 `query` 调用中设置 `timezone` 参数，临时覆盖 Database 或 Collection 的默认时区。这会控制在该次操作中 `TIMESTAMPTZ` 值的显示和比较方式。

以下示例展示了如何为 query 操作设置临时时区：

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

参数 `timezone` 的值必须是有效的 [IANA 时区标识符](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)，例如 **Asia/Shanghai**、**America/Chicago** 或 **UTC**。关于如何使用 `TIMESTAMPTZ` 字段的详细信息，请参见[TIMESTAMPTZ 类型](./use-timestamptz-field)。