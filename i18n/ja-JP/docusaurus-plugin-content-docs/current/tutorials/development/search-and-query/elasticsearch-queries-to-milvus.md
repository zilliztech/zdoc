---
title: "Elasticsearch クエリから Milvus への変換 | Cloud"
slug: /elasticsearch-queries-to-milvus
sidebar_label: "Elasticsearch クエリから Milvus への変換"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Elasticsearch は Apache Lucene を基盤とする、代表的なオープンソースの検索エンジンです。しかし、モダンな AI アプリケーションでは、更新コストの高さ、リアルタイム性の低さ、非効率なシャード管理、クラウドネイティブではない設計、過剰なリソース要求など、さまざまな課題に直面しています。クラウドネイティブなベクトルデータベースである Milvus は、ストレージとコンピューティングの分離、高次元データ向けの効率的なインデックス作成、モダンなインフラストラクチャとのシームレスな統合によって、これらの課題を克服します。AI ワークロードに対して優れたパフォーマンスとスケーラビリティを提供します。 | Cloud"
type: origin
token: OFl9wHXpriM8aEkoONScpU1lnIf
sidebar_position: 17
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Elasticsearch クエリから Milvus への変換

Elasticsearch は Apache Lucene を基盤とする、代表的なオープンソースの検索エンジンです。しかし、モダンな AI アプリケーションでは、更新コストの高さ、リアルタイム性の低さ、非効率なシャード管理、クラウドネイティブではない設計、過剰なリソース要求など、さまざまな課題に直面します。クラウドネイティブなベクトルデータベースである Milvus は、ストレージとコンピューティングの分離、高次元データ向けの効率的なインデックス作成、モダンなインフラストラクチャとのシームレスな統合によって、これらの課題を克服します。AI ワークロードに対して優れたパフォーマンスとスケーラビリティを提供します。

この記事は、Elasticsearch から Milvus へのコードベースの移行を容易にすることを目的としており、両者間でクエリを変換するさまざまな例を提供します。

## 概要\{#overview}

Elasticsearch では、クエリコンテキストの操作は関連性スコアを生成しますが、フィルターコンテキストの操作は生成しません。同様に、Milvus の検索は類似度スコアを生成しますが、フィルターのようなクエリは生成しません。Elasticsearch から Milvus へコードベースを移行する際の重要な原則は、Elasticsearch のクエリコンテキストで使用されるフィールドをベクトルフィールドに変換し、類似度スコアを生成できるようにすることです。

次の表に、いくつかの Elasticsearch クエリパターンと、それに対応する Milvus の等価な機能を示します。

<table>
   <tr>
     <th><p>Elasticsearch クエリ</p></th>
     <th><p>Milvus の等価な機能</p></th>
     <th><p>備考</p></th>
   </tr>
   <tr>
     <td colspan="3"><p><strong>全文クエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#match-query">Match クエリ</a></p></td>
     <td><p>全文検索</p></td>
     <td><p>どちらも同様の機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>タームレベルクエリ</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#ids">ID</a></p></td>
     <td><p><code>in</code> 演算子</p></td>
     <td rowspan="6"><p>これらの Elasticsearch クエリをフィルターコンテキストで使用する場合、どちらも同一または同様の機能セットを提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#prefix-query">Prefix クエリ</a></p></td>
     <td><p><code>like</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#range-query">Range クエリ</a></p></td>
     <td><p><code>&gt;</code>、<code>&lt;</code>、<code>&gt;=</code>、<code>&lt;=</code> などの比較演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#term-query">Term クエリ</a></p></td>
     <td><p><code>==</code> などの比較演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#terms-query">Terms クエリ</a></p></td>
     <td><p><code>in</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#wildcard-query">Wildcard クエリ</a></p></td>
     <td><p><code>like</code> 演算子</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#boolean-query">Boolean クエリ</a></p></td>
     <td><p><code>AND</code> などの論理演算子</p></td>
     <td><p>フィルターコンテキストで使用する場合、どちらも同様の機能セットを提供します。</p></td>
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
     <td><p>Milvus は複数のリランキング戦略をサポートします。</p></td>
   </tr>
</table>

## 全文クエリ\{#full-text-queries}

Elasticsearch では、全文クエリを使用すると、メール本文など、解析済みのテキストフィールドを検索できます。クエリ文字列は、インデックス作成時にそのフィールドに適用されたものと同じアナライザーを使用して処理されます。

