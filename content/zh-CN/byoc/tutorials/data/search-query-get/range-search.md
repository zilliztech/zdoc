---
title: "Range Search | BYOC"
slug: /range-search
sidebar_label: "Range Search"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Range Search 是一种通过指定搜索结果的相似度得分范围的方式提升 ANN Search 的召回质量的搜索增强方法。本节将介绍如何使用 Range Search 以及相关注意事项。 | BYOC"
type: origin
token: NZ3BwhuN0ip6MqkT4pQcqyO7nDd
sidebar_position: 4
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - search
  - 搜索
  - anns_field
  - filter
  - output fields
  - distance
  - score
  - range search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Range Search

Range Search 是一种通过指定搜索结果的相似度得分范围的方式提升 ANN Search 的召回质量的搜索增强方法。本节将介绍如何使用 Range Search 以及相关注意事项。

## 概述\{#overview}

在执行 Range Search 请求时，Zilliz Cloud 会以 ANN Search 搜索结果中与查询向量最相似的向量为圆心，以 Search 请求中指定的 **radius** 值为外圆半径，以 **range_filter** 为内圆半径画两个同心圆。所有相似度得分落在由这两个同心圆构成的圆环上的向量会被返回。其中，**range_filter** 可以设置为 **0**，表示返回指定相似度得分 （**radius**）以内的所有 Entity。

![UasowweO3hvOcCb1mZDc0EbunBd](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/UasowweO3hvOcCb1mZDc0EbunBd.png)

如上图所示，Search 请求中携带了 Range Search 特有的参数 **radius** 和 **range_filter**。当收到这样的 Search 请求时，Zilliz Cloud 会执行如下操作：

- 使用指定的相似度类型（**COSINE**）查找出与查询向量相似的所有向量。

- 根据指定的 **radius** 和 **range_filter** 过滤出相似性得分（**distance** 或 **score**）符合要求的向量。

- 从所有符合要求的向量中返回 **topK** 个结果。

值得注意的是，根据相似度类型的不同，radius 和 range_filter 的设置也不尽相同。

<table>
   <tr>
     <th><p><strong>相似度类型</strong></p></th>
     <th><p><strong>特点</strong></p></th>
     <th><p><strong>Range search 参数设置要求</strong></p></th>
   </tr>
   <tr>
     <td><p><code>L2</code></p></td>
     <td><p>较小的 L2 距离表示更高的相似性。</p></td>
     <td><p>要排除结果中最近的向量，请确保：</p><p><code>0</code> &lt;= <code>range_filter</code> &lt;= distance &lt; <code>radius</code> &lt; <code>∞</code></p></td>
   </tr>
   <tr>
     <td><p><code>IP</code></p></td>
     <td><p>较大的 IP 距离表示更高的相似性。</p></td>
     <td><p>要排除结果中最近的向量，请确保：</p><p><code>-1</code> &lt;= <code>radius</code> &lt; distance &lt;= <code>range_filter</code> &lt;= <code>1</code></p></td>
   </tr>
   <tr>
     <td><p><code>COSINE</code></p></td>
     <td><p>较大的 cosine 值表示更高的相似性。</p></td>
     <td><p>要排除结果中最近的向量，请确保：</p><p><code>-1</code> &lt;= <code>radius</code> &lt; distance &lt;= <code>range_filter</code> &lt;= <code>1</code></p></td>
   </tr>
   <tr>
     <td><p><code>JACCARD</code></p></td>
     <td><p>较小的 Jaccard 距离表示更高的相似性。</p></td>
     <td><p>要排除结果中最近的向量，请确保：</p><p><code>0</code> &lt;= <code>range_filter</code> &lt;= distance &lt; <code>radius</code> &lt;= <code>1</code></p></td>
   </tr>
   <tr>
     <td><p><code>HAMMING</code></p></td>
     <td><p>较小的 Hamming 距离表示更高的相似性。</p></td>
     <td><p>要排除结果中最近的向量，请确保：</p><p><code>0</code> &lt;= <code>range_filter</code> &lt;= distance &lt; <code>radius</code> &lt;= <code>dim(vector)</code></p></td>
   </tr>
</table>

## 操作示例\{#examples}

本节将结合具体的代码示例介绍如何进行 Range Search。

下方的示例未指定相似度类型，表明使用默认相似度类型 **COSINE**。通过查表可知，在使用 **COSINE** 对目标向量与查询向量间的相似度进行打分时，值越大越相似。因此在设置 Range Search 相关参数时，需要确保 **radius** 小于 **range_filter**。

示例 Search 请求中指定的 **radius** 为 0.4，**range_filter** 为 0.6。在收到此请求后，Zilliz Cloud 会返回所有与查询向量相似度得分在 0.4 到 0.6 之间的 Entity。

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

milvusAddr := "localhost:19530"
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

