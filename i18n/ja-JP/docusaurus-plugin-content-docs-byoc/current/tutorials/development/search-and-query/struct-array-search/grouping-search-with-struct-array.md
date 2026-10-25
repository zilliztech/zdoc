---
title: "StructArray でのグループ化検索 | BYOC"
slug: /grouping-search-with-struct-array
sidebar_label: "グループ化検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "StructArray の要素レベルの検索結果を親エンティティでグループ化するには、このページを使用します。複数の Struct 要素がクエリに一致すると、要素レベルの検索で同じエンティティから複数のヒットが返されることがあります。グループ化はそれらの要素のヒットをまとめ、各親エンティティが最大 1 回だけ現れるようにします。 | BYOC"
type: origin
token: I60hwuYrSiVSWBkYq9RcqRcpnFh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# StructArray でのグループ化検索

このページを使用して、StructArray の要素レベルの検索結果を親エンティティでグループ化します。複数の Struct 要素がクエリに一致すると、要素レベルの検索で同じエンティティから複数のヒットが返されることがあります。グループ化はそれらの要素のヒットをまとめ、各親エンティティが最大 1 回だけ現れるようにします。

このページでは、[StructArray フィールドの作成](./create-struct-array) の `tech_articles` コレクションを使用します。コレクションには `chunks` という名前の StructArray フィールドがあります。`chunks[emb]` ベクトルサブフィールドは、通常のベクトルメトリクスを使用した要素レベルの検索用にインデックスが作成されています。

## StructArray でのグループ化の適用方法\{#how-grouping-applies-to-structarray}

| 検索モード | グループ化の動作 | 結果の動作 |
| --- | --- | --- |
| EmbeddingList 検索 | サポートされていません。 | 該当しません。 |
| 要素レベルの検索 | プライマリキーによるグループ化でサポートされます。 | 親エンティティごとに最大 1 件の結果を返します。要素レベルのメタデータは保持されるため、API または SDK で公開されている場合は、選択された要素のインデックスまたはオフセットを返すことができます。 |
| ハイブリッド検索 | すべてのサブ検索が同じ StructArray フィールド配下の要素レベルのベクトルフィールドを対象とする場合にのみサポートされます。 | 要素レベルのサブ検索は、最終的な結果処理の前にプライマリキーでグループ化されます。 |

<Admonition type="info" title="Notes">

グループ化されていない要素レベルの検索で重複する親エンティティが多数返される場合は、グループ化を使用してください。一致するすべての Struct 要素を個別のヒットとして取得する場合は、`group_by_field` を指定せずに [StructArray での基本ベクトル検索](./search-with-struct-array) を使用してください。

</Admonition>

## 事前準備\{#before-you-begin}

グループ化検索を実行する前に、コレクション、データ、インデックスを準備します。

| 要件 | 詳細 |
| --- | --- |
| 要素レベルのベクトルサブフィールド | `chunks[emb]` のような StructArray のベクトルサブフィールドを使用し、通常のベクトルメトリクスでインデックスを作成します。 |
| 通常のベクトルクエリ | `EmbeddingList` ではなく、通常のクエリベクトルを使用します。 |
| プライマリキーによるグループ化 | `doc_id` など、コレクションのプライマリキーを `group_by_field` として使用します。 |
| 範囲パラメーターの不使用 | グループ化検索を、`radius` や `range_filter` などの範囲検索パラメーターと組み合わせないでください。 |

インデックスの設定については、[StructArray フィールドのインデックス作成](./index-struct-array) を参照してください。

## グループ化された要素レベルの検索を実行する\{#run-grouped-element-level-search}

次の例では、個々のチャンクを先に検索してから、要素のヒットを親エンティティのプライマリキーでグループ化します。

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
  data: query_vector,
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
    Limit = 5,
    Parameters = new SearchParameters
    {
        GroupByField = "doc_id",
        OutputFields = { "doc_id", "title", "chunks[text]", "chunks[section]", "chunks[page]", "chunks[quality_score]" }
    }
});

