---
title: "主キー検索 | BYOC"
slug: /primary-key-search
sidebar_label: "主キー検索"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "類似検索を実行する際は、対象コレクションにクエリベクトルがすでに存在している場合でも、常に 1 つ以上のクエリベクトルを指定する必要があります。検索前にベクトルを取得することを避けるには、代わりに主キーを使用できます。 | BYOC"
type: origin
token: U7OvwHP3AiUWlckzIEKclLQQnPr
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 主キー検索

類似検索を実行する際は、対象コレクションにクエリベクトルがすでに存在している場合でも、常に 1 つ以上のクエリベクトルを指定する必要があります。検索前にベクトルを取得することを避けるには、代わりに主キーを使用できます。

## 概要\{#overview}

EC プラットフォームでは、ユーザーがキーワードを入力すると、それに一致する商品を取得できます。ユーザーが商品の詳細ページを表示すると、プラットフォームは、比較したいユーザー向けにページの下部に類似商品のリストも表示します。

レコメンデーションは、キーワードまたは現在の商品との類似度に基づいて並べ替えられます。これを実現するには、プラットフォームの開発者が、実際の類似検索の前にキーワードまたは現在の商品のベクトル表現を Milvus から取得する必要があります。そのため、プラットフォームと Milvus の間のラウンドトリップが増加し、多数の高次元浮動小数点数がネットワーク経由で送信されることになります。

アプリケーションと Milvus の間の連携ロジックを簡素化し、ラウンドトリップの回数を減らし、大量の高次元浮動小数点値をネットワーク経由で送信することを避けるには、主キー検索の使用を検討してください。

主キー検索では、クエリベクトルを指定する必要はありません。代わりに、クエリベクトルを含むエンティティの主キー（`ids`）を指定します。 

## 制限事項\{#limits-and-restrictions}

- 主キーを使用した検索は、BM25 関数のように VarChar フィールドから派生したスパースベクトルフィールドを除き、すべてのベクトルデータ型に適用されます。

- フィルタ付き検索、範囲検索、グループ化検索では、クエリベクトルの代わりに主キーを使用できます。必要に応じてページネーションを有効にすることもできます。ただし、この機能はハイブリッド検索および検索イテレーターには適用されません。

- embedding list を含む類似検索では、引き続きクエリベクトルを取得し、それらを embedding list に配置してから検索を実行する必要があります。

- 存在しない主キーや形式が正しくない主キーについては、Milvus がエラーを返します。

- 主キーとクエリベクトルは排他的です。両方を指定した場合もエラーになります。

## 例\{#examples}

以下の例では、指定したすべての Int64 ID が対象コレクションに存在することを前提としています。

<Admonition type="info" title="Notes">

主キーはフィルタリングには使用されず、ベクトルの取得にのみ使用されます。

</Admonition>

### 例 1: 基本的な主キー検索\{#example-1-basic-primary-key-search}

基本的な主キー検索を実行するには、クエリベクトルを主キーに置き換えるだけです。

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

### 例 2: 主キーを使用したフィルタ付き検索\{#example-2-filtered-search-using-primary-keys}

以下の例では、`color` と `likes` が対象コレクションにスキーマ定義された 2 つのフィールドであることを前提としています。 

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

### 例 3: 主キーを使用した範囲検索\{#example-3-range-search-using-primary-keys}

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

### 例 4: 主キーを使用したグループ化検索\{#example-4-grouping-search-using-primary-keys}

以下の例では、`docId` が対象コレクションにスキーマ定義されたフィールドであることを前提としています。

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
