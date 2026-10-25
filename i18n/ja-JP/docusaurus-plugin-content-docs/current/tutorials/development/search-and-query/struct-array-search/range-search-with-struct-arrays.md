---
title: "StructArray での範囲検索 | Cloud"
slug: /range-search-with-struct-arrays
sidebar_label: "範囲検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray のベクトルサブフィールドに対して範囲検索を実行する方法について説明します。範囲検索は、スコアまたは距離が指定された境界内にあるベクトルヒットを返します。StructArray フィールドでは、各 Struct 要素を個別に検索する要素レベルのベクトル検索と組み合わせて範囲検索を使用します。 | Cloud"
type: origin
token: ZR1bwJFFSio2jkkabd7c1YAYncf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# StructArray での範囲検索

このページでは、StructArray のベクトルサブフィールドに対して範囲検索を実行する方法について説明します。範囲検索は、スコアまたは距離が指定された境界内にあるベクトルヒットを返します。StructArray フィールドでは、各 Struct 要素を個別に検索する要素レベルのベクトル検索と組み合わせて範囲検索を使用します。

このページでは、[StructArray フィールドを作成する](./create-struct-array) で作成した `tech_articles` コレクションを使用します。このコレクションには、`chunks` という名前の StructArray フィールドがあります。`chunks[emb]` ベクトルサブフィールドには、`COSINE`、`IP`、`L2` などの通常のベクトルメトリクスを使用した要素レベル検索用のインデックスが作成されています。

## StructArray に範囲検索を適用する方法\{#how-range-search-applies-to-structarray}

| 検索モード | 範囲検索の動作 | 結果の粒度 |
| --- | --- | --- |
| EmbeddingList 検索 | サポートされていません。 | 該当なし。 |
| 要素レベル検索 | `radius` を使用した通常のベクトルクエリと、必要に応じて `range_filter` を使用します。 | Struct 要素レベル。 |
| ハイブリッド検索 | StructArray リクエストが要素レベルのベクトルフィールドを対象とする場合にサポートされます。EmbeddingList レベルのリクエストでは、範囲検索はサポートされていません。 | 要素レベルのサブ検索の後、ハイブリッド再ランキング。 |

<Admonition type="info" title="Notes">

最も近い Struct 要素のみが必要な場合は、[StructArray での基本的なベクトル検索](./search-with-struct-array) から始めてください。範囲検索は、top-K ランキングだけでなく、スコアまたは距離の境界を結果が満たす必要がある場合に使用します。

</Admonition>

## 事前準備\{#before-you-begin}

範囲検索を実行する前に、コレクション、データ、インデックスを準備してください。

| 要件 | 詳細 |
| --- | --- |
| StructArray フィールド | コレクションに `chunks` などの StructArray フィールドが含まれています。 |
| 要素レベルのベクトルサブフィールド | 対象のベクトルサブフィールドは `chunks[emb]` であり、`chunks[emb_list_vector]` ではありません。 |
| インデックスのメトリクス | ベクトルサブフィールドには、`COSINE`、`IP`、`L2` などの通常のベクトルメトリクスでインデックスが作成されています。 |
| クエリデータ | クエリは通常のベクトルであり、`EmbeddingList` ではありません。 |

インデックスの設定については、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

## radius と range_filter を使用する\{#use-radius-and-rangefilter}

検索境界を定義するには、`radius` を設定します。内側の境界も必要な場合は、`range_filter` を設定します。方向は、小さい距離が適切か、大きい類似度スコアが適切かによって異なります。

| メトリクスタイプ | スコアが高いほど適切ですか？ | `range_filter` を使用する場合の範囲条件 |
| --- | --- | --- |
| `L2` | いいえ。距離が小さいほど適切です。 | `range_filter <= distance < radius` |
| `IP`, `COSINE` | はい。スコアが大きいほど適切です。 | `radius < distance <= range_filter` |

`radius` のみを設定した場合、範囲検索はメトリクスの外側の境界を満たすヒットを返します。埋め込みのスコアまたは距離のスケールに応じて値を選択してください。

## 要素レベルの範囲検索を実行する\{#run-element-level-range-search}

次の例では、`chunks[emb]` ベクトルがクエリベクトルに十分類似している個々のチャンクを検索します。各結果ヒットは、一致した Struct 要素を表します。

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
    search_params={
        "params": {
            "radius": 0.80,
            "range_filter": 0.95,
        },
    },
    limit=10,
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
            "doc_id:", hit["id"],
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

