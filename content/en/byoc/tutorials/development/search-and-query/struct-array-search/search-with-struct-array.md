---
title: "Basic Vector Search with StructArray | BYOC"
slug: /search-with-struct-array
sidebar_label: "Basic Vector Search"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Use this page to run vector search on vector subfields inside a StructArray field. StructArray supports two basic vector search modes EmbeddingList search, which scores an embedding list stored in each entity, and element-level search, which searches each Struct element independently. | BYOC"
type: origin
token: EDzFwzb7Sifsz4kFYZIcAF9Pn1p
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Basic Vector Search with StructArray

Use this page to run vector search on vector subfields inside a StructArray field. StructArray supports two basic vector search modes: EmbeddingList search, which scores an embedding list stored in each entity, and element-level search, which searches each Struct element independently.

This page uses the `tech_articles` collection from [Create a StructArray Field](./create-struct-array). The collection has a StructArray field named `chunks`. Each chunk contains text, scalar metadata, a vector subfield named `emb_list_vector` with an index for EmbeddingList search, and a vector subfield named `emb` with an index for element-level search.

## Before you begin\{#before-you-begin}

Make sure the collection schema, data, and indexes are already prepared.

| Requirement | Where to prepare it |
| --- | --- |
| Create a StructArray field, such as `chunks`. | [Create a StructArray Field](./create-struct-array) |
| Insert entities whose `chunks` field contains Struct objects. | [Insert Data into StructArray Fields](./insert-struct-array) |
| Create a `MAX_SIM*` index on `chunks[emb_list_vector]` for EmbeddingList search. | [Index StructArray Fields](./index-struct-array) |
| Create a regular vector-metric index on `chunks[emb]` for element-level search. | [Index StructArray Fields](./index-struct-array) |

<Admonition type="warning" title="Warning">

A vector field or vector subfield accepts only one index. If you need both EmbeddingList search and element-level search, create two separate vector subfields. In this page, `chunks[emb_list_vector]` is indexed for EmbeddingList search, and `chunks[emb]` is indexed for element-level search.

</Admonition>

## Choose a search mode\{#choose-a-search-mode}

| Aspect | EmbeddingList search | Element-level search |
| --- | --- | --- |
| Target subfield | `chunks[emb_list_vector]` | `chunks[emb]` |
| Query data | An embedding list that contains one or more vectors. | A regular vector. |
| Metric family | `MAX_SIM*`, such as `MAX_SIM_COSINE`. | Regular vector metrics, such as `COSINE`, `IP`, or `L2`. |
| What one hit represents | A matched entity whose StructArray vector subfield is similar to the query embedding list. | A matched Struct element inside the StructArray field. |
| Result granularity | Entity level. | Struct element level. |
| Offset | Not applicable. | Identifies the zero-based position of the matched Struct element when returned. |
| Typical use | ColBERT, ColPali, and other late-interaction retrieval patterns. | Chunk-level, passage-level, clip-level, patch-level, or fact-level retrieval. |

## Run EmbeddingList search\{#run-embeddinglist-search}

Use EmbeddingList search when the query itself contains multiple vectors and the target StructArray vector subfield is indexed with a `MAX_SIM*` metric. The result is an entity-level match.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
from pymilvus.client.embedding_list import EmbeddingList

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

query = EmbeddingList()
query.add([0.12, 0.21, 0.32, 0.44])
query.add([0.18, 0.23, 0.29, 0.36])

results = client.search(
    collection_name="tech_articles",
    data=[query],
    anns_field="chunks[emb_list_vector]",
    limit=3,
    output_fields=[
        "doc_id",
        "title",
        "category",
        "chunks[text]",
        "chunks[section]",
    ],
)

for hits in results:
    for hit in hits:
        print(hit.id, hit.distance, hit.entity)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddingList;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

EmbeddingList query = new EmbeddingList();
query.add(new FloatVec(Arrays.asList(0.12f, 0.21f, 0.32f, 0.44f)));
query.add(new FloatVec(Arrays.asList(0.18f, 0.23f, 0.29f, 0.36f)));

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("tech_articles")
        .annsField("chunks[emb_list_vector]")
        .data(Collections.singletonList(query))
        .limit(3)
        .outputFields(Arrays.asList("doc_id", "title", "category", "chunks[text]", "chunks[section]"))
        .build());

