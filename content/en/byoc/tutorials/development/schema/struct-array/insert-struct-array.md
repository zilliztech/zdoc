---
title: "Insert Data into StructArray Fields | BYOC"
slug: /insert-struct-array
sidebar_label: "Insert Data into StructArray Fields"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Insert data into a StructArray field when each entity contains an ordered list of structured elements. In the insert payload, a StructArray field is represented as an array of objects. Each object represents one Struct element and uses the Struct subfield names defined in the collection schema. | BYOC"
type: origin
token: WTPbww9GkifmAvkuRWLcVd4jnnh
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Insert Data into StructArray Fields

Insert data into a StructArray field when each entity contains an ordered list of structured elements. In the insert payload, a StructArray field is represented as an array of objects. Each object represents one Struct element and uses the Struct subfield names defined in the collection schema.

This page uses the `tech_articles` collection from [Create a StructArray Field](./create-struct-array). Each entity is a technical article, and the `chunks` field stores article chunks as Struct elements.

## Before you begin\{#before-you-begin}

Make sure the collection schema already contains the `chunks` StructArray field.

| Field | Type | Insert value |
| --- | --- | --- |
| `doc_id` | `INT64` | Article ID. |
| `title` | `VARCHAR` | Article title. |
| `category` | `VARCHAR` | Article category. |
| `title_vector` | `FLOAT_VECTOR` | Article-level embedding. |
| `chunks` | `ARRAY<STRUCT>` | A list of chunk objects. |

Each object in `chunks` must follow the Struct schema.

| Subfield | Type | Insert value |
| --- | --- | --- |
| `text` | `VARCHAR` | Chunk text. |
| `section` | `VARCHAR` | Section name, such as `index`, `search`, or `filter`. |
| `page` | `INT64` | Page number or logical position. |
| `quality_score` | `FLOAT` | Chunk-level score. |
| `has_code` | `BOOL` | Whether the chunk contains code. |
| `emb_list_vector` | `FLOAT_VECTOR` | Vector written for EmbeddingList search. |
| `emb` | `FLOAT_VECTOR` | Vector written for element-level search. |

<Admonition type="info" title="Notes">

In an insert payload, `chunks` is a regular field whose value is an array of Struct objects. Inside each object, use subfield names such as `text` and `emb`. Use path syntax, such as `chunks[text]` or `chunks[emb]`, only after insertion when you create indexes, run searches, build filters, or specify output fields.

</Admonition>

## Understand the insert payload shape\{#understand-the-insert-payload-shape}

The `chunks` value is an array of Struct elements. Each element is an object whose keys are subfield names.

```json
{
  "doc_id": 1,
  "title": "StructArray indexing patterns",
  "category": "index",
  "title_vector": [0.12, 0.08, 0.32, 0.48],
  "chunks": [
    {
      "text": "Create one index for each vector subfield.",
      "section": "index",
      "page": 1,
      "quality_score": 0.96,
      "has_code": false,
      "emb_list_vector": [0.10, 0.20, 0.30, 0.40],
      "emb": [0.10, 0.20, 0.30, 0.40]
    },
    {
      "text": "Use MAX_SIM metrics for EmbeddingList search.",
      "section": "index",
      "page": 2,
      "quality_score": 0.91,
      "has_code": true,
      "emb_list_vector": [0.16, 0.24, 0.35, 0.45],
      "emb": [0.16, 0.24, 0.35, 0.45]
    }
  ]
}
```

`emb_list_vector` and `emb` are separate vector subfields because they support different search modes. EmbeddingList search treats all vectors in a StructArray field as one embedding list and returns entity-level results with `MAX_SIM*` metrics. Element-level search searches each Struct element independently and can return the matched element offset. This example stores the same vector values in both fields for simplicity. In a production application, you can store the same embeddings in both subfields when both search modes use the same chunk embedding, or store different embeddings when the two search modes use different representations.

## Insert rows\{#insert-rows}

Use `client.insert()` to insert rows that contain StructArray values.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

