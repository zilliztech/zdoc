---
title: "BITMAP | Cloud"
slug: /bitmap-index-type
sidebar_label: "BITMAP"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ビットマップインデックスは、カーディナリティの低いスカラーフィールドに対するクエリパフォーマンスを向上させるために設計された効率的なインデックス手法です。カーディナリティとは、フィールド内の異なる値の数を指します。異なる要素が少ないフィールドは、カーディナリティが低いと見なされます。 | Cloud"
type: origin
token: SkJtwgkCDiGYeOkakIgcLT46nee
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# BITMAP

ビットマップインデックスは、カーディナリティの低いスカラーフィールドに対するクエリパフォーマンスを向上させるために設計された効率的なインデックス手法です。カーディナリティとは、フィールド内の異なる値の数を指します。異なる要素が少ないフィールドは、カーディナリティが低いと見なされます。

このインデックスタイプは、フィールド値をコンパクトなバイナリ形式で表現し、それらに対して効率的なビット演算を実行することで、スカラークエリの取得時間を短縮するのに役立ちます。他のタイプのインデックスと比較して、ビットマップインデックスは一般に、カーディナリティの低いフィールドを扱う際のスペース効率が高く、クエリ速度も高速です。

## 概要\{#overview}

**Bitmap** という用語は、**Bit** と **Map** の 2 つの単語を組み合わせたものです。ビットはコンピューターにおけるデータの最小単位であり、**0** か **1** のいずれかの値しか保持できません。ここでのマップとは、0 と 1 にどの値を割り当てるかに従ってデータを変換および整理するプロセスを指します。

ビットマップインデックスは、ビットマップとキーという 2 つの主要なコンポーネントで構成されます。キーは、インデックス対象フィールド内の一意な値を表します。一意な値ごとに、対応するビットマップが存在します。これらのビットマップの長さは、コレクション内のレコード数と同じです。ビットマップ内の各ビットは、コレクション内の 1 つのレコードに対応します。レコード内のインデックス対象フィールドの値がキーと一致する場合、対応するビットは **1** に設定され、それ以外の場合は **0** に設定されます。

フィールド **Category** と **Public** を持つドキュメントのコレクションを考えます。**Tech** カテゴリに属し、**Public** に公開されているドキュメントを取得したいとします。この場合、ビットマップインデックスのキーは **Tech** と **Public** です。

