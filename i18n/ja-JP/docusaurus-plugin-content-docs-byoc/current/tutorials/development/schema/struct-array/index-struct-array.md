---
title: "StructArray フィールドのインデックス | BYOC"
slug: /index-struct-array
sidebar_label: "StructArray フィールドのインデックス"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ベクトル検索を実行する前、またはスカラーフィルタリングを高速化する前に、StructArray サブフィールドにインデックスを作成します。StructArray フィールドの場合、インデックスの対象は `chunks[emblistvector]`、`chunks[emb]`、`chunks[section]` などのサブフィールドパスです。 | BYOC"
type: origin
token: VvkEwug9ciPZYVk6hM1chLydnib
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# StructArray フィールドのインデックス

ベクトル検索を実行する前、またはスカラーフィルタリングを高速化する前に、StructArray サブフィールドにインデックスを作成します。StructArray フィールドでは、インデックスの対象となるのは `chunks[emb_list_vector]`、`chunks[emb]`、`chunks[section]` などのサブフィールドパスです。

このページでは、[StructArray フィールドを作成する](./create-struct-array) の `tech_articles` コレクションを使用します。`chunks` StructArray フィールドには、フィルタリング用のスカラーサブフィールドと検索用のベクトルサブフィールドが含まれています。

## 事前準備\{#before-you-begin}

コレクションスキーマに `chunks` StructArray フィールドがすでに含まれており、データが挿入済みであることを確認してください。

| サブフィールドパス | 型 | インデックスの目的 |
| --- | --- | --- |
| `chunks[emb_list_vector]` | `FLOAT_VECTOR` | `MAX_SIM*` メトリクスを使用した EmbeddingList 検索 |
| `chunks[emb]` | `FLOAT_VECTOR` | 通常のベクトルメトリクスを使用した要素レベルの検索 |
| `chunks[section]` | `VARCHAR` | カテゴリフィルタリング |
| `chunks[quality_score]` | `FLOAT` | 数値フィルタリングと範囲述語 |
| `chunks[has_code]` | `BOOL` | ブールフィルタリング |

<Admonition type="info" title="Notes">

ベクトルフィールドまたはベクトルサブフィールドは、1 つのインデックスのみ受け入れます。EmbeddingList 検索と要素レベルの検索の両方が必要な場合は、2 つの個別のベクトルサブフィールドを作成し、それぞれにインデックスを作成してください。このページでは、`chunks[emb_list_vector]` は EmbeddingList 検索用に、`chunks[emb]` は要素レベルの検索用にインデックスが作成されています。

</Admonition>

## インデックスを選択する\{#choose-indexes}

検索モードに応じて、ベクトルメトリクスファミリーを選択します。

| 検索またはフィルタの目的 | 対象パス | 選択するもの |
| --- | --- | --- |
| EmbeddingList 検索 | `chunks[emb_list_vector]` | `MAX_SIM*` メトリクスファミリー |
| 要素レベルのベクトル検索 | `chunks[emb]` | `COSINE`、`IP`、`L2` などの通常のベクトルメトリクスファミリー |
| 文字列またはカテゴリによるフィルタ | `chunks[section]` | 対象でサポートされているスカラーインデックス |
| 数値範囲によるフィルタ | `chunks[quality_score]`, `chunks[page]` | 対象でサポートされているスカラーインデックス |
| ブール値によるフィルタ | `chunks[has_code]` | 対象でサポートされているスカラーインデックス |

EmbeddingList 検索では、StructArray ベクトルサブフィールド内のベクトルを埋め込みリストとして扱い、エンティティレベルの結果を返します。要素レベルの検索では、各 Struct 要素を個別に検索し、一致した要素のオフセットを返すことができます。

## ベクトルインデックスを作成する\{#create-vector-indexes}

次の例では、2 つのベクトルインデックスを作成します。1 つ目のインデックスは EmbeddingList 検索用に `MAX_SIM*` メトリクスを使用します。2 つ目のインデックスは要素レベルの検索用に通常のベクトルメトリクスを使用します。

StructArray ベクトルサブフィールドには `AUTOINDEX` を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="chunks[emb_list_vector]",
    index_name="chunks_emb_list_auto",
    index_type="AUTOINDEX",
    metric_type="MAX_SIM_COSINE",
)

