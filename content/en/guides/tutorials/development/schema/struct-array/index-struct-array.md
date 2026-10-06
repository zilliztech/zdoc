---
title: "Index StructArray Fields | Cloud"
slug: /index-struct-array
sidebar_label: "Index StructArray Fields"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Create indexes on StructArray subfields before you run vector search or accelerate scalar filtering. For a StructArray field, the index target is a subfield path, such as `chunks[emblistvector]`, `chunks[emb]`, or `chunks[section]`. | Cloud"
type: origin
token: VvkEwug9ciPZYVk6hM1chLydnib
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Index StructArray Fields

Create indexes on StructArray subfields before you run vector search or accelerate scalar filtering. For a StructArray field, the index target is a subfield path, such as `chunks[emb_list_vector]`, `chunks[emb]`, or `chunks[section]`.

This page uses the `tech_articles` collection from [Create a StructArray Field](./create-struct-array). The `chunks` StructArray field contains scalar subfields for filtering and vector subfields for search.

## Before you begin\{#before-you-begin}

Make sure the collection schema already contains the `chunks` StructArray field and data has been inserted.

| Subfield path | Type | Index purpose |
| --- | --- | --- |
| `chunks[emb_list_vector]` | `FLOAT_VECTOR` | EmbeddingList search with `MAX_SIM*` metrics. |
| `chunks[emb]` | `FLOAT_VECTOR` | Element-level search with regular vector metrics. |
| `chunks[section]` | `VARCHAR` | Categorical filtering. |
| `chunks[quality_score]` | `FLOAT` | Numeric filtering and range-style predicates. |
| `chunks[has_code]` | `BOOL` | Boolean filtering. |

<Admonition type="info" title="Notes">

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

Use `AUTOINDEX` for StructArray vector subfields.

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

Do not create a `MAX_SIM*` index and a regular vector-metric index on the same vector subfield. If both search modes are required, write vectors to two separate vector subfields and create one index on each subfield.

</Admonition>

## Create scalar indexes\{#create-scalar-indexes}

Create scalar indexes on StructArray scalar subfields when you use them in filters. Use the same `structArray[subfield]` path syntax. Applicable index types are `INVERTED`, `BITMAP`, and `STL_SORT`.

Use `AUTOINDEX` for StructArray scalar subfields.

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

Scalar indexes are optional but useful when StructArray scalar subfields appear frequently in filters, such as `element_filter(chunks, $[quality_score] > 0.9)` or `MATCH_ANY(chunks, $[section] == "index")`.

## Applicable metric types\{#applicable-metric-types}

Use the following table to understand the metric types applicable to a StructArray field.

| Metric Type | Description |
| --- | --- |
| `MAX_SIM_COSINE` (`MAX_SIM`) | Measures the similarity between 2 vectors based on Cosine, and then calculates the similarity between 2 vector lists using MaxSim. |
| `MAX_SIM_L2` | Measures the similarity between 2 vectors based on L2, and then calculates the similarity between 2 vector lists using MaxSim. |
| `MAX_SIM_IP` | Measures the similarity between 2 vectors based on IP, and then calculates the similarity between 2 vector lists using MaxSim. |
| `MAX_SIM_HAMMING` | Measures the similarity between 2 vectors based on Hamming, and then calculates the similarity between 2 vector lists using MaxSim. |
| `MAX_SIM_JACCARD` | Measures the similarity between 2 vectors based on Jaccard, and then calculates the similarity between 2 vector lists using MaxSim. |

The following formula applies when you calculate the distance between the query embedding list and a vector subfield in a StructArray field.

$$
Distance({q}, {v})=\Sigma_{i=1}^{n}(Max_{j=1}^{m}Distance(q_i,v_j))
$$

In the above formula, $q$refers to an embedding list of $n$elements, while $v$ refers to a StrctArray subfield containing $m$elements.

## Index metric compatibility\{#index-metric-compatibility}

Use the following tables to choose an index type and metric type for a StructArray vector subfield. Start from the target, then choose the metric family by search mode.

Use `AUTOINDEX` for StructArray vector subfields. Choose the metric type from the metric family required by the search mode.

| Search mode | Vector subfield data type | Index type | Metric type |
| --- | --- | --- | --- |
| EmbeddingList search | `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | `AUTOINDEX` | `MAX_SIM`, `MAX_SIM_COSINE`, `MAX_SIM_IP`, `MAX_SIM_L2` |
| EmbeddingList search | `BINARY_VECTOR` | `AUTOINDEX` | `MAX_SIM_HAMMING`, `MAX_SIM_JACCARD` |
| Element-level search | `FLOAT_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `INT8_VECTOR` | `AUTOINDEX` | `L2`, `IP`, `COSINE` |
| Element-level search | `BINARY_VECTOR` | `AUTOINDEX` | `HAMMING`, `JACCARD` |

For version-specific support and other limits, see [StructArray Limits](./struct-array-limits).

## Verify indexes\{#verify-indexes}

After creating indexes, describe the collection or list indexes to confirm that the expected subfield paths are indexed.

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

List<String> indexes = client.listIndexes(ListIndexesReq.builder()
        .collectionName("tech_articles")
        .build());
System.out.println(indexes);
```

</TabItem>

<TabItem value='go'>

```go
indexes, err := cli.ListIndexes(ctx, milvusclient.NewListIndexOption("tech_articles"))
if err != nil {
    fmt.Println(err.Error())
}
fmt.Println(indexes)
```

</TabItem>

<TabItem value='rust'>

```rust
    let resp = client.list_indexes(ListIndexesRequest::builder()
        .collection_name("tech_articles").build()?).await?;
    println!("{:?}", resp.index_names());
```

</TabItem>

<TabItem value='c++'>

```c++
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

You can also describe a specific index if your SDK version exposes index-description APIs.

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
indexDesc, err := cli.DescribeIndex(ctx, milvusclient.NewDescribeIndexOption("tech_articles", "chunks_emb_cosine"))
if err != nil {
    fmt.Println(err.Error())
}
fmt.Println(indexDesc.IndexType())
```

</TabItem>

<TabItem value='rust'>

```rust
    let resp = client.describe_index(DescribeIndexRequest::builder()
        .collection_name("tech_articles").index_name("chunks_emb_cosine").build()?).await?;
    println!("{:?}", resp.index_type());
```

</TabItem>

<TabItem value='c++'>

```c++
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

1. To filter StructArray scalar subfields during search, read [Filtered Search with StructArray](./filtered-search-with-struct-arrays).

1. To review index and metric limits, read [StructArray Limits](./struct-array-limits).

