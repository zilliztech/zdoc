---
title: "StructArray による基本的なベクトル検索 | BYOC"
slug: /search-with-struct-array
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行する方法を説明します。StructArray は、2 つの基本的なベクトル検索モードをサポートしています。1 つは EmbeddingList 検索で、各エンティティに格納されている埋め込みリストをスコアリングします。もう 1 つは要素レベルの検索で、各 Struct 要素を個別に検索します。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-search-with-struct-array
sidebar_label: "基本的なベクトル検索"
sidebar_position: 1
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/search-query-get/basic-vector-search-with-structarray.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# StructArray による基本的なベクトル検索

このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行する方法を説明します。StructArray は、2 つの基本的なベクトル検索モードをサポートしています。1 つは EmbeddingList 検索で、各エンティティに格納されている埋め込みリストをスコアリングします。もう 1 つは要素レベルの検索で、各 Struct 要素を個別に検索します。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` コレクションを使用します。このコレクションには、`chunks` という名前の StructArray フィールドがあります。各チャンクには、テキスト、スカラーメタデータ、EmbeddingList 検索用のインデックスを持つ `emb_list_vector` という名前のベクトルサブフィールド、および要素レベルの検索用のインデックスを持つ `emb` という名前のベクトルサブフィールドが含まれています。

## 事前準備\{#before-you-begin}

コレクションのスキーマ、データ、インデックスが事前に準備されていることを確認してください。サンプルのベクトルは 4 次元です。各検索例では、クライアントを初期化し、検索を実行する前に `tech_articles` がロードされるのを待機します。cURL の場合は、ロード状態のレスポンスを確認するために `jq` をインストールしてください。

| 要件 | 準備場所 |
| --- | --- |
| `chunks` などの StructArray フィールドを作成します。 | [StructArray フィールドを作成する](./create-struct-array) |
| `chunks` フィールドに Struct オブジェクトを含むエンティティを挿入します。 | [StructArray フィールドにデータを挿入する](./insert-struct-array) |
| `MAX_SIM*` インデックスを EmbeddingList 検索用に `chunks[emb_list_vector]` に作成します。 | [StructArray フィールドにインデックスを作成する](./index-struct-array) |
| 要素レベルの検索用に `chunks[emb]` に通常のベクトルメトリクスのインデックスを作成します。 | [StructArray フィールドにインデックスを作成する](./index-struct-array) |

<Admonition type="info" icon="📘" title="Notes">

警告

ベクトルフィールドまたはベクトルサブフィールドに設定できるインデックスは 1 つだけです。EmbeddingList 検索と要素レベルの検索の両方が必要な場合は、2 つの別々のベクトルサブフィールドを作成してください。このページでは、`chunks[emb_list_vector]` は EmbeddingList 検索用にインデックスが作成され、`chunks[emb]` は要素レベルの検索用にインデックスが作成されています。

</Admonition>

## 検索モードを選択する\{#choose-a-search-mode}

| 項目 | EmbeddingList 検索 | 要素レベルの検索 |
| --- | --- | --- |
| 対象サブフィールド | `chunks[emb_list_vector]` | `chunks[emb]` |
| クエリデータ | 1 つ以上のベクトルを含む埋め込みリスト。 | 通常のベクトル。 |
| メトリクスファミリー | `MAX_SIM*`（`MAX_SIM_COSINE` など）。 | `COSINE`、`IP`、`L2` などの通常のベクトルメトリクス。 |
| 1 件のヒットが表すもの | StructArray のベクトルサブフィールドがクエリの埋め込みリストに類似している、一致したエンティティ。 | StructArray フィールド内の一致した Struct 要素。 |
| 結果の粒度 | エンティティレベル。 | Struct 要素レベル。 |
| オフセット | 該当しません。 | 返される際の、一致した Struct 要素の 0 から始まる位置を示します。 |
| 一般的な用途 | ColBERT、ColPali、その他の late-interaction 検索パターン。 | チャンクレベル、パッセージレベル、クリップレベル、パッチレベル、またはファクトレベルの検索。 |

## EmbeddingList 検索を実行する\{#run-embeddinglist-search}

クエリ自体が複数のベクトルを含み、対象の StructArray ベクトルサブフィールドが `MAX_SIM*` メトリクスでインデックス付けされている場合は、EmbeddingList 検索を使用します。結果はエンティティレベルの一致となります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
from pymilvus.client.embedding_list import EmbeddingList

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.load_collection(collection_name="tech_articles")

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
        print(hit["doc_id"], hit["distance"], hit["entity"])
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.LoadCollectionReq;
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

client.loadCollection(LoadCollectionReq.builder()
        .collectionName("tech_articles")
        .build());

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
    panic(err)
}

loadTask, err := cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("tech_articles"))
if err != nil {
    panic(err)
}
if err := loadTask.Await(ctx); err != nil {
    panic(err)
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
    panic(err)
}

for _, result := range results {
    for i := 0; i < result.ResultCount; i++ {
        id, err := result.IDs.Get(i)
        if err != nil { panic(err) }
        fmt.Println(id, result.Scores[i])
        for _, field := range result.Fields {
            value, err := field.Get(i)
            if err != nil { panic(err) }
            fmt.Println(field.Name(), value)
        }
    }
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

client.load_collection(LoadCollectionRequest::builder()
    .collection_name("tech_articles")
    .sync(true)
    .build()?).await?;

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
```