index_params.add_index(
    field_name="chunks[emb]",
    index_name="chunks_emb_auto",
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
                        .indexName("chunks_emb_list_auto")
                        .build(),
                IndexParam.builder().fieldName("chunks[emb]")
                        .indexType(IndexParam.IndexType.AUTOINDEX)
                        .metricType(IndexParam.MetricType.COSINE)
                        .indexName("chunks_emb_auto")
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

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[emb_list_vector]", index.NewAutoIndex(entity.MaxSimCosine)).WithIndexName("chunks_emb_list_auto"))
if err != nil {
    fmt.Println(err.Error())
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[emb]", index.NewAutoIndex(entity.COSINE)).WithIndexName("chunks_emb_auto"))
if err != nil {
    fmt.Println(err.Error())
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
                .index_name("chunks_emb_list_auto")
                .index_type(IndexType::AutoIndex)
                .metric_type(MetricType::MaxSimCosine),
            IndexParam::new().field_name("chunks[emb]")
                .index_name("chunks_emb_auto")
                .index_type(IndexType::AutoIndex)
                .metric_type(MetricType::Cosine),
        ])
        .build()?;
    client.create_index(request).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

milvus::IndexDesc emb_list_index("chunks[emb_list_vector]", "chunks_emb_list_auto",
    milvus::IndexType::AUTOINDEX, milvus::MetricType::MAX_SIM_COSINE);
milvus::IndexDesc emb_index("chunks[emb]", "chunks_emb_auto",
    milvus::IndexType::AUTOINDEX, milvus::MetricType::COSINE);

milvus::CreateIndexRequest create_request;
create_request.WithCollectionName("tech_articles");
create_request.WithIndexes({emb_list_index, emb_index});

status = client->CreateIndex(create_request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[emb_list_vector]",
  index_name: "chunks_emb_list_auto",
  index_type: "AUTOINDEX",
  metric_type: "MAX_SIM_COSINE",
});

await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[emb]",
  index_name: "chunks_emb_auto",
  index_type: "AUTOINDEX",
  metric_type: "COSINE",
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles",
    "indexParams": [
        {
            "fieldName": "chunks[emb_list_vector]",
            "indexName": "chunks_emb_list_auto",
            "metricType": "MAX_SIM_COSINE",
            "params": { "index_type": "AUTOINDEX" }
        },
        {
            "fieldName": "chunks[emb]",
            "indexName": "chunks_emb_auto",
            "metricType": "COSINE",
            "params": { "index_type": "AUTOINDEX" }
        }
    ]
}'
```

</TabItem>
</Tabs>

<Admonition type="warning" title="Warning">

同じベクトルサブフィールドに `MAX_SIM*` インデックスと通常のベクトルメトリクスインデックスを作成しないでください。両方の検索モードが必要な場合は、2 つの個別のベクトルサブフィールドにベクトルを書き込み、各サブフィールドに 1 つずつインデックスを作成してください。

</Admonition>

## スカラーインデックスを作成する\{#create-scalar-indexes}

StructArray のスカラーサブフィールドをフィルタで使用する場合は、それらのサブフィールドにスカラーインデックスを作成します。`structArray[subfield]` と同じパス構文を使用します。適用可能なインデックスタイプは `INVERTED`、`BITMAP`、`STL_SORT` です。

StructArray スカラーサブフィールドには `AUTOINDEX` を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="chunks[section]",
    index_name="chunks_section_auto",
    index_type="AUTOINDEX",
)

index_params.add_index(
    field_name="chunks[has_code]",
    index_name="chunks_has_code_auto",
    index_type="AUTOINDEX",
)

index_params.add_index(
    field_name="chunks[quality_score]",
    index_name="chunks_quality_score_auto",
    index_type="AUTOINDEX",
)

index_params.add_index(
    field_name="chunks[page]",
    index_name="chunks_page_auto",
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
                        .indexName("chunks_section_auto").build(),
                IndexParam.builder().fieldName("chunks[has_code]").indexType(IndexParam.IndexType.AUTOINDEX)
                        .indexName("chunks_has_code_auto").build(),
                IndexParam.builder().fieldName("chunks[quality_score]").indexType(IndexParam.IndexType.AUTOINDEX)
                        .indexName("chunks_quality_score_auto").build(),
                IndexParam.builder().fieldName("chunks[page]").indexType(IndexParam.IndexType.AUTOINDEX)
                        .indexName("chunks_page_auto").build()))
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

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[section]", index.NewAutoIndex(entity.MetricType(""))).WithIndexName("chunks_section_auto"))
if err != nil {
    fmt.Println(err.Error())
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[has_code]", index.NewAutoIndex(entity.MetricType(""))).WithIndexName("chunks_has_code_auto"))
if err != nil {
    fmt.Println(err.Error())
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[quality_score]", index.NewAutoIndex(entity.MetricType(""))).WithIndexName("chunks_quality_score_auto"))
if err != nil {
    fmt.Println(err.Error())
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tech_articles", "chunks[page]", index.NewAutoIndex(entity.MetricType(""))).WithIndexName("chunks_page_auto"))
if err != nil {
    fmt.Println(err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

    let request = CreateIndexRequest::builder()
        .collection_name("tech_articles")
        .index_params(vec![
            IndexParam::new().field_name("chunks[section]").index_name("chunks_section_auto").index_type(IndexType::AutoIndex),
            IndexParam::new().field_name("chunks[has_code]").index_name("chunks_has_code_auto").index_type(IndexType::AutoIndex),
            IndexParam::new().field_name("chunks[quality_score]").index_name("chunks_quality_score_auto").index_type(IndexType::AutoIndex),
            IndexParam::new().field_name("chunks[page]").index_name("chunks_page_auto").index_type(IndexType::AutoIndex),
        ])
        .build()?;
    client.create_index(request).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

milvus::IndexDesc section_index("chunks[section]", "chunks_section_auto",
    milvus::IndexType::AUTOINDEX);
milvus::IndexDesc has_code_index("chunks[has_code]", "chunks_has_code_auto",
    milvus::IndexType::AUTOINDEX);
milvus::IndexDesc quality_index("chunks[quality_score]", "chunks_quality_score_auto",
    milvus::IndexType::AUTOINDEX);
milvus::IndexDesc page_index("chunks[page]", "chunks_page_auto",
    milvus::IndexType::AUTOINDEX);

milvus::CreateIndexRequest create_request;
create_request.WithCollectionName("tech_articles");
create_request.WithIndexes({section_index, has_code_index, quality_index, page_index});

status = client->CreateIndex(create_request);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[section]",
  index_name: "chunks_section_auto",
  index_type: "AUTOINDEX",
});

await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[has_code]",
  index_name: "chunks_has_code_auto",
  index_type: "AUTOINDEX",
});

await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[quality_score]",
  index_name: "chunks_quality_score_auto",
  index_type: "AUTOINDEX",
});

await client.createIndex({
  collection_name: "tech_articles",
  field_name: "chunks[page]",
  index_name: "chunks_page_auto",
  index_type: "AUTOINDEX",
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles",
    "indexParams": [
        { "fieldName": "chunks[section]", "indexName": "chunks_section_auto", "params": { "index_type": "AUTOINDEX" } },
        { "fieldName": "chunks[has_code]", "indexName": "chunks_has_code_auto", "params": { "index_type": "AUTOINDEX" } },
        { "fieldName": "chunks[quality_score]", "indexName": "chunks_quality_score_auto", "params": { "index_type": "AUTOINDEX" } },
        { "fieldName": "chunks[page]", "indexName": "chunks_page_auto", "params": { "index_type": "AUTOINDEX" } }
    ]
}'
```

