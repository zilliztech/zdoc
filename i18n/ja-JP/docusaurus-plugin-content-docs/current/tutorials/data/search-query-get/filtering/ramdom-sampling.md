---
title: "ランダムサンプリング | Cloud"
slug: /ramdom-sampling
sidebar_label: "ランダムサンプリング"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "大規模なデータセットを扱う際、洞察を得たりフィルタリングロジックをテストしたりするためにすべてのデータを処理する必要はありません。ランダムサンプリングは、統計的に代表的なデータサブセットで作業できるようにすることで、クエリ時間とリソース消費を大幅に削減する解決策を提供します。| Cloud"
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
  - ベクトル埋め込みとは
  - ベクトルデータベースチュートリアル
  - ベクトルデータベースの仕組み
  - ベクトルデータベース比較

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ランダムサンプリング

大規模なデータセットを扱う際、洞察を得たりフィルタリングロジックをテストしたりするためにすべてのデータを処理する必要はありません。ランダムサンプリングは、統計的に代表的なデータサブセットで作業できるようにすることで、クエリ時間とリソース消費を大幅に削減する解決策を提供します。

ランダムサンプリングはセグメントレベルで動作し、コレクションのデータ分布全体でサンプルのランダム性を維持しながら効率的なパフォーマンスを確保します。

**主な利用例：**

- **データ探索**：最小限のリソース使用でコレクション構造と内容を素早くプレビュー

- **開発テスト**：完全展開前に管理しやすいデータサンプルで複雑なフィルタリングロジックをテスト

- **リソース最適化**：探索的クエリと統計分析のための計算コストを削減

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

**パラメータ：**

- `sampling_factor`：範囲 (0, 1) のサンプリング係数（境界を除く）。たとえば、`RANDOM_SAMPLE(0.001)` は結果のおよそ 0.1% を選択します。

**重要なルール：**

- 式は大文字小文字を区別しません（`RANDOM_SAMPLE` または `random_sample`）

- サンプリング係数は範囲 (0, 1) で境界を除かなければなりません

## 他のフィルターとの組み合わせ\{#combine-with-other-filters}

ランダムサンプリング演算子は、論理的な `AND` を使用して他のフィルター式と組み合わせる必要があります。フィルターを組み合わせる場合、Milvus は最初に他の条件を適用し、その後結果セットでランダムサンプリングを実行します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 正しい：最初にフィルター、その後サンプル
filter = 'color == "red" AND RANDOM_SAMPLE(0.001)'
# 処理：すべての赤いアイテムを検索 → その赤いアイテムの0.1%をサンプル

# 誤り：OR は論理的に意味をなしません
filter = 'color == "red" OR RANDOM_SAMPLE(0.001)'  # ❌ 無効なロジック
# これは「赤いアイテムまたはすべてをサンプル」を意味し、意味がありません
```

</TabItem>

<TabItem value='java'>

```java
// 正しい：最初にフィルター、その後サンプル
String filter = 'color == "red" AND RANDOM_SAMPLE(0.001)';
// 処理：すべての赤いアイテムを検索 → その赤いアイテムの0.1%をサンプル

// 誤り：OR は論理的に意味をなしません
String filter = 'color == "red" OR RANDOM_SAMPLE(0.001)';  // ❌ 無効なロジック
// これは「赤いアイテムまたはすべてをサンプル」を意味し、意味がありません
```

</TabItem>

<TabItem value='go'>

```go
// 正しい：最初にフィルター、その後サンプル
filter := 'color == "red" AND RANDOM_SAMPLE(0.001)'
// 処理：すべての赤いアイテムを検索 → その赤いアイテムの0.1%をサンプル

filter := 'color == "red" OR RANDOM_SAMPLE(0.001)' // ❌ 無効なロジック
// これは「赤いアイテムまたはすべてをサンプル」を意味し、意味がありません
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
# 正しい：最初にフィルター、その後サンプル
export filterSampleCorrect='color == "red" AND RANDOM_SAMPLE(0.001)'
# 処理：すべての赤いアイテムを検索 → その赤いアイテムの0.1%をサンプル

# 誤り：OR は論理的に意味をなしません
export filterSampleIncorrect='color == "red" OR RANDOM_SAMPLE(0.001)'  # ❌ 無効なロジック
# これは「赤いアイテムまたはすべてをサンプル」を意味し、意味がありません
```

</TabItem>
</Tabs>

## 例\{#examples}

### 例1: データ探索\{#example-1-data-exploration}

コレクション構造を素早くプレビュー：

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

print(f"コレクションから {len(result)} 個の商品をサンプルしました")
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
</Tabs>

### 例2: ランダムサンプリングとの組み合わせフィルタリング\{#example-2-combined-filtering-with-random-sampling}

管理しやすいサブセットでフィルタリングロジックをテスト：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 最初にカテゴリと価格でフィルター、その後結果の0.5%をサンプル
filter_expression = 'category == "electronics" AND price > 100 AND RANDOM_SAMPLE(0.005)'

result = client.query(
    collection_name="product_catalog",
    # highlight-next-line
    filter=filter_expression,
    output_fields=["product_name", "price", "rating"],
    limit=10
)

print(f"サンプル中の {len(result)} 個の電子機器製品が見つかりました")
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

### 例3: 簡易分析\{#example-3-quick-analytics}

フィルターされたデータで迅速な統計分析を実行：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# プレミアム顧客データの約0.1%から洞察を得る
filter_expression = 'customer_tier == "premium" AND region == 'North America' AND RANDOM_SAMPLE(0.001)'

result = client.query(
    collection_name="customer_profiles",
    # highlight-next-line
    filter=filter_expression,
    output_fields=["purchase_amount", "satisfaction_score", "last_purchase_date"],
    limit=10
)

# 素早い洞察のためのサンプル分析
if result:
    average_purchase = sum(r["purchase_amount"] for r in result) / len(result)
    average_satisfaction = sum(r["satisfaction_score"] for r in result) / len(result)

    print(f"サンプルサイズ: {len(result)}")
    print(f"平均購入額: ${average_purchase:.2f}")
    print(f"平均満足度スコア: {average_satisfaction:.2f}")
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

フィルターされた検索シナリオでランダムサンプリングを使用：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# サンプルされたサブセット内で類似製品を検索
search_results = client.search(
    collection_name="product_catalog",
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],  # クエリベクトル
    # highlight-next-line
    filter='category == "books" AND RANDOM_SAMPLE(0.01)',
    search_params={"metric_type": "L2", "params": {}},
    output_fields=["title", "author", "price"],
    limit=10
)

print(f"サンプル中に {len(search_results[0])} 個の類似書籍が見つかりました")
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
</Tabs>

## ベストプラクティス\{#best-practices}

- **小さな値から始める**：初期探索には小さなサンプリング係数（0.001-0.01）から始める

- **開発ワークフロー**：開発中はサンプリングを使用し、プロダクションクエリでは削除する

- **統計的妥当性**：大きなサンプルはより正確な統計的表現を提供する

- **パフォーマンステスト**：クエリパフォーマンスを監視し、必要に応じてサンプリング係数を調整する