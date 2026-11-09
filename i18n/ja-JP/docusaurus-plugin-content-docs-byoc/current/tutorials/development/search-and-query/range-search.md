---
title: "範囲検索 | BYOC"
slug: /range-search
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "範囲検索は、返されるエンティティの距離またはスコアを特定の範囲内に制限することで、検索結果の関連性を向上させます。このページでは、範囲検索とは何か、および範囲検索を実行する手順について説明します。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-range-search
sidebar_label: "範囲検索"
sidebar_position: 5
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/search-query-get/range-search.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 範囲検索

範囲検索は、返されるエンティティの距離またはスコアを特定の範囲内に制限することで、検索結果の関連性を向上させます。このページでは、範囲検索とは何か、および範囲検索を実行する手順について説明します。

## 概要\{#overview}

範囲検索リクエストを実行するとき、Zilliz Cloud は ANN 検索結果からクエリベクトルに最も類似したベクトルを中心とし、検索リクエストで指定された **radius** を外側の円の半径、**range_filter** を内側の円の半径として、2 つの同心円を描きます。これら 2 つの同心円によって形成される環状領域内に類似度スコアが収まるすべてのベクトルが返されます。ここで、**range_filter** は **0** に設定することもでき、指定された類似度スコア（radius）内のすべてのエンティティが返されることを示します。

![範囲検索](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/a1262835b1dccdb74db1547db60c502babdba94fd63814728b1e38ad140ebc9f.png)

上の図が示すように、範囲検索リクエストには **radius** と **range_filter** の 2 つのパラメータが含まれます。範囲検索リクエストを受信すると、Zilliz Cloud は次の処理を行います。

- 指定されたメトリクスタイプ（**COSINE**）を使用して、クエリベクトルに最も類似したすべてのベクトル埋め込みを見つけます。

- クエリベクトルに対する **距離** または **スコア** が、**radius** および **range_filter** パラメータで指定された範囲内に収まるベクトル埋め込みをフィルタリングします。

- フィルタリングされたものの中から **top-K** のエンティティを返します。

**radius** と **range_filter** の設定方法は、検索のメトリクスタイプによって異なります。次の表は、異なるメトリクスタイプでこれら 2 つのパラメータを設定する際の要件をまとめたものです。

<table>
   <tr>
     <th><p>メトリクスタイプ</p></th>
     <th><p>距離の意味</p></th>
     <th><p>radius と range_filter を設定する際の要件</p></th>
   </tr>
   <tr>
     <td><p><code>L2</code></p></td>
     <td><p>L2 距離が小さいほど、類似度が高くなります。</p></td>
     <td><p>最も類似したベクトル埋め込みを除外するには、次の条件を満たすようにしてください。</p><p><code>range_filter</code> &lt;= distance &lt; <code>radius</code></p></td>
   </tr>
   <tr>
     <td><p><code>IP</code></p></td>
     <td><p>IP 距離が大きいほど、類似度が高くなります。</p></td>
     <td><p>最も類似したベクトル埋め込みを除外するには、次の条件を満たすようにしてください。</p><p><code>radius</code> &lt; distance &lt;= <code>range_filter</code></p></td>
   </tr>
   <tr>
     <td><p><code>COSINE</code></p></td>
     <td><p>COSINE 距離が大きいほど、類似度が高くなります。</p></td>
     <td><p>最も類似したベクトル埋め込みを除外するには、次の条件を満たすようにしてください。</p><p><code>radius</code> &lt; distance &lt;= <code>range_filter</code></p></td>
   </tr>
   <tr>
     <td><p><code>JACCARD</code></p></td>
     <td><p>Jaccard 距離が小さいほど、類似度が高くなります。</p></td>
     <td><p>最も類似したベクトル埋め込みを除外するには、次の条件を満たすようにしてください。</p><p><code>range_filter</code> &lt;= distance &lt; <code>radius</code></p></td>
   </tr>
   <tr>
     <td><p><code>HAMMING</code></p></td>
     <td><p>Hamming 距離が小さいほど、類似度が高くなります。</p></td>
     <td><p>最も類似したベクトル埋め込みを除外するには、次の条件を満たすようにしてください。</p><p><code>range_filter</code> &lt;= distance &lt; <code>radius</code></p></td>
   </tr>
</table>

## 例\{#examples}

