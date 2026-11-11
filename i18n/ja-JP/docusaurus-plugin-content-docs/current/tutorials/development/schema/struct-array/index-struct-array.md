---
title: "StructArray フィールドのインデックス | Cloud"
slug: /index-struct-array
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ベクトル検索を実行する前、またはスカラーフィルタリングを高速化する前に、StructArray のサブフィールドにインデックスを作成します。StructArray フィールドの場合、インデックスの対象は chunks[emb_list_vector]、chunks[emb]、chunks[section] などのサブフィールドパスです。 | Cloud"
type: origin
displayed_sidebar: default
token: shared-index-struct-array
sidebar_label: "StructArray フィールドのインデックス"
sidebar_position: 4
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/index-structarray-fields.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# StructArray フィールドのインデックス

ベクトル検索を実行する前、またはスカラーフィルタリングを高速化する前に、StructArray のサブフィールドにインデックスを作成します。StructArray フィールドの場合、インデックスの対象は `chunks[emb_list_vector]`、`chunks[emb]`、`chunks[section]` などのサブフィールドパスです。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` コレクションを使用します。`chunks` StructArray フィールドには、フィルタリング用のスカラーサブフィールドと検索用のベクトルサブフィールドが含まれています。

## 事前準備\{#before-you-begin}

コレクションスキーマに `chunks` StructArray フィールドがすでに含まれていることを確認してください。選択した言語（Go の場合は `cli` と `ctx`、その他の SDK の場合は `client`）に応じて、[StructArray フィールドを作成する](./create-struct-array) で初期化したクライアントを再利用します。データを挿入する前にインデックスを作成できます。

| サブフィールドパス | 型 | インデックスの目的 |
| --- | --- | --- |
| `chunks[emb_list_vector]` | `FLOAT_VECTOR` | `MAX_SIM*` メトリクスによる EmbeddingList 検索 |
| `chunks[emb]` | `FLOAT_VECTOR` | 通常のベクトルメトリクスによる要素レベルの検索 |
| `chunks[section]` | `VARCHAR` | カテゴリによるフィルタリング |
| `chunks[quality_score]` | `FLOAT` | 数値によるフィルタリングと範囲スタイルの述語 |
| `chunks[has_code]` | `BOOL` | ブール値によるフィルタリング |

<Admonition type="info" icon="📘" title="Notes">

ベクトルフィールドまたはベクトルサブフィールドが受け付けるインデックスは 1 つだけです。EmbeddingList 検索と要素レベルの検索の両方が必要な場合は、2 つの個別のベクトルサブフィールドを作成し、それぞれに個別にインデックスを作成します。このページでは、`chunks[emb_list_vector]` は EmbeddingList 検索用に、`chunks[emb]` は要素レベルの検索用にインデックスが作成されます。

</Admonition>

## インデックスを選択する\{#choose-indexes}

検索モードに応じて、ベクトルメトリクスファミリーを選択します。

| 検索またはフィルタリングの目的 | 対象パス | 選択するもの |
| --- | --- | --- |
| EmbeddingList 検索 | `chunks[emb_list_vector]` | `MAX_SIM*` メトリクスファミリー |
| 要素レベルのベクトル検索 | `chunks[emb]` | `COSINE`、`IP`、`L2` などの通常のベクトルメトリクスファミリー |
| 文字列またはカテゴリによるフィルタリング | `chunks[section]` | 対象でサポートされているスカラーインデックス |
| 数値範囲によるフィルタリング | `chunks[quality_score]`、`chunks[page]` | 対象でサポートされているスカラーインデックス |
| ブール値によるフィルタリング | `chunks[has_code]` | 対象でサポートされているスカラーインデックス |

EmbeddingList 検索では、StructArray のベクトルサブフィールド内のベクトルを埋め込みリストとして扱い、エンティティレベルの結果を返します。要素レベルの検索では、各 Struct 要素を個別に検索し、一致した要素のオフセットを返すことができます。

## ベクトルインデックスを作成する\{#create-vector-indexes}

次の例では、2 つのベクトルインデックスを作成します。1 つ目のインデックスは EmbeddingList 検索用に `MAX_SIM*` メトリクスを使用します。2 つ目のインデックスは要素レベルの検索用に通常のベクトルメトリクスを使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

# Index for EmbeddingList search.
index_params.add_index(
    field_name="chunks[emb_list_vector]",
    index_name="chunks_emb_list_max_sim",
    index_type="AUTOINDEX",
    metric_type="MAX_SIM_COSINE",
)

# Index for element-level search.
index_params.add_index(
    field_name="chunks[emb]",
    index_name="chunks_emb_cosine",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_index(
    collection_name="tech_articles",
    index_params=index_params,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.Arrays;

client.createIndex(CreateIndexReq.builder()
        .collectionName("tech_articles")
        .indexParams(Arrays.asList(
                IndexParam.builder().fieldName("chunks[emb_list_vector]")
                        .indexType(IndexParam.IndexType.AUTOINDEX)
                        .metricType(IndexParam.MetricType.MAX_SIM_COSINE)
                        .indexName("chunks_emb_list_max_sim")
                        .build(),
                IndexParam.builder().fieldName("chunks[emb]")
                        .indexType(IndexParam.IndexType.AUTOINDEX)
                        .metricType(IndexParam.MetricType.COSINE)
                        .indexName("chunks_emb_cosine")
                        .build()))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[emb_list_vector]", index.NewAutoIndex(entity.MaxSimCosine)).WithIndexName("chunks_emb_list_max_sim"))
if err != nil {
    fmt.Println(err.Error())
    return
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[emb]", index.NewAutoIndex(entity.COSINE)).WithIndexName("chunks_emb_cosine"))
if err != nil {
    fmt.Println(err.Error())
    return
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let request = CreateIndexRequest::builder()
        .collection_name("tech_articles")
        .index_params(vec![
            IndexParam::new().field_name("chunks[emb_list_vector]")
                .index_name("chunks_emb_list_max_sim")
                .index_type(IndexType::AutoIndex)
                .metric_type(MetricType::MaxSimCosine),
            IndexParam::new().field_name("chunks[emb]")
                .index_name("chunks_emb_cosine")
                .index_type(IndexType::AutoIndex)
                .metric_type(MetricType::Cosine),
        ])
        .build()?;
client.create_index(request).await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
#include <stdexcept>
#include <iostream>
#include "milvus/MilvusClientV2.h"

milvus::IndexDesc emb_list_index("chunks[emb_list_vector]", "chunks_emb_list_max_sim",
    milvus::IndexType::AUTOINDEX, milvus::MetricType::MAX_SIM_COSINE);
milvus::IndexDesc emb_index("chunks[emb]", "chunks_emb_cosine",
    milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE);

milvus::CreateIndexRequest vector_request;
vector_request.WithCollectionName("tech_articles");
vector_request.WithIndexes({emb_list_index, emb_index});

status = client->CreateIndex(vector_request);
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[emb_list_vector]",
  index_name: "chunks_emb_list_max_sim",
  index_type: "AUTOINDEX",
  metric_type: "MAX_SIM_COSINE",
});

await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[emb]",
  index_name: "chunks_emb_cosine",
  index_type: "AUTOINDEX",
  metric_type: "COSINE",
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

await client.CreateIndexAsync(new CreateIndexReq
{
    CollectionName = "tech_articles",
    Indexes = new[]
    {
        new IndexParam("chunks[emb_list_vector]", "chunks_emb_list_max_sim", IndexType.AutoIndex, MetricType.MaxSimCosine),
        new IndexParam("chunks[emb]", "chunks_emb_cosine", IndexType.AutoIndex, MetricType.Cosine)
    }
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/indexes/create" \
--header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles",
    "indexParams": [
        {
            "fieldName": "chunks[emb_list_vector]",
            "indexName": "chunks_emb_list_max_sim",
            "metricType": "MAX_SIM_COSINE",
            "params": { "index_type": "AUTOINDEX" }
        },
        {
            "fieldName": "chunks[emb]",
            "indexName": "chunks_emb_cosine",
            "metricType": "COSINE",
            "params": { "index_type": "AUTOINDEX" }
        }
    ]
}'
```