</TabItem>

<TabItem value='c++'>

```c++
#include <stdexcept>
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}

status = client->LoadCollection(milvus::LoadCollectionRequest()
    .WithCollectionName("tech_articles").WithSync(true));
if (!status.IsOk()) { throw std::runtime_error(status.Message()); }

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
    throw std::runtime_error(status.Message());
}

for (auto& result : response.Results().Results()) {
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    if (!status.IsOk()) { throw std::runtime_error(status.Message()); }
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

await client.loadCollection({ collection_name: "tech_articles" });

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

<TabItem value='csharp'>

```csharp
using System;
using System.Linq;
using System.Text.Json;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Responses.Dql;
using Milvus.Client.V2.Types;

var client = new MilvusClientV2(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});
await client.ConnectAsync();

await client.LoadCollectionAsync(new LoadCollectionReq
{
    CollectionName = "tech_articles",
    Sync = true
});

var query = new EmbeddingList();
query.Add(new ReadOnlyMemory<float>(new[] { 0.12f, 0.21f, 0.32f, 0.44f }));
query.Add(new ReadOnlyMemory<float>(new[] { 0.18f, 0.23f, 0.29f, 0.36f }));

SearchResp results = await client.SearchAsync(new SearchReq
{
    CollectionName = "tech_articles",
    VectorFieldName = "chunks[emb_list_vector]",
    EmbeddingLists = new[] { query },
    Limit = 3,
    Parameters = new SearchParameters
    {
        OutputFields = { "doc_id", "title", "category", "chunks[text]", "chunks[section]" }
    }
});
foreach (var result in results.SingleResults!)
{
    for (int i = 0; i < result.Scores.Count; i++)
        Console.WriteLine(JsonSerializer.Serialize(result.GetRow(i)));
}
```

</TabItem>

<TabItem value='bash'>

```bash
set -euo pipefail

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --fail-with-body --silent --show-error --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data-raw '{"collectionName":"tech_articles"}' | jq -e '.code == 0' >/dev/null

