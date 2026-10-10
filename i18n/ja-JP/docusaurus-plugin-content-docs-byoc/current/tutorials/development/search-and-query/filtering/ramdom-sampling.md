---
title: "ランダムサンプリング | BYOC"
slug: /ramdom-sampling
sidebar_label: "ランダムサンプリング"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "大規模なデータセットを扱う際、インサイトを得たりフィルタリングロジックをテストしたりするために、必ずしもすべてのデータを処理する必要はありません。ランダムサンプリングは、統計的に代表性のあるデータのサブセットを利用できるようにすることで、この課題を解決し、クエリ時間とリソース消費を大幅に削減します。 | BYOC"
type: origin
token: ByJbwcpoCiBkDckR3VCcC4LTneg
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ランダムサンプリング

大規模なデータセットを扱う際、インサイトを得たりフィルタリングロジックをテストしたりするために、必ずしもすべてのデータを処理する必要はありません。ランダムサンプリングは、統計的に代表性のあるデータのサブセットを利用できるようにすることで、この課題を解決し、クエリ時間とリソース消費を大幅に削減します。

Random sampling operates at the segment level, ensuring efficient performance while maintaining the randomness of the sample across your コレクション's data distribution.

**主なユースケース:**

- **Data exploration**: Quickly preview コレクション structure and content with minimal resource usage

- **開発テスト**: 本番デプロイ前に、扱いやすいデータサンプルで複雑なフィルタリングロジックをテスト

- **リソース最適化**: 探索的クエリや統計分析における計算コストを削減

## Syntax\{#syntax}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='rust'>

```rust
let filter = "RANDOM_SAMPLE(sampling_factor)";
```

</TabItem>

<TabItem value='c++'>

```c++
auto filter = "RANDOM_SAMPLE(sampling_factor)";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = "RANDOM_SAMPLE(sampling_factor)";
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export filterRandomSample='RANDOM_SAMPLE(sampling_factor)'
```

</TabItem>
</Tabs>

**パラメータ:**

- `sampling_factor`: 境界値を含まない (0, 1) の範囲のサンプリング係数。たとえば、`RANDOM_SAMPLE(0.001)` は結果の約 0.1% を選択します。

**重要なルール:**

- この式は大文字小文字を区別しません（`RANDOM_SAMPLE` または `random_sample`）

- サンプリング係数は、境界値を含まない (0, 1) の範囲でなければなりません

## Combine with other filters\{#combine-with-other-filters}

ランダムサンプリング演算子は、論理 `AND` を使用して他のフィルタリング式と組み合わせる必要があります。フィルタを組み合わせる場合、Milvus はまず他の条件を適用し、その後に結果セットに対してランダムサンプリングを実行します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
String filter = "color == \"red\" AND RANDOM_SAMPLE(0.001)";
// Processing: Find all red items → Sample 0.1% of those red items

// Incorrect: OR doesn't make logical sense
String filter = "color == \"red\" OR RANDOM_SAMPLE(0.001)";  // ❌ Invalid logic
// This would mean: "Either red items OR sample everything" - which is meaningless
```

</TabItem>

<TabItem value='go'>

```go
// Correct: Filter first, then sample
filter := "color == \"red\" AND RANDOM_SAMPLE(0.001)"
// Processing: Find all red items → Sample 0.1% of those red items

filter := "color == \"red\" OR RANDOM_SAMPLE(0.001)" // ❌ Invalid logic
// This would mean: "Either red items OR sample everything" - which is meaningless
```

</TabItem>

<TabItem value='rust'>

```rust
// Correct: Filter first, then sample
let filter_correct = r#"color == "red" AND RANDOM_SAMPLE(0.001)"#;
// Processing: Find all red items → Sample 0.1% of those red items

// Incorrect: OR doesn't make logical sense
let filter_incorrect = r#"color == "red" OR RANDOM_SAMPLE(0.001)"#;  // ❌ Invalid logic
// This would mean: "Either red items OR sample everything" - which is meaningless
```

</TabItem>

<TabItem value='c++'>

```c++
auto filter_sample_correct = R"(color == "red" AND RANDOM_SAMPLE(0.001))";
auto filter_sample_incorrect = R"(color == "red" OR RANDOM_SAMPLE(0.001))";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Correct: Filter first, then sample
const filterCorrect = 'color == "red" AND RANDOM_SAMPLE(0.001)';
// Processing: Find all red items → Sample 0.1% of those red items

// Incorrect: OR doesn't make logical sense
const filterIncorrect = 'color == "red" OR RANDOM_SAMPLE(0.001)';  // ❌ Invalid logic
// This would mean: "Either red items OR sample everything" - which is meaningless
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
</Tabs>

## Examples\{#examples}

### Example 1: Data exploration\{#example-1-data-exploration}

Quickly preview your コレクション structure:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.Arrays;
import java.util.List;

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

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
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

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(&ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT")).await?;

    // Sample approximately 1% of the entire collection
    let res = client
        .query(
            QueryRequest::builder()
                .collection_name("product_catalog")
                .filter("RANDOM_SAMPLE(0.01)")
                .output_fields(["id", "product_name"])
                .limit(10)
                .build()?,
        )
        .await?;

    println!("Sampled {} products from collection", res.results().len());
    Ok(())
}
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

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