このセクションでは、範囲検索を実行する方法を説明します。以下のコードスニペットの検索リクエストにはメトリクスタイプが指定されていないため、デフォルトのメトリクスタイプである **COSINE** が適用されます。この場合、**radius** の値が **range_filter** の値より小さくなるようにしてください。

以下のコードスニペットでは、クエリベクトルに対する距離またはスコアが **0.4** から **0.6** の範囲に収まるすべてのエンティティを Zilliz Cloud が返すように、`radius` を `0.4`、`range_filter` を `0.6` に設定しています。


<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
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
    limit=3,
    search_params={
        # highlight-start
        "params": {
            "radius": 0.4,
            "range_filter": 0.6
        }
        # highlight-end
    }
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
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
Map<String,Object> extraParams = new HashMap<>();
extraParams.put("radius", 0.4);
extraParams.put("range_filter", 0.6);
SearchReq searchReq = SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(queryVector))
        .topK(5)
        .searchParams(extraParams)
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
// SearchResp.SearchResult(entity={}, score=0.5975797, id=4)
// SearchResp.SearchResult(entity={}, score=0.46704385, id=5)
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/index"
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

annParam := index.NewCustomAnnParam()
annParam.WithRadius(0.4)
annParam.WithRangeFilter(0.6)
resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "my_collection", // collectionName
    5,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithConsistencyLevel(entity.ClStrong).
    WithANNSField("vector").
    WithAnnParam(annParam))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let query_vector = vec![0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];

let response = client
    .search(
        SearchRequest::builder()
            .collection_name("my_collection")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .limit(5)
            .radius(0.4)
            .range_filter(0.6)
            .build()?,
    )
    .await?;

println!("TopK results:");
for result in response.results() {
    for row in result.rows()? {
        println!("{:?}", row.to_entity_row()?);
    }
}
```

</TabItem>

<TabItem value='c++'>

```cpp
#include <iostream>
#include <vector>

#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cerr << "Failed to connect: " << status.Message() << std::endl;
    return;
}

std::vector<float> queryVector = {
    0.35803764F, -0.60234958F, 0.18414013F, -0.26286206F, 0.90294385F
};

auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("my_collection")
                         .WithAnnsField("vector")
                         .WithLimit(5)
                         .WithRadius(0.4)
                         .WithRangeFilter(0.6)
                         .AddFloatVector(queryVector);

milvus::SearchResponse searchResponse;
status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Search failed: " << status.Message() << std::endl;
    return;
}

for (const auto& result : searchResponse.Results().Results()) {
    const auto ids = result.Ids().IntIDArray();
    for (size_t i = 0; i < result.Scores().size(); ++i) {
        std::cout << "id=" << ids[i] << ", score=" << result.Scores()[i] << std::endl;
    }
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
    // highlight-start
    params: {
        "radius": 0.4,
        "range_filter": 0.6
    }
    // highlight-end
})
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Types;

MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});
await client.ConnectAsync();

float[] queryVector = [0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f];

SearchResp res = await client.SearchAsync(new SearchReq
{
    CollectionName = "my_collection",
    VectorFieldName = "vector",
    Vectors = [queryVector],
    Limit = 5,
    Parameters = new SearchParameters
    {
        // highlight-start
        Radius = "0.4",
        RangeFilter = "0.6",
        // highlight-end
        OutputFields = { "color" }
    }
});
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
    "limit": 5,
    "searchParams": {
        "params": {
            "radius": 0.4,
            "range_filter": 0.6
        }
    }
}'
# {"code":0,"cost":0,"data":[]}
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

zilliz vector search \
  --collection my_collection \
  --body '{
    "data": [
        [
            0.3580376395471989,
            -0.6023495712049978,
            0.18414012509913835,
            -0.26286205330961354,
            0.9029438446296592
        ]
    ],
    "annsField": "vector",
    "limit": 3,
    "searchParams": {
        "params": {
            "radius": 0.4,
            "range_filter": 0.6
        }
    }
}' \
  --output json
```

</TabItem>

</Tabs>


<Admonition type="info" icon="📘" title="Notes">

クエリベクトルがすでに対象のコレクションに存在する場合は、検索前にそれらを取得する代わりに `ids` を使用することを検討してください。詳細については、[Primary-Key Search](./primary-key-search) を参照してください。

</Admonition>
