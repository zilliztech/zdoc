---
title: "BITMAP | BYOC"
slug: /bitmap-index-type
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ビットマップインデックスは、カーディナリティの低いスカラーフィールドに対するクエリパフォーマンスを向上させるために設計された効率的なインデックス手法です。カーディナリティとは、フィールド内の異なる値の数を指します。異なる要素が少ないフィールドは、低カーディナリティと見なされます。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-bitmap-index-type
sidebar_label: "BITMAP"
sidebar_position: 2
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/indexes/scalar/bitmap.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# BITMAP

<NextChannel action="exclude">

ビットマップインデックスは、カーディナリティの低いスカラーフィールドに対するクエリパフォーマンスを向上させるために設計された効率的なインデックス手法です。カーディナリティとは、フィールド内の異なる値の数を指します。異なる要素が少ないフィールドは、低カーディナリティと見なされます。

このインデックスタイプは、フィールド値をコンパクトなバイナリ形式で表現し、それらに対して効率的なビット演算を実行することで、スカラークエリの取得時間を短縮するのに役立ちます。他のタイプのインデックスと比較して、ビットマップインデックスは通常、低カーディナリティのフィールドを扱う場合に高い空間効率と高速なクエリ速度を実現します。

</NextChannel>

<NextChannel action="include">

`BITMAP` は、ステータスコードやカテゴリなど、異なる値が少ないフィールドに対するスカラーフィルタリングを高速化します。カーディナリティとは、フィールド内の異なる値の数です。このページでは、サポートされるフィルター、フィールドの制約、およびインデックスの作成方法について説明します。

</NextChannel>

## 概要\{#overview}

<NextChannel action="exclude">

**ビットマップ** という用語は、**ビット** と **マップ** という 2 つの単語を組み合わせたものです。ビットは、コンピューターにおけるデータの最小単位を表し、**0** または **1** のいずれかの値しか保持できません。ここでのマップとは、0 と 1 にどの値を割り当てるかに従ってデータを変換および整理するプロセスを指します。

ビットマップインデックスは、ビットマップとキーという 2 つの主要なコンポーネントで構成されます。キーは、インデックス対象のフィールド内の一意の値を表します。一意の値ごとに、対応するビットマップが存在します。これらのビットマップの長さは、コレクション内のレコード数と同じです。ビットマップ内の各ビットは、コレクション内の 1 つのレコードに対応します。レコード内のインデックス対象フィールドの値がキーと一致する場合、対応するビットは **1** に設定され、それ以外の場合は **0** に設定されます。

**Category** と **Public** というフィールドを持つドキュメントのコレクションを考えてみましょう。**Tech** カテゴリに属し、**Public** に公開されているドキュメントを取得したいとします。この場合、ビットマップインデックスのキーは **Tech** と **Public** です。

![ビットマップ](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/cb98c77741e110603c84b20f34c1273ba3b902680d68767bc8990d0fc27d8c3d.png)

図に示すように、**Category** と **Public** のビットマップインデックスは次のとおりです。

- **Tech**: [1, 0, 1, 0, 0]。これは、1 番目と 3 番目のドキュメントのみが **Tech** カテゴリに属していることを示しています。

- **Public**: [1, 0, 0, 1, 0]。これは、1 番目と 4 番目のドキュメントのみが **Public** に公開されていることを示しています。

両方の条件に一致するドキュメントを見つけるには、これら 2 つのビットマップに対してビット単位の AND 演算を実行します。

- **Tech** AND **Public**: [1, 0, 0, 0, 0]

結果のビットマップ [1, 0, 0, 0, 0] は、最初のドキュメント（**ID** **1**）のみが両方の条件を満たすことを示しています。ビットマップインデックスと効率的なビット演算を使用することで、検索範囲をすばやく絞り込み、データセット全体をスキャンする必要がなくなります。

</NextChannel>

<NextChannel action="include">

{/* Preserve the published #Limits link and the filter link used by related pages. These anchors are not headings. */}

<a id="limits"></a>
<a id="Limits"></a>
<a id="queries-accelerated-by-bitmap"></a>
<a id="Queries-accelerated-by-BITMAP"></a>

### インデックスの対象とフィルター\{#index-targets-and-filters}

`BITMAP` インデックスを明示的に作成するには、次の表から主キー以外の対象を選択します。各行では、サポートされる対象と、インデックスが評価を支援できるフィルターを対応付けています。