// Sample approximately 1% of the entire collection
const res = await client.query({
    collection_name: "product_catalog",
    filter: "RANDOM_SAMPLE(0.01)",
    output_fields: ["id", "product_name"],
    limit: 10
});

console.log(`Sampled ${res.data.length} products from collection`);
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
</Tabs>

### Example 2: Combined filtering with random sampling\{#example-2-combined-filtering-with-random-sampling}

扱いやすいサブセットでフィルタリングロジックをテストします:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='rust'>

```rust
// First filter by category and price, then sample 0.5% of results
let filter_expression = r#"category == "electronics" AND price > 100 AND RANDOM_SAMPLE(0.005)"#;

let res = client
    .query(
        QueryRequest::builder()
            .collection_name("product_catalog")
            .filter(filter_expression)
            .output_fields(["product_name", "price", "rating"])
            .limit(10)
            .build()?,
    )
    .await?;

println!("Found {} electronics products in sample", res.results().len());
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

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

<TabItem value='javascript'>

```javascript
// First filter by category and price, then sample 0.5% of results
const filter_expression = 'category == "electronics" AND price > 100 AND RANDOM_SAMPLE(0.005)';

const res = await client.query({
    collection_name: "product_catalog",
    filter: filter_expression,
    output_fields: ["product_name", "price", "rating"],
    limit: 10
});

console.log(`Found ${res.data.length} electronics products in sample`);
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
</Tabs>

### Example 3: Quick analytics\{#example-3-quick-analytics}

フィルタリングされたデータに対して迅速な統計分析を実行します:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Get insights from ~0.1% of premium customer data
filter_expression = 'customer_tier == "premium" AND region == "North America" AND RANDOM_SAMPLE(0.001)'

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
    print(f"Average satisfaction score: ${average_satisfaction:.2f}")
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

<TabItem value='rust'>

```rust
// Get insights from ~0.1% of premium customer data
let filter_expression = r#"customer_tier == "premium" AND region == "North America" AND RANDOM_SAMPLE(0.001)"#;

let res = client
    .query(
        QueryRequest::builder()
            .collection_name("customer_profiles")
            .filter(filter_expression)
            .output_fields(["purchase_amount", "satisfaction_score", "last_purchase_date"])
            .limit(10)
            .build()?,
    )
    .await?;

println!("Sample size: {}", res.results().len());
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto filter = R"(customer_tier == "premium" AND region == "North America" AND RANDOM_SAMPLE(0.001))";
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

<TabItem value='javascript'>

```javascript
// Get insights from ~0.1% of premium customer data
const filter_expression = 'customer_tier == "premium" AND region == "North America" AND RANDOM_SAMPLE(0.001)';

const res = await client.query({
    collection_name: "customer_profiles",
    filter: filter_expression,
    output_fields: ["purchase_amount", "satisfaction_score", "last_purchase_date"],
    limit: 10
});

// Analyze sample for quick insights
if (res.data.length > 0) {
    const average_purchase = res.data.reduce((sum, r) => sum + r.purchase_amount, 0) / res.data.length;
    const average_satisfaction = res.data.reduce((sum, r) => sum + r.satisfaction_score, 0) / res.data.length;

    console.log(`Sample size: ${res.data.length}`);
    console.log(`Average purchase amount: $${average_purchase.toFixed(2)}`);
    console.log(`Average satisfaction score: ${average_satisfaction.toFixed(2)}`);
}
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
</Tabs>

### Example 4: Combined with ベクトル search\{#example-4-combined-with-vector-search}

フィルタリングされた検索シナリオでランダムサンプリングを使用します:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

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

<TabItem value='rust'>

```rust
// Search for similar products within a sampled subset
let res = client
    .search(
        SearchRequest::builder()
            .collection_name("product_catalog")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![vec![0.1, 0.2, 0.3, 0.4, 0.5]]))
            .filter(r#"category == "books" AND RANDOM_SAMPLE(0.01)"#)
            .limit(10)
            .output_fields(["title", "author", "price"])
            .build()?,
    )
    .await?;

println!("Found {} similar books in sample", res.results().len());
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

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

<TabItem value='javascript'>

```javascript
// Search for similar products within a sampled subset
const res = await client.search({
    collection_name: "product_catalog",
    data: [[0.1, 0.2, 0.3, 0.4, 0.5]],  // query vector
    filter: 'category == "books" AND RANDOM_SAMPLE(0.01)',
    limit: 10,
    output_fields: ["title", "author", "price"]
});

console.log(`Found ${res.results[0].length} similar books in sample`);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data '{
  "collectionName": "product_catalog",
  "data": [[0.1, 0.2, 0.3, 0.4, 0.5]],
  "annsField": "vector",
  "limit": 10,
  "filter": "category == \"books\" AND RANDOM_SAMPLE(0.01)",
  "outputFields": ["title", "author", "price"]
}' 
```

</TabItem>
</Tabs>

## Best practices\{#best-practices}

- **小さく始める**: 初期探索では、より小さいサンプリング係数（0.001〜0.01）から開始する

- **開発ワークフロー**: 開発中はサンプリングを使用し、本番クエリでは削除する

- **統計的妥当性**: より大きなサンプルほど、より正確な統計的表現を得られる

- **パフォーマンステスト**: クエリパフォーマンスを監視し、必要に応じてサンプリング係数を調整する

