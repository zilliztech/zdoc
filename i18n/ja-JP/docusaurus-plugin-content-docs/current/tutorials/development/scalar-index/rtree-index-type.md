---
title: "RTREE | Cloud"
slug: /rtree-index-type
sidebar_label: "RTREE"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`RTREE` インデックスは、Zilliz Cloud における `GEOMETRY` フィールドのクエリを高速化するツリーベースのデータ構造です。コレクションにポイント、ライン、ポリゴンなどのジオメトリオブジェクトが Well-known text (WKT) 形式で保存されており、空間フィルタリングを高速化したい場合、`RTREE` は理想的な選択です。 | Cloud"
type: origin
token: RlY2wylVQiZswikT0G2cBHVznTf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# RTREE

`RTREE` インデックスは、Zilliz Cloud における `GEOMETRY` フィールドのクエリを高速化するツリーベースのデータ構造です。コレクションにポイント、ライン、ポリゴンなどのジオメトリオブジェクトが [Well-known text (WKT)](https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry) 形式で保存されており、空間フィルタリングを高速化したい場合、`RTREE` は理想的な選択です。

## 仕組み\{#how-it-works}

Zilliz Cloud は `RTREE` インデックスを使用してジオメトリデータを効率的に整理・フィルタリングし、次の 2 段階のプロセスに従います。

### フェーズ 1: インデックスの構築\{#phase-1-build-the-index}

1. **リーフノードを作成する:** 各ジオメトリオブジェクトについて、そのオブジェクトを完全に含む最小の矩形である [Minimum Bounding Rectangle](https://en.wikipedia.org/wiki/Minimum_bounding_rectangle)（MBR）を計算し、リーフノードとして保存します。

1. **より大きなボックスにグループ化する:** 近接するリーフノードをまとめてクラスター化し、各グループを新しい MBR で包んで内部ノードを形成します。たとえば、グループ **B** には **D** と **E** が含まれ、グループ **C** には **F** と **G** が含まれます。

1. **ルートノードを追加する:** すべての内部グループを覆う MBR を持つルートノードを追加し、高さバランスの取れたツリー構造を作成します。

![Asy8w0umqh9jJ1biNUHcialonfd](https://zdoc-images.s3.us-west-2.amazonaws.com/Asy8w0umqh9jJ1biNUHcialonfd.png)

### フェーズ 2: クエリの高速化\{#phase-2-accelerate-queries}

1. **クエリ MBR を形成する:** クエリジオメトリの MBR を計算します。

1. **ブランチを枝刈りする:** ルートから開始し、クエリ MBR を各内部ノードと比較します。MBR がクエリ MBR と交差しないブランチはスキップします。

1. **候補を収集する:** 交差するブランチへ降下し、候補となるリーフノードを集めます。

1. **完全一致:** 各候補に対して正確な空間述語を実行し、真の一致を判定します。

## RTREE インデックスを作成する\{#create-an-rtree-index}

コレクションスキーマで定義された `GEOMETRY` フィールドに `RTREE` インデックスを作成できます。

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

## RTREE を使ってクエリする\{#query-with-rtree}

`filter` 式でジオメトリ演算子を使用してフィルタリングします。対象の `GEOMETRY` フィールドに `RTREE` が存在する場合、Zilliz Cloud は自動的にそれを使用して候補を枝刈りします。インデックスがない場合、フィルターはフルスキャンにフォールバックします。

利用可能なジオメトリ専用演算子の完全な一覧については、[ジオメトリ演算子](./geometry-operators) を参照してください。

### 例 1: フィルタのみ\{#example-1-filter-only}

指定したポリゴン内にあるすべてのジオメトリオブジェクトを検索します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter_expr = "ST_WITHIN(geo, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')"

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

String filter_expr = "ST_WITHIN(geo, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')";

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
filter_expr := "ST_WITHIN(geo, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')"

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

let filter_expr = "ST_WITHIN(geo, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')";

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

std::string filter_expr = "ST_WITHIN(geo, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')";

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
const filter_expr = "ST_WITHIN(geo, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')";

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
    "filter": "ST_WITHIN(geo, 'POLYGON ((0 0, 10 0, 10 10, 0 10, 0 0))')",
    "outputFields": ["id", "geo"],
    "limit": 10
}
EOF
```

</TabItem>
</Tabs>

### 例 2: ベクトル検索 + 空間フィルター\{#example-2-vector-search-spatial-filter}

ラインと交差する最も近いベクトルを検索します。

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

`GEOMETRY` フィールドの使用方法の詳細については、[ジオメトリフィールド](./use-geometry-field) を参照してください。

## インデックスを削除する\{#drop-an-index}

`drop_index()` メソッドを使用して、コレクションから既存のインデックスを削除します。

<Admonition type="info" title="Notes">

**Milvus v2.6.x** と互換性のあるクラスターでは、不要になったスカラーインデックスを直接削除できます。事前にコレクションをリリースする必要はありません。

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