data = [
    {
        "doc_id": 1,
        "title": "StructArray indexing patterns",
        "category": "index",
        "title_vector": [0.12, 0.08, 0.32, 0.48],
        "chunks": [
            {
                "text": "Create one index for each vector subfield.",
                "section": "index",
                "page": 1,
                "quality_score": 0.96,
                "has_code": False,
                "emb_list_vector": [0.10, 0.20, 0.30, 0.40],
                "emb": [0.10, 0.20, 0.30, 0.40],
            },
            {
                "text": "Use MAX_SIM metrics for EmbeddingList search.",
                "section": "index",
                "page": 2,
                "quality_score": 0.91,
                "has_code": True,
                "emb_list_vector": [0.16, 0.24, 0.35, 0.45],
                "emb": [0.16, 0.24, 0.35, 0.45],
            },
        ],
    },
    {
        "doc_id": 2,
        "title": "Filtered StructArray search",
        "category": "filter",
        "title_vector": [0.20, 0.18, 0.22, 0.40],
        "chunks": [
            {
                "text": "Use element_filter to match scalar conditions within the same Struct element.",
                "section": "filter",
                "page": 1,
                "quality_score": 0.93,
                "has_code": True,
                "emb_list_vector": [0.21, 0.18, 0.33, 0.44],
                "emb": [0.21, 0.18, 0.33, 0.44],
            },
            {
                "text": "MATCH_LEAST checks how many elements satisfy a predicate.",
                "section": "filter",
                "page": 2,
                "quality_score": 0.88,
                "has_code": False,
                "emb_list_vector": [0.24, 0.22, 0.31, 0.39],
                "emb": [0.24, 0.22, 0.31, 0.39],
            },
        ],
    },
    {
        "doc_id": 3,
        "title": "Element-level search with offsets",
        "category": "search",
        "title_vector": [0.33, 0.11, 0.29, 0.37],
        "chunks": [
            {
                "text": "Element-level search can return the offset of the matched Struct element.",
                "section": "search",
                "page": 1,
                "quality_score": 0.95,
                "has_code": False,
                "emb_list_vector": [0.32, 0.14, 0.28, 0.41],
                "emb": [0.32, 0.14, 0.28, 0.41],
            }
        ],
    },
]

result = client.insert(
    collection_name="tech_articles",
    data=data,
)

print(result)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.util.ArrayList;
import java.util.List;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