### Match クエリ\{#match-query}

Elasticsearch では、Match クエリは、指定されたテキスト、数値、日付、またはブール値に一致するドキュメントを返します。指定されたテキストは、マッチングの前に解析されます。

以下は、Match クエリを使用した Elasticsearch 検索リクエストの例です。

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

Milvus は、全文検索機能を通じて同じ機能を提供します。上記の Elasticsearch クエリは、次のようにして Milvus に変換できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
        .outputFields(Arrays.asList("id", "message"))
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
// Note: this feature is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
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

上記の例では、`message_sparse` は `message` という名前の VarChar フィールドから派生したスパースベクトルフィールドです。Milvus は BM25 埋め込みモデルを使用して、`message` フィールドの値をスパースベクトル埋め込みに変換し、`message_sparse` フィールドに格納します。検索リクエストを受信すると、Milvus は同じ BM25 モデルを使用してプレーンテキストのクエリペイロードを埋め込み、スパースベクトル検索を実行して、`output_fields` パラメーターで指定された `id` フィールドと `message` フィールドを、対応する類似度スコアとともに返します。

この機能を使用するには、`message` フィールドでアナライザーを有効にし、そこから `message_sparse` フィールドを派生させる関数を定義する必要があります。Milvus でアナライザーを有効にして派生関数を作成する詳細な手順については、[全文検索](./full-text-search) を参照してください。

## タームレベルクエリ\{#term-level-queries}

Elasticsearch では、タームレベルクエリは、日付範囲、IP アドレス、価格、製品 ID などの構造化データ内の正確な値に基づいてドキュメントを検索するために使用します。このセクションでは、一部の Elasticsearch タームレベルクエリに対応する Milvus の等価な機能について説明します。このセクションのすべての例は、Milvus の機能に合わせてフィルターコンテキスト内で動作するように調整されています。

### ID\{#ids}

Elasticsearch では、次のように、フィルターコンテキストで ID に基づいてドキュメントを検索できます。

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

Milvus では、次のように、ID に基づいてエンティティを検索することもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("id in [1, 4, 100]")
        .outputFields(Arrays.asList("id", "title"))
        .build();
