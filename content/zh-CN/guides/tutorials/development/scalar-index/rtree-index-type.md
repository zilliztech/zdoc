---
title: "RTREE | Cloud"
slug: /rtree-index-type
sidebar_label: "RTREE"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "RTREE 索引是一种基于树形结构的数据索引方式，用于加速 Zilliz Cloud 中 GEOMETRY（几何类型）字段 的查询。 | Cloud"
type: origin
token: Od2IwGgxIi3UK8k7qIDcQBBVnDe
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# RTREE

RTREE 索引是一种基于树形结构的数据索引方式，用于加速 Zilliz Cloud 中 **GEOMETRY（几何类型）字段** 的查询。

如果你的 Collection 存储了点（Point）、线（Line）或多边形（Polygon）等以 [Well-known text (WKT)](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry) 格式表示的几何对象，并希望提升空间过滤性能，那么 RTREE 是理想的选择。

## 工作原理\{#how-it-works}

Zilliz Cloud 使用 RTREE 索引以高效地组织和过滤几何数据，主要分为两个阶段：

### 阶段 1：构建索引\{#phase-1-build-the-index}

1. **创建叶子节点**：为每个几何对象计算其最小外包矩形（MBR，Minimum Bounding Rectangle），即能完全包围该对象的最小矩形，并将其作为叶子节点存储。

1. **分组形成更大的矩形框**：将相邻的叶子节点聚类，并为每一组计算新的 MBR，形成内部节点。例如，分组 B 包含 D 和 E；分组 C 包含 F 和 G。

1. **添加根节点**：为所有内部节点添加一个根节点，其 MBR 覆盖所有下属分组，从而形成一个**高度平衡的树结构**。

![Y6VnwP4xQhQRnubMswfc9suBnyf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Y6VnwP4xQhQRnubMswfc9suBnyf.png)

### 阶段 2：加速查询\{#phase-2-accelerate-queries}

1. **生成查询 MBR**：为查询中使用的几何对象计算其 MBR。

1. **剪枝操作**：从根节点开始，将查询 MBR 与每个内部节点的 MBR 进行比较，跳过所有与查询 MBR 不相交的分支。

1. **收集候选节点**：进入相交的分支，收集可能匹配的叶子节点。

1. **精确匹配**：对候选节点执行精确的空间谓词判断，以确定真正的匹配对象。

## 创建 RTREE 索引 \{#create-rtree-index}

你可以在 Collection 的 GEOMETRY 字段上创建 RTREE 索引。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # Replace with your server address

# Assume you have defined a GEOMETRY field named "geo" in your collection schema

# Prepare index parameters
index_params = client.prepare_index_params()

# Add RTREE index on the "geo" field
# highlight-start
index_params.add_index(
    field_name="geo",
    index_type="RTREE",      # Spatial index for GEOMETRY
    index_name="rtree_geo",  # Optional, name your index
    params={}                # No extra params needed
)
# highlight-end