List<JsonObject> data = new ArrayList<>();
{
    JsonObject row = new JsonObject();
    row.addProperty("doc_id", 1L);
    row.addProperty("title", "StructArray indexing patterns");
    row.addProperty("category", "index");
    row.add("title_vector", JsonParser.parseString("[0.12, 0.08, 0.32, 0.48]"));
    JsonArray chunks = new JsonArray();
    {
        JsonObject chunk = new JsonObject();
        chunk.addProperty("text", "Create one index for each vector subfield.");
        chunk.addProperty("section", "index");
        chunk.addProperty("page", 1L);
        chunk.addProperty("quality_score", 0.96);
        chunk.addProperty("has_code", false);
        chunk.add("emb_list_vector", JsonParser.parseString("[0.1, 0.2, 0.3, 0.4]"));
        chunk.add("emb", JsonParser.parseString("[0.1, 0.2, 0.3, 0.4]"));
        chunks.add(chunk);
    }
    {
        JsonObject chunk = new JsonObject();
        chunk.addProperty("text", "Use MAX_SIM metrics for EmbeddingList search.");
        chunk.addProperty("section", "index");
        chunk.addProperty("page", 2L);
        chunk.addProperty("quality_score", 0.91);
        chunk.addProperty("has_code", true);
        chunk.add("emb_list_vector", JsonParser.parseString("[0.16, 0.24, 0.35, 0.45]"));
        chunk.add("emb", JsonParser.parseString("[0.16, 0.24, 0.35, 0.45]"));
        chunks.add(chunk);
    }
    row.add("chunks", chunks);
    data.add(row);
}
{
    JsonObject row = new JsonObject();
    row.addProperty("doc_id", 2L);
    row.addProperty("title", "Filtered StructArray search");
    row.addProperty("category", "filter");
    row.add("title_vector", JsonParser.parseString("[0.2, 0.18, 0.22, 0.4]"));
    JsonArray chunks = new JsonArray();
    {
        JsonObject chunk = new JsonObject();
        chunk.addProperty("text", "Use element_filter to match scalar conditions within the same Struct element.");
        chunk.addProperty("section", "filter");
        chunk.addProperty("page", 1L);
        chunk.addProperty("quality_score", 0.93);
        chunk.addProperty("has_code", true);
        chunk.add("emb_list_vector", JsonParser.parseString("[0.21, 0.18, 0.33, 0.44]"));
        chunk.add("emb", JsonParser.parseString("[0.21, 0.18, 0.33, 0.44]"));
        chunks.add(chunk);
    }
    {
        JsonObject chunk = new JsonObject();
        chunk.addProperty("text", "MATCH_LEAST checks how many elements satisfy a predicate.");
        chunk.addProperty("section", "filter");
        chunk.addProperty("page", 2L);
        chunk.addProperty("quality_score", 0.88);
        chunk.addProperty("has_code", false);
        chunk.add("emb_list_vector", JsonParser.parseString("[0.24, 0.22, 0.31, 0.39]"));
        chunk.add("emb", JsonParser.parseString("[0.24, 0.22, 0.31, 0.39]"));
        chunks.add(chunk);
    }
    row.add("chunks", chunks);
    data.add(row);
}
{
    JsonObject row = new JsonObject();
    row.addProperty("doc_id", 3L);
    row.addProperty("title", "Element-level search with offsets");
    row.addProperty("category", "search");
    row.add("title_vector", JsonParser.parseString("[0.33, 0.11, 0.29, 0.37]"));
    JsonArray chunks = new JsonArray();
    {
        JsonObject chunk = new JsonObject();
        chunk.addProperty("text", "Element-level search can return the offset of the matched Struct element.");
        chunk.addProperty("section", "search");
        chunk.addProperty("page", 1L);
        chunk.addProperty("quality_score", 0.95);
        chunk.addProperty("has_code", false);
        chunk.add("emb_list_vector", JsonParser.parseString("[0.32, 0.14, 0.28, 0.41]"));
        chunk.add("emb", JsonParser.parseString("[0.32, 0.14, 0.28, 0.41]"));
        chunks.add(chunk);
    }
    row.add("chunks", chunks);
    data.add(row);
}

InsertResp resp = client.insert(InsertReq.builder()
        .collectionName("tech_articles")
        .data(data)
        .build());
System.out.println(resp.getInsertCnt());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "log"

    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal(err)
}

data := []map[string]any{
    map[string]any{
        "doc_id": int64(1), "title": "StructArray indexing patterns", "category": "index",
        "title_vector": []float32{0.12, 0.08, 0.32, 0.48},
        "chunks": []map[string]any{
            map[string]any{
                "text": "Create one index for each vector subfield.", "section": "index", "page": int64(1),
                "quality_score": float32(0.96), "has_code": false,
                "emb_list_vector": []float32{0.1, 0.2, 0.3, 0.4}, "emb": []float32{0.1, 0.2, 0.3, 0.4},
            },
            map[string]any{
                "text": "Use MAX_SIM metrics for EmbeddingList search.", "section": "index", "page": int64(2),
                "quality_score": float32(0.91), "has_code": true,
                "emb_list_vector": []float32{0.16, 0.24, 0.35, 0.45}, "emb": []float32{0.16, 0.24, 0.35, 0.45},
            },
        },
    },
    map[string]any{
        "doc_id": int64(2), "title": "Filtered StructArray search", "category": "filter",
        "title_vector": []float32{0.2, 0.18, 0.22, 0.4},
        "chunks": []map[string]any{
            map[string]any{
                "text": "Use element_filter to match scalar conditions within the same Struct element.", "section": "filter", "page": int64(1),
                "quality_score": float32(0.93), "has_code": true,
                "emb_list_vector": []float32{0.21, 0.18, 0.33, 0.44}, "emb": []float32{0.21, 0.18, 0.33, 0.44},
            },
            map[string]any{
                "text": "MATCH_LEAST checks how many elements satisfy a predicate.", "section": "filter", "page": int64(2),
                "quality_score": float32(0.88), "has_code": false,
                "emb_list_vector": []float32{0.24, 0.22, 0.31, 0.39}, "emb": []float32{0.24, 0.22, 0.31, 0.39},
            },
        },
    },
    map[string]any{
        "doc_id": int64(3), "title": "Element-level search with offsets", "category": "search",
        "title_vector": []float32{0.33, 0.11, 0.29, 0.37},
        "chunks": []map[string]any{
            map[string]any{
                "text": "Element-level search can return the offset of the matched Struct element.", "section": "search", "page": int64(1),
                "quality_score": float32(0.95), "has_code": false,
                "emb_list_vector": []float32{0.32, 0.14, 0.28, 0.41}, "emb": []float32{0.32, 0.14, 0.28, 0.41},
            },
        },
    },
}

