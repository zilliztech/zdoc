---
title: "StructArray を使ったフィルタ付き検索 | Cloud"
slug: /filtered-search-with-struct-arrays
sidebar_label: "フィルタ付き検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray フィールドに対するベクトル検索にスカラーフィルタリングを追加する方法を説明します。StructArray のフィルタリングには 2 つのレベルがあります。行レベルのフィルタは親エンティティを選択し、要素レベルのフィルタは要素レベルのベクトル検索に参加する Struct 要素を制約します。 | Cloud"
type: origin
token: WDjyw7hO3i26RckEgqIcf36snMh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# StructArray を使ったフィルタ付き検索

このページでは、StructArray フィールドに対するベクトル検索にスカラーフィルタリングを追加する方法を説明します。StructArray のフィルタリングには 2 つのレベルがあります。行レベルのフィルタは親エンティティを選択し、要素レベルのフィルタは要素レベルのベクトル検索に参加する Struct 要素を制約します。

このページでは、[StructArray フィールドの作成](./create-struct-array) の `tech_articles` コレクションを使用します。このコレクションには `chunks` という名前の StructArray フィールドがあり、`section`、`page`、`quality_score`、`has_code` などのスカラーサブフィールドと、検索用のベクトルサブフィールドがあります。

## フィルタの種類を選択する\{#choose-a-filter-type}

| 目的 | 使用するもの | 結果の動作 |
| --- | --- | --- |
| `category` などのトップレベルスカラーフィールドでフィルタします。 | 通常のフィルタ式です。 | 検索前または検索中に親エンティティを選択します。 |
| スカラー条件に一致する Struct 要素に要素レベルのベクトル検索を制約します。 | `element_filter`。 | 一致する Struct 要素のみを検索し、一致した要素のオフセットを返すこともできます。 |
| いずれか、すべて、または特定の数の Struct 要素が述語に一致するかどうかでエンティティを選択します。 | `MATCH_ANY`、`MATCH_ALL`、`MATCH_LEAST`、`MATCH_MOST`、または `MATCH_EXACT`。 | 行レベルのフィルタリングです。これらの演算子自体はオフセットを返しません。 |

<Admonition type="info" title="Notes">

このページでは、検索ワークフローで StructArray フィルタを使用する方法を説明します。完全な構文ルール、サポートされる述語の種類、サポートされない述語のマトリックスについては、[StructArray 演算子](./struct-array-filtering) を参照してください。

</Admonition>

## トップレベルフィールドでフィルタする\{#filter-by-top-level-fields}

条件が個々の Struct 要素ではなく親エンティティに属する場合は、通常のフィルタ式を使用します。これは EmbeddingList 検索と要素レベルの検索の両方で機能します。

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
    filter='category == "search"',
    limit=3,
    output_fields=[
        "doc_id",
        "title",
        "category",
        "chunks[text]",
        "chunks[section]",
    ],
)
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

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

EmbeddingList query = new EmbeddingList();
query.add(new FloatVec(Arrays.asList(0.12f, 0.21f, 0.32f, 0.44f)));
query.add(new FloatVec(Arrays.asList(0.18f, 0.23f, 0.29f, 0.36f)));