foreach (long id in results.Ids.LongIds ?? [])
{
    Console.WriteLine($"doc_id: {id}");
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

グループ化しない場合、複数のチャンクがクエリに一致すると、同じ `doc_id` が複数回現れることがあります。`group_by_field="doc_id"` を指定すると、各親エンティティは最大 1 回だけ現れます。グループ化は要素レベルのメタデータを保持するため、API または SDK で公開されている場合は、グループ化された結果に選択された Struct 要素のインデックスまたはオフセットを含めることができます。

## スカラーフィルターを追加する\{#add-scalar-filters}

グループ化検索を StructArray のスカラーフィルタリングと組み合わせることができます。スカラー条件によって、要素レベルのベクトル検索に参加する Struct 要素を制限する場合は、`element_filter` を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;

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
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

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
  data: query_vector,
  anns_field: "chunks[emb]",
  filter: filter_expr,
  limit: 5,
  group_by_field: "doc_id",
  output_fields: ["doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"],
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
    Limit = 5,
    Parameters = new SearchParameters
    {
        Expression = filterExpr,
        GroupByField = "doc_id",
        OutputFields = { "doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]" }
    }
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

最上位の述語は候補エンティティを選択します。`element_filter` 述語は、要素レベルのベクトル検索を一致する Struct 要素に制限します。その後、グループ化によって一致する要素のヒットがプライマリキーでまとめられます。

## ハイブリッド検索でグループ化を使用する\{#use-grouping-in-hybrid-search}

StructArray でのハイブリッドグループ化は要素レベルの機能です。すべてのサブ検索が同じ StructArray フィールド配下の要素レベルのベクトルフィールドを対象とする場合にのみサポートされます。グループ化された StructArray ハイブリッド検索では、EmbeddingList レベルのリクエストを使用しないでください。

次の例では、`chunks` StructArray フィールドに `chunks[emb]` と `chunks[code_emb]` という 2 つの要素レベルのベクトルサブフィールドがあり、両方に通常のベクトルメトリクスでインデックスが作成されていることを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

queryVector := []float32{0.19, 0.24, 0.30, 0.37}
codeQueryVector := []float32{0.18, 0.23, 0.29, 0.36}

annReq1 := milvusclient.NewAnnRequest("chunks[emb]", 10, entity.FloatVector(queryVector)).
    WithFilter("element_filter(chunks, $[section] == \"index\")").
    WithSearchParam("metric_type", "COSINE").
    WithGroupByField("doc_id")

annReq2 := milvusclient.NewAnnRequest("chunks[code_emb]", 10, entity.FloatVector(codeQueryVector)).
    WithFilter("element_filter(chunks, $[has_code] == true)").
    WithSearchParam("metric_type", "COSINE").
    WithGroupByField("doc_id")

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
      data: query_vector,
      limit: 10,
      expr: 'element_filter(chunks, $[section] == "index")',
    },
    {
      anns_field: "chunks[code_emb]",
      data: code_query_vector,
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
float[] codeQueryVector = [0.18f, 0.23f, 0.29f, 0.36f];

AnnSearchReq indexChunkReq = new()
{
    VectorFieldName = "chunks[emb]",
    Vectors = [queryVector],
    MetricType = MetricType.Cosine,
    Limit = 10,
    Expression = "element_filter(chunks, $[section] == \"index\")"
};

AnnSearchReq codeChunkReq = new()
{
    VectorFieldName = "chunks[code_emb]",
    Vectors = [codeQueryVector],
    MetricType = MetricType.Cosine,
    Limit = 10,
    Expression = "element_filter(chunks, $[has_code] == true)"
};

SearchResp results = await client.HybridSearchAsync(new HybridSearchReq
{
    CollectionName = "tech_articles",
    SearchRequests = [indexChunkReq, codeChunkReq],
    Reranker = new RrfReranker(),
    Limit = 5,
    Parameters = new SearchParameters
    {
        GroupByField = "doc_id",
        OutputFields = { "doc_id", "title", "chunks[text]", "chunks[section]" }
    }
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

この例では、両方のサブリクエストが同じ StructArray フィールド `chunks` 配下の要素レベルのベクトルフィールドを対象としています。ハイブリッド検索で通常のベクトルフィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストを混在させる場合、要素レベルの group-by はサポートされません。

## グループ化された結果を解釈する\{#interpret-grouped-results}

| 結果項目 | 意味 |
| --- | --- |
| `id` | グループ化された親エンティティのプライマリキーです。 |
| `distance` またはスコア | その親エンティティに対して選択された Struct 要素のスコアまたは距離です。 |
| `offset` | 返される場合の、選択された Struct 要素の 0 から始まる位置です。 |
| プライマリキーの重複 | プライマリキーでグループ化する場合、想定されません。 |
| `limit` | グループ化された親エンティティの結果に適用されます。 |

## 制限事項\{#limitations}

- グループ化検索は、要素レベルの StructArray ベクトル検索にのみ適用されます。EmbeddingList 検索および EmbeddingList レベルのハイブリッド検索では、group-by はサポートされません。

- プライマリキーを `group_by_field` として使用してください。StructArray の要素レベルのグループ化は、任意のスカラーフィールドに対する汎用的な group-by ではありません。

- グループ化検索を範囲検索と組み合わせないでください。

- グループ化検索には、`EmbeddingList` クエリまたは `MAX_SIM*` メトリクスを使用しないでください。

- ハイブリッドグループ化は、すべてのサブ検索が同じ StructArray フィールド配下の要素レベルのベクトルフィールドを対象とする場合にのみサポートされます。

- ハイブリッド検索で通常のベクトルフィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストを混在させる場合、ハイブリッドグループ化はサポートされません。

## よくある間違い\{#common-mistakes}

- EmbeddingList 検索用の `chunks[emb_list_vector]` でグループ化を使用する。

- プライマリキー以外のスカラーフィールドでグループ化する。

- 複数のフィールドでグループ化する。StructArray の要素レベルのグループ化は、プライマリキーによるグループ化のみをサポートします。

- グループ化された結果が、一致したすべての Struct 要素を表すと期待する。グループ化は、親エンティティごとに最大 1 件の結果を返します。

- グループ化された要素レベルの検索が EmbeddingList 形式の `MAX_SIM*` スコアを再計算すると想定する。グループ化は要素レベルのヒットをまとめるだけで、スコアリングモデルは変更しません。

- `group_by_field` を `radius` または `range_filter` と組み合わせる。

## 次のステップ\{#next-steps}

1. グループ化されていない要素レベルの検索を先に学ぶには、[StructArray での基本ベクトル検索](./search-with-struct-array) を参照してください。

1. グループ化検索にスカラーフィルターを追加するには、[StructArray でのフィルター検索](./filtered-search-with-struct-arrays) を参照してください。

1. グループ化の代わりにスコアまたは距離の境界を使用するには、[StructArray での範囲検索](./range-search-with-struct-arrays) を参照してください。

1. StructArray の検索制限を確認するには、[StructArray の制限事項](./struct-array-limits) を参照してください。
