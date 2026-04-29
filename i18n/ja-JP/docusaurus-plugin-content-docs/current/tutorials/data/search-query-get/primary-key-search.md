---
title: "主キー検索 | Cloud"
slug: /primary-key-search
sidebar_key: primary-key-search
sidebar_label: "主キー検索"
beta: FALSE
notebook: FALSE
description: "類似性検索を実行する際、クエリベクトルが対象コレクションに既に存在している場合でも、1 つ以上のクエリベクトルの提供が常に求められます。検索前にベクトルを取得することを回避するため、代わりに主キーを使用できます。 | Cloud"
type: origin
token: U7OvwHP3AiUWlckzIEKclLQQnPr
sidebar_position: 6
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - コレクション
  - データ
  - グループ化検索
  - 主キー
  - 主キー検索

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# プライマリキー検索

類似性検索を実行する際には、通常、1つ以上のクエリベクトルを提供する必要があります。これは、クエリベクトルがすでにターゲットコレクション内に存在している場合でも同様です。検索前にベクトルを取得する手間を省くために、代わりにプライマリキーを使用できます。

## 概要\{#overview}

ECプラットフォームでは、ユーザーがキーワードを入力してそれと一致する商品を取得できます。ユーザーが商品詳細ページを表示すると、そのページの下部に類似商品の一覧が表示され、比較したいユーザーの利便性を高めます。

これらのレコメンデーションは、キーワードまたは現在表示中の商品との類似度に基づいて並べ替えられます。これを実現するために、プラットフォーム開発者はMilvusからキーワードまたは現在の商品のベクトル表現を事前に取得する必要があります。これにより、プラットフォームとMilvus間の往復通信が増え、ネットワーク上で大量の高次元浮動小数点値が転送されることになります。

アプリケーションとMilvus間のインタラクションロジックを簡素化し、往復通信の回数を減らし、ネットワーク上で大量の高次元浮動小数点値を転送しないようにするために、プライマリキー検索の使用を検討してください。

プライマリキー検索では、クエリベクトルを一切提供する必要はありません。代わりに、クエリベクトルを含むエンティティのプライマリキー（`ids`）を指定します。

## 制限と制約\{#limits-and-restrictions}

- プライマリキーを使用した検索は、すべてのベクトルデータ型に適用されますが、BM25関数のようにVarCharフィールドから派生したスパースベクトルフィールドは例外です。

- フィルター検索、範囲検索、グループ化検索では、クエリベクトルの代わりにプライマリキーを使用できます（オプションでページネーションを有効にすることも可能）。ただし、この機能はハイブリッド検索および検索イテレータには適用されません。

- 埋め込みリストを用いた類似性検索を行う場合は、引き続きクエリベクトルを取得し、埋め込みリストに整理してから検索を実行する必要があります。

- 存在しないプライマリキーまたは不正な形式のプライマリキーを指定した場合、Milvusはエラーを返します。

- プライマリキーとクエリベクトルは相互排他的です。両方を同時に指定するとエラーになります。

## 例\{#examples}

以下の例では、提供されるすべてのInt64 IDがターゲットコレクション内に存在すると仮定しています。

<Admonition type="info" icon="📘" title="Notes">

<p>プライマリキーはフィルタリングには使用されず、ベクトル取得専用に使用されます。</p>

</Admonition>

### 例1: 基本的なプライマリキー検索\{#example-1-basic-primary-key-search}

基本的なプライマリキー検索を実行するには、クエリベクトルをプライマリキーに置き換えるだけです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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
    limit=3,
    search_params={"metric_type": "IP"}
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
        .metricType(IndexParam.MetricType.IP)
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

<TabItem value='java'>

```javascript
// node.js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  -d '{
    "collectionName": "my_collection",
    "annsField": "vector",
    "ids": [551, 296, 43],
    "limit": 3,
    "searchParams": {
      "metric_type": "IP"
    }
  }'
```

</TabItem>
</Tabs>

### 例2: 主キーを使用したフィルター検索\{#example-2-filtered-search-using-primary-keys}

以下の例では、`color` および `likes` が対象コレクション内でスキーマ定義された2つのフィールドであることを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
// node.js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
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
</Tabs>

### 例3: 主キーを使用した範囲検索\{#example-3-range-search-using-primary-keys}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
// node.js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
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
</Tabs>

### 例4: 主キーを使用したグループ化検索\{#example-4-grouping-search-using-primary-keys}

以下の例では、`docId` が対象コレクションのスキーマで定義されたフィールドであることを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
// node.js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
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
</Tabs>