rows := make([]any, 0, len(data))
for _, r := range data {
    rows = append(rows, r)
}

result, err := cli.Insert(ctx, milvusclient.NewRowBasedInsertOption("tech_articles", rows...))
if err != nil {
    fmt.Println(err.Error())
}
fmt.Printf("inserted %d rows\n", result.InsertCount)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let rows = vec![
        json!({
            "doc_id": 1,
            "title": "StructArray indexing patterns",
            "category": "index",
            "title_vector": [0.12, 0.08, 0.32, 0.48],
            "chunks": [
                {
                    "text": "Create one index for each vector subfield.",
                    "section": "index",
                    "page": 1,
                    "quality_score": 0.96,
                    "has_code": false,
                    "emb_list_vector": [0.1, 0.2, 0.3, 0.4],
                    "emb": [0.1, 0.2, 0.3, 0.4],
                },
                {
                    "text": "Use MAX_SIM metrics for EmbeddingList search.",
                    "section": "index",
                    "page": 2,
                    "quality_score": 0.91,
                    "has_code": true,
                    "emb_list_vector": [0.16, 0.24, 0.35, 0.45],
                    "emb": [0.16, 0.24, 0.35, 0.45],
                },
            ],
        }),
        json!({
            "doc_id": 2,
            "title": "Filtered StructArray search",
            "category": "filter",
            "title_vector": [0.2, 0.18, 0.22, 0.4],
            "chunks": [
                {
                    "text": "Use element_filter to match scalar conditions within the same Struct element.",
                    "section": "filter",
                    "page": 1,
                    "quality_score": 0.93,
                    "has_code": true,
                    "emb_list_vector": [0.21, 0.18, 0.33, 0.44],
                    "emb": [0.21, 0.18, 0.33, 0.44],
                },
                {
                    "text": "MATCH_LEAST checks how many elements satisfy a predicate.",
                    "section": "filter",
                    "page": 2,
                    "quality_score": 0.88,
                    "has_code": false,
                    "emb_list_vector": [0.24, 0.22, 0.31, 0.39],
                    "emb": [0.24, 0.22, 0.31, 0.39],
                },
            ],
        }),
        json!({
            "doc_id": 3,
            "title": "Element-level search with offsets",
            "category": "search",
            "title_vector": [0.33, 0.11, 0.29, 0.37],
            "chunks": [
                {
                    "text": "Element-level search can return the offset of the matched Struct element.",
                    "section": "search",
                    "page": 1,
                    "quality_score": 0.95,
                    "has_code": false,
                    "emb_list_vector": [0.32, 0.14, 0.28, 0.41],
                    "emb": [0.32, 0.14, 0.28, 0.41],
                },
            ],
        }),
    ];

    let rows = rows.into_iter().map(|r| r.as_object().cloned().unwrap()).collect::<Vec<_>>();
    let request = InsertRequest::builder()
        .collection_name("tech_articles")
        .rows(rows)
        .build()?;
    let resp = client.insert(request).await?;
    println!("insert count: {}", resp.insert_count());

    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <vector>

