---
title: "ランダムサンプリング | Cloud"
slug: /ramdom-sampling
sidebar_label: "ランダムサンプリング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "大規模データセットを扱う際、インサイトを得たりフィルタリングロジックをテストしたりするために、必ずしもすべてのデータを処理する必要はありません。ランダムサンプリングは、データの統計的に代表性のあるサブセットを使用できるようにすることで、この課題に対する解決策を提供し、クエリ時間とリソース消費を大幅に削減します。 | Cloud"
type: origin
token: ByJbwcpoCiBkDckR3VCcC4LTneg
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ランダムサンプリング

大規模データセットを扱う際、インサイトを得たりフィルタリングロジックをテストしたりするために、必ずしもすべてのデータを処理する必要はありません。ランダムサンプリングは、データの統計的に代表性のあるサブセットを使用できるようにすることで、この課題に対する解決策を提供し、クエリ時間とリソース消費を大幅に削減します。

ランダムサンプリングはセグメントレベルで動作し、コレクションのデータ分布全体にわたってサンプルのランダム性を維持しながら、高いパフォーマンスを確保します。

**主なユースケース:**

- **データ探索**: 最小限のリソース使用でコレクションの構造と内容をすばやくプレビュー

- **開発テスト**: 本番デプロイ前に、扱いやすいデータサンプルで複雑なフィルタリングロジックをテスト

- **リソース最適化**: 探索的クエリや統計分析の計算コストを削減

## 構文\{#syntax}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
filter = "RANDOM_SAMPLE(sampling_factor)"
```

</TabItem>

<TabItem value='java'>

```java
String filter = "RANDOM_SAMPLE(sampling_factor)"
```

</TabItem>

<TabItem value='go'>

```go
filter := "RANDOM_SAMPLE(sampling_factor)"
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export filterRandomSample='RANDOM_SAMPLE(sampling_factor)'
```

</TabItem>

<TabItem value='c++'>

```c++
auto filter = "RANDOM_SAMPLE(sampling_factor)";
```

</TabItem>
</Tabs>

**パラメータ:**

- `sampling_factor`: 境界値を含まない (0, 1) の範囲のサンプリング係数です。たとえば、`RANDOM_SAMPLE(0.001)` は結果のおよそ 0.1% を選択します。

**重要なルール:**

- この式は大文字と小文字を区別しません（`RANDOM_SAMPLE` または `random_sample`）

- サンプリング係数は、境界値を含まない (0, 1) の範囲でなければなりません

## 他のフィルタとの組み合わせ\{#combine-with-other-filters}

ランダムサンプリング演算子は、論理 `AND` を使用して他のフィルタリング式と組み合わせる必要があります。フィルタを組み合わせる場合、Milvus はまず他の条件を適用し、その後で結果セットに対してランダムサンプリングを実行します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Correct: Filter first, then sample
filter = 'color == "red" AND RANDOM_SAMPLE(0.001)'
# Processing: Find all red items → Sample 0.1% of those red items

# Incorrect: OR doesn't make logical sense
filter = 'color == "red" OR RANDOM_SAMPLE(0.001)'  # ❌ Invalid logic
# This would mean: "Either red items OR sample everything" - which is meaningless
```

</TabItem>

<TabItem value='java'>

```java
// Correct: Filter first, then sample
String filter = 'color == "red" AND RANDOM_SAMPLE(0.001)';
// Processing: Find all red items → Sample 0.1% of those red items

// Incorrect: OR doesn't make logical sense
String filter = 'color == "red" OR RANDOM_SAMPLE(0.001)';  // ❌ Invalid logic
// This would mean: "Either red items OR sample everything" - which is meaningless
```

</TabItem>

<TabItem value='go'>

```go
// Correct: Filter first, then sample
filter := 'color == "red" AND RANDOM_SAMPLE(0.001)'
// Processing: Find all red items → Sample 0.1% of those red items

filter := 'color == "red" OR RANDOM_SAMPLE(0.001)' // ❌ Invalid logic
// This would mean: "Either red items OR sample everything" - which is meaningless
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
# Correct: Filter first, then sample
export filterSampleCorrect='color == "red" AND RANDOM_SAMPLE(0.001)'
# Processing: Find all red items → Sample 0.1% of those red items

# Incorrect: OR doesn't make logical sense
export filterSampleIncorrect='color == "red" OR RANDOM_SAMPLE(0.001)'  # ❌ Invalid logic
# This would mean: "Either red items OR sample everything" - which is meaningless
```

</TabItem>

<TabItem value='c++'>

