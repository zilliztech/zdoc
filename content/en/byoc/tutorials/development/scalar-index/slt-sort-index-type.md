---
title: "STL_SORT | BYOC"
slug: /slt-sort-index-type
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The STL_SORT index is an index type specifically designed to enhance query performance on numeric fields (INT8, INT16, etc.), VARCHAR fields, or TIMESTAMPTZ fields by organizing the data in a sorted order. | BYOC"
type: origin
displayed_sidebar: default
token: shared-slt-sort-index-type
sidebar_label: "STL_SORT"
sidebar_position: 6
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/indexes/scalar/stl-sort.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# STL_SORT

<NextChannel action="exclude">

The `STL_SORT` index is an index type specifically designed to enhance query performance on numeric fields (INT8, INT16, etc.), `VARCHAR` fields, or `TIMESTAMPTZ` fields within Zilliz Cloud by organizing the data in a sorted order.

Use the `STL_SORT` index if you frequently run queries with:

- Comparison filtering with `==`, `!=`, `>`, `<`, `>=`, and `<=` operators

-  Range filtering with `IN` and `LIKE` operators

## Supported data types\{#supported-data-types}

</NextChannel>

<NextChannel action="include">

`STL_SORT` stores values in sorted order to accelerate value lookups, range filters, and string prefix matching.

## Overview\{#overview}

<a id="supported-data-types"></a>

### Supported data types\{#supported-data-types-next}

</NextChannel>

- Numeric fields (e.g., `INT8`, `INT16`, `INT32`, `INT64`, `FLOAT`, `DOUBLE`). For details, refer to [Boolean & Number](./use-number-field).

- `VARCHAR` fields. For details, refer to [String Field](./use-string-field).

- `TIMESTAMPTZ` fields. For details, refer to [TIMESTAMPTZ Field](./use-timestamptz-field).

<NextChannel action="exclude">

## How it works\{#how-it-works}

Zilliz Cloud implements `STL_SORT` in two phases:

1. **Build index**

    - During ingestion, Zilliz Cloud collects all values for the indexed field.

    - The values are sorted in ascending order using C++ STL’s [std::sort](https://en.cppreference.com/w/cpp/algorithm/sort.html).

    - Each value is paired with its entity ID, and the sorted array is persisted as the index.

1. **Accelerate queries**

    - At query time, Zilliz Cloud uses **binary search** ([std::lower_bound](https://en.cppreference.com/w/cpp/algorithm/lower_bound.html) and [std::upper_bound](https://en.cppreference.com/w/cpp/algorithm/upper_bound.html)) on the sorted array.

    - For equality, Zilliz Cloud quickly finds all matching values.

    - For ranges, Zilliz Cloud locates the start and end positions and returns all values in between.

    - Matching entity IDs are passed to the query executor for final result assembly.

This reduces query complexity from **O(n)** (full scan) to **O(log n + m)**, where *m* is the number of matches.

</NextChannel>

<NextChannel action="include">

For numeric, VARCHAR, or TIMESTAMPTZ subfields in a StructArray, see [Index StructArray Fields](./index-struct-array#create-scalar-indexes). Ordinary ARRAY fields do not support `STL_SORT`; see [Array index support](./use-array-fields#Array-index-support) for their index choices.

For JSON paths cast to `DOUBLE` or `VARCHAR`, check the [JSON index requirements](./json-indexing#index-requirements) before choosing `STL_SORT`.

<a id="queries-accelerated-by-stlsort"></a>
<a id="Queries-accelerated-by-STLSORT"></a>

<a id="supported-filters"></a>
<a id="Supported-filters"></a>

### Filter acceleration\{#filter-acceleration}

An `STL_SORT` index can help evaluate the following conditions, subject to field and cast compatibility:

- Equality (`==`, `!=`) and membership (`in`, `not in`).
- Ranges: `<`, `<=`, `>`, `>=`, including intervals such as `10 <= price < 50`.
- VARCHAR prefix matching, such as `name LIKE "abc%"`.
- Comparisons on eligible JSON scalar paths. See [JSON filters](./json-indexing#Supported-filters).

For suffix, substring, general LIKE, and regex filters, Zilliz Cloud can evaluate the pattern against strings stored in the index. This can require visiting many distinct strings. See [Pattern Matching](./pattern-match) for syntax and planning simplifications.

<Admonition type="info" icon="📘" title="Notes">

> These are index capabilities, not limits on valid filter expressions. See [Scalar Index](./scalar-index-overview#Filter-execution) for shared lookup constraints. For `AND`, `OR`, `NOT`, and NULL tests (`IS NULL`, `IS NOT NULL`), see [Basic Operators](./basic-filtering-operators).

</Admonition>

<a id="usage-notes"></a>
<a id="Usage-notes"></a>

### Memory considerations\{#memory-considerations}

Explicit `STL_SORT` indexes do not support memory-mapped mode.

For numeric and timestamp fields with no NULL values, use these rough estimates in bytes. `N` is the number of entities:

| Field type | Estimate |
| --- | --- |
| `INT8`, `INT16`, `INT32`, `FLOAT` | `12 * N` |
| `INT64`, `DOUBLE`, `TIMESTAMPTZ` | `20 * N` |
| `VARCHAR` | Measure with representative data; loaded memory depends on string storage, distinct values, and posting-list capacity. |

Divide by `1024 * 1024` to convert bytes to MiB. One million non-NULL INT64 values require roughly 19 MiB for the main index structures. Measure VARCHAR indexes after loading: serialized index size does not include all in-memory string and posting-list allocations.

These rough estimates cover loaded index memory with memory mapping disabled. Calculate them per segment, then sum across loaded segments and replicas.

<Admonition type="info" icon="📘" title="Notes">

> Allow extra memory for loaded field data, vector indexes, collection and index overhead, and temporary allocations. Validate with representative data and queries; arrays, JSON, older index formats, and memory mapping require separate measurement.

</Admonition>

<a id="how-it-works"></a>
<a id="How-it-works"></a>

### How STL_SORT works\{#how-stlsort-works}

<details>
<summary><strong>View the sorting and lookup process</strong></summary>

During index building, Zilliz Cloud pairs field values with entity IDs, sorts them in ascending order using [std::sort](https://en.cppreference.com/w/cpp/algorithm/sort.html), and persists the sorted array.

For equality and range queries, binary search ([std::lower_bound](https://en.cppreference.com/w/cpp/algorithm/lower_bound.html) and [std::upper_bound](https://en.cppreference.com/w/cpp/algorithm/upper_bound.html)) locates the matching interval. The query executor receives the entity IDs in that interval.

This reduces query complexity from **O(n)** (full scan) to **O(log n + m)**, where *m* is the number of matches.

</details>

</NextChannel>

## Create an STL_SORT index\{#create-an-stlsort-index}

<NextChannel action="exclude">

You can create an `STL_SORT` index on a numeric, `VARCHAR`, or `TIMESTAMPTZ` field. No extra parameters are required.

The example below shows how to create an `STL_SORT` index on a `TIMESTAMPTZ` field:

</NextChannel>

<NextChannel action="include">

Set `index_type` to `STL_SORT`; no extra index parameters are required. This example indexes a `TIMESTAMPTZ` field:

</NextChannel>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Assume you have defined a TIMESTAMPTZ field named "tsz" in your collection schema

# Prepare index parameters
index_params = client.prepare_index_params()

# Add STL_SORT index on the "tsz" field
# highlight-start
index_params.add_index(
    field_name="tsz",
    index_type="STL_SORT",   # Index for TIMESTAMPTZ
    index_name="tsz_index",  # Optional, name your index
    params={}                # No extra params needed
)
# highlight-end

# Create the index on the collection
client.create_index(
    collection_name="tsz_demo",
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
        .build());

client.createIndex(CreateIndexReq.builder()
        .collectionName("tsz_demo")
        .indexParams(Collections.singletonList(IndexParam.builder()
                .fieldName("tsz")
                .indexType(IndexParam.IndexType.STL_SORT)
                .indexName("tsz_index")
                .build()))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})

if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("tsz_demo", "tsz", index.NewSortedIndex()).WithIndexName("tsz_index"))

if err != nil {
    log.Fatal("failed to create index: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");

let client = ClientV2::new(&config).await?;

client
    .create_index(
        CreateIndexRequest::builder()
            .collection_name("tsz_demo")
            .index_param(
                IndexParam::new()
                    .field_name("tsz")
                    .index_type(IndexType::StlSort)
                    .index_name("tsz_index"),
            )
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateIndex(milvus::CreateIndexRequest().WithCollectionName("tsz_demo")
        .AddIndex(milvus::IndexDesc("tsz", "tsz_index", milvus::IndexType::STL_SORT)));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

await client.createIndex({
    collection_name: "tsz_demo",
    field_name: "tsz",
    index_type: "STL_SORT",
    index_name: "tsz_index",
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
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "tsz_demo",
    "indexParams": [
        {
            "fieldName": "tsz",
            "indexName": "tsz_index",
            "indexType": "STL_SORT"
        }
    ]
}'

# {
#     "code": 0,
#     "data": {}
# }
```

</TabItem>

</Tabs>

## Drop an index\{#drop-an-index}

Use the `drop_index()` method to remove an existing index from a collection.

<NextChannel action="exclude">

<Admonition type="info" icon="📘" title="Notes">

In your cluster compatible with **Milvus v2.6.x**, you can drop a scalar index directly once it’s no longer needed—no need to release the collection first.

</Admonition>

</NextChannel>

<NextChannel action="include">

<Admonition type="info" icon="📘" title="Notes">

> For release requirements when dropping a scalar index, see [Scalar Index](./scalar-index-overview#Drop-index-compatibility).

</Admonition>

</NextChannel>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_index(
    collection_name="tsz_demo",   # Name of the collection
    index_name="tsz_index" # Name of the index to drop
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.index.request.DropIndexReq;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

client.dropIndex(DropIndexReq.builder()
        .collectionName("tsz_demo")
        .indexName("tsz_index")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})

if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

err = cli.DropIndex(ctx, milvusclient.NewDropIndexOption("tsz_demo", "tsz_index"))

if err != nil {
    log.Fatal("failed to drop index: ", err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");

let client = ClientV2::new(&config).await?;

client
    .drop_index(
        DropIndexRequest::builder()
            .collection_name("tsz_demo")
            .index_name("tsz_index")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->DropIndex(milvus::DropIndexRequest()
        .WithCollectionName("tsz_demo")
        .WithIndexName("tsz_index"));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

await client.dropIndex({
    collection_name: "tsz_demo",
    index_name: "tsz_index",
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
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "tsz_demo",
    "indexName": "tsz_index"
}'

# {
#     "code": 0,
#     "data": {}
# }
```

</TabItem>

</Tabs>

<NextChannel action="exclude">

## Usage notes\{#usage-notes}

- **Field types:** Works with numeric, `VARCHAR`, and `TIMESTAMPTZ` fields. For more information on data types, refer to [Boolean & Number](./use-number-field) and [TIMESTAMPTZ Field](./use-timestamptz-field).

- **Parameters:** No index parameters are needed.

- **Mmap not supported:** Memory-mapped mode is not available for `STL_SORT`.

</NextChannel>
