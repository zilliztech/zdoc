---
title: "Primary Key Search | BYOC"
slug: /primary-key-search
sidebar_label: "Primary Key Search"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在相似性搜索时，您通常需要提供一个或多个查询向量，无论这些查询向量是否已经存在于您的 Collection 中。为了避免在搜索前从 Collection 中获取需要的查询向量，您可以考虑使用主键搜索（Primary Key Search）。 | BYOC"
type: origin
token: BkBywFWTzi8uS3k8WjHc5nU9npY
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Primary Key Search

在相似性搜索时，您通常需要提供一个或多个查询向量，无论这些查询向量是否已经存在于您的 Collection 中。为了避免在搜索前从 Collection 中获取需要的查询向量，您可以考虑使用主键搜索（Primary Key Search）。

## 概述\{#overview}

在电商平台上购物时，用户通常会输入一个关键词让平台返回一些与该关键词相关的商品。当用户浏览其中某件商品的详情页时，在该页末尾还会推荐一些和当前商品相似的其它商品，供用户比较。

推荐商品是按照与关键词或当前商品的相似度排序的。为了实现上述功能，平台开发人员需要先根据关键词或用户浏览的当前商品获取对应的向量表示，然后再使用这些向量表示来进行相似性搜索。这样既增加了电商平台和 Milvus 之间的信息往返次数，还导致大量的高维数据在网络中传输。

为了简化与电商平台类似的应用与 Milvus 之间的交互逻辑，降低信息往返次数，避免在网络中传输大量高维数据，Milvus 推出了主键搜索。

在主键搜索中，您无需提供查询向量。只用提供包含查询向量的 Entity 的主键（`ids`）即可。

## 使用限制\{#limits-restrictions}

- 除了使用 BM25 Function 从 VarChar 字段派生出的稀疏向量字段外，主键搜索适用于所有其它类型的向量数据。

- 您可以使用 Entity 的主键代替该 Entity 中的指定字段中的查询向量进行 Filtered Search，Range Search 和 Grouping Search，并在这些搜索中选择性地启用搜索结果分页能力。但是，在多向量混合搜索和 Search Iterator 中不能使用主键代替查询向量。

- 对于涉及 Embedding List 的查询，您仍然需要先从 Collection 中获取对应的向量，将它们组织成 Embedding List，然后再进行查询。

- 对于 Collection 中不存在的主键或使用了不正确的数据类型进行查询，Milvus 均会报错。

- 在查询请求中，主键和查询向量互斥。同时提供两者将会导致错误。

## 示例\{#examples}

如果示例假设目标 Collection 的主键为 Int64 格式。

<Admonition type="info" title="说明">

在主键查询中，主键仅用来获取对应 Entity 指定字段上的向量，不会基于主键进行过滤。

</Admonition>

### 示例 1：基本主键搜索\{#example-1-basic-primary-key-search}

在执行基本主键搜索时，您需要将查询向量替换为 Collection 中包含该查询向量的 Entity 主键。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

res = client.search(
    collection_name="my_collection",
    anns_field="vector",
    # highlight-start
    ids=[551, 296, 43], # a list of primary keys
    # highlight-end
    limit=3
)

for hits in res:
    for hit in hits:
        print(hit)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq
import io.milvus.v2.service.vector.response.SearchResp

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());
        
List<Object> ids = Arrays.asList(551L, 296L, 43L);
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .annsField("vector")
        .ids(ids)
        .limit(3)
        .build());
List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
    address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN",
});

const res = await client.search({
    collection_name: "my_collection",
    anns_field: "vector",
    // highlight-start
    ids: [551, 296, 43], // a list of primary keys
    // highlight-end
    limit: 3,
});

console.log(res.results);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/column"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

// highlight-start
ids := column.NewColumnInt64("id", []int64{551, 296, 43}) // a list of primary keys
// highlight-end
resultSets, err := client.Search(ctx, milvusclient.NewSearchByIDsOption(
    "my_collection", // collectionName
    3,             // limit
    ids,
).WithANNSField("vector"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs)
    fmt.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  -H "Request-Timeout: 10" \
  -d '{
    "collectionName": "my_collection",
    "annsField": "vector",
    "ids": [551, 296, 43],
    "limit": 3
  }'