```c++
auto filter_sample_correct = R"(color == "red" AND RANDOM_SAMPLE(0.001))";
auto filter_sample_incorrect = R"(color == "red" OR RANDOM_SAMPLE(0.001))";
```

</TabItem>
</Tabs>

## 例\{#examples}

### 例 1: データ探索\{#example-1-data-exploration}

コレクションの構造をすばやくプレビューします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Sample approximately 1% of the entire collection
result = client.query(
    collection_name="product_catalog",
    # highlight-next-line
    filter="RANDOM_SAMPLE(0.01)",
    output_fields=["id", "product_name"],
    limit=10
)

print(f"Sampled {len(result)} products from collection")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.*;
import io.milvus.v2.service.vector.request.QueryReq
import io.milvus.v2.service.vector.request.QueryResp

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

QueryReq queryReq = QueryReq.builder()
        .collectionName("product_catalog")
        .filter("RANDOM_SAMPLE(0.01)")
        .outputFields(Arrays.asList("id", "product_name"))
        .limit(10)
        .build();

QueryResp queryResp = client.query(queryReq);

List<QueryResp.QueryResult> results = queryResp.getQueryResults();
for (QueryResp.QueryResult result : results) {
    System.out.println(result.getEntity());
}
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

resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("product_catalog").
    WithFilter("RANDOM_SAMPLE(0.01)").
    WithOutputFields("id", "product_name"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println("id: ", resultSet.GetColumn("id").FieldData().GetScalars())
fmt.Println("product_name: ", resultSet.GetColumn("product_name").FieldData().GetScalars())
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export filterSample='RANDOM_SAMPLE(0.01)'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"product_catalog\",
  \"filter\": \"$filterSample\",
  \"outputFields\": [\"id\", \"product_name\"],
  \"limit\": 10
}"
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::QueryRequest()
                       .WithCollectionName("product_catalog")
                       .WithFilter("RANDOM_SAMPLE(0.01)")
                       .AddOutputField("id")
                       .AddOutputField("product_name")
                       .WithLimit(10);

milvus::QueryResponse response;
status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### 例 2: ランダムサンプリングを使用した複合フィルタリング\{#example-2-combined-filtering-with-random-sampling}

扱いやすいサブセットでフィルタリングロジックをテストします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# First filter by category and price, then sample 0.5% of results
filter_expression = 'category == "electronics" AND price > 100 AND RANDOM_SAMPLE(0.005)'

result = client.query(
    collection_name="product_catalog",
    # highlight-next-line
    filter=filter_expression,
    output_fields=["product_name", "price", "rating"],
    limit=10
)

print(f"Found {len(result)} electronics products in sample")
```

</TabItem>

<TabItem value='java'>

```java
String filter = "category == \"electronics\" AND price > 100 AND RANDOM_SAMPLE(0.005)";

QueryReq queryReq = QueryReq.builder()
        .collectionName("product_catalog")
        .filter(filter)
        .outputFields(Arrays.asList("product_name", "price", "rating"))
        .limit(10)
        .build();

QueryResp queryResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
filter := "category == \"electronics\" AND price > 100 AND RANDOM_SAMPLE(0.005)"

resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("product_catalog").
    WithFilter(filter).
    WithOutputFields("product_name", "price", "rating"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export filterComplex="category == \\\"electronics\\\" AND price > 100 AND RANDOM_SAMPLE(0.005)"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"product_catalog\",
  \"filter\": \"$filterComplex\",
  \"outputFields\": [\"product_name\", \"price\", \"rating\"]
}"
```

</TabItem>

<TabItem value='c++'>

```c++
auto filter = R"(category == "electronics" AND price > 100 AND RANDOM_SAMPLE(0.005))";
auto request = milvus::QueryRequest()
                       .WithCollectionName("product_catalog")
                       .WithFilter(filter)
                       .AddOutputField("product_name")
                       .AddOutputField("price")
                       .AddOutputField("rating")
                       .WithLimit(10);

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### 例 3: クイック分析\{#example-3-quick-analytics}

フィルタリングされたデータに対して高速な統計分析を実行します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Get insights from ~0.1% of premium customer data
filter_expression = 'customer_tier == "premium" AND region == 'North America' AND RANDOM_SAMPLE(0.001)'

result = client.query(
    collection_name="customer_profiles",
    # highlight-next-line
    filter=filter_expression,
    output_fields=["purchase_amount", "satisfaction_score", "last_purchase_date"],
    limit=10
)

