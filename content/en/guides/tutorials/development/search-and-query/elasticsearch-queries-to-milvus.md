---
title: "Elasticsearch Queries to Milvus | Cloud"
slug: /elasticsearch-queries-to-milvus
sidebar_label: "Elasticsearch Queries to Milvus"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Elasticsearch, built on Apache Lucene, is a leading open-source search engine. However, it faces challenges in modern AI applications, including high update costs, poor real-time performance, inefficient shard management, a non-cloud-native design, and excessive resource demands. As a cloud-native vector database, Milvus overcomes these issues with decoupled storage and computing, efficient indexing for high-dimensional data, and seamless integration with modern infrastructures. It offers superior performance and scalability for AI workloads. | Cloud"
type: origin
token: OFl9wHXpriM8aEkoONScpU1lnIf
sidebar_position: 17
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Elasticsearch Queries to Milvus

Elasticsearch, built on Apache Lucene, is a leading open-source search engine. However, it faces challenges in modern AI applications, including high update costs, poor real-time performance, inefficient shard management, a non-cloud-native design, and excessive resource demands. As a cloud-native vector database, Milvus overcomes these issues with decoupled storage and computing, efficient indexing for high-dimensional data, and seamless integration with modern infrastructures. It offers superior performance and scalability for AI workloads.

This article aims to facilitate the migration of your code base from Elasticsearch to Milvus, providing various examples of converting queries in between.

## Overview\{#overview}

In Elasticsearch, operations in the query context generate relevance scores, while those in the filter context do not. Similarly, Milvus searches produce similarity scores, whereas its filter-like queries do not. When migrating your code base from Elasticsearch to Milvus, the key principle is converting fields used in Elasticsearch's query context into vector fields to enable similarity score generation. 

The table below outlines some Elasticsearch query patterns and their corresponding equivalents in Milvus.

<table>
   <tr>
     <th><p>Elasticsearch Queries</p></th>
     <th><p>Milvus Equivalents</p></th>
     <th><p>Remarks</p></th>
   </tr>
   <tr>
     <td colspan="3"><p><strong>Full-text queries</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#match-query">Match query</a></p></td>
     <td><p>Full-text search</p></td>
     <td><p>Both provide similar sets of capabilities.</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>Term-level queries</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#ids">IDs</a></p></td>
     <td><p><code>in</code> operator</p></td>
     <td rowspan="6"><p>Both provide the same or similar set of capabilities when these Elasticsearch queries are used in the filter context.</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#prefix-query">Prefix query</a></p></td>
     <td><p><code>like</code> operator</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#range-query">Range query</a></p></td>
     <td><p>Comparison operators like <code>&gt;</code>, <code>&lt;</code>, <code>&gt;=</code>, and <code>&lt;=</code></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#term-query">Term query</a></p></td>
     <td><p>Comparison operators like <code>==</code></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#terms-query">Terms query</a></p></td>
     <td><p><code>in</code> operator</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#wildcard-query">Wildcard query</a></p></td>
     <td><p><code>like</code> operator</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#boolean-query">Boolean query</a></p></td>
     <td><p>Logical operators like <code>AND</code></p></td>
     <td><p>Both provide similar sets of capabilities when used in the filter context.</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>Vector queries</strong></p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#knn-query">kNN query</a></p></td>
     <td><p>Search</p></td>
     <td><p>Milvus provides more advanced vector search capabilities.</p></td>
   </tr>
   <tr>
     <td><p><a href="./elasticsearch-queries-to-milvus#reciprocal-rank-fusion">Reciprocal rank fusion</a></p></td>
     <td><p>Hybrid Search</p></td>
     <td><p>Milvus supports multiple reranking strategies.</p></td>
   </tr>
</table>

## Full-text queries\{#full-text-queries}

In Elasticsearch, the full text queries enable you to search analyzed text fields such as the body of an email. The query string is processed using the same analyzer that was applied to the field during indexing.

### Match query\{#match-query}

In Elasticsearch, a match query returns documents that match a provided text, number, date, or boolean value. The provided text is analyzed before matching. 

The following is an example Elasticsearch search request with a match query.

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

Milvus provides the same capability through the full-text search feature. You can convert the above Elasticsearch query into Milvus as follows:

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

In the example above, `message_sparse` is a sparse vector field derived from a VarChar field named `message`. Milvus uses the BM25 embedding model to convert the values in the `message` field into sparse vector embeddings and stores them in the `message_sparse` field. Upon receiving the search request, Milvus embeds the plain text query payload using the same BM25 model and performs a sparse vector search and returns the `id` and `message` fields specified in the `output_fields` parameter along with the corresponding similarity scores.

To use this functionality, you must enable the analyzer on the `message` field and define a function to derive the `message_sparse` field from it. For detailed instructions on enabling the analyzer and creating the derivative function in Milvus, refer to [Full Text Search](./full-text-search).

## Term-level queries\{#term-level-queries}

In Elasticsearch, term-level queries are used to find documents based on exact values in structured data, such as date ranges, IP addresses, prices, or product IDs. This section outlines the possible equivalents of some Elasticsearch term-level queries in Milvus. All examples in this section are adapted to operate within the filter context to align with Milvus's capabilities.

### IDs\{#ids}

In Elasticsearch, you can find documents based on their IDs in the filter context as follows:

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

In Milvus, you can also find entities based on their IDs as follows:

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

You can find the Elasticsearch example on [this page](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-ids-query.html). For details on query and get requests as well as the filter expressions in Milvus, refer to [Query](./get-and-scalar-query) and [Filtering Explained](./filtering-overview).

