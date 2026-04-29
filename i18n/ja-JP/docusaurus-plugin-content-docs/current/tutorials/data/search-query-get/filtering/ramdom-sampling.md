---
title: "ランダムサンプリング | Cloud"
slug: /ramdom-sampling
sidebar_key: ramdom-sampling
sidebar_label: "ランダムサンプリング"
beta: FALSE
notebook: FALSE
description: "大規模なデータセットを扱う際、洞察を得たりフィルタリングロジックをテストしたりするために、すべてのデータを処理する必要は必ずしもありません。ランダムサンプリングは、統計的に代表性のあるデータのサブセットを使用して作業できるようにすることで、クエリ時間とリソースの消費を大幅に削減するソリューションを提供します。| Cloud"
type: origin
token: ByJbwcpoCiBkDckR3VCcC4LTneg
sidebar_position: 7
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - data
  - filter
  - filtering expressions
  - filtering
  - random sampling

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ランダムサンプリング

大規模なデータセットを扱う際、インサイトを得たりフィルタリングロジックをテストしたりするために、必ずしもすべてのデータを処理する必要はありません。ランダムサンプリングは、統計的に代表的なデータのサブセットを使用できるようにすることで、この課題を解決します。これにより、クエリ時間とリソース消費を大幅に削減できます。

ランダムサンプリングはセグメントレベルで動作し、コレクション全体のデータ分布にわたってサンプルのランダム性を保ちつつ、効率的なパフォーマンスを実現します。

**主なユースケース:**

- **データ探索**: リソース使用量を最小限に抑えながら、コレクションの構造と内容をすばやくプレビュー

- **開発テスト**: 本番環境への完全展開前に、複雑なフィルタリングロジックを扱いやすいデータサンプルでテスト

- **リソース最適化**: 探索的クエリや統計分析における計算コストを削減

## 構文\{#syntax}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```go
filter := "RANDOM_SAMPLE(sampling_factor)"
```

</TabItem>

<TabItem value='java'>

```javascript
// node
```

</TabItem>

<TabItem value='java'>

```bash
# restful
export filterRandomSample='RANDOM_SAMPLE(sampling_factor)'
```

</TabItem>
</Tabs>

**パラメータ:**

- `sampling_factor`: (0, 1) の範囲（境界値を除く）のサンプリング係数。たとえば、`RANDOM_SAMPLE(0.001)` は結果の約 0.1% を選択します。

**重要なルール:**

- 式は大文字・小文字を区別しません（`RANDOM_SAMPLE` または `random_sample` のいずれでも可）

- サンプリング係数は (0, 1) の範囲内（境界値を除く）でなければなりません

## 他のフィルターとの組み合わせ\{#combine-with-other-filters}

ランダムサンプリング演算子は、論理演算子 `AND` を使って他のフィルター式と組み合わせる必要があります。フィルターを組み合わせる場合、Milvus はまず他の条件を適用し、その後結果セットに対してランダムサンプリングを実行します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```go
// Correct: Filter first, then sample
filter := 'color == "red" AND RANDOM_SAMPLE(0.001)'
// Processing: Find all red items → Sample 0.1% of those red items

filter := 'color == "red" OR RANDOM_SAMPLE(0.001)' // ❌ Invalid logic
// This would mean: "Either red items OR sample everything" - which is meaningless
```

</TabItem>

<TabItem value='java'>

```javascript
// node
```

</TabItem>

<TabItem value='java'>

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

## 例\{#examples}

### 例 1: データ探索\{#example-1-data-exploration}

コレクションの構造をすばやくプレビューします：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

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

<TabItem value='java'>

```javascript
// node
```

</TabItem>

<TabItem value='java'>

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

### 例 2: ランダムサンプリングを用いた複合フィルタリング\{#example-2-combined-filtering-with-random-sampling}

扱いやすいサブセットに対してフィルタリングロジックをテストします：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

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

<TabItem value='java'>

```javascript
// node
```

</TabItem>

<TabItem value='java'>

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

### 例3: クイック分析\{#example-3-quick-analytics}

フィルタリングされたデータに対して迅速な統計分析を実行します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

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

<TabItem value='java'>

```javascript
// node
```

</TabItem>

<TabItem value='java'>

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

### 例4: ベクトル検索との組み合わせ\{#example-4-combined-with-vector-search}

フィルター検索のシナリオでランダムサンプリングを使用する:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Search for similar products within a sampled subset
search_results = client.search(
    collection_name="product_catalog",
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],  # query vector
    # highlight-next-line
    filter='category == "books" AND RANDOM_SAMPLE(0.01)',
    search_params={"metric_type": "L2", "params": {}},
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

<TabItem value='java'>

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

<TabItem value='java'>

```javascript
// node
```

</TabItem>

<TabItem value='java'>

```bash
# restful
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

```

</TabItem>
</Tabs>

## Best practices\{#best-practices}

- **Start small**: 初期の探索段階では、小さいサンプリング係数（0.001～0.01）から始めましょう

- **開発ワークフロー**: 開発ワークフローでは開発中にサンプリングを使用し、本番クエリではこれを削除します

- **統計的妥当性**: 大きいサンプルほど、より正確な統計的妥当性を提供します

- **パフォーマンステスト**: パフォーマンステストを行い、必要に応じてサンプリング係数を調整してください