</TabItem>

</Tabs>

<Admonition type="info" icon="📘" title="Notes">

警告
同じベクトルサブフィールドに `MAX_SIM*` インデックスと通常のベクトルメトリクスインデックスを作成しないでください。両方の検索モードが必要な場合は、2 つの個別のベクトルサブフィールドにベクトルを書き込み、各サブフィールドに 1 つずつインデックスを作成します。

</Admonition>

## スカラーインデックスを作成する\{#create-scalar-indexes}

StructArray のスカラーサブフィールドをフィルターで使用する場合は、そのサブフィールドにスカラーインデックスを作成します。同じ `structArray[subfield]` パス構文を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="chunks[section]",
    index_name="chunks_section_inverted",
    index_type="AUTOINDEX",
)

index_params.add_index(
    field_name="chunks[has_code]",
    index_name="chunks_has_code_inverted",
    index_type="AUTOINDEX",
)

index_params.add_index(
    field_name="chunks[quality_score]",
    index_name="chunks_quality_score_sort",
    index_type="AUTOINDEX",
)

index_params.add_index(
    field_name="chunks[page]",
    index_name="chunks_page_sort",
    index_type="AUTOINDEX",
)

client.create_index(
    collection_name="tech_articles",
    index_params=index_params,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.Arrays;

client.createIndex(CreateIndexReq.builder()
        .collectionName("tech_articles")
        .indexParams(Arrays.asList(
                IndexParam.builder().fieldName("chunks[section]").indexType(IndexParam.IndexType.AUTOINDEX)
                        .indexName("chunks_section_inverted").build(),
                IndexParam.builder().fieldName("chunks[has_code]").indexType(IndexParam.IndexType.AUTOINDEX)
                        .indexName("chunks_has_code_inverted").build(),
                IndexParam.builder().fieldName("chunks[quality_score]").indexType(IndexParam.IndexType.AUTOINDEX)
                        .indexName("chunks_quality_score_sort").build(),
                IndexParam.builder().fieldName("chunks[page]").indexType(IndexParam.IndexType.AUTOINDEX)
                        .indexName("chunks_page_sort").build()))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[section]", index.NewAutoIndex(entity.MetricType(""))).WithIndexName("chunks_section_inverted"))
if err != nil {
    fmt.Println(err.Error())
    return
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[has_code]", index.NewAutoIndex(entity.MetricType(""))).WithIndexName("chunks_has_code_inverted"))
if err != nil {
    fmt.Println(err.Error())
    return
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[quality_score]", index.NewAutoIndex(entity.MetricType(""))).WithIndexName("chunks_quality_score_sort"))
if err != nil {
    fmt.Println(err.Error())
    return
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[page]", index.NewAutoIndex(entity.MetricType(""))).WithIndexName("chunks_page_sort"))
if err != nil {
    fmt.Println(err.Error())
    return
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let request = CreateIndexRequest::builder()
        .collection_name("tech_articles")
        .index_params(vec![
            IndexParam::new().field_name("chunks[section]").index_name("chunks_section_inverted").index_type(IndexType::AutoIndex),
            IndexParam::new().field_name("chunks[has_code]").index_name("chunks_has_code_inverted").index_type(IndexType::AutoIndex),
            IndexParam::new().field_name("chunks[quality_score]").index_name("chunks_quality_score_sort").index_type(IndexType::AutoIndex),
            IndexParam::new().field_name("chunks[page]").index_name("chunks_page_sort").index_type(IndexType::AutoIndex),
        ])
        .build()?;
client.create_index(request).await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
#include <stdexcept>
#include <iostream>
#include "milvus/MilvusClientV2.h"

milvus::IndexDesc section_index("chunks[section]", "chunks_section_inverted",
    milvus::IndexType::AUTOINDEX);
milvus::IndexDesc has_code_index("chunks[has_code]", "chunks_has_code_inverted",
    milvus::IndexType::AUTOINDEX);
milvus::IndexDesc quality_index("chunks[quality_score]", "chunks_quality_score_sort",
    milvus::IndexType::AUTOINDEX);
milvus::IndexDesc page_index("chunks[page]", "chunks_page_sort",
    milvus::IndexType::AUTOINDEX);

milvus::CreateIndexRequest scalar_request;
scalar_request.WithCollectionName("tech_articles");
scalar_request.WithIndexes({section_index, has_code_index, quality_index, page_index});

status = client->CreateIndex(scalar_request);
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[section]",
  index_name: "chunks_section_inverted",
  index_type: "AUTOINDEX",
});

await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[has_code]",
  index_name: "chunks_has_code_inverted",
  index_type: "AUTOINDEX",
});

await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[quality_score]",
  index_name: "chunks_quality_score_sort",
  index_type: "AUTOINDEX",
});

