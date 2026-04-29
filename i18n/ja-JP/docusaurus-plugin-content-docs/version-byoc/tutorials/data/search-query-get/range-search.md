---
title: "範囲検索 | BYOC"
slug: /range-search
sidebar_key: range-search
sidebar_label: "範囲検索"
beta: FALSE
notebook: FALSE
description: "範囲検索は、返されるエンティティの距離またはスコアを特定の範囲に制限することで、検索結果の関連性を向上させます。このページでは、範囲検索の概要とその実行手順について説明します。 | BYOC"
type: origin
token: GnvtwMeQWi8iRCk7dGccCBQZnOh
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - 範囲検索

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Range Search

レンジ検索（Range Search）は、返されるエンティティの距離またはスコアを特定の範囲内に制限することで、検索結果の関連性を向上させます。このページでは、レンジ検索とは何か、およびレンジ検索を実行する手順について説明します。

## 概要\{#overview}

レンジ検索リクエストを実行する際、Zilliz Cloud は ANN 検索結果からクエリベクトルと最も類似したベクトルを取得し、それを中心として、検索リクエストで指定された **radius** を外円の半径、**range_filter** を内円の半径とする2つの同心円を描きます。これらの同心円によって形成される環状領域内に類似度スコアが収まるすべてのベクトルが返されます。ここで、**range_filter** は **0** に設定することも可能であり、その場合、指定された類似度スコア（radius）内のすべてのエンティティが返されます。

![Sewjwp5DShFgKAbC1Mwcrr7enOD](https://zdoc-images.s3.us-west-2.amazonaws.com/Sewjwp5DShFgKAbC1Mwcrr7enOD.png)

上記の図は、レンジ検索リクエストが **radius** および **range_filter** の2つのパラメータを持つことを示しています。Zilliz Cloud はレンジ検索リクエストを受信すると、以下の処理を行います。

- 指定されたメトリックタイプ（**COSINE**）を使用して、クエリベクトルと最も類似したすべてのベクトル埋め込みを検出します。

- クエリベクトルとの**距離**または**スコア**が **radius** および **range_filter** パラメータで指定された範囲内に収まるベクトル埋め込みをフィルタリングします。

- フィルタリングされた結果の中から **top-K** エンティティを返します。

**radius** および **range_filter** の設定方法は、検索で使用するメトリックタイプによって異なります。次の表は、異なるメトリックタイプにおけるこれらの2つのパラメータの設定要件を示しています。

<table>
   <tr>
     <th><p>メトリックタイプ</p></th>
     <th><p>Denotations</p></th>
     <th><p>Requirements for Setting radius and range_filter</p></th>
   </tr>
   <tr>
     <td><p><code>L2</code></p></td>
     <td><p>A smaller L2 distance indicates a higher similarity.</p></td>
     <td><p>To ignore the most similar vector embeddings, ensure that</p><p><code>range_filter</code> &lt;= distance &lt; <code>radius</code></p></td>
   </tr>
   <tr>
     <td><p><code>IP</code></p></td>
     <td><p>A greater IP distance indicates a higher similarity.</p></td>
     <td><p>To ignore the most similar vector embeddings, ensure that</p><p><code>radius</code> &lt; distance &lt;= <code>range_filter</code></p></td>
   </tr>
   <tr>
     <td><p><code>COSINE</code></p></td>
     <td><p>A greater COSINE distance indicates a higher similarity.</p></td>
     <td><p>To ignore the most similar vector embeddings, ensure that</p><p><code>radius</code> &lt; distance &lt;= <code>range_filter</code></p></td>
   </tr>
   <tr>
     <td><p><code>JACCARD</code></p></td>
     <td><p>A smaller Jaccard distance indicates a higher similarity.</p></td>
     <td><p>To ignore the most similar vector embeddings, ensure that</p><p><code>range_filter</code> &lt;= distance &lt; <code>radius</code></p></td>
   </tr>
   <tr>
     <td><p><code>HAMMING</code></p></td>
     <td><p>A smaller ハミング distance indicates a higher similarity.</p></td>
     <td><p>To ignore the most similar vector embeddings, ensure that</p><p><code>range_filter</code> &lt;= distance &lt; <code>radius</code></p></td>
   </tr>
</table>

## 例\{#examples}

このセクションでは、レンジ検索の実行方法を示します。以下のコードスニペットの検索リクエストにはメトリックタイプが指定されていないため、デフォルトのメトリックタイプ **COSINE** が適用されます。この場合、**radius** の値が **range_filter** の値より小さくなるようにしてください。

以下のコードスニペットでは、`radius` を `0.4`、`range_filter` を `0.6` に設定することで、Zilliz Cloud はクエリベクトルとの距離またはスコアが **0.4** から **0.6** の範囲内に収まるすべてのエンティティを返します。

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
 io.milvus.v2.service.vector.request.SearchReq
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp

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

<TabItem value='java'>

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

<TabItem value='java'>

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

<TabItem value='java'>

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
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>クエリベクトルがすでにターゲットコレクションに存在する場合は、検索前にそれらを取得する代わりに、<code>ids</code> を使用することを検討してください。詳細については、<a href="./primary-key-search">Primary-キー Search</a> を参照してください。</p>

</Admonition>