---
title: "StructArray を使用した基本ベクトル検索 | Cloud"
slug: /search-with-struct-array
sidebar_label: "基本ベクトル検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行する方法について説明します。StructArray は、各エンティティに格納されたエンベディングリストをスコアリングする EmbeddingList 検索と、各 Struct 要素を個別に検索する要素レベルの検索という 2つの基本的なベクトル検索モードをサポートしています。 | Cloud"
type: origin
token: EDzFwzb7Sifsz4kFYZIcAF9Pn1p
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# StructArray を使用した基本ベクトル検索

このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行する方法について説明します。StructArray は、各エンティティに格納されたエンベディングリストをスコアリングする EmbeddingList 検索と、各 Struct 要素を個別に検索する要素レベルの検索という 2つの基本的なベクトル検索モードをサポートしています。

このページでは、[Create a StructArray Field](./create-struct-array) の `tech_articles` コレクションを使用します。このコレクションには、`chunks` という名前の StructArray フィールドがあります。各チャンクには、テキスト、スカラーメタデータ、EmbeddingList 検索用のインデックスを持つ `emb_list_vector` という名前のベクトルサブフィールド、および要素レベルの検索用のインデックスを持つ `emb` という名前のベクトルサブフィールドが含まれています。

## 事前準備\{#before-you-begin}

コレクションのスキーマ、データ、インデックスがすでに準備されていることを確認してください。

| 要件 | 準備する場所 |
| --- | --- |
| `chunks` などの StructArray フィールドを作成します。 | [Create a StructArray Field](./create-struct-array) |
| `chunks` フィールドに Struct オブジェクトが含まれるエンティティを挿入します。 | [Insert Data into StructArray Fields](./insert-struct-array) |
| EmbeddingList 検索用に `chunks[emb_list_vector]` の `MAX_SIM*` インデックスを作成します。 | [Index StructArray Fields](./index-struct-array) |
| 要素レベルの検索用に `chunks[emb]` の通常のベクトルメトリクスインデックスを作成します。 | [Index StructArray Fields](./index-struct-array) |

<Admonition type="warning" title="Warning">

ベクトルフィールドまたはベクトルサブフィールドが受け入れるインデックスは 1つだけです。EmbeddingList 検索と要素レベルの検索の両方が必要な場合は、2つのベクトルサブフィールドを別々に作成してください。このページでは、`chunks[emb_list_vector]` は EmbeddingList 検索用に、`chunks[emb]` は要素レベルの検索用にインデックスが作成されています。

</Admonition>

## 検索モードを選択する\{#choose-a-search-mode}

| 項目 | EmbeddingList 検索 | 要素レベルの検索 |
| --- | --- | --- |
| 対象サブフィールド | `chunks[emb_list_vector]` | `chunks[emb]` |
| クエリデータ | 1つ以上のベクトルを含むエンベディングリスト | 通常のベクトル |
| メトリクスファミリー | `MAX_SIM*`（`MAX_SIM_COSINE` など） | `COSINE`、`IP`、`L2` などの通常のベクトルメトリクス |
| 1 件のヒットが表す内容 | StructArray のベクトルサブフィールドがクエリのエンベディングリストに類似している一致エンティティ | StructArray フィールド内で一致した Struct 要素 |
| 結果の粒度 | エンティティレベル | Struct 要素レベル |
| オフセット | 該当なし | 返されたときに、一致した Struct 要素の 0 から始まる位置を示します。 |
| 一般的な用途 | ColBERT、ColPali などのレイトインタラクション方式の検索パターン | チャンクレベル、パッセージレベル、クリップレベル、パッチレベル、またはファクトレベルの検索 |

## EmbeddingList 検索を実行する\{#run-embeddinglist-search}

クエリ自体に複数のベクトルが含まれ、対象の StructArray ベクトルサブフィールドが `MAX_SIM*` メトリクスでインデックスされている場合は、EmbeddingList 検索を使用します。結果はエンティティレベルの一致になります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
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
Console.WriteLine(string.Join(", ", results.SingleResults.SelectMany(r => r.Scores)));
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