await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[page]",
  index_name: "chunks_page_sort",
  index_type: "AUTOINDEX",
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

await client.CreateIndexAsync(new CreateIndexReq
{
    CollectionName = "tech_articles",
    Indexes = new[]
    {
        new IndexParam("chunks[section]", "chunks_section_inverted", IndexType.AutoIndex),
        new IndexParam("chunks[has_code]", "chunks_has_code_inverted", IndexType.AutoIndex),
        new IndexParam("chunks[quality_score]", "chunks_quality_score_sort", IndexType.AutoIndex),
        new IndexParam("chunks[page]", "chunks_page_sort", IndexType.AutoIndex)
    }
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/indexes/create" \
--header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles",
    "indexParams": [
        { "fieldName": "chunks[section]", "indexName": "chunks_section_inverted", "params": { "index_type": "AUTOINDEX" } },
        { "fieldName": "chunks[has_code]", "indexName": "chunks_has_code_inverted", "params": { "index_type": "AUTOINDEX" } },
        { "fieldName": "chunks[quality_score]", "indexName": "chunks_quality_score_sort", "params": { "index_type": "AUTOINDEX" } },
        { "fieldName": "chunks[page]", "indexName": "chunks_page_sort", "params": { "index_type": "AUTOINDEX" } }
    ]
}'
```

</TabItem>

</Tabs>

スカラーインデックスは省略可能ですが、`element_filter(chunks, $[quality_score] > 0.9)` や `MATCH_ANY(chunks, $[section] == "index")` のように、StructArray のスカラーサブフィールドがフィルターで頻繁に使用される場合に役立ちます。

## 適用可能なメトリクスタイプ\{#applicable-metric-types}

EmbeddingList 検索では、ベクトルごとの比較に対応する `MAX_SIM*` メトリクスを選択します。密ベクトルの場合は `MAX_SIM_COSINE`（別名 `MAX_SIM`）、`MAX_SIM_IP`、`MAX_SIM_L2`、バイナリベクトルの場合は `MAX_SIM_HAMMING`、`MAX_SIM_JACCARD` です。これらのメトリクスは埋め込みリストを比較し、エンティティレベルの結果を返します。要素レベルの検索では、以下に示す対応する通常のメトリクスを使用します。

要素単位で null を許容するサブフィールドやスカラー `ARRAY` サブフィールドでは、スカラーインデックスはサポートされていません。これらのサブフィールドに対するフィルターは、インデックスなしで実行されます。


## 要素単位で null を許容するベクトルサブフィールドと追加されたベクトルサブフィールドのインデックス\{#index-element-nullable-and-added-vector-subfields}

ベクトルサブフィールドは、要素レベルの null（`nullable=True`）を指定して作成できます。また、既存の StructArray フィールドにベクトルサブフィールドを追加することもできます。どちらの場合も、サブフィールドのインデックスの作成方法が変わります。


- 要素単位で null を許容するベクトルサブフィールドは、要素レベルの検索にのみ対応しています。`COSINE`、`IP`、`L2` などの通常のベクトルメトリクスでインデックスを作成します。このサブフィールドでは `MAX_SIM*` メトリクスと EmbeddingList インデックスは拒否され、`AUTOINDEX` は `MAX_SIM*` メトリクスを選択しません。インデックスの構築時と検索時に、null ベクトルはスキップされます。

```python
index_params = client.prepare_index_params()

# Element-level index on an added, element-nullable vector subfield.
index_params.add_index(
    field_name="chunks[summary_emb]",
    index_name="chunks_summary_emb_cosine",
    index_type="HNSW",
    metric_type="COSINE",
    params={
        "M": 16,
        "efConstruction": 200,
    },
)

client.create_index(
    collection_name="tech_articles",
    index_params=index_params,
)
```

## インデックスとメトリクスの互換性\{#index-metric-compatibility}

次の表を使用して、StructArray のベクトルサブフィールドのインデックスタイプとメトリクスタイプを選択します。対象から始めて、検索モードに応じてメトリクスファミリーを選択します。

次の互換性テーブルから、Zilliz Cloud のインデックスタイプとメトリクスタイプを選択します。

### EmbeddingList 検索\{#embeddinglist-search}

EmbeddingList 検索では `MAX_SIM*` メトリクスを使用します。StructArray のベクトルサブフィールド内のベクトルを埋め込みリストとして扱い、エンティティレベルの結果を返します。

| ベクトルサブフィールドのデータ型 | インデックスタイプ | メトリクスタイプ |
| --- | --- | --- |
| `FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR` | `AUTOINDEX` | `MAX_SIM`、`MAX_SIM_COSINE`、`MAX_SIM_IP`、`MAX_SIM_L2` |
| `BINARY_VECTOR` | `AUTOINDEX` | `MAX_SIM_HAMMING`、`MAX_SIM_JACCARD` |

### 要素レベルの検索\{#element-level-search}

要素レベルの検索では、通常のベクトルメトリクスを使用します。各 Struct 要素を個別に検索し、一致した要素のオフセットを返すことができます。

| ベクトルサブフィールドのデータ型 | インデックスタイプ | メトリクスタイプ |
| --- | --- | --- |
| `FLOAT_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`INT8_VECTOR` | `AUTOINDEX` | `L2`、`IP`、`COSINE` |
| `BINARY_VECTOR` | `AUTOINDEX` | `HAMMING`、`JACCARD` |

バージョン固有のサポート状況とその他の制限については、[StructArray の制限事項](./struct-array-limits) を参照してください。

## インデックスを確認する\{#verify-indexes}

インデックスを作成した後、コレクションを describe するか、インデックスを一覧表示して、想定したサブフィールドパスにインデックスが作成されていることを確認します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
indexes = client.list_indexes(
    collection_name="tech_articles",
)

print(indexes)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.index.request.ListIndexesReq;
import java.util.List;

List<String> indexes = client.listIndexes(ListIndexesReq.builder()
        .collectionName("tech_articles")
        .build());
System.out.println(indexes);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

indexes, err := cli.ListIndexes(ctx, milvusclient.NewListIndexOption("tech_articles"))
if err != nil {
    fmt.Println(err.Error())
    return
}
fmt.Println(indexes)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let resp = client.list_indexes(ListIndexesRequest::builder()
        .collection_name("tech_articles").build()?).await?;
println!("{:?}", resp.index_names());
```

</TabItem>

<TabItem value='c++'>

```cpp
#include <stdexcept>
#include <utility>
#include <iostream>
#include "milvus/MilvusClientV2.h"

milvus::ListIndexesResponse list_resp;
status = client->ListIndexes(milvus::ListIndexesRequest()
                                .WithCollectionName("tech_articles"),
                            list_resp);
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}

