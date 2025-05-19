---
title: "レンジ検索 | Cloud"
slug: /range-search
sidebar_label: "レンジ検索"
beta: FALSE
notebook: FALSE
description: "範囲検索は、特定の範囲内で返されるエンティティの距離またはスコアを制限することにより、検索結果の関連性を向上させます。このページでは、範囲検索と範囲検索を実行する手順を理解するのに役立ちます。 | Cloud"
type: origin
token: QAuiwFWVTiOJf6kQwAqcRFiOn5b
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - range search
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# レンジ検索

範囲検索は、特定の範囲内で返されるエンティティの距離またはスコアを制限することにより、検索結果の関連性を向上させます。このページでは、範囲検索と範囲検索を実行する手順を理解するのに役立ちます。

## 概要について{#overview}

範囲検索リクエストを実行する場合、Zilliz Cloudは、ANN検索結果のクエリベクトルに最も類似したベクトルを中心に、検索リクエストで指定された**半径**を外側の円の半径、**range_filter**を内側の円の半径として使用して、2つの同心円を描画します。これら2つの同心円によって形成される環状領域に含まれる類似度スコアを持つすべてのベクトルが返されます。ここで、**range_filter**を**0**に設定すると、指定された類似度スコア(半径)内のすべてのエンティティが返されます。

![JrMzwgnfvhxaFob5s5LcxxUxnPc](/img/JrMzwgnfvhxaFob5s5LcxxUxnPc.png)

上の図は、範囲検索リクエストが**半径**と**range_filter**の2つのパラメータを持っていることを示しています。範囲検索リクエストを受け取ると、Zilliz Cloudは次のようにします:

- 指定したメトリック型(**COSINE**)を使用して、クエリベクトルに最も似たすべてのベクトル埋め込みを検索します。

- クエリベクトルとの**距離**または**スコア**が**半径**および**range_filter**パラメーターで指定された範囲内にあるベクトル埋め込みをフィルター処理します。

- フィルタした図形から**上位K個の**図形を返します。

検索のメトリックタイプによって、**半径**と**range_filter**の設定方法が異なります。以下の表は、これら2つのパラメータを異なるメトリックタイプで設定するための要件を示しています。

<table>
   <tr>
     <th><p>メートルタイプ</p></th>
     <th><p>デノテーション</p></th>
     <th><p>半径と範囲フィルターの設定要件</p></th>
   </tr>
   <tr>
     <td><p><code>L 2</code></p></td>
     <td><p>L 2距離が小さいほど、類似度が高いことを示します。</p></td>
     <td><p>最も類似したベクトル埋め込みを無視するには、確認してください <code>range_filter</code>&lt;=距離&lt;<code>半径</code></p></td>
   </tr>
   <tr>
     <td><p><code>IP</code></p></td>
     <td><p>IP距離が大きいほど、類似度が高いことを示します。</p></td>
     <td><p>最も類似したベクトル埋め込みを無視するには、確認してください <code>半径</code>&lt;距離&lt;=<code>範囲フィルタ</code></p></td>
   </tr>
   <tr>
     <td><p><code>コサイン</code></p></td>
     <td><p>COSINE距離が大きいほど類似度が高いことを示します。</p></td>
     <td><p>最も類似したベクトル埋め込みを無視するには、確認してください <code>半径</code>&lt;距離&lt;=<code>範囲フィルタ</code></p></td>
   </tr>
   <tr>
     <td><p><code>ジャカード</code></p></td>
     <td><p>ジャッカード距離が小さいほど類似度が高いことを示す。</p></td>
     <td><p>最も類似したベクトル埋め込みを無視するには、確認してください <code>range_filter</code>&lt;=距離&lt;<code>半径</code></p></td>
   </tr>
   <tr>
     <td><p><code>ハミング</code></p></td>
     <td><p>ハミング距離が小さいほど類似度が高いことを示す。</p></td>
     <td><p>最も類似したベクトル埋め込みを無視するには、確認してください <code>range_filter</code>&lt;=距離&lt;<code>半径</code></p></td>
   </tr>
</table>

## 例例{#examples}

このセクションでは、範囲検索を実行する方法を示します。次のコードスニペットの検索要求にはメトリックタイプが含まれていないため、デフォルトのメトリックタイプである**COSINE**が適用されます。この場合、**半径**値が**range_filter**値よりも小さいことを確認してください。

以下のコードスニペットでは、`radius`を`0.4`、`range_filter`を`0.6`に設定して、Zilliz Cloudは、クエリベクトルとの距離またはスコアが**0.4**から**0.6**の範囲内にあるすべてのエンティティを返します。

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
        .collectionName("range_search_collection")
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
// TODO 
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
    collection_name: "range_search_collection",
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