</TabItem>
</Tabs>

スカラーインデックスは省略可能ですが、StructArray のスカラーサブフィールドが `element_filter(chunks, $[quality_score] > 0.9)` や `MATCH_ANY(chunks, $[section] == "index")` のようにフィルタで頻繁に使用される場合に役立ちます。

## 適用可能なメトリクスタイプ\{#applicable-metric-types}

次の表を使用して、StructArray フィールドに適用可能なメトリクスタイプを確認してください。

| メトリクスタイプ | 説明 |
| --- | --- |
| `MAX_SIM_COSINE` (`MAX_SIM`) | コサインに基づいて 2 つのベクトル間の類似度を測定し、MaxSim を使用して 2 つのベクトルリスト間の類似度を計算します。 |
| `MAX_SIM_L2` | L2 に基づいて 2 つのベクトル間の類似度を測定し、MaxSim を使用して 2 つのベクトルリスト間の類似度を計算します。 |
| `MAX_SIM_IP` | IP に基づいて 2 つのベクトル間の類似度を測定し、MaxSim を使用して 2 つのベクトルリスト間の類似度を計算します。 |
| `MAX_SIM_HAMMING` | Hamming に基づいて 2 つのベクトル間の類似度を測定し、MaxSim を使用して 2 つのベクトルリスト間の類似度を計算します。 |
| `MAX_SIM_JACCARD` | Jaccard に基づいて 2 つのベクトル間の類似度を測定し、MaxSim を使用して 2 つのベクトルリスト間の類似度を計算します。 |

クエリの埋め込みリストと StructArray フィールド内のベクトルサブフィールド間の距離を計算する場合、次の式が適用されます。

$$
Distance({q}, {v})=\Sigma_{i=1}^{n}(Max_{j=1}^{m}Distance(q_i,v_j))
$$

上記の式では、$q$ は $n$ 個の要素からなる埋め込みリストを指し、$v$ は $m$ 個の要素を含む StructArray サブフィールドを指します。

## インデックスのメトリクス互換性\{#index-metric-compatibility}

次の表を使用して、StructArray ベクトルサブフィールドのインデックスタイプとメトリクスタイプを選択してください。対象から始め、検索モードに基づいてメトリクスファミリーを選択します。