for (const auto& name : list_resp.IndexNames()) {
    std::cout << name << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexes = await client.listIndexes({
  collection_name: "tech_articles",
});
console.log(indexes);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Index;

var indexes = await client.ListIndexesAsync(new ListIndexesReq
{
    CollectionName = "tech_articles"
});
Console.WriteLine(string.Join(", ", indexes.IndexNames));
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/indexes/list" \
--header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles"
}'
```

</TabItem>

</Tabs>

上記のベクトルインデックスとスカラーインデックスの両方を作成した後、インデックス一覧のレスポンスには、順序を問わず次の名前が含まれている必要があります。書式は SDK によって異なります。

```plaintext
chunks_emb_list_max_sim
chunks_emb_cosine
chunks_section_inverted
chunks_has_code_inverted
chunks_quality_score_sort
chunks_page_sort
```

上記で作成した `chunks_emb_cosine` インデックスを describe して、対象フィールドと設定を確認します。レスポンスの構造と出力表現は SDK によって異なります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index = client.describe_index(
    collection_name="tech_articles",
    index_name="chunks_emb_cosine",
)

print(index)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.index.request.DescribeIndexReq;
import io.milvus.v2.service.index.response.DescribeIndexResp;

DescribeIndexResp index = client.describeIndex(DescribeIndexReq.builder()
        .collectionName("tech_articles")
        .indexName("chunks_emb_cosine")
        .build());
System.out.println(index);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

indexDesc, err := cli.DescribeIndex(ctx, milvusclient.NewDescribeIndexOption("tech_articles", "chunks_emb_cosine"))
if err != nil {
    fmt.Println(err.Error())
    return
}
fmt.Println(indexDesc.IndexType())
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let resp = client.describe_index(DescribeIndexRequest::builder()
        .collection_name("tech_articles").index_name("chunks_emb_cosine").build()?).await?;
for description in resp.indexes() {
    println!("{:?}", description);
}
```