FloatVec queryVector = new FloatVec(new float[]{0.19f, 0.24f, 0.30f, 0.37f});
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("radius", 0.80);
extraParams.put("range_filter", 0.95);

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("tech_articles")
        .data(Collections.singletonList(queryVector))
        .annsField("chunks[emb]")
        .searchParams(extraParams)
        .limit(10)
        .outputFields(Arrays.asList("doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
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

queryVector := entity.FloatVector{0.19, 0.24, 0.30, 0.37}

annParam := index.NewCustomAnnParam()
annParam.WithRadius(0.80)
annParam.WithRangeFilter(0.95)

results, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "tech_articles",
    10,
    []entity.Vector{queryVector},
).WithANNSField("chunks[emb]").
    WithAnnParam(annParam).
    WithOutputFields("doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]"))
if err != nil {
    fmt.Println(err)
    return
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
            .radius(0.80)
            .range_filter(0.95)
            .limit(10)
            .output_fields(["doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]"])
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

auto request = milvus::SearchRequest()
                   .WithCollectionName("tech_articles")
                   .WithLimit(10)
                   .WithAnnsField("chunks[emb]")
                   .WithFloatVectors({{0.19, 0.24, 0.30, 0.37}})
                   .WithRadius(0.80)
                   .WithRangeFilter(0.95)
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
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

const queryVector = [0.19, 0.24, 0.30, 0.37];

const results = await client.search({
  collection_name: "tech_articles",
  data: queryVector,
  anns_field: "chunks[emb]",
  params: {
    radius: 0.80,
    range_filter: 0.95,
  },
  limit: 10,
  output_fields: [
    "doc_id",
    "title",
    "chunks[text]",
    "chunks[section]",
    "chunks[page]",
    "chunks[quality_score]",
  ],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Responses.Dql;
using Milvus.Client.V2.Types;

MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    Username = "root",
    Password = "Milvus"
});

float[] queryVector = [0.19f, 0.24f, 0.30f, 0.37f];

SearchResp results = await client.SearchAsync(new SearchReq
{
    CollectionName = "tech_articles",
    VectorFieldName = "chunks[emb]",
    Vectors = [queryVector],
    Limit = 10,
    Parameters = new SearchParameters
    {
        Radius = "0.80",
        RangeFilter = "0.95",
        OutputFields = { "doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]" }
    }
});
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
    "limit": 10,
    "outputFields": [
      "doc_id",
      "title",
      "chunks[text]",
      "chunks[section]",
      "chunks[page]",
      "chunks[quality_score]"
    ],
    "searchParams": {
      "params": {
        "radius": 0.80,
        "range_filter": 0.95
      }
    }
  }'