StructArray ベクトルサブフィールドには `AUTOINDEX` を使用します。検索モードで必要なメトリクスファミリーからメトリクスタイプを選択します。

| 検索モード | ベクトルサブフィールドのデータ型 | インデックスタイプ | メトリクスタイプ |
| --- | --- | --- | --- |
| EmbeddingList 検索 | `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | `AUTOINDEX` | `MAX_SIM`, `MAX_SIM_COSINE`, `MAX_SIM_IP`, `MAX_SIM_L2` |
| EmbeddingList 検索 | `BINARY_VECTOR` | `AUTOINDEX` | `MAX_SIM_HAMMING`, `MAX_SIM_JACCARD` |
| 要素レベルの検索 | `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | `AUTOINDEX` | `L2`, `IP`, `COSINE` |
| 要素レベルの検索 | `BINARY_VECTOR` | `AUTOINDEX` | `HAMMING`, `JACCARD` |

バージョン固有のサポート状況とその他の制限については、[StructArray Limits](./struct-array-limits) を参照してください。

## インデックスを確認する\{#verify-indexes}

インデックスを作成した後、コレクションの詳細を取得するか、インデックスを一覧表示して、想定したサブフィールドパスにインデックスが作成されていることを確認します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

milvus::ListIndexesResponse list_resp;
status = client->ListIndexes(milvus::ListIndexesRequest()
                                .WithCollectionName("tech_articles"),
                            list_resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
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

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles"
}'
```

</TabItem>
</Tabs>

SDK のバージョンでインデックスの詳細を取得する API が提供されている場合は、特定のインデックスの詳細を取得することもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
}
fmt.Println(indexDesc.IndexType())
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

    let resp = client.describe_index(DescribeIndexRequest::builder()
        .collection_name("tech_articles").index_name("chunks_emb_cosine").build()?).await?;
    println!("{:?}", resp.indexes()[0].get_index_type());
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

milvus::DescribeIndexResponse desc_resp;
status = client->DescribeIndex(milvus::DescribeIndexRequest()
                                   .WithCollectionName("tech_articles")
                                   .WithIndexName("chunks_emb_cosine"),
                               desc_resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
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

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "tech_articles",
    "indexName": "chunks_emb_cosine"
}'
```

</TabItem>
</Tabs>

## インデックスのルール\{#index-rules}

| ルール | 説明 |
| --- | --- |
| サブフィールドインデックスにはパス構文を使用します。 | `emb` や `chunks.emb` ではなく、`chunks[emb]` にインデックスを作成します。 |
| 1 つのベクトルサブフィールドは 1 つのインデックスのみを受け入れます。 | 異なるメトリクスファミリーが必要な場合は、別々のベクトルサブフィールドを使用します。 |
| EmbeddingList 検索には `MAX_SIM*` メトリクスを使用します。 | EmbeddingList のクエリデータには、`MAX_SIM*` メトリクスで構築されたインデックスが必要です。 |
| 要素レベルの検索には通常のベクトルメトリクスを使用します。 | 要素レベルの検索では、通常のベクトルクエリデータと `COSINE`、`IP`、`L2` などのメトリクスを使用します。 |
| フィルタに出現するスカラーサブフィールドにインデックスを作成します。 | 対象でサポートされているスカラーインデックスタイプを使用します。 |
| ベクトルフィールドの制限に注意してください。 | ベクトルフィールドとベクトルサブフィールドの合計数には制限があります。多数のベクトルサブフィールドを追加する前に、StructArray Limits を参照してください。 |

## よくある間違い\{#common-mistakes}

- `chunks[emb]` ではなく `chunks.emb` へのインデックス作成。

- 同じサブフィールドに `MAX_SIM*` インデックスのみを作成した状態での要素レベルの検索。

- 同じサブフィールドに通常のベクトルインデックスのみを作成した状態での EmbeddingList 検索。

- `MAX_SIM*` と通常のベクトルメトリクスの両方での 1 つのベクトルサブフィールドの再利用。

- 多用される StructArray フィルタに対するスカラーインデックスの未作成。

- Struct スキーマに存在しない StructArray サブフィールドへのインデックス作成。

## 次のステップ\{#next-steps}

1. エンティティレベルの EmbeddingList 検索または要素レベルのベクトル検索を実行するには、[StructArray を使用した基本的なベクトル検索](./search-with-struct-array) を参照してください。

1. 検索中に StructArray のスカラーサブフィールドをフィルタリングするには、[StructArray を使用したフィルタ検索](./filtered-search-with-struct-arrays) を参照してください。

1. インデックスとメトリクスの制限を確認するには、[StructArray Limits](./struct-array-limits) を参照してください。