</TabItem>

<TabItem value='c++'>

```cpp
#include <stdexcept>
#include <utility>
#include <iostream>
#include "milvus/MilvusClientV2.h"

milvus::DescribeIndexResponse desc_resp;
status = client->DescribeIndex(milvus::DescribeIndexRequest()
                                   .WithCollectionName("tech_articles")
                                   .WithIndexName("chunks_emb_cosine"),
                               desc_resp);
if (!status.IsOk()) {
    throw std::runtime_error(status.Message());
}

for (const auto& desc : desc_resp.Descs()) {
    std::cout << desc.FieldName() << ": " << desc.IndexName() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const index = await client.describeIndex({
  collection_name: "tech_articles",
  index_name: "chunks_emb_cosine",
});
console.log(index);
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Index;

var index = await client.DescribeIndexAsync(new DescribeIndexReq
{
    CollectionName = "tech_articles",
    IndexName = "chunks_emb_cosine"
});
foreach (var description in index.Indexes)
{
    Console.WriteLine($"{description.FieldName}: {description.IndexName}");
}
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/indexes/describe" \
--header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles",
    "indexName": "chunks_emb_cosine"
}'
```

</TabItem>

</Tabs>

一覧表示のレスポンスにはインデックス名が含まれ、describe のレスポンスでは `chunks[emb]` とインデックス設定が特定されます。使用する前に、レスポンスまたはステータスでエラーを確認してください。