| インデックスの対象 | インデックスを使用できるフィルター |
| --- | --- |
| `BOOL` フィールド | 等価（`==`、`!=`）およびメンバーシップ（`in`、`not in`）。 |
| 整数フィールド（`INT8`、`INT16`、`INT32`、`INT64`） | 等価、メンバーシップ、および範囲（`<`、`<=`、`>`、`>=`）。 |
| `VARCHAR` フィールド | 等価、メンバーシップ、範囲、および [LIKE または正規表現パターン](./pattern-match)。パターンの評価では、インデックス対象の異なる文字列を多数走査する可能性があります。 |
| `BOOL`、`INT8`、`INT16`、`INT32`、`INT64`、または `VARCHAR` の要素を持つ通常の `ARRAY` フィールド | `ARRAY_CONTAINS`、`ARRAY_CONTAINS_ANY`、`ARRAY_CONTAINS_ALL`。詳細については、[配列インデックスのサポート](./use-array-fields#Array-index-support) を参照してください。 |
| `BOOL` または `VARCHAR` にキャストされた JSON パス | 上記の対応するブール値または文字列値に対するフィルターです。ただし、[JSON インデックスの要件](./json-indexing#index-requirements) に従う必要があります。 |

<Admonition type="info" icon="📘" title="Notes">

> `AUTOINDEX` を含むスカラーインデックスは、再帰的な ARRAY フィールドや、NULL 許容の要素を持つ配列をサポートしていません。通常の ARRAY フィールドのフィルターについては [配列インデックスのサポート](./use-array-fields#Array-index-support) を、サブフィールドのルールについては [StructArray フィールドのインデックス](./index-struct-array#create-scalar-indexes) を参照してください。

</Admonition>

ARRAY を対象とする場合、`BITMAP` は要素の包含フィルターに対応しますが、配列全体の等価比較、位置指定による要素アクセス、配列の長さには対応しません。詳細については、[配列インデックスのサポート](./use-array-fields#Array-index-support) を参照してください。

これらの明示的な対象以外で自動選択を行う場合は、[AUTOINDEX の動作](./scalar-index-overview#autoindex-behavior) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

> これらはインデックスの機能であり、有効なフィルター式に対する制限ではありません。共通のルックアップ制約については、[スカラーインデックス](./scalar-index-overview#Filter-execution) を参照してください。`AND`、`OR`、`NOT`、および NULL テスト（`IS NULL`、`IS NOT NULL`）については、[基本演算子](./basic-filtering-operators) を参照してください。

</Admonition>

### メモリに関する考慮事項\{#memory-considerations}

メモリとクエリのコストは、異なる値の数とその分布に応じて変わります。固定のカーディナリティを普遍的なパフォーマンスのしきい値として扱うのではなく、代表的なフィルターを使用してインデックスを比較してください。

密なビットマップの場合、バイト単位の概算値は `(D + 1) * N / 8` です。ここで、`N` はエンティティ数、`D` は異なる値の数です。これには、異なる値ごとのビットマップと、有効性用のビットマップが 1 つずつ含まれます。値の保存やその他のオーバーヘッドは概算値に加算されます。オプションのオフセットキャッシュを使用すると、64 ビットシステムでは約 `8 * N` バイトが追加されます。圧縮されたビットマップ表現では、メモリ使用量が大幅に異なる場合があります。

これらの概算値は、メモリマッピングを無効にした状態でロードされたインデックスのメモリを対象としています。セグメントごとに計算し、ロード済みのセグメントとレプリカ全体で合計してください。

<Admonition type="info" icon="📘" title="Notes">

> ロードされたフィールドデータ、ベクトルインデックス、コレクションとインデックスのオーバーヘッド、および一時的な割り当てには、追加のメモリを見込んでください。代表的なデータとクエリで検証してください。配列、JSON、古いインデックス形式、およびメモリマッピングについては、個別に測定する必要があります。

</Admonition>

### BITMAP の仕組み\{#how-bitmap-works}

<details>
<summary><strong>ビットマップフィルタリングの例を表示する</strong></summary>

ビットマップインデックスは、フィールドの異なる値ごとにビットマップを関連付けます。各ビットは 1 つのエンティティに対応し、**1** はそのエンティティがその値を持つことを、**0** は持たないことを意味します。

たとえば、**Tech** カテゴリの公開ドキュメントを検索するには、**Category = Tech** と **Public = true** のビットマップを組み合わせます。

![ビットマップ](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/cb98c77741e110603c84b20f34c1273ba3b902680d68767bc8990d0fc27d8c3d.png)

図に示すように、**Category** と **Public** のビットマップインデックスは次のとおりです。

- **Tech**: [1, 0, 1, 0, 0]。これは、1 番目と 3 番目のドキュメントのみが **Tech** カテゴリに属していることを示しています。

- **Public**: [1, 0, 0, 1, 0]。これは、1 番目と 4 番目のドキュメントのみが **Public** に公開されていることを示しています。

両方の条件に一致するドキュメントを見つけるには、これら 2 つのビットマップに対してビット単位の AND 演算を実行します。

- **Tech** AND **Public**: [1, 0, 0, 0, 0]

両方の条件を満たすのは、最初のドキュメント（**ID 1**）のみです。

</details>

</NextChannel>

## ビットマップインデックスを作成する\{#create-a-bitmap-index}

Zilliz Cloud でビットマップインデックスを作成するには、`create_index()` メソッドを使用し、`index_type` パラメーターを `"BITMAP"` に設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
)

index_params = client.prepare_index_params() # Prepare an empty IndexParams object, without having to specify any index parameters
index_params.add_index(
    field_name="category", # Name of the scalar field to be indexed
    index_type="BITMAP", # Type of index to be created
    index_name="category_bitmap_index" # Name of the index to be created
)

client.create_index(
    collection_name="my_collection", # Specify the collection name
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

```cpp
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateIndex(milvus::CreateIndexRequest().WithCollectionName("my_collection")
        .AddIndex(milvus::IndexDesc("category", "category_bitmap_index", milvus::IndexType::BITMAP)));

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var config = new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT"
};
using var client = new MilvusClientV2(config);
await client.ConnectAsync();

// Prepare index building params
var indexParam = new IndexParam(
    fieldName: "category",
    indexType: IndexType.Bitmap,
    indexName: "category_bitmap_index");

await client.CreateIndexAsync(new CreateIndexReq
{
    CollectionName = "my_collection",
    Indexes = [indexParam]
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

<NextChannel action="exclude">

この例では、`my_collection` コレクションの `category` フィールドにビットマップインデックスを作成します。`add_index()` メソッドは、フィールド名、インデックスの種類、およびインデックス名を指定するために使用します。

ビットマップインデックスを作成すると、クエリ操作で `filter` パラメーターを使用して、インデックス対象のフィールドに基づくスカラーフィルタリングを実行できます。これにより、ビットマップインデックスを使用して検索結果を効率的に絞り込むことができます。詳細については、[フィルタリングの解説](./filtering-overview) を参照してください。

</NextChannel>

<NextChannel action="include">

これにより、`my_collection.category` にインデックスが作成されます。クエリまたは検索の `filter` でこのフィールドを使用します。詳細については、[フィルタリングの解説](./filtering-overview) を参照してください。

</NextChannel>

## インデックスを削除する\{#drop-an-index}

`drop_index()` メソッドを使用して、コレクションから既存のインデックスを削除します。

<NextChannel action="exclude">

<Admonition type="info" icon="📘" title="Notes">

**Milvus v2.6.x** と互換性のあるクラスターでは、不要になったスカラーインデックスを直接削除できます。コレクションを先に解放する必要はありません。

</Admonition>

</NextChannel>

<NextChannel action="include">

<Admonition type="info" icon="📘" title="Notes">

> スカラーインデックスを削除する際の解放要件については、[スカラーインデックス](./scalar-index-overview#Drop-index-compatibility) を参照してください。

</Admonition>

</NextChannel>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

```cpp
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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Index;

await client.DropIndexAsync(new DropIndexReq
{
    CollectionName = "my_collection", // Name of the collection
    IndexName = "category_bitmap_index" // Name of the index to drop
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

<NextChannel action="exclude">

## 制限事項\{#limits}

- ビットマップインデックスは、主キー以外のスカラーフィールドでのみサポートされています。

- フィールドのデータ型は、次のいずれかである必要があります。

    - `BOOL`, `INT8`, `INT16`, `INT32`, `INT64`, `VARCHAR`

    - `ARRAY`（要素は `BOOL`、`INT8`、`INT16`、`INT32`、`INT64`、`VARCHAR` のいずれかである必要があります）

- ビットマップインデックスは、次のデータ型をサポートしていません。

    - `FLOAT`、`DOUBLE`：浮動小数点型は、ビットマップインデックスのバイナリとしての性質と互換性がありません。

    - `JSON`：JSON データ型は構造が複雑なため、ビットマップインデックスを使用して効率的に表現できません。

- ビットマップインデックスは、カーディナリティの高いフィールド（つまり、異なる値の数が多いフィールド）には適していません。

    - 一般的な目安として、ビットマップインデックスは、フィールドのカーディナリティが 500 未満の場合に最も効果を発揮します。

    - カーディナリティがこのしきい値を超えて増加すると、ビットマップインデックスのパフォーマンス上のメリットは減少し、ストレージのオーバーヘッドが大きくなります。

    - カーディナリティの高いフィールドには、具体的なユースケースとクエリ要件に応じて、転置インデックスなどの代替のインデックス手法の使用を検討してください。

</NextChannel>