# Analyze sample for quick insights
if result:
    average_purchase = sum(r["purchase_amount"] for r in result) / len(result)
    average_satisfaction = sum(r["satisfaction_score"] for r in result) / len(result)
    
    print(f"Sample size: {len(result)}")
    print(f"Average purchase amount: ${average_purchase:.2f}")
    print(f"Average satisfaction score: {average_satisfaction:.2f}")
```

</TabItem>

<TabItem value='java'>

```java
String filter = "customer_tier == \"premium\" AND region == \"North America\" AND RANDOM_SAMPLE(0.001)";

QueryReq queryReq = QueryReq.builder()
        .collectionName("customer_profiles")
        .filter(filter)
        .outputFields(Arrays.asList("purchase_amount", "satisfaction_score", "last_purchase_date"))
        .limit(10)
        .build();

QueryResp queryResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
filter := "customer_tier == \"premium\" AND region == \"North America\" AND RANDOM_SAMPLE(0.001)"

resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("customer_profiles").
    WithFilter(filter).
    WithOutputFields("purchase_amount", "satisfaction_score", "last_purchase_date"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export filterCustomer="customer_tier == \\\"premium\\\" AND region == \\\"North America\\\" AND RANDOM_SAMPLE(0.001)"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"customer_profiles\",
  \"filter\": \"$filterCustomer\",
  \"outputFields\": [\"purchase_amount\", \"satisfaction_score\", \"last_purchase_date\"],
  \"limit\": 10
}"
```

</TabItem>

<TabItem value='c++'>

```c++
auto filter = R"(customer_tier == "premium" AND region == "North America" AND RANDOM_SAMPLE(0.001))"
auto request = milvus::QueryRequest()
                       .WithCollectionName("customer_profiles")
                       .WithFilter(filter)
                       .AddOutputField("purchase_amount")
                       .AddOutputField("satisfaction_score")
                       .AddOutputField("last_purchase_date")
                       .WithLimit(10);

milvus::QueryResponse response;
auto status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

### 例 4: ベクトル検索との組み合わせ\{#example-4-combined-with-vector-search}

フィルタリングされた検索シナリオでランダムサンプリングを使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Search for similar products within a sampled subset
search_results = client.search(
    collection_name="product_catalog",
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],  # query vector
    # highlight-next-line
    filter='category == "books" AND RANDOM_SAMPLE(0.01)',
    search_params={"params": {}},
    output_fields=["title", "author", "price"],
    limit=10
)

print(f"Found {len(search_results[0])} similar books in sample")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp

FloatVec queryVector = new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f, 0.5f});
SearchReq searchReq = SearchReq.builder()
        .collectionName("product_catalog")
        .data(Collections.singletonList(queryVector))
        .topK(10)
        .filter("category == \"books\" AND RANDOM_SAMPLE(0.01)")
        .outputFields(Arrays.asList("title", "author", "price"))
        .build();

SearchResp searchResp = client.search(searchReq);

List<List<SearchResp.SearchResult>> searchResults = searchResp.getSearchResults();
for (List<SearchResp.SearchResult> results : searchResults) {
    System.out.println("TopK results:");
    for (SearchResp.SearchResult result : results) {
        System.out.println(result);
    }
}
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.1, 0.2, 0.3, 0.4, 0.5}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "product_catalog", // collectionName
    10,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithConsistencyLevel(entity.ClStrong).
    WithFilter("category == \"books\" AND RANDOM_SAMPLE(0.01)").
    WithOutputFields("title", "author", "price"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("title: ", resultSet.GetColumn("title").FieldData().GetScalars())
    fmt.Println("author: ", resultSet.GetColumn("author").FieldData().GetScalars())
    fmt.Println("price: ", resultSet.GetColumn("price").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// node
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.1, 0.2, 0.3, 0.4, 0.5};
auto request = milvus::SearchRequest()
                   .WithCollectionName("product_catalog")
                   .WithLimit(10)
                   .WithFilter(R"(category == "books" AND RANDOM_SAMPLE(0.01))")
                   .AddOutputField("title")
                   .AddOutputField("author")
                   .AddOutputField("price")
                   .AddFloatVector(query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

## ベストプラクティス\{#best-practices}

- **小さく始める**: 初期の探索では、小さいサンプリング係数（0.001-0.01）から始めます

- **開発ワークフロー**: 開発中はサンプリングを使用し、本番クエリでは削除します

- **統計的妥当性**: より大きなサンプルほど、より正確な統計表現を提供します

- **パフォーマンステスト**: クエリパフォーマンスを監視し、必要に応じてサンプリング係数を調整します

