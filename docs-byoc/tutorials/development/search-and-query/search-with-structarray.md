---
title: "Search with StructArray | BYOC"
slug: /search-with-structarray
sidebar_label: "Search with StructArray"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Use this page when you already have a collection that contains a StructArray field and want to search the vector sub-fields inside each Struct element. | BYOC"
type: origin
token: DGCFwPHDqijeJJklqTScLwUunrh
sidebar_position: 16
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Search with StructArray

Use this page when you already have a collection that contains a StructArray field and want to search the vector sub-fields inside each Struct element.

## Overview\{#overview}

StructArray vector search has two modes:

<table>
   <tr>
     <th><p>Mode</p></th>
     <th><p>Metric family</p></th>
     <th><p>Query data</p></th>
     <th><p>Result granularity</p></th>
   </tr>
   <tr>
     <td><p>Embedding List search</p></td>
     <td><p><code>MAX_SIM</code>, <code>MAX_SIM_COSINE</code>, <code>MAX_SIM_IP</code>, <code>MAX_SIM_L2</code>, <code>MAX_SIM_HAMMING</code>, <code>MAX_SIM_JACCARD</code></p></td>
     <td><p>An embedding list, such as <code>EmbeddingList</code> in PyMilvus.</p><p><code>MAX_SIM</code> is equivalent to <code>MAX_SIM_COSINE</code>.</p></td>
     <td><p>One result per entity</p></td>
   </tr>
   <tr>
     <td><p>Element-level search</p></td>
     <td><p>Regular vector metrics, such as <code>COSINE</code>, <code>L2</code>, or <code>IP</code></p></td>
     <td><p>A single query vector</p></td>
     <td><p>One result per matching Struct element</p></td>
   </tr>
</table>

Use Embedding List search when you want Milvus to treat the StructArray vector sub-field as an embedding list and score each entity with a `MAX_SIM*` metric. The query is an EmbeddingList, which can contain one or more vectors.

Use element-level search when each Struct element should participate in vector search independently. Element-level search can return multiple hits from the same entity. Each hit includes an `offset` that identifies the position of the matched Struct element in the array.

## Prerequisites\{#prerequisites}

- A collection that contains a StructArray field, such as `chunks`.

    For schema design and insertion examples, see [StructArray](./use-array-of-structs).

- A vector sub-field inside the StructArray field, such as `chunks[text_vector]`.

- An index on the vector sub-field.

- Inserted data.

## Configure Indexes\{#configure-indexes}

Create different vector sub-fields if you need both the Embedding List search and the element-level search. The metric type determines the search mode, and the two modes cannot be mixed on the same indexed vector sub-field.

```plaintext
index_params = client.prepare_index_params()

# Embedding List search: query data is an EmbeddingList.
index_params.add_index(
    field_name="chunks[chunk_vector]",
    index_type="HNSW",
    metric_type="MAX_SIM_COSINE",
    index_name="chunk_vector_max_sim",
    params={"M": 16, "efConstruction": 200},
)

# Element-level search: query data is a regular vector.
index_params.add_index(
    field_name="chunks[element_vector]",
    index_type="HNSW",
    metric_type="COSINE",
    index_name="element_vector_cosine",
    params={"M": 16, "efConstruction": 200},
)

client.create_index(
    collection_name="my_collection",
    index_params=index_params,
)
```

<Tabs groupId="code" defaultValue='java' values={[{"label":"Java","value":"java"}]}>
<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;

Map<String, Object> hnswParams = new HashMap<>();
hnswParams.put("M", 16);
hnswParams.put("efConstruction", 200);

List<IndexParam> indexParams = new ArrayList<>();

// Embedding List search: query data is an EmbeddingList.
indexParams.add(IndexParam.builder()
        .fieldName("chunks[chunk_vector]")
        .indexType(IndexParam.IndexType.HNSW)
        .metricType(IndexParam.MetricType.MAX_SIM_COSINE)
        .indexName("chunk_vector_max_sim")
        .extraParams(hnswParams)
        .build());

// Element-level search: query data is a regular vector.
indexParams.add(IndexParam.builder()
        .fieldName("chunks[element_vector]")
        .indexType(IndexParam.IndexType.HNSW)
        .metricType(IndexParam.MetricType.COSINE)
        .indexName("element_vector_cosine")
        .extraParams(hnswParams)
        .build());