## インデックスのルール\{#index-rules}

| ルール | 説明 |
| --- | --- |
| サブフィールドインデックスにはパス構文を使用します。 | `emb` や `chunks.emb` ではなく `chunks[emb]` にインデックスを作成します。 |
| 1 つのベクトルサブフィールドが受け付けるインデックスは 1 つです。 | 異なるメトリクスファミリーが必要な場合は、個別のベクトルサブフィールドを使用します。 |
| EmbeddingList 検索には `MAX_SIM*` メトリクスを使用します。 | EmbeddingList のクエリデータには、`MAX_SIM*` メトリクスで構築されたインデックスが必要です。 |
| 要素レベルの検索には通常のベクトルメトリクスを使用します。 | 要素レベルの検索では、通常のベクトルクエリデータと `COSINE`、`IP`、`L2` などのメトリクスを使用します。 |
| フィルターに出現するスカラーサブフィールドにインデックスを作成します。 | 対象でサポートされているスカラーインデックスタイプを使用します。要素単位で null を許容するサブフィールドとスカラー `ARRAY` サブフィールドにはインデックスを作成できません。 |
| 要素単位で null を許容するベクトルサブフィールドには、要素レベルのメトリクスを使用します。 | 要素単位で null を許容するベクトルサブフィールド（`nullable=True`）は、既存の StructArray フィールドに追加されたベクトルサブフィールドを含め、`MAX_SIM*` メトリクスを拒否します。 |
| ベクトルフィールドの制限に注意してください。 | ベクトルフィールドとベクトルサブフィールドの合計数には制限があります。多数のベクトルサブフィールドを追加する前に、StructArray の制限事項を参照してください。 |

## よくある間違い\{#common-mistakes}

- `chunks[emb]` ではなく `chunks.emb` にインデックスを作成しています。

- `MAX_SIM*` インデックスのみを作成し、その後同じサブフィールドで要素レベルの検索を実行しようとしています。

- 通常のベクトルインデックスのみを作成し、その後同じサブフィールドで EmbeddingList 検索を実行しようとしています。

- 1 つのベクトルサブフィールドを `MAX_SIM*` メトリクスと通常のベクトルメトリクスの両方で再利用しています。

- 頻繁に使用される StructArray フィルター用のスカラーインデックスを作成し忘れています。

- Struct スキーマに存在しない StructArray サブフィールドにインデックスを作成しています。

## 次のステップ\{#next-steps}

1. エンティティレベルの EmbeddingList 検索または要素レベルのベクトル検索を実行するには、[StructArray での基本的なベクトル検索](./search-with-struct-array) を参照してください。

2. 検索時に StructArray のスカラーサブフィールドをフィルタリングするには、[StructArray でのフィルター検索](./filtered-search-with-struct-arrays) を参照してください。

3. インデックスとメトリクスの制限を確認するには、[StructArray の制限事項](./struct-array-limits) を参照してください。
