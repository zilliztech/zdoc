---
title: "STL_SORT | BYOC"
slug: /slt-sort-index-type
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "STL_SORT インデックスは、データをソートされた順序で整理することで、数値フィールド（INT8、INT16 など）、VARCHAR フィールド、または TIMESTAMPTZ フィールドのクエリパフォーマンスを向上させるために特別に設計されたインデックスタイプです。 | BYOC"
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

`STL_SORT` インデックスは、データをソートされた順序で整理することで、Zilliz Cloud 内の数値フィールド（INT8、INT16 など）、`VARCHAR` フィールド、または `TIMESTAMPTZ` フィールドのクエリパフォーマンスを向上させるために特別に設計されたインデックスタイプです。

次のようなクエリを頻繁に実行する場合は、`STL_SORT` インデックスを使用してください。

- `==`、`!=`、`>`、`<`、`>=`、`<=` 演算子を使用した比較フィルタリング

-  `IN` および `LIKE` 演算子を使用した範囲フィルタリング

## サポートされるデータ型\{#supported-data-types}

</NextChannel>

<NextChannel action="include">

`STL_SORT` は、値をソート順で保存し、値の検索、範囲フィルター、文字列のプレフィックスマッチングを高速化します。

## 概要\{#overview}

<a id="supported-data-types"></a>

### サポートされるデータ型\{#supported-data-types-next}

</NextChannel>