# Create the index on the collection
client.create_index(
    collection_name="geo_demo",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.index.request.CreateIndexReq;
import java.util.Collections;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

IndexParam indexParam = IndexParam.builder()
        .fieldName("geo")
        .indexName("rtree_geo")
        .indexType(IndexParam.IndexType.RTREE)
        .build();

client.createIndex(CreateIndexReq.builder()
        .collectionName("geo_demo")
        .indexParams(Collections.singletonList(indexParam))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer cli.Close(ctx)

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("geo_demo", "geo", index.NewRTreeIndex()).
    WithIndexName("rtree_geo"))
if err != nil {
    fmt.Println(err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let index_params = vec![
    IndexParam::new()
        .field_name("geo")
        .index_name("rtree_geo")
        .index_type(IndexType::Rtree),
];

let create_index_req = CreateIndexRequest::builder()
    .collection_name("geo_demo")
    .index_params(index_params)
    .build()?;

client.create_index(create_index_req).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::IndexDesc index("geo", "rtree_geo", milvus::IndexType::RTREE);

status = client->CreateIndex(milvus::CreateIndexRequest()
                                 .WithCollectionName("geo_demo")
                                 .WithIndexes({index}));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, IndexType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

await client.createIndex({
    collection_name: "geo_demo",
    field_name: "geo",
    index_type: IndexType.RTREE,
    index_name: "rtree_geo",
    params: {},
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "geo_demo",
    "indexParams": [
        {
            "fieldName": "geo",
            "indexName": "rtree_geo",
            "indexType": "RTREE",
            "metricType": "",
            "params": {}
        }
    ]
}' 
```

</TabItem>
</Tabs>

## 使用 RTREE 查询\{#query-with-rtree}

在过滤表达式中使用几何运算符（geometry operator）进行过滤。当目标 GEOMETRY 字段存在 RTREE 索引时，Zilliz Cloud 会自动利用索引进行候选剪枝；

若不存在索引，则会退化为全量扫描。

完整的几何运算符列表参见 [Geometry 操作符](./geometry-operators)。

### 示例 1：数据过滤\{#example-1-filter-only}

查找位于指定多边形范围内的所有几何对象：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter_expr = "ST_CONTAINS(geo, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')"

res = client.query(
    collection_name="geo_demo",
    filter=filter_expr,
    output_fields=["id", "geo"],
    limit=10
)
print(res)   # Expected: a list of rows where geo is entirely inside the polygon
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.Arrays;

String filter_expr = "ST_CONTAINS(geo, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')";

QueryResp resp = client.query(QueryReq.builder()
        .collectionName("geo_demo")
        .filter(filter_expr)
        .outputFields(Arrays.asList("id", "geo"))
        .limit(10)
        .build());
System.out.println(resp);
```

</TabItem>

<TabItem value='go'>

```go
filter_expr := "ST_CONTAINS(geo, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')"

_, err = cli.Query(ctx, milvusclient.NewQueryOption("geo_demo").
    WithFilter(filter_expr).
    WithOutputFields("id", "geo").
    WithLimit(10))
if err != nil {
    fmt.Println(err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let filter_expr = "ST_CONTAINS(geo, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')";

let query_req = QueryRequest::builder()
    .collection_name("geo_demo")
    .filter(filter_expr)
    .output_fields(vec!["id", "geo"])
    .limit(10)
    .build()?;

let res = client.query(query_req).await?;
println!("{:?}", res.results());
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <string>

std::string filter_expr = "ST_CONTAINS(geo, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')";

milvus::QueryResponse response;
status = client->Query(milvus::QueryRequest()
                           .WithCollectionName("geo_demo")
                           .WithFilter(filter_expr)
                           .WithOutputFields({"id", "geo"})
                           .WithLimit(10),
                       response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter_expr = "ST_CONTAINS(geo, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')";

const res = await client.query({
    collection_name: "geo_demo",
    filter: filter_expr,
    output_fields: ["id", "geo"],
    limit: 10,
});
console.log(res);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d @- <<'EOF'
{
    "collectionName": "geo_demo",
    "filter": "ST_CONTAINS(geo, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')",
    "outputFields": ["id", "geo"],
    "limit": 10
}
EOF
```

</TabItem>
</Tabs>

### 示例 2：向量搜索 + 空间过滤\{#vector-search-and-spatial-filter}

查找与指定线段相交的最近向量：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Assume you've also created an index on "vec" and loaded the collection.
query_vec = [[0.1, 0.2, 0.3, 0.4, 0.5]]
filter_expr = "ST_INTERSECTS(geo, 'LINESTRING (1 1, 2 2)')"

hits = client.search(
    collection_name="geo_demo",
    data=query_vec,
    limit=5,
    filter=filter_expr,
    output_fields=["id", "geo"]
)
print(hits)  # Expected: top-k by vector similarity among rows whose geo intersects the line
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;

float[] query_vec = {0.1f, 0.2f, 0.3f, 0.4f, 0.5f};
String filter_expr = "ST_INTERSECTS(geo, 'LINESTRING (1 1, 2 2)')";

SearchResp resp = client.search(SearchReq.builder()
        .collectionName("geo_demo")
        .data(Collections.singletonList(new FloatVec(query_vec)))
        .topK(5)
        .filter(filter_expr)
        .outputFields(Arrays.asList("id", "geo"))
        .build());
System.out.println(resp);
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/entity"

query_vec := []entity.Vector{entity.FloatVector{0.1, 0.2, 0.3, 0.4, 0.5}}
filter_expr := "ST_INTERSECTS(geo, 'LINESTRING (1 1, 2 2)')"

_, err = cli.Search(ctx, milvusclient.NewSearchOption("geo_demo", 5, query_vec).
    WithFilter(filter_expr).
    WithOutputFields("id", "geo"))
if err != nil {
    fmt.Println(err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let query_vec = vec![0.1f32, 0.2, 0.3, 0.4, 0.5];
let filter_expr = "ST_INTERSECTS(geo, 'LINESTRING (1 1, 2 2)')";

let search_req = SearchRequest::builder()
    .collection_name("geo_demo")
    .vector_field("vec")
    .vectors(SearchVectors::Float(vec![query_vec]))
    .filter(filter_expr)
    .output_fields(vec!["id", "geo"])
    .limit(5)
    .build()?;

let res = client.search(search_req).await?;
println!("{:?}", res.results());
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <vector>
#include <string>

std::vector<float> query_vec = {0.1f, 0.2f, 0.3f, 0.4f, 0.5f};
std::string filter_expr = "ST_INTERSECTS(geo, 'LINESTRING (1 1, 2 2)')";

milvus::SearchResponse response;
status = client->Search(milvus::SearchRequest()
                            .WithCollectionName("geo_demo")
                            .WithLimit(5)
                            .WithAnnsField("vec")
                            .WithFilter(filter_expr)
                            .WithOutputFields({"id", "geo"})
                            .AddFloatVector(query_vec),
                        response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const query_vec = [0.1, 0.2, 0.3, 0.4, 0.5];
const filter_expr = "ST_INTERSECTS(geo, 'LINESTRING (1 1, 2 2)')";

const res = await client.search({
    collection_name: "geo_demo",
    anns_field: "vec",
    data: [query_vec],
    limit: 5,
    filter: filter_expr,
    output_fields: ["id", "geo"],
});
console.log(res);
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
-d @- <<'EOF'
{
    "collectionName": "geo_demo",
    "annsField": "vec",
    "data": [[0.1, 0.2, 0.3, 0.4, 0.5]],
    "limit": 5,
    "filter": "ST_INTERSECTS(geo, 'LINESTRING (1 1, 2 2)')",
    "outputFields": ["id", "geo"]
}
EOF
```

</TabItem>
</Tabs>

更多关于 GEOMETRY 字段的使用方法，请参见 [Geometry 类型](./use-geometry-field)。

## 删除索引\{#drop-an-index}

您也可以使用 `drop_index()` 从 Collection 中删除指定字段上的索引。

<Admonition type="info" title="说明">

如果您的集群与 Milvus v2.6.x 兼容，您可以删除标量字段上的索引，无须对 Collection 执行 Release 操作。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_index(
    collection_name="geo_demo",   # Name of the collection
    index_name="rtree_geo" # Name of the index to drop
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.index.request.DropIndexReq;

client.dropIndex(DropIndexReq.builder()
        .collectionName("geo_demo")
        .indexName("rtree_geo")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err = cli.DropIndex(ctx, milvusclient.NewDropIndexOption("geo_demo", "rtree_geo"))
if err != nil {
    fmt.Println(err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let drop_index_req = DropIndexRequest::builder()
    .collection_name("geo_demo")
    .index_name("rtree_geo")
    .build()?;

client.drop_index(drop_index_req).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
status = client->DropIndex(milvus::DropIndexRequest()
                               .WithCollectionName("geo_demo")
                               .WithIndexName("rtree_geo"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.dropIndex({
    collection_name: "geo_demo",
    index_name: "rtree_geo",
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "geo_demo",
    "indexName": "rtree_geo"
}' 
```

</TabItem>
</Tabs>

