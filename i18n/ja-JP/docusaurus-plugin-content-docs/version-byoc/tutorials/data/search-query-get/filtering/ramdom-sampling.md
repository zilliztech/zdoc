---
title: "ランダムサンプリング | BYOC"
slug: /ramdom-sampling
sidebar_label: "ランダムサンプリング"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "大規模データセットを扱う際、洞察を得たりフィルタリングロジックをテストしたりするためにすべてのデータを処理する必要はありません。ランダムサンプリングは、統計的に代表性のあるデータのサブセットで作業することを可能にし、クエリ時間とリソース消費を大幅に削減します。 | BYOC"
type: origin
token: ByJbwcpoCiBkDckR3VCcC4LTneg
sidebar_position: 6
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - フィルター
  - フィルタリング式
  - フィルタリング
  - ランダムサンプリング
  - ベクトルインデックス
  - オープンソースベクトルデータベース
  - オープンソースベクトルdb
  - ベクトルデータベースの例

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ランダムサンプリング

大規模データセットを扱う際、洞察を得たりフィルタリングロジックをテストするためにすべてのデータを処理する必要はありません。ランダムサンプリングは、統計的に代表性のあるデータのサブセットで作業することを可能にし、クエリ時間とリソース消費を大幅に削減します。

ランダムサンプリングはセグメントレベルで動作し、コレクションのデータ分布におけるサンプルのランダム性を維持しながら効率的なパフォーマンスを確保します。

**主な使用例:**

- **データ探索**: 最小限のリソース使用でコレクション構造と内容を迅速にプレビュー

- **開発テスト**: 本格的な展開前に管理可能なデータサンプルで複雑なフィルタリングロジックをテスト

- **リソースの最適化**: 探索的クエリと統計解析のための計算コストを削減

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
export filterRandomSample='RANDOM_SAMPLE(0.5)'
```

</TabItem>
</Tabs>

**パラメータ:**

- `sampling_factor`: (0, 1)の範囲のサンプリング係数で、境界を除きます。たとえば、`RANDOM_SAMPLE(0.001)`は結果の約0.1%を選択します。

**重要なルール:**

- 式は大文字小文字を区別しません（`RANDOM_SAMPLE`または`random_sample`）

- サンプリング係数は境界を除いて(0, 1)の範囲でなければなりません

## 他のフィルターとの組み合わせ\{#combine-with-other-filters}

ランダムサンプリング演算子は論理的な`AND`を使用して他のフィルター式と組み合わせる必要があります。フィルターを組み合わせる場合、Milvusはまず他の条件を適用し、その後結果セットに対してランダムサンプリングを実行します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 正しい: まずフィルターし、その後サンプル
filter = 'color == "red" AND RANDOM_SAMPLE(0.001)'
# 処理: すべての赤いアイテムを検索 → それらの赤いアイテムの0.1%をサンプル

# 誤り: ORは論理的に意味をなしません
filter = 'color == "red" OR RANDOM_SAMPLE(0.001)'  # ❌ 無効なロジック
# これは「赤いアイテム OR すべてをサンプル」を意味する - これは意味がありません
```

</TabItem>

<TabItem value='java'>

```java
// 正しい: まずフィルターし、その後サンプル
String filter = 'color == "red" AND RANDOM_SAMPLE(0.001)';
// 処理: すべての赤いアイテムを検索 → それらの赤いアイテムの0.1%をサンプル

// 誤り: ORは論理的に意味をなしません
String filter = 'color == "red" OR RANDOM_SAMPLE(0.001)';  // ❌ 無効なロジック
// これは「赤いアイテム OR すべてをサンプル」を意味する - これは意味がありません
```

</TabItem>

<TabItem value='go'>

```go
// 正しい: まずフィルターし、その後サンプル
filter := 'color == "red" AND RANDOM_SAMPLE(0.001)'
// 処理: すべての赤いアイテムを検索 → それらの赤いアイテムの0.1%をサンプル

filter := 'color == "red" OR RANDOM_SAMPLE(0.001)' // ❌ 無効なロジック
// これは「赤いアイテム OR すべてをサンプル」を意味する - これは意味がありません
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
# 正しい: まずフィルターし、その後サンプル
export filterSampleCorrect='color == "red" AND RANDOM_SAMPLE(0.001)'
# 処理: すべての赤いアイテムを検索 → それらの赤いアイテムの0.1%をサンプル

# 誤り: ORは論理的に意味をなしません
export filterSampleIncorrect='color == "red" OR RANDOM_SAMPLE(0.001)'  # ❌ 無効なロジック
# これは「赤いアイテム OR すべてをサンプル」を意味する - これは意味がありません
```

</TabItem>
</Tabs>

## 例\{#examples}

### 例1: データ探索\{#example-1-data-exploration}

コレクション構造を迅速にプレビュー:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# コレクション全体の約1%をサンプル
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

List<List<QueryResp.QueryResult>> results = queryResp.getQueryResults();
for (List<QueryResp.QueryResult> result : results) {
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

resultSets, err := client.Query(ctx, milvusclient.NewQueryOption("product_catalog").
    WithFilter("RANDOM_SAMPLE(0.01)").
    WithOutputFields("id", "product_name"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println("id: ", resultSets.GetColumn("id").FieldData().GetScalars())
fmt.Println("product_name: ", resultSets.GetColumn("product_name").FieldData().GetScalars())
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
</Tabs>

### 例2: ランダムサンプリングとの組み合わせフィルタリング\{#example-2-combined-filtering-with-random-sampling}

管理可能なサブセットでフィルタリングロジックをテスト:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# まずカテゴリと価格でフィルターし、その後結果の0.5%をサンプル
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
</Tabs>

### 例3: クイック分析\{#example-3-quick-analytics}

フィルターされたデータで迅速な統計分析を実行:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# プレミアム顧客データの約0.1%から洞察を得る
filter_expression = 'customer_tier == "premium" AND region == "North America" AND RANDOM_SAMPLE(0.001)'

result = client.query(
    collection_name="customer_profiles",
    # highlight-next-line
    filter=filter_expression,
    output_fields=["purchase_amount", "satisfaction_score", "last_purchase_date"],
    limit=10
)

# サンプルを分析して迅速な洞察を得る
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
</Tabs>

### 例4: ベクトル検索との組み合わせ\{#example-4-combined-with-vector-search}

フィルターされた検索シナリオでランダムサンプリングを使用:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# サンプル化されたサブセット内で類似する製品を検索
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

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"product_catalog\",
  \"data\": [[0.1, 0.2, 0.3, 0.4, 0.5]],
  \"annsField\": \"vector\",
  \"searchParams\": {},
  \"outputFields\": [\"title\", \"author\", \"price\"],
  \"filter\": \"category == \\\"books\\\" AND RANDOM_SAMPLE(0.01)\",
  \"limit\": 10
}"
```

</TabItem>
</Tabs>

## ベストプラクティス\{#best-practices}

- **小規模から始める**: 最初の探索では小さなサンプリング係数（0.001-0.01）を使用して開始

- **開発ワークフロー**: 開発中はサンプリングを使用し、本番クエリでは削除

- **統計的妥当性**: 大きいサンプルはより正確な統計的表現を提供

- **パフォーマンステスト**: クエリパフォーマンスを監視し、必要に応じてサンプリング係数を調整