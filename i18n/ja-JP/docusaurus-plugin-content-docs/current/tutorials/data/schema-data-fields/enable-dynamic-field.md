---
title: "ダイナミックフィールド | Cloud"
slug: /enable-dynamic-field
sidebar_label: "ダイナミックフィールド"
beta: FALSE
notebook: FALSE
description: "コレクションのスキーマで定義されたすべてのフィールドは、挿入するエンティティに含める必要があります。一部のフィールドをオプションにしたい場合は、動的フィールドを有効にすることを検討してください。このトピックでは、動的フィールドを有効にして使用する方法について説明します。 | Cloud"
type: origin
token: U7IXwIV00iggkCkRvxmcLhj2nyI
sidebar_position: 10
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - dynamic field
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ダイナミックフィールド

コレクションのスキーマで定義されたすべてのフィールドは、挿入するエンティティに含める必要があります。一部のフィールドをオプションにしたい場合は、動的フィールドを有効にすることを検討してください。このトピックでは、動的フィールドを有効にして使用する方法について説明します。

## 概要について{#overview}

では、コレクション内の各フィールドの名前とデータ型を設定することで、コレクションスキーマを作成できます。スキーマにフィールドを追加する場合は、挿入するエンティティにこのフィールドが含まれていることを確認してください。一部のフィールドをオプションにしたい場合は、動的フィールドを有効にすることもできます。

動的フィールドは`$meta`という名前の予約フィールドで、Java Script Object Notation(JSON)タイプです。スキーマで定義されていないエンティティのフィールドは、この予約JSONフィールドにキーと値のペアとして保存されます。

動的フィールドが有効になっているコレクションでは、スキーマで明示的に定義されたフィールドと同様に、動的フィールドのキーをスカラーフィルターに使用できます。

## ダイナミックフィールドを有効にする{#enable-dynamic-field}

「[コレクションを即座に作成](./quick-setup-collections)」で説明されている方法を使用して作成されたコレクションには、動的フィールドがデフォルト有効になります。カスタム設定でコレクションを作成するときに、動的フィールドを手動で有効にすることもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client= MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

client.create_collection(
    collection_name="my_dynamic_collection",
    dimension=5,
    # highlight-next-line
    enable_dynamic_field=True
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());
        
CreateCollectionReq createCollectionReq = CreateCollectionReq.builder()
    .collectionName("my_dynamic_collection")
    .dimension(5)
    // highlight-next-line
    .enableDynamicField(true)
    .build()
client.createCollection(createCollectionReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new Client({
    address: 'YOUR_CLUSTER_ENDPOINT'
});

await client.createCollection({
    collection_name: "customized_setup_2",
    schema: schema,
    // highlight-next-line
    enable_dynamic_field: true
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_dynamic_collection",
    "dimension": 5,
    "enableDynamicField": true
}'
```

</TabItem>
</Tabs>

## ダイナミックフィールドを使用する{#use-dynamic-field}

コレクションで動的フィールドが有効になっている場合、スキーマで定義されていないすべてのフィールドとその値は、動的フィールドにキーと値のペアとして保存されます。

例えば、コレクションスキーマが`id`と`vector`という2つのフィールドのみを定義し、動的フィールドが有効になっているとします。次のデータセットをこのコレクションに挿入します。

```json
[
    {id: 0, vector: [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], color: "pink_8682"},
    {id: 1, vector: [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], color: "red_7025"},
    {id: 2, vector: [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], color: "orange_6781"},
    {id: 3, vector: [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], color: "pink_9298"},
    {id: 4, vector: [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], color: "red_4794"},
    {id: 5, vector: [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], color: "yellow_4222"},
    {id: 6, vector: [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], color: "red_9392"},
    {id: 7, vector: [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], color: "grey_8510"},
    {id: 8, vector: [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], color: "white_9381"},
    {id: 9, vector: [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], color: "purple_4976"}        
]
```

上記のデータセットには、`id`、`vector`、`color`の各フィールドを含む10個のエンティティが含まれています。ここでは、`color`フィールドはスキーマで定義されていません。コレクションには動的フィールドが有効になっているため、フィールドの`色`は動的フィールド内のキーと値のペアとして保存されます。

### データの挿入{#insert-data}

次のコードは、このデータセットをコレクションに挿入する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data=[
    {"id": 0, "vector": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], "color": "pink_8682"},
    {"id": 1, "vector": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], "color": "red_7025"},
    {"id": 2, "vector": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], "color": "orange_6781"},
    {"id": 3, "vector": [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], "color": "pink_9298"},
    {"id": 4, "vector": [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], "color": "red_4794"},
    {"id": 5, "vector": [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], "color": "yellow_4222"},
    {"id": 6, "vector": [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], "color": "red_9392"},
    {"id": 7, "vector": [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], "color": "grey_8510"},
    {"id": 8, "vector": [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], "color": "white_9381"},
    {"id": 9, "vector": [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], "color": "purple_4976"}
]

res = client.insert(
    collection_name="my_dynamic_collection",
    data=data
)

print(res)

# Output
# {'insert_count': 10, 'ids': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;
   
Gson gson = new Gson();
List<JsonObject> data = Arrays.asList(
        gson.fromJson("{\"id\": 0, \"vector\": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], \"color\": \"pink_8682\"}", JsonObject.class),
        gson.fromJson("{\"id\": 1, \"vector\": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], \"color\": \"red_7025\"}", JsonObject.class),
        gson.fromJson("{\"id\": 2, \"vector\": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], \"color\": \"orange_6781\"}", JsonObject.class),
        gson.fromJson("{\"id\": 3, \"vector\": [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], \"color\": \"pink_9298\"}", JsonObject.class),
        gson.fromJson("{\"id\": 4, \"vector\": [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], \"color\": \"red_4794\"}", JsonObject.class),
        gson.fromJson("{\"id\": 5, \"vector\": [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], \"color\": \"yellow_4222\"}", JsonObject.class),
        gson.fromJson("{\"id\": 6, \"vector\": [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], \"color\": \"red_9392\"}", JsonObject.class),
        gson.fromJson("{\"id\": 7, \"vector\": [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], \"color\": \"grey_8510\"}", JsonObject.class),
        gson.fromJson("{\"id\": 8, \"vector\": [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], \"color\": \"white_9381\"}", JsonObject.class),
        gson.fromJson("{\"id\": 9, \"vector\": [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], \"color\": \"purple_4976\"}", JsonObject.class)
);

InsertReq insertReq = InsertReq.builder()
        .collectionName("my_dynamic_collection")
        .data(data)
        .build();

InsertResp insertResp = client.insert(insertReq);
System.out.println(insertResp);

// Output:
//
// InsertResp(InsertCnt=10, primaryKeys=[0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { DataType } = require("@zilliz/milvus2-sdk-node")

// 3. Insert some data

var data = [
    {id: 0, vector: [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], color: "pink_8682"},
    {id: 1, vector: [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], color: "red_7025"},
    {id: 2, vector: [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], color: "orange_6781"},
    {id: 3, vector: [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], color: "pink_9298"},
    {id: 4, vector: [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], color: "red_4794"},
    {id: 5, vector: [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], color: "yellow_4222"},
    {id: 6, vector: [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], color: "red_9392"},
    {id: 7, vector: [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], color: "grey_8510"},
    {id: 8, vector: [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], color: "white_9381"},
    {id: 9, vector: [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], color: "purple_4976"}        
]

var res = await client.insert({
    collection_name: "quick_setup",
    data: data,
})

console.log(res.insert_cnt)

// Output
// 
// 10
// 
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "data": [
        {"id": 0, "vector": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], "color": "pink_8682"},
        {"id": 1, "vector": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], "color": "red_7025"},
        {"id": 2, "vector": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], "color": "orange_6781"},
        {"id": 3, "vector": [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], "color": "pink_9298"},
        {"id": 4, "vector": [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], "color": "red_4794"},
        {"id": 5, "vector": [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], "color": "yellow_4222"},
        {"id": 6, "vector": [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], "color": "red_9392"},
        {"id": 7, "vector": [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], "color": "grey_8510"},
        {"id": 8, "vector": [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], "color": "white_9381"},
        {"id": 9, "vector": [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], "color": "purple_4976"}        
    ],
    "collectionName": "my_dynamic_collection"
}'

# {
#     "code": 0,
#     "data": {
#         "insertCount": 10,
#         "insertIds": [
#             0,
#             1,
#             2,
#             3,
#             4,
#             5,
#             6,
#             7,
#             8,
#             9
#         ]
#     }
# }
```

</TabItem>
</Tabs>

### ダイナミックフィールドを使用したクエリと検索{#query-search-with-dynamic-field}

は、クエリや検索中にフィルター式を使用することをサポートしており、結果に含めるフィールドを指定できます。次の例は、スキーマで定義されていない`カラー`フィールドを使用して、動的フィールドを使用してクエリや検索を実行する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = client.search(
    collection_name="my_dynamic_collection",
    data=[query_vector],
    limit=5,
    # highlight-start
    filter='color like "red%"',
    output_fields=["color"]
    # highlight-end
)

print(res)

# Output
# data: ["[{'id': 1, 'distance': 0.6290165185928345, 'entity': {'color': 'red_7025'}}, {'id': 4, 'distance': 0.5975797176361084, 'entity': {'color': 'red_4794'}}, {'id': 6, 'distance': -0.24996188282966614, 'entity': {'color': 'red_9392'}}]"] 

```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp

FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
SearchResp resp = client.search(SearchReq.builder()
        .collectionName("my_dynamic_collection")
        .annsField("vector")
        .data(Collections.singletonList(queryVector))
        .outputFields(Collections.singletonList("color"))
        .filter("color like \"red%\"")
        .topK(5)
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build());

System.out.println(resp.getSearchResults());

// Output
//
// [[SearchResp.SearchResult(entity={color=red_7025}, score=0.6290165, id=1), SearchResp.SearchResult(entity={color=red_4794}, score=0.5975797, id=4), SearchResp.SearchResult(entity={color=red_9392}, score=-0.24996188, id=6)]]

```

</TabItem>

<TabItem value='javascript'>

```javascript
const query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = await client.search({
    collection_name: "quick_setup",
    data: [query_vector],
    limit: 5,
    // highlight-start
    filters: "color like \"red%\"",
    output_fields: ["color"]
    // highlight-end
})
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_dynamic_collection",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    ],
    "annsField": "vector",
    "filter": "color like \"red%\"",
    "limit": 3,
    "outputFields": ["color"]
}'
# {"code":0,"cost":0,"data":[{"color":"red_7025","distance":0.6290165,"id":1},{"color":"red_4794","distance":0.5975797,"id":4},{"color":"red_9392","distance":-0.24996185,"id":6}]}
```

</TabItem>
</Tabs>

上記のコード例で使用されているフィルタ式では、`color like"red%"and likes>50`という条件で、`color`フィールドの値は**"red"**で始まる必要があります。サンプルデータでは、この条件を満たすエンティティは2つしかありません。したがって、`limit`(topK)を`3`以下に設定すると、これらのエンティティの両方が返されます。

```json
[
    {
        "id": 4, 
        "distance": 0.3345786594834839,
        "entity": {
            "vector": [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], 
            "color": "red_4794", 
            "likes": 122
        }
    },
    {
        "id": 6, 
        "distance": 0.6638239834383389，
        "entity": {
            "vector": [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], 
            "color": "red_9392", 
            "likes": 58
        }
    },
]
```