```

</TabItem>
</Tabs>

この例では、`COSINE` は類似度スタイルのメトリクスであるため、結果の範囲は `radius` より大きく、`range_filter` 以下になります。返される `offset` 値は、`chunks` 配列内の一致した Struct 要素を識別します。

## スカラーフィルターを追加する\{#add-scalar-filters}

要素レベルの範囲検索を StructArray のスカラーフィルタリングと組み合わせることができます。親エンティティのフィールドにはトップレベルの述語を使用し、`element_filter` を使用してベクトル範囲検索に参加する Struct 要素を制限します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

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
    search_params={
        "params": {
            "radius": 0.80,
            "range_filter": 0.95,
        },
    },
    filter=filter_expr,
    limit=10,
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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

FloatVec queryVector = new FloatVec(new float[]{0.19f, 0.24f, 0.30f, 0.37f});
Map<String, Object> extraParams = new HashMap<>();
extraParams.put("radius", 0.80);
extraParams.put("range_filter", 0.95);

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("tech_articles")
        .data(Collections.singletonList(queryVector))
        .annsField("chunks[emb]")
        .searchParams(extraParams)
        .filter("category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9)")
        .limit(10)
        .outputFields(Arrays.asList("doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
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

queryVector := entity.FloatVector{0.19, 0.24, 0.30, 0.37}

annParam := index.NewCustomAnnParam()
annParam.WithRadius(0.80)
annParam.WithRangeFilter(0.95)

filterExpr := "category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9)"

results, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "tech_articles",
    10,
    []entity.Vector{queryVector},
).WithANNSField("chunks[emb]").
    WithAnnParam(annParam).
    WithFilter(filterExpr).
    WithOutputFields("doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"))
if err != nil {
    fmt.Println(err)
    return
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let query_vector = vec![0.19, 0.24, 0.30, 0.37];

let filter_expr = "category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9)";

let response = client
    .search(
        SearchRequest::builder()
            .collection_name("tech_articles")
            .vector_field("chunks[emb]")
            .vectors(SearchVectors::Float(vec![query_vector]))
            .radius(0.80)
            .range_filter(0.95)
            .filter(filter_expr)
            .limit(10)
            .output_fields(["doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"])
            .build()?,
    )
    .await?;
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
                   .WithLimit(10)
                   .WithAnnsField("chunks[emb]")
                   .WithFloatVectors({{0.19, 0.24, 0.30, 0.37}})
                   .WithRadius(0.80)
                   .WithRangeFilter(0.95)
                   .WithFilter("category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9)")
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
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

const queryVector = [0.19, 0.24, 0.30, 0.37];

const filterExpr = 'category == "search" && element_filter(chunks, $[section] == "index" && $[quality_score] > 0.9)';

const results = await client.search({
  collection_name: "tech_articles",
  data: queryVector,
  anns_field: "chunks[emb]",
  params: {
    radius: 0.80,
    range_filter: 0.95,
  },
  filter: filterExpr,
  limit: 10,
  output_fields: [
    "doc_id",
    "title",
    "category",
    "chunks[text]",
    "chunks[section]",
    "chunks[quality_score]",
  ],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Responses.Dql;
using Milvus.Client.V2.Types;

MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    Username = "root",
    Password = "Milvus"
});

float[] queryVector = [0.19f, 0.24f, 0.30f, 0.37f];

string filterExpr = "category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9)";

SearchResp results = await client.SearchAsync(new SearchReq
{
    CollectionName = "tech_articles",
    VectorFieldName = "chunks[emb]",
    Vectors = [queryVector],
    Limit = 10,
    Parameters = new SearchParameters
    {
        Radius = "0.80",
        RangeFilter = "0.95",
        Expression = filterExpr,
        OutputFields = { "doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]" }
    }
});
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
    "filter": "category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9)",
    "limit": 10,
    "outputFields": [
      "doc_id",
      "title",
      "category",
      "chunks[text]",
      "chunks[section]",
      "chunks[quality_score]"
    ],
    "searchParams": {
      "params": {
        "radius": 0.80,
        "range_filter": 0.95
      }
    }
  }'
```

</TabItem>
</Tabs>

トップレベルの述語は候補エンティティを選択します。`element_filter` 述語は、ベクトル範囲検索を一致する Struct 要素に制限します。フィルタリングのその他の例については、[StructArray でのフィルター検索](./filtered-search-with-struct-arrays) を参照してください。

## ハイブリッド検索で範囲検索を使用する\{#use-range-search-in-hybrid-search}

StructArray の要素レベルのベクトルフィールドは、ハイブリッド検索での範囲検索をサポートしています。`radius` と、必要に応じて `range_filter` を、StructArray の要素レベルのベクトルフィールドを対象とする `AnnSearchRequest` に追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, AnnSearchRequest, RRFRanker

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

query_vector = [0.19, 0.24, 0.30, 0.37]

title_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="title_vector",
    param={},
    limit=10,
)

chunk_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="chunks[emb]",
    param={
        "params": {
            "radius": 0.80,
            "range_filter": 0.95,
        },
    },
    limit=10,
    expr='element_filter(chunks, $[section] == "index")',
)

results = client.hybrid_search(
    collection_name="tech_articles",
    reqs=[title_req, chunk_req],
    ranker=RRFRanker(),
    limit=5,
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
        "chunks[quality_score]",
    ],
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.request.ranker.RRFRanker;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

FloatVec queryVector = new FloatVec(new float[]{0.19f, 0.24f, 0.30f, 0.37f});

AnnSearchReq titleReq = AnnSearchReq.builder()
        .vectorFieldName("title_vector")
        .vectors(Collections.singletonList(queryVector))
        .limit(10)
        .build();