```

</TabItem>

<TabItem value='c++'>

```c++
auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("my_collection")
                         .WithAnnsField("vector")
                         // highlight-start
                         .WithIDs({551, 296, 43})
                         // highlight-end
                         .WithLimit(3);

milvus::SearchResponse searchResponse;
auto status = client->Search(searchRequest, searchResponse);
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

<TabItem value='shell'>

```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

zilliz vector search \
  --collection my_collection \
  --data "[]" \
  --body '{
    "annsField": "vector",
    "ids": [551, 296, 43],
    "limit": 3
  }' \
  --output json
```

</TabItem>
</Tabs>

### 示例 2：使用主键进行 Filtered Search\{#example-2-filtered-search-using-primary-keys}

如下示例假设目标 Collection 的 Schema 中定义了 `color` 和 `likes` 两个字段。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    # highlight-start
    ids=[551, 296, 43], #
    filter='color like "red%" and likes > 50',
    output_fields=["color", "likes"],
    # highlight-end
    limit=3,
)
```

</TabItem>

<TabItem value='java'>

```java
List<Object> ids = Arrays.asList(551L, 296L, 43L);
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .ids(ids)
        .filter("color like \"red%\" and likes > 50")
        .limit(3)
        .outputFields(Arrays.asList("color", "likes"))
        .build());
List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
    collection_name: "my_collection",
    // highlight-start
    ids: [551, 296, 43],
    filter: 'color like "red%" and likes > 50',
    output_fields: ["id", "color", "likes"],
    // highlight-end
    limit: 3,
});

console.log(res.results);
```

</TabItem>

<TabItem value='go'>

```go
// highlight-start
ids := column.NewColumnInt64("id", []int64{551, 296, 43})
// highlight-end
resultSets, err := client.Search(ctx, milvusclient.NewSearchByIDsOption(
    "my_collection", // collectionName
    3,               // limit
    ids,
).WithFilter(`color like "red%" and likes > 50`).
    WithOutputFields("color", "likes"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs)
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("color: ", resultSet.GetColumn("color"))
    fmt.Println("likes: ", resultSet.GetColumn("likes"))
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  -H "Request-Timeout: 10" \
  -d '{
    "collectionName": "my_collection",
    "annsField": "vector",
    "ids": [551, 296, 43],
    "filter": "color like \"red%\" and likes > 50",
    "outputFields": ["color", "likes"],
    "limit": 3
  }'
```

</TabItem>

<TabItem value='c++'>

```c++
auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("my_collection")
                         // highlight-start
                         .WithIDs({551, 296, 43})
                         .WithFilter(R"(color like "red%" and likes > 50)")
                         .WithOutputFields({"color", "likes"})
                         // highlight-end
                         .WithLimit(3);

milvus::SearchResponse searchResponse;
auto status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Search failed: " << status.Message() << std::endl;
    return;
}

for (const auto& result : searchResponse.Results().Results()) {
    const auto ids = result.Ids().IntIDArray();
    const auto colors = result.OutputField<milvus::VarCharFieldData>("color");
    const auto likes = result.OutputField<milvus::Int64FieldData>("likes");
    for (size_t i = 0; i < result.Scores().size(); ++i) {
        std::cout << "id=" << ids[i]
                  << ", score=" << result.Scores()[i]
                  << ", color=" << colors->Data()[i]
                  << ", likes=" << likes->Data()[i] << std::endl;
    }
}
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

zilliz vector search \
  --collection my_collection \
  --data "[]" \
  --body '{
    "annsField": "vector",
    "ids": [551, 296, 43],
    "filter": "color like \\"red%\\" and likes > 50",
    "outputFields": ["color", "likes"],
    "limit": 3
  }' \
  --output json
```

</TabItem>
</Tabs>

### 示例 3：使用主键进行 Range Search\{#example-3-range-search-using-primary-keys}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    # highlight-start
    ids=[551, 296, 43],
    # highlight-end
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
```

</TabItem>

<TabItem value='java'>

```java
ap<String, Object> params = new HashMap<>();
params.put("radius", "0.4");
params.put("range_filter", "0.6");

List<Object> ids = Arrays.asList(551L, 296L, 43L);
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .ids(ids)
        .limit(3)
        .searchParams(params)
        .build());
List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
    collection_name: "my_collection",
    // highlight-start
    ids: [551, 296, 43],
    // highlight-end
    limit: 3,
    params: {
        // highlight-start
        radius: 0.4,
        range_filter: 0.6,
        // highlight-end
    },
});

console.log(res.results);
```

