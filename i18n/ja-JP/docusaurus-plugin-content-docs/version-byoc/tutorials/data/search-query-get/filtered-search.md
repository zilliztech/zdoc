---
title: "フィルター検索 | BYOC"
slug: /filtered-search
sidebar_label: "フィルター検索"
beta: FALSE
notebook: FALSE
description: "ANN検索は、指定されたベクトル埋め込みに最も似たベクトル埋め込みを見つけます。ただし、検索結果が常に正しいとは限りません。検索リクエストにフィルタリング条件を含めることで、Zilliz CloudがANN検索を実行する前にメタデータフィルタリングを実行し、指定されたフィルタリング条件に一致するエンティティのみに検索範囲を縮小できます。 | BYOC"
type: origin
token: JDIXwKfxWi5Xpgk9KiMcuLzXnud
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - filtered search
  - filtering
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# フィルター検索

ANN検索は、指定されたベクトル埋め込みに最も似たベクトル埋め込みを見つけます。ただし、検索結果が常に正しいとは限りません。検索リクエストにフィルタリング条件を含めることで、Zilliz CloudがANN検索を実行する前にメタデータフィルタリングを実行し、指定されたフィルタリング条件に一致するエンティティのみに検索範囲を縮小できます。

## 概要について{#overview}

Zilliz Cloudでは、フィルタリングされた検索は、適用される段階に応じて、**標準フィルタリング**と**反復フィルタリング**の2種類に分類されます。

### 標準フィルタリング{#standard-filtering}

コレクションにベクトル埋め込みとメタデータの両方が含まれている場合、ANN検索の前にメタデータをフィルタリングして、検索結果の関連性を向上させることができます。Zilliz Cloudがフィルタリング条件を持つ検索リクエストを受信すると、指定されたフィルタリング条件に一致するエンティティ内で検索範囲が制限されます。

![PJ8Aw3h8xh0OyEbrkPUctjpnnHf](/byoc/ja-JP/PJ8Aw3h8xh0OyEbrkPUctjpnnHf.png)

上の図に示されているように、検索リクエストには`chunk like "%red%"`がフィルタリング条件として含まれており、Zilliz Cloudは、`red`という単語が`chunk`フィールドに含まれるすべてのエンティティ内でANN検索を実行する必要があることを示しています。具体的には、Zilliz Cloudは以下のように行います:

- 検索リクエストに含まれるフィルタリング条件に一致するエンティティをフィルタリングします。

- フィルターされたエンティティ内でANN検索を実行します。

- 上位K個のエンティティを返します。

### 反復フィルタリング{#iterative-filtering}

標準的なフィルタリング過程は、検索範囲を効果的に狭くします。ただし、過度に複雑なフィルタリング式は、非常に高い検索レイテンシを引き起こす可能性があります。このような場合、反復フィルタリングは代替手段として機能し、スカラーフィルタリングの作業負荷を軽減するのに役立ちます。

![TIPww02ZHh0ghAb0izVcANQfntd](/byoc/ja-JP/TIPww02ZHh0ghAb0izVcANQfntd.png)

上記の図に示されているように、反復フィルタリングを使用した検索は反復でベクトル検索を実行します。イテレータによって返される各エンティティはスカラーフィルタリングを受け、この過程は指定されたtopKの結果が得られるまで続きます。

この方法は、スカラーフィルタリングの対象となるエンティティの数を大幅に減らし、非常に複雑なフィルタリング式を処理するために特に有益です。

ただし、イテレータはエンティティを1つずつ処理することに注意することが重要です。この連続的なアプローチは、特に多数のエンティティがスカラーフィルタリングの対象となる場合、処理時間が長くなったり、パフォーマンスの問題が発生する可能性があります。

## 例例{#examples}

このセクションでは、フィルタリングされた検索を実行する方法を示します。このセクションのコードスニペットは、コレクションに次のエンティティがすでにあることを前提としています。各エンティティには、**id**、**vector**、**color**、**likes**の4つのフィールドがあります。

```json
[
    {"id": 0, "vector": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], "color": "pink_8682", "likes": 165},
    {"id": 1, "vector": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], "color": "red_7025", "likes": 25},
    {"id": 2, "vector": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], "color": "orange_6781", "likes": 764},
    {"id": 3, "vector": [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], "color": "pink_9298", "likes": 234},
    {"id": 4, "vector": [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], "color": "red_4794", "likes": 122},
    {"id": 5, "vector": [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], "color": "yellow_4222", "likes": 12},
    {"id": 6, "vector": [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], "color": "red_9392", "likes": 58},
    {"id": 7, "vector": [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], "color": "grey_8510", "likes": 775},
    {"id": 8, "vector": [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], "color": "white_9381", "likes": 876},
    {"id": 9, "vector": [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], "color": "purple_4976", "likes": 765}
]
```