client.createIndex(CreateIndexReq.builder()
        .collectionName("my_collection")
        .indexParams(indexParams)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

chunkVectorIndex := index.NewHNSWIndex(entity.MaxSimCosine, 16, 200)
elementVectorIndex := index.NewHNSWIndex(entity.COSINE, 16, 200)

indexOptions := []milvusclient.CreateIndexOption{
    milvusclient.NewCreateIndexOption(
        "my_collection",
        "chunks[chunk_vector]",
        chunkVectorIndex,
    ).WithIndexName("chunk_vector_max_sim"),
    milvusclient.NewCreateIndexOption(
        "my_collection",
        "chunks[element_vector]",
        elementVectorIndex,
    ).WithIndexName("element_vector_cosine"),
}

for _, opt := range indexOptions {
    task, err := client.CreateIndex(ctx, opt)
    if err != nil {
        // handle error
    }
    err = task.Await(ctx)
    if err != nil {
        // handle error
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await milvusClient.createIndex([
  {
    collection_name: "my_collection",
    field_name: "chunks[chunk_vector]",
    index_name: "chunk_vector_max_sim",
    index_type: "HNSW",
    metric_type: "MAX_SIM_COSINE",
    params: { M: 16, efConstruction: 200 },
  },
  {
    collection_name: "my_collection",
    field_name: "chunks[element_vector]",
    index_name: "element_vector_cosine",
    index_type: "HNSW",
    metric_type: "COSINE",
    params: { M: 16, efConstruction: 200 },
  },
]);
```

</TabItem>

<TabItem value='bash'>

```bash
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/indexes/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "collectionName": "my_collection",
    "indexParams": [
      {
        "fieldName": "chunks[chunk_vector]",
        "indexName": "chunk_vector_max_sim",
        "indexType": "HNSW",
        "metricType": "MAX_SIM_COSINE",
        "params": { "M": 16, "efConstruction": 200 }
      },
      {
        "fieldName": "chunks[element_vector]",
        "indexName": "element_vector_cosine",
        "indexType": "HNSW",
        "metricType": "COSINE",
        "params": { "M": 16, "efConstruction": 200 }
      }
    ]
  }'
```

</TabItem>
</Tabs>

```shell
INDEX_PARAMS='[
  {
    "fieldName": "chunks[chunk_vector]",
    "indexName": "chunk_vector_max_sim",
    "indexType": "HNSW",
    "metricType": "MAX_SIM_COSINE",
    "params": { "M": 16, "efConstruction": 200 }
  },
  {
    "fieldName": "chunks[element_vector]",
    "indexName": "element_vector_cosine",
    "indexType": "HNSW",
    "metricType": "COSINE",
    "params": { "M": 16, "efConstruction": 200 }
  }
]'

zilliz index create \
  --collection my_collection \
  --body "{\"indexParams\": $INDEX_PARAMS}"
```

When `AUTOINDEX` is used with a StructArray field and no metric is specified, Milvus maps the default vector metric to the corresponding Embedding List metric for that field.  For an EmbeddingList search, `MAX_SIM` applies by default, whereas COSINE applies to element-level searches. `MAX_SIM` is the equivalent of `MAX_SIM_COSINE`.

You can also create scalar indexes on StructArray sub-fields, such as `chunks[text]`, to support scalar filtering:

```plaintext
index_params.add_index(
    field_name="chunks[text]",
    index_type="INVERTED",
    index_name="chunks_text_inverted",
)
```

<Tabs groupId="code" defaultValue='java' values={[{"label":"Java","value":"java"}]}>
<TabItem value='java'>

```java
indexParams.add(IndexParam.builder()
        .fieldName("chunks[text]")
        .indexType(IndexParam.IndexType.INVERTED)
        .indexName("chunks_text_inverted")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
scalarIndex := index.NewInvertedIndex()

task, err := client.CreateIndex(ctx,
    milvusclient.NewCreateIndexOption(
        "my_collection",
        "chunks[text]",
        scalarIndex,
    ).WithIndexName("chunks_text_inverted"),
)
if err != nil {
    // handle error
}
err = task.Await(ctx)
if err != nil {
    // handle error
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await milvusClient.createIndex({
  collection_name: "my_collection",
  field_name: "chunks[text]",
  index_name: "chunks_text_inverted",
  index_type: "INVERTED",
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/indexes/create" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "collectionName": "my_collection",
    "indexParams": [
      {
        "fieldName": "chunks[text]",
        "indexName": "chunks_text_inverted",
        "indexType": "INVERTED"
      }
    ]
  }'
```

</TabItem>
</Tabs>

```shell
SCALAR_INDEX_PARAMS='[
  {
    "fieldName": "chunks[text]",
    "indexName": "chunks_text_inverted",
    "indexType": "INVERTED"
  }
]'

zilliz index create \
  --collection my_collection \
  --body "{\"indexParams\": $SCALAR_INDEX_PARAMS}"
```

## Embedding List Search\{#embedding-list-search}

In an Embedding List search, one query can contain multiple embeddings. Milvus compares the query embedding list with the embedding list stored in each entity's StructArray vector sub-field.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Shell","value":"shell"}]}>
<TabItem value='python'>

```python
from pymilvus.client.embedding_list import EmbeddingList

query = EmbeddingList()
query.add([0.2, 0.9, 0.4, -0.3, 0.2])
query.add([-0.4, 0.3, 0.5, 0.8, 0.2])

results = client.search(
    collection_name="my_collection",
    data=[query],
    anns_field="chunks[chunk_vector]",
    limit=10,
    output_fields=["chunks[text]", "chunks[score]"],
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.data.EmbeddingList;
import io.milvus.v2.service.vector.request.data.FloatVec;

EmbeddingList query = new EmbeddingList();
query.add(new FloatVec(new float[]{0.2f, 0.9f, 0.4f, -0.3f, 0.2f}));
query.add(new FloatVec(new float[]{-0.4f, 0.3f, 0.5f, 0.8f, 0.2f}));

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(query))
        .annsField("chunks[chunk_vector]")
        .limit(10)
        .outputFields(Arrays.asList("chunks[text]", "chunks[score]"))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const query = [
  [0.2, 0.9, 0.4, -0.3, 0.2],
  [-0.4, 0.3, 0.5, 0.8, 0.2],
];

const results = await milvusClient.search({
  collection_name: "my_collection",
  data: query,
  anns_field: "chunks[chunk_vector]",
  limit: 10,
  output_fields: ["chunks[text]", "chunks[score]"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
QUERY='[[0.2,0.9,0.4,-0.3,0.2],[-0.4,0.3,0.5,0.8,0.2]]'

curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{
    \"collectionName\": \"my_collection\",
    \"data\": [$QUERY],
    \"annsField\": \"chunks[chunk_vector]\",
    \"searchParams\": {\"metric_type\": \"MAX_SIM_COSINE\"},
    \"limit\": 10,
    \"outputFields\": [\"chunks[text]\", \"chunks[score]\"]
  }"
```

</TabItem>
</Tabs>

```shell
QUERY='[[0.2,0.9,0.4,-0.3,0.2],[-0.4,0.3,0.5,0.8,0.2]]'

zilliz vector search \
  --collection my_collection \
  --data "[$QUERY]" \
  --anns-field "chunks[chunk_vector]" \
  --limit 10 \
  --output-fields '["chunks[text]", "chunks[score]"]'
```

In PyMilvus,  `EmbeddingList` also supports chained calls and batch insertion:

```python
query = EmbeddingList() \
    .add([0.2, 0.9, 0.4, -0.3, 0.2]) \
    .add([-0.4, 0.3, 0.5, 0.8, 0.2]) \
    .add([0.7, 0.4, 0.2, 0.7, 0.8])

batch_query = EmbeddingList()
batch_query.add_batch([
    [0.2, 0.9, 0.4, -0.3, 0.2],
    [-0.4, 0.3, 0.5, 0.8, 0.2],
    [0.7, 0.4, 0.2, 0.7, 0.8],
])
```

For non-float query vectors, explicitly set the matching `EmbeddingList` dtype when you create the query. For example, use `dtype=DataType.BINARY_VECTOR` for binary vectors and add packed bytes; each binary vector must contain `dim / 8` bytes. This rule does not apply to query vectors in RESTful and Zilliz CLI search requests because they use nested arrays to represent query vectors rather than creating an EmbeddingList object. 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType
from pymilvus.client.embedding_list import EmbeddingList

binary_query = EmbeddingList(dtype=DataType.BINARY_VECTOR)
binary_query.add(bytes([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]))
```

</TabItem>

<TabItem value='javascript'>

```javascript
const binaryQuery = [
  new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]),
  new Uint8Array([8, 9, 10, 11, 12, 13, 14, 15]),
];
```

</TabItem>
</Tabs>

## Element-Level Search\{#element-level-search}

Element-level search uses a regular vector metric, such as `COSINE`, `L2`, or `IP`. Each Struct element is searched independently.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Shell","value":"shell"}]}>
<TabItem value='python'>

```python
from pymilvus.client.embedding_list import EmbeddingList

query_vector = [0.3, 0.2, 0.3, 0.2, 0.5]

results = client.search(
    collection_name="my_collection",
    data=[query_vector],
    anns_field="chunks[element_vector]",
    limit=10,
    filter="",
    output_fields=["chunks[text]", "chunks[score]"],
)

for hits in results:
    for hit in hits:
        print(hit["id"], hit["distance"], hit.get("offset"), hit["entity"])
```

</TabItem>

<TabItem value='java'>

```java
List<Float> queryVector = Arrays.asList(0.3f, 0.2f, 0.3f, 0.2f, 0.5f);

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(queryVector)))
        .annsField("chunks[element_vector]")
        .limit(10)
        .filter("")
        .outputFields(Arrays.asList("chunks[text]", "chunks[score]"))
        .build());

for (List<SearchResp.SearchResult> hits : searchResp.getSearchResults()) {
    for (SearchResp.SearchResult hit : hits) {
        System.out.println(hit);
    }
}
```

</TabItem>

<TabItem value='go'>

```go
import "fmt"

queryVector := entity.FloatVector{0.3, 0.2, 0.3, 0.2, 0.5}

results, err := client.Search(ctx,
    milvusclient.NewSearchOption(
        "my_collection",
        10,
        []entity.Vector{queryVector},
    ).
        WithANNSField("chunks[element_vector]").
        WithFilter("").
        WithOutputFields("chunks[text]", "chunks[score]"),
)
if err != nil {
    // handle error
}
fmt.Println(results)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const queryVector = [0.3, 0.2, 0.3, 0.2, 0.5];

const results = await milvusClient.search({
  collection_name: "my_collection",
  data: [queryVector],
  anns_field: "chunks[element_vector]",
  limit: 10,
  filter: "",
  output_fields: ["chunks[text]", "chunks[score]"],
});

console.log(results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "collectionName": "my_collection",
    "data": [[0.3, 0.2, 0.3, 0.2, 0.5]],
    "annsField": "chunks[element_vector]",
    "limit": 10,
    "filter": "",
    "outputFields": ["chunks[text]", "chunks[score]"]
  }'
```

</TabItem>
</Tabs>

```shell
zilliz vector search \
  --collection my_collection \
  --data '[[0.3, 0.2, 0.3, 0.2, 0.5]]' \
  --anns-field "chunks[element_vector]" \
  --limit 10 \
  --filter "" \
  --output-fields '["chunks[text]", "chunks[score]"]'
```

In element-level search, `offset` is the zero-based position of the matched Struct element within the StructArray field. The same entity can appear more than once if multiple Struct elements match.

## Element-Level Filtering\{#element-level-filtering}

Use `element_filter(structField, predicate)` to constrain which Struct elements participate in filtering or vector search.

Inside the predicate, use `$[subField]` to refer to a sub-field of the current Struct element.

```plaintext
filter_expr = 'element_filter(chunks, $[score] > 0.8 && $[text] LIKE "intro%")'
```

When `element_filter` is combined with an entity-level predicate, place `element_filter` at the end of the expression:

```plaintext
# Correct
filter_expr = 'doc_status == "active" && element_filter(chunks, $[score] > 0.8)'

# Incorrect
filter_expr = 'element_filter(chunks, $[score] > 0.8) && doc_status == "active"'
```

Use the filter in element-level search:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"Shell","value":"shell"}]}>
<TabItem value='python'>

```python
filter_expr = (
    'doc_status == "active" && '
    'element_filter(chunks, $[score] > 0.8)'
)

results = client.search(
    collection_name="my_collection",
    data=[query],
    anns_field="chunks[element_vector]",
    limit=10,
    filter=filter_expr,
    output_fields=["chunks[text]", "chunks[score]"],
)
```

</TabItem>

<TabItem value='java'>

```java
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(queryVector)))
        .annsField("chunks[element_vector]")
        .limit(10)
        .filter("doc_status == \"active\" && element_filter(chunks, $[score] > 0.8)")
        .outputFields(Arrays.asList("chunks[text]", "chunks[score]"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
results, err = client.Search(ctx,
    milvusclient.NewSearchOption(
        "my_collection",
        10,
        []entity.Vector{queryVector},
    ).
        WithANNSField("chunks[element_vector]").
        WithFilter(`doc_status == "active" && element_filter(chunks, $[score] > 0.8)`).
        WithOutputFields("chunks[text]", "chunks[score]"),
)
if err != nil {
    // handle error
}
fmt.Println(results)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const results = await milvusClient.search({
  collection_name: "my_collection",
  data: [queryVector],
  anns_field: "chunks[element_vector]",
  limit: 10,
  filter: 'doc_status == "active" && element_filter(chunks, $[score] > 0.8)',
  output_fields: ["chunks[text]", "chunks[score]"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "collectionName": "my_collection",
    "data": [[0.3, 0.2, 0.3, 0.2, 0.5]],
    "annsField": "chunks[element_vector]",
    "limit": 10,
    "filter": "doc_status == \"active\" && element_filter(chunks, $[score] > 0.8)",
    "outputFields": ["chunks[text]", "chunks[score]"]
  }'
```

</TabItem>
</Tabs>

```shell
zilliz vector search \
  --collection my_collection \
  --data '[[0.3, 0.2, 0.3, 0.2, 0.5]]' \
  --anns-field "chunks[element_vector]" \
  --limit 10 \
  --filter 'doc_status == "active" && element_filter(chunks, $[score] > 0.8)' \
  --output-fields '["chunks[text]", "chunks[score]"]'
```

`element_filter` can appear only once in a filter expression. Do not nest `element_filter` or `MATCH_*` inside another `element_filter`. For details, refer to [Element Filter](./struct-array-filtering#element-filter).

## Match Family Filters\{#match-family-filters}

Use `MATCH_*` filters when the entity should be selected based on how many Struct elements satisfy a predicate. Match filters are row-level filters and do not return an element `offset`.

<table>
   <tr>
     <th><p>Operator</p></th>
     <th><p>Meaning</p></th>
   </tr>
   <tr>
     <td><p><code>MATCH_ANY(chunks, predicate)</code></p></td>
     <td><p>At least one Struct element satisfies the predicate</p></td>
   </tr>
   <tr>
     <td><p><code>MATCH_ALL(chunks, predicate)</code></p></td>
     <td><p>All Struct elements satisfy the predicate</p></td>
   </tr>
   <tr>
     <td><p><code>MATCH_LEAST(chunks, predicate, threshold=N)</code></p></td>
     <td><p>At least <code>N</code> Struct elements satisfy the predicate</p></td>
   </tr>
   <tr>
     <td><p><code>MATCH_MOST(chunks, predicate, threshold=N)</code></p></td>
     <td><p>At most <code>N</code> Struct elements satisfy the predicate</p></td>
   </tr>
   <tr>
     <td><p><code>MATCH_EXACT(chunks, predicate, threshold=N)</code></p></td>
     <td><p>Exactly <code>N</code> Struct elements satisfy the predicate</p></td>
   </tr>
</table>

Examples:

```plaintext
filter_any = 'MATCH_ANY(chunks, $[text] LIKE "intro%")'
filter_all = 'MATCH_ALL(chunks, $[score] > 0.3)'
filter_least = 'MATCH_LEAST(chunks, $[score] > 0.8, threshold=2)'
filter_most = 'MATCH_MOST(chunks, $[score] < 0.2, threshold=1)'
filter_exact = 'MATCH_EXACT(chunks, $[text] == "summary", threshold=1)'
```

`MATCH_*` names are case-insensitive. For `MATCH_LEAST`, `threshold` must be positive. For `MATCH_MOST` and `MATCH_EXACT`, `threshold` can be zero or a positive integer.

For an empty StructArray, `MATCH_ALL` returns `true`, and `MATCH_ANY` returns `false`.

Do not nest `MATCH_*` or `element_filter` inside a `MATCH_*` predicate.

For details, refer to [Match Family Operators](./struct-array-filtering#match-family-operators).

## Group Element-Level Results\{#group-element-level-results}

Element-level search returns hits at the struct-element granularity. If you use `group_by_field`, Milvus groups at the row level and clears element-level offsets in the grouped search result.

Use the primary key as `group_by_field` when you want each entity to appear at most once:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter_expr = (
    'element_filter(chunks, $[score] > 0.8)'
)

results = client.search(
    collection_name="my_collection",
    data=[query],
    anns_field="chunks[element_vector]",
    limit=5,
    filter=filter_expr,
    group_by_field="id",
    output_fields=["chunks[text]", "chunks[score]"],
)
```

</TabItem>

<TabItem value='java'>

```java
SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(queryVector)))
        .annsField("chunks[element_vector]")
        .limit(5)
        .filter("element_filter(chunks, $[score] > 0.8)")
        .groupByFieldName("id")
        .outputFields(Arrays.asList("chunks[text]", "chunks[score]"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
results, err = client.Search(ctx,
    milvusclient.NewSearchOption(
        "my_collection",
        5,
        []entity.Vector{queryVector},
    ).
        WithANNSField("chunks[element_vector]").
        WithFilter("element_filter(chunks, $[score] > 0.8)").
        WithGroupByField("id").
        WithOutputFields("chunks[text]", "chunks[score]"),
)
if err != nil {
    // handle error
}
fmt.Println(results)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const results = await milvusClient.search({
  collection_name: "my_collection",
  data: [queryVector],
  anns_field: "chunks[element_vector]",
  limit: 5,
  filter: "element_filter(chunks, $[score] > 0.8)",
  group_by_field: "id",
  output_fields: ["chunks[text]", "chunks[score]"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl -X POST "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "collectionName": "my_collection",
    "data": [[0.3, 0.2, 0.3, 0.2, 0.5]],
    "annsField": "chunks[element_vector]",
    "limit": 5,
    "filter": "element_filter(chunks, $[score] > 0.8)",
    "groupingField": "id",
    "outputFields": ["chunks[text]", "chunks[score]"]
  }'
```

</TabItem>
</Tabs>

For StructArray vector sub-fields, element-level search supports grouping only by the primary key. Embedding List search does not support `group_by_field`.

<Admonition type="info" icon="📘" title="What is the difference between the EmbeddingList search and the element-level search with a group-by field?">

<p>The metric type is the key difference. </p>
<ul>
<li><p>Embedding List search uses a <code>MAX_SIM*</code> metric: for a query embedding list <code>Q</code> and a stored embedding list <code>D</code>, Milvus compares each query vector with all vectors in <code>D</code>, keeps the best match for each query vector, and combines those best matches into the final entity score, as in <code>score(Q, D) = sum_i max_j sim(q_i, d_j)</code>.</p></li>
<li><p>Element-level search uses a regular vector metric to score each Struct element independently; <code>group_by_field</code> only collapses those element hits to one result per entity and does not recompute a <code>MAX_SIM*</code> score. Therefore, the two modes can rank entities differently even when both return one result per entity.</p></li>
</ul>

</Admonition>

## Interpret Results\{#interpret-results}

You are advised to observe the following items when you search with StructArray:

- `anns_field` must use the StructArray sub-field path format, such as `chunks[chunk_vector]`.

- Embedding List search expects an embedding-list query and a `MAX_SIM*` metric.

- Element-level search expects a regular query vector and a regular vector metric.

- `MATCH_*` filters are row-level: they decide whether an entity qualifies based on its StructArray elements, but they do not identify or return a matched element `offset`.

- Ungrouped element-level search results can include `offset`, the zero-based position of the matched Struct element. `element_filter` only limits which Struct elements participate in search; it does not change the result into a row-level match.

- Grouped element-level search results are row-level and clear `offset` because grouping operates on entities.

## Common Pitfalls\{#common-pitfalls}

The following cases will throw errors:

- Using a `MAX_SIM*` metric with plain vector query data.

- Using a regular vector metric with `EmbeddingList` query data.

- Placing `element_filter` before an entity-level predicate.

- Omitting the named `threshold` argument in `MATCH_LEAST`, `MATCH_MOST`, or `MATCH_EXACT`.

- Using `$[subField]` outside `element_filter` or `MATCH_*`.

