---
title: "StructArray を使ったハイブリッド検索 | Cloud"
slug: /hybrid-search-with-struct-array
sidebar_label: "ハイブリッド検索"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、StructArray のベクトル検索と他のベクトル検索を 1 つのハイブリッド検索リクエストで組み合わせる方法を説明します。StructArray のハイブリッド検索では、組み合わせる `AnnSearchRequest` オブジェクトに応じて、entity レベルの結果または element レベルの結果が得られます。 | Cloud"
type: origin
token: EqSpwh9BaiEISgkG5YVcDbCUnpe
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# StructArray を使ったハイブリッド検索

このページでは、StructArray のベクトル検索と他のベクトル検索を 1 つのハイブリッド検索リクエストで組み合わせる方法を説明します。StructArray のハイブリッド検索では、組み合わせる `AnnSearchRequest` オブジェクトに応じて、entity レベルの結果または element レベルの結果が得られます。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` コレクションを使用します。このコレクションには、`title_vector` という名前のトップレベルベクトルフィールドと、`chunks` という名前の StructArray フィールドがあります。`chunks[emb_list_vector]` サブフィールドは EmbeddingList 検索用にインデックスが作成されており、`chunks[emb]` は element レベル検索用にインデックスが作成されています。

## StructArray に対するハイブリッド検索の適用方法\{#how-hybrid-search-applies-to-structarray}

| `AnnSearchRequest` の組み合わせ | 最終候補のスコープ | 結果の挙動 | `element_scope` |
| --- | --- | --- | --- |
| コレクションレベルのベクトルフィールド + StructArray の EmbeddingList サブフィールド | Entity レベル | 最終候補は primary key をキーとします。 | 使用しないでください。 |
| コレクションレベルのベクトルフィールド + StructArray の element レベルサブフィールド | Entity レベル | Element レベルのヒットは、ハイブリッド再ランキングの前に entity レベルの候補へ collapse されます。 | StructArray の element レベル `AnnSearchRequest` で collapse 設定を任意に指定できます。 |
| 同じ StructArray フィールド配下の複数の element レベルサブフィールド | Element レベル | 最終候補は primary key と Struct element offset の組み合わせをキーとします。 | 使用しないでください。 |
| 異なる StructArray フィールド配下の element レベルサブフィールド | Entity レベル | Element offset は同一性を共有しないため、各 StructArray element レベル `AnnSearchRequest` は再ランキングの前に collapse されます。 | 各 StructArray element レベル `AnnSearchRequest` で collapse 設定を任意に指定できます。 |

<Admonition type="warning" title="Warning">

`element_scope` は、同一 Struct ではない element レベルのハイブリッド検索において、StructArray の element レベル `AnnSearchRequest` オブジェクトの collapse を設定する場合にのみ使用してください。EmbeddingList リクエスト、コレクションレベルのベクトルリクエスト、または同一 StructArray の element レベルハイブリッド検索には使用しないでください。

</Admonition>

## 事前準備\{#before-you-begin}

ハイブリッド検索を実行する前に、コレクション、データ、インデックスを準備してください。

| 要件 | 詳細 |
| --- | --- |
| StructArray フィールド | コレクションに `chunks` のような StructArray フィールドが含まれていること。 |
| ベクトルサブフィールド | EmbeddingList 検索用と element レベル検索用に別々のベクトルサブフィールドを使用すること。 |
| インデックス | `chunks[emb_list_vector]` は `MAX_SIM*` メトリクスを使用します。`chunks[emb]` は `COSINE`、`IP`、`L2` などの通常のベクトルメトリクスを使用します。 |
| Reranker | `RRFRanker` など、アプリケーションでサポートされているハイブリッド reranker を選択すること。 |

インデックスの設定については、[StructArray フィールドにインデックスを作成する](./index-struct-array) を参照してください。

## EmbeddingList リクエストでハイブリッド検索を実行する\{#run-hybrid-search-with-an-embeddinglist-request}

StructArray のベクトルサブフィールドに対する EmbeddingList 検索は、ハイブリッド検索では entity レベルになります。entity レベルのベクトル検索リクエストと同じように動作し、一致した 1 つの Struct element offset は返しません。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import AnnSearchRequest, MilvusClient, RRFRanker
from pymilvus.client.embedding_list import EmbeddingList

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

query_vector = [0.19, 0.24, 0.30, 0.37]

query_list = EmbeddingList()
query_list.add([0.12, 0.21, 0.32, 0.44])
query_list.add([0.18, 0.23, 0.29, 0.36])

title_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="title_vector",
    param={},
    limit=10,
)

chunk_list_req = AnnSearchRequest(
    data=[query_list],
    anns_field="chunks[emb_list_vector]",
    param={},
    limit=10,
)

results = client.hybrid_search(
    collection_name="tech_articles",
    reqs=[title_req, chunk_list_req],
    ranker=RRFRanker(),
    limit=5,
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
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddingList;
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

EmbeddingList queryList = new EmbeddingList();
queryList.add(new FloatVec(Arrays.asList(0.12f, 0.21f, 0.32f, 0.44f)));
queryList.add(new FloatVec(Arrays.asList(0.18f, 0.23f, 0.29f, 0.36f)));

AnnSearchReq titleReq = AnnSearchReq.builder()
        .vectorFieldName("title_vector")
        .vectors(Collections.singletonList(queryVector))
        .limit(10)
        .build();

AnnSearchReq chunkListReq = AnnSearchReq.builder()
        .vectorFieldName("chunks[emb_list_vector]")
        .vectors(Collections.singletonList(queryList))
        .limit(10)
        .build();

SearchResp results = client.hybridSearch(HybridSearchReq.builder()
        .collectionName("tech_articles")
        .searchRequests(Arrays.asList(titleReq, chunkListReq))
        .ranker(RRFRanker.builder().k(60).build())
        .limit(5)
        .outFields(Arrays.asList("doc_id", "title", "category", "chunks[text]", "chunks[section]"))
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

queryList := entity.FloatVectorArray{
    entity.FloatVector{0.12, 0.21, 0.32, 0.44},
    entity.FloatVector{0.18, 0.23, 0.29, 0.36},
}

titleReq := milvusclient.NewAnnRequest("title_vector", 10, queryVector)
chunkListReq := milvusclient.NewAnnRequest("chunks[emb_list_vector]", 10, queryList)

results, err := cli.HybridSearch(ctx, milvusclient.NewHybridSearchOption("tech_articles", 5,
    titleReq, chunkListReq).
    WithReranker(milvusclient.NewRRFReranker()).
    WithOutputFields("doc_id", "title", "category", "chunks[text]", "chunks[section]"))
if err != nil {
    fmt.Println(err.Error())
}

fmt.Printf("hybrid search returned %d result sets\n", len(results))
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

    let query_list = EmbeddingList::new()
        .add_vector(vec![0.12f32, 0.21, 0.32, 0.44])
        .add_vector(vec![0.18f32, 0.23, 0.29, 0.36]);

    let title_req = SubSearchRequest::builder()
        .vector_field("title_vector")
        .vectors(SearchVectors::Float(vec![query_vector.clone()]))
        .limit(10)
        .build()?;

    let chunk_list_req = SubSearchRequest::builder()
        .vector_field("chunks[emb_list_vector]")
        .vectors(SearchVectors::EmbeddingLists(vec![query_list]))
        .limit(10)
        .build()?;

    let request = HybridSearchRequest::builder()
        .collection_name("tech_articles")
        .sub_requests(vec![title_req, chunk_list_req])
        .rerank(RRFRerank::new().k(60))
        .limit(5)
        .output_fields(vec!["doc_id", "title", "category", "chunks[text]", "chunks[section]"])
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
#include "milvus/types/EmbeddingList.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

std::vector<float> query_vector = {0.19f, 0.24f, 0.30f, 0.37f};

milvus::EmbeddingList query_list;
query_list.AddFloatVector({0.12f, 0.21f, 0.32f, 0.44f});
query_list.AddFloatVector({0.18f, 0.23f, 0.29f, 0.36f});

auto title_req = std::make_shared<milvus::SubSearchRequest>();
title_req->WithAnnsField("title_vector").WithLimit(10);
title_req->AddFloatVector(query_vector);

auto chunk_list_req = std::make_shared<milvus::SubSearchRequest>();
chunk_list_req->WithAnnsField("chunks[emb_list_vector]").WithLimit(10);
chunk_list_req->AddEmbeddingList(std::move(query_list));

milvus::HybridSearchRequest request;
request.WithCollectionName("tech_articles")
       .WithLimit(5)
       .AddSubRequest(title_req)
       .AddSubRequest(chunk_list_req)
       .WithRerank(std::make_shared<milvus::RRFRerank>(60));
request.WithOutputFields({"doc_id", "title", "category", "chunks[text]", "chunks[section]"});

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

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const query_vector = [0.19, 0.24, 0.30, 0.37];

const query_list = [
  [0.12, 0.21, 0.32, 0.44],
  [0.18, 0.23, 0.29, 0.36],
];

const results = await client.search({
  collection_name: "tech_articles",
  data: [
    { anns_field: "title_vector", data: [query_vector], limit: 10 },
    { anns_field: "chunks[emb_list_vector]", data: query_list, limit: 10 },
  ],
  rerank: { strategy: "rrf", params: { k: 60 } },
  limit: 5,
  output_fields: ["doc_id", "title", "category", "chunks[text]", "chunks[section]"],
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
            "limit": 10
        },
        {
            "data": [[[0.12, 0.21, 0.32, 0.44], [0.18, 0.23, 0.29, 0.36]]],
            "annsField": "chunks[emb_list_vector]",
            "limit": 10
        }
    ],
    "rerank": { "strategy": "rrf", "params": { "k": 60 } },
    "limit": 5,
    "outputFields": ["doc_id", "title", "category", "chunks[text]", "chunks[section]"]
}'
```

</TabItem>
</Tabs>

この例では、両方の `AnnSearchRequest` オブジェクトが entity レベルの候補を生成します。最終結果は親 entity の primary key をキーとします。EmbeddingList リクエストに `element_scope` を追加しないでください。

## 同一 StructArray の element レベルハイブリッド検索を実行する\{#run-same-structarray-element-level-hybrid-search}

すべての `AnnSearchRequest` オブジェクトが同じ StructArray フィールド配下の element レベルベクトルサブフィールドを対象とする場合、ハイブリッド検索は再ランキングを通じて element レベルの候補を維持できます。最終結果が element レベルのままとなる唯一の StructArray ハイブリッドモードです。

次の例では、`chunks` StructArray フィールドに element レベルベクトルサブフィールド `chunks[emb]` と `chunks[code_emb]` の 2 つがあり、どちらも通常のベクトルメトリクスを使用することを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
query_vector = [0.19, 0.24, 0.30, 0.37]
code_query_vector = [0.20, 0.25, 0.31, 0.38]

index_chunk_req = AnnSearchRequest(
    data=[query_vector],
    anns_field="chunks[emb]",
    limit=10,
    param={},
    expr='element_filter(chunks, $[section] == "index")',
)

code_chunk_req = AnnSearchRequest(
    data=[code_query_vector],
    anns_field="chunks[code_emb]",
    limit=10,
    param={},
    expr='element_filter(chunks, $[has_code] == true)',
)

