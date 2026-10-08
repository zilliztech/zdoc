---
title: "Grouping Search with StructArray | Cloud"
slug: /grouping-search-with-struct-array
sidebar_label: "Grouping Search"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Use this page to group StructArray element-level search results by the parent entity. Element-level search can return multiple hits from the same entity when several Struct elements match the query. Grouping collapses those element hits so each parent entity appears at most once. | Cloud"
type: origin
token: I60hwuYrSiVSWBkYq9RcqRcpnFh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Grouping Search with StructArray

Use this page to group StructArray element-level search results by the parent entity. Element-level search can return multiple hits from the same entity when several Struct elements match the query. Grouping collapses those element hits so each parent entity appears at most once.

This page uses the `tech_articles` collection from [Create a StructArray Field](./create-struct-array). The collection has a StructArray field named `chunks`. The `chunks[emb]` vector subfield is indexed for element-level search with a regular vector metric.

## How grouping applies to StructArray\{#how-grouping-applies-to-structarray}

| Search mode | Grouping behavior | Result behavior |
| --- | --- | --- |
| EmbeddingList search | Not supported. | Not applicable. |
| Element-level search | Supported by grouping on the primary key. | Returns at most one result per parent entity. Element-level metadata is preserved, so the selected element index or offset can be returned when exposed by the API or SDK. |
| Hybrid search | Supported only when all sub-searches target element-level vector fields under the same StructArray field. | Element-level sub-searches are grouped by primary key before final result handling. |

<Admonition type="info" title="Notes">

Use grouping when ungrouped element-level search returns too many duplicate parent entities. If you want every matching Struct element as an individual hit, use [Basic Vector Search with StructArray](./search-with-struct-array) without `group_by_field`.

</Admonition>

## Before you begin\{#before-you-begin}

Prepare the collection, data, and indexes before running grouping search.

| Requirement | Details |
| --- | --- |
| Element-level vector subfield | Use a StructArray vector subfield such as `chunks[emb]`, indexed with a regular vector metric. |
| Regular vector query | Use a regular query vector, not an `EmbeddingList`. |
| Primary key grouping | Use the collection primary key as `group_by_field`, such as `doc_id`. |
| No range parameters | Do not combine grouping search with range-search parameters such as `radius` or `range_filter`. |

For index setup, see [Index StructArray Fields](./index-struct-array).

## Run grouped element-level search\{#run-grouped-element-level-search}

The following example searches individual chunks first, then groups the element hits by the parent entity's primary key.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

query_vector = [0.19, 0.24, 0.30, 0.37]

results = client.search(
    collection_name="tech_articles",
    data=[query_vector],
    anns_field="chunks[emb]",
    limit=5,
    group_by_field="doc_id",
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
        "chunks[page]",
        "chunks[quality_score]",
    ],
)

for hits in results:
    for hit in hits:
        print(
            "doc_id:", hit["doc_id"],
            "distance:", hit["distance"],
            "offset:", hit.get("offset"),
            "entity:", hit["entity"],
        )
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

FloatVec queryVector = new FloatVec(new float[]{0.19f, 0.24f, 0.30f, 0.37f});

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("tech_articles")
        .annsField("chunks[emb]")
        .data(Collections.singletonList(queryVector))
        .topK(5)
        .groupByFieldName("doc_id")
        .outputFields(Arrays.asList(
                "doc_id", "title", "chunks[text]", "chunks[section]",
                "chunks[page]", "chunks[quality_score]"))
        .build());

for (List<SearchResp.SearchResult> results : searchResp.getSearchResults()) {
    for (SearchResp.SearchResult result : results) {
        System.out.println("doc_id: " + result.getEntity().get("doc_id")
                + ", distance: " + result.getScore()
                + ", offset: " + result.getElementOffset()
                + ", entity: " + result.getEntity());
    }
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

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
}
defer cli.Close(ctx)

queryVector := []float32{0.19, 0.24, 0.30, 0.37}

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "tech_articles",
    5,
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("chunks[emb]").
    WithGroupByField("doc_id").
    WithOutputFields("doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]"))
if err != nil {
    fmt.Println(err.Error())
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("doc_id: ", resultSet.GetColumn("doc_id").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let response = client.search(
    SearchRequest::builder()
        .collection_name("tech_articles")
        .vector_field("chunks[emb]")
        .vectors(SearchVectors::Float(vec![vec![0.19, 0.24, 0.30, 0.37]]))
        .output_fields(["doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]"])
        .limit(5)
        .group_by_field("doc_id")
        .build()?,
).await?;

for result in response.results() {
    for row in result.rows()? {
        println!("doc_id: {:?}, distance: {:?}, offset: {:?}, entity: {:?}",
            row.get("doc_id")?, row.get("score")?, row.element_offset(), row.to_entity_row()?);
    }
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <vector>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::vector<float> query_vector = {0.19f, 0.24f, 0.30f, 0.37f};

milvus::SearchRequest request;
request.WithCollectionName("tech_articles")
       .WithAnnsField("chunks[emb]")
       .AddFloatVector(query_vector)
       .WithLimit(5)
       .WithGroupByField("doc_id")
       .AddOutputField("doc_id")
       .AddOutputField("title")
       .AddOutputField("chunks[text]")
       .AddOutputField("chunks[section]")
       .AddOutputField("chunks[page]")
       .AddOutputField("chunks[quality_score]");

milvus::SearchResponse response;
status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (const auto& result : response.Results().Results()) {
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
    }
    for (const auto& row : output_rows) {
        std::cout << row << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const query_vector = [0.19, 0.24, 0.30, 0.37];

const res = await client.search({
  collection_name: "tech_articles",
  data: [query_vector],
  anns_field: "chunks[emb]",
  limit: 5,
  group_by_field: "doc_id",
  output_fields: ["doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]"],
});

for (const hit of res.results) {
  console.log("doc_id:", hit.doc_id, "distance:", hit.score, "offset:", hit.offset);
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles",
    "data": [
        [0.19, 0.24, 0.30, 0.37]
    ],
    "annsField": "chunks[emb]",
    "limit": 5,
    "groupingField": "doc_id",
    "outputFields": ["doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]"]
}'
```

</TabItem>
</Tabs>

Without grouping, the same `doc_id` can appear multiple times if several chunks match the query. With `group_by_field="doc_id"`, each parent entity appears at most once. Grouping preserves element-level metadata, so the grouped result can still include the selected Struct element index or offset when the API or SDK exposes it.

## Add scalar filters\{#add-scalar-filters}

You can combine grouping search with StructArray scalar filtering. Use `element_filter` when the scalar condition should constrain which Struct elements participate in element-level vector search.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
query_vector = [0.19, 0.24, 0.30, 0.37]

filter_expr = (
    'category == "search" && '
    'element_filter(chunks, '
    '$[section] == "index" && '
    '$[quality_score] > 0.9)'
)

results = client.search(
    collection_name="tech_articles",
    data=[query_vector],
    anns_field="chunks[emb]",
    filter=filter_expr,
    limit=5,
    group_by_field="doc_id",
    output_fields=[
        "doc_id",
        "title",
        "category",
        "chunks[text]",
        "chunks[section]",
        "chunks[quality_score]",
    ],
)
```

</TabItem>

<TabItem value='java'>

```java
FloatVec queryVector = new FloatVec(new float[]{0.19f, 0.24f, 0.30f, 0.37f});

String filterExpr = "category == \"search\" && "
        + "element_filter(chunks, "
        + "$[section] == \"index\" && "
        + "$[quality_score] > 0.9)";

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("tech_articles")
        .annsField("chunks[emb]")
        .data(Collections.singletonList(queryVector))
        .filter(filterExpr)
        .topK(5)
        .groupByFieldName("doc_id")
        .outputFields(Arrays.asList(
                "doc_id", "title", "category",
                "chunks[text]", "chunks[section]", "chunks[quality_score]"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.19, 0.24, 0.30, 0.37}

filterExpr := "category == \"search\" && " +
    "element_filter(chunks, " +
    "$[section] == \"index\" && " +
    "$[quality_score] > 0.9)"

resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "tech_articles",
    5,
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("chunks[emb]").
    WithFilter(filterExpr).
    WithGroupByField("doc_id").
    WithOutputFields("doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"))
if err != nil {
    fmt.Println(err.Error())
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("doc_id: ", resultSet.GetColumn("doc_id").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let filter_expr = "category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9)";

let response = client.search(
    SearchRequest::builder()
        .collection_name("tech_articles")
        .vector_field("chunks[emb]")
        .vectors(SearchVectors::Float(vec![vec![0.19, 0.24, 0.30, 0.37]]))
        .filter(filter_expr)
        .output_fields(["doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"])
        .limit(5)
        .group_by_field("doc_id")
        .build()?,
).await?;

for result in response.results() {
    for row in result.rows()? {
        println!("doc_id: {:?}, distance: {:?}, offset: {:?}, entity: {:?}",
            row.get("doc_id")?, row.get("score")?, row.element_offset(), row.to_entity_row()?);
    }
}
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.19f, 0.24f, 0.30f, 0.37f};

std::string filter_expr = "category == \"search\" && "
                          "element_filter(chunks, "
                          "$[section] == \"index\" && "
                          "$[quality_score] > 0.9)";

milvus::SearchRequest request;
request.WithCollectionName("tech_articles")
       .WithAnnsField("chunks[emb]")
       .AddFloatVector(query_vector)
       .WithFilter(filter_expr)
       .WithLimit(5)
       .WithGroupByField("doc_id")
       .AddOutputField("doc_id")
       .AddOutputField("title")
       .AddOutputField("category")
       .AddOutputField("chunks[text]")
       .AddOutputField("chunks[section]")
       .AddOutputField("chunks[quality_score]");

milvus::SearchResponse response;
status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const query_vector = [0.19, 0.24, 0.30, 0.37];

const filter_expr = 'category == "search" && element_filter(chunks, $[section] == "index" && $[quality_score] > 0.9)';

const res = await client.search({
  collection_name: "tech_articles",
  data: [query_vector],
  anns_field: "chunks[emb]",
  filter: filter_expr,
  limit: 5,
  group_by_field: "doc_id",
  output_fields: ["doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles",
    "data": [
        [0.19, 0.24, 0.30, 0.37]
    ],
    "annsField": "chunks[emb]",
    "filter": "category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9)",
    "limit": 5,
    "groupingField": "doc_id",
    "outputFields": ["doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"]
}'
```

</TabItem>
</Tabs>

The top-level predicate selects candidate entities. The `element_filter` predicate restricts element-level vector search to matching Struct elements. Grouping then collapses matching element hits by the primary key.

## Use grouping in hybrid search\{#use-grouping-in-hybrid-search}

Hybrid grouping with StructArray is an element-level feature. It is supported only when all sub-searches target element-level vector fields under the same StructArray field. Do not use EmbeddingList-level requests in a grouped StructArray hybrid search.

The following example assumes the `chunks` StructArray field has two element-level vector subfields, `chunks[emb]` and `chunks[code_emb]`, and both are indexed with regular vector metrics.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import AnnSearchRequest, RRFRanker

query_vector = [0.19, 0.24, 0.30, 0.37]
code_query_vector = [0.18, 0.23, 0.29, 0.36]

index_chunk_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="chunks[emb]",
    param={"metric_type": "COSINE", "params": {"efSearch": 64}},
    limit=10,
    expr='element_filter(chunks, $[section] == "index")',
)

code_chunk_req = AnnSearchRequest(
    data=[code_query_vector],
    anns_field="chunks[code_emb]",
    param={"metric_type": "COSINE", "params": {"efSearch": 64}},
    limit=10,
    expr='element_filter(chunks, $[has_code] == true)',
)

results = client.hybrid_search(
    collection_name="tech_articles",
    reqs=[index_chunk_req, code_chunk_req],
    ranker=RRFRanker(),
    limit=5,
    group_by_field="doc_id",
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
    ],
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.request.ranker.RRFRanker;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;

FloatVec queryVector = new FloatVec(new float[]{0.19f, 0.24f, 0.30f, 0.37f});
FloatVec codeQueryVector = new FloatVec(new float[]{0.18f, 0.23f, 0.29f, 0.36f});

AnnSearchReq indexChunkReq = AnnSearchReq.builder()
        .vectorFieldName("chunks[emb]")
        .vectors(Collections.singletonList(queryVector))
        .metricType(IndexParam.MetricType.COSINE)
        .limit(10)
        .filter("element_filter(chunks, $[section] == \"index\")")
        .build();

AnnSearchReq codeChunkReq = AnnSearchReq.builder()
        .vectorFieldName("chunks[code_emb]")
        .vectors(Collections.singletonList(codeQueryVector))
        .metricType(IndexParam.MetricType.COSINE)
        .limit(10)
        .filter("element_filter(chunks, $[has_code] == true)")
        .build();

SearchResp searchResp = client.hybridSearch(HybridSearchReq.builder()
        .collectionName("tech_articles")
        .searchRequests(Arrays.asList(indexChunkReq, codeChunkReq))
        .ranker(RRFRanker.builder().build())
        .limit(5)
        .groupByFieldName("doc_id")
        .outFields(Arrays.asList("doc_id", "title", "chunks[text]", "chunks[section]"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
queryVector := []float32{0.19, 0.24, 0.30, 0.37}
codeQueryVector := []float32{0.18, 0.23, 0.29, 0.36}

annReq1 := milvusclient.NewAnnRequest("chunks[emb]", 10, entity.FloatVector(queryVector)).
    WithFilter("element_filter(chunks, $[section] == \"index\")").
    WithSearchParam("metric_type", "COSINE")

annReq2 := milvusclient.NewAnnRequest("chunks[code_emb]", 10, entity.FloatVector(codeQueryVector)).
    WithFilter("element_filter(chunks, $[has_code] == true)").
    WithSearchParam("metric_type", "COSINE")

resultSets, err := cli.HybridSearch(ctx, milvusclient.NewHybridSearchOption(
    "tech_articles",
    5,
    annReq1, annReq2,
).WithReranker(milvusclient.NewRRFReranker()).
    WithOutputFields("doc_id", "title", "chunks[text]", "chunks[section]"))
if err != nil {
    fmt.Println(err.Error())
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("doc_id: ", resultSet.GetColumn("doc_id").FieldData().GetScalars())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let index_chunk_req = SubSearchRequest::builder()
    .vector_field("chunks[emb]")
    .vectors(SearchVectors::Float(vec![vec![0.19, 0.24, 0.30, 0.37]]))
    .filter("element_filter(chunks, $[section] == \"index\")")
    .limit(10)
    .build()?;

let code_chunk_req = SubSearchRequest::builder()
    .vector_field("chunks[code_emb]")
    .vectors(SearchVectors::Float(vec![vec![0.18, 0.23, 0.29, 0.36]]))
    .filter("element_filter(chunks, $[has_code] == true)")
    .limit(10)
    .build()?;

let response = client.hybrid_search(
    HybridSearchRequest::builder()
        .collection_name("tech_articles")
        .sub_requests(vec![index_chunk_req, code_chunk_req])
        .rerank(RRFRerank::new())
        .limit(5)
        .group_by_field("doc_id")
        .output_fields(["doc_id", "title", "chunks[text]", "chunks[section]"])
        .build()?,
).await?;

for result in response.results() {
    for row in result.rows()? {
        println!("doc_id: {:?}, distance: {:?}, offset: {:?}, entity: {:?}",
            row.get("doc_id")?, row.get("score")?, row.element_offset(), row.to_entity_row()?);
    }
}
```

</TabItem>

<TabItem value='c++'>

```c++
std::vector<float> query_vector = {0.19f, 0.24f, 0.30f, 0.37f};
std::vector<float> code_query_vector = {0.18f, 0.23f, 0.29f, 0.36f};

auto index_chunk_req = std::make_shared<milvus::SubSearchRequest>();
index_chunk_req->WithAnnsField("chunks[emb]")
                .AddFloatVector(query_vector)
                .WithFilter("element_filter(chunks, $[section] == \"index\")")
                .WithLimit(10);

auto code_chunk_req = std::make_shared<milvus::SubSearchRequest>();
code_chunk_req->WithAnnsField("chunks[code_emb]")
               .AddFloatVector(code_query_vector)
               .WithFilter("element_filter(chunks, $[has_code] == true)")
               .WithLimit(10);

milvus::HybridSearchRequest request;
request.WithCollectionName("tech_articles")
       .AddSubRequest(index_chunk_req)
       .AddSubRequest(code_chunk_req)
       .WithRerank(std::make_shared<milvus::RRFRerank>(60))
       .WithLimit(5)
       .WithGroupByField("doc_id")
       .AddOutputField("doc_id")
       .AddOutputField("title")
       .AddOutputField("chunks[text]")
       .AddOutputField("chunks[section]");

milvus::HybridSearchResponse response;
status = client->HybridSearch(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const query_vector = [0.19, 0.24, 0.30, 0.37];
const code_query_vector = [0.18, 0.23, 0.29, 0.36];

const res = await client.hybridSearch({
  collection_name: "tech_articles",
  data: [
    {
      anns_field: "chunks[emb]",
      data: [query_vector],
      limit: 10,
      expr: 'element_filter(chunks, $[section] == "index")',
    },
    {
      anns_field: "chunks[code_emb]",
      data: [code_query_vector],
      limit: 10,
      expr: 'element_filter(chunks, $[has_code] == true)',
    },
  ],
  rerank: { strategy: "rrf", params: {} },
  limit: 5,
  group_by_field: "doc_id",
  output_fields: ["doc_id", "title", "chunks[text]", "chunks[section]"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/hybrid_search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles",
    "search": [
        {
            "annsField": "chunks[emb]",
            "data": [[0.19, 0.24, 0.30, 0.37]],
            "limit": 10,
            "filter": "element_filter(chunks, $[section] == \"index\")"
        },
        {
            "annsField": "chunks[code_emb]",
            "data": [[0.18, 0.23, 0.29, 0.36]],
            "limit": 10,
            "filter": "element_filter(chunks, $[has_code] == true)"
        }
    ],
    "rerank": { "strategy": "rrf", "params": {} },
    "limit": 5,
    "groupingField": "doc_id",
    "outputFields": ["doc_id", "title", "chunks[text]", "chunks[section]"]
}'
```

</TabItem>
</Tabs>

In this example, both sub-requests target element-level vector fields under the same StructArray field, `chunks`. A hybrid search does not support element-level group-by if it mixes normal vector fields, different StructArray fields, or EmbeddingList-level requests.

## Interpret grouped results\{#interpret-grouped-results}

| Result item | Meaning |
| --- | --- |
| `id` | Primary key of the grouped parent entity. |
| `distance` or score | Score or distance of the selected Struct element for that parent entity. |
| `offset` | Zero-based position of the selected Struct element when returned. |
| Repeated primary keys | Not expected when grouping by the primary key. |
| `limit` | Applies to grouped parent-entity results. |

## Limitations\{#limitations}

- Grouping search applies only to element-level StructArray vector search. EmbeddingList search and EmbeddingList-level hybrid search do not support group-by.

- Use the primary key as `group_by_field`. StructArray element-level grouping is not a general-purpose group-by over arbitrary scalar fields.

- Do not combine grouping search with range search.

- Do not use an `EmbeddingList` query or a `MAX_SIM*` metric for grouping search.

- Hybrid grouping is supported only when all sub-searches target element-level vector fields under the same StructArray field.

- Hybrid grouping is not supported when the hybrid search mixes a normal vector field, a different StructArray field, or an EmbeddingList-level request.

## Common mistakes\{#common-mistakes}

- Using grouping with `chunks[emb_list_vector]`, which is intended for EmbeddingList search.

- Grouping by a non-primary-key scalar field.

- Grouping by multiple fields. Element-level StructArray grouping supports only primary-key grouping.

- Expecting grouped results to represent every matched Struct element. Grouping returns at most one result per parent entity.

- Assuming grouped element-level search recomputes an EmbeddingList-style `MAX_SIM*` score. Grouping collapses element-level hits; it does not change the scoring model.

- Combining `group_by_field` with `radius` or `range_filter`.

## Next steps\{#next-steps}

1. To learn ungrouped element-level search first, read [Basic Vector Search with StructArray](./search-with-struct-array).

1. To add scalar filters to grouped search, read [Filtered Search with StructArray](./filtered-search-with-struct-arrays).

1. To use score or distance boundaries instead of grouping, read [Range Search with StructArray](./range-search-with-struct-arrays).

1. To check StructArray search limits, read [StructArray Limits](./struct-array-limits).