#include <milvus/thirdparty/nlohmann/json.hpp>
#include "milvus/MilvusClientV2.h"
#include "milvus/request/dml/InsertRequest.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

nlohmann::json rows = nlohmann::json::array({
    {
        {"doc_id", 1},
        {"title", "StructArray indexing patterns"},
        {"category", "index"},
        {"title_vector", std::vector<float>{0.12f, 0.08f, 0.32f, 0.48f}},
        {"chunks", nlohmann::json::array({
            {
                {"text", "Create one index for each vector subfield."},
                {"section", "index"},
                {"page", 1},
                {"quality_score", 0.96},
                {"has_code", false},
                {"emb_list_vector", std::vector<float>{0.1f, 0.2f, 0.3f, 0.4f}},
                {"emb", std::vector<float>{0.1f, 0.2f, 0.3f, 0.4f}},
            },
            {
                {"text", "Use MAX_SIM metrics for EmbeddingList search."},
                {"section", "index"},
                {"page", 2},
                {"quality_score", 0.91},
                {"has_code", true},
                {"emb_list_vector", std::vector<float>{0.16f, 0.24f, 0.35f, 0.45f}},
                {"emb", std::vector<float>{0.16f, 0.24f, 0.35f, 0.45f}},
            },
        })},
    },
    {
        {"doc_id", 2},
        {"title", "Filtered StructArray search"},
        {"category", "filter"},
        {"title_vector", std::vector<float>{0.2f, 0.18f, 0.22f, 0.4f}},
        {"chunks", nlohmann::json::array({
            {
                {"text", "Use element_filter to match scalar conditions within the same Struct element."},
                {"section", "filter"},
                {"page", 1},
                {"quality_score", 0.93},
                {"has_code", true},
                {"emb_list_vector", std::vector<float>{0.21f, 0.18f, 0.33f, 0.44f}},
                {"emb", std::vector<float>{0.21f, 0.18f, 0.33f, 0.44f}},
            },
            {
                {"text", "MATCH_LEAST checks how many elements satisfy a predicate."},
                {"section", "filter"},
                {"page", 2},
                {"quality_score", 0.88},
                {"has_code", false},
                {"emb_list_vector", std::vector<float>{0.24f, 0.22f, 0.31f, 0.39f}},
                {"emb", std::vector<float>{0.24f, 0.22f, 0.31f, 0.39f}},
            },
        })},
    },
    {
        {"doc_id", 3},
        {"title", "Element-level search with offsets"},
        {"category", "search"},
        {"title_vector", std::vector<float>{0.33f, 0.11f, 0.29f, 0.37f}},
        {"chunks", nlohmann::json::array({
            {
                {"text", "Element-level search can return the offset of the matched Struct element."},
                {"section", "search"},
                {"page", 1},
                {"quality_score", 0.95},
                {"has_code", false},
                {"emb_list_vector", std::vector<float>{0.32f, 0.14f, 0.28f, 0.41f}},
                {"emb", std::vector<float>{0.32f, 0.14f, 0.28f, 0.41f}},
            },
        })},
    },
});

milvus::InsertRequest request;
request.WithCollectionName("tech_articles");
for (auto& row : rows) {
    request.AddRowData(std::move(row));
}