for (List<SearchResp.SearchResult> hits : resp.getSearchResults()) {
    for (SearchResp.SearchResult hit : hits) {
        System.out.println(hit.getId() + " " + hit.getScore() + " " + hit.getEntity());
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
    fmt.Println(err)
    return
}

query := entity.FloatVectorArray{
    {0.12, 0.21, 0.32, 0.44},
    {0.18, 0.23, 0.29, 0.36},
}

results, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "tech_articles",
    3,
    []entity.Vector{query},
).WithANNSField("chunks[emb_list_vector]").WithOutputFields("doc_id", "title", "category", "chunks[text]", "chunks[section]"))
if err != nil {
    fmt.Println(err)
    return
}

for _, result := range results {
    for i := 0; i < result.ResultCount; i++ {
        id, _ := result.IDs.Get(i)
        fmt.Println(id, result.Scores[i])
    }
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let query = EmbeddingList::new().vectors(vec![
        vec![0.12, 0.21, 0.32, 0.44],
        vec![0.18, 0.23, 0.29, 0.36],
    ]);

    let response = client
        .search(
            SearchRequest::builder()
                .collection_name("tech_articles")
                .vector_field("chunks[emb_list_vector]")
                .vectors(SearchVectors::EmbeddingLists(vec![query]))
                .output_fields(["doc_id", "title", "category", "chunks[text]", "chunks[section]"])
                .limit(3)
                .build()?,
        )
        .await?;

    for result in response.results() {
        for row in result.rows()? {
            println!("{:?}", row.to_entity_row()?);
        }
    }

    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::EmbeddingList query;
query.AddFloatVector({0.12, 0.21, 0.32, 0.44});
query.AddFloatVector({0.18, 0.23, 0.29, 0.36});

auto request = milvus::SearchRequest()
                   .WithCollectionName("tech_articles")
                   .WithLimit(3)
                   .WithAnnsField("chunks[emb_list_vector]")
                   .AddEmbeddingList(std::move(query))
                   .AddOutputField("doc_id")
                   .AddOutputField("title")
                   .AddOutputField("category")
                   .AddOutputField("chunks[text]")
                   .AddOutputField("chunks[section]");

milvus::SearchResponse response;
status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

for (auto& result : response.Results().Results()) {
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << row << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

const query = [
  [0.12, 0.21, 0.32, 0.44],
  [0.18, 0.23, 0.29, 0.36],
];

const results = await client.search({
  collection_name: "tech_articles",
  data: query,
  anns_field: "chunks[emb_list_vector]",
  limit: 3,
  output_fields: [
    "doc_id",
    "title",
    "category",
    "chunks[text]",
    "chunks[section]",
  ],
});

console.log(JSON.stringify(results.results, null, 2));
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "collectionName": "tech_articles",
    "data": [
      [
        [0.12, 0.21, 0.32, 0.44],
        [0.18, 0.23, 0.29, 0.36]
      ]
    ],
    "annsField": "chunks[emb_list_vector]",
    "limit": 3,
    "outputFields": [
      "doc_id",
      "title",
      "category",
      "chunks[text]",
      "chunks[section]"
    ]
  }'
```

</TabItem>
</Tabs>

In this search mode, `limit` controls how many entities are returned for each query. The output can include StructArray subfields, but the hit itself represents the matched parent entity rather than one specific Struct element.

<Admonition type="info" title="Notes">

For a full ColBERT or ColPali-style walkthrough, see [Search with Embedding Lists](./tutorial-colbert-colpali). This page only covers the basic StructArray search behavior.

</Admonition>

## Run element-level search\{#run-element-level-search}

Use element-level search when each Struct element should participate in vector search independently. The query is a regular vector, and the target vector subfield must be indexed with a regular vector metric.

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
            "doc_id:", hit.id,
            "distance:", hit.distance,
            "offset:", hit.get("offset"),
            "entity:", hit.entity,
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

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("tech_articles")
        .annsField("chunks[emb]")
        .data(Collections.singletonList(new FloatVec(Arrays.asList(0.19f, 0.24f, 0.30f, 0.37f))))
        .limit(5)
        .outputFields(Arrays.asList("doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]"))
        .build());

for (List<SearchResp.SearchResult> hits : resp.getSearchResults()) {
    for (SearchResp.SearchResult hit : hits) {
        System.out.println("doc_id: " + hit.getId()
                + " distance: " + hit.getScore()
                + " offset: " + hit.getElementOffset()
                + " entity: " + hit.getEntity());
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
    fmt.Println(err)
    return
}

// Note: the element-level hit offset is not exposed by the Go SDK as of client/v3.0.0.
results, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "tech_articles",
    5,
    []entity.Vector{entity.FloatVector{0.19, 0.24, 0.30, 0.37}},
).WithANNSField("chunks[emb]").WithOutputFields("doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]"))
if err != nil {
    fmt.Println(err)
    return
}

for _, result := range results {
    for i := 0; i < result.ResultCount; i++ {
        id, _ := result.IDs.Get(i)
        fmt.Println("doc_id:", id, "distance:", result.Scores[i])
    }
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let query_vector = vec![0.19, 0.24, 0.30, 0.37];

    let response = client
        .search(
            SearchRequest::builder()
                .collection_name("tech_articles")
                .vector_field("chunks[emb]")
                .vectors(SearchVectors::Float(vec![query_vector]))
                .output_fields(["doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]"])
                .limit(5)
                .build()?,
        )
        .await?;

    for result in response.results() {
        for row in result.rows()? {
            let entity = row.to_entity_row()?;
            println!(
                "doc_id: {:?} distance: {:?} offset: {:?} entity: {:?}",
                row.get("doc_id")?, row.get("score")?, row.element_offset(), entity
            );
        }
    }

    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::SearchRequest()
                   .WithCollectionName("tech_articles")
                   .WithLimit(5)
                   .WithAnnsField("chunks[emb]")
                   .WithFloatVectors({{0.19, 0.24, 0.30, 0.37}})
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

for (auto& result : response.Results().Results()) {
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    for (const auto& row : output_rows) {
        std::cout << row << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

const query_vector = [0.19, 0.24, 0.30, 0.37];

const results = await client.search({
  collection_name: "tech_articles",
  data: query_vector,
  anns_field: "chunks[emb]",
  limit: 5,
  output_fields: [
    "doc_id",
    "title",
    "chunks[text]",
    "chunks[section]",
    "chunks[page]",
    "chunks[quality_score]",
  ],
});

console.log(JSON.stringify(results.results, null, 2));
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "collectionName": "tech_articles",
    "data": [
      [0.19, 0.24, 0.30, 0.37]
    ],
    "annsField": "chunks[emb]",
    "limit": 5,
    "outputFields": [
      "doc_id",
      "title",
      "chunks[text]",
      "chunks[section]",
      "chunks[page]",
      "chunks[quality_score]"
    ]
  }'
```

</TabItem>
</Tabs>

In element-level search, each hit represents a matched Struct element. The `offset` value is the zero-based position of that element in the StructArray field. The same entity can appear more than once if more than one Struct element matches the query. The `limit` value applies to element hits, not unique parent entities.

## Interpret results\{#interpret-results}

| Result item | EmbeddingList search | Element-level search |
| --- | --- | --- |
| `id` | Primary key of the matched entity. | Primary key of the entity that contains the matched Struct element. |
| `distance` or score | Score or distance between the query embedding list and the stored embedding list. | Score or distance between the query vector and the matched Struct element vector. |
| `offset` | Not applicable. | Zero-based position of the matched Struct element when returned. |
| Repeated primary keys | Not expected for a single query because results are entity-level. | Possible, because multiple Struct elements in the same entity can match. |
| Requested StructArray output fields | Returned from the matched entity. | Returned with the element-level hit shape supported by the target API and SDK. |

## Common mistakes\{#common-mistakes}

- Using `chunks.emb` instead of the required subfield path syntax `chunks[emb]`.

- Using an EmbeddingList query against a vector subfield indexed with a regular vector metric.

- Using a regular vector query against a vector subfield indexed with a `MAX_SIM*` metric.

- Expecting element-level search `limit` to return that many unique parent entities. It returns element hits.

- Expecting EmbeddingList search to return one specific element offset. It returns entity-level matches.

- Reusing one vector subfield for both search modes. Use separate vector subfields because each vector subfield accepts only one index.

## Next steps\{#next-steps}

1. To restrict element-level search by scalar conditions, read [Filtered Search with StructArray](./filtered-search-with-struct-arrays).

1. To search by score or distance boundaries, read [Range Search with StructArray](./range-search-with-struct-arrays).

1. To return at most one result per parent entity after element-level search, read [Grouping Search with StructArray](./grouping-search-with-struct-array).

1. To combine StructArray search with other vector searches, read [Hybrid Search with StructArray](./hybrid-search-with-struct-array).

1. To review supported data types, metrics, filters, and version-specific limits, read [StructArray Limits](./struct-array-limits).