### Prefix query\{#prefix-query}

In Elasticsearch, you can find documents that contain a specific prefix in a provided field in the filter context as follows:

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

In Milvus, you can find the entities whose values start with the specified prefix as follows:

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

You can find the Elasticsearch example on [this page](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-prefix-query.html). For details on the `like` operator in Milvus, refer to [Using ](./basic-filtering-operators)[`LIKE`](./basic-filtering-operators)[ for Pattern Matching](./basic-filtering-operators).

### Range query\{#range-query}

In Elasticsearch, you can find documents that contain terms within a provided range as follows:

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

In Milvus, you can find the entities whose values in a specific field are within a provided range as follows:

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

You can find the Elasticsearch example on [this page](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-range-query.html). For details on comparison operators in Milvus, see [Comparison operators](./basic-filtering-operators#comparison-operators).

### Term query\{#term-query}

In Elasticsearch, you can find documents that contain an **exact** term in a provided field as follows:

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

In Milvus, you can find the entities whose values in the specified field are exactly the specified term as follows:

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

You can find the Elasticsearch example on [this page](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-term-query.html). For details on comparison operators in Milvus, see [Comparison operators](./basic-filtering-operators#comparison-operators).

### Terms query\{#terms-query}

In Elasticsearch, you can find documents that contain one or more **exact** terms in a provided field as follows:

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

Milvus does not have a complete equivalence of this one. However, you can find the entities whose values in the specified field are one of the specified terms as follows:

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

You can find the Elasticsearch example on [this page](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-terms-query.html). For details on range operators in Milvus, refer to [Range operators](./basic-filtering-operators).

### Wildcard query\{#wildcard-query}

In Elasticsearch, you can find documents that contain terms matching a wildcard pattern as follows:

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

Milvus does not support wildcard in its filtering conditions. However, you can use the `like` operator to achieve the similar effect as follows:

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

You can find the Elasticsearch example on [this page](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-wildcard-query.html). For details on the range operators in Milvus, refer to [Range operators](./basic-filtering-operators). 

## Boolean query\{#boolean-query}

In Elasticsearch, a boolean query is a query that matches documents matching boolean combinations of other queries. 

The following example is adapted from an example in Elasticsearch documentation on [this page](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-bool-query.html). The query will return users with `kimchy` in their names with a `production` tag.

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

In Milvus, you can do the similar thing as follows:

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

The above example assumes that you have a `user` field of the **VarChar** type and a `tags` field of the **Array** type, in the target collection. The query will return users with `kimchy` in their names with a `production` tag.

## Vector queries\{#vector-queries}

In Elasticsearch, vector queries are specialized queries that work on vector fields to efficiently perform semantic search.

### Knn query\{#knn-query}

Elasticsearch supports both approximate kNN queries and exact, brute-force kNN queries. You can find the *k* nearest vectors to a query vector in either way, as measured by a similarity metric, as follows:

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

Milvus, as a specialized vector database, uses index types to optimize vector searches. Typically, it prioritizes approximate nearest neighbor (ANN) search for high-dimensional vector data. While brute-force kNN search with the FLAT index type delivers precise results, it is both time-consuming and resource-intensive. In contrast, ANN search using AUTOINDEX or other index types balances speed and accuracy, offering significantly faster and more resource-efficient performance than kNN. For details on index types and AUTOINDEX, you can read [Indexes](./indexes) and [AUTOINDEX Explained](./autoindex-explained).

A similar equivalence to the above vector query in Mlivus goes like this:

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

You can find the Elasticsearch example on [this page](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-knn-query.html). For details on ANN searches in Milvus, read [Basic ANN Search](./single-vector-search).

### Reciprocal Rank Fusion\{#reciprocal-rank-fusion}

Elasticsearch provides Reciprocal Rank Fusion (RRF) to combine multiple result sets with different relevance indicators into a single ranked result set.

The following example demonstrates combining a traditional term-based search with a k-nearest neighbors (kNN) vector search to improve search relevance:

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

In this example, RRF combines results from two retrievers:

- A standard term-based search for documents containing the term `"shoes"` in the `text` field.

- A kNN search on the `vector` field using the provided query vector.

Each retriever contributes up to 50 top matches, which are reranked by RRF, and the final top 10 results are returned.

In Milvus, you can achieve a similar hybrid search by combining searches across multiple vector fields, applying a reranking strategy, and retrieving the top-K results from the combined list. Milvus supports both RRF and weighted reranker strategies. For more details, refer to [Weighted Ranker](./reranking-weighted-reranker) and its sibling pages.

The following is a non-strict equivalence of the above Elasticsearch example in Milvus.

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

This example demonstrates a hybrid search in Milvus that combines:

1. **Dense vector search**: Using the inner product (IP) metric for approximate nearest neighbor (ANN) search on the `vector` field.

1. **Sparse vector search**: Using the BM25 similarity metric on the `text_sparse` field.

The results from these searches are executed separately, combined, and reranked using the Reciprocal Rank Fusion (RRF) ranker. The hybrid search returns the top 10 entities from the reranked list.

Unlike Elasticsearch's RRF ranking, which merges results from standard text-based queries and kNN searches, Milvus combines results from sparse and dense vector searches, providing a unique hybrid search capability optimized for multimodal data.

## Recap\{#recap}

In this article, we covered the conversions of typical Elasticsearch queries to their Milvus equivalents, including term-level queries, boolean queries, full-text queries, and vector queries. If you have further questions about converting other Elasticsearch queries, feel free to reach out to us.