milvus::InsertResponse response;
status = client->Insert(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const data = [
  {
    doc_id: 1, title: 'StructArray indexing patterns', category: 'index',
    title_vector: [0.12, 0.08, 0.32, 0.48],
    chunks: [
      {
        text: 'Create one index for each vector subfield.', section: 'index', page: 1,
        quality_score: 0.96, has_code: false,
        emb_list_vector: [0.1, 0.2, 0.3, 0.4], emb: [0.1, 0.2, 0.3, 0.4],
      },
      {
        text: 'Use MAX_SIM metrics for EmbeddingList search.', section: 'index', page: 2,
        quality_score: 0.91, has_code: true,
        emb_list_vector: [0.16, 0.24, 0.35, 0.45], emb: [0.16, 0.24, 0.35, 0.45],
      },
    ],
  },
  {
    doc_id: 2, title: 'Filtered StructArray search', category: 'filter',
    title_vector: [0.2, 0.18, 0.22, 0.4],
    chunks: [
      {
        text: 'Use element_filter to match scalar conditions within the same Struct element.', section: 'filter', page: 1,
        quality_score: 0.93, has_code: true,
        emb_list_vector: [0.21, 0.18, 0.33, 0.44], emb: [0.21, 0.18, 0.33, 0.44],
      },
      {
        text: 'MATCH_LEAST checks how many elements satisfy a predicate.', section: 'filter', page: 2,
        quality_score: 0.88, has_code: false,
        emb_list_vector: [0.24, 0.22, 0.31, 0.39], emb: [0.24, 0.22, 0.31, 0.39],
      },
    ],
  },
  {
    doc_id: 3, title: 'Element-level search with offsets', category: 'search',
    title_vector: [0.33, 0.11, 0.29, 0.37],
    chunks: [
      {
        text: 'Element-level search can return the offset of the matched Struct element.', section: 'search', page: 1,
        quality_score: 0.95, has_code: false,
        emb_list_vector: [0.32, 0.14, 0.28, 0.41], emb: [0.32, 0.14, 0.28, 0.41],
      },
    ],
  },
];

const res = await client.insert({
  collection_name: "tech_articles",
  data,
});
console.log(res.status.error_code, res.insert_cnt);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles",
    "data": [
        {
            "doc_id": 1,
            "title": "StructArray indexing patterns",
            "category": "index",
            "title_vector": [
                0.12,
                0.08,
                0.32,
                0.48
            ],
            "chunks": [
                {
                    "text": "Create one index for each vector subfield.",
                    "section": "index",
                    "page": 1,
                    "quality_score": 0.96,
                    "has_code": false,
                    "emb_list_vector": [
                        0.1,
                        0.2,
                        0.3,
                        0.4
                    ],
                    "emb": [
                        0.1,
                        0.2,
                        0.3,
                        0.4
                    ]
                },
                {
                    "text": "Use MAX_SIM metrics for EmbeddingList search.",
                    "section": "index",
                    "page": 2,
                    "quality_score": 0.91,
                    "has_code": true,
                    "emb_list_vector": [
                        0.16,
                        0.24,
                        0.35,
                        0.45
                    ],
                    "emb": [
                        0.16,
                        0.24,
                        0.35,
                        0.45
                    ]
                }
            ]
        },
        {
            "doc_id": 2,
            "title": "Filtered StructArray search",
            "category": "filter",
            "title_vector": [
                0.2,
                0.18,
                0.22,
                0.4
            ],
            "chunks": [
                {
                    "text": "Use element_filter to match scalar conditions within the same Struct element.",
                    "section": "filter",
                    "page": 1,
                    "quality_score": 0.93,
                    "has_code": true,
                    "emb_list_vector": [
                        0.21,
                        0.18,
                        0.33,
                        0.44
                    ],
                    "emb": [
                        0.21,
                        0.18,
                        0.33,
                        0.44
                    ]
                },
                {
                    "text": "MATCH_LEAST checks how many elements satisfy a predicate.",
                    "section": "filter",
                    "page": 2,
                    "quality_score": 0.88,
                    "has_code": false,
                    "emb_list_vector": [
                        0.24,
                        0.22,
                        0.31,
                        0.39
                    ],
                    "emb": [
                        0.24,
                        0.22,
                        0.31,
                        0.39
                    ]
                }
            ]
        },
        {
            "doc_id": 3,
            "title": "Element-level search with offsets",
            "category": "search",
            "title_vector": [
                0.33,
                0.11,
                0.29,
                0.37
            ],
            "chunks": [
                {
                    "text": "Element-level search can return the offset of the matched Struct element.",
                    "section": "search",
                    "page": 1,
                    "quality_score": 0.95,
                    "has_code": false,
                    "emb_list_vector": [
                        0.32,
                        0.14,
                        0.28,
                        0.41
                    ],
                    "emb": [
                        0.32,
                        0.14,
                        0.28,
                        0.41
                    ]
                }
            ]
        }
    ]
}'
```

</TabItem>
</Tabs>

## Insert into nullable StructArray fields\{#insert-into-nullable-structarray-fields}

If the `chunks` field is nullable, an entity can set the entire `chunks` field to null. In Python, use `None` to represent a null value.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.insert(
    collection_name="tech_articles",
    data=[
        {
            "doc_id": 10,
            "title": "Article without chunks yet",
            "category": "draft",
            "title_vector": [0.05, 0.10, 0.15, 0.20],
            "chunks": None,
        }
    ],
)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.JsonNull;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import java.util.Collections;

JsonObject row = new JsonObject();
row.addProperty("doc_id", 10L);
row.addProperty("title", "Article without chunks yet");
row.addProperty("category", "draft");
row.add("title_vector", JsonParser.parseString("[0.05, 0.10, 0.15, 0.20]"));
row.add("chunks", JsonNull.INSTANCE);

client.insert(InsertReq.builder()
        .collectionName("tech_articles")
        .data(Collections.singletonList(row))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
_, err = cli.Insert(ctx, milvusclient.NewRowBasedInsertOption("tech_articles",
    map[string]any{"doc_id": int64(10), "title": "Article without chunks yet", "category": "draft",
        "title_vector": []float32{0.05, 0.10, 0.15, 0.20}, "chunks": nil}))
if err != nil {
    fmt.Println(err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
let row = json!({
    "doc_id": 10,
    "title": "Article without chunks yet",
    "category": "draft",
    "title_vector": [0.05, 0.10, 0.15, 0.20],
    "chunks": null,
});
let request = InsertRequest::builder()
    .collection_name("tech_articles")
    .rows(vec![row.as_object().cloned().unwrap()])
    .build()?;
client.insert(request).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
nlohmann::json row = {
    {"doc_id", 10},
    {"title", "Article without chunks yet"},
    {"category", "draft"},
    {"title_vector", std::vector<float>{0.05f, 0.10f, 0.15f, 0.20f}},
    {"chunks", nullptr},
};

milvus::InsertRequest request;
request.WithCollectionName("tech_articles");
request.AddRowData(std::move(row));

milvus::InsertResponse response;
status = client->Insert(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.insert({
  collection_name: "tech_articles",
  data: [
    { doc_id: 10, title: "Article without chunks yet", category: "draft", title_vector: [0.05, 0.10, 0.15, 0.20], chunks: null },
  ],
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles",
    "data": [
        {
            "doc_id": 10,
            "title": "Article without chunks yet",
            "category": "draft",
            "title_vector": [0.05, 0.10, 0.15, 0.20],
            "chunks": null
        }
    ]
}'
```

