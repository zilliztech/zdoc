---
title: "Index StructArray Fields | Cloud"
slug: /index-struct-array
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Create indexes on StructArray subfields before you run vector search or accelerate scalar filtering. For a StructArray field, the index target is a subfield path, such as chunks[emb_list_vector], chunks[emb], or chunks[section]. | Cloud"
type: origin
displayed_sidebar: default
token: shared-index-struct-array
sidebar_label: "Index StructArray Fields"
sidebar_position: 4
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/schema/index-structarray-fields.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Index StructArray Fields

Create indexes on StructArray subfields before you run vector search or accelerate scalar filtering. For a StructArray field, the index target is a subfield path, such as `chunks[emb_list_vector]`, `chunks[emb]`, or `chunks[section]`.

This page uses the `tech_articles` collection from [Create a StructArray Field](./create-struct-array). The `chunks` StructArray field contains scalar subfields for filtering and vector subfields for search.

## Before you begin\{#before-you-begin}

Make sure the collection schema already contains the `chunks` StructArray field. Reuse the initialized client from [Create a StructArray Field](./create-struct-array) for your selected language (`cli` and `ctx` for Go, `client` for the other SDKs). You can create indexes before inserting data.

| Subfield path | Type | Index purpose |
| --- | --- | --- |
| `chunks[emb_list_vector]` | `FLOAT_VECTOR` | EmbeddingList search with `MAX_SIM*` metrics. |
| `chunks[emb]` | `FLOAT_VECTOR` | Element-level search with regular vector metrics. |
| `chunks[section]` | `VARCHAR` | Categorical filtering. |
| `chunks[quality_score]` | `FLOAT` | Numeric filtering and range-style predicates. |
| `chunks[has_code]` | `BOOL` | Boolean filtering. |

<Admonition type="info" icon="📘" title="Notes">

A vector field or vector subfield accepts only one index. If you need both EmbeddingList search and element-level search, create two separate vector subfields and index them separately. In this page, `chunks[emb_list_vector]` is indexed for EmbeddingList search, and `chunks[emb]` is indexed for element-level search.

</Admonition>

## Choose indexes\{#choose-indexes}

Use the search mode to choose the vector metric family.

| Search or filter goal | Target path | What to choose |
| --- | --- | --- |
| EmbeddingList search | `chunks[emb_list_vector]` | A `MAX_SIM*` metric family. |
| Element-level vector search | `chunks[emb]` | A regular vector metric family, such as `COSINE`, `IP`, or `L2`. |
| Filter by string or category | `chunks[section]` | A scalar index supported by your target. |
| Filter by numeric range | `chunks[quality_score]`, `chunks[page]` | A scalar index supported by your target. |
| Filter by boolean value | `chunks[has_code]` | A scalar index supported by your target. |

EmbeddingList search treats the vectors in a StructArray vector subfield as an embedding list and returns entity-level results. Element-level search searches each Struct element independently and can return the matched element offset.

## Create vector indexes\{#create-vector-indexes}

The following example creates two vector indexes. The first index uses a `MAX_SIM*` metric for EmbeddingList search. The second index uses a regular vector metric for element-level search.

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

```c++
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

Warning
Do not create a `MAX_SIM*` index and a regular vector-metric index on the same vector subfield. If both search modes are required, write vectors to two separate vector subfields and create one index on each subfield.

</Admonition>

## Create scalar indexes\{#create-scalar-indexes}

Create scalar indexes on StructArray scalar subfields when you use them in filters. Use the same `structArray[subfield]` path syntax.

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

```c++
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

Scalar indexes are optional but useful when StructArray scalar subfields appear frequently in filters, such as `element_filter(chunks, $[quality_score] > 0.9)` or `MATCH_ANY(chunks, $[section] == "index")`.

## Applicable metric types\{#applicable-metric-types}