QueryResp queryResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("id in [1, 4, 100]").
    WithOutputFields("id", "title"))
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("id in [1, 4, 100]")
            .output_fields(["id", "title"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
    .WithCollectionName("my_collection")
    .WithFilter("id in [1, 4, 100]")
    .AddOutputField("id")
    .AddOutputField("title")
;
milvus::QueryResponse response;
auto status = client->Query(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.query({
    collection_name: "my_collection",
    filter: 'id in [1, 4, 100]',
    output_fields: ["id", "title"],
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

Elasticsearch の例は、[こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-ids-query.html) にあります。Milvus のクエリおよび get リクエストとフィルター式の詳細については、[クエリ](./get-and-scalar-query) および [フィルタリングの説明](./filtering-overview) を参照してください。

### Prefix クエリ\{#prefix-query}

Elasticsearch では、次のように、フィルターコンテキストで、指定されたフィールドに特定のプレフィックスを含むドキュメントを検索できます。

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

Milvus では、次のように、値が指定されたプレフィックスで始まるエンティティを検索できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("user like \"ki%\"").
    WithOutputFields("id", "user"))
```

</TabItem>

<TabItem value='rust'>

```rust
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

Elasticsearch の例は、[こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html) にあります。Milvus の `like` 演算子の詳細については、[パターンマッチングで](./basic-filtering-operators)[`LIKE`](./basic-filtering-operators)[ を使用する方法](./basic-filtering-operators) を参照してください。

### Range クエリ\{#range-query}

Elasticsearch では、次のように、指定された範囲内の用語を含むドキュメントを検索できます。

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

Milvus では、次のように、特定のフィールドの値が指定された範囲内にあるエンティティを検索できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("10 <= age <= 20").
    WithOutputFields("id", "user", "age"))
```

</TabItem>

<TabItem value='rust'>

```rust
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

Elasticsearch の例は、[こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html) にあります。Milvus の比較演算子の詳細については、[比較演算子](./basic-filtering-operators#comparison-operators) を参照してください。

### Term クエリ\{#term-query}

Elasticsearch では、次のように、指定されたフィールドに**完全一致**する用語を含むドキュメントを検索できます。

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

Milvus では、次のように、指定されたフィールドの値が指定された用語と完全に一致するエンティティを検索できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("status==\"retired\"")
        .outputFields(Arrays.asList("id", "user", "status"))
        .build();
QueryResp queryResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("status==\"retired\"").
    WithOutputFields("id", "user", "status"))
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("status==\"retired\"")
            .output_fields(["id", "user", "status"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
    .WithCollectionName("my_collection")
    .WithFilter("status==\"retired\"")
    .AddOutputField("id")
    .AddOutputField("user")
    .AddOutputField("status")
;
milvus::QueryResponse response;
auto status = client->Query(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.query({
    collection_name: "my_collection",
    filter: 'status=="retired"',
    output_fields: ["id", "user", "status"],
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
      "filter": "status==\"retired\"",
      "outputFields": ["id", "user", "status"]
  }'
```

</TabItem>
</Tabs>

Elasticsearch の例は、[こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html) にあります。Milvus の比較演算子の詳細については、[比較演算子](./basic-filtering-operators#comparison-operators) を参照してください。

### Terms クエリ\{#terms-query}

Elasticsearch では、次のように、指定されたフィールドに 1 つ以上の**完全一致**する用語を含むドキュメントを検索できます。

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

Milvus には、これに完全に相当する機能はありません。ただし、次のように、指定されたフィールドの値が指定された用語のいずれかであるエンティティを検索できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

QueryReq queryReq = QueryReq.builder()
        .collectionName("my_collection")
        .filter("degree in [\"graduate\", \"post-graduate\"]")
        .outputFields(Arrays.asList("id", "user", "degree"))
        .build();
QueryResp queryResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("degree in [\"graduate\", \"post-graduate\"]").
    WithOutputFields("id", "user", "degree"))
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .query(
        QueryRequest::builder()
            .collection_name("my_collection")
            .filter("degree in [\"graduate\", \"post-graduate\"]")
            .output_fields(["id", "user", "degree"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto request = milvus::QueryRequest()
    .WithCollectionName("my_collection")
    .WithFilter("degree in [\"graduate\", \"post-graduate\"]")
    .AddOutputField("id")
    .AddOutputField("user")
    .AddOutputField("degree")
;
milvus::QueryResponse response;
auto status = client->Query(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.query({
    collection_name: "my_collection",
    filter: 'degree in ["graduate", "post-graduate"]',
    output_fields: ["id", "user", "degree"],
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
      "filter": "degree in [\"graduate\", \"post-graduate\"]",
      "outputFields": ["id", "user", "degree"]
  }'
```

</TabItem>
</Tabs>

Elasticsearch の例は、[こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html) にあります。Milvus の範囲演算子の詳細については、[範囲演算子](./basic-filtering-operators) を参照してください。

### Wildcard クエリ\{#wildcard-query}

Elasticsearch では、次のように、ワイルドカードパターンに一致する用語を含むドキュメントを検索できます。

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

Milvus はフィルター条件でワイルドカードをサポートしていません。ただし、次のように、`like` 演算子を使用して同様の効果を得ることができます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("user like \"ki%\" AND user like \"%y\"").
    WithOutputFields("id", "user"))
```

</TabItem>

<TabItem value='rust'>

```rust
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

Elasticsearch の例は、[こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html) にあります。Milvus の範囲演算子の詳細については、[範囲演算子](./basic-filtering-operators) を参照してください。

## Boolean クエリ\{#boolean-query}

Elasticsearch では、Boolean クエリは、他のクエリのブール組み合わせに一致するドキュメントにマッチするクエリです。

次の例は、[こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html) にある Elasticsearch ドキュメントの例を基にしています。このクエリは、名前に `kimchy` を含み、`production` タグを持つユーザーを返します。

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

Milvus では、次のように同様のことができます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
client.Query(ctx, milvusclient.NewQueryOption("my_collection").
    WithFilter("user like \"%kimchy%\" AND ARRAY_CONTAINS(tags, \"production\")").
    WithOutputFields("id", "user", "age", "tags"))
```

</TabItem>

<TabItem value='rust'>

```rust
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

上記の例は、対象のコレクションに **VarChar** 型の `user` フィールドと **Array** 型の `tags` フィールドがあることを前提としています。このクエリは、名前に `kimchy` を含み、`production` タグを持つユーザーを返します。

## ベクトルクエリ\{#vector-queries}

Elasticsearch では、ベクトルクエリは、ベクトルフィールドを操作してセマンティック検索を効率的に実行するための特殊なクエリです。

### kNN クエリ\{#knn-query}

Elasticsearch は、近似 kNN クエリと、正確なブルートフォース kNN クエリの両方をサポートしています。次のように、どちらの方法でも、類似度メトリクスで測定された、クエリベクトルに最も近い *k* 個のベクトルを見つけることができます。

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

専用のベクトルデータベースである Milvus は、インデックスタイプを使用してベクトル検索を最適化します。通常、高次元ベクトルデータには近似最近傍（ANN）検索を優先します。FLAT インデックスタイプを使用したブルートフォース kNN 検索は正確な結果を返しますが、時間とリソースの両方を消費します。これに対し、AUTOINDEX やその他のインデックスタイプを使用した ANN 検索は、速度と精度のバランスを取り、kNN よりも大幅に高速でリソース効率の高いパフォーマンスを提供します。インデックスタイプと AUTOINDEX の詳細については、[インデックス](./indexes) および [AUTOINDEX の説明](./autoindex-explained) を参照してください。

上記のベクトルクエリに相当する Milvus の同様の例は、次のとおりです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    anns_field="image-vector",
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
        .annsField("image-vector")
        .topK(10)
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
// Note: this feature is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
client
    .search(
        SearchRequest::builder()
            .collection_name("my_collection")
            .vector_field("image-vector")
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
    .WithAnnsField("image-vector")
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
    anns_field: "image-vector",
    limit: 10,
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
      "annsField": "image-vector",
      "limit": 10
  }'
```

</TabItem>
</Tabs>

Elasticsearch の例は、[こちらのページ](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-knn-query.html) にあります。Milvus の ANN 検索の詳細については、[基本的な ANN 検索](./single-vector-search) を参照してください。

### Reciprocal Rank Fusion\{#reciprocal-rank-fusion}

Elasticsearch は、Reciprocal Rank Fusion（RRF）を提供し、異なる関連性指標を持つ複数の結果セットを 1 つのランク付けされた結果セットに統合します。

次の例は、検索の関連性を向上させるために、従来のタームベースの検索と k 最近傍（kNN）ベクトル検索を組み合わせる方法を示しています。

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

この例では、RRF は 2 つのレトリーバーの結果を統合します。

- `text` フィールドに `"shoes"` という用語を含むドキュメントに対する標準的なタームベース検索。

- 指定されたクエリベクトルを使用した、`vector` フィールドに対する kNN 検索。

各レトリーバーは最大 50 件の上位一致を提供し、それらは RRF によって再ランク付けされ、最終的な上位 10 件の結果が返されます。

Milvus では、複数のベクトルフィールドにわたる検索を組み合わせ、リランキング戦略を適用し、統合されたリストから上位 K 件の結果を取得することで、同様のハイブリッド検索を実現できます。Milvus は RRF と重み付きリランカーの両方の戦略をサポートしています。詳細については、[Weighted Ranker](./reranking-weighted-reranker) とその関連ページを参照してください。

以下は、上記の Elasticsearch の例に相当する、Milvus における厳密ではない等価な実装です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
// See the hybrid search guide for the milvus-sdk-go equivalent.
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

この例では、次を組み合わせた Milvus のハイブリッド検索を示します。

1. **密ベクトル検索**: `vector` フィールドに対する近似最近傍（ANN）検索に内積（IP）メトリクスを使用します。

1. **スパースベクトル検索**: `text_sparse` フィールドに BM25 類似度メトリクスを使用します。

これらの検索の結果は個別に実行され、統合され、Reciprocal Rank Fusion（RRF）ランカーを使用して再ランク付けされます。ハイブリッド検索は、再ランク付けされたリストから上位 10 件のエンティティを返します。

標準的なテキストベースのクエリと kNN 検索の結果を統合する Elasticsearch の RRF ランキングとは異なり、Milvus はスパースベクトル検索と密ベクトル検索の結果を組み合わせ、マルチモーダルデータに最適化された独自のハイブリッド検索機能を提供します。

## まとめ\{#recap}

この記事では、タームレベルクエリ、Boolean クエリ、全文クエリ、ベクトルクエリなど、代表的な Elasticsearch クエリを Milvus の等価な機能に変換する方法について説明しました。他の Elasticsearch クエリの変換についてさらに質問がある場合は、お気軽にお問い合わせください。
