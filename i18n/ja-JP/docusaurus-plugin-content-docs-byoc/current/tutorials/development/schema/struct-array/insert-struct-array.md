---
title: "StructArray フィールドにデータを挿入する | BYOC"
slug: /insert-struct-array
sidebar_label: "StructArray フィールドにデータを挿入する"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "各エンティティが順序付けられた構造化要素のリストを含む場合は、StructArray フィールドにデータを挿入します。挿入ペイロードでは、StructArray フィールドはオブジェクトの配列として表現されます。各オブジェクトは 1 つの Struct 要素を表し、コレクションスキーマで定義された Struct サブフィールド名を使用します。 | BYOC"
type: origin
token: WTPbww9GkifmAvkuRWLcVd4jnnh
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# StructArray フィールドにデータを挿入する

各エンティティが順序付けられた構造化要素のリストを含む場合は、StructArray フィールドにデータを挿入します。挿入ペイロードでは、StructArray フィールドはオブジェクトの配列として表現されます。各オブジェクトは 1 つの Struct 要素を表し、コレクションスキーマで定義された Struct サブフィールド名を使用します。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` コレクションを使用します。各エンティティは技術記事であり、`chunks` フィールドには記事のチャンクが Struct 要素として格納されます。

## 事前準備\{#before-you-begin}

コレクションスキーマにすでに `chunks` StructArray フィールドが含まれていることを確認してください。

| フィールド | 型 | 挿入する値 |
| --- | --- | --- |
| `doc_id` | `INT64` | 記事 ID。 |
| `title` | `VARCHAR` | 記事のタイトル。 |
| `category` | `VARCHAR` | 記事のカテゴリ。 |
| `title_vector` | `FLOAT_VECTOR` | 記事レベルの embedding。 |
| `chunks` | `ARRAY<STRUCT>` | チャンクオブジェクトのリスト。 |

`chunks` 内の各オブジェクトは Struct スキーマに従う必要があります。

| サブフィールド | 型 | 挿入する値 |
| --- | --- | --- |
| `text` | `VARCHAR` | チャンクのテキスト。 |
| `section` | `VARCHAR` | `index`、`search`、`filter` などのセクション名。 |
| `page` | `INT64` | ページ番号または論理的な位置。 |
| `quality_score` | `FLOAT` | チャンクレベルのスコア。 |
| `has_code` | `BOOL` | チャンクにコードが含まれているかどうか。 |
| `emb_list_vector` | `FLOAT_VECTOR` | EmbeddingList 検索用に書き込まれるベクトル。 |
| `emb` | `FLOAT_VECTOR` | 要素レベル検索用に書き込まれるベクトル。 |

<Admonition type="info" title="Notes">

挿入ペイロードでは、`chunks` は通常のフィールドであり、その値は Struct オブジェクトの配列です。各オブジェクトの内部では、`text` や `emb` などのサブフィールド名を使用します。`chunks[text]` や `chunks[emb]` などのパス構文を使用するのは、挿入後にインデックスを作成するとき、検索を実行するとき、フィルタを構築するとき、または出力フィールドを指定するときだけです。

</Admonition>

## 挿入ペイロードの形状を理解する\{#understand-the-insert-payload-shape}

`chunks` の値は Struct 要素の配列です。各要素は、キーがサブフィールド名であるオブジェクトです。

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

`emb_list_vector` と `emb` は、異なる検索モードをサポートしているため、別々のベクトルサブフィールドです。EmbeddingList 検索では、StructArray フィールド内のすべてのベクトルを 1 つの embedding list として扱い、`MAX_SIM*` メトリクスを使用してエンティティレベルの結果を返します。要素レベル検索では、各 Struct 要素を個別に検索し、一致した要素のオフセットを返すことができます。この例では、簡潔にするために両方のフィールドに同じベクトル値を格納しています。本番アプリケーションでは、2 つの検索モードが同じチャンクの embedding を使用する場合は両方のサブフィールドに同じ embedding を格納でき、2 つの検索モードが異なる表現を使用する場合は異なる embedding を格納できます。

## 行を挿入する\{#insert-rows}

StructArray 値を含む行を挿入するには、`client.insert()` を使用します。

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

## nullable な StructArray フィールドに挿入する\{#insert-into-nullable-structarray-fields}

`chunks` フィールドが nullable の場合、エンティティは `chunks` フィールド全体を null に設定できます。Python では、null 値を表すために `None` を使用します。

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

nullable な StructArray フィールドに有効な StructArray 値が含まれる場合、その値内のすべてのサブフィールドは null であるか、有効な値を持つ必要があります。一部のサブフィールドを null に設定し、他のサブフィールドを有効な値に設定したエンティティを挿入すると、エラーになります。

<Admonition type="warning" title="Warning">

nullable な StructArray フィールドは、Milvus v3.0.x と互換性のあるクラスターでのみ使用できます。既存のコレクションに StructArray フィールドを動的に追加する場合、追加するフィールドは nullable である必要があり、既存のエンティティは、新しいフィールドのすべてのサブフィールドに対して `null` を返します。

</Admonition>

## 挿入したデータを検証する\{#validate-inserted-data}

コレクションをクエリして、StructArray フィールドまたは選択したサブフィールドを返すことができます。

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

`chunks[text]` などの StructArray フィールドパスを使用するのは、クエリ、検索、フィルタ、またはインデックスを作成するときだけです。挿入ペイロードでは、引き続き `chunks` の下にネストされたオブジェクトを使用する必要があります。

## 挿入ルール\{#insert-rules}

| ルール | 説明 |
| --- | --- |
| StructArray フィールドにはオブジェクトの配列を使用します。 | `chunks` の値はリストであり、リスト内の各項目は Struct 要素です。 |
| 各 Struct 要素の内部ではサブフィールド名を使用します。 | `chunks` の内部には `{"chunks[text]": "..."}` ではなく `{"text": "...", "emb": [...]}` を挿入します。 |
| Struct スキーマに一致させます。 | 各 Struct 要素は、Struct スキーマで定義されたサブフィールドを使用する必要があります。 |
| ベクトル次元を一致させます。 | ベクトル値は、それぞれのベクトルサブフィールドに設定された `dim` と一致する必要があります。 |
| `max_capacity` を守ります。 | 1 つのエンティティ内の Struct 要素数は、StructArray フィールドの `max_capacity` を超えてはなりません。 |
| 検索モードごとに別々のベクトルサブフィールドを使用します。 | EmbeddingList 検索と要素レベル検索の両方が必要な場合は、両方のベクトルサブフィールドにベクトル値を書き込みます。 |
| `null` はフィールドが nullable の場合にのみ使用します。 | non-nullable な StructArray フィールドには、有効な StructArray 値が必要です。 |

## よくある間違い\{#common-mistakes}

- 挿入ペイロードで `chunks[text]` などのフィールドパスを使用する。

- Struct 要素から必須のサブフィールドを省略する。

- 次元が誤ったベクトルを挿入する。

- `max_capacity` が許可する数を超える Struct 要素を挿入する。

- 同じ StructArray 値内の他のサブフィールドが有効であるのに、1 つのサブフィールドだけを `null` に設定する。

- `emb_list_vector` にのみベクトルを書き込み、その後 `chunks[emb]` に対して要素レベル検索を実行しようとする。

- `emb` にのみベクトルを書き込み、その後 `chunks[emb_list_vector]` に対して EmbeddingList 検索を実行しようとする。

## 次のステップ\{#next-steps}

1. `chunks[emb_list_vector]`、`chunks[emb]`、およびスカラーサブフィールドのインデックスを作成するには、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

1. StructArray のベクトルサブフィールドを検索するには、[StructArray を使った基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. nullable の動作とバージョン固有の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。