この検索モードでは、`limit` によってクエリごとに返されるエンティティ数を制御します。出力には StructArray サブフィールドを含めることができますが、ヒット自体は特定の Struct 要素ではなく、一致した親エンティティを表します。

<Admonition type="info" title="Notes">

ColBERT または ColPali 形式の完全なチュートリアルについては、[Search with Embedding Lists](./tutorial-colbert-colpali) を参照してください。このページでは、StructArray 検索の基本的な動作のみを説明します。

</Admonition>

## 要素レベルの検索を実行する\{#run-element-level-search}

各 Struct 要素をベクトル検索に個別に参加させる場合は、要素レベルの検索を使用します。クエリは通常のベクトルであり、対象のベクトルサブフィールドは通常のベクトルメトリクスでインデックスされている必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
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
foreach (var result in results.SingleResults)
{
    Console.WriteLine(string.Join(", ", result.Scores));
}
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

要素レベルの検索では、各ヒットが一致した Struct 要素を表します。`offset` の値は、StructArray フィールド内におけるその要素の 0 から始まる位置です。複数の Struct 要素がクエリに一致した場合、同じエンティティが複数回現れることがあります。`limit` の値は、一意の親エンティティ数ではなく、要素のヒット数に適用されます。

## 結果を解釈する\{#interpret-results}

| 結果項目 | EmbeddingList 検索 | 要素レベルの検索 |
| --- | --- | --- |
| `id` | 一致したエンティティのプライマリキーです。 | 一致した Struct 要素を含むエンティティのプライマリキーです。 |
| `distance` またはスコア | クエリのエンベディングリストと格納済みのエンベディングリストの間のスコアまたは距離です。 | クエリベクトルと一致した Struct 要素のベクトルの間のスコアまたは距離です。 |
| `offset` | 該当なし | 返されたときに、一致した Struct 要素の 0 から始まる位置です。 |
| プライマリキーの重複 | 結果はエンティティレベルであるため、単一のクエリでは想定されません。 | 同じエンティティ内の複数の Struct 要素が一致する可能性があるため、発生することがあります。 |
| 要求された StructArray 出力フィールド | 一致したエンティティから返されます。 | 対象の API と SDK でサポートされる要素レベルのヒット形式で返されます。 |

## よくある誤り\{#common-mistakes}

- 必須のサブフィールドパス構文 `chunks[emb]` ではなく、`chunks.emb` を使用している。

- 通常のベクトルメトリクスでインデックスされたベクトルサブフィールドに対して EmbeddingList クエリを使用している。

- `MAX_SIM*` メトリクスでインデックスされたベクトルサブフィールドに対して通常のベクトルクエリを使用している。

- 要素レベルの検索の `limit` が、その数だけ一意の親エンティティを返すと想定している。実際には要素のヒットが返されます。

- EmbeddingList 検索が特定の要素オフセットを返すと想定している。実際にはエンティティレベルの一致が返されます。

- 両方の検索モードで 1つのベクトルサブフィールドを再利用している。各ベクトルサブフィールドはインデックスを 1つだけ受け入れるため、ベクトルサブフィールドを別々に使用してください。

## 次のステップ\{#next-steps}

1. スカラー条件で要素レベルの検索を制限するには、[Filtered Search with StructArray](./filtered-search-with-struct-arrays) を参照してください。

1. スコアまたは距離の境界で検索するには、[Range Search with StructArray](./range-search-with-struct-arrays) を参照してください。

1. 要素レベルの検索後に親エンティティごとに最大 1件の結果を返すには、[Grouping Search with StructArray](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索を他のベクトル検索と組み合わせるには、[Hybrid Search with StructArray](./hybrid-search-with-struct-array) を参照してください。

1. サポートされているデータ型、メトリクス、フィルター、およびバージョン固有の制限を確認するには、[StructArray Limits](./struct-array-limits) を参照してください。