</TabItem>
</Tabs>

When a nullable StructArray field contains a valid StructArray value, all subfields in that value should either be null or have valid values. Inserting an entity with some subfields set to null and others set to valid values results in an error.

<Admonition type="warning" title="Warning">

Nullable StructArray fields are available only in clusters compatible with Milvus v3.0.x. If you dynamically add a StructArray field to an existing collection, the added field must be nullable, and existing entities return `null` for the new field across all its subfields.

</Admonition>

## Validate inserted data\{#validate-inserted-data}

You can query the collection and return the StructArray field or selected subfields.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.load_collection("tech_articles")

rows = client.query(
    collection_name="tech_articles",
    filter="doc_id in [1, 2, 3]",
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
        "chunks[quality_score]",
    ],
)

for row in rows:
    print(row)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import io.milvus.v2.service.collection.request.LoadCollectionReq;
import java.util.Arrays;

client.loadCollection(LoadCollectionReq.builder()
        .collectionName("tech_articles")
        .build());

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("tech_articles")
        .filter("doc_id in [1, 2, 3]")
        .outputFields(Arrays.asList("doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]"))
        .build());
System.out.println(resp.getQueryResults());
```

</TabItem>

<TabItem value='go'>

```go
if _, err := cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("tech_articles")); err != nil {
    fmt.Println(err.Error())
}