AnnSearchReq chunkReq = AnnSearchReq.builder()
        .vectorFieldName("chunks[emb]")
        .vectors(Collections.singletonList(queryVector))
        .params("{\"radius\": 0.80, \"range_filter\": 0.95}")
        .limit(10)
        .expr("element_filter(chunks, $[section] == \"index\")")
        .build();

SearchResp resp = client.hybridSearch(HybridSearchReq.builder()
        .collectionName("tech_articles")
        .searchRequests(Arrays.asList(titleReq, chunkReq))
        .ranker(RRFRanker.builder().k(60).build())
        .limit(5)
        .outFields(Arrays.asList("doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
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

queryVector := entity.FloatVector{0.19, 0.24, 0.30, 0.37}

titleReq := milvusclient.NewAnnRequest("title_vector", 10, queryVector)

annParam := index.NewCustomAnnParam()
annParam.WithRadius(0.80)
annParam.WithRangeFilter(0.95)

chunkReq := milvusclient.NewAnnRequest("chunks[emb]", 10, queryVector)
chunkReq.WithAnnParam(annParam)
chunkReq.WithFilter("element_filter(chunks, $[section] == \"index\")")

results, err := cli.HybridSearch(ctx, milvusclient.NewHybridSearchOption(
    "tech_articles",
    5,
    titleReq,
    chunkReq,
).WithReranker(milvusclient.NewRRFReranker()).
    WithOutputFields("doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]"))
if err != nil {
    fmt.Println(err)
    return
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let query_vector = vec![0.19, 0.24, 0.30, 0.37];

let title_req = SubSearchRequest::builder()
    .vector_field("title_vector")
    .vectors(SearchVectors::Float(vec![query_vector.clone()]))
    .limit(10)
    .build()?;

let chunk_req = SubSearchRequest::builder()
    .vector_field("chunks[emb]")
    .vectors(SearchVectors::Float(vec![query_vector]))
    .radius(0.80)
    .range_filter(0.95)
    .filter("element_filter(chunks, $[section] == \"index\")")
    .limit(10)
    .build()?;

let response = client
    .hybrid_search(
        HybridSearchRequest::builder()
            .collection_name("tech_articles")
            .sub_requests(vec![title_req, chunk_req])
            .rerank(RRFRerank::new().k(60))
            .limit(5)
            .output_fields(vec!["doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <memory>
#include <vector>
#include "milvus/MilvusClientV2.h"
#include "milvus/request/dql/HybridSearchRequest.h"
#include "milvus/types/SubSearchRequest.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::vector<float> query_vector = {0.19f, 0.24f, 0.30f, 0.37f};

auto title_req = std::make_shared<milvus::SubSearchRequest>();
title_req->WithAnnsField("title_vector").WithLimit(10);
title_req->AddFloatVector(query_vector);

auto chunk_req = std::make_shared<milvus::SubSearchRequest>();
chunk_req->WithAnnsField("chunks[emb]").WithLimit(10);
chunk_req->SetRadius(0.80);
chunk_req->SetRangeFilter(0.95);
chunk_req->WithFilter("element_filter(chunks, $[section] == \"index\")");
chunk_req->AddFloatVector(query_vector);

milvus::HybridSearchRequest request;
request.WithCollectionName("tech_articles")
       .WithLimit(5)
       .AddSubRequest(title_req)
       .AddSubRequest(chunk_req)
       .WithRerank(std::make_shared<milvus::RRFRerank>(60));
request.WithOutputFields({"doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]"});

milvus::HybridSearchResponse response;
status = client->HybridSearch(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
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

const queryVector = [0.19, 0.24, 0.30, 0.37];

const results = await client.search({
  collection_name: "tech_articles",
  data: [
    {
      anns_field: "title_vector",
      data: [queryVector],
      limit: 10,
    },
    {
      anns_field: "chunks[emb]",
      data: queryVector,
      params: { radius: 0.80, range_filter: 0.95 },
      filter: 'element_filter(chunks, $[section] == "index")',
      limit: 10,
    },
  ],
  rerank: { strategy: "rrf", params: { k: 60 } },
  limit: 5,
  output_fields: [
    "doc_id",
    "title",
    "chunks[text]",
    "chunks[section]",
    "chunks[quality_score]",
  ],
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Responses.Dql;
using Milvus.Client.V2.Types;

float[] queryVector = [0.19f, 0.24f, 0.30f, 0.37f];

AnnSearchReq titleReq = new()
{
    VectorFieldName = "title_vector",
    Vectors = [queryVector],
    Limit = 10
};

AnnSearchReq chunkReq = new()
{
    VectorFieldName = "chunks[emb]",
    Vectors = [queryVector],
    Radius = "0.80",
    RangeFilter = "0.95",
    Limit = 10
};

SearchResp results = await client.HybridSearchAsync(new HybridSearchReq
{
    CollectionName = "tech_articles",
    SearchRequests = [titleReq, chunkReq],
    Reranker = new RrfReranker(),
    Limit = 10
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/hybrid_search" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data-raw '{
    "collectionName": "tech_articles",
    "search": [
      {
        "data": [[0.19, 0.24, 0.30, 0.37]],
        "annsField": "title_vector",
        "limit": 10
      },
      {
        "data": [[0.19, 0.24, 0.30, 0.37]],
        "annsField": "chunks[emb]",
        "limit": 10,
        "searchParams": {
          "params": {
            "radius": 0.80,
            "range_filter": 0.95
          }
        },
        "filter": "element_filter(chunks, $[section] == \"index\")"
      }
    ],
    "rerank": { "strategy": "rrf", "params": { "k": 60 } },
    "limit": 5,
    "outputFields": [
      "doc_id",
      "title",
      "chunks[text]",
      "chunks[section]",
      "chunks[quality_score]"
    ]
  }'
```

</TabItem>
</Tabs>

この例では、`chunks[emb]` サブリクエストのみが範囲検索パラメーターを使用しています。StructArray リクエストは引き続き要素レベルのセマンティクスに従います。範囲境界は、ハイブリッド検索が結果を結合して再ランキングする前に、Struct 要素のヒットに適用されます。

## 範囲検索の結果を解釈する\{#interpret-range-results}

| 結果項目 | 意味 |
| --- | --- |
| `id` | 一致した Struct 要素を含むエンティティの主キーです。 |
| `distance` またはスコア | クエリベクトルと一致した Struct 要素ベクトルの間のスコアまたは距離です。 |
| `offset` | 返される際の、StructArray フィールド内における一致した Struct 要素の 0 から始まる位置です。 |
| 重複する主キー | 可能性があります。同じエンティティ内の複数の Struct 要素が指定された範囲内に含まれる場合があります。 |
| `limit` | 一意の親エンティティではなく、要素のヒットに適用されます。 |

## 制限事項\{#limitations}

- `EmbeddingList` クエリまたは `MAX_SIM*` メトリクスを、StructArray のベクトルサブフィールドに対する範囲検索に使用しないでください。EmbeddingList レベルの検索では、範囲検索はサポートされていません。

- 範囲検索をグループ化検索と組み合わせないでください。親エンティティごとに 1 つの結果が必要な場合は、範囲パラメーターなしで要素レベルの検索を実行し、サポートされている場合はグループ化を使用してください。

- ハイブリッド範囲検索は、StructArray の要素レベルのベクトルフィールドでサポートされています。EmbeddingList レベルの StructArray リクエストではサポートされていません。

## よくある間違い\{#common-mistakes}

- `chunks[emb_list_vector]` に対して範囲検索を実行しています。このフィールドは EmbeddingList 検索用です。

- 要素レベルの範囲検索に、`COSINE` などの通常のメトリクスではなく `MAX_SIM_COSINE` を使用しています。

- 通常のベクトルクエリではなく `EmbeddingList` クエリを使用しています。

- 範囲検索の結果が親エンティティごとに一意であることを期待しています。範囲検索は、一致する Struct 要素のヒットを返します。

- 必須のサブフィールドパス構文 `chunks[emb]` ではなく `chunks.emb` を使用しています。

## 次のステップ\{#next-steps}

1. StructArray ベクトル検索の 2 つの基本モードについては、[StructArray での基本的なベクトル検索](./search-with-struct-array) をお読みください。

1. 範囲検索にスカラーフィルターを追加するには、[StructArray でのフィルター検索](./filtered-search-with-struct-arrays) をお読みください。

1. サポートされている場合に親エンティティごとに最大 1 つの結果を返すには、[StructArray でのグループ化検索](./grouping-search-with-struct-array) をお読みください。

1. バージョン固有の検索制限を確認するには、[StructArray の制限](./struct-array-limits) をお読みください。