### 標準フィルタリングで検索{#search-with-standard-filtering}

次のコードスニペットの検索要求には、フィルタリング条件といくつかの出力フィールドが含まれています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = client.search(
    collection_name="my_collection",
    data=[query_vector],
    limit=5,
    # highlight-start
    filter='color like "red%" and likes > 50',
    output_fields=["color", "likes"]
    # highlight-end
)

for hits in res:
    print("TopK results:")
    for hit in hits:
        print(hit)
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

FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("filtered_search_collection")
        .data(Collections.singletonList(queryVector))
        .topK(5)
        .filter("color like \"red%\" and likes > 50")
        .outputFields(Arrays.asList("color", "likes"))
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
// SearchResp.SearchResult(entity={color=red_4794, likes=122}, score=0.5975797, id=4)
// SearchResp.SearchResult(entity={color=red_9392, likes=58}, score=-0.24996188, id=6)
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v2"
    "github.com/milvus-io/milvus/client/v2/entity"
)

func ExampleClient_Search_filter() {
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
                "filtered_search_collection", // collectionName
                3,             // limit
                []entity.Vector{entity.FloatVector(queryVector)},
        ).WithFilter(`color like "red%" and likes > 50`).WithOutputFields("color", "likes"))
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

const query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

const res = await client.search({
    collection_name: "filtered_search_collection",
    data: [query_vector],
    limit: 5,
    // highlight-start
    filters: 'color like "red%" and likes > 50',
    output_fields: ["color", "likes"]
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
    "collectionName": "quick_setup",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    ],
    "annsField": "vector",
    "filter": "color like \"red%\" and likes > 50",
    "limit": 3,
    "outputFields": ["color", "likes"]
}'
# {"code":0,"cost":0,"data":[]}
```

</TabItem>
</Tabs>

検索リクエストに含まれるフィルタリング条件は、`color like"red%"and likes>50`となっています。and演算子を使用して、2つの条件を含めます。最初の条件は、`red`で始まる値を持つエンティティを`カラー`フィールドに入力することを要求し、もう1つの条件は、`50`以上の値を持つエンティティを`likesフィールド`に入力することを要求します。これらの要件を満たすエンティティは2つしかありません。top-Kを`3`に設定した場合、Zilliz Cloudは、これら2つのエンティティ間のクエリベクトルまでの距離を計算し、検索結果として返します。

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

メタデータフィルタリングで使用できる演算子の詳細については、「[フィルタリング](./filtering)」を参照してください。

### 反復フィルタリングによる検索{#search-with-iterative-filtering}

反復フィルタリングでフィルタリングされた検索を実行するには、次のように行うことができます:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = client.search(
    collection_name="my_collection",
    data=[query_vector],
    limit=5,
    # highlight-start
    filter='color like "red%" and likes > 50',
    output_fields=["color", "likes"],
    search_params={
        "hints": "iterative_filter"
    }
    # highlight-end
)

for hits in res:
    print("TopK results:")
    for hit in hits:
        print(hit)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("filtered_search_collection")
        .data(Collections.singletonList(queryVector))
        .topK(5)
        .filter("color like \"red%\" and likes > 50")
        .outputFields(Arrays.asList("color", "likes"))
        .searchParams(new HashMap<>("hints", "iterative_filter"))
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
// SearchResp.SearchResult(entity={color=red_4794, likes=122}, score=0.5975797, id=4)
// SearchResp.SearchResult(entity={color=red_9392, likes=58}, score=-0.24996188, id=6)
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v2"
    "github.com/milvus-io/milvus/client/v2/entity"
)

func ExampleClient_Search_filter() {
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
                "filtered_search_collection", // collectionName
                3,             // limit
                []entity.Vector{entity.FloatVector(queryVector)},
        ).WithFilter(`color like "red%" and likes > 50`).WithHints("iterative_filter").WithOutputFields("color", "likes"))
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

const query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

const res = await client.search({
    collection_name: "filtered_search_collection",
    data: [query_vector],
    limit: 5,
    // highlight-start
    filters: 'color like "red%" and likes > 50',
    hints: "iterative_filter",
    output_fields: ["color", "likes"]
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
    "collectionName": "quick_setup",
    "data": [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    ],
    "annsField": "vector",
    "filter": "color like \"red%\" and likes > 50",
    "searchParams": {"hints": "iterative_filter"},
    "limit": 3,
    "outputFields": ["color", "likes"]
}'
# {"code":0,"cost":0,"data":[]}
```

</TabItem>
</Tabs>