- 数値フィールド（例: `INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、`DOUBLE`）。詳細については、[Boolean & Number](./use-number-field) を参照してください。

- `VARCHAR` フィールド。詳細については、[String Field](./use-string-field) を参照してください。

- `TIMESTAMPTZ` フィールド。詳細については、[TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。

<NextChannel action="exclude">

## 仕組み\{#how-it-works}

Zilliz Cloud は、`STL_SORT` を 2 つのフェーズで実装しています。

1. **インデックスの構築**

    - 取り込み中、Zilliz Cloud はインデックス対象フィールドのすべての値を収集します。

    - 値は、C++ STL の [std::sort](https://en.cppreference.com/w/cpp/algorithm/sort.html) を使用して昇順にソートされます。

    - 各値はエンティティ ID とペアにされ、ソートされた配列がインデックスとして永続化されます。

1. **クエリの高速化**

    - クエリ時、Zilliz Cloud はソートされた配列に対して **バイナリ検索**（[std::lower_bound](https://en.cppreference.com/w/cpp/algorithm/lower_bound.html) および [std::upper_bound](https://en.cppreference.com/w/cpp/algorithm/upper_bound.html)）を使用します。

    - 等価検索では、Zilliz Cloud は一致するすべての値をすばやく見つけます。

    - 範囲検索では、Zilliz Cloud は開始位置と終了位置を特定し、その間のすべての値を返します。

    - 一致したエンティティ ID は、最終的な結果の組み立てのためにクエリエグゼキューターに渡されます。

これにより、クエリの計算量が **O(n)**（全件スキャン）から **O(log n + m)** に削減されます。ここで、*m* は一致件数です。

</NextChannel>

<NextChannel action="include">

StructArray の数値、VARCHAR、または TIMESTAMPTZ サブフィールドについては、[インデックス StructArray Fields](./index-struct-array#create-scalar-indexes) を参照してください。通常の ARRAY フィールドは `STL_SORT` をサポートしていません。インデックスの選択肢については、[Array インデックス support](./use-array-fields#Array-index-support) を参照してください。

`DOUBLE` または `VARCHAR` にキャストされた JSON パスについては、`STL_SORT` を選択する前に [JSON インデックス requirements](./json-indexing#index-requirements) を確認してください。

<a id="queries-accelerated-by-stlsort"></a>
<a id="Queries-accelerated-by-STLSORT"></a>

<a id="supported-filters"></a>
<a id="Supported-filters"></a>

### フィルターの高速化\{#filter-acceleration}

`STL_SORT` インデックスは、フィールドとキャストの互換性に応じて、次の条件の評価に役立ちます。

- 等価（`==`、`!=`）およびメンバーシップ（`in`、`not in`）。
- 範囲: `<`、`<=`、`>`、`>=`。`10 <= price < 50` などの区間を含みます。
- VARCHAR のプレフィックスマッチング（例: `name LIKE "abc%"`）。
- 対象となる JSON スカラーパスでの比較。[JSON filters](./json-indexing#Supported-filters) を参照してください。

サフィックス、部分文字列、一般的な LIKE、および正規表現フィルターの場合、Zilliz Cloud はインデックスに保存された文字列に対してパターンを評価できます。これには、多数の異なる文字列を走査する必要がある場合があります。構文とプランニングの簡略化については、[Pattern Matching](./pattern-match) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

> これらはインデックスの機能であり、有効なフィルター式の制限ではありません。共通のルックアップ制約については、[スカラー インデックス](./scalar-index-overview#Filter-execution) を参照してください。`AND`、`OR`、`NOT`、および NULL テスト（`IS NULL`、`IS NOT NULL`）については、[Basic Operators](./basic-filtering-operators) を参照してください。

</Admonition>

<a id="usage-notes"></a>
<a id="Usage-notes"></a>

### メモリに関する考慮事項\{#memory-considerations}

明示的な `STL_SORT` インデックスは、メモリマップモードをサポートしていません。

NULL 値のない数値フィールドおよびタイムスタンプフィールドでは、次のバイト単位の概算を使用してください。`N` はエンティティ数です。

| フィールドタイプ | 概算 |
| --- | --- |
| `INT8`, `INT16`, `INT32`, `FLOAT` | `12 * N` |
| `INT64`, `DOUBLE`, `TIMESTAMPTZ` | `20 * N` |
| `VARCHAR` | 代表的なデータで測定してください。読み込まれるメモリは、文字列の保存方法、重複しない値の数、およびポスティングリストの容量によって異なります。 |

バイトを MiB に変換するには、`1024 * 1024` で除算します。NULL ではない INT64 値 100 万件では、メインのインデックス構造に約 19 MiB が必要です。VARCHAR インデックスは読み込み後に測定してください。シリアル化されたインデックスサイズには、メモリ内の文字列とポスティングリストの割り当てがすべて含まれるわけではありません。

これらの概算は、メモリマッピングを無効にした状態で読み込まれるインデックスメモリを対象としています。セグメントごとに計算し、読み込まれたセグメントとレプリカ全体で合計してください。

<Admonition type="info" icon="📘" title="Notes">

> 読み込まれたフィールドデータ、ベクトルインデックス、コレクションとインデックスのオーバーヘッド、および一時的な割り当てのために、追加のメモリを確保してください。代表的なデータとクエリを使用して検証してください。配列、JSON、古いインデックス形式、およびメモリマッピングについては、個別に測定する必要があります。

</Admonition>

<a id="how-it-works"></a>
<a id="How-it-works"></a>

### STL_SORT の仕組み\{#how-stlsort-works}

<details>
<summary><strong>ソートとルックアップのプロセスを表示</strong></summary>

インデックス構築中、Zilliz Cloud はフィールドの値をエンティティ ID とペアにし、[std::sort](https://en.cppreference.com/w/cpp/algorithm/sort.html) を使用して昇順にソートし、ソート済みの配列を永続化します。

等価クエリおよび範囲クエリでは、バイナリ検索（[std::lower_bound](https://en.cppreference.com/w/cpp/algorithm/lower_bound.html) および [std::upper_bound](https://en.cppreference.com/w/cpp/algorithm/upper_bound.html)）が一致する区間を特定します。クエリエグゼキューターは、その区間に含まれるエンティティ ID を受け取ります。

これにより、クエリの計算量が **O(n)**（全件スキャン）から **O(log n + m)** に削減されます。ここで、*m* は一致件数です。

</details>

</NextChannel>

## STL_SORT インデックスを作成する\{#create-an-stlsort-index}

<NextChannel action="exclude">

数値、`VARCHAR`、または `TIMESTAMPTZ` フィールドに `STL_SORT` インデックスを作成できます。追加のパラメーターは必要ありません。

以下の例では、`TIMESTAMPTZ` フィールドに `STL_SORT` インデックスを作成する方法を示します。

</NextChannel>

<NextChannel action="include">

`index_type` を `STL_SORT` に設定します。追加のインデックスパラメーターは必要ありません。この例では、`TIMESTAMPTZ` フィールドにインデックスを作成します。

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

## インデックスを削除する\{#drop-an-index}

コレクションから既存のインデックスを削除するには、`drop_index()` メソッドを使用します。

<NextChannel action="exclude">

<Admonition type="info" icon="📘" title="Notes">

**Milvus v2.6.x** 互換のクラスターでは、スカラーインデックスが不要になったら、コレクションを先にリリースすることなく、直接削除できます。

</Admonition>

</NextChannel>

<NextChannel action="include">

<Admonition type="info" icon="📘" title="Notes">

> スカラーインデックスを削除する際のリリース要件については、[スカラー Index](./scalar-index-overview#Drop-index-compatibility) を参照してください。

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

## 使用上の注意\{#usage-notes}

- **フィールドタイプ:** 数値、`VARCHAR`、および `TIMESTAMPTZ` フィールドで動作します。データ型の詳細については、[Boolean & Number](./use-number-field) および [TIMESTAMPTZ Field](./use-timestamptz-field) を参照してください。

- **パラメーター:** インデックスパラメーターは必要ありません。

- **Mmap 非対応:** `STL_SORT` ではメモリマップモードは使用できません。

</NextChannel>