loaded=false
for attempt in $(seq 1 60); do
  state=$(curl --fail-with-body --silent --show-error --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/get_load_state" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    --data-raw '{"collectionName":"tech_articles"}' | jq -er 'if .code == 0 then .data.loadState else error("load-state request failed") end')
  if [ "$state" = "LoadStateLoaded" ]; then
    loaded=true
    break
  fi
  sleep 1
done
[ "$loaded" = true ] || { echo "Collection did not finish loading" >&2; exit 1; }

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

この検索モードでは、`limit` はクエリごとに返されるエンティティの数を制御します。出力には StructArray サブフィールドを含めることができますが、ヒット自体は特定の Struct 要素ではなく、一致した親エンティティを表します。

<Admonition type="info" icon="📘" title="Notes">

ColBERT または ColPali スタイルの完全なチュートリアルについては、[Embedding List を使用した検索](./tutorial-colbert-colpali) を参照してください。このページでは、StructArray の基本的な検索動作についてのみ説明します。

</Admonition>

## 要素レベルの検索を実行する\{#run-element-level-search}

各 Struct 要素を個別にベクトル検索に参加させる場合は、要素レベルの検索を使用します。クエリは通常のベクトルであり、対象のベクトルサブフィールドは通常のベクトルメトリクスでインデックス付けされている必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.load_collection(collection_name="tech_articles")

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
            "doc_id:", hit["doc_id"],
            "distance:", hit["distance"],
            "offset:", hit.get("offset"),
            "entity:", hit["entity"],
        )
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.LoadCollectionReq;
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

client.loadCollection(LoadCollectionReq.builder()
        .collectionName("tech_articles")
        .build());

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
    panic(err)
}

loadTask, err := cli.LoadCollection(ctx, milvusclient.NewLoadCollectionOption("tech_articles"))
if err != nil {
    panic(err)
}
if err := loadTask.Await(ctx); err != nil {
    panic(err)
}

// Go client/v3.0.0 does not expose element offsets in ResultSet.
results, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "tech_articles",
    5,
    []entity.Vector{entity.FloatVector{0.19, 0.24, 0.30, 0.37}},
).WithANNSField("chunks[emb]").WithOutputFields("doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]"))
if err != nil {
    panic(err)
}

for _, result := range results {
    for i := 0; i < result.ResultCount; i++ {
        id, err := result.IDs.Get(i)
        if err != nil { panic(err) }
        fmt.Println("doc_id:", id, "distance:", result.Scores[i])
        for _, field := range result.Fields {
            value, err := field.Get(i)
            if err != nil { panic(err) }
            fmt.Println(field.Name(), value)
        }
    }
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

client.load_collection(LoadCollectionRequest::builder()
    .collection_name("tech_articles")
    .sync(true)
    .build()?).await?;

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
```

</TabItem>

<TabItem value='c++'>

```c++
#include <stdexcept>
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}

status = client->LoadCollection(milvus::LoadCollectionRequest()
    .WithCollectionName("tech_articles").WithSync(true));
if (!status.IsOk()) { throw std::runtime_error(status.Message()); }

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
    throw std::runtime_error(status.Message());
}

