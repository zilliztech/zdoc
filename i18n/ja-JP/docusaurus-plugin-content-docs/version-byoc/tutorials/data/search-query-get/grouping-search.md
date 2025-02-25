---
title: "グループ検索 | BYOC"
slug: /grouping-search
sidebar_label: "グループ検索"
beta: FALSE
notebook: FALSE
description: "グルーピング検索により、Zilliz Cloudは、指定されたフィールドの値によって検索結果をグループ化して、より高いレベルでデータを集計することができます。たとえば、基本的なANN検索を使用して、手元の本に似た本を見つけることができますが、グルーピング検索を使用して、その本で議論されているトピックに関連する書籍カテゴリを見つけることができます。このトピックでは、グルーピング検索の使用方法と主要な考慮事項について説明します。 | BYOC"
type: origin
token: Gx9Cw3Niqiq9p7kqEgXcaQNmnmc
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - grouping search
  - group
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# グループ検索

グルーピング検索により、Zilliz Cloudは、指定されたフィールドの値によって検索結果をグループ化して、より高いレベルでデータを集計することができます。たとえば、基本的なANN検索を使用して、手元の本に似た本を見つけることができますが、グルーピング検索を使用して、その本で議論されているトピックに関連する書籍カテゴリを見つけることができます。このトピックでは、グルーピング検索の使用方法と主要な考慮事項について説明します。

## 概要について{#overview}

検索結果のエンティティがスカラーフィールドで同じ値を共有する場合、特定の属性で類似していることを示し、検索結果に悪影響を与える可能性があります。

コレクションには複数のドキュメント(**docId**で示される)が格納されていると仮定します。ドキュメントをベクトルに変換する際に可能な限り多くの意味情報を保持するために、各ドキュメントはより小さく、管理しやすい段落(または**チャンク**)に分割され、別々のエンティティとして格納されます。ドキュメントがより小さなセクションに分割されていても、ユーザーはしばしば自分のニーズに最も関連するドキュメントを特定することに興味を持ちます。

![GiojwPBydhBLhpbSYq1cuNVdnvd](/byoc/ja-JP/GiojwPBydhBLhpbSYq1cuNVdnvd.png)

このようなコレクションに対して近似最近傍法(ANN)検索を実行すると、検索結果に同じドキュメントから複数の段落が含まれる可能性があり、他のドキュメントが見落とされる可能性があり、意図したユースケースと一致しない可能性があります。

![JLeewIiPlhSaPeblU5TcxA2wnmg](/byoc/ja-JP/JLeewIiPlhSaPeblU5TcxA2wnmg.png)

検索結果の多様性を向上させるために、検索リクエストに`group_by_field`パラメータを追加してグルーピング検索を有効にすることができます。図に示すように、`group_by_field`を`docId`に設定できます。このリクエストを受け取ると、Zilliz Cloudは次のようになります:

- 提供されたクエリベクトルに基づいてANN検索を実行し、クエリに最も似ているすべてのエンティティを検索します。

- docIdなどの指定した`group_by_field`で検索結果をグループ化しま`す`。

- 各グループについて、`limit`パラメータで定義された上位の結果と、各グループから最も類似したエンティティを返します。

<Admonition type="info" icon="📘" title="ノート">

<p>デフォルトでは、グループごとに1つのエンティティのみが返されます。グループごとに返す結果の数を増やしたい場合は、<code>group_size</code>および<code>strict_group_size</code>パラメータで制御できます。</p>

</Admonition>

## グループ化検索を実行する{#perform-grouping-search}

このセクションでは、Grouping Searchの使用例を示します。次の例では、コレクションに`id`、`vector`、`chunk`、および`docId`のフィールドが含まれていることを前提としています。

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

