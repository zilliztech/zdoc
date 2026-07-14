---
title: "Grouping Search | BYOC"
slug: /grouping-search
sidebar_label: "Grouping Search"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Grouping Search を使用すると、Zilliz Cloud は指定されたフィールドの値で検索結果をグループ化し、より高いレベルでデータを集約できます。たとえば、基本的な ANN 検索を使用して手元の本に類似した本を見つけることができますが、Grouping Search を使用すると、その本で議論されているトピックを含む可能性のある本のカテゴリを見つけることができます。このトピックでは、重要な考慮事項とともに Grouping Search の使用方法について説明します。 | BYOC"
type: origin
token: JWZGw89MBiUDBNkhtGfcyyUcnsd
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Grouping Search

Grouping Search を使用すると、Zilliz Cloud は指定されたフィールドの値で検索結果をグループ化し、より高いレベルでデータを集約できます。たとえば、基本的な ANN 検索を使用して手元の本に類似した本を見つけることができますが、Grouping Search を使用すると、その本で議論されているトピックを含む可能性のある本のカテゴリを見つけることができます。このトピックでは、重要な考慮事項とともに Grouping Search の使用方法について説明します。

## Overview\{#overview}

検索結果内の entity が scalar field 内で同じ値を共有している場合、それは特定の属性においてそれらが類似していることを示しており、検索結果に悪影響を与える可能性があります。

1 つの collection に複数のドキュメント（**docId** で表される）が格納されているとします。ドキュメントを vector に変換する際にできるだけ多くの意味情報を保持するため、各ドキュメントはより小さく扱いやすい段落（または **chunks**）に分割され、それぞれが個別の entity として保存されます。ドキュメントが小さなセクションに分割されていても、ユーザーは依然として、どのドキュメントが自分のニーズに最も関連しているかを特定したいと考えることがよくあります。

![LhJEwzWiphLWxobMaiCcbVDPnNb](https://zdoc-images.s3.us-west-2.amazonaws.com/LhJEwzWiphLWxobMaiCcbVDPnNb.png)

このような collection に対して Approximate Nearest Neighbor (ANN) 検索を実行すると、検索結果に同じドキュメントからの複数の段落が含まれることがあり、他のドキュメントが見落とされる可能性があります。これは意図したユースケースに合わない場合があります。

![Ktj8wigrHhvz4nbDES5coKZJnZe](https://zdoc-images.s3.us-west-2.amazonaws.com/Ktj8wigrHhvz4nbDES5coKZJnZe.png)

検索結果の多様性を向上させるために、検索リクエストに `group_by_field` パラメータを追加して Grouping Search を有効にできます。図に示すように、`group_by_field` を `docId` に設定できます。このリクエストを受信すると、Zilliz Cloud は次を実行します。

- 提供された query vector に基づいて ANN 検索を実行し、クエリに最も類似したすべての entity を見つけます。

- `docId` など、指定された `group_by_field` で検索結果をグループ化します。

- `limit` パラメータで定義された各グループの上位結果を、各グループ内で最も類似した entity とともに返します。

<Admonition type="info" icon="📘" title="Notes">

デフォルトでは、Grouping Search はグループごとに 1 つの entity のみを返します。グループごとに返される結果数を増やしたい場合は、`group_size` および `strict_group_size` パラメータで制御できます。

</Admonition>

## Perform Grouping Search\{#perform-grouping-search}

このセクションでは、Grouping Search の使用方法を示すサンプルコードを示します。以下の例では、collection に `id`、`vector`、`chunk`、および `docId` の各フィールドが含まれていることを前提としています。

```python
[
        {"id": 0, "vector": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], "chunk": "pink_8682", "docId": 1},
        {"id": 1, "vector": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], "chunk": "red_7025", "docId": 5},
        {"id": 2, "vector": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], "chunk": "orange_6781", "docId": 2},
        {"id": 3, "vector": [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], "chunk": "pink_9298", "docId": 3},
        {"id": 4, "vector": [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], "chunk": "red_4794", "docId": 3},
        {"id": 5, "vector": [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], "chunk": "yellow_4222", "docId": 4},
        {"id": 6, "vector": [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], "chunk": "red_9392", "docId": 1},
        {"id": 7, "vector": [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], "chunk": "grey_8510", "docId": 2},
        {"id": 8, "vector": [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], "chunk": "white_9381", "docId": 5},
        {"id": 9, "vector": [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], "chunk": "purple_4976", "docId": 3},
]
```

検索リクエストでは、`group_by_field` と `output_fields` の両方を `docId` に設定します。Zilliz Cloud は指定されたフィールドで結果をグループ化し、返された各 entity に対して `docId` の値を含めて、各グループから最も類似した entity を返します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

query_vectors = [
    [0.14529211512077012, 0.9147257273453546, 0.7965055218724449, 0.7009258593102812, 0.5605206522382088]]

# Group search results
res = client.search(
    collection_name="my_collection",
    data=query_vectors,
    limit=3,
    group_by_field="docId",
    output_fields=["docId"]
)

# Retrieve the values in the `docId` column
doc_ids = [result['entity']['docId'] for result in res[0]]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

FloatVec queryVector = new FloatVec(new float[]{0.14529211512077012f, 0.9147257273453546f, 0.7965055218724449f, 0.7009258593102812f, 0.5605206522382088f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .topK(3)
        .groupByFieldName("docId")
        .outputFields(Collections.singletonList("docId"))
        .build();

SearchResp searchResp = client.search(searchReq);

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={docId=5}, score=0.74767184, id=1)
// SearchResp.SearchResult(entity={docId=2}, score=0.6254269, id=7)
// SearchResp.SearchResult(entity={docId=3}, score=0.3611898, id=3)
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

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

queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    3,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("vector").
    WithGroupByField("docId").
    WithOutputFields("docId"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("docId: ", resultSet.GetColumn("docId").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

var query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = await client.search({
    collection_name: "my_collection",
    data: [query_vector],
    limit: 3,
    // highlight-start
    group_by_field: "docId"
    // highlight-end
})

// Retrieve the values in the `docId` column
var docIds = res.results.map(result => result.entity.docId)
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
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    ],
    "annsField": "vector",
    "limit": 3,
    "groupingField": "docId",
    "outputFields": ["docId"]
}'
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

std::vector<float> query_vector = {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592};
auto request = milvus::SearchRequest()
                   .WithCollectionName("my_collection")
                   .AddFloatVector(query_vector)
                   .WithLimit(3)
                   .WithAnnsField("vector")
                   .WithGroupByField("docId")
                   .AddOutputField("docId");

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (auto& result : response.Results().Results()) {
    std::cout << "TopK results:" << std::endl;
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << "\t" << row << std::endl;
    }
}
```

上記のリクエストでは、`limit=3` は、クエリ vector に最も類似した単一の entity を含む 3 つのグループから検索結果を返すことを意味します。

## Configure group size\{#configure-group-size}

デフォルトでは、Grouping Search はグループごとに 1 つの entity のみを返します。グループごとに複数の結果が必要な場合は、`group_size` と `strict_group_size` パラメータを調整します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Group search results

res = client.search(
    collection_name="my_collection", 
    data=query_vectors, # query vector
    limit=5, # number of groups to return
    group_by_field="docId", # grouping field
    group_size=2, # p to 2 entities to return from each group
    strict_group_size=True, # return exact 2 entities from each group
    output_fields=["docId"]
)
```

</TabItem>

<TabItem value='java'>

```java
FloatVec queryVector = new FloatVec(new float[]{0.14529211512077012f, 0.9147257273453546f, 0.7965055218724449f, 0.7009258593102812f, 0.5605206522382088f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .topK(5)
        .groupByFieldName("docId")
        .groupSize(2)
        .strictGroupSize(true)
        .outputFields(Collections.singletonList("docId"))
        .build();

SearchResp searchResp = client.search(searchReq);

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}

// Output
// TopK results:
// SearchResp.SearchResult(entity={docId=5}, score=0.74767184, id=1)
// SearchResp.SearchResult(entity={docId=5}, score=-0.49148706, id=8)
// SearchResp.SearchResult(entity={docId=2}, score=0.6254269, id=7)
// SearchResp.SearchResult(entity={docId=2}, score=0.38515577, id=2)
// SearchResp.SearchResult(entity={docId=3}, score=0.3611898, id=3)
// SearchResp.SearchResult(entity={docId=3}, score=0.19556211, id=4)
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

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

queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    5,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("vector").
    WithGroupByField("docId").
    WithStrictGroupSize(true).
    WithGroupSize(2).
    WithOutputFields("docId"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("docId: ", resultSet.GetColumn("docId").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

var query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = await client.search({
    collection_name: "my_collection",
    data: [query_vector],
    limit: 5,
    group_by_field: "docId",
    // highlight-start
    group_size: 2,
    strict_group_size: true
    // highlight-end
})

// Retrieve the values in the `docId` column
var docIds = res.results.map(result => result.entity.docId)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "my_collection",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    ],
    "annsField": "vector",
    "limit": 5,
    "groupingField": "docId",
    "groupSize":2,
    "strictGroupSize":true,
    "outputFields": ["docId"]
}'
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

std::vector<float> query_vector = {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592};
auto request = milvus::SearchRequest()
                   .WithCollectionName("my_collection")
                   .AddFloatVector(query_vector)
                   .WithLimit(5)
                   .WithAnnsField("vector")
                   .WithGroupByField("docId")
                   .WithGroupSize(2)
                   .WithStrictGroupSize(true)
                   .AddOutputField("docId");

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (auto& result : response.Results().Results()) {
    std::cout << "TopK results:" << std::endl;
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << "\t" << row << std::endl;
    }
}
```

上記の例では:

- `group_size`: グループごとに返す entity の希望数を指定します。たとえば、`group_size=2` に設定すると、各グループ（または各 `docId`）から理想的には最も類似した 2 つの段落（または **chunks**）が返されます。`group_size` が設定されていない場合、システムはデフォルトでグループごとに 1 件の結果を返します。

- `strict_group_size`: このブール値パラメータは、システムが `group_size` で設定された件数を厳密に適用するかどうかを制御します。`strict_group_size=True` の場合、システムは、そのグループ内に十分なデータがない場合を除き、各グループに `group_size` で指定された正確な数の entity（例: 2 つの段落）を含めようとします。デフォルト（`strict_group_size=False`）では、システムは各グループに `group_size` 件の entity を確保することよりも、`limit` パラメータで指定されたグループ数を満たすことを優先します。このアプローチは、データ分布が不均一な場合に一般的により効率的です。

追加のパラメータ詳細については、[search](/reference/python/python/Vector-search) を参照してください。

## Order groups by a scalar field | ONDEMAND\{#order-groups-by-a-scalar-field}

Grouping Search を `order_by_fields` と組み合わせて、scalar field によってグループを並べ替えることができます。これは、グループ間で多様な結果を得たい一方で、価格や評価のようなビジネス上重要な順序に従ってグループを並べたい場合に有用です。

次の例では、検索結果を `category` でグループ化し、グループごとに最大 3 つの entity を返し、返されたグループを `price` の低い順に並べます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="product_catalog",
    data=query_vectors,
    anns_field="embedding",
    limit=20,
    group_by_field="category",
    group_size=3,
    strict_group_size=True,
    output_fields=["category", "price", "rating"],
    # highlight-start
    order_by_fields=[
        {"field": "price", "order": "asc"}
    ],
    # highlight-end
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
// nodejs
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
// cpp
```

</TabItem>
</Tabs>

上記のリクエストでは、`limit=20` は Zilliz Cloud が 20 件の entity ではなく、最大 20 グループを選択することを意味します。`group_size=3` のため、フラットな結果リストには合計で最大 60 件の entity が含まれる可能性があります。

`group_by_field` とともに `order_by_fields` を使用すると、Zilliz Cloud は各グループの最上位 entity の指定された scalar field 値に基づいてグループを並べ替えます。各グループ内では、entity は引き続き query vector に対する類似度スコア順に並びます。

## Considerations\{#considerations}

- **グループ数**: `limit` パラメータは、各グループ内の具体的な entity 数ではなく、検索結果を返すグループ数を制御します。適切な `limit` を設定することで、検索の多様性とクエリ性能を制御しやすくなります。データが高密度に分布している場合や性能が懸念される場合は、`limit` を小さくすることで計算コストを削減できます。

- **グループごとの entity 数**: `group_size` パラメータは、グループごとに返される entity 数を制御します。ユースケースに応じて `group_size` を調整することで、検索結果の豊かさを高めることができます。ただし、データ分布が不均一な場合、一部のグループでは、特にデータが限られているシナリオで、`group_size` で指定した数より少ない entity しか返されないことがあります。

- **厳密なグループサイズ**: `strict_group_size=True` の場合、システムは、そのグループ内に十分なデータがない場合を除き、各グループに対して指定された数の entity（`group_size`）を返そうとします。この設定によりグループごとの entity 数の一貫性が確保されますが、データ分布が不均一な場合やリソースが限られている場合には、性能低下を招く可能性があります。厳密な entity 数が不要な場合は、`strict_group_size=False` に設定することでクエリ速度を向上できます。

- query vector がすでに対象 collection に存在する場合は、検索前に取得する代わりに `ids` を使用することを検討してください。詳細については、[Primary-Key Search](./primary-key-search) を参照してください。

