---
title: "Elasticsearch クエリから Milvus へ | BYOC"
slug: /elasticsearch-queries-to-milvus
sidebar_label: "Elasticsearch クエリから Milvus へ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Apache Lucene を基盤とする Elasticsearch は、代表的なオープンソース検索エンジンです。ただし、更新コストの高さ、リアルタイム性能の低さ、非効率なシャード管理、クラウドネイティブではない設計、過剰なリソース需要など、現代の AI アプリケーションでは課題に直面します。クラウドネイティブなベクトルデータベースである Milvus は、ストレージとコンピューティングの分離、高次元データの効率的なインデックス作成、最新インフラストラクチャとのシームレスな統合により、これらの課題を克服します。AI ワークロードに対して優れた性能とスケーラビリティを提供します。 | BYOC"
type: origin
token: OFl9wHXpriM8aEkoONScpU1lnIf
sidebar_position: 17
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Elasticsearch クエリから Milvus へ

Apache Lucene を基盤とする Elasticsearch は、代表的なオープンソース検索エンジンです。ただし、更新コストの高さ、リアルタイム性能の低さ、非効率なシャード管理、クラウドネイティブではない設計、過剰なリソース需要など、現代の AI アプリケーションでは課題に直面します。クラウドネイティブなベクトルデータベースである Milvus は、ストレージとコンピューティングの分離、高次元データの効率的なインデックス作成、最新インフラストラクチャとのシームレスな統合により、これらの課題を克服します。AI ワークロードに対して優れた性能とスケーラビリティを提供します。

この記事では、コードベースを Elasticsearch から Milvus へ移行しやすくするため、両者間でクエリを変換するさまざまな例を紹介します。

## 概要\{#overview}

Elasticsearch では、query コンテキストの操作は関連性スコアを生成しますが、filter コンテキストの操作は生成しません。同様に、Milvus の検索は類似度スコアを生成しますが、フィルターに類するクエリは生成しません。コードベースを Elasticsearch から Milvus へ移行する際の重要な原則は、Elasticsearch の query コンテキストで使用されるフィールドをベクトルフィールドに変換し、類似度スコアを生成できるようにすることです。

次の表は、Elasticsearch のクエリパターンの一部と、対応する Milvus の同等機能を示しています。

<table>
   <tr>
     <th><p>Elasticsearch クエリ</p></th>
     <th><p>Milvus の同等機能</p></th>
     <th><p>備考</p></th>
   </tr>
   <tr>
     <td colspan="3"><p><strong>全文クエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#match-query">マッチクエリ</a></p></td>
     <td><p>全文検索</p></td>
     <td><p>どちらも同様の機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>タームレベルクエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#ids">IDs</a></p></td>
     <td><p><code>in</code> 演算子</p></td>
     <td rowspan="6"><p>これらの Elasticsearch クエリを filter コンテキストで使用する場合、どちらも同一または同様の機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#prefix-query">プレフィックスクエリ</a></p></td>
     <td><p><code>like</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#range-query">レンジクエリ</a></p></td>
     <td><p><code>&gt;</code>、<code>&lt;</code>、<code>&gt;=</code>、<code>&lt;=</code> などの比較演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#term-query">タームクエリ</a></p></td>
     <td><p><code>==</code> などの比較演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#terms-query">タームズクエリ</a></p></td>
     <td><p><code>in</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#wildcard-query">ワイルドカードクエリ</a></p></td>
     <td><p><code>like</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#boolean-query">ブールクエリ</a></p></td>
     <td><p><code>AND</code> などの論理演算子</p></td>
     <td><p>filter コンテキストで使用する場合、どちらも同様の機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>ベクトルクエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#knn-query">kNN クエリ</a></p></td>
     <td><p>検索</p></td>
     <td><p>Milvus はより高度なベクトル検索機能を提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#reciprocal-rank-fusion">Reciprocal Rank Fusion</a></p></td>
     <td><p>ハイブリッド検索</p></td>
     <td><p>Milvus は複数の再ランク付け戦略をサポートしています。</p></td>
   </tr>
</table>

## 全文クエリ\{#full-text-queries}

Elasticsearch では、全文クエリを使用すると、メール本文などの分析済みテキストフィールドを検索できます。クエリ文字列は、インデックス作成時にフィールドに適用されたものと同じアナライザーで処理されます。

### マッチクエリ\{#match-query}

Elasticsearch では、マッチクエリは、指定されたテキスト、数値、日付、またはブール値に一致するドキュメントを返します。指定されたテキストは、照合前に分析されます。

以下は、マッチクエリを使用した Elasticsearch 検索リクエストの例です。

```python
resp = client.search(
    query={
        "match": {
            "message": {
                "query": "this is a test"
            }
        }
    },
)
```

