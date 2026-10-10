---
title: "StructArray を使った基本的なベクトル検索 | BYOC"
slug: /search-with-struct-array
sidebar_label: "基本的なベクトル検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行します。StructArray は 2 つの基本的なベクトル検索モードをサポートしています。各エンティティに格納された embedding list をスコアリングする EmbeddingList 検索と、各 Struct 要素を個別に検索する要素レベル検索です。 | BYOC"
type: origin
token: EDzFwzb7Sifsz4kFYZIcAF9Pn1p
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# StructArray を使った基本的なベクトル検索

このページでは、StructArray フィールド内のベクトルサブフィールドに対してベクトル検索を実行します。StructArray は 2 つの基本的なベクトル検索モード、つまり、各エンティティに格納された embedding list をスコアリングする EmbeddingList 検索と、各 Struct 要素を個別に検索する要素レベル検索をサポートしています。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` コレクションを使用します。このコレクションには `chunks` という名前の StructArray フィールドがあります。各 chunk には、テキスト、スカラーメタデータ、EmbeddingList 検索用のインデックスが付いた `emb_list_vector` という名前のベクトルサブフィールド、および要素レベル検索用のインデックスが付いた `emb` という名前のベクトルサブフィールドが含まれます。

## 事前準備\{#before-you-begin}

コレクションのスキーマ、データ、およびインデックスがすでに準備されていることを確認してください。

| 要件 | 準備する場所 |
| --- | --- |
| `chunks` などの StructArray フィールドを作成します。 | [StructArray フィールドを作成する](./create-struct-array) |
| `chunks` フィールドに Struct オブジェクトを含むエンティティを挿入します。 | [StructArray フィールドにデータを挿入する](./insert-struct-array) |
| EmbeddingList 検索用に `chunks[emb_list_vector]` に `MAX_SIM*` インデックスを作成します。 | [StructArray フィールドのインデックス作成](./index-struct-array) |
| 要素レベル検索用に `chunks[emb]` に通常のベクトルメトリクスのインデックスを作成します。 | [StructArray フィールドのインデックス作成](./index-struct-array) |

<Admonition type="warning" title="Warning">

ベクトルフィールドまたはベクトルサブフィールドは 1 つのインデックスしか受け付けません。EmbeddingList 検索と要素レベル検索の両方が必要な場合は、2 つの別々のベクトルサブフィールドを作成してください。このページでは、`chunks[emb_list_vector]` は EmbeddingList 検索用にインデックス化され、`chunks[emb]` は要素レベル検索用にインデックス化されています。

</Admonition>

## 検索モードを選択する\{#choose-a-search-mode}

| 項目 | EmbeddingList 検索 | 要素レベル検索 |
| --- | --- | --- |
| 対象サブフィールド | `chunks[emb_list_vector]` | `chunks[emb]` |
| クエリデータ | 1 つ以上のベクトルを含む embedding list。 | 通常のベクトル。 |
| メトリクスファミリー | `MAX_SIM_COSINE` などの `MAX_SIM*`。 | `COSINE`、`IP`、`L2` などの通常のベクトルメトリクス。 |
| 1 件のヒットが表すもの | StructArray のベクトルサブフィールドがクエリの embedding list に類似している、一致したエンティティ。 | StructArray フィールド内の一致した Struct 要素。 |
| 結果の粒度 | エンティティレベル。 | Struct 要素レベル。 |
| オフセット | 該当しません。 | 返される際に、一致した Struct 要素の 0 ベースの位置を示します。 |
| 代表的な用途 | ColBERT、ColPali、その他の late interaction 検索パターン。 | chunk レベル、passage レベル、clip レベル、patch レベル、fact レベルの検索。 |

## EmbeddingList 検索を実行する\{#run-embeddinglist-search}

クエリ自体が複数のベクトルを含み、対象の StructArray ベクトルサブフィールドが `MAX_SIM*` メトリクスでインデックス化されている場合は、EmbeddingList 検索を使用します。結果はエンティティレベルの一致です。

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

この検索モードでは、`limit` はクエリごとに返されるエンティティの数を制御します。出力には StructArray サブフィールドを含めることができますが、ヒット自体は特定の 1 つの Struct 要素ではなく、一致した親エンティティを表します。

<Admonition type="info" title="Notes">

ColBERT や ColPali スタイルの完全な手順については、[Embedding List で検索する](./tutorial-colbert-colpali) を参照してください。このページでは、基本的な StructArray 検索の動作のみを扱います。

</Admonition>

## 要素レベル検索を実行する\{#run-element-level-search}

各 Struct 要素が個別にベクトル検索に参加する必要がある場合は、要素レベル検索を使用します。クエリは通常のベクトルであり、対象のベクトルサブフィールドは通常のベクトルメトリクスでインデックス化されている必要があります。

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

要素レベル検索では、各ヒットは一致した Struct 要素を表します。`offset` の値は、StructArray フィールド内におけるその要素の 0 ベースの位置です。複数の Struct 要素がクエリに一致する場合は、同じエンティティが複数回現れることがあります。`limit` の値は、一意の親エンティティではなく、要素のヒットに適用されます。

## 結果を解釈する\{#interpret-results}

| 結果の項目 | EmbeddingList 検索 | 要素レベル検索 |
| --- | --- | --- |
| `id` | 一致したエンティティの主キー。 | 一致した Struct 要素を含むエンティティの主キー。 |
| `distance` またはスコア | クエリの embedding list と格納されている embedding list の間のスコアまたは距離。 | クエリベクトルと一致した Struct 要素のベクトルの間のスコアまたは距離。 |
| `offset` | 該当しません。 | 返される際の、一致した Struct 要素の 0 ベースの位置。 |
| 重複する主キー | 結果がエンティティレベルであるため、単一のクエリでは想定されません。 | 同じエンティティ内の複数の Struct 要素が一致する可能性があるため、発生する可能性があります。 |
| 要求された StructArray 出力フィールド | 一致したエンティティから返されます。 | 対象の API と SDK でサポートされる要素レベルのヒット形式で返されます。 |

## よくある間違い\{#common-mistakes}

- 必須のサブフィールドパス構文 `chunks[emb]` ではなく `chunks.emb` を使用すること。

- 通常のベクトルメトリクスでインデックス化されたベクトルサブフィールドに対して EmbeddingList クエリを使用すること。

- `MAX_SIM*` メトリクスでインデックス化されたベクトルサブフィールドに対して通常のベクトルクエリを使用すること。

- 要素レベル検索の `limit` が、その数だけ一意の親エンティティを返すと期待すること。返されるのは要素のヒットです。

- EmbeddingList 検索が特定の 1 つの要素オフセットを返すと期待すること。返されるのはエンティティレベルの一致です。

- 1 つのベクトルサブフィールドを両方の検索モードで再利用すること。各ベクトルサブフィールドは 1 つのインデックスしか受け付けないため、別々のベクトルサブフィールドを使用してください。

## 次のステップ\{#next-steps}

1. スカラー条件で要素レベル検索を制限するには、[StructArray を使用したフィルター付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. スコアまたは距離の境界で検索するには、[StructArray を使用した範囲検索](./range-search-with-struct-arrays) を参照してください。

1. 要素レベル検索の後に親エンティティごとに最大 1 件の結果を返すには、[StructArray を使ったグルーピング検索](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索を他のベクトル検索と組み合わせるには、[StructArray を使用したハイブリッド検索](./hybrid-search-with-struct-array) を参照してください。

1. サポートされているデータ型、メトリクス、フィルター、バージョン固有の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。