rs, err := cli.Query(ctx, milvusclient.NewQueryOption("tech_articles").
    WithFilter("doc_id in [1, 2, 3]").
    WithOutputFields("doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]"))
if err != nil {
    fmt.Println(err.Error())
}
fmt.Printf("query returned %d rows\n", rs.ResultCount)
```

</TabItem>

<TabItem value='rust'>

```rust
client.load_collection(LoadCollectionRequest::builder().collection_name("tech_articles").build()?).await?;

let resp = client.query(QueryRequest::builder()
    .collection_name("tech_articles")
    .filter("doc_id in [1, 2, 3]")
    .output_fields(vec!["doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]"])
    .build()?).await?;
println!("query rows: {}", resp.results().get_output_field("doc_id").map(|f| f.len()).unwrap_or(0));
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::LoadCollectionRequest load_req;
load_req.WithCollectionName("tech_articles");
status = client->LoadCollection(load_req);
if (!status.IsOk()) { std::cout << status.Message() << std::endl; }

milvus::QueryRequest query_req;
query_req.WithCollectionName("tech_articles")
         .WithFilter("doc_id in [1, 2, 3]")
         .WithOutputFields({"doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]"});
milvus::QueryResponse query_resp;
status = client->Query(query_req, query_resp);
if (!status.IsOk()) { std::cout << status.Message() << std::endl; }
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.loadCollection({ collection_name: "tech_articles" });

const rows = await client.query({
  collection_name: "tech_articles",
  filter: "doc_id in [1, 2, 3]",
  output_fields: ["doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]"],
});
console.log(rows.data.length);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles"
}'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles",
    "filter": "doc_id in [1, 2, 3]",
    "outputFields": ["doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]"]
}' 
```

</TabItem>
</Tabs>

Use StructArray field paths, such as `chunks[text]`, only when you query, search, filter, or create indexes. Insert payloads should still use nested objects under `chunks`.

## Insert rules\{#insert-rules}

| Rule | Explanation |
| --- | --- |
| Use an array of objects for a StructArray field. | The value of `chunks` is a list, and each item in the list is a Struct element. |
| Use subfield names inside each Struct element. | Insert `{"text": "...", "emb": [...]}` inside `chunks`, not `{"chunks[text]": "..."}`. |
| Match the Struct schema. | Each Struct element must use the subfields defined in the Struct schema. |
| Match vector dimensions. | Vector values must match the `dim` configured for their vector subfields. |
| Respect `max_capacity`. | The number of Struct elements in one entity must not exceed the `max_capacity` of the StructArray field. |
| Use separate vector subfields for separate search modes. | If both EmbeddingList search and element-level search are required, write vector values to both vector subfields. |
| Use `null` only when the field is nullable. | Non-nullable StructArray fields require valid StructArray values. |

## Common mistakes\{#common-mistakes}

- Using field paths such as `chunks[text]` in insert payloads.

- Omitting required subfields from a Struct element.

- Inserting vectors with the wrong dimension.

- Inserting more Struct elements than `max_capacity` allows.

- Setting only one subfield to `null` while other subfields in the same StructArray value are valid.

- Writing vectors only to `emb_list_vector` and then trying to run element-level search on `chunks[emb]`.

- Writing vectors only to `emb` and then trying to run EmbeddingList search on `chunks[emb_list_vector]`.

## Next steps\{#next-steps}

1. To create indexes for `chunks[emb_list_vector]`, `chunks[emb]`, and scalar subfields, read [Index StructArray Fields](./index-struct-array).

1. To search StructArray vector subfields, read [Basic Vector Search with StructArray](./search-with-struct-array).

1. To review nullable behavior and version-specific limitations, read [StructArray Limits](./struct-array-limits).