![S5cHwsXsPhOLfQb3Tatc4jqAn9e](https://zdoc-images.s3.us-west-2.amazonaws.com/S5cHwsXsPhOLfQb3Tatc4jqAn9e.png)

図に示すように、**Category** と **Public** のビットマップインデックスは次のとおりです。

- **Tech**: [1, 0, 1, 0, 0]。これは、1 番目と 3 番目のドキュメントのみが **Tech** カテゴリに属することを示しています。

- **Public**: [1, 0, 0, 1, 0]。これは、1 番目と 4 番目のドキュメントのみが **Public** に公開されていることを示しています。

両方の条件に一致するドキュメントを検索するには、これら 2 つのビットマップに対してビット単位の AND 演算を実行します。

- **Tech** AND **Public**: [1, 0, 0, 0, 0]

結果として得られるビットマップ [1, 0, 0, 0, 0] は、最初のドキュメント（**ID** **1**）のみが両方の条件を満たすことを示しています。ビットマップインデックスと効率的なビット演算を使用することで、検索範囲を迅速に絞り込むことができ、データセット全体をスキャンする必要がなくなります。

## ビットマップインデックスを作成する\{#create-a-bitmap-index}

Zilliz Cloud でビットマップインデックスを作成するには、`create_index()` メソッドを使用し、`index_type` パラメーターを `"BITMAP"` に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(

    uri="YOUR_CLUSTER_ENDPOINT",
)

index_params = client.prepare_index_params()

index_params.add_index(

    field_name="category",
    index_type="BITMAP",
    index_name="category_bitmap_index"
)

client.create_index(

    collection_name="my_collection",
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

        .collectionName("my_collection")

        .indexParams(Collections.singletonList(IndexParam.builder()

                .fieldName("category")

                .indexType(IndexParam.IndexType.BITMAP)

                .indexName("category_bitmap_index")

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

_, err = cli.CreateIndex(ctx, milvusclient.NewCreateIndexOption("my_collection", "category", index.NewBitmapIndex()).WithIndexName("category_bitmap_index"))

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

            .collection_name("my_collection")

            .index_param(

                IndexParam::new()

                    .field_name("category")

                    .index_type(IndexType::Bitmap)

                    .index_name("category_bitmap_index"),
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

status = client->CreateIndex(milvus::CreateIndexRequest().WithCollectionName("my_collection")

        .AddIndex(milvus::IndexDesc("category", "category_bitmap_index", milvus::IndexType::BITMAP, milvus::MetricType::L2)));

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
    collection_name: "my_collection",
    field_name: "category",
    index_type: "BITMAP",
    index_name: "category_bitmap_index",
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
    "collectionName": "my_collection",
    "indexParams": [
        {
            "fieldName": "category",
            "indexName": "category_bitmap_index",
            "indexType": "BITMAP"
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

この例では、`my_collection` コレクションの `category` フィールドにビットマップインデックスを作成します。`add_index()` メソッドは、フィールド名、インデックスタイプ、インデックス名を指定するために使用します。

ビットマップインデックスを作成すると、クエリ操作で `filter` パラメーターを使用し、インデックス対象フィールドに基づいてスカラーフィルタリングを実行できます。これにより、ビットマップインデックスを使用して検索結果を効率的に絞り込むことができます。詳細については、[フィルタリングの説明](./filtering-overview) を参照してください。

## インデックスを削除する\{#drop-an-index}

コレクションから既存のインデックスを削除するには、`drop_index()` メソッドを使用します。

<Admonition type="info" title="Notes">

**Milvus v2.6.x** 互換のクラスターでは、不要になったスカラーインデックスを直接削除できます。先にコレクションを解放する必要はありません。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_index(
    collection_name="my_collection",   # Name of the collection
    index_name="category_bitmap_index" # Name of the index to drop
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

        .collectionName("my_collection")

        .indexName("category_bitmap_index")

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

err = cli.DropIndex(ctx, milvusclient.NewDropIndexOption("my_collection", "category_bitmap_index"))

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

            .collection_name("my_collection")

            .index_name("category_bitmap_index")

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

        .WithCollectionName("my_collection")

        .WithIndexName("category_bitmap_index"));

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
    collection_name: "my_collection",
    index_name: "category_bitmap_index",
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
    "collectionName": "my_collection",
    "indexName": "category_bitmap_index"
}'

# {
#     "code": 0,
#     "data": {}
# }
```

</TabItem>
</Tabs>

## 制限事項\{#limits}

- ビットマップインデックスは、プライマリキーではないスカラーフィールドでのみサポートされます。

- フィールドのデータ型は、次のいずれかである必要があります。

    - `BOOL`, `INT8`, `INT16`, `INT32`, `INT64`, `VARCHAR`

    - `ARRAY`（要素は `BOOL`、`INT8`、`INT16`、`INT32`、`INT64`、`VARCHAR` のいずれかである必要があります）

- ビットマップインデックスは、次のデータ型をサポートしていません。

    - `FLOAT`、`DOUBLE`: 浮動小数点型は、ビットマップインデックスのバイナリとしての性質と互換性がありません。

    - `JSON`: JSON データ型は構造が複雑であるため、ビットマップインデックスを使用して効率的に表現できません。

- ビットマップインデックスは、カーディナリティの高いフィールド（つまり、異なる値の数が多いフィールド）には適していません。

    - 一般的な目安として、ビットマップインデックスはフィールドのカーディナリティが 500 未満の場合に最も効果的です。

    - カーディナリティがこのしきい値を超えて増加すると、ビットマップインデックスのパフォーマンス上の利点は減少し、ストレージのオーバーヘッドが大きくなります。

    - カーディナリティの高いフィールドでは、特定のユースケースとクエリ要件に応じて、転置インデックスなどの代替のインデックス手法の使用を検討してください。