for (auto& result : response.Results().Results()) {
    milvus::EntityRows output_rows;
    status = result.OutputRows(output_rows);
    if (!status.IsOk()) { throw std::runtime_error(status.Message()); }
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

await client.loadCollection({ collection_name: "tech_articles" });

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

<TabItem value='csharp'>

```csharp
using System;
using System.Linq;
using System.Text.Json;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Responses.Dql;
using Milvus.Client.V2.Types;

var client = new MilvusClientV2(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});
await client.ConnectAsync();

await client.LoadCollectionAsync(new LoadCollectionReq
{
    CollectionName = "tech_articles",
    Sync = true
});

var queryVector = new ReadOnlyMemory<float>(new[] { 0.19f, 0.24f, 0.30f, 0.37f });

SearchResp results = await client.SearchAsync(new SearchReq
{
    CollectionName = "tech_articles",
    VectorFieldName = "chunks[emb]",
    Vectors = new[] { queryVector },
    Limit = 5,
    Parameters = new SearchParameters
    {
        OutputFields = { "doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]" }
    }
});
foreach (var result in results.SingleResults!)
{
    for (int i = 0; i < result.Scores.Count; i++)
        Console.WriteLine(JsonSerializer.Serialize(result.GetRow(i)));
}
// One query: ElementIndices aligns with its hit order.
Console.WriteLine(JsonSerializer.Serialize(results.ElementIndices));
```

</TabItem>

<TabItem value='bash'>

```bash
set -euo pipefail

export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --fail-with-body --silent --show-error --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data-raw '{"collectionName":"tech_articles"}' | jq -e '.code == 0' >/dev/null

loaded=false
for attempt in $(seq 1 60); do
  state=$(curl --fail-with-body --silent --show-error --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/get_load_state" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    --data-raw '{"collectionName":"tech_articles"}' | jq -er 'if .code == 0 then .data.loadState else error("load-state request failed") end')
  if [ "$state" = "LoadStateLoaded" ]; then
    loaded=true
    break
  fi
  sleep 1
done
[ "$loaded" = true ] || { echo "Collection did not finish loading" >&2; exit 1; }

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

要素レベルの検索では、各ヒットが一致した Struct 要素を表します。`offset` 値は、StructArray フィールド内におけるその要素の 0 から始まる位置です。複数の Struct 要素がクエリに一致する場合、同じエンティティが複数回現れることがあります。`limit` 値は、一意の親エンティティではなく、要素のヒットに適用されます。

## 結果を解釈する\{#interpret-results}

| 結果項目 | EmbeddingList 検索 | 要素レベルの検索 |
| --- | --- | --- |
| 主キー（このスキーマの `doc_id`） | 一致したエンティティの主キー。 | 一致した Struct 要素を含むエンティティの主キー。 |
| `distance` またはスコア | クエリの埋め込みリストと格納されている埋め込みリストの間のスコアまたは距離。 | クエリベクトルと一致した Struct 要素のベクトルの間のスコアまたは距離。 |
| `offset` | 該当しません。 | 返される際の、一致した Struct 要素の 0 から始まる位置。 |
| 主キーの重複 | 結果はエンティティレベルであるため、単一のクエリでは想定されません。 | 同じエンティティ内の複数の Struct 要素が一致する可能性があるため、発生する可能性があります。 |
| 要求された StructArray 出力フィールド | 一致したエンティティから返されます。 | 対象の API と SDK がサポートする要素レベルのヒット形式で返されます。 |

Python の例では PyMilvus 3.0.2 を使用し、主キーにはスキーマ名 `doc_id` でアクセスします。結果のアクセサーは SDK によって異なります。Go client/v3.0.0 では、`ResultSet` に要素のオフセットが公開されません。その他の例では、SDK がサポートする結果インターフェースを通じてのみオフセットを表示します。

## よくある間違い\{#common-mistakes}

- `chunks.emb` を必須のサブフィールドパス構文 `chunks[emb]` の代わりに使用しています。

- 通常のベクトルメトリクスでインデックス付けされたベクトルサブフィールドに対して EmbeddingList クエリを使用しています。

- `MAX_SIM*` メトリクスでインデックス付けされたベクトルサブフィールドに対して通常のベクトルクエリを使用しています。

- 要素レベルの検索の `limit` が、その数だけ一意の親エンティティを返すことを期待しています。実際には要素のヒットを返します。

- EmbeddingList 検索が特定の要素オフセットを返すことを期待しています。実際にはエンティティレベルの一致を返します。

- 両方の検索モードで 1 つのベクトルサブフィールドを再利用しています。各ベクトルサブフィールドに設定できるインデックスは 1 つだけなので、別々のベクトルサブフィールドを使用してください。

## 次のステップ\{#next-steps}

1. スカラー条件で要素レベルの検索を絞り込むには、[StructArray でのフィルター検索](./filtered-search-with-struct-arrays) を参照してください。

2. スコアまたは距離の境界で検索するには、[StructArray での範囲検索](./range-search-with-struct-arrays) を参照してください。

3. 要素レベルの検索後に親エンティティごとに最大 1 件の結果を返すには、[StructArray でのグループ化検索](./grouping-search-with-struct-array) を参照してください。

4. StructArray 検索を他のベクトル検索と組み合わせるには、[StructArray でのハイブリッド検索](./hybrid-search-with-struct-array) を参照してください。

5. サポートされているデータ型、メトリクス、フィルター、バージョン固有の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。