Milvus は全文検索機能を通じて同じ機能を提供します。上記の Elasticsearch クエリは、次のように Milvus に変換できます:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=['How is the weather in Jamaica?'],
    anns_field="message_sparse",
    output_fields=["id", "message"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.*;

SearchReq searchReq = SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new EmbeddedText("How is the weather in Jamaica?")))
        .annsField("message_sparse")
        .topK(10)
        .outputFields(Arrays.asList("id", "message"))
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

client.Search(ctx, milvusclient.NewSearchOption("my_collection", 10, []entity.Vector{entity.Text("How is the weather in Jamaica?")}).
    WithANNSField("message_sparse").
    WithOutputFields("id", "message"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .search(
        SearchRequest::builder()
            .collection_name("my_collection")
            .vector_field("message_sparse")
            .vectors(SearchVectors::EmbeddedText(vec!["How is the weather in Jamaica?".to_string()]))
            .output_fields(["id", "message"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::SearchRequest()
    .WithCollectionName("my_collection")
    .WithAnnsField("message_sparse")
    .AddEmbeddedText("How is the weather in Jamaica?")
    .AddOutputField("id")
    .AddOutputField("message");

milvus::SearchResponse response;
auto status = client->Search(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
    collection_name: "my_collection",
    data: ["How is the weather in Jamaica?"],
    anns_field: "message_sparse",
    output_fields: ["id", "message"],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var res = await client.SearchAsync(new SearchReq
{
    CollectionName = "my_collection",
    VectorFieldName = "message_sparse",
    Texts = new[] { "How is the weather in Jamaica?" },
    Limit = 10,
    Parameters = new SearchParameters { OutputFields = { "id", "message" } }
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "my_collection",
      "data": ["How is the weather in Jamaica?"],
      "annsField": "message_sparse",
      "outputFields": ["id", "message"]
  }'
```

</TabItem>
</Tabs>

上記の例では、`message_sparse` は `message` という名前の VarChar フィールドから派生したスパースベクトルフィールドです。Milvus は BM25 埋め込みモデルを使用して、`message` フィールドの値をスパースベクトル埋め込みに変換し、`message_sparse` フィールドに保存します。検索リクエストを受信すると、Milvus は同じ BM25 モデルを使用してプレーンテキストのクエリペイロードを埋め込み、スパースベクトル検索を実行し、`output_fields` パラメーターで指定された `id` フィールドと `message` フィールドを、対応する類似度スコアとともに返します。

この機能を使用するには、`message` フィールドでアナライザーを有効にし、そこから `message_sparse` フィールドを派生させる関数を定義する必要があります。Milvus でアナライザーを有効にして派生関数を作成する詳細な手順については、[全文検索](./full-text-search) を参照してください。

## タームレベルクエリ\{#term-level-queries}

Elasticsearch では、タームレベルクエリは、日付範囲、IP アドレス、価格、製品 ID など、構造化データ内の正確な値に基づいてドキュメントを検索するために使用されます。このセクションでは、Elasticsearch の一部のタームレベルクエリに対応する可能性のある Milvus の機能について説明します。このセクションのすべての例は、Milvus の機能に合わせて filter コンテキスト内で動作するように調整されています。

### ID\{#ids}

Elasticsearch では、次のようにして filter コンテキストで ID に基づいてドキュメントを検索できます:

```python
resp = client.search(
    query={
        "bool": {
            "filter": {
                "ids": {
                    "values": [
                        "1",
                        "4",
                        "100"
                    ]
                }            
            }
        }
    },
)
```

Milvus でも、次のようにして ID に基づいてエンティティを検索できます:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Use the filter parameter
res = client.query(
    collection_name="my_collection",
    filter="id in [1, 4, 100]",
    output_fields=["id", "title"]
)

# Use the ids parameter
res = client.query(
    collection_name="my_collection",
    ids=[1, 4, 100],
    output_fields=["id", "title"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.*;

// Use the filter parameter
QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("id in [1, 4, 100]")
        .outputFields(Arrays.asList("id", "title"))
        .build();
QueryResp queryResp = client.query(queryReq);

// Use the ids parameter
queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .ids(Arrays.asList(1, 4, 100))
        .outputFields(Arrays.asList("id", "title"))
        .build();
queryResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/column"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

// Use the filter parameter
client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("id in [1, 4, 100]").
    WithOutputFields("id", "title"))

// Use the ids parameter
client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithIDs(column.NewColumnInt64("id", []int64{1, 4, 100})).
    WithOutputFields("id", "title"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// Use the filter parameter
client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("id in [1, 4, 100]")
            .output_fields(["id", "title"])
            .build()?,
    )
    .await?;

// Use the ids parameter
client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .ids(Ids::Int64(vec![1, 4, 100]))
            .output_fields(["id", "title"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
// Use the filter parameter
auto request = milvus::QueryRequest()
    .WithCollectionName("my_collection")
    .WithFilter("id in [1, 4, 100]")
    .AddOutputField("id")
    .AddOutputField("title")
;
milvus::QueryResponse response;
auto status = client->Query(request, response);

// Use the ids parameter
request = milvus::QueryRequest()
    .WithCollectionName("my_collection")
    .WithIDs(std::vector<int64_t>{1, 4, 100})
    .AddOutputField("id")
    .AddOutputField("title")
;
status = client->Query(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Use the filter parameter
const res = await client.query({
    collection_name: "my_collection",
    filter: 'id in [1, 4, 100]',
    output_fields: ["id", "title"],
});

// Use the ids parameter
const res2 = await client.query({
    collection_name: "my_collection",
    ids: [1, 4, 100],
    output_fields: ["id", "title"],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

// Use the filter parameter
var res = await client.QueryAsync(new QueryReq
{
    CollectionName = "my_collection",
    Expression = "id in [1, 4, 100]",
    Parameters = new QueryParameters { OutputFields = { "id", "title" } }
});

// Use the ids parameter
res = await client.QueryAsync(new QueryReq
{
    CollectionName = "my_collection",
    Parameters = new QueryParameters { OutputFields = { "id", "title" }, Ids = new object[] { 1L, 4L, 100L } }
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "my_collection",
      "filter": "id in [1, 4, 100]",
      "outputFields": ["id", "title"]
  }'
```

</TabItem>
</Tabs>

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-ids-query.html) にあります。Milvus のクエリおよび取得リクエストと、フィルター式の詳細については、[クエリ](./get-and-scalar-query) および [フィルタリングの説明](./filtering-overview) を参照してください。

### プレフィックスクエリ\{#prefix-query}

Elasticsearch では、次のようにして filter コンテキストで指定されたフィールド内に特定のプレフィックスを含むドキュメントを検索できます:

```python
resp = client.search(
    query={
        "bool": {
            "filter": {
                 "prefix": {
                    "user": {
                        "value": "ki"
                    }
                }           
            }
        }
    },
)
```

Milvus では、次のようにして値が指定されたプレフィックスで始まるエンティティを検索できます:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%"',
    output_fields=["id", "user"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.*;

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("user like \"ki%\"")
        .outputFields(Arrays.asList("id", "user"))
        .build();
QueryResp queryResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/milvusclient"

client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("user like \"ki%\"").
    WithOutputFields("id", "user"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("user like \"ki%\"")
            .output_fields(["id", "user"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
    .WithCollectionName("my_collection")
    .WithFilter("user like \"ki%\"")
    .AddOutputField("id")
    .AddOutputField("user")
;
milvus::QueryResponse response;
auto status = client->Query(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.query({
    collection_name: "my_collection",
    filter: 'user like "ki%"',
    output_fields: ["id", "user"],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var res = await client.QueryAsync(new QueryReq
{
    CollectionName = "my_collection",
    Expression = "user like \"ki%\"",
    Parameters = new QueryParameters { OutputFields = { "id", "user" } }
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "my_collection",
      "filter": "user like \"ki%\"",
      "outputFields": ["id", "user"]
  }'
```

</TabItem>
</Tabs>

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html) にあります。Milvus の `like` 演算子の詳細については、[パターンマッチングでの ](./basic-filtering-operators)[`LIKE`](./basic-filtering-operators)[ の使用](./basic-filtering-operators) を参照してください。

### レンジクエリ\{#range-query}

Elasticsearch では、次のようにして指定された範囲内のタームを含むドキュメントを検索できます:

```python
resp = client.search(
    query={
        "bool": {
            "filter": {
                "range": {
                    "age": {
                        "gte": 10,
                        "lte": 20
                    }
                }           
            }
        }
    },
)
```

Milvus では、次のようにして特定のフィールドの値が指定された範囲内にあるエンティティを検索できます:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.query(
    collection_name="my_collection",
    filter='10 <= age <= 20',
    output_fields=["id", "user", "age"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.*;

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("10 <= age <= 20")
        .outputFields(Arrays.asList("id", "user", "age"))
        .build();
QueryResp queryResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/milvusclient"

client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("10 <= age <= 20").
    WithOutputFields("id", "user", "age"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("10 <= age <= 20")
            .output_fields(["id", "user", "age"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
    .WithCollectionName("my_collection")
    .WithFilter("10 <= age <= 20")
    .AddOutputField("id")
    .AddOutputField("user")
    .AddOutputField("age")
;
milvus::QueryResponse response;
auto status = client->Query(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.query({
    collection_name: "my_collection",
    filter: '10 <= age <= 20',
    output_fields: ["id", "user", "age"],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var res = await client.QueryAsync(new QueryReq
{
    CollectionName = "my_collection",
    Expression = "10 <= age <= 20",
    Parameters = new QueryParameters { OutputFields = { "id", "age" } }
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "my_collection",
      "filter": "10 <= age <= 20",
      "outputFields": ["id", "user", "age"]
  }'
```

</TabItem>
</Tabs>

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html) にあります。Milvus の比較演算子の詳細については、[比較演算子](./basic-filtering-operators#comparison-operators) を参照してください。

### タームクエリ\{#term-query}

Elasticsearch では、次のようにして指定されたフィールド内に**完全一致**するタームを含むドキュメントを検索できます:

```python
resp = client.search(
    query={
        "bool": {
            "filter": {
                "term": {
                    "status": {
                        "value": "retired"
                    }
                }            
            }
        }
    },
)
```

Milvus では、次のようにして指定されたフィールドの値が指定されたタームと完全に一致するエンティティを検索できます:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# use ==
res = client.query(
    collection_name="my_collection",
    filter='status=="retired"',
    output_fields=["id", "user", "status"]
)

# use TEXT_MATCH
res = client.query(
    collection_name="my_collection",
    filter='TEXT_MATCH(status, "retired")',
    output_fields=["id", "user", "status"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.*;

// use ==
QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("status==\"retired\"")
        .outputFields(Arrays.asList("id", "user", "status"))
        .build();
QueryResp queryResp = client.query(queryReq);

// use TEXT_MATCH
queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("TEXT_MATCH(status, \"retired\")")
        .outputFields(Arrays.asList("id", "user", "status"))
        .build();
queryResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/milvusclient"

// use ==
client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("status==\"retired\"").
    WithOutputFields("id", "user", "status"))

// use TEXT_MATCH
client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("TEXT_MATCH(status, \"retired\")").
    WithOutputFields("id", "user", "status"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// use ==
client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("status==\"retired\"")
            .output_fields(["id", "user", "status"])
            .build()?,
    )
    .await?;

// use TEXT_MATCH
client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("TEXT_MATCH(status, \"retired\")")
            .output_fields(["id", "user", "status"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
// use ==
auto request = milvus::QueryRequest()
    .WithCollectionName("my_collection")
    .WithFilter("status==\"retired\"")
    .AddOutputField("id")
    .AddOutputField("user")
    .AddOutputField("status")
;
milvus::QueryResponse response;
auto status = client->Query(request, response);

// use TEXT_MATCH
request = milvus::QueryRequest()
    .WithCollectionName("my_collection")
    .WithFilter("TEXT_MATCH(status, \"retired\")")
    .AddOutputField("id")
    .AddOutputField("user")
    .AddOutputField("status")
;
status = client->Query(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// use ==
const res = await client.query({
    collection_name: "my_collection",
    filter: 'status=="retired"',
    output_fields: ["id", "user", "status"],
});

// use TEXT_MATCH
const res2 = await client.query({
    collection_name: "my_collection",
    filter: 'TEXT_MATCH(status, "retired")',
    output_fields: ["id", "user", "status"],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

// use ==
var res = await client.QueryAsync(new QueryReq
{
    CollectionName = "my_collection",
    Expression = "status==\"retired\"",
    Parameters = new QueryParameters { OutputFields = { "id", "user", "status" } }
});

// use TEXT_MATCH
res = await client.QueryAsync(new QueryReq
{
    CollectionName = "my_collection",
    Expression = "TEXT_MATCH(status, \"retired\")",
    Parameters = new QueryParameters { OutputFields = { "id", "user", "status" } }
});
```

</TabItem>

<TabItem value='bash'>

```bash
# use ==
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "my_collection",
      "filter": "status==\"retired\"",
      "outputFields": ["id", "user", "status"]
  }'

# use TEXT_MATCH
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "my_collection",
      "filter": "TEXT_MATCH(status, \"retired\")",
      "outputFields": ["id", "user", "status"]
  }'
```

</TabItem>
</Tabs>

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html) にあります。Milvus の比較演算子の詳細については、[比較演算子](./basic-filtering-operators#comparison-operators) を参照してください。

### タームズクエリ\{#terms-query}

Elasticsearch では、次のようにして指定されたフィールド内に 1 つ以上の**完全一致**するタームを含むドキュメントを検索できます:

```python
resp = client.search(
    query={
        "bool": {
            "filter": {
                "terms": {
                    "degree": [
                        "graduate",
                        "post-graduate"
                    ]
                }        
            }
        }
    }
)
```

Milvus には、これに完全に相当する機能はありません。ただし、次のようにして指定されたフィールドの値が指定されたタームのいずれかであるエンティティを検索できます:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# use in
res = client.query(
    collection_name="my_collection",
    filter='degree in ["graduate", "post-graduate"]',
    output_fields=["id", "user", "degree"]
)

# use TEXT_MATCH
res = client.query(
    collection_name="my_collection",
    filter='TEXT_MATCH(degree, "graduate post-graduate")',
    output_fields=["id", "user", "degree"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.*;

// use in
QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("degree in [\"graduate\", \"post-graduate\"]")
        .outputFields(Arrays.asList("id", "user", "degree"))
        .build();
QueryResp queryResp = client.query(queryReq);

// use TEXT_MATCH
queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("TEXT_MATCH(degree, \"graduate post-graduate\")")
        .outputFields(Arrays.asList("id", "user", "degree"))
        .build();
queryResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/milvusclient"

// use in
client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("degree in [\"graduate\", \"post-graduate\"]").
    WithOutputFields("id", "user", "degree"))

// use TEXT_MATCH
client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("TEXT_MATCH(degree, \"graduate post-graduate\")").
    WithOutputFields("id", "user", "degree"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// use in
client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("degree in [\"graduate\", \"post-graduate\"]")
            .output_fields(["id", "user", "degree"])
            .build()?,
    )
    .await?;

// use TEXT_MATCH
client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("TEXT_MATCH(degree, \"graduate post-graduate\")")
            .output_fields(["id", "user", "degree"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
// use in
auto request = milvus::QueryRequest()
    .WithCollectionName("my_collection")
    .WithFilter("degree in [\"graduate\", \"post-graduate\"]")
    .AddOutputField("id")
    .AddOutputField("user")
    .AddOutputField("degree")
;
milvus::QueryResponse response;
auto status = client->Query(request, response);

// use TEXT_MATCH
request = milvus::QueryRequest()
    .WithCollectionName("my_collection")
    .WithFilter("TEXT_MATCH(degree, \"graduate post-graduate\")")
    .AddOutputField("id")
    .AddOutputField("user")
    .AddOutputField("degree")
;
status = client->Query(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// use in
const res = await client.query({
    collection_name: "my_collection",
    filter: 'degree in ["graduate", "post-graduate"]',
    output_fields: ["id", "user", "degree"],
});

// use TEXT_MATCH
const res2 = await client.query({
    collection_name: "my_collection",
    filter: 'TEXT_MATCH(degree, "graduate post-graduate")',
    output_fields: ["id", "user", "degree"],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

// use in
var res = await client.QueryAsync(new QueryReq
{
    CollectionName = "my_collection",
    Expression = "degree in [\"graduate\", \"post-graduate\"]",
    Parameters = new QueryParameters { OutputFields = { "id", "user", "degree" } }
});

// use TEXT_MATCH
res = await client.QueryAsync(new QueryReq
{
    CollectionName = "my_collection",
    Expression = "TEXT_MATCH(degree, \"graduate post-graduate\")",
    Parameters = new QueryParameters { OutputFields = { "id", "user", "degree" } }
});
```

</TabItem>

<TabItem value='bash'>

```bash
# use in
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "my_collection",
      "filter": "degree in [\"graduate\", \"post-graduate\"]",
      "outputFields": ["id", "user", "degree"]
  }'

# use TEXT_MATCH
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "my_collection",
      "filter": "TEXT_MATCH(degree, \"graduate post-graduate\")",
      "outputFields": ["id", "user", "degree"]
  }'
```

</TabItem>
</Tabs>

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html) にあります。Milvus の範囲演算子の詳細については、[範囲演算子](./basic-filtering-operators) を参照してください。

### ワイルドカードクエリ\{#wildcard-query}

Elasticsearch では、次のようにしてワイルドカードパターンに一致するタームを含むドキュメントを検索できます:

```python
resp = client.search(
    query={
        "bool": {
            "filter": {
                "wildcard": {
                    "user": {
                        "value": "ki*y"
                    }
                }          
            }
        }
    },
)
```

Milvus では、フィルタリング条件でワイルドカードをサポートしていません。ただし、次のように `like` 演算子を使用して同様の効果を得られます:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "ki%" AND user like "%y"',
    output_fields=["id", "user"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.*;

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("user like \"ki%\" AND user like \"%y\"")
        .outputFields(Arrays.asList("id", "user"))
        .build();
QueryResp queryResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/milvusclient"

client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("user like \"ki%\" AND user like \"%y\"").
    WithOutputFields("id", "user"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("user like \"ki%\" AND user like \"%y\"")
            .output_fields(["id", "user"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
    .WithCollectionName("my_collection")
    .WithFilter("user like \"ki%\" AND user like \"%y\"")
    .AddOutputField("id")
    .AddOutputField("user")
;
milvus::QueryResponse response;
auto status = client->Query(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.query({
    collection_name: "my_collection",
    filter: 'user like "ki%" AND user like "%y"',
    output_fields: ["id", "user"],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var res = await client.QueryAsync(new QueryReq
{
    CollectionName = "my_collection",
    Expression = "user like \"ki%\" AND user like \"%y\"",
    Parameters = new QueryParameters { OutputFields = { "id", "user" } }
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "my_collection",
      "filter": "user like \"ki%\" AND user like \"%y\"",
      "outputFields": ["id", "user"]
  }'
```

</TabItem>
</Tabs>

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html) にあります。Milvus の範囲演算子の詳細については、[範囲演算子](./basic-filtering-operators) を参照してください。

## ブールクエリ\{#boolean-query}

Elasticsearch では、ブールクエリは、他のクエリのブール組み合わせに一致するドキュメントを照合するクエリです。

次の例は、[このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html) にある Elasticsearch ドキュメントの例を基にしています。このクエリは、名前に `kimchy` を含み、`production` タグが付いたユーザーを返します。

```python
resp = client.search(
    query={
        "bool": {
            "filter": {
                "term": {
                    "user": "kimchy"
                }
            },
            "filter": {
                "term": {
                    "tags": "production"
                }
            }
        }
    },
)
```

Milvus では、次のようにして同様のことができます:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.query(
    collection_name="my_collection",
    filter='user like "%kimchy%" AND ARRAY_CONTAINS(tags, "production")',
    output_fields=["id", "user", "age", "tags"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.*;

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("user like \"%kimchy%\" AND ARRAY_CONTAINS(tags, \"production\")")
        .outputFields(Arrays.asList("id", "user", "age", "tags"))
        .build();
QueryResp queryResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/milvusclient"

client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("user like \"%kimchy%\" AND ARRAY_CONTAINS(tags, \"production\")").
    WithOutputFields("id", "user", "age", "tags"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("user like \"%kimchy%\" AND ARRAY_CONTAINS(tags, \"production\")")
            .output_fields(["id", "user", "age", "tags"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
    .WithCollectionName("my_collection")
    .WithFilter("user like \"%kimchy%\" AND ARRAY_CONTAINS(tags, \"production\")")
    .AddOutputField("id")
    .AddOutputField("user")
    .AddOutputField("age")
    .AddOutputField("tags")
;
milvus::QueryResponse response;
auto status = client->Query(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.query({
    collection_name: "my_collection",
    filter: 'user like "%kimchy%" AND ARRAY_CONTAINS(tags, "production")',
    output_fields: ["id", "user", "age", "tags"],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var res = await client.QueryAsync(new QueryReq
{
    CollectionName = "my_collection",
    Expression = "user like \"%kimchy%\" AND ARRAY_CONTAINS(tags, \"production\")",
    Parameters = new QueryParameters { OutputFields = { "id", "user", "age", "tags" } }
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "my_collection",
      "filter": "user like \"%kimchy%\" AND ARRAY_CONTAINS(tags, \"production\")",
      "outputFields": ["id", "user", "age", "tags"]
  }'
```

</TabItem>
</Tabs>

上記の例では、対象のコレクションに **VarChar** 型の `user` フィールドと **Array** 型の `tags` フィールドがあることを前提としています。このクエリは、名前に `kimchy` を含み、`production` タグが付いたユーザーを返します。

## ベクトルクエリ\{#vector-queries}

Elasticsearch では、ベクトルクエリはベクトルフィールドを操作してセマンティック検索を効率的に実行するための専用クエリです。

### kNN クエリ\{#knn-query}

Elasticsearch は、近似 kNN クエリと、正確な総当たり kNN クエリの両方をサポートしています。次のように、どちらの方法でも、類似度メトリクスで測定されたクエリベクトルに最も近い *k* 個のベクトルを検索できます:

```python
resp = client.search(
    index="my-image-index",
    size=3,
    query={
        "knn": {
            "field": "image-vector",
            "query_vector": [
                -5,
                9,
                -12
            ],
            "k": 10
        }
    },
)
```

Milvus は専用のベクトルデータベースとして、ベクトル検索を最適化するためにインデックスタイプを使用します。通常、高次元ベクトルデータには近似最近傍（ANN）検索を優先します。FLAT インデックスタイプを使用した総当たり kNN 検索は正確な結果を提供しますが、時間とリソースの両方が多くかかります。これに対し、AUTOINDEX やその他のインデックスタイプを使用した ANN 検索は速度と精度のバランスを取り、kNN よりも大幅に高速でリソース効率のよいパフォーマンスを提供します。インデックスタイプと AUTOINDEX の詳細については、[インデックス](./indexes) および [AUTOINDEX の説明](./autoindex-explained) を参照してください。

上記のベクトルクエリに類似する Milvus の同等機能は次のとおりです:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    anns_field="image_vector",
    data=[[-5, 9, -12]],
    limit=10
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.*;

SearchReq searchReq = SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(new float[]{-5, 9, -12})))
        .annsField("image_vector")
        .topK(10)
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

client.Search(ctx, milvusclient.NewSearchOption("my_collection", 10, []entity.Vector{entity.FloatVector{-5, 9, -12}}).
    WithANNSField("image_vector"))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .search(
        SearchRequest::builder()
            .collection_name("my_collection")
            .vector_field("image_vector")
            .vectors(SearchVectors::Float(vec![vec![-5.0, 9.0, -12.0]]))
            .limit(10)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::SearchRequest()
    .WithCollectionName("my_collection")
    .WithAnnsField("image_vector")
    .WithLimit(10)
    .AddFloatVector({-5, 9, -12});

milvus::SearchResponse response;
auto status = client->Search(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.search({
    collection_name: "my_collection",
    data: [[-5, 9, -12]],
    anns_field: "image_vector",
    limit: 10,
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var res = await client.SearchAsync(new SearchReq
{
    CollectionName = "my_collection",
    VectorFieldName = "image_vector",
    Vectors = new[] { new ReadOnlyMemory<float>(new[] { -5f, 9f, -12f }) },
    Limit = 10
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "my_collection",
      "data": [[-5, 9, -12]],
      "annsField": "image_vector",
      "limit": 10
  }'
```

</TabItem>
</Tabs>

Elasticsearch の例は [このページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-knn-query.html) にあります。Milvus の ANN 検索の詳細については、[基本的な ANN 検索](./single-vector-search) を参照してください。

### Reciprocal Rank Fusion\{#reciprocal-rank-fusion}

Elasticsearch は、異なる関連性指標を持つ複数の結果セットを 1 つのランク付けされた結果セットに統合するための Reciprocal Rank Fusion（RRF）を提供しています。

次の例は、従来のタームベース検索と k 近傍法（kNN）ベクトル検索を組み合わせて検索の関連性を高める方法を示しています:

```python
client.search(
    index="my_index",
    size=10,
    query={
        "retriever": {
            "rrf": {
                "retrievers": [
                    {
                        "standard": {
                            "query": {
                                "term": {
                                    "text": "shoes"
                                }
                            }
                        }
                    },
                    {
                        "knn": {
                            "field": "vector",
                            "query_vector": [1.25, 2, 3.5],  # Example vector; replace with your actual query vector
                            "k": 50,
                            "num_candidates": 100
                        }
                    }
                ],
                "rank_window_size": 50,
                "rank_constant": 20
            }
        }
    }
)
```

この例では、RRF が 2 つのレトリーバーの結果を統合します:

- `text` フィールドに `"shoes"` というタームを含むドキュメントに対する標準的なタームベース検索。

- 指定されたクエリベクトルを使用した `vector` フィールドに対する kNN 検索。

各レトリーバーは最大 50 件の上位一致を提供し、それらは RRF によって再ランク付けされ、最終的な上位 10 件の結果が返されます。

Milvus では、複数のベクトルフィールドにわたる検索を組み合わせ、再ランク付け戦略を適用し、統合されたリストから上位 K 件の結果を取得することで、同様のハイブリッド検索を実現できます。Milvus は RRF と重み付き再ランカー戦略の両方をサポートしています。詳細については、[重み付きランカー](./reranking-weighted-reranker) とその関連ページを参照してください。

以下は、上記の Elasticsearch の例に対する Milvus の厳密には同等ではない対応例です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import AnnSearchRequest, RRFRanker

search_params_dense = {
    "data": [[1.25, 2, 3.5]],
    "anns_field": "vector",
    "param": {"metric_type": "COSINE"},
    "limit": 100
}

req_dense = AnnSearchRequest(**search_params_dense)

search_params_sparse = {
    "data": ["shoes"],
    "anns_field": "text_sparse",
    "param": {"metric_type": "BM25"},
    "limit": 100
}

req_sparse = AnnSearchRequest(**search_params_sparse)

res = client.hybrid_search(
    collection_name="my_collection",
    reqs=[req_dense, req_sparse],
    ranker=RRFRanker(),
    limit=10
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.request.ranker.RRFRanker;
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.*;

List<AnnSearchReq> searchRequests = new ArrayList<>();
searchRequests.add(AnnSearchReq.builder()
        .vectors(Collections.singletonList(new FloatVec(new float[]{1.25f, 2.0f, 3.5f})))
        .vectorFieldName("vector")
        .topK(100)
        .build());
searchRequests.add(AnnSearchReq.builder()
        .vectors(Collections.singletonList(new EmbeddedText("shoes")))
        .vectorFieldName("text_sparse")
        .topK(100)
        .build());

HybridSearchReq hybridSearchReq = HybridSearchReq.builder()
        .collectionName("my_collection")
        .searchRequests(searchRequests)
        .ranker(new RRFRanker(60))
        .limit(10)
        .build();

SearchResp searchResp = client.hybridSearch(hybridSearchReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v3/entity"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

client.HybridSearch(ctx, milvusclient.NewHybridSearchOption(
    "my_collection",
    10,
    milvusclient.NewAnnRequest("vector", 100, entity.FloatVector{1.25, 2, 3.5}),
    milvusclient.NewAnnRequest("text_sparse", 100, entity.Text("shoes")),
).WithReranker(milvusclient.NewRRFReranker()))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let res = client
    .hybrid_search(
        HybridSearchRequest::builder()
            .collection_name("my_collection")
            .sub_requests(vec![
                SubSearchRequest::builder()
                    .vector_field("vector")
                    .vectors(SearchVectors::Float(vec![vec![1.25, 2.0, 3.5]]))
                    .limit(100)
                    .build()?,
                SubSearchRequest::builder()
                    .vector_field("text_sparse")
                    .vectors(SearchVectors::EmbeddedText(vec!["shoes".to_string()]))
                    .limit(100)
                    .build()?,
            ])
            .rerank(RRFRerank::new())
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::HybridSearchResponse response;
milvus::HybridSearchRequest request;
request.WithCollectionName("my_collection");
request.WithLimit(10);

auto dense_sub = std::make_shared<milvus::SubSearchRequest>();
dense_sub->WithAnnsField("vector").WithLimit(100);
dense_sub->AddFloatVector({1.25f, 2.0f, 3.5f});

auto sparse_sub = std::make_shared<milvus::SubSearchRequest>();
sparse_sub->WithAnnsField("text_sparse").WithLimit(100);
sparse_sub->AddEmbeddedText("shoes");

request.AddSubRequest(dense_sub);
request.AddSubRequest(sparse_sub);
request.WithRerank(std::make_shared<milvus::RRFRerank>(60));

auto status = client->HybridSearch(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, RRFRanker } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const res = await client.hybridSearch({
    collection_name: "my_collection",
    data: [
        { data: [[1.25, 2, 3.5]], anns_field: "vector", limit: 100 },
        { data: ["shoes"], anns_field: "text_sparse", limit: 100 },
    ],
    rerank: RRFRanker(),
    limit: 10,
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var reqDense = new AnnSearchReq
{
    VectorFieldName = "vector",
    Vectors = new[] { new ReadOnlyMemory<float>(new[] { 1.25f, 2f, 3.5f }) },
    MetricType = MetricType.Cosine,
    Limit = 100
};

var reqSparse = new AnnSearchReq
{
    VectorFieldName = "text_sparse",
    Texts = new[] { "shoes" },
    MetricType = MetricType.Bm25,
    Limit = 100
};

var res = await client.HybridSearchAsync(new HybridSearchReq
{
    CollectionName = "my_collection",
    SearchRequests = new[] { reqDense, reqSparse },
    Reranker = new RrfReranker(60),
    Limit = 10
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/hybrid_search" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "my_collection",
      "search": [
          { "data": [[1.25, 2, 3.5]], "annsField": "vector", "limit": 100 },
          { "data": ["shoes"], "annsField": "text_sparse", "limit": 100 }
      ],
      "rerank": { "strategy": "rrf" },
      "limit": 10
  }' 
```

</TabItem>
</Tabs>

この例は、次を組み合わせた Milvus のハイブリッド検索を示しています:

1. **密ベクトル検索**: `vector` フィールドに対する近似最近傍（ANN）検索に内積（IP）メトリクスを使用します。

1. **スパースベクトル検索**: `text_sparse` フィールドで BM25 類似度メトリクスを使用します。

これらの検索の結果は個別に実行され、統合された後、Reciprocal Rank Fusion（RRF）ランカーを使用して再ランク付けされます。ハイブリッド検索は、再ランク付けされたリストから上位 10 件のエンティティを返します。

標準的なテキストベースのクエリと kNN 検索の結果を統合する Elasticsearch の RRF ランキングとは異なり、Milvus はスパースベクトル検索と密ベクトル検索の結果を組み合わせ、マルチモーダルデータに最適化された独自のハイブリッド検索機能を提供します。

## まとめ\{#recap}

この記事では、タームレベルクエリ、ブールクエリ、全文クエリ、ベクトルクエリなど、一般的な Elasticsearch クエリを Milvus の同等機能に変換する方法について説明しました。他の Elasticsearch クエリの変換についてさらに質問がある場合は、お気軽にお問い合わせください。