For EmbeddingList search, choose the `MAX_SIM*` metric corresponding to the per-vector comparison: `MAX_SIM_COSINE` (also named `MAX_SIM`), `MAX_SIM_IP`, or `MAX_SIM_L2` for dense vectors, and `MAX_SIM_HAMMING` or `MAX_SIM_JACCARD` for binary vectors. These metrics compare embedding lists and return entity-level results. For element-level search, use the corresponding regular metric listed below.

## Index metric compatibility\{#index-metric-compatibility}

Use the following tables to choose an index type and metric type for a StructArray vector subfield. Start from the target, then choose the metric family by search mode.

Choose a Zilliz Cloud index type and metric type from the following compatibility tables.

### EmbeddingList search\{#embeddinglist-search}

EmbeddingList search uses `MAX_SIM*` metrics. It treats the vectors in a StructArray vector subfield as an embedding list and returns entity-level results.

| Vector subfield data type | Index type | Metric type |
| --- | --- | --- |
| `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | `AUTOINDEX` | `MAX_SIM`, `MAX_SIM_COSINE`, `MAX_SIM_IP`, `MAX_SIM_L2` |
| `BINARY_VECTOR` | `AUTOINDEX` | `MAX_SIM_HAMMING`, `MAX_SIM_JACCARD` |

### Element-level search\{#element-level-search}

Element-level search uses regular vector metrics. It searches each Struct element independently and can return the matched element offset.

| Vector subfield data type | Index type | Metric type |
| --- | --- | --- |
| `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | `AUTOINDEX` | `L2`, `IP`, `COSINE` |
| `BINARY_VECTOR` | `AUTOINDEX` | `HAMMING`, `JACCARD` |

For version-specific support and other limits, see [StructArray Limits](./struct-array-limits).

## Verify indexes\{#verify-indexes}

After creating indexes, describe the collection or list indexes to confirm that the expected subfield paths are indexed.

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

```c++
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

After creating both the vector and scalar indexes above, the list response should contain the following names, in any order. The formatting depends on the SDK:

```plaintext
chunks_emb_list_max_sim
chunks_emb_cosine
chunks_section_inverted
chunks_has_code_inverted
chunks_quality_score_sort
chunks_page_sort
```

Describe the `chunks_emb_cosine` index created above to inspect its target field and configuration. The response structure and printed representation differ between SDKs.

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

```c++
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

The list response contains the index names; the describe response identifies `chunks[emb]` and the index configuration. Inspect the response or status for errors before using it.

## Index rules\{#index-rules}

| Rule | Explanation |
| --- | --- |
| Use path syntax for subfield indexes. | Index `chunks[emb]`, not `emb` or `chunks.emb`. |
| One vector subfield accepts one index. | Use separate vector subfields if you need different metric families. |
| Use `MAX_SIM*` metrics for EmbeddingList search. | EmbeddingList query data requires an index built with a `MAX_SIM*` metric. |
| Use regular vector metrics for element-level search. | Element-level search uses regular vector query data and metrics such as `COSINE`, `IP`, or `L2`. |
| Index scalar subfields that appear in filters. | Use scalar index types supported by your target. |
| Keep vector-field limits in mind. | The total number of vector fields and vector subfields is limited. See StructArray Limits before adding many vector subfields. |

## Common mistakes\{#common-mistakes}

- Creating an index on `chunks.emb` instead of `chunks[emb]`.

- Creating only a `MAX_SIM*` index and then trying to run element-level search on the same subfield.

- Creating only a regular vector index and then trying to run EmbeddingList search on the same subfield.

- Reusing one vector subfield for both `MAX_SIM*` and regular vector metrics.

- Forgetting scalar indexes for heavily used StructArray filters.

- Indexing a StructArray subfield that does not exist in the Struct schema.

## Next steps\{#next-steps}

1. To run entity-level EmbeddingList search or element-level vector search, read [Basic Vector Search with StructArray](./search-with-struct-array).

2. To filter StructArray scalar subfields during search, read [Filtered Search with StructArray](./filtered-search-with-struct-arrays).

3. To review index and metric limits, read [StructArray Limits](./struct-array-limits).