検索リクエストで、`group_by_field`と`output_fields`の両方を`docId`に設定します。Zilliz Cloudは、指定されたフィールドで結果をグループ化し、各グループから最も類似したエンティティを返します。返されたエンティティの`docId`の値も含まれます。

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
    collection_name="group_search_collection",
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
        .collectionName("group_search_collection")
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
// nolint
func ExampleClient_Search_grouping() {
    ctx, cancel := context.WithCancel(context.Background())
    defer cancel()

    milvusAddr := "YOUR_CLUSTER_ENDPOINT"
    token := "YOUR_CLUSTER_TOKEN"

    cli, err := client.New(ctx, &client.ClientConfig{
        Address: milvusAddr,
        APIKey:  token,
    })
    if err != nil {
        log.Fatal("failed to connect to milvus server: ", err.Error())
    }

    defer cli.Close(ctx)

    queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

    resultSets, err := cli.Search(ctx, client.NewSearchOption(
        "my_collection", // collectionName
        3,               // limit
        []entity.Vector{entity.FloatVector(queryVector)},
    ).WithGroupByField("docId"))
    if err != nil {
        log.Fatal("failed to perform basic ANN search collection: ", err.Error())
    }

    for _, resultSet := range resultSets {
        log.Println("IDs: ", resultSet.IDs)
        log.Println("Scores: ", resultSet.Scores)
    }
    // Output:
    // IDs:
    // Scores:
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
-d '{
    "collectionName": "group_search_collection",
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

上記のリクエストでは、`limit=3`は、システムが3つのグループから検索結果を返すことを示しています。各グループには、クエリベクトルに最も似た単一のエンティティが含まれています。

## グループの体格を設定{#configure-group-size}

デフォルトでは、グループごとに1つのエンティティのみが返されます。グループごとに複数の結果を取得したい場合は、`group_size`と`strict_group_size`パラメータを調整してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Group search results

res = client.search(
    collection_name="group_search_collection", 
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
        .collectionName("group_search_collection")
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
-d '{
    "collectionName": "group_search_collection",
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

上記の例では:

- `group_size`:グループごとに返すエンティティの数を指定します。例えば、`group_size=2`と設定すると、各グループ（または各`docId`）は最も似た段落（または**チャンク**）を2つ返すことが理想的です。`group_size`が設定されていない場合、システムはデフォルトでグループごとに1つの結果を返します。

- `strict_group_size`:このブールパラメータは、group_sizeによって設定されたカウントをシステムが厳密に強制するかどうかを制御します。`strict_group_size=True`の場合、システムは各グループに`group_size`で指定されたエンティティの正確な数(例: 2段落)を含めようとしますが、そのグループに十分なデータがない場合を除きます。デフォルトでは(`strict_group_size=False`)、システムは各グループに`group_sizeエンティティが含まれていることを確認するのではなく、limit`パラメータで指定されたグループの数を満たすことを優先します。このアプローチは、データ分布が不均等な場合に一般的により効率的です。

パラメータの詳細については、[検索](/reference/python/python/Vector-search)を参照してください。

## 考慮事項{#considerations}

- **グループの数**:`limit`パラメータは、各グループ内の特定のエンティティの数ではなく、検索結果が返されるグループの数を制御します。適切な`制限`を設定することで、検索の多様性とクエリのパフォーマンスを制御できます。`制限`を減らすことで、データが密集している場合やパフォーマンスが懸念される場合に計算コストを削減できます。

- **グループごと**のエンティティ:`group_size`パラメータは、グループごとに返されるエンティティの数を制御します。ユースケースに基づいて`group_size`を調整すると、検索結果の豊富さが増します。ただし、データが不均等に分布している場合、特に限られたデータシナリオでは、`group_size`で指定された数よりも少ないエンティティが返される場合があります。

- **Strict group体格**: When`strict_group_size=True`,システムは、各グループに対して指定された数のエンティティ(`group_size`)を返そうとします。ただし、そのグループに十分なデータがない場合は除きます。この設定により、グループごとに一貫したエンティティ数が保証されますが、不均等なデータ分布や限られたリソースによるパフォーマンスの低下につながる可能性があります。厳密なエンティティ数が必要でない場合は、`strict_group_size=False`を設定することでクエリ速度を向上させることができます。