SearchResp results = client.search(SearchReq.builder()
        .collectionName("tech_articles")
        .data(Collections.singletonList(query))
        .annsField("chunks[emb_list_vector]")
        .filter("category == \"search\"")
        .limit(3)
        .outputFields(Arrays.asList("doc_id", "title", "category", "chunks[text]", "chunks[section]"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal(err)
}

query := entity.FloatVectorArray{
    entity.FloatVector{0.12, 0.21, 0.32, 0.44},
    entity.FloatVector{0.18, 0.23, 0.29, 0.36},
}

results, err := cli.Search(ctx, milvusclient.NewSearchOption("tech_articles", 3, []entity.Vector{query}).
    WithANNSField("chunks[emb_list_vector]").
    WithFilter("category == \"search\"").
    WithOutputFields("doc_id", "title", "category", "chunks[text]", "chunks[section]"))
if err != nil {
    fmt.Println(err.Error())
}
fmt.Printf("returned %d result sets\n", len(results))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let query = EmbeddingList::new()
        .add_vector(vec![0.12f32, 0.21, 0.32, 0.44])
        .add_vector(vec![0.18f32, 0.23, 0.29, 0.36]);

    let request = SearchRequest::builder()
        .collection_name("tech_articles")
        .vector_field("chunks[emb_list_vector]")
        .vectors(SearchVectors::EmbeddingLists(vec![query]))
        .filter("category == \"search\"")
        .limit(3)
        .output_fields(vec!["doc_id", "title", "category", "chunks[text]", "chunks[section]"])
        .build()?;

    let results = client.search(request).await?;

    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <memory>

#include "milvus/MilvusClientV2.h"
#include "milvus/request/dql/SearchRequest.h"
#include "milvus/types/EmbeddingList.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::EmbeddingList query;
query.AddFloatVector({0.12f, 0.21f, 0.32f, 0.44f});
query.AddFloatVector({0.18f, 0.23f, 0.29f, 0.36f});

milvus::SearchRequest request;
request.WithCollectionName("tech_articles")
       .WithAnnsField("chunks[emb_list_vector]")
       .WithLimit(3)
       .WithFilter("category == \"search\"");
request.WithOutputFields({"doc_id", "title", "category", "chunks[text]", "chunks[section]"});
request.AddEmbeddingList(std::move(query));

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

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const query = [
  [0.12, 0.21, 0.32, 0.44],
  [0.18, 0.23, 0.29, 0.36],
];

const results = await client.search({
  collection_name: "tech_articles",
  data: query,
  anns_field: "chunks[emb_list_vector]",
  filter: 'category == "search"',
  limit: 3,
  output_fields: ["doc_id", "title", "category", "chunks[text]", "chunks[section]"],
});
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
    "data": [[[0.12, 0.21, 0.32, 0.44], [0.18, 0.23, 0.29, 0.36]]],
    "annsField": "chunks[emb_list_vector]",
    "filter": "category == \"search\"",
    "limit": 3,
    "outputFields": ["doc_id", "title", "category", "chunks[text]", "chunks[section]"]
}'
```

</TabItem>
</Tabs>

上記のフィルタは、トップレベルの `category` フィールドが `"search"` であるエンティティのみを選択します。一致した 1 つの Struct 要素を特定するものではありません。

## 要素レベルのベクトル検索をフィルタする\{#filter-element-level-vector-search}

スカラー条件を、要素レベルのベクトル検索に参加する同じ Struct 要素に適用する必要がある場合は、`element_filter(structArrayField, predicate)` を使用します。述語の内部では、`$[subfield]` を使用して現在の Struct 要素のスカラーサブフィールドを参照します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
query_vector = [0.19, 0.24, 0.30, 0.37]

filter_expr = (
    'category == "search" && '
    'element_filter(chunks, '
    '$[section] == "index" && '
    '$[quality_score] > 0.9 && '
    '$[has_code] == true)'
)

results = client.search(
    collection_name="tech_articles",
    data=[query_vector],
    anns_field="chunks[emb]",
    filter=filter_expr,
    limit=5,
    output_fields=[
        "doc_id",
        "title",
        "chunks[text]",
        "chunks[section]",
        "chunks[page]",
        "chunks[quality_score]",
        "chunks[has_code]",
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

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

FloatVec queryVector = new FloatVec(Arrays.asList(0.19f, 0.24f, 0.30f, 0.37f));

String filterExpr = "category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9 && $[has_code] == true)";

SearchResp results = client.search(SearchReq.builder()
        .collectionName("tech_articles")
        .data(Collections.singletonList(queryVector))
        .annsField("chunks[emb]")
        .filter(filterExpr)
        .limit(5)
        .outputFields(Arrays.asList("doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]", "chunks[has_code]"))
        .build());

for (List<SearchResp.SearchResult> hits : results.getSearchResults()) {
    for (SearchResp.SearchResult hit : hits) {
        System.out.println("doc_id: " + hit.getId() + ", distance: " + hit.getScore()
                + ", offset: " + hit.getElementOffset() + ", entity: " + hit.getEntity());
    }
}
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal(err)
}

queryVector := entity.FloatVector{0.19, 0.24, 0.30, 0.37}

filterExpr := "category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9 && $[has_code] == true)"

results, err := cli.Search(ctx, milvusclient.NewSearchOption("tech_articles", 5, []entity.Vector{queryVector}).
    WithANNSField("chunks[emb]").
    WithFilter(filterExpr).
    WithOutputFields("doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]", "chunks[has_code]"))
if err != nil {
    fmt.Println(err.Error())
}
fmt.Printf("returned %d result sets\n", len(results))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let query_vector = vec![0.19f32, 0.24, 0.30, 0.37];

    let filter_expr = "category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9 && $[has_code] == true)";

    let request = SearchRequest::builder()
        .collection_name("tech_articles")
        .vector_field("chunks[emb]")
        .vectors(SearchVectors::Float(vec![query_vector]))
        .filter(filter_expr)
        .limit(5)
        .output_fields(vec!["doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]", "chunks[has_code]"])
        .build()?;

    let results = client.search(request).await?;

    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <memory>
#include <vector>

#include "milvus/MilvusClientV2.h"
#include "milvus/request/dql/SearchRequest.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::vector<float> query_vector = {0.19f, 0.24f, 0.30f, 0.37f};

milvus::SearchRequest request;
request.WithCollectionName("tech_articles")
       .WithAnnsField("chunks[emb]")
       .WithLimit(5)
       .WithFilter("category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9 && $[has_code] == true)");
request.WithOutputFields({"doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]", "chunks[has_code]"});
request.AddFloatVector(query_vector);

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

const filter_expr = 'category == "search" && element_filter(chunks, $[section] == "index" && $[quality_score] > 0.9 && $[has_code] == true)';

const results = await client.search({
  collection_name: "tech_articles",
  data: [query_vector],
  anns_field: "chunks[emb]",
  filter: filter_expr,
  limit: 5,
  output_fields: ["doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]", "chunks[has_code]"],
});
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
    "data": [[0.19, 0.24, 0.30, 0.37]],
    "annsField": "chunks[emb]",
    "filter": "category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9 && $[has_code] == true)",
    "limit": 5,
    "outputFields": ["doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]", "chunks[has_code]"]
}'
```

</TabItem>
</Tabs>

この例では、トップレベルの述語 `category == "search"` が候補エンティティを選択し、`element_filter` は、`section`、`quality_score`、`has_code` がすべて同じ Struct 要素内で一致するチャンクに要素レベルのベクトル検索を制限します。

<Admonition type="warning" title="Warning">

トップレベルの述語と `element_filter` を組み合わせる場合は、`element_filter` を式の末尾に配置します。1 つのフィルタ式に含めることができる `element_filter` は 1 つだけであり、`element_filter` や `MATCH_*` を別の StructArray 演算子の内部に入れ子にすることはできません。

</Admonition>

## MATCH 演算子でエンティティをフィルタする\{#filter-entities-with-match-operators}

Struct 要素に基づいて親エンティティが条件を満たすかどうかをフィルタで判断する場合は、`MATCH_*` 演算子を使用します。これらの演算子は行レベルのフィルタです。エンティティを選択しますが、それ自体では要素のオフセットを返しません。

| 演算子 | 使用する場合 | 例 |
| --- | --- | --- |
| `MATCH_ANY` | 少なくとも 1 つの Struct 要素が述語を満たす必要があります。 | `MATCH_ANY(chunks, $[section] == "index")` |
| `MATCH_ALL` | すべての Struct 要素が述語を満たす必要があります。 | `MATCH_ALL(chunks, $[quality_score] > 0.5)` |
| `MATCH_LEAST` | 少なくとも `N` 個の Struct 要素が述語を満たす必要があります。 | `MATCH_LEAST(chunks, $[has_code] == true, threshold=2)` |
| `MATCH_MOST` | 最大で `N` 個の Struct 要素が述語を満たす必要があります。 | `MATCH_MOST(chunks, $[section] == "appendix", threshold=1)` |
| `MATCH_EXACT` | ちょうど `N` 個の Struct 要素が述語を満たす必要があります。 | `MATCH_EXACT(chunks, $[section] == "summary", threshold=1)` |

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus.client.embedding_list import EmbeddingList

query = EmbeddingList()
query.add([0.12, 0.21, 0.32, 0.44])
query.add([0.18, 0.23, 0.29, 0.36])

filter_expr = (
    'category == "search" && '
    'MATCH_ANY(chunks, $[section] == "index" && $[quality_score] > 0.9)'
)

results = client.search(
    collection_name="tech_articles",
    data=[query],
    anns_field="chunks[emb_list_vector]",
    filter=filter_expr,
    limit=3,
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
import io.milvus.v2.service.vector.request.data.EmbeddingList;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

EmbeddingList query = new EmbeddingList();
query.add(new FloatVec(Arrays.asList(0.12f, 0.21f, 0.32f, 0.44f)));
query.add(new FloatVec(Arrays.asList(0.18f, 0.23f, 0.29f, 0.36f)));

String filterExpr = "category == \"search\" && MATCH_ANY(chunks, $[section] == \"index\" && $[quality_score] > 0.9)";

SearchResp results = client.search(SearchReq.builder()
        .collectionName("tech_articles")
        .data(Collections.singletonList(query))
        .annsField("chunks[emb_list_vector]")
        .filter(filterExpr)
        .limit(3)
        .outputFields(Arrays.asList("doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal(err)
}

query := entity.FloatVectorArray{
    entity.FloatVector{0.12, 0.21, 0.32, 0.44},
    entity.FloatVector{0.18, 0.23, 0.29, 0.36},
}

filterExpr := "category == \"search\" && MATCH_ANY(chunks, $[section] == \"index\" && $[quality_score] > 0.9)"

results, err := cli.Search(ctx, milvusclient.NewSearchOption("tech_articles", 3, []entity.Vector{query}).
    WithANNSField("chunks[emb_list_vector]").
    WithFilter(filterExpr).
    WithOutputFields("doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"))
if err != nil {
    fmt.Println(err.Error())
}
fmt.Printf("returned %d result sets\n", len(results))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let query = EmbeddingList::new()
        .add_vector(vec![0.12f32, 0.21, 0.32, 0.44])
        .add_vector(vec![0.18f32, 0.23, 0.29, 0.36]);

    let filter_expr = "category == \"search\" && MATCH_ANY(chunks, $[section] == \"index\" && $[quality_score] > 0.9)";

    let request = SearchRequest::builder()
        .collection_name("tech_articles")
        .vector_field("chunks[emb_list_vector]")
        .vectors(SearchVectors::EmbeddingLists(vec![query]))
        .filter(filter_expr)
        .limit(3)
        .output_fields(vec!["doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"])
        .build()?;

    let results = client.search(request).await?;

    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <memory>

#include "milvus/MilvusClientV2.h"
#include "milvus/request/dql/SearchRequest.h"
#include "milvus/types/EmbeddingList.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::EmbeddingList query;
query.AddFloatVector({0.12f, 0.21f, 0.32f, 0.44f});
query.AddFloatVector({0.18f, 0.23f, 0.29f, 0.36f});

milvus::SearchRequest request;
request.WithCollectionName("tech_articles")
       .WithAnnsField("chunks[emb_list_vector]")
       .WithLimit(3)
       .WithFilter("category == \"search\" && MATCH_ANY(chunks, $[section] == \"index\" && $[quality_score] > 0.9)");
request.WithOutputFields({"doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"});
request.AddEmbeddingList(std::move(query));

milvus::SearchResponse response;
status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const query = [
  [0.12, 0.21, 0.32, 0.44],
  [0.18, 0.23, 0.29, 0.36],
];

const filter_expr = 'category == "search" && MATCH_ANY(chunks, $[section] == "index" && $[quality_score] > 0.9)';

const results = await client.search({
  collection_name: "tech_articles",
  data: query,
  anns_field: "chunks[emb_list_vector]",
  filter: filter_expr,
  limit: 3,
  output_fields: ["doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"],
});
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
    "data": [[[0.12, 0.21, 0.32, 0.44], [0.18, 0.23, 0.29, 0.36]]],
    "annsField": "chunks[emb_list_vector]",
    "filter": "category == \"search\" && MATCH_ANY(chunks, $[section] == \"index\" && $[quality_score] > 0.9)",
    "limit": 3,
    "outputFields": ["doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"]
}'
```

</TabItem>
</Tabs>

ここで `MATCH_ANY` を使用するのは、EmbeddingList 検索の結果がエンティティレベルであるためです。このフィルタは、エンティティ内の少なくとも 1 つのチャンクが高品質の `"index"` チャンクであることを要求しますが、検索結果自体は依然として親エンティティを表します。

## ハイブリッド検索でフィルタを使用する\{#use-filters-in-hybrid-search}

ハイブリッド検索では、条件を適用する場所に StructArray フィルタを適用します。トップレベルのフィルタは、ハイブリッド検索全体で共有できます。`element_filter` は、要素レベルの制約が必要な StructArray の要素レベルのリクエストに付加する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import AnnSearchRequest, RRFRanker

query_vector = [0.19, 0.24, 0.30, 0.37]

title_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="title_vector",
    param={},
    limit=10,
    expr='category == "search"',
)

chunk_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="chunks[emb]",
    param={},
    limit=10,
    expr='category == "search" && element_filter(chunks, $[section] == "index" && $[quality_score] > 0.9)',
)

results = client.hybrid_search(
    collection_name="tech_articles",
    reqs=[title_req, chunk_req],
    ranker=RRFRanker(),
    limit=5,
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
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.request.ranker.RRFRanker;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
MilvusClientV2 client = new MilvusClientV2(connectConfig);

FloatVec queryVector = new FloatVec(Arrays.asList(0.19f, 0.24f, 0.30f, 0.37f));

AnnSearchReq titleReq = AnnSearchReq.builder()
        .vectorFieldName("title_vector")
        .vectors(Collections.singletonList(queryVector))
        .limit(10)
        .filter("category == \"search\"")
        .build();

AnnSearchReq chunkReq = AnnSearchReq.builder()
        .vectorFieldName("chunks[emb]")
        .vectors(Collections.singletonList(queryVector))
        .limit(10)
        .filter("category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9)")
        .build();

SearchResp results = client.hybridSearch(HybridSearchReq.builder()
        .collectionName("tech_articles")
        .searchRequests(Arrays.asList(titleReq, chunkReq))
        .ranker(RRFRanker.builder().k(60).build())
        .limit(5)
        .outFields(Arrays.asList("doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/entity"
    milvusclient "github.com/milvus-io/milvus/client/v3/milvusclient"
)

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal(err)
}

queryVector := entity.FloatVector{0.19, 0.24, 0.30, 0.37}

titleReq := milvusclient.NewAnnRequest("title_vector", 10, queryVector).
    WithFilter("category == \"search\"")
chunkReq := milvusclient.NewAnnRequest("chunks[emb]", 10, queryVector).
    WithFilter("category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9)")

results, err := cli.HybridSearch(ctx, milvusclient.NewHybridSearchOption("tech_articles", 5,
    titleReq, chunkReq).
    WithReranker(milvusclient.NewRRFReranker()).
    WithOutputFields("doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"))
if err != nil {
    fmt.Println(err.Error())
}
fmt.Printf("returned %d result sets\n", len(results))
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let query_vector = vec![0.19f32, 0.24, 0.30, 0.37];

    let title_req = SubSearchRequest::builder()
        .vector_field("title_vector")
        .vectors(SearchVectors::Float(vec![query_vector.clone()]))
        .limit(10)
        .filter("category == \"search\"")
        .build()?;

    let chunk_req = SubSearchRequest::builder()
        .vector_field("chunks[emb]")
        .vectors(SearchVectors::Float(vec![query_vector]))
        .limit(10)
        .filter("category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9)")
        .build()?;

    let request = HybridSearchRequest::builder()
        .collection_name("tech_articles")
        .sub_requests(vec![title_req, chunk_req])
        .rerank(RRFRerank::new().k(60))
        .limit(5)
        .output_fields(vec!["doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"])
        .build()?;

    let results = client.hybrid_search(request).await?;

    Ok(())
}
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
title_req->WithFilter("category == \"search\"");
title_req->AddFloatVector(query_vector);

auto chunk_req = std::make_shared<milvus::SubSearchRequest>();
chunk_req->WithAnnsField("chunks[emb]").WithLimit(10);
chunk_req->WithFilter("category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9)");
chunk_req->AddFloatVector(query_vector);

milvus::HybridSearchRequest request;
request.WithCollectionName("tech_articles")
       .WithLimit(5)
       .AddSubRequest(title_req)
       .AddSubRequest(chunk_req)
       .WithRerank(std::make_shared<milvus::RRFRerank>(60));
request.WithOutputFields({"doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"});

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

const results = await client.search({
  collection_name: "tech_articles",
  data: [
    { anns_field: "title_vector", data: [query_vector], limit: 10, expr: 'category == "search"' },
    {
      anns_field: "chunks[emb]",
      data: [query_vector],
      limit: 10,
      expr: 'category == "search" && element_filter(chunks, $[section] == "index" && $[quality_score] > 0.9)',
    },
  ],
  rerank: { strategy: "rrf", params: { k: 60 } },
  limit: 5,
  output_fields: ["doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/hybrid_search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles",
    "search": [
        {
            "data": [[0.19, 0.24, 0.30, 0.37]],
            "annsField": "title_vector",
            "limit": 10,
            "filter": "category == \"search\""
        },
        {
            "data": [[0.19, 0.24, 0.30, 0.37]],
            "annsField": "chunks[emb]",
            "limit": 10,
            "filter": "category == \"search\" && element_filter(chunks, $[section] == \"index\" && $[quality_score] > 0.9)"
        }
    ],
    "rerank": { "strategy": "rrf", "params": { "k": 60 } },
    "limit": 5,
    "outputFields": ["doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"]
}'
```

</TabItem>
</Tabs>

`filter` 引数はトップレベルのエンティティ条件を適用し、`chunk_req` の `expr` は StructArray の要素レベルのベクトルリクエストのみを制約します。サポートされるハイブリッド検索の組み合わせとバージョン固有の制限については、[StructArray を使ったハイブリッド検索](./hybrid-search-with-struct-array) および [StructArray の制限](./struct-array-limits) を参照してください。

## 述語のサポートの概要\{#predicate-support-summary}

StructArray の述語ではスカラーサブフィールドを使用します。ベクトルサブフィールドはスカラー述語の入力にはなりません。

| サブフィールド型 | 一般的な述語の例 |
| --- | --- |
| `BOOL` | `$[has_code] == true`, `!($[has_code] == true)` |
| 整数型 | `$[page] >= 2`, `$[page] in [1, 2, 3]` |
| `FLOAT`, `DOUBLE` | `$[quality_score] > 0.9`, `0.7 < $[quality_score] < 0.95` |
| `VARCHAR` | `$[section] == "index"`, `$[text] like "range%"` |
| ベクトルサブフィールド | `$[...]` スカラー述語の入力としてはサポートされません。代わりに、ベクトル検索を通じてベクトルサブフィールドを使用してください。 |

JSON パス、配列コンテナ関数、テキスト一致関数、`$[...]` に対する null 述語、Geometry 関数、Timestamptz 式、汎用関数呼び出しなど、サポートされないケースについては、[StructArray 演算子](./struct-array-filtering) を参照してください。

## よくある間違い\{#common-mistakes}

- `element_filter` または `MATCH_*` の外で `$[subfield]` を使用するのは避けてください。

- StructArray 演算子の構文（`element_filter(chunks, $[section] == "index")` など）の代わりに `chunks.section` を使用するのは避けてください。

- 行レベルのフィルタリングのみが必要な場合に `element_filter` を使用するのは避けてください。エンティティを選択するだけでよい場合は、代わりに `MATCH_ANY` を使用してください。

- `MATCH_*` が要素のオフセットを返すことを期待するのは避けてください。これらの演算子はエンティティを選択するものであり、それ自体では一致した 1 つの要素を特定しません。

- `$[has_code]` のような裸の boolean 述語を記述するのは避けてください。`$[has_code] == true` のような明示的な比較を使用してください。

- 同じフィルタ式内でトップレベルの述語より前に `element_filter` を配置するのは避けてください。

## 次のステップ\{#next-steps}

1. StructArray フィルタの完全な構文を確認するには、[StructArray 演算子](./struct-array-filtering) を参照してください。

1. フィルタなしでベクトル検索を先に実行するには、[StructArray を使った基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. よく使用する StructArray フィルタにスカラーインデックスを作成するには、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

1. バージョン固有のフィルタと検索の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。