results = client.hybrid_search(
    collection_name="tech_articles",
    reqs=[index_chunk_req, code_chunk_req],
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

FloatVec queryVector = new FloatVec(Arrays.asList(0.19f, 0.24f, 0.30f, 0.37f));
FloatVec codeQueryVector = new FloatVec(Arrays.asList(0.20f, 0.25f, 0.31f, 0.38f));

AnnSearchReq indexChunkReq = AnnSearchReq.builder()
        .vectorFieldName("chunks[emb]")
        .vectors(Collections.singletonList(queryVector))
        .limit(10)
        .filter("element_filter(chunks, $[section] == \"index\")")
        .build();

AnnSearchReq codeChunkReq = AnnSearchReq.builder()
        .vectorFieldName("chunks[code_emb]")
        .vectors(Collections.singletonList(codeQueryVector))
        .limit(10)
        .filter("element_filter(chunks, $[has_code] == true)")
        .build();

SearchResp results = client.hybridSearch(HybridSearchReq.builder()
        .collectionName("tech_articles")
        .searchRequests(Arrays.asList(indexChunkReq, codeChunkReq))
        .ranker(RRFRanker.builder().k(60).build())
        .limit(5)
        .outFields(Arrays.asList("doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]"))
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
codeQueryVector := entity.FloatVector{0.20, 0.25, 0.31, 0.38}

indexChunkReq := milvusclient.NewAnnRequest("chunks[emb]", 10, queryVector).
    WithFilter("element_filter(chunks, $[section] == \"index\")")
codeChunkReq := milvusclient.NewAnnRequest("chunks[code_emb]", 10, codeQueryVector).
    WithFilter("element_filter(chunks, $[has_code] == true)")

results, err := cli.HybridSearch(ctx, milvusclient.NewHybridSearchOption("tech_articles", 5,
    indexChunkReq, codeChunkReq).
    WithReranker(milvusclient.NewRRFReranker()).
    WithOutputFields("doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]"))
if err != nil {
    fmt.Println(err.Error())
}

fmt.Printf("hybrid search returned %d result sets\n", len(results))
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
    let code_query_vector = vec![0.20f32, 0.25, 0.31, 0.38];

    let index_chunk_req = SubSearchRequest::builder()
        .vector_field("chunks[emb]")
        .vectors(SearchVectors::Float(vec![query_vector]))
        .limit(10)
        .filter("element_filter(chunks, $[section] == \"index\")")
        .build()?;

    let code_chunk_req = SubSearchRequest::builder()
        .vector_field("chunks[code_emb]")
        .vectors(SearchVectors::Float(vec![code_query_vector]))
        .limit(10)
        .filter("element_filter(chunks, $[has_code] == true)")
        .build()?;

    let request = HybridSearchRequest::builder()
        .collection_name("tech_articles")
        .sub_requests(vec![index_chunk_req, code_chunk_req])
        .rerank(RRFRerank::new().k(60))
        .limit(5)
        .output_fields(vec!["doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]"])
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
std::vector<float> code_query_vector = {0.20f, 0.25f, 0.31f, 0.38f};

auto index_chunk_req = std::make_shared<milvus::SubSearchRequest>();
index_chunk_req->WithAnnsField("chunks[emb]").WithLimit(10);
index_chunk_req->WithFilter("element_filter(chunks, $[section] == \"index\")");
index_chunk_req->AddFloatVector(query_vector);

auto code_chunk_req = std::make_shared<milvus::SubSearchRequest>();
code_chunk_req->WithAnnsField("chunks[code_emb]").WithLimit(10);
code_chunk_req->WithFilter("element_filter(chunks, $[has_code] == true)");
code_chunk_req->AddFloatVector(code_query_vector);

milvus::HybridSearchRequest request;
request.WithCollectionName("tech_articles")
       .WithLimit(5)
       .AddSubRequest(index_chunk_req)
       .AddSubRequest(code_chunk_req)
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
const query_vector = [0.19, 0.24, 0.30, 0.37];
const code_query_vector = [0.20, 0.25, 0.31, 0.38];

const results = await client.search({
  collection_name: "tech_articles",
  data: [
    { anns_field: "chunks[emb]", data: query_vector, limit: 10, expr: "element_filter(chunks, $[section] == \"index\")" },
    { anns_field: "chunks[code_emb]", data: code_query_vector, limit: 10, expr: "element_filter(chunks, $[has_code] == true)" },
  ],
  rerank: { strategy: "rrf", params: { k: 60 } },
  limit: 5,
  output_fields: ["doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]"],
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
            "annsField": "chunks[emb]",
            "limit": 10,
            "filter": "element_filter(chunks, $[section] == \"index\")"
        },
        {
            "data": [[0.20, 0.25, 0.31, 0.38]],
            "annsField": "chunks[code_emb]",
            "limit": 10,
            "filter": "element_filter(chunks, $[has_code] == true)"
        }
    ],
    "rerank": { "strategy": "rrf", "params": { "k": 60 } },
    "limit": 5,
    "outputFields": ["doc_id", "title", "chunks[text]", "chunks[section]", "chunks[quality_score]"]
}'
```

</TabItem>
</Tabs>

両方の `AnnSearchRequest` オブジェクトは `chunks` 配下のベクトルサブフィールドを検索します。同じ 0 始まりの offset は同じ Struct element を指すため、ハイブリッド reranker は element の候補を直接ランキングできます。このモードでは entity レベルの collapse が行われないため、`element_scope` を設定しないでください。

## Entity レベルのハイブリッド検索のために element レベルのヒットを collapse する\{#collapse-element-level-hits-for-entity-level-hybrid-search}

ハイブリッド検索で StructArray の element レベル `AnnSearchRequest` を、コレクションレベルのベクトルリクエスト、EmbeddingList リクエスト、または異なる StructArray フィールド配下の element レベルリクエストと組み合わせる場合、最終候補のスコープは entity レベルになります。この場合、各 StructArray element レベル `AnnSearchRequest` は、ハイブリッド再ランキングの前に entity レベルの候補へ collapse されます。

同じ entity から一致した複数の element をどのように collapse するかを制御する必要がある場合は、StructArray element レベル `AnnSearchRequest` の `params` 内で `element_scope` を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
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
            "element_scope": {
                "collapse": {
                    "strategy": "topk_sum",
                    "topk": 3,
                },
            },
        },
    },
    limit=30,
    expr='element_filter(chunks, $[quality_score] > 0.8)',
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
        .build();

AnnSearchReq chunkReq = AnnSearchReq.builder()
        .vectorFieldName("chunks[emb]")
        .vectors(Collections.singletonList(queryVector))
        .limit(30)
        .filter("element_filter(chunks, $[quality_score] > 0.8)")
        .params("{\"element_scope\": {\"collapse\": {\"strategy\": \"topk_sum\", \"topk\": 3}}}")
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

titleReq := milvusclient.NewAnnRequest("title_vector", 10, queryVector)

chunkReq := milvusclient.NewAnnRequest("chunks[emb]", 30, queryVector).
    WithFilter("element_filter(chunks, $[quality_score] > 0.8)").
    WithSearchParam("params", "{\"element_scope\": {\"collapse\": {\"strategy\": \"topk_sum\", \"topk\": 3}}}")

results, err := cli.HybridSearch(ctx, milvusclient.NewHybridSearchOption("tech_articles", 5,
    titleReq, chunkReq).
    WithReranker(milvusclient.NewRRFReranker()).
    WithOutputFields("doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"))
if err != nil {
    fmt.Println(err.Error())
}

fmt.Printf("hybrid search returned %d result sets\n", len(results))
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
        .build()?;

    let chunk_req = SubSearchRequest::builder()
        .vector_field("chunks[emb]")
        .vectors(SearchVectors::Float(vec![query_vector]))
        .limit(30)
        .filter("element_filter(chunks, $[quality_score] > 0.8)")
        // Note: element_scope collapse is not yet supported in milvus-sdk-rust as of v3.0.2.
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
title_req->AddFloatVector(query_vector);

auto chunk_req = std::make_shared<milvus::SubSearchRequest>();
chunk_req->WithAnnsField("chunks[emb]").WithLimit(30);
chunk_req->WithFilter("element_filter(chunks, $[quality_score] > 0.8)");
chunk_req->AddExtraParam("params", "{\"element_scope\": {\"collapse\": {\"strategy\": \"topk_sum\", \"topk\": 3}}}");
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
    { anns_field: "title_vector", data: [query_vector], limit: 10 },
    {
      anns_field: "chunks[emb]",
      data: query_vector,
      limit: 30,
      expr: "element_filter(chunks, $[quality_score] > 0.8)",
      params: { element_scope: { collapse: { strategy: "topk_sum", topk: 3 } } },
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
            "limit": 10
        },
        {
            "data": [[0.19, 0.24, 0.30, 0.37]],
            "annsField": "chunks[emb]",
            "limit": 30,
            "filter": "element_filter(chunks, $[quality_score] > 0.8)",
            "params": {
                "element_scope": {
                    "collapse": { "strategy": "topk_sum", "topk": 3 }
                }
            }
        }
    ],
    "rerank": { "strategy": "rrf", "params": { "k": 60 } },
    "limit": 5,
    "outputFields": ["doc_id", "title", "category", "chunks[text]", "chunks[section]", "chunks[quality_score]"]
}'
```

</TabItem>
</Tabs>

この例では、`title_req` は entity レベルであるため、最終的なハイブリッド結果も entity レベルになります。`chunk_req` リクエストは、まず `chunks[emb]` から element のヒットを返し、その後、同じ entity から返された element を、上位 3 つの element スコアを合計して collapse します。Entity レベルの collapse が必要なときに `element_scope` を省略した場合、collapse 戦略はデフォルトで `max` になります。

## Collapse 戦略を選択する\{#choose-a-collapse-strategy}

| 戦略 | 挙動 | `topk` | メトリクスの要件 |
| --- | --- | --- | --- |
| `max` | entity について返された最良の element スコアを保持します。 | 指定できません。 | サポートされている任意の通常のベクトルメトリクス。 |
| `sum` | entity について返されたすべての element スコアを合計します。 | 指定できません。 | `IP` や `COSINE` など、正の相関を持つメトリクスのみ。 |
| `avg` | entity について返されたすべての element スコアを平均します。 | 指定できません。 | サポートされている任意の通常のベクトルメトリクス。 |
| `topk_sum` | entity について返された上位 `K` 個の element スコアを合計します。 | 必須であり、正の値でなければなりません。 | `IP` や `COSINE` など、正の相関を持つメトリクスのみ。 |
| `topk_avg` | entity について返された上位 `K` 個の element スコアを平均します。 | 必須であり、正の値でなければなりません。 | サポートされている任意の通常のベクトルメトリクス。 |

Collapse は、その StructArray element レベル `AnnSearchRequest` が返した element ヒットのみを使用します。ANN 検索後に entity 内のすべての Struct element を走査するわけではありません。collapse に利用したい element が得られるように、リクエストの `limit` を十分に大きく設定してください。

## フィルター、範囲検索、grouping を追加する\{#add-filters-range-search-and-grouping}

ベクトル検索に参加する同じ Struct element にスカラー条件を適用する場合は、StructArray element レベル `AnnSearchRequest` に `element_filter` を付加できます。親 entity の条件には、`hybrid_search()` のトップレベル `filter` も使用できます。

StructArray の element レベルベクトルフィールドは、ハイブリッド検索で範囲検索をサポートしています。element レベル `AnnSearchRequest` に `radius` と、必要に応じて `range_filter` を追加します。EmbeddingList レベルの StructArray リクエストは範囲検索をサポートしていません。

Element レベルのハイブリッド grouping は、すべての `AnnSearchRequest` オブジェクトが同じ StructArray フィールド配下の element レベルベクトルフィールドを対象とする場合にのみサポートされ、`group_by_field` は primary key でなければなりません。リクエストがコレクションレベルのベクトルフィールド、異なる StructArray フィールド、または EmbeddingList レベルのリクエストを混在させる場合、ハイブリッド grouping はサポートされません。範囲検索と grouping を組み合わせないでください。

## ハイブリッド検索結果を解釈する\{#interpret-hybrid-results}

| 最終候補のスコープ | 結果キー | Offset の挙動 | 発生する条件 |
| --- | --- | --- | --- |
| Entity レベル | Primary key。 | 最終結果に element offset は含まれません。 | ハイブリッドリクエストにコレクションレベルのベクトルフィールド、EmbeddingList リクエスト、または異なる StructArray フィールド配下の element レベルリクエストが含まれる場合。 |
| Element レベル | Primary key + 親 StructArray フィールド + element offset。 | API または SDK によって公開されている場合、選択された element offset が返されることがあります。 | すべての `AnnSearchRequest` オブジェクトが element レベルで、かつ同じ StructArray フィールド配下にある場合。 |

## 制限事項\{#limitations}

- `element_scope` は、ハイブリッド検索で entity レベルの候補へ collapse する必要がある StructArray element レベル `AnnSearchRequest` オブジェクトにのみ使用してください。

- `element_scope` を EmbeddingList リクエスト、コレクションレベルのベクトルリクエスト、または同一 StructArray の element レベルハイブリッド検索に使用しないでください。

- `sum` および `topk_sum` の collapse 戦略には、`IP` や `COSINE` などの正の相関を持つメトリクスが必要です。これらを `L2` で使用しないでください。

- `topk_sum` および `topk_avg` には正の `topk` 値が必要です。その他の collapse 戦略に `topk` を含めてはいけません。

- EmbeddingList レベルの StructArray リクエストは、範囲検索または group-by をサポートしていません。

- ハイブリッド group-by は、同一 StructArray の element レベルハイブリッド検索で primary key に対してのみサポートされます。

- 範囲検索と group-by を組み合わせないでください。

## よくある間違い\{#common-mistakes}

- 同一 StructArray の element レベルハイブリッドリクエストに `element_scope` を追加すること。このリクエストは element レベルのままであり、entity レベルの collapse は行われません。

- `chunks[emb_list_vector]` に `element_scope` を追加すること。EmbeddingList 検索はすでに entity レベルです。

- 2 つの StructArray フィールドが element offset を共有すると仮定すること。`chunks` の offset `3` と別の StructArray フィールドの offset `3` は異なる element であるため、ハイブリッドリクエストは entity レベルになります。

- `L2` で `topk_sum` を使用すること。負の distance メトリクスには `max`、`avg`、または `topk_avg` を使用してください。

- collapse 後の entity レベルのハイブリッド結果に、選択された Struct element offset が含まれると期待すること。

## 次のステップ\{#next-steps}

1. StructArray の 2 つの基本的なベクトル検索モードについては、[StructArray を使った基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. ハイブリッド検索にスカラーフィルターを追加するには、[StructArray を使ったフィルタ付き検索](./filtered-search-with-struct-arrays) を参照してください。

1. ハイブリッド検索でスコアまたは distance の境界を使用するには、[StructArray を使用した範囲検索](./range-search-with-struct-arrays) を参照してください。

1. Element レベルのハイブリッド結果を親 entity ごとにグループ化するには、[StructArray を使用したグループ化検索](./grouping-search-with-struct-array) を参照してください。

1. StructArray 検索の制限を確認するには、[StructArray の制限](./struct-array-limits) を参照してください。
