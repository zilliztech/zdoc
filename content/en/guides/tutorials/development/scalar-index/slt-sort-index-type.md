---
title: "STL_SORT | Cloud"
slug: /slt-sort-index-type
sidebar_label: "STL_SORT"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The `STLSORT` index is an index type specifically designed to enhance query performance on numeric fields (INT8, INT16, etc.), `VARCHAR` fields, or `TIMESTAMPTZ` fields within Zilliz Cloud by organizing the data in a sorted order. | Cloud"
type: origin
token: YBYmwvx68iMKFRknytJccwk0nPf
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# STL_SORT

The `STL_SORT` index is an index type specifically designed to enhance query performance on numeric fields (INT8, INT16, etc.), `VARCHAR` fields, or `TIMESTAMPTZ` fields within Zilliz Cloud by organizing the data in a sorted order.

Use the `STL_SORT` index if you frequently run queries with:

- Comparison filtering with `==`, `!=`, `>`, `<`, `>=`, and `<=` operators

-  Range filtering with `IN` and `LIKE` operators

## Supported data types\{#supported-data-types}

- Numeric fields (e.g., `INT8`, `INT16`, `INT32`, `INT64`, `FLOAT`, `DOUBLE`). For details, refer to [Boolean & Number](./use-number-field).

- `VARCHAR` fields. For details, refer to [String Field](./use-string-field).

- `TIMESTAMPTZ` fields. For details, refer to [TIMESTAMPTZ Field](./use-timestamptz-field).

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

## Create an STL_SORT index\{#create-an-stlsort-index}

You can create an `STL_SORT` index on a numeric, `VARCHAR`, or `TIMESTAMPTZ` field. No extra parameters are required.

The example below shows how to create an `STL_SORT` index on a `TIMESTAMPTZ` field:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Assume you have defined a TIMESTAMPTZ field named "tsz" in your collection schema

# Prepare index parameters

index_params = client.prepare_index_params()

# Add STL_SORT index on the "tsz" field

index_params.add_index(

    field_name="tsz",

    index_type="STL_SORT",

    index_name="tsz_index",

    params={}

)

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

```c++
#include <iostream>

#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

if (!status.IsOk()) {

    std::cout << status.Message() << std::endl;

}

status = client->CreateIndex(milvus::CreateIndexRequest().WithCollectionName("tsz_demo")

        .AddIndex(milvus::IndexDesc("tsz", "tsz_index", milvus::IndexType::STL_SORT, milvus::MetricType::L2)));

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

<Admonition type="info" title="Notes">

In your cluster compatible with **Milvus v2.6.x**, you can drop a scalar index directly once it’s no longer needed—no need to release the collection first.

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_index(

    collection_name="tsz_demo",

    index_name="tsz_index"

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

```c++
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

## Usage notes\{#usage-notes}

- **Field types:** Works with numeric, `VARCHAR`, and `TIMESTAMPTZ` fields. For more information on data types, refer to [Boolean & Number](./use-number-field) and [TIMESTAMPTZ Field](./use-timestamptz-field).

- **Parameters:** No index parameters are needed.

- **Mmap not supported:** Memory-mapped mode is not available for `STL_SORT`.

