---
title: "STL_SORT | クラウド"
slug: /slt-sort-index-type
sidebar_label: "STL_SORT"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "`STLSORT` インデックスは、データをソートされた順序で整理することで、Zilliz Cloud 内の数値フィールド（INT8、INT16 など）、`VARCHAR` フィールド、または `TIMESTAMPTZ` フィールドのクエリパフォーマンスを向上させるために特別に設計されたインデックスタイプです。 | クラウド"
type: origin
token: YBYmwvx68iMKFRknytJccwk0nPf
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# STL_SORT

`STL_SORT` インデックスは、データをソートされた順序で整理することで、Zilliz Cloud 内の数値フィールド（INT8、INT16 など）、`VARCHAR` フィールド、または `TIMESTAMPTZ` フィールドのクエリパフォーマンスを向上させるために特別に設計されたインデックスタイプです。

次のようなクエリを頻繁に実行する場合は、`STL_SORT` インデックスを使用してください。

- `==`、`!=`、`>`、`<`、`>=`、`<=` 演算子を使用した比較フィルタリング

- `IN` 演算子と `LIKE` 演算子を使用した範囲フィルタリング

## サポートされるデータ型\{#supported-data-types}

- 数値フィールド（例：`INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、`DOUBLE`）。詳細については、[Boolean & Number](./use-number-field) を参照してください。

- `VARCHAR` フィールド。詳細については、[String Field](./use-string-field) を参照してください。

- `TIMESTAMPTZ` フィールド。詳細については、[TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。

## 仕組み\{#how-it-works}

Zilliz Cloud は `STL_SORT` を 2つのフェーズで実装しています。

1. **インデックスを構築する**

    - 取り込み時に、Zilliz Cloud はインデックス対象フィールドのすべての値を収集します。

    - 値は、C++ STL の [std::sort](https://en.cppreference.com/w/cpp/algorithm/sort.html) を使用して昇順にソートされます。

    - 各値はエンティティ ID とペアにされ、ソートされた配列がインデックスとして永続化されます。

1. **クエリを高速化する**

    - クエリ時に、Zilliz Cloud はソートされた配列に対して **二分探索**（[std::lower_bound](https://en.cppreference.com/w/cpp/algorithm/lower_bound.html) と [std::upper_bound](https://en.cppreference.com/w/cpp/algorithm/upper_bound.html)）を使用します。

    - 等価検索の場合、Zilliz Cloud は一致するすべての値をすばやく見つけます。

    - 範囲検索の場合、Zilliz Cloud は開始位置と終了位置を特定し、その間のすべての値を返します。

    - 一致するエンティティ ID は、最終的な結果の組み立てのためにクエリ実行エンジンに渡されます。

これにより、クエリの計算量が **O(n)**（フルスキャン）から **O(log n + m)** に削減されます。ここで、*m* は一致件数です。

## STL_SORT インデックスを作成する\{#create-an-stlsort-index}

数値、`VARCHAR`、または `TIMESTAMPTZ` フィールドに `STL_SORT` インデックスを作成できます。追加のパラメーターは必要ありません。

次の例では、`TIMESTAMPTZ` フィールドに `STL_SORT` インデックスを作成する方法を示します。

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

## インデックスを削除する\{#drop-an-index}

コレクションから既存のインデックスを削除するには、`drop_index()` メソッドを使用します。

<Admonition type="info" title="Notes">

**Milvus v2.6.x** と互換性のあるクラスターでは、不要になったスカラーインデックスを直接削除できます。コレクションを先にリリースする必要はありません。

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

## 使用上の注意\{#usage-notes}

- **フィールド型:** 数値、`VARCHAR`、`TIMESTAMPTZ` フィールドで動作します。データ型の詳細については、[Boolean & Number](./use-number-field) と [TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。

- **パラメーター:** インデックスパラメーターは必要ありません。

- **Mmap 非対応:** `STL_SORT` ではメモリマップモードを利用できません。