</TabItem>

<TabItem value='go'>

```go
annParam := index.NewCustomAnnParam()
// highlight-start
annParam.WithRadius(0.4)
annParam.WithRangeFilter(0.6)
// highlight-end

// highlight-start
ids := column.NewColumnInt64("id", []int64{551, 296, 43})
// highlight-end
resultSets, err := client.Search(ctx, milvusclient.NewSearchByIDsOption(
    "my_collection", // collectionName
    3,               // limit
    ids,
).WithANNSField("vector").
    WithAnnParam(annParam))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs)
    fmt.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  -H "Request-Timeout: 10" \
  -d '{
    "collectionName": "my_collection",
    "annsField": "vector",
    "ids": [551, 296, 43],
    "limit": 3,
    "searchParams": {
      "params": {
        "radius": 0.4,
        "range_filter": 0.6
      }
    }
  }'
```

</TabItem>

<TabItem value='c++'>

```c++
auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("my_collection")
                         .WithAnnsField("vector")
                         // highlight-start
                         .WithIDs({551, 296, 43})
                         .WithRadius(0.4)
                         .WithRangeFilter(0.6)
                         // highlight-end
                         .WithLimit(3);

milvus::SearchResponse searchResponse;
auto status = client->Search(searchRequest, searchResponse);
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

<TabItem value='shell'>

```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

zilliz vector search \
  --collection my_collection \
  --data "[]" \
  --body '{
    "annsField": "vector",
    "ids": [551, 296, 43],
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

### 示例 4：使用主键进行 Grouping Search\{#example-4-grouping-search-using-primary-keys}

如下示例假设目标 Collection 的 Schema 中字义了一个名为 `docId` 的字段。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    # highlight-start
    ids=[551, 296, 43],
    # highlight-end
    limit=3,
    group_by_field="docId",
    output_fields=["docId"]
)
```

</TabItem>

<TabItem value='java'>

```java
List<Object> ids = Arrays.asList(551L, 296L, 43L);
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .ids(ids)
        .limit(3)
        .groupByFieldName("docId")
        .outputFields(Collections.singletonList("docId"))
        .build());
List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
    collection_name: "my_collection",
    // highlight-start
    ids: [551, 296, 43],
    // highlight-end
    limit: 3,
    group_by_field: "docId",
    output_fields: ["id", "docId"],
});

console.log(res.results);
```

</TabItem>

<TabItem value='go'>

```go
// highlight-start
ids := column.NewColumnInt64("id", []int64{551, 296, 43})
// highlight-end
resultSets, err := client.Search(ctx, milvusclient.NewSearchByIDsOption(
    "my_collection", // collectionName
    3,               // limit
    ids,
).WithGroupByField("docId").
    WithOutputFields("docId"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs)
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("docId: ", resultSet.GetColumn("docId"))
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  -H "Request-Timeout: 10" \
  -d '{
    "collectionName": "my_collection",
    "annsField": "vector",
    "ids": [551, 296, 43],
    "limit": 3,
    "groupingField": "docId",
    "outputFields": ["docId"]
  }'
```

</TabItem>

<TabItem value='c++'>

```c++
auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("my_collection")
                         .WithAnnsField("vector")
                         // highlight-start
                         .WithIDs({551, 296, 43})
                         .WithGroupByField("docId")
                         .WithOutputFields({"docId"})
                         // highlight-end
                         .WithLimit(3);

milvus::SearchResponse searchResponse;
auto status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Search failed: " << status.Message() << std::endl;
    return;
}

for (const auto& result : searchResponse.Results().Results()) {
    const auto ids = result.Ids().IntIDArray();
    const auto docIds = result.OutputField<milvus::Int64FieldData>("docId");
    for (size_t i = 0; i < result.Scores().size(); ++i) {
        std::cout << "id=" << ids[i]
                  << ", score=" << result.Scores()[i]
                  << ", docId=" << docIds->Data()[i] << std::endl;
    }
}
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

zilliz vector search \
  --collection my_collection \
  --data "[]" \
  --body '{
    "annsField": "vector",
    "ids": [551, 296, 43],
    "limit": 3,
    "groupingField": "docId",
    "outputFields": ["docId"]
  }' \
  --output json
```

</TabItem>
</Tabs>