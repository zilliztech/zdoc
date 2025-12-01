---
title: "グループ検索 | BYOC"
slug: /grouping-search
sidebar_label: "グループ検索"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "グループ検索により、Zilliz Cloudは検索結果を指定されたフィールドの値でグループ化し、データをより高いレベルで集約できます。たとえば、基本的なANN検索を使用して手元の本に類似した本を見つけることができますが、グループ検索を使用してその本で議論されているトピックに関連する本のカテゴリを見つけることもできます。このトピックでは、グループ検索の使用方法と主要な考慮事項について説明します。 | BYOC"
type: origin
token: JWZGw89MBiUDBNkhtGfcyyUcnsd
sidebar_position: 5
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - グループ検索
  - グループ
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルデータベース比較

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# グループ検索

グループ検索により、Zilliz Cloudは検索結果を指定されたフィールドの値でグループ化し、データをより高いレベルで集約できます。たとえば、基本的なANN検索を使用して手元の本に類似した本を見つけることができますが、グループ検索を使用してその本で議論されているトピックに関連する本のカテゴリを見つけることもできます。このトピックでは、グループ検索の使用方法と主要な考慮事項について説明します。

## 概要\{#overview}

検索結果のエンティティがスカラーフィールドで同じ値を共有する場合、これは特定の属性において類似していることを示しており、検索結果に悪影響を与える可能性があります。

コレクションが複数のドキュメント（**docId**で示される）を格納していると仮定します。ドキュメントをベクトルに変換する際にできるだけ多くのセマンティック情報を保持するため、各ドキュメントは小さな管理しやすい段落（または**chunks**）に分割され、個別にエンティティとして格納されます。ドキュメントが小さなセクションに分割されていても、ユーザーは多くの場合、自分のニーズに最も関連するドキュメントを特定することに興味があります。

![LhJEwzWiphLWxobMaiCcbVDPnNb](/img/LhJEwzWiphLWxobMaiCcbVDPnNb.png)

このようなコレクションに対して近似最近傍(ANN)検索を実行すると、検索結果に同じドキュメントからの複数の段落が含まれる可能性があり、他のドキュメントが見落とされる可能性があり、意図したユースケースに合致しない可能性があります。

![Ktj8wigrHhvz4nbDES5coKZJnZe](/img/Ktj8wigrHhvz4nbDES5coKZJnZe.png)

検索結果の多様性を向上させるために、検索リクエストに`group_by_field`パラメータを追加してグループ検索を有効にできます。図に示すように、`group_by_field`を`docId`に設定できます。このリクエストを受け取ると、Zilliz Cloudは以下のことを行います。

- 提供されたクエリベクトルに基づいてANN検索を実行し、クエリに最も類似したすべてのエンティティを見つけます。

- 指定された`group_by_field`（例：`docId`）で検索結果をグループ化します。

- 各グループからの上位結果を返します。これは`limit`パラメータで定義され、各グループから最も類似したエンティティです。

<Admonition type="info" icon="📘" title="注釈">

<p>デフォルトでは、グループ検索はグループごとに1つのエンティティのみを返します。グループごとに返される結果数を増やしたい場合は、<code>group_size</code>および<code>strict_group_size</code>パラメータで制御できます。</p>

</Admonition>

## グループ検索の実行\{#perform-grouping-search}

このセクションでは、グループ検索の使用方法を示す例コードを提供します。以下の例では、コレクションに`id`、`vector`、`chunk`、および`docId`のフィールドが含まれていると仮定します。

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

検索リクエストで`group_by_field`と`output_fields`の両方を`docId`に設定します。Zilliz Cloudは結果を指定されたフィールドでグループ化し、各グループから最も類似したエンティティを返します。各返されたエンティティには`docId`の値も含まれます。

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

# グループ検索結果
res = client.search(
    collection_name="my_collection",
    data=query_vectors,
    limit=3,
    group_by_field="docId",
    output_fields=["docId"]
)

# `docId`列の値を取得
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

// `docId`列の値を取得
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

上記のリクエストでは、`limit=3`はシステムが3つのグループからの検索結果を返すことを示しており、各グループにはクエリベクトルに最も類似した単一のエンティティが含まれます。

## グループサイズの設定\{#configure-group-size}

デフォルトでは、グループ検索はグループごとに1つのエンティティのみを返します。グループごとに複数の結果が必要な場合は、`group_size`および`strict_group_size`パラメータを調整してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# グループ検索結果

res = client.search(
    collection_name="my_collection",
    data=query_vectors, # クエリベクトル
    limit=5, # 返すグループ数
    group_by_field="docId", # グループ化フィールド
    group_size=2, # 各グループから最大2つのエンティティを返す
    strict_group_size=True, # 各グループから正確に2つのエンティティを返す
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

// `docId`列の値を取得
var docIds = res.results.map(result => result.entity.docId)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
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

上記の例では：

- `group_size`: グループごとに返すエンティティの希望数を指定します。例えば、`group_size=2`を設定すると、各グループ（または各`docId`）は理想的には最も類似した2つの段落（または**chunks**）を返します。`group_size`が設定されていない場合、システムはグループごとに1つの結果を返すデフォルトになっています。

- `strict_group_size`: このブール型パラメータは、システムが`group_size`で設定された数を厳密に強制するかどうかを制御します。`strict_group_size=True`の場合、システムは各グループに`group_size`で指定された正確な数のエンティティ（例：2つの段落）を含めようとします。ただし、そのグループに十分なデータがない場合は除きます。デフォルト（`strict_group_size=False`）では、システムは各グループが`group_size`エンティティを含んでいることを確認するよりも、`limit`パラメータで指定されたグループ数を満たすことを優先します。このアプローチは、データ分布が不均一な場合に一般的により効率的です。

追加パラメータの詳細については、[検索](/reference/python/python/Vector-search)を参照してください。

## 考慮事項\{#considerations}

- **グループ数**: `limit`パラメータは、各グループ内のエンティティ数ではなく、検索結果が返されるグループ数を制御します。適切な`limit`を設定すると、検索の多様性とクエリのパフォーマンスを制御できます。データの分布が密またはパフォーマンスが懸念事項である場合、`limit`を減らすことで計算コストを削減できます。

- **グループあたりのエンティティ数**: `group_size`パラメータはグループごとに返されるエンティティ数を制御します。使用ケースに応じて`group_size`を調整することで、検索結果の豊かさを高めることができます。ただし、データが不均一に分布している場合、一部のグループは`group_size`で指定されたよりも少ないエンティティを返す場合があり、特にデータが限られている状況で顕著です。

- **厳格なグループサイズ**: `strict_group_size=True`の場合、システムはそのグループに十分なデータがない限り、各グループに対して指定された数のエンティティ（`group_size`）を返そうとします。この設定はグループごとのエンティティ数を一貫させますが、データ分布が不均一またはリソースが限られている場合にパフォーマンスが低下する可能性があります。厳格なエンティティ数が必要でない場合は、`strict_group_size=False`を設定することでクエリ速度を向上させることができます